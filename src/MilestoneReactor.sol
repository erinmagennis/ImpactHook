// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title MilestoneReactor
/// @notice Reactive Smart Contract (RSC) deployed on the Reactive Network.
/// Subscribes to MilestoneSubmitted events from MilestoneOracle on the origin
/// chain and emits Callback events to trigger verifyMilestoneReactive() on
/// the ImpactHook contract on the destination chain.
///
/// Architecture:
///   Origin Chain (MilestoneOracle) → Reactive Network (this RSC) → Destination Chain (ImpactHook)
///
/// @dev Follows the Reactive Network RSC pattern:
///   - Constructor subscribes to origin chain events via system contract
///   - react() is called by ReactVM when subscribed events fire
///   - Emitting Callback triggers a cross-chain call on the destination chain
///   - First argument of callback payload is ALWAYS overwritten with ReactVM ID
contract MilestoneReactor {
    // ──────────────────── Errors ────────────────────

    error NotReactiveNetwork();

    // ──────────────────── Events ────────────────────

    /// @notice Emitted to trigger a cross-chain callback on the destination chain.
    /// The Reactive Network relays this as a transaction to the destination contract.
    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );

    // ──────────────────── Constants ────────────────────

    /// @dev Reactive Network system contract for subscriptions
    address private constant REACTIVE_SYSTEM = 0x0000000000000000000000000000000000fffFfF;

    /// @dev Gas limit for the callback transaction on the destination chain
    uint64 private constant CALLBACK_GAS_LIMIT = 200_000;

    /// @dev MilestoneSubmitted(PoolId indexed, uint256 indexed, bytes) event signature
    /// keccak256("MilestoneSubmitted(bytes32,uint256,bytes)")
    uint256 private constant MILESTONE_SUBMITTED_TOPIC_0 =
        uint256(keccak256("MilestoneSubmitted(bytes32,uint256,bytes)"));

    // ──────────────────── Storage ────────────────────

    /// @notice The chain ID where MilestoneOracle is deployed (origin)
    uint256 public immutable originChainId;

    /// @notice The chain ID where ImpactHook is deployed (destination)
    uint256 public immutable destinationChainId;

    /// @notice The MilestoneOracle address on the origin chain
    address public immutable oracleAddress;

    /// @notice The ImpactHook address on the destination chain
    address public immutable callbackAddress;

    /// @notice Whether we're running in the ReactVM (auto-detected)
    bool private immutable isReactiveNetwork;

    // ──────────────────── Structs ────────────────────

    /// @dev Log record passed to react() by the ReactVM
    struct LogRecord {
        uint256 chain_id;
        address _contract;
        uint256 topic_0;
        uint256 topic_1;
        uint256 topic_2;
        uint256 topic_3;
        bytes data;
        uint256 block_number;
        uint256 op_code;
        uint256 block_hash;
        uint256 tx_hash;
        uint256 log_index;
    }

    // ──────────────────── Constructor ────────────────────

    /// @param _originChainId Chain ID where MilestoneOracle lives
    /// @param _destinationChainId Chain ID where ImpactHook lives
    /// @param _oracleAddress MilestoneOracle address on origin chain
    /// @param _callbackAddress ImpactHook address on destination chain
    constructor(
        uint256 _originChainId,
        uint256 _destinationChainId,
        address _oracleAddress,
        address _callbackAddress
    ) {
        originChainId = _originChainId;
        destinationChainId = _destinationChainId;
        oracleAddress = _oracleAddress;
        callbackAddress = _callbackAddress;

        // Auto-detect if we're in the ReactVM by checking system contract
        isReactiveNetwork = (REACTIVE_SYSTEM.code.length > 0);

        // Subscribe to MilestoneSubmitted events from the oracle on the origin chain
        if (isReactiveNetwork) {
            // subscribe(chainId, contractAddress, topic0, topic1, topic2, topic3)
            // Using 0 for topic1-3 = wildcard (match any value)
            (bool success,) = REACTIVE_SYSTEM.call(
                abi.encodeWithSignature(
                    "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
                    _originChainId,
                    _oracleAddress,
                    MILESTONE_SUBMITTED_TOPIC_0,
                    0, // wildcard: any poolId
                    0, // wildcard: any milestoneIndex
                    0
                )
            );
            require(success, "Subscription failed");
        }
    }

    // ──────────────────── Core ────────────────────

    /// @notice Called by the ReactVM when a subscribed event fires.
    /// Decodes the MilestoneSubmitted event and emits a Callback to trigger
    /// verifyMilestoneReactive() on the ImpactHook contract.
    /// @param log The log record from the origin chain
    function react(LogRecord calldata log) external {
        // Only callable within the ReactVM
        if (!isReactiveNetwork) revert NotReactiveNetwork();

        // Extract event data from log topics
        // topic_0 = MilestoneSubmitted event signature (already matched by subscription)
        // topic_1 = poolId (indexed bytes32)
        // topic_2 = milestoneIndex (indexed uint256)
        bytes32 poolId = bytes32(log.topic_1);
        uint256 milestoneIndex = log.topic_2;

        // Build the callback payload for ImpactHook.verifyMilestoneReactive(address, PoolId, uint256)
        // CRITICAL: First argument (address) is ALWAYS overwritten by Reactive Network
        // with the ReactVM ID. The destination contract uses this for authorization.
        bytes memory payload = abi.encodeWithSignature(
            "verifyMilestoneReactive(address,bytes32,uint256)",
            address(0), // placeholder — overwritten with ReactVM ID by the network
            poolId,
            milestoneIndex
        );

        // Emit Callback to trigger the cross-chain transaction
        emit Callback(destinationChainId, callbackAddress, CALLBACK_GAS_LIMIT, payload);
    }
}
