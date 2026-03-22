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
import {ImpactHook} from "../src/ImpactHook.sol";
import {TestToken} from "../src/TestToken.sol";

/// @notice Deploys test tokens, routers, registers a project, initializes pool, adds liquidity.
/// After this, the frontend can execute live swaps.
///
/// Usage:
///   forge script script/DeployLivePool.s.sol:DeployLivePoolScript \
///     --rpc-url https://sepolia.unichain.org --private-key $KEY --broadcast
contract DeployLivePoolScript is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x00B036B58a818B1BC34d502D3fE730Db729e62AC;
    address constant HOOK = 0x3D307ADF09d62D4F7CcF17C6dc329C339d696557;

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

        console.log("Token0:", token0);
        console.log("Token1:", token1);

        // 2. Deploy routers
        PoolSwapTest swapRouter = new PoolSwapTest(IPoolManager(POOL_MANAGER));
        PoolModifyLiquidityTest liquidityRouter = new PoolModifyLiquidityTest(IPoolManager(POOL_MANAGER));

        console.log("SwapRouter:", address(swapRouter));
        console.log("LiquidityRouter:", address(liquidityRouter));

        // 3. Mint tokens to deployer
        TestToken(token0).mint(msg.sender, 1000 ether);
        TestToken(token1).mint(msg.sender, 1000 ether);

        // 4. Register project on hook
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });
        PoolId poolId = key.toId();

        string[] memory descriptions = new string[](4);
        descriptions[0] = "Baseline water testing complete";
        descriptions[1] = "Purification systems installed in 20 schools";
        descriptions[2] = "3-month water quality verified";
        descriptions[3] = "Community management trained";

        uint16[] memory fees = new uint16[](4);
        fees[0] = 0;
        fees[1] = 100;
        fees[2] = 200;
        fees[3] = 300;

        ImpactHook(payable(HOOK)).registerProject(key, msg.sender, msg.sender, "Clean Water - Chiapas Schools", "Climate", descriptions, fees);

        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));

        // 5. Initialize pool at 1:1 price
        // SQRT_PRICE_1_1 = 79228162514264337593543950336
        IPoolManager(POOL_MANAGER).initialize(key, 79228162514264337593543950336);
        console.log("Pool initialized");

        // 6. Approve tokens to liquidity router
        TestToken(token0).approve(address(liquidityRouter), type(uint256).max);
        TestToken(token1).approve(address(liquidityRouter), type(uint256).max);

        // 7. Add liquidity
        liquidityRouter.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 100 ether,
                salt: bytes32(0)
            }),
            ""
        );
        console.log("Liquidity added: 100 ETH equivalent");

        // 8. Verify milestones 0-1 so fees activate (leave 2-3 for live demo)
        ImpactHook(payable(HOOK)).verifyMilestone(key, 0);
        ImpactHook(payable(HOOK)).verifyMilestone(key, 1);
        console.log("Milestones 0-1 verified, fee at 100 bps (1%)");
        console.log("Milestones 2-3 left unverified for live demo");

        // 9. Set LP skim at 10% so both funding models are active
        ImpactHook(payable(HOOK)).setLpSkimBps(poolId, 1000);
        console.log("LP skim set at 1000 bps (10% of LP fees)");

        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Token0:", token0);
        console.log("Token1:", token1);
        console.log("SwapRouter:", address(swapRouter));
        console.log("LiquidityRouter:", address(liquidityRouter));
        console.log("Hook:", HOOK);
        console.log("Pool ID:");
        console.logBytes32(PoolId.unwrap(poolId));

        vm.stopBroadcast();
    }
}
