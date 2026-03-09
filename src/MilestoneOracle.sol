// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolId} from "v4-core/src/types/PoolId.sol";

/// @title MilestoneOracle
/// @notice Origin chain contract that emits milestone submission events.
/// Deployed on any supported origin chain. The Reactive Network RSC
/// (MilestoneReactor) subscribes to these events and triggers cross-chain
/// callbacks to ImpactHook on the destination chain.
contract MilestoneOracle {
    // ──────────────────── Errors ────────────────────

    error NotAuthorized();

    // ──────────────────── Events ────────────────────

    /// @notice Emitted when a milestone is submitted for verification.
    /// @dev topic_0 = event signature, topic_1 = poolId, topic_2 = milestoneIndex
    /// The Reactive Network RSC subscribes to topic_0 to capture all submissions.
    event MilestoneSubmitted(
        PoolId indexed poolId,
        uint256 indexed milestoneIndex,
        bytes data
    );

    // ──────────────────── Storage ────────────────────

    /// @notice Maps poolId => authorized submitter address
    mapping(PoolId => address) public authorizedSubmitters;

    address public owner;

    // ──────────────────── Constructor ────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ──────────────────── Admin ────────────────────

    /// @notice Authorize a submitter for a specific pool
    function setAuthorizedSubmitter(PoolId poolId, address submitter) external {
        if (msg.sender != owner) revert NotAuthorized();
        authorizedSubmitters[poolId] = submitter;
    }

    // ──────────────────── Core ────────────────────

    /// @notice Submit a milestone for cross-chain verification.
    /// Emits MilestoneSubmitted which the MilestoneReactor RSC picks up.
    /// @param poolId The pool ID on the destination chain
    /// @param milestoneIndex The milestone index to verify
    /// @param data Optional supporting data (e.g. proof hash, IPFS CID)
    function submitMilestone(
        PoolId poolId,
        uint256 milestoneIndex,
        bytes calldata data
    ) external {
        if (msg.sender != authorizedSubmitters[poolId] && msg.sender != owner) {
            revert NotAuthorized();
        }
        emit MilestoneSubmitted(poolId, milestoneIndex, data);
    }
}
