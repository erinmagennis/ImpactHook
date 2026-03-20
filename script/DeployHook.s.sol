// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {ImpactHook} from "../src/ImpactHook.sol";
import {MilestoneArbiter} from "../src/MilestoneArbiter.sol";
import {HookMiner} from "../test/utils/HookMiner.sol";

/// @notice Deploys ImpactHook at an address with the correct permission flags
/// and deploys MilestoneArbiter pointing to it.
contract DeployHookScript is Script {
    // Unichain Sepolia PoolManager
    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;

    // EAS on Unichain Sepolia (OP Stack predeploy)
    address constant EAS = 0x4200000000000000000000000000000000000021;

    // Deterministic CREATE2 deployer used by Forge's `new Contract{salt: ...}`
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        // Required hook permission flags
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_FLAG | Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
            | Hooks.AFTER_SWAP_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG | Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG
            | Hooks.AFTER_DONATE_FLAG
        );

        // Mine a salt that produces a hook address with the correct flags
        // Forge routes `new Contract{salt: ...}` through the deterministic Create2Deployer
        // Constructor args include PoolManager, owner (deployer EOA), and EAS
        bytes memory constructorArgs = abi.encode(POOL_MANAGER, msg.sender, EAS);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, flags, type(ImpactHook).creationCode, constructorArgs);

        console.log("Deployer:", msg.sender);
        console.log("CREATE2 via:", CREATE2_DEPLOYER);
        console.log("Deploying ImpactHook to:", hookAddress);
        console.log("Salt:", uint256(salt));

        vm.startBroadcast();

        // Deploy hook via CREATE2 with deployer as owner
        ImpactHook hook = new ImpactHook{salt: salt}(IPoolManager(POOL_MANAGER), msg.sender, EAS);
        require(address(hook) == hookAddress, "Hook address mismatch");

        // Deploy MilestoneArbiter
        MilestoneArbiter arbiter = new MilestoneArbiter(address(hook));

        console.log("ImpactHook deployed at:", address(hook));
        console.log("MilestoneArbiter deployed at:", address(arbiter));

        vm.stopBroadcast();
    }
}
