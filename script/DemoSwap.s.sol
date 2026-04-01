// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {ImpactHook} from "../src/ImpactHook.sol";

/// @notice Execute a swap through the demo pool and show fee state.
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> SWAP_ROUTER=<addr> \
///   forge script script/DemoSwap.s.sol:DemoSwapScript \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoSwapScript is Script {
    using PoolIdLibrary for PoolKey;

    address constant HOOK = 0xD178A9caEB1AA3EB89363E035e288433CD002557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");
        address swapRouter = vm.envAddress("SWAP_ROUTER");

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        PoolId poolId = key.toId();

        // Show state before swap
        uint256 feesBefore = ImpactHook(payable(HOOK)).accumulatedFees(poolId, Currency.wrap(token1));
        console.log("Fees before swap:", feesBefore);

        vm.startBroadcast();

        // Exact input swap: 1 token0 -> token1
        PoolSwapTest(swapRouter).swap(
            key,
            IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: -1 ether,
                sqrtPriceLimitX96: 4295128740
            }),
            PoolSwapTest.TestSettings({
                takeClaims: false,
                settleUsingBurn: false
            }),
            ""
        );

        vm.stopBroadcast();

        // Show state after swap
        uint256 feesAfter = ImpactHook(payable(HOOK)).accumulatedFees(poolId, Currency.wrap(token1));
        console.log("Fees after swap:", feesAfter);
        console.log("Fee collected this swap:", feesAfter - feesBefore);
    }
}
