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
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IEAS} from "./interfaces/IEAS.sol";

/// @title ImpactHook
/// @author ImpactHook Team
/// @notice A Uniswap v4 hook that routes a portion of swap output to milestone-gated
/// impact projects. As projects hit verified milestones, the fee tier adjusts.
/// Single deployed hook serves multiple pools, each with its own project config.
/// @custom:security-contact security@impacthook.xyz
contract ImpactHook is IHooks {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using SafeERC20 for IERC20;

    // ──────────────────── Errors ────────────────────

    error ImpactHook__NotPoolManager();
    error ImpactHook__ProjectAlreadyRegistered();
    error ImpactHook__ProjectNotRegistered();
    error ImpactHook__NotVerifier();
    error ImpactHook__MilestoneAlreadyVerified();
    error ImpactHook__InvalidMilestoneIndex();
    error ImpactHook__NoFeesToWithdraw();
    error ImpactHook__FeeBpsTooHigh();
    error ImpactHook__NoMilestones();
    error ImpactHook__NotRecipient();
    error ImpactHook__NotCallbackProxy();
    error ImpactHook__NotOwner();
    error ImpactHook__Paused();
    error ImpactHook__FeeAmountOverflow();
    error ImpactHook__NotProjectRecipient();
    error ImpactHook__ZeroAddress();
    error ImpactHook__OwnershipTransferPending();
    error ImpactHook__NoTransferPending();
    error ImpactHook__InvalidSchema();
    error ImpactHook__AttestationRevoked();
    error ImpactHook__PoolIdMismatch();
    error ImpactHook__ZeroDonation();
    error ImpactHook__DonationTransferFailed();

    // ──────────────────── Events ────────────────────

    /// @notice Emitted when a new impact project is registered for a pool
    event ProjectRegistered(PoolId indexed poolId, address recipient, address verifier, uint256 milestoneCount);
    /// @notice Emitted when a milestone is verified and the fee tier updates
    event MilestoneVerified(PoolId indexed poolId, uint256 milestoneIndex, uint16 newFeeBps);
    /// @notice Emitted when swap fees are accumulated for a project
    event FeesAccumulated(PoolId indexed poolId, Currency indexed currency, uint256 amount);
    /// @notice Emitted when a project recipient withdraws accumulated fees
    event FeesWithdrawn(PoolId indexed poolId, Currency indexed currency, address recipient, uint256 amount);
    /// @notice Emitted when the Reactive Network callback proxy is updated
    event CallbackProxyUpdated(address indexed oldProxy, address indexed newProxy);
    /// @notice Emitted when ownership transfer is initiated
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    /// @notice Emitted when ownership transfer is completed
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /// @notice Emitted when the hook is paused or unpaused
    event PausedStateChanged(bool paused);
    /// @notice Emitted when someone donates directly to a project
    event Donated(PoolId indexed poolId, Currency indexed currency, address indexed donor, uint256 amount);

    // ──────────────────── Constants ────────────────────

    uint16 public constant MAX_FEE_BPS = 500; // 5% cap on project fees
    IPoolManager public immutable POOL_MANAGER;
    IEAS public immutable EAS;

    // ──────────────────── Types ────────────────────

    struct Milestone {
        string description;
        uint16 projectFeeBps; // Fee bps routed to project when this milestone is the current active one
        bool verified;
    }

    struct Project {
        address recipient;      // slot 0: 20 bytes
        bool registered;        // slot 0: 1 byte (packed with recipient)
        address verifier;       // slot 1: 20 bytes
        uint96 currentMilestone; // slot 1: 12 bytes (packed with verifier, max 2^96 milestones)
    }

    // ──────────────────── Storage ────────────────────

    /// @notice Contract owner (deployer initially, transferable via 2-step)
    address public owner;
    /// @notice Pending owner for 2-step ownership transfer
    address public pendingOwner;
    /// @notice Reactive Network Callback Proxy for this chain
    address public callbackProxy;
    /// @notice Whether fee collection is paused
    bool public paused;
    /// @notice EAS schema UID for milestone attestations
    bytes32 public milestoneSchemaUID;
    /// @notice Reentrancy lock
    bool private _locked;

    // Project config per pool
    mapping(PoolId => Project) public projects;
    // Milestones stored separately (can't have dynamic arrays in mappings of structs easily)
    mapping(PoolId => Milestone[]) public milestones;
    // Accumulated fees per pool per currency
    mapping(PoolId => mapping(Currency => uint256)) public accumulatedFees;

    // ──────────────────── Modifiers ────────────────────

    modifier onlyPoolManager() {
        if (msg.sender != address(POOL_MANAGER)) revert ImpactHook__NotPoolManager();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert ImpactHook__NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (_locked) revert ImpactHook__Paused();
        _locked = true;
        _;
        _locked = false;
    }

    // ──────────────────── Constructor ────────────────────

    /// @param _poolManager The Uniswap v4 PoolManager
    /// @param _owner The initial contract owner (use deployer EOA for CREATE2 deployments)
    /// @param _eas The EAS contract address on this chain
    constructor(IPoolManager _poolManager, address _owner, address _eas) {
        if (_owner == address(0)) revert ImpactHook__ZeroAddress();
        if (_eas == address(0)) revert ImpactHook__ZeroAddress();
        POOL_MANAGER = _poolManager;
        owner = _owner;
        EAS = IEAS(_eas);
        emit OwnershipTransferred(address(0), _owner);
        Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions());
    }

    // ──────────────────── Hook Permissions ────────────────────

    /// @notice Returns the hook permission flags
    /// @return Permissions struct with beforeInitialize, afterSwap, and afterSwapReturnDelta enabled
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

    /// @notice Register a project for a pool. Only callable by the hook owner.
    /// Must be called before pool initialization.
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
    ) external onlyOwner {
        if (recipient == address(0)) revert ImpactHook__ZeroAddress();
        if (verifier == address(0)) revert ImpactHook__ZeroAddress();
        if (descriptions.length == 0) revert ImpactHook__NoMilestones();
        if (descriptions.length != feeBpsValues.length) revert ImpactHook__NoMilestones();

        PoolId poolId = key.toId();
        if (projects[poolId].registered) revert ImpactHook__ProjectAlreadyRegistered();

        // Validate fee caps
        for (uint256 i = 0; i < feeBpsValues.length; ++i) {
            if (feeBpsValues[i] > MAX_FEE_BPS) revert ImpactHook__FeeBpsTooHigh();
        }

        projects[poolId] = Project({
            recipient: recipient,
            registered: true,
            verifier: verifier,
            currentMilestone: 0
        });

        for (uint256 i = 0; i < descriptions.length; ++i) {
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
        if (!projects[poolId].registered) revert ImpactHook__ProjectNotRegistered();
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
        // If paused, skip fee collection
        if (paused) {
            return (this.afterSwap.selector, 0);
        }

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

        // Bounds check: feeAmount must fit in int128 for the return delta
        if (feeAmount > uint128(type(int128).max)) revert ImpactHook__FeeAmountOverflow();

        // Take the fee from the pool manager into this contract
        POOL_MANAGER.take(feeCurrency, address(this), feeAmount);

        // Track accumulated fees
        accumulatedFees[poolId][feeCurrency] += feeAmount;

        emit FeesAccumulated(poolId, feeCurrency, feeAmount);

        // Return the fee amount as hookDelta - this reduces the swapper's output
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

        if (!project.registered) revert ImpactHook__ProjectNotRegistered();
        if (msg.sender != project.verifier) revert ImpactHook__NotVerifier();
        if (milestoneIndex != project.currentMilestone) revert ImpactHook__InvalidMilestoneIndex();
        if (milestoneIndex >= milestones[poolId].length) revert ImpactHook__InvalidMilestoneIndex();

        Milestone storage milestone = milestones[poolId][milestoneIndex];
        if (milestone.verified) revert ImpactHook__MilestoneAlreadyVerified();

        milestone.verified = true;

        // Advance to next milestone (if there is one)
        if (milestoneIndex + 1 < milestones[poolId].length) {
            project.currentMilestone = uint96(milestoneIndex + 1);
        }

        emit MilestoneVerified(poolId, milestoneIndex, milestone.projectFeeBps);
    }

    /// @notice Verify a milestone via Reactive Network callback.
    /// First param is the ReactVM ID (auto-injected by Reactive Network).
    /// Only callable by the chain's Callback Proxy contract.
    /// @param rvmId The ReactVM ID (verified against the authorized verifier)
    /// @param poolId The pool ID
    /// @param milestoneIndex The milestone to verify
    function verifyMilestoneReactive(address rvmId, PoolId poolId, uint256 milestoneIndex) external {
        if (msg.sender != callbackProxy) revert ImpactHook__NotCallbackProxy();

        Project storage project = projects[poolId];

        if (!project.registered) revert ImpactHook__ProjectNotRegistered();
        if (rvmId != project.verifier) revert ImpactHook__NotVerifier();
        if (milestoneIndex != project.currentMilestone) revert ImpactHook__InvalidMilestoneIndex();
        if (milestoneIndex >= milestones[poolId].length) revert ImpactHook__InvalidMilestoneIndex();

        Milestone storage milestone = milestones[poolId][milestoneIndex];
        if (milestone.verified) revert ImpactHook__MilestoneAlreadyVerified();

        milestone.verified = true;

        if (milestoneIndex + 1 < milestones[poolId].length) {
            project.currentMilestone = uint96(milestoneIndex + 1);
        }

        emit MilestoneVerified(poolId, milestoneIndex, milestone.projectFeeBps);
    }

    /// @notice Verify a milestone via an EAS attestation. Permissionless - anyone can call
    /// this as long as a valid attestation exists from the pool's authorized verifier.
    /// @param key The pool key
    /// @param attestationUID The EAS attestation UID to verify against
    function verifyMilestoneEAS(PoolKey calldata key, bytes32 attestationUID) external {
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];

        if (!project.registered) revert ImpactHook__ProjectNotRegistered();

        // Read attestation from EAS
        IEAS.Attestation memory att = EAS.getAttestation(attestationUID);

        // Validate attestation
        if (att.schema != milestoneSchemaUID) revert ImpactHook__InvalidSchema();
        if (att.attester != project.verifier) revert ImpactHook__NotVerifier();
        if (att.revocationTime != 0) revert ImpactHook__AttestationRevoked();

        // Decode attestation data: (bytes32 poolId, uint256 milestoneIndex, string evidence)
        (bytes32 attestedPoolId, uint256 milestoneIndex,) =
            abi.decode(att.data, (bytes32, uint256, string));

        // Validate pool and milestone match
        if (attestedPoolId != PoolId.unwrap(poolId)) revert ImpactHook__PoolIdMismatch();
        if (milestoneIndex != project.currentMilestone) revert ImpactHook__InvalidMilestoneIndex();
        if (milestoneIndex >= milestones[poolId].length) revert ImpactHook__InvalidMilestoneIndex();

        Milestone storage milestone = milestones[poolId][milestoneIndex];
        if (milestone.verified) revert ImpactHook__MilestoneAlreadyVerified();

        milestone.verified = true;

        if (milestoneIndex + 1 < milestones[poolId].length) {
            project.currentMilestone = uint96(milestoneIndex + 1);
        }

        emit MilestoneVerified(poolId, milestoneIndex, milestone.projectFeeBps);
    }

    // ──────────────────── Fee Withdrawal ────────────────────

    /// @notice Withdraw accumulated fees for a pool. Only callable by the project recipient.
    /// @param poolId The pool ID
    /// @param currency The currency to withdraw
    function withdraw(PoolId poolId, Currency currency) external nonReentrant {
        Project storage project = projects[poolId];
        if (!project.registered) revert ImpactHook__ProjectNotRegistered();
        if (msg.sender != project.recipient) revert ImpactHook__NotProjectRecipient();

        uint256 amount = accumulatedFees[poolId][currency];
        if (amount == 0) revert ImpactHook__NoFeesToWithdraw();

        // Zero out before transfer (checks-effects-interactions)
        accumulatedFees[poolId][currency] = 0;

        // Transfer to recipient
        currency.transfer(project.recipient, amount);

        emit FeesWithdrawn(poolId, currency, project.recipient, amount);
    }

    // ──────────────────── Direct Donations ────────────────────

    /// @notice Donate directly to a project's accumulated fees. Same milestone-gated
    /// withdrawal rules apply. For ERC20: approve this contract first, then call with amount.
    /// For native ETH: send ETH with the call (currency = address(0)).
    /// @param poolId The pool ID to donate to
    /// @param currency The currency to donate (use address(0) for native ETH)
    /// @param amount The amount to donate (ignored for native ETH, uses msg.value instead)
    function donate(PoolId poolId, Currency currency, uint256 amount) external payable nonReentrant {
        Project storage project = projects[poolId];
        if (!project.registered) revert ImpactHook__ProjectNotRegistered();

        uint256 donationAmount;

        if (currency.isAddressZero()) {
            // Native ETH donation
            donationAmount = msg.value;
        } else {
            // ERC20 donation - pull tokens from sender
            // Use balance check to handle fee-on-transfer tokens correctly
            IERC20 token = IERC20(Currency.unwrap(currency));
            uint256 balBefore = token.balanceOf(address(this));
            token.safeTransferFrom(msg.sender, address(this), amount);
            donationAmount = token.balanceOf(address(this)) - balBefore;
        }

        if (donationAmount == 0) revert ImpactHook__ZeroDonation();

        accumulatedFees[poolId][currency] += donationAmount;

        emit Donated(poolId, currency, msg.sender, donationAmount);
        emit FeesAccumulated(poolId, currency, donationAmount);
    }

    // ──────────────────── Admin Functions ────────────────────

    /// @notice Set the Reactive Network Callback Proxy address. Only callable by owner.
    /// @param _callbackProxy The new callback proxy address
    function setCallbackProxy(address _callbackProxy) external onlyOwner {
        emit CallbackProxyUpdated(callbackProxy, _callbackProxy);
        callbackProxy = _callbackProxy;
    }

    /// @notice Set the EAS milestone schema UID. Only callable by owner.
    /// @param _schemaUID The EAS schema UID for milestone attestations
    function setMilestoneSchema(bytes32 _schemaUID) external onlyOwner {
        milestoneSchemaUID = _schemaUID;
    }

    /// @notice Pause or unpause fee collection. Only callable by owner.
    /// When paused, afterSwap returns 0 fee. Existing accumulated fees can still be withdrawn.
    /// @param _paused Whether to pause
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedStateChanged(_paused);
    }

    /// @notice Initiate ownership transfer (2-step). Only callable by current owner.
    /// @param newOwner The address to transfer ownership to
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ImpactHook__ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Accept ownership transfer. Only callable by the pending owner.
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert ImpactHook__NoTransferPending();
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }

    // ──────────────────── View Functions ────────────────────

    /// @notice Check if a specific milestone is verified
    /// @param poolId The pool ID
    /// @param milestoneIndex The milestone index to check
    /// @return Whether the milestone is verified
    function isMilestoneVerified(PoolId poolId, uint256 milestoneIndex) external view returns (bool) {
        if (milestoneIndex >= milestones[poolId].length) return false;
        return milestones[poolId][milestoneIndex].verified;
    }

    /// @notice Get the current fee rate for a pool
    /// @param poolId The pool ID
    /// @return The current fee in basis points
    function getCurrentFeeBps(PoolId poolId) external view returns (uint16) {
        return _getCurrentFeeBps(poolId);
    }

    /// @notice Get milestone count for a pool
    /// @param poolId The pool ID
    /// @return The number of milestones
    function getMilestoneCount(PoolId poolId) external view returns (uint256) {
        return milestones[poolId].length;
    }

    /// @notice Get project info for frontend display
    /// @param poolId The pool ID
    /// @return recipient The project recipient address
    /// @return verifier The milestone verifier address
    /// @return currentMilestone The current milestone index
    /// @return milestoneCount Total number of milestones
    /// @return currentFeeBps Current fee rate in basis points
    /// @return registered Whether a project is registered for this pool
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
    /// @param key The pool key
    /// @param newRecipient The new recipient address
    function updateRecipient(PoolKey calldata key, address newRecipient) external {
        if (newRecipient == address(0)) revert ImpactHook__ZeroAddress();
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];
        if (msg.sender != project.recipient) revert ImpactHook__NotRecipient();
        project.recipient = newRecipient;
    }

    /// @notice Update the verifier address. Only callable by current verifier.
    /// @param key The pool key
    /// @param newVerifier The new verifier address
    function updateVerifier(PoolKey calldata key, address newVerifier) external {
        if (newVerifier == address(0)) revert ImpactHook__ZeroAddress();
        PoolId poolId = key.toId();
        Project storage project = projects[poolId];
        if (msg.sender != project.verifier) revert ImpactHook__NotVerifier();
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

        // No verified milestones - no fee
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
