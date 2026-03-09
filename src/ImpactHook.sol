// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {BeforeSwapDelta} from "v4-core/src/types/BeforeSwapDelta.sol";

/// @title ImpactHook
/// @notice A Uniswap v4 hook that routes a portion of swap output to milestone-gated
/// impact projects. As projects hit verified milestones, the fee tier adjusts.
/// Single deployed hook serves multiple pools, each with its own project config.
contract ImpactHook is IHooks {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    // ──────────────────── Errors ────────────────────

    error NotPoolManager();
    error ProjectAlreadyRegistered();
    error ProjectNotRegistered();
    error NotVerifier();
    error MilestoneAlreadyVerified();
    error InvalidMilestoneIndex();
    error NoFeesToWithdraw();
    error FeeBpsTooHigh();
    error NoMilestones();
    error NotRecipient();

    // ──────────────────── Events ────────────────────

    event ProjectRegistered(PoolId indexed poolId, address recipient, address verifier, uint256 milestoneCount);
    event MilestoneVerified(PoolId indexed poolId, uint256 milestoneIndex, uint16 newFeeBps);
    event FeesAccumulated(PoolId indexed poolId, Currency indexed currency, uint256 amount);
    event FeesWithdrawn(PoolId indexed poolId, Currency indexed currency, address recipient, uint256 amount);

    // ──────────────────── Constants ────────────────────

    uint16 public constant MAX_FEE_BPS = 500; // 5% cap on project fees
    IPoolManager public immutable poolManager;

    // ──────────────────── Types ────────────────────

    struct Milestone {
        string description;
        uint16 projectFeeBps; // Fee bps routed to project when this milestone is the current active one
        bool verified;
    }

    struct Project {
        address recipient;
        address verifier;
        uint256 currentMilestone; // Index of current active milestone (0 = first)
        bool registered;
    }

    // ──────────────────── Storage ────────────────────

    // Project config per pool
    mapping(PoolId => Project) public projects;
    // Milestones stored separately (can't have dynamic arrays in mappings of structs easily)
    mapping(PoolId => Milestone[]) public milestones;
    // Accumulated fees per pool per currency
    mapping(PoolId => mapping(Currency => uint256)) public accumulatedFees;

    // ──────────────────── Modifiers ────────────────────

    modifier onlyPoolManager() {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        _;
    }

    // ──────────────────── Constructor ────────────────────

    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
        Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions());
    }

    // ──────────────────── Hook Permissions ────────────────────

    function getHookPermissions() public pure returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: true,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ──────────────────── Project Registration ────────────────────

    /// @notice Register a project for a pool. Must be called before pool initialization.
    /// @param key The pool key
    /// @param recipient Address that receives accumulated fees
    /// @param verifier Address authorized to verify milestones
    /// @param descriptions Milestone descriptions
    /// @param feeBpsValues Fee bps for each milestone
    function registerProject(
        PoolKey calldata key,
        address recipient,
        address verifier,
        string[] calldata descriptions,
        uint16[] calldata feeBpsValues
    ) external {
        if (descriptions.length == 0) revert NoMilestones();
        if (descriptions.length != feeBpsValues.length) revert NoMilestones();

        PoolId poolId = key.toId();
        if (projects[poolId].registered) revert ProjectAlreadyRegistered();

        // Validate fee caps
        for (uint256 i = 0; i < feeBpsValues.length; i++) {
            if (feeBpsValues[i] > MAX_FEE_BPS) revert FeeBpsTooHigh();
        }

        projects[poolId] = Project({
            recipient: recipient,
            verifier: verifier,
            currentMilestone: 0,
            registered: true
        });

        for (uint256 i = 0; i < descriptions.length; i++) {
            milestones[poolId].push(Milestone({
                description: descriptions[i],
                projectFeeBps: feeBpsValues[i],
                verified: false
            }));
        }

        emit ProjectRegistered(poolId, recipient, verifier, descriptions.length);
    }

    // ──────────────────── Hook Callbacks ────────────────────

    /// @notice Called before pool initialization. Validates that a project is registered.
    function beforeInitialize(address, PoolKey calldata key, uint160)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        PoolId poolId = key.toId();
        if (!projects[poolId].registered) revert ProjectNotRegistered();
        return this.beforeInitialize.selector;
    }

    /// @notice Called after each swap. Takes a fee from the swap output based on the
    /// current milestone's fee tier.
    function afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, int128) {
        PoolId poolId = key.toId();

        // Get current fee rate
        uint16 feeBps = _getCurrentFeeBps(poolId);
        if (feeBps == 0) {
            return (this.afterSwap.selector, 0);
        }

        // Determine output currency and amount
        // In v4 delta convention: positive = owed to caller (caller receives), negative = owed to pool (caller pays)
        // zeroForOne: amount0 < 0 (caller pays token0), amount1 > 0 (caller receives token1)
        // !zeroForOne: amount1 < 0 (caller pays token1), amount0 > 0 (caller receives token0)
        int128 outputAmount;
        Currency feeCurrency;

        if (params.zeroForOne) {
            outputAmount = delta.amount1(); // positive when swapper receives token1
            feeCurrency = key.currency1;
        } else {
            outputAmount = delta.amount0(); // positive when swapper receives token0
            feeCurrency = key.currency0;
        }

        // Only take fee if there's positive output
        if (outputAmount <= 0) {
            return (this.afterSwap.selector, 0);
        }

        // Calculate fee
        uint256 feeAmount = (uint256(uint128(outputAmount)) * feeBps) / 10_000;
        if (feeAmount == 0) {
            return (this.afterSwap.selector, 0);
        }

        // Take the fee from the pool manager into this contract
        poolManager.take(feeCurrency, address(this), feeAmount);

        // Track accumulated fees
        accumulatedFees[poolId][feeCurrency] += feeAmount;

        emit FeesAccumulated(poolId, feeCurrency, feeAmount);

        // Return the fee amount as hookDelta — this reduces the swapper's output
        return (this.afterSwap.selector, int128(int256(feeAmount)));
    }

    // ──────────────────── Milestone Verification ────────────────────

    /// @notice Verify a milestone. Only callable by the project's authorized verifier.
    /// Milestones must be verified in order.
    /// @param key The pool key
    /// @param milestoneIndex The index of the milestone to verify
    function verifyMilestone(PoolKey calldata key, uint256 milestoneIndex) external {
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];

        if (!project.registered) revert ProjectNotRegistered();
        if (msg.sender != project.verifier) revert NotVerifier();
        if (milestoneIndex != project.currentMilestone) revert InvalidMilestoneIndex();
        if (milestoneIndex >= milestones[poolId].length) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[poolId][milestoneIndex];
        if (milestone.verified) revert MilestoneAlreadyVerified();

        milestone.verified = true;

        // Advance to next milestone (if there is one)
        if (milestoneIndex + 1 < milestones[poolId].length) {
            project.currentMilestone = milestoneIndex + 1;
        }

        emit MilestoneVerified(poolId, milestoneIndex, milestone.projectFeeBps);
    }

    /// @notice Verify a milestone via Reactive Network callback.
    /// First param is the ReactVM ID (auto-injected by Reactive Network).
    /// @param rvmId The ReactVM ID (verified against the authorized verifier)
    /// @param poolId The pool ID
    /// @param milestoneIndex The milestone to verify
    function verifyMilestoneReactive(address rvmId, PoolId poolId, uint256 milestoneIndex) external {
        Project storage project = projects[poolId];

        if (!project.registered) revert ProjectNotRegistered();
        if (rvmId != project.verifier) revert NotVerifier();
        if (milestoneIndex != project.currentMilestone) revert InvalidMilestoneIndex();
        if (milestoneIndex >= milestones[poolId].length) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[poolId][milestoneIndex];
        if (milestone.verified) revert MilestoneAlreadyVerified();

        milestone.verified = true;

        if (milestoneIndex + 1 < milestones[poolId].length) {
            project.currentMilestone = milestoneIndex + 1;
        }

        emit MilestoneVerified(poolId, milestoneIndex, milestone.projectFeeBps);
    }

    // ──────────────────── Fee Withdrawal ────────────────────

    /// @notice Withdraw accumulated fees for a pool. Sends to the registered recipient.
    /// @param poolId The pool ID
    /// @param currency The currency to withdraw
    function withdraw(PoolId poolId, Currency currency) external {
        Project storage project = projects[poolId];
        if (!project.registered) revert ProjectNotRegistered();

        uint256 amount = accumulatedFees[poolId][currency];
        if (amount == 0) revert NoFeesToWithdraw();

        // Zero out before transfer (checks-effects-interactions)
        accumulatedFees[poolId][currency] = 0;

        // Transfer to recipient
        currency.transfer(project.recipient, amount);

        emit FeesWithdrawn(poolId, currency, project.recipient, amount);
    }

    // ──────────────────── View Functions ────────────────────

    /// @notice Check if a specific milestone is verified
    function isMilestoneVerified(PoolId poolId, uint256 milestoneIndex) external view returns (bool) {
        if (milestoneIndex >= milestones[poolId].length) return false;
        return milestones[poolId][milestoneIndex].verified;
    }

    /// @notice Get the current fee rate for a pool
    function getCurrentFeeBps(PoolId poolId) external view returns (uint16) {
        return _getCurrentFeeBps(poolId);
    }

    /// @notice Get milestone count for a pool
    function getMilestoneCount(PoolId poolId) external view returns (uint256) {
        return milestones[poolId].length;
    }

    /// @notice Get project info for frontend display
    function getProjectInfo(PoolId poolId)
        external
        view
        returns (
            address recipient,
            address verifier,
            uint256 currentMilestone,
            uint256 milestoneCount,
            uint16 currentFeeBps,
            bool registered
        )
    {
        Project storage project = projects[poolId];
        return (
            project.recipient,
            project.verifier,
            project.currentMilestone,
            milestones[poolId].length,
            _getCurrentFeeBps(poolId),
            project.registered
        );
    }

    /// @notice Update the recipient address. Only callable by current recipient.
    function updateRecipient(PoolKey calldata key, address newRecipient) external {
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];
        if (msg.sender != project.recipient) revert NotRecipient();
        project.recipient = newRecipient;
    }

    /// @notice Update the verifier address. Only callable by current verifier.
    function updateVerifier(PoolKey calldata key, address newVerifier) external {
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];
        if (msg.sender != project.verifier) revert NotVerifier();
        project.verifier = newVerifier;
    }

    // ──────────────────── Internal ────────────────────

    /// @dev Returns the fee bps for the current active milestone.
    /// If the current milestone is verified, its feeBps is active.
    /// If not yet verified, check if there's a previous verified milestone.
    /// If no milestones are verified, fee is 0.
    function _getCurrentFeeBps(PoolId poolId) internal view returns (uint16) {
        Project storage project = projects[poolId];
        if (!project.registered) return 0;

        Milestone[] storage ms = milestones[poolId];
        if (ms.length == 0) return 0;

        // Walk backwards from currentMilestone to find the latest verified milestone's fee
        uint256 current = project.currentMilestone;

        // If current milestone is verified, use its fee
        if (ms[current].verified) {
            return ms[current].projectFeeBps;
        }

        // Otherwise check the previous milestone (if it exists and is verified)
        if (current > 0 && ms[current - 1].verified) {
            return ms[current - 1].projectFeeBps;
        }

        // No verified milestones — no fee
        return 0;
    }

    // ──────────────────── Unused Hook Callbacks (required by IHooks) ────────────────────

    function afterInitialize(address, PoolKey calldata, uint160, int24)
        external
        pure
        override
        returns (bytes4)
    {
        revert();
    }

    function beforeAddLiquidity(address, PoolKey calldata, IPoolManager.ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert();
    }

    function afterAddLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure override returns (bytes4, BalanceDelta) {
        revert();
    }

    function beforeRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        revert();
    }

    function afterRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure override returns (bytes4, BalanceDelta) {
        revert();
    }

    function beforeSwap(address, PoolKey calldata, IPoolManager.SwapParams calldata, bytes calldata)
        external
        pure
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        revert();
    }

    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert();
    }

    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        revert();
    }
}
