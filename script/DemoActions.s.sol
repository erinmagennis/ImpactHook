// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {ImpactHook} from "../src/ImpactHook.sol";

/// @notice Verify a milestone (direct path).
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> MILESTONE=0 \
///   forge script script/DemoActions.s.sol:DemoVerify \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoVerify is Script {
    using PoolIdLibrary for PoolKey;

    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");
        uint256 milestone = vm.envUint("MILESTONE");

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        PoolId poolId = key.toId();

        vm.startBroadcast();
        ImpactHook(HOOK).verifyMilestone(key, milestone);
        vm.stopBroadcast();

        console.log("Milestone verified:", milestone);
        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
    }
}

/// @notice Set LP skim bps for a pool.
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> SKIM_BPS=1000 \
///   forge script script/DemoActions.s.sol:DemoSetLpSkim \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoSetLpSkim is Script {
    using PoolIdLibrary for PoolKey;

    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");
        uint16 skimBps = uint16(vm.envUint("SKIM_BPS"));

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        PoolId poolId = key.toId();

        vm.startBroadcast();
        ImpactHook(HOOK).setLpSkimBps(poolId, skimBps);
        vm.stopBroadcast();

        console.log("LP skim set to bps:", skimBps);
    }
}

/// @notice Withdraw accumulated fees.
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> \
///   forge script script/DemoActions.s.sol:DemoWithdraw \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoWithdraw is Script {
    using PoolIdLibrary for PoolKey;

    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        PoolId poolId = key.toId();

        uint256 fees0 = ImpactHook(HOOK).accumulatedFees(poolId, Currency.wrap(token0));
        uint256 fees1 = ImpactHook(HOOK).accumulatedFees(poolId, Currency.wrap(token1));
        console.log("Accumulated fees token0:", fees0);
        console.log("Accumulated fees token1:", fees1);

        vm.startBroadcast();
        if (fees1 > 0) {
            ImpactHook(HOOK).withdraw(poolId, Currency.wrap(token1));
            console.log("Withdrawn token1 fees:", fees1);
        }
        if (fees0 > 0) {
            ImpactHook(HOOK).withdraw(poolId, Currency.wrap(token0));
            console.log("Withdrawn token0 fees:", fees0);
        }
        vm.stopBroadcast();
    }
}

/// @notice Query project state (no broadcast needed).
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> \
///   forge script script/DemoActions.s.sol:DemoQuery \
///     --rpc-url https://sepolia.unichain.org
contract DemoQuery is Script {
    using PoolIdLibrary for PoolKey;

    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public view {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        PoolId poolId = key.toId();

        (address recipient, address verifier, uint256 currentMilestone, uint256 milestoneCount, uint16 currentFeeBps, bool registered)
            = ImpactHook(HOOK).getProjectInfo(poolId);

        console.log("=== PROJECT STATE ===");
        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("Registered:", registered);
        console.log("Recipient:", recipient);
        console.log("Verifier:", verifier);
        console.log("Current milestone:", currentMilestone);
        console.log("Total milestones:", milestoneCount);
        console.log("Current fee (bps):", currentFeeBps);

        uint256 fees0 = ImpactHook(HOOK).accumulatedFees(poolId, Currency.wrap(token0));
        uint256 fees1 = ImpactHook(HOOK).accumulatedFees(poolId, Currency.wrap(token1));
        console.log("Accumulated fees token0:", fees0);
        console.log("Accumulated fees token1:", fees1);
    }
}
