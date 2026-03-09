// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {MilestoneReactor} from "../src/MilestoneReactor.sol";

/// @notice Deploys MilestoneReactor on Reactive Network (testnet Lasna, chain ID 5318007).
/// Requires: ORIGIN_CHAIN_ID, DESTINATION_CHAIN_ID, ORACLE_ADDRESS, CALLBACK_ADDRESS as env vars.
///
/// Example usage:
///   ORIGIN_CHAIN_ID=11155111 \
///   DESTINATION_CHAIN_ID=1301 \
///   ORACLE_ADDRESS=0x... \
///   CALLBACK_ADDRESS=0x... \
///   forge script script/DeployReactor.s.sol:DeployReactorScript \
///     --rpc-url https://kopli-rpc.rkt.ink \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract DeployReactorScript is Script {
    function run() public {
        uint256 originChainId = vm.envUint("ORIGIN_CHAIN_ID");
        uint256 destinationChainId = vm.envUint("DESTINATION_CHAIN_ID");
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS");
        address callbackAddress = vm.envAddress("CALLBACK_ADDRESS");

        console.log("Origin Chain ID:", originChainId);
        console.log("Destination Chain ID:", destinationChainId);
        console.log("Oracle Address:", oracleAddress);
        console.log("Callback Address:", callbackAddress);

        vm.startBroadcast();

        MilestoneReactor reactor = new MilestoneReactor(
            originChainId,
            destinationChainId,
            oracleAddress,
            callbackAddress
        );

        console.log("MilestoneReactor deployed at:", address(reactor));

        vm.stopBroadcast();
    }
}
