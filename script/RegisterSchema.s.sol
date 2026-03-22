// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {ISchemaRegistry} from "../src/interfaces/IEAS.sol";
import {ImpactHook} from "../src/ImpactHook.sol";

/// @notice Registers the ImpactHook milestone schema on EAS and sets it on the hook.
///
/// Run after deploying ImpactHook:
///   HOOK_ADDRESS=0x... \
///   forge script script/RegisterSchema.s.sol:RegisterSchemaScript \
///     --rpc-url https://sepolia.unichain.org \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract RegisterSchemaScript is Script {
    // EAS SchemaRegistry on Unichain Sepolia (OP Stack predeploy)
    address constant SCHEMA_REGISTRY = 0x4200000000000000000000000000000000000020;

    // Schema: poolId, milestoneIndex, and evidence string
    string constant SCHEMA = "bytes32 poolId, uint256 milestoneIndex, string evidence";

    function run() public {
        address hookAddress = vm.envAddress("HOOK_ADDRESS");

        console.log("Registering milestone schema on EAS...");
        console.log("Hook:", hookAddress);
        console.log("Schema:", SCHEMA);

        vm.startBroadcast();

        // Register schema (no resolver, revocable)
        bytes32 schemaUID = ISchemaRegistry(SCHEMA_REGISTRY).register(SCHEMA, address(0), true);

        console.log("Schema UID:");
        console.logBytes32(schemaUID);

        // Set schema on hook
        ImpactHook(payable(hookAddress)).setMilestoneSchema(schemaUID);

        console.log("Schema set on ImpactHook");

        vm.stopBroadcast();
    }
}
