// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IReactive} from "reactive-lib/src/interfaces/IReactive.sol";
import {AbstractReactive} from "reactive-lib/src/abstract-base/AbstractReactive.sol";

/// @title MilestoneReactor
/// @notice Reactive Smart Contract (RSC) deployed on the Reactive Network.
/// Subscribes to MilestoneSubmitted events from MilestoneOracle on the origin
/// chain and emits Callback events to trigger verifyMilestoneReactive() on
/// the ImpactHook contract on the destination chain.
///
/// Architecture:
///   Origin Chain (MilestoneOracle) → Reactive Network (this RSC) → Destination Chain (ImpactHook)
///
/// @dev Inherits from AbstractReactive which provides:
///   - REACTIVE_IGNORE constant for wildcard topic subscriptions
///   - SERVICE_ADDR (system contract at 0x...fffFfF)
///   - IPayer implementation (pay/receive for subscription fees)
///   - vm detection and vmOnly/rnOnly modifiers
///   - Callback event and LogRecord struct via IReactive
contract MilestoneReactor is AbstractReactive {
    // ──────────────────── Constants ────────────────────

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
    ) payable {
        originChainId = _originChainId;
        destinationChainId = _destinationChainId;
        oracleAddress = _oracleAddress;
        callbackAddress = _callbackAddress;

        // Subscribe to MilestoneSubmitted events from the oracle on the origin chain
        // Only subscribe on Reactive Network (not inside ReactVM)
        if (!vm) {
            service.subscribe(
                _originChainId,
                _oracleAddress,
                MILESTONE_SUBMITTED_TOPIC_0,
                REACTIVE_IGNORE, // wildcard: any poolId
                REACTIVE_IGNORE, // wildcard: any milestoneIndex
                REACTIVE_IGNORE
            );
        }
    }

    // ──────────────────── Core ────────────────────

    /// @notice Called by the ReactVM when a subscribed event fires.
    /// Decodes the MilestoneSubmitted event and emits a Callback to trigger
    /// verifyMilestoneReactive() on the ImpactHook contract.
    /// @param log The log record from the origin chain
    function react(LogRecord calldata log) external vmOnly {
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
