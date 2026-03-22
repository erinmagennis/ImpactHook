// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolId} from "v4-core/src/types/PoolId.sol";
import {ImpactHook} from "./ImpactHook.sol";

/// @notice Alkahest IArbiter interface (from arkhai-io/alkahest)
/// @dev Attestation struct from EAS — only the fields we need for the interface
struct Attestation {
    bytes32 uid;
    bytes32 schema;
    uint64 time;
    uint64 expirationTime;
    uint64 revocationTime;
    bytes32 refUID;
    address recipient;
    address attester;
    bool revocable;
    bytes data;
}

interface IArbiter {
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 fulfilling
    ) external view returns (bool);
}

/// @title MilestoneArbiter
/// @notice Alkahest arbiter that gates escrow release on ImpactHook milestone verification.
/// Demand encodes a poolId and required milestone index. The arbiter checks whether
/// that milestone has been verified on the ImpactHook contract.
contract MilestoneArbiter is IArbiter {
    ImpactHook public immutable hook;

    struct DemandData {
        PoolId poolId;
        uint256 requiredMilestone;
    }

    constructor(address _hook) {
        hook = ImpactHook(payable(_hook));
    }

    /// @notice Check if the milestone condition is met for an escrowed obligation.
    /// @param demand ABI-encoded DemandData (poolId, requiredMilestone)
    /// @return True if the required milestone has been verified on the hook
    function checkObligation(
        Attestation memory,
        bytes memory demand,
        bytes32
    ) external view override returns (bool) {
        DemandData memory d = abi.decode(demand, (DemandData));
        return hook.isMilestoneVerified(d.poolId, d.requiredMilestone);
    }
}
