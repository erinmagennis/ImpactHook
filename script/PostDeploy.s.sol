// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {ImpactHook} from "../src/ImpactHook.sol";

/// @notice Post-deployment setup: sets the Callback Proxy on ImpactHook
/// so that Reactive Network cross-chain callbacks are authorized.
///
/// Run after deploying ImpactHook and MilestoneReactor:
///   HOOK_ADDRESS=0x... \
///   forge script script/PostDeploy.s.sol:PostDeployScript \
///     --rpc-url https://sepolia.unichain.org \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract PostDeployScript is Script {
    // Unichain Sepolia Callback Proxy (Reactive Network)
    address constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    function run() public {
        address hookAddress = vm.envAddress("HOOK_ADDRESS");

        console.log("Setting callback proxy on ImpactHook:", hookAddress);
        console.log("Callback Proxy:", CALLBACK_PROXY);

        vm.startBroadcast();

        ImpactHook hook = ImpactHook(payable(hookAddress));
        hook.setCallbackProxy(CALLBACK_PROXY);

        console.log("Callback proxy set successfully");

        vm.stopBroadcast();
    }
}
