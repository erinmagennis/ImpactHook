// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IERC20Minimal} from "v4-core/src/interfaces/external/IERC20Minimal.sol";

import {ImpactHook} from "../src/ImpactHook.sol";
import {ImpactSwapRouter} from "../src/ImpactSwapRouter.sol";

contract ImpactSwapRouterTest is Test, Deployers {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    ImpactHook hook;
    ImpactSwapRouter router;
    PoolKey poolKey;
    PoolId poolId;

    address recipient = makeAddr("recipient");
    address verifier = makeAddr("verifier");
    address swapper = makeAddr("swapper");

    string[] descriptions;
    uint16[] feeBpsValues;

    function setUp() public {
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        // Deploy hook
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_FLAG | Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG | Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG
            | Hooks.AFTER_DONATE_FLAG
        );
        address hookAddress = address(flags);
        address easAddress = makeAddr("eas");
        deployCodeTo("ImpactHook.sol", abi.encode(manager, address(this), easAddress), hookAddress);
        hook = ImpactHook(payable(hookAddress));

        // Deploy ImpactSwapRouter
        router = new ImpactSwapRouter(manager);

        // Set up milestones
        descriptions.push("Project registered");
        descriptions.push("Phase 1 complete");
        feeBpsValues.push(0);
        feeBpsValues.push(200);

        // Create pool key
        poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hookAddress)
        });
        poolId = poolKey.toId();

        // Register project and initialize pool
        hook.registerProject(poolKey, recipient, verifier, "Test Project", "Test", descriptions, feeBpsValues);
        manager.initialize(poolKey, SQRT_PRICE_1_1);

        // Add liquidity
        modifyLiquidityRouter.modifyLiquidity(
            poolKey,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 100 ether,
                salt: bytes32(0)
            }),
            ""
        );

        // Fund swapper with tokens and approve router
        deal(Currency.unwrap(currency0), swapper, 100 ether);
        deal(Currency.unwrap(currency1), swapper, 100 ether);
        vm.startPrank(swapper);
        IERC20Minimal(Currency.unwrap(currency0)).approve(address(router), type(uint256).max);
        IERC20Minimal(Currency.unwrap(currency1)).approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function test_swapRouter_basicSwap() public {
        uint256 balanceBefore = IERC20Minimal(Currency.unwrap(currency1)).balanceOf(swapper);

        vm.prank(swapper);
        uint256 amountOut = router.swap(poolKey, true, 1 ether, 0);

        uint256 balanceAfter = IERC20Minimal(Currency.unwrap(currency1)).balanceOf(swapper);
        assertGt(amountOut, 0, "Should receive output tokens");
        assertEq(balanceAfter - balanceBefore, amountOut, "Balance change should match amountOut");
    }

    function test_swapRouter_multipleSwaps() public {
        // Execute multiple swaps and verify fees accumulate
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 0);
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 1);

        vm.startPrank(swapper);
        uint256 out1 = router.swap(poolKey, true, 0.5 ether, 0);
        uint256 out2 = router.swap(poolKey, true, 0.5 ether, 0);
        vm.stopPrank();

        assertGt(out1, 0);
        assertGt(out2, 0);

        uint256 totalFees = hook.accumulatedFees(poolId, currency1);
        assertGt(totalFees, 0, "Fees should accumulate across multiple swaps");
    }

    function test_swapRouter_slippageProtection() public {
        vm.prank(swapper);
        vm.expectRevert();
        // Request absurdly high minAmountOut for a 1 ether swap - will revert with SlippageExceeded
        router.swap(poolKey, true, 1 ether, 999 ether);
    }

    function test_swapRouter_withHookFees() public {
        // Verify milestone 0 (0 bps) then milestone 1 (200 bps = 2%)
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 0);
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 1);

        vm.prank(swapper);
        uint256 amountOut = router.swap(poolKey, true, 1 ether, 0);

        // With 2% hook fee, output should be less than a no-fee swap
        // but still positive
        assertGt(amountOut, 0, "Should receive output even with hook fees");

        // Verify fees accumulated in the hook
        uint256 fees = hook.accumulatedFees(poolId, currency1);
        assertGt(fees, 0, "Hook should have accumulated fees");
    }

    function test_swapRouter_unlockCallback_onlyPoolManager() public {
        vm.prank(swapper);
        vm.expectRevert("not pool manager");
        router.unlockCallback(abi.encode(ImpactSwapRouter.SwapCallbackData({
            sender: swapper,
            key: poolKey,
            zeroForOne: true,
            amountIn: 1 ether,
            sqrtPriceLimitX96: 4295128740
        })));
    }
}
