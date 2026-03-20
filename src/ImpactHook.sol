// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta, toBalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
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
    error ImpactHook__UnexpectedETH();
    error ImpactHook__AttestationExpired();
    error ImpactHook__Reentrancy();
    error ImpactHook__TemplateAlreadyExists();
    error ImpactHook__TemplateNotFound();
    error ImpactHook__InvalidDiscountBps();
    error ImpactHook__LpSkimBpsTooHigh();

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
    /// @notice Emitted when a project template is created
    event TemplateCreated(uint256 indexed templateId, string name, uint256 milestoneCount);
    /// @notice Emitted when loyalty discount tiers are configured for a pool
    event LoyaltyDiscountSet(PoolId indexed poolId, uint256[] thresholds, uint16[] discountBps);
    /// @notice Emitted when LP fees are skimmed for an impact project
    event LpFeesSkimmed(PoolId indexed poolId, Currency indexed currency, uint256 amount);
    /// @notice Emitted when the LP skim rate is set for a project
    event LpSkimBpsSet(PoolId indexed poolId, uint16 lpSkimBps);
    /// @notice Emitted when a project is paused or unpaused
    event ProjectPausedStateChanged(PoolId indexed poolId, bool paused);
    /// @notice Emitted when a project sends a heartbeat (proof of life)
    event Heartbeat(PoolId indexed poolId, uint256 timestamp);
    /// @notice Emitted when a project's heartbeat interval is updated
    event HeartbeatIntervalSet(PoolId indexed poolId, uint256 interval);
    /// @notice Emitted when native v4 LP donations are skimmed for a project
    event DonateSkimmed(PoolId indexed poolId, Currency indexed currency, uint256 amount);
    /// @notice Emitted when the donate skim rate is set
    event DonateSkimBpsSet(PoolId indexed poolId, uint16 donateSkimBps);

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
        uint256 lastHeartbeat;  // slot 2: timestamp of last proof-of-life
        uint256 heartbeatInterval; // slot 3: max time between heartbeats (0 = no expiration)
        string name;            // project display name
        string category;        // e.g. "Climate", "Education", "Health", "Open Source"
        string imageUrl;        // project image/logo URL
    }

    struct ProjectTemplate {
        string name;
        string[] descriptions;
        uint16[] feeBpsValues;
        uint16 lpSkimBps;           // default LP skim rate for this project type
        uint16 donateSkimBps;       // default donate skim rate
        uint256 heartbeatInterval;  // default heartbeat (e.g. 30 days for climate, 7 days for emergency)
        bool swapFeeEnabled;        // false = LP-skim-only (maximally router-competitive)
    }

    struct LoyaltyTier {
        uint256 threshold;  // cumulative contribution threshold
        uint16 discountBps; // discount applied to the project fee (max 5000 = 50%)
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
    // Cumulative impact contributions per address per pool
    mapping(address => mapping(PoolId => uint256)) public contributions;
    // Global cumulative contributions per address (across all pools)
    mapping(address => uint256) public globalContributions;
    // Project templates
    mapping(uint256 => ProjectTemplate) internal _templates;
    uint256 public templateCount;
    // Loyalty discount tiers per pool
    mapping(PoolId => LoyaltyTier[]) public loyaltyTiers;
    // LP fee skim percentage per pool (bps of LP fees routed to project, max 5000 = 50%)
    mapping(PoolId => uint16) public lpSkimBps;
    // Per-project pause (stops fee collection for a single project without affecting others)
    mapping(PoolId => bool) public projectPaused;
    // Registry of all registered pool IDs (for frontend discovery)
    PoolId[] public registeredPools;
    // Percentage of native v4 LP donations to route to impact project (bps, max 5000)
    mapping(PoolId => uint16) public donateSkimBps;

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
        if (_locked) revert ImpactHook__Reentrancy();
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
    /// @return Permissions struct with lifecycle hooks enabled
    function getHookPermissions() public pure returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: true,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: true,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: true,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: true,
            afterAddLiquidityReturnDelta: true,
            afterRemoveLiquidityReturnDelta: true
        });
    }

    // ──────────────────── Project Registration ────────────────────

    /// @notice Register a project for a pool. Only callable by the hook owner.
    /// Must be called before pool initialization.
    /// @param key The pool key
    /// @param recipient Address that receives accumulated fees
    /// @param verifier Address authorized to verify milestones
    /// @param name Project display name
    /// @param category Project category (e.g. "Climate", "Education")
    /// @param descriptions Milestone descriptions
    /// @param feeBpsValues Fee bps for each milestone
    function registerProject(
        PoolKey calldata key,
        address recipient,
        address verifier,
        string calldata name,
        string calldata category,
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

        Project storage project = projects[poolId];
        project.recipient = recipient;
        project.registered = true;
        project.verifier = verifier;
        project.currentMilestone = 0;
        project.lastHeartbeat = block.timestamp;
        project.heartbeatInterval = 0;
        project.name = name;
        project.category = category;

        for (uint256 i = 0; i < descriptions.length; ++i) {
            milestones[poolId].push(Milestone({
                description: descriptions[i],
                projectFeeBps: feeBpsValues[i],
                verified: false
            }));
        }

        registeredPools.push(poolId);
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
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, int128) {
        // If globally paused, skip fee collection
        if (paused) {
            return (this.afterSwap.selector, 0);
        }

        PoolId poolId = key.toId();

        // If this project is paused or heartbeat expired, skip fee collection
        if (projectPaused[poolId] || _isHeartbeatExpired(poolId)) {
            return (this.afterSwap.selector, 0);
        }

        // Get current fee rate
        uint16 feeBps = _getCurrentFeeBps(poolId);
        if (feeBps == 0) {
            return (this.afterSwap.selector, 0);
        }

        // Apply loyalty discount if configured
        // Note: `sender` is the swap router address in standard v4 flows, not the EOA.
        // Loyalty tracking is per-router until hookData-based user identification is added.
        feeBps = _applyLoyaltyDiscount(poolId, sender, feeBps);
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

        // Effects first (checks-effects-interactions)
        accumulatedFees[poolId][feeCurrency] += feeAmount;
        contributions[sender][poolId] += feeAmount;
        globalContributions[sender] += feeAmount;

        // Interaction: take the fee from the pool manager
        POOL_MANAGER.take(feeCurrency, address(this), feeAmount);

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

        project.lastHeartbeat = block.timestamp; // milestone verification refreshes heartbeat
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

        project.lastHeartbeat = block.timestamp; // milestone verification refreshes heartbeat
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
        if (att.expirationTime != 0 && block.timestamp > att.expirationTime) revert ImpactHook__AttestationExpired();

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

        project.lastHeartbeat = block.timestamp; // milestone verification refreshes heartbeat
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
            // ERC20 donation - reject ETH sent alongside
            if (msg.value != 0) revert ImpactHook__UnexpectedETH();
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

    // ──────────────────── Project Templates ────────────────────

    /// @notice Create a reusable project template with pool behavior parameters.
    /// Templates customize both milestone structure AND pool behavior per asset/project type.
    /// @param name Template name (e.g., "Climate", "Emergency Relief", "Open Source")
    /// @param descriptions Milestone descriptions for the template
    /// @param feeBpsValues Fee bps for each milestone in the template
    /// @param _lpSkimBps Default LP skim rate (0 = no LP skim)
    /// @param _donateSkimBps Default donate skim rate (0 = no donate skim)
    /// @param _heartbeatInterval Default heartbeat interval in seconds (0 = no expiry)
    /// @param _swapFeeEnabled Whether swap fees are active (false = LP-skim-only, maximally router-competitive)
    /// @return templateId The ID of the created template
    function createTemplate(
        string calldata name,
        string[] calldata descriptions,
        uint16[] calldata feeBpsValues,
        uint16 _lpSkimBps,
        uint16 _donateSkimBps,
        uint256 _heartbeatInterval,
        bool _swapFeeEnabled
    ) external onlyOwner returns (uint256 templateId) {
        if (descriptions.length == 0) revert ImpactHook__NoMilestones();
        if (descriptions.length != feeBpsValues.length) revert ImpactHook__NoMilestones();
        if (_lpSkimBps > 5000) revert ImpactHook__LpSkimBpsTooHigh();
        if (_donateSkimBps > 5000) revert ImpactHook__LpSkimBpsTooHigh();

        for (uint256 i = 0; i < feeBpsValues.length; ++i) {
            if (feeBpsValues[i] > MAX_FEE_BPS) revert ImpactHook__FeeBpsTooHigh();
        }

        templateId = templateCount++;
        ProjectTemplate storage t = _templates[templateId];
        t.name = name;
        t.lpSkimBps = _lpSkimBps;
        t.donateSkimBps = _donateSkimBps;
        t.heartbeatInterval = _heartbeatInterval;
        t.swapFeeEnabled = _swapFeeEnabled;
        for (uint256 i = 0; i < descriptions.length; ++i) {
            t.descriptions.push(descriptions[i]);
            t.feeBpsValues.push(feeBpsValues[i]);
        }

        emit TemplateCreated(templateId, name, descriptions.length);
    }

    /// @notice Register a project using a predefined template. Only callable by owner.
    /// @param key The pool key
    /// @param recipient Address that receives accumulated fees
    /// @param verifier Address authorized to verify milestones
    /// @param name Project display name
    /// @param category Project category
    /// @param templateId The template to use
    function registerProjectFromTemplate(
        PoolKey calldata key,
        address recipient,
        address verifier,
        string calldata name,
        string calldata category,
        uint256 templateId
    ) external onlyOwner {
        if (recipient == address(0)) revert ImpactHook__ZeroAddress();
        if (verifier == address(0)) revert ImpactHook__ZeroAddress();
        if (templateId >= templateCount) revert ImpactHook__TemplateNotFound();

        PoolId poolId = key.toId();
        if (projects[poolId].registered) revert ImpactHook__ProjectAlreadyRegistered();

        ProjectTemplate storage t = _templates[templateId];

        Project storage project = projects[poolId];
        project.recipient = recipient;
        project.registered = true;
        project.verifier = verifier;
        project.currentMilestone = 0;
        project.lastHeartbeat = block.timestamp;
        project.heartbeatInterval = t.heartbeatInterval;
        project.name = name;
        project.category = category;

        // Apply template pool behavior
        lpSkimBps[poolId] = t.lpSkimBps;
        donateSkimBps[poolId] = t.donateSkimBps;
        // If swap fee disabled, set all milestone fees to 0 (LP-skim-only mode)

        for (uint256 i = 0; i < t.descriptions.length; ++i) {
            milestones[poolId].push(Milestone({
                description: t.descriptions[i],
                projectFeeBps: t.swapFeeEnabled ? t.feeBpsValues[i] : 0,
                verified: false
            }));
        }

        registeredPools.push(poolId);
        emit ProjectRegistered(poolId, recipient, verifier, t.descriptions.length);
    }

    // ──────────────────── Loyalty Discounts ────────────────────

    /// @notice Set loyalty discount tiers for a pool. Only callable by owner.
    /// Swappers who have contributed above certain thresholds get reduced fees.
    /// @param poolId The pool ID
    /// @param thresholds Cumulative contribution thresholds (must be ascending)
    /// @param discountBps Discount in basis points for each tier (max 5000 = 50% off)
    function setLoyaltyTiers(
        PoolId poolId,
        uint256[] calldata thresholds,
        uint16[] calldata discountBps
    ) external onlyOwner {
        if (thresholds.length != discountBps.length) revert ImpactHook__NoMilestones();

        // Clear existing tiers
        delete loyaltyTiers[poolId];

        for (uint256 i = 0; i < thresholds.length; ++i) {
            if (discountBps[i] > 5000) revert ImpactHook__InvalidDiscountBps();
            if (i > 0 && thresholds[i] <= thresholds[i - 1]) revert ImpactHook__InvalidDiscountBps();
            loyaltyTiers[poolId].push(LoyaltyTier({
                threshold: thresholds[i],
                discountBps: discountBps[i]
            }));
        }

        emit LoyaltyDiscountSet(poolId, thresholds, discountBps);
    }

    // ──────────────────── Heartbeat (Proof of Life) ────────────────────

    /// @notice Send a heartbeat to prove the project is still active.
    /// Callable by the project recipient or verifier. Resets the expiration timer.
    /// @param poolId The pool ID
    function heartbeat(PoolId poolId) external {
        Project storage project = projects[poolId];
        if (!project.registered) revert ImpactHook__ProjectNotRegistered();
        if (msg.sender != project.recipient && msg.sender != project.verifier) revert ImpactHook__NotVerifier();

        project.lastHeartbeat = block.timestamp;
        emit Heartbeat(poolId, block.timestamp);
    }

    /// @notice Set the heartbeat interval for a project. Only callable by owner.
    /// If a project doesn't send a heartbeat within this interval, fees stop automatically.
    /// Set to 0 to disable expiration.
    /// @param poolId The pool ID
    /// @param interval The heartbeat interval in seconds (e.g., 30 days = 2592000)
    function setHeartbeatInterval(PoolId poolId, uint256 interval) external onlyOwner {
        projects[poolId].heartbeatInterval = interval;
        emit HeartbeatIntervalSet(poolId, interval);
    }

    // ──────────────────── LP Fee Skim ────────────────────

    /// @notice Set the LP fee skim rate for a pool. A percentage of LP fees collected
    /// will be routed to the impact project. Swappers are unaffected - pricing is identical
    /// to pools without the hook. LPs earn slightly less but the pool stays competitive for routing.
    /// @param poolId The pool ID
    /// @param _lpSkimBps Percentage of LP fees to skim (in bps, max 5000 = 50%)
    function setLpSkimBps(PoolId poolId, uint16 _lpSkimBps) external onlyOwner {
        if (_lpSkimBps > 5000) revert ImpactHook__LpSkimBpsTooHigh();
        lpSkimBps[poolId] = _lpSkimBps;
        emit LpSkimBpsSet(poolId, _lpSkimBps);
    }

    // ──────────────────── Native v4 Donate Skim ────────────────────

    /// @notice Set the skim rate for native v4 PoolManager.donate() calls.
    /// When someone donates to LPs via the v4 donate function, a percentage
    /// is routed to the impact project.
    /// @param poolId The pool ID
    /// @param _donateSkimBps Percentage of donations to skim (bps, max 5000)
    function setDonateSkimBps(PoolId poolId, uint16 _donateSkimBps) external onlyOwner {
        if (_donateSkimBps > 5000) revert ImpactHook__LpSkimBpsTooHigh();
        donateSkimBps[poolId] = _donateSkimBps;
        emit DonateSkimBpsSet(poolId, _donateSkimBps);
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

    /// @notice Pause or unpause fee collection globally. Only callable by owner.
    /// When paused, afterSwap returns 0 fee. Existing accumulated fees can still be withdrawn.
    /// @param _paused Whether to pause
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedStateChanged(_paused);
    }

    /// @notice Pause or unpause fee collection for a single project. Only callable by owner.
    /// Allows stopping a compromised or abandoned project without affecting others.
    /// @param poolId The pool ID
    /// @param _paused Whether to pause this project
    function setProjectPaused(PoolId poolId, bool _paused) external onlyOwner {
        projectPaused[poolId] = _paused;
        emit ProjectPausedStateChanged(poolId, _paused);
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

    /// @notice Get the total number of registered projects
    function getRegisteredPoolCount() external view returns (uint256) {
        return registeredPools.length;
    }

    /// @notice Get a registered pool ID by index
    function getRegisteredPool(uint256 index) external view returns (PoolId) {
        return registeredPools[index];
    }

    /// @notice Get project metadata
    /// @param poolId The pool ID
    /// @return name Project name
    /// @return category Project category
    /// @return imageUrl Project image URL
    function getProjectMetadata(PoolId poolId)
        external
        view
        returns (string memory name, string memory category, string memory imageUrl)
    {
        Project storage project = projects[poolId];
        return (project.name, project.category, project.imageUrl);
    }

    /// @notice Update project metadata. Only callable by the project recipient.
    function updateProjectMetadata(
        PoolId poolId,
        string calldata name,
        string calldata category,
        string calldata imageUrl
    ) external {
        Project storage project = projects[poolId];
        if (msg.sender != project.recipient) revert ImpactHook__NotProjectRecipient();
        project.name = name;
        project.category = category;
        project.imageUrl = imageUrl;
    }

    /// @notice Get a contributor's impact stats
    /// @param contributor The address to check
    /// @param poolId The pool ID
    /// @return poolContribution Cumulative contribution to this pool
    /// @return globalContribution Cumulative contribution across all pools
    function getContributorStats(address contributor, PoolId poolId)
        external
        view
        returns (uint256 poolContribution, uint256 globalContribution)
    {
        return (contributions[contributor][poolId], globalContributions[contributor]);
    }

    /// @notice Get template details
    /// @param templateId The template ID
    /// @return name The template name
    /// @return descriptions Milestone descriptions
    /// @return feeBpsValues Fee bps for each milestone
    /// @return _lpSkimBps Default LP skim rate
    /// @return _heartbeatInterval Default heartbeat
    /// @return _swapFeeEnabled Whether swap fees are active
    function getTemplate(uint256 templateId)
        external
        view
        returns (
            string memory name,
            string[] memory descriptions,
            uint16[] memory feeBpsValues,
            uint16 _lpSkimBps,
            uint256 _heartbeatInterval,
            bool _swapFeeEnabled
        )
    {
        if (templateId >= templateCount) revert ImpactHook__TemplateNotFound();
        ProjectTemplate storage t = _templates[templateId];
        return (t.name, t.descriptions, t.feeBpsValues, t.lpSkimBps, t.heartbeatInterval, t.swapFeeEnabled);
    }

    /// @notice Get the current loyalty discount for an address on a pool
    /// @param contributor The address to check
    /// @param poolId The pool ID
    /// @return discountBps The discount in basis points (0 if no discount)
    function getLoyaltyDiscount(address contributor, PoolId poolId)
        external
        view
        returns (uint16 discountBps)
    {
        uint256 contributed = contributions[contributor][poolId];
        LoyaltyTier[] storage tiers = loyaltyTiers[poolId];

        for (uint256 i = tiers.length; i > 0; --i) {
            if (contributed >= tiers[i - 1].threshold) {
                return tiers[i - 1].discountBps;
            }
        }
        return 0;
    }

    /// @notice Get loyalty tier count for a pool
    function getLoyaltyTierCount(PoolId poolId) external view returns (uint256) {
        return loyaltyTiers[poolId].length;
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

    /// @dev Check if a project's heartbeat has expired
    function _isHeartbeatExpired(PoolId poolId) internal view returns (bool) {
        Project storage project = projects[poolId];
        if (project.heartbeatInterval == 0) return false; // no expiration
        return block.timestamp > project.lastHeartbeat + project.heartbeatInterval;
    }

    /// @dev Skim a percentage of LP fees for the impact project.
    /// Returns a BalanceDelta representing the hook's take (positive = hook takes).
    function _skimLpFees(PoolKey calldata key, BalanceDelta feesAccrued) internal returns (BalanceDelta) {
        PoolId poolId = key.toId();
        uint16 skimBps = lpSkimBps[poolId];

        // No skim configured, paused, project paused, expired, or no milestones verified
        if (skimBps == 0 || paused || projectPaused[poolId] || _isHeartbeatExpired(poolId) || _getCurrentFeeBps(poolId) == 0) {
            return BalanceDeltaLibrary.ZERO_DELTA;
        }

        int128 fees0 = feesAccrued.amount0();
        int128 fees1 = feesAccrued.amount1();

        // Only skim positive (earned) fees
        int128 skim0 = 0;
        int128 skim1 = 0;

        if (fees0 > 0) {
            skim0 = int128(int256(uint256(uint128(fees0)) * skimBps / 10_000));
        }
        if (fees1 > 0) {
            skim1 = int128(int256(uint256(uint128(fees1)) * skimBps / 10_000));
        }

        // Effects first (checks-effects-interactions)
        if (skim0 > 0) {
            accumulatedFees[poolId][key.currency0] += uint256(uint128(skim0));
        }
        if (skim1 > 0) {
            accumulatedFees[poolId][key.currency1] += uint256(uint128(skim1));
        }

        // Interactions
        if (skim0 > 0) {
            POOL_MANAGER.take(key.currency0, address(this), uint256(uint128(skim0)));
            emit LpFeesSkimmed(poolId, key.currency0, uint256(uint128(skim0)));
        }
        if (skim1 > 0) {
            POOL_MANAGER.take(key.currency1, address(this), uint256(uint128(skim1)));
            emit LpFeesSkimmed(poolId, key.currency1, uint256(uint128(skim1)));
        }

        // Return positive delta = hook took these tokens from the LP's share
        return toBalanceDelta(skim0, skim1);
    }

    /// @dev Apply loyalty discount to fee based on sender's cumulative contributions
    function _applyLoyaltyDiscount(PoolId poolId, address sender, uint16 feeBps) internal view returns (uint16) {
        LoyaltyTier[] storage tiers = loyaltyTiers[poolId];
        if (tiers.length == 0) return feeBps;

        uint256 contributed = contributions[sender][poolId];
        uint16 discountBps = 0;

        // Find the highest tier the sender qualifies for
        for (uint256 i = tiers.length; i > 0; --i) {
            if (contributed >= tiers[i - 1].threshold) {
                discountBps = tiers[i - 1].discountBps;
                break;
            }
        }

        if (discountBps == 0) return feeBps;

        // Apply discount: reduce fee by discountBps (e.g., 1000 = 10% off)
        uint16 discountedFee = feeBps - uint16((uint256(feeBps) * discountBps) / 10_000);
        return discountedFee;
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

    /// @notice Called after liquidity is added. Skims a percentage of accrued LP fees
    /// for the impact project if lpSkimBps is configured.
    function afterAddLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta feesAccrued,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        return (this.afterAddLiquidity.selector, _skimLpFees(key, feesAccrued));
    }

    function beforeRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        revert();
    }

    /// @notice Called after liquidity is removed. Skims a percentage of accrued LP fees
    /// for the impact project if lpSkimBps is configured.
    function afterRemoveLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta feesAccrued,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, BalanceDelta) {
        return (this.afterRemoveLiquidity.selector, _skimLpFees(key, feesAccrued));
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

    /// @notice Called after a native v4 PoolManager.donate(). Skims a percentage
    /// of LP donations for the impact project if configured.
    function afterDonate(
        address,
        PoolKey calldata key,
        uint256 amount0,
        uint256 amount1,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4) {
        PoolId poolId = key.toId();
        uint16 skimBps = donateSkimBps[poolId];

        if (skimBps == 0 || paused || projectPaused[poolId] || _isHeartbeatExpired(poolId) || _getCurrentFeeBps(poolId) == 0) {
            return this.afterDonate.selector;
        }

        // Skim a percentage of the donated amounts
        if (amount0 > 0) {
            uint256 skim0 = (amount0 * skimBps) / 10_000;
            if (skim0 > 0) {
                accumulatedFees[poolId][key.currency0] += skim0;
                POOL_MANAGER.take(key.currency0, address(this), skim0);
                emit DonateSkimmed(poolId, key.currency0, skim0);
            }
        }

        if (amount1 > 0) {
            uint256 skim1 = (amount1 * skimBps) / 10_000;
            if (skim1 > 0) {
                accumulatedFees[poolId][key.currency1] += skim1;
                POOL_MANAGER.take(key.currency1, address(this), skim1);
                emit DonateSkimmed(poolId, key.currency1, skim1);
            }
        }

        return this.afterDonate.selector;
    }
}
