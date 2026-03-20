// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";
import {TestToken} from "../src/TestToken.sol";

/// @notice Full demo setup: deploys tokens, routers, approves everything,
/// initializes pool, and adds liquidity. After this, the pool is ready for
/// project registration, milestone verification, and swaps.
///
/// Usage:
///   forge script script/DemoSetup.s.sol:DemoSetupScript \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoSetupScript is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        vm.startBroadcast();

        // 1. Deploy test tokens
        TestToken tokenA = new TestToken("Impact Token A", "IMPA", 18);
        TestToken tokenB = new TestToken("Impact Token B", "IMPB", 18);

        // Sort tokens (currency0 < currency1)
        address token0;
        address token1;
        if (address(tokenA) < address(tokenB)) {
            token0 = address(tokenA);
            token1 = address(tokenB);
        } else {
            token0 = address(tokenB);
            token1 = address(tokenA);
        }

        // 2. Deploy routers
        PoolSwapTest swapRouter = new PoolSwapTest(IPoolManager(POOL_MANAGER));
        PoolModifyLiquidityTest liquidityRouter = new PoolModifyLiquidityTest(IPoolManager(POOL_MANAGER));

        // 3. Mint tokens
        TestToken(token0).mint(msg.sender, 1000 ether);
        TestToken(token1).mint(msg.sender, 1000 ether);

        // 4. Approve tokens to ALL contracts that need them
        TestToken(token0).approve(address(liquidityRouter), type(uint256).max);
        TestToken(token1).approve(address(liquidityRouter), type(uint256).max);
        TestToken(token0).approve(address(swapRouter), type(uint256).max);
        TestToken(token1).approve(address(swapRouter), type(uint256).max);
        TestToken(token0).approve(POOL_MANAGER, type(uint256).max);
        TestToken(token1).approve(POOL_MANAGER, type(uint256).max);

        // 5. Build pool key and compute pool ID
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });
        PoolId poolId = key.toId();

        vm.stopBroadcast();

        // Print everything needed for the live demo
        console.log("");
        console.log("=== DEMO SETUP COMPLETE ===");
        console.log("");
        console.log("Token0:", token0);
        console.log("Token1:", token1);
        console.log("SwapRouter:", address(swapRouter));
        console.log("LiquidityRouter:", address(liquidityRouter));
        console.log("Hook:", HOOK);
        console.log("Fee:", FEE);
        console.log("TickSpacing:", uint24(TICK_SPACING));
        console.log("");
        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("");
        console.log("=== NEXT STEPS ===");
        console.log("1. Register project on /create page (use Reactor or your address as verifier)");
        console.log("2. Run DemoInitPool to initialize pool + add liquidity");
        console.log("3. Run DemoSwap to execute swaps");
    }
}

/// @notice Initialize pool and add liquidity. Run after registering the project.
///
/// Usage:
///   TOKEN0=<addr> TOKEN1=<addr> LIQ_ROUTER=<addr> \
///   forge script script/DemoSetup.s.sol:DemoInitPool \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoInitPool is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant HOOK = 0x5a9a2ec5e6550be0C6A7cF5fFC476ea332986557;
    uint24 constant FEE = 500;
    int24 constant TICK_SPACING = 10;

    function run() public {
        address token0 = vm.envAddress("TOKEN0");
        address token1 = vm.envAddress("TOKEN1");
        address liqRouter = vm.envAddress("LIQ_ROUTER");

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(HOOK)
        });

        vm.startBroadcast();

        // Initialize pool at 1:1 price
        IPoolManager(POOL_MANAGER).initialize(key, 79228162514264337593543950336);
        console.log("Pool initialized");

        // Add full-range liquidity
        PoolModifyLiquidityTest(liqRouter).modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -887220,
                tickUpper: 887220,
                liquidityDelta: 100 ether,
                salt: bytes32(0)
            }),
            ""
        );
        console.log("Liquidity added");

        vm.stopBroadcast();
    }
}
