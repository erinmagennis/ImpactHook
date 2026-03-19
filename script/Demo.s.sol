// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {ImpactHook} from "../src/ImpactHook.sol";

/// @notice Demo script: registers a children-focused project and verifies milestones.
///         Run each step separately to show live on-chain state changes in the video.
///
/// Usage:
///   Step 1 - Register:
///     forge script script/Demo.s.sol:DemoRegister --rpc-url $UNICHAIN_SEPOLIA_RPC --broadcast
///
///   Step 2 - Verify milestone 0:
///     forge script script/Demo.s.sol:DemoVerify0 --rpc-url $UNICHAIN_SEPOLIA_RPC --broadcast
///
///   Step 3 - Verify milestone 1:
///     forge script script/Demo.s.sol:DemoVerify1 --rpc-url $UNICHAIN_SEPOLIA_RPC --broadcast
///
///   Query state (no broadcast needed):
///     forge script script/Demo.s.sol:DemoQuery --rpc-url $UNICHAIN_SEPOLIA_RPC

contract DemoBase is Script {
    address constant HOOK = 0x2caDc1E168F99e70a228A154733c6AE129982557;

    // Use two placeholder token addresses to form the PoolKey.
    // These don't need to be real tokens - we just need a unique PoolKey
    // to register the project and compute a poolId.
    address constant TOKEN0 = 0x0000000000000000000000000000000000000001;
    address constant TOKEN1 = 0x0000000000000000000000000000000000000002;

    function demoPoolKey() internal pure returns (PoolKey memory) {
        return PoolKey({
            currency0: Currency.wrap(TOKEN0),
            currency1: Currency.wrap(TOKEN1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });
    }

    function demoPoolId() internal pure returns (PoolId) {
        return PoolIdLibrary.toId(demoPoolKey());
    }
}

/// Step 1: Register a children-focused project (owner only)
contract DemoRegister is DemoBase {
    function run() public {
        PoolKey memory key = demoPoolKey();
        PoolId poolId = demoPoolId();

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));

        string[] memory descriptions = new string[](4);
        descriptions[0] = "Baseline water testing complete";
        descriptions[1] = "Purification systems installed in 20 schools";
        descriptions[2] = "3-month water quality verified";
        descriptions[3] = "Community management trained";

        uint16[] memory fees = new uint16[](4);
        fees[0] = 0;     // 0% until first milestone
        fees[1] = 100;   // 1% after installation
        fees[2] = 200;   // 2% after quality verified
        fees[3] = 300;   // 3% after community trained

        // Recipient = deployer for demo purposes
        // Verifier = deployer so we can verify from same wallet
        address deployer = msg.sender;

        console.log("Registering project...");
        console.log("  Recipient:", deployer);
        console.log("  Verifier:", deployer);
        console.log("  Milestones: 4");
        console.log("  Project: Clean Water - Chiapas Schools");

        vm.startBroadcast();
        ImpactHook(HOOK).registerProject(key, deployer, deployer, "Clean Water - Chiapas Schools", "Climate", descriptions, fees);
        vm.stopBroadcast();

        console.log("Project registered successfully!");
    }
}

/// Step 2: Verify milestone 0 (verifier only)
contract DemoVerify0 is DemoBase {
    function run() public {
        PoolKey memory key = demoPoolKey();
        PoolId poolId = demoPoolId();

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("Verifying milestone 0: Baseline water testing complete");

        vm.startBroadcast();
        ImpactHook(HOOK).verifyMilestone(key, 0);
        vm.stopBroadcast();

        console.log("Milestone 0 verified! Fee tier now: 0 bps");
    }
}

/// Step 3: Verify milestone 1 (verifier only)
contract DemoVerify1 is DemoBase {
    function run() public {
        PoolKey memory key = demoPoolKey();
        PoolId poolId = demoPoolId();

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("Verifying milestone 1: Purification systems installed in 20 schools");

        vm.startBroadcast();
        ImpactHook(HOOK).verifyMilestone(key, 1);
        vm.stopBroadcast();

        console.log("Milestone 1 verified! Fee tier now: 100 bps (1%)");
    }
}

/// Step 4: Verify milestone 2 (verifier only)
contract DemoVerify2 is DemoBase {
    function run() public {
        PoolKey memory key = demoPoolKey();
        PoolId poolId = demoPoolId();

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("Verifying milestone 2: 3-month water quality verified");

        vm.startBroadcast();
        ImpactHook(HOOK).verifyMilestone(key, 2);
        vm.stopBroadcast();

        console.log("Milestone 2 verified! Fee tier now: 200 bps (2%)");
    }
}

/// Step 5: Verify milestone 3 (verifier only)
contract DemoVerify3 is DemoBase {
    function run() public {
        PoolKey memory key = demoPoolKey();
        PoolId poolId = demoPoolId();

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("Verifying milestone 3: Community management trained");

        vm.startBroadcast();
        ImpactHook(HOOK).verifyMilestone(key, 3);
        vm.stopBroadcast();

        console.log("Milestone 3 verified! Fee tier now: 300 bps (3%). All milestones complete!");
    }
}

/// Query: Read current project state (no tx needed)
contract DemoQuery is DemoBase {
    function run() public view {
        PoolId poolId = demoPoolId();
        bytes32 id = PoolId.unwrap(poolId);

        console.log("Pool ID:");
        console.logBytes32(id);

        (
            address recipient,
            address verifier,
            uint256 currentMilestone,
            uint256 milestoneCount,
            uint16 currentFeeBps,
            bool registered
        ) = ImpactHook(HOOK).getProjectInfo(poolId);

        console.log("Registered:", registered);
        console.log("Recipient:", recipient);
        console.log("Verifier:", verifier);
        console.log("Current milestone:", currentMilestone);
        console.log("Milestone count:", milestoneCount);
        console.log("Current fee (bps):", currentFeeBps);

        for (uint256 i = 0; i < milestoneCount; i++) {
            bool verified = ImpactHook(HOOK).isMilestoneVerified(poolId, i);
            console.log("  Milestone", i, "verified:", verified);
        }
    }
}
