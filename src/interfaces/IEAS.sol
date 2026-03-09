// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Minimal EAS interface for reading attestations
/// @dev Full spec: https://github.com/ethereum-attestation-service/eas-contracts
interface IEAS {
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

    function getAttestation(bytes32 uid) external view returns (Attestation memory);
}

interface ISchemaRegistry {
    function register(string calldata schema, address resolver, bool revocable) external returns (bytes32);
}
