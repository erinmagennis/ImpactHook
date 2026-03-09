// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {MilestoneOracle} from "../src/MilestoneOracle.sol";

/// @notice Deploys MilestoneOracle on an origin chain (e.g. Ethereum Sepolia).
/// This contract emits MilestoneSubmitted events that the Reactive Network RSC subscribes to.
contract DeployOracleScript is Script {
    function run() public {
        vm.startBroadcast();

        MilestoneOracle oracle = new MilestoneOracle();
        console.log("MilestoneOracle deployed at:", address(oracle));

        vm.stopBroadcast();
    }
}
