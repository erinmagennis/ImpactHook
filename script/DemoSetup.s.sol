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

/// @notice Setup for live demo: deploys tokens, routers, initializes pool, adds liquidity.
/// Does NOT register the project or verify milestones - those happen live on camera.
///
/// Usage:
///   forge script script/DemoSetup.s.sol:DemoSetupScript \
///     --rpc-url https://sepolia.unichain.org --private-key $PK --broadcast
contract DemoSetupScript is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x1F98400000000000000000000000000000000004;
    address constant HOOK = 0x8860645503A99c16E55eB10668D4420B9d9aE557;

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

        // 4. Compute pool ID (for the project that will be registered live)
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });
        PoolId poolId = key.toId();

        // 5. Approve tokens to routers
        TestToken(token0).approve(address(liquidityRouter), type(uint256).max);
        TestToken(token1).approve(address(liquidityRouter), type(uint256).max);
        TestToken(token0).approve(address(swapRouter), type(uint256).max);
        TestToken(token1).approve(address(swapRouter), type(uint256).max);

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
        console.log("");
        console.log("Pool ID (for after you register the project):");
        console.logBytes32(PoolId.unwrap(poolId));
        console.log("");
        console.log("=== COPY THESE ENV VARS ===");
        console.log("");
        console.log("export TOKEN0=", token0);
        console.log("export TOKEN1=", token1);
        console.log("export SWAP_ROUTER=", address(swapRouter));
        console.log("export LIQ_ROUTER=", address(liquidityRouter));
        console.log("export HOOK=", HOOK);
        console.log("export POOL_ID=<pool_id_from_above>");
        console.log("");
        console.log("=== NEXT: Register project on the Create page or via cast ===");
        console.log("Then: Initialize pool + add liquidity via cast (commands in demo guide)");
    }
}
