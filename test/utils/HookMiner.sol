// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title HookMiner
/// @notice Mines CREATE2 salts to find hook addresses with the correct permission flags
library HookMiner {
    /// @notice Find a salt that produces a CREATE2 address with the desired flags
    /// @param deployer The CREATE2 deployer address
    /// @param flags The desired permission flags (encoded in lowest 14 bits of address)
    /// @param creationCode The contract creation code
    /// @param constructorArgs The ABI-encoded constructor arguments
    /// @return hookAddress The computed hook address
    /// @return salt The salt that produces the address
    function find(
        address deployer,
        uint160 flags,
        bytes memory creationCode,
        bytes memory constructorArgs
    ) internal pure returns (address hookAddress, bytes32 salt) {
        bytes memory initCode = abi.encodePacked(creationCode, constructorArgs);
        bytes32 initCodeHash = keccak256(initCode);

        uint160 flagMask = uint160((1 << 14) - 1); // lowest 14 bits

        for (uint256 i = 0; i < 100_000; i++) {
            salt = bytes32(i);
            hookAddress = computeAddress(deployer, salt, initCodeHash);

            if (uint160(hookAddress) & flagMask == flags) {
                return (hookAddress, salt);
            }
        }

        revert("HookMiner: could not find salt");
    }

    /// @notice Compute the CREATE2 address for given parameters
    function computeAddress(address deployer, bytes32 salt, bytes32 initCodeHash)
        internal
        pure
        returns (address)
    {
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, initCodeHash)))));
    }
}
