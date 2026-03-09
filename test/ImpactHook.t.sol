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
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";

import {ImpactHook} from "../src/ImpactHook.sol";
import {MilestoneArbiter, IArbiter, Attestation} from "../src/MilestoneArbiter.sol";

contract ImpactHookTest is Test, Deployers {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    ImpactHook hook;
    PoolKey poolKey;
    PoolId poolId;

    address recipient = makeAddr("recipient");
    address verifier = makeAddr("verifier");
    address alice = makeAddr("alice");
    address callbackProxy = makeAddr("callbackProxy");

    // Milestone configs for standard test setup
    string[] descriptions;
    uint16[] feeBpsValues;

    function setUp() public {
        // Deploy v4 core contracts (PoolManager, routers, test tokens)
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        // Deploy hook at address with correct permission flags
        // Flags: beforeInitialize (1<<13) | afterSwap (1<<6) | afterSwapReturnDelta (1<<2)
        uint160 flags = uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG);
        address hookAddress = address(flags);

        // Deploy hook at the flagged address
        deployCodeTo("ImpactHook.sol", abi.encode(manager), hookAddress);
        hook = ImpactHook(hookAddress);

        // Set callback proxy for Reactive Network tests
        hook.setCallbackProxy(callbackProxy);

        // Set up milestone configs:
        // Milestone 0: 0 bps (project must prove itself)
        // Milestone 1: 200 bps (2%)
        // Milestone 2: 300 bps (3%)
        // Milestone 3: 100 bps (1% — winding down)
        descriptions.push("Project registered");
        descriptions.push("Phase 1 complete");
        descriptions.push("Phase 2 complete");
        descriptions.push("Self-sustaining");

        feeBpsValues.push(0);
        feeBpsValues.push(200);
        feeBpsValues.push(300);
        feeBpsValues.push(100);

        // Create pool key
        poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hookAddress)
        });
        poolId = poolKey.toId();

        // Register project, then initialize pool
        hook.registerProject(poolKey, recipient, verifier, descriptions, feeBpsValues);
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
    }

    // ────────── Registration Tests ──────────

    function test_projectRegistered() public view {
        (address r, address v, uint256 cm, uint256 mc, uint16 fb, bool reg) = hook.getProjectInfo(poolId);
        assertEq(r, recipient);
        assertEq(v, verifier);
        assertEq(cm, 0);
        assertEq(mc, 4);
        assertEq(fb, 0);
        assertTrue(reg);
    }

    function test_revert_doubleRegister() public {
        vm.expectRevert(ImpactHook.ProjectAlreadyRegistered.selector);
        hook.registerProject(poolKey, recipient, verifier, descriptions, feeBpsValues);
    }

    function test_revert_initWithoutRegistration() public {
        PoolKey memory newKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 500,
            tickSpacing: 10,
            hooks: IHooks(address(hook))
        });

        // v4 wraps hook reverts
        vm.expectRevert();
        manager.initialize(newKey, SQRT_PRICE_1_1);
    }

    function test_revert_feeTooHigh() public {
        PoolKey memory newKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 500,
            tickSpacing: 10,
            hooks: IHooks(address(hook))
        });

        string[] memory desc = new string[](1);
        desc[0] = "test";
        uint16[] memory fees = new uint16[](1);
        fees[0] = 501; // Over MAX_FEE_BPS (500)

        vm.expectRevert(ImpactHook.FeeBpsTooHigh.selector);
        hook.registerProject(newKey, recipient, verifier, desc, fees);
    }

    function test_revert_noMilestones() public {
        PoolKey memory newKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 500,
            tickSpacing: 10,
            hooks: IHooks(address(hook))
        });

        string[] memory desc = new string[](0);
        uint16[] memory fees = new uint16[](0);

        vm.expectRevert(ImpactHook.NoMilestones.selector);
        hook.registerProject(newKey, recipient, verifier, desc, fees);
    }

    // ────────── Swap + Fee Tests ──────────

    function test_zeroFeeBeforeFirstMilestone() public {
        uint16 currentFee = hook.getCurrentFeeBps(poolId);
        assertEq(currentFee, 0);

        uint256 hookBalanceBefore = currency1.balanceOf(address(hook));
        _swap(true, -1 ether);
        uint256 hookBalanceAfter = currency1.balanceOf(address(hook));

        assertEq(hookBalanceAfter, hookBalanceBefore);
        assertEq(hook.accumulatedFees(poolId, currency1), 0);
    }

    function test_feeAfterMilestoneVerification() public {
        // Verify milestone 0 (0 bps) and 1 (200 bps)
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        assertEq(hook.getCurrentFeeBps(poolId), 200);

        _swap(true, -1 ether);

        uint256 fees = hook.accumulatedFees(poolId, currency1);
        assertGt(fees, 0, "Fees should be accumulated after milestone verification");
    }

    function test_feeProgression() public {
        // Verify milestones 0 and 1
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        // Swap at 200 bps
        _swap(true, -1 ether);
        uint256 fees1 = hook.accumulatedFees(poolId, currency1);

        // Verify milestone 2 (300 bps)
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 2);
        assertEq(hook.getCurrentFeeBps(poolId), 300);

        // Swap at 300 bps
        _swap(true, -1 ether);
        uint256 fees2 = hook.accumulatedFees(poolId, currency1) - fees1;

        assertGt(fees2, fees1, "Higher milestone should yield higher fees");
    }

    function test_feeOneForZero() public {
        // Verify milestones to enable fees
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        // Swap in the opposite direction (oneForZero)
        _swap(false, -1 ether);

        // Fees should accumulate in currency0 (the output for oneForZero)
        uint256 fees0 = hook.accumulatedFees(poolId, currency0);
        assertGt(fees0, 0, "Should accumulate fees in currency0 for oneForZero swap");

        // currency1 fees should be 0 (not the output for this direction)
        uint256 fees1 = hook.accumulatedFees(poolId, currency1);
        assertEq(fees1, 0, "Should not accumulate fees in currency1 for oneForZero swap");
    }

    function test_feeBothDirections() public {
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        // Swap zeroForOne — fees in currency1
        _swap(true, -1 ether);
        assertGt(hook.accumulatedFees(poolId, currency1), 0);

        // Swap oneForZero — fees in currency0
        _swap(false, -1 ether);
        assertGt(hook.accumulatedFees(poolId, currency0), 0);
    }

    // ────────── Multiple Pools Test ──────────

    function test_multipleProjects() public {
        // Create a second pool with a different project
        address recipient2 = makeAddr("recipient2");
        address verifier2 = makeAddr("verifier2");

        PoolKey memory poolKey2 = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 10000,
            tickSpacing: 200,
            hooks: IHooks(address(hook))
        });

        string[] memory desc2 = new string[](2);
        desc2[0] = "Start";
        desc2[1] = "Done";
        uint16[] memory fees2 = new uint16[](2);
        fees2[0] = 100; // 1% from the start
        fees2[1] = 400; // 4% after milestone 1

        hook.registerProject(poolKey2, recipient2, verifier2, desc2, fees2);
        manager.initialize(poolKey2, SQRT_PRICE_1_1);

        modifyLiquidityRouter.modifyLiquidity(
            poolKey2,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -200,
                tickUpper: 200,
                liquidityDelta: 100 ether,
                salt: bytes32(0)
            }),
            ""
        );

        PoolId poolId2 = poolKey2.toId();

        // Verify milestone 0 on pool2 (100 bps immediately)
        vm.prank(verifier2);
        hook.verifyMilestone(poolKey2, 0);

        // Verify milestones on pool1
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        // Swap on pool 1
        _swap(true, -1 ether);

        // Swap on pool 2
        swapRouter.swap(
            poolKey2,
            IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: -1 ether,
                sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );

        // Verify independent fee tracking
        uint256 fees1 = hook.accumulatedFees(poolId, currency1);
        uint256 fees2pool = hook.accumulatedFees(poolId2, currency1);

        assertGt(fees1, 0, "Pool 1 should have fees");
        assertGt(fees2pool, 0, "Pool 2 should have fees");

        // Pool 1 at 200 bps, Pool 2 at 100 bps — pool 1 fees should be higher
        assertGt(fees1, fees2pool, "Pool 1 (200 bps) should have more fees than Pool 2 (100 bps)");

        // Verify different recipients
        (address r1,,,,,) = hook.getProjectInfo(poolId);
        (address r2,,,,,) = hook.getProjectInfo(poolId2);
        assertEq(r1, recipient);
        assertEq(r2, recipient2);

        // Withdraw from pool 2 — should go to recipient2
        hook.withdraw(poolId2, currency1);
        assertEq(currency1.balanceOf(recipient2), fees2pool);
        assertEq(hook.accumulatedFees(poolId2, currency1), 0);

        // Pool 1 fees unaffected
        assertEq(hook.accumulatedFees(poolId, currency1), fees1);
    }

    // ────────── Milestone Verification Tests ──────────

    function test_milestoneVerification() public {
        vm.startPrank(verifier);

        hook.verifyMilestone(poolKey, 0);
        assertTrue(hook.isMilestoneVerified(poolId, 0));
        assertFalse(hook.isMilestoneVerified(poolId, 1));

        hook.verifyMilestone(poolKey, 1);
        assertTrue(hook.isMilestoneVerified(poolId, 1));

        vm.stopPrank();
    }

    function test_revert_unauthorizedVerifier() public {
        vm.prank(alice);
        vm.expectRevert(ImpactHook.NotVerifier.selector);
        hook.verifyMilestone(poolKey, 0);
    }

    function test_revert_outOfOrderMilestone() public {
        vm.prank(verifier);
        vm.expectRevert(ImpactHook.InvalidMilestoneIndex.selector);
        hook.verifyMilestone(poolKey, 1);
    }

    function test_revert_alreadyVerified() public {
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 0);

        // currentMilestone has advanced to 1, so index 0 is invalid
        vm.prank(verifier);
        vm.expectRevert(ImpactHook.InvalidMilestoneIndex.selector);
        hook.verifyMilestone(poolKey, 0);
    }

    // ────────── Withdrawal Tests ──────────

    function test_withdrawFees() public {
        vm.startPrank(verifier);
        hook.verifyMilestone(poolKey, 0);
        hook.verifyMilestone(poolKey, 1);
        vm.stopPrank();

        _swap(true, -1 ether);

        uint256 fees = hook.accumulatedFees(poolId, currency1);
        assertGt(fees, 0);

        uint256 recipientBefore = currency1.balanceOf(recipient);

        hook.withdraw(poolId, currency1);

        uint256 recipientAfter = currency1.balanceOf(recipient);
        assertEq(recipientAfter - recipientBefore, fees);
        assertEq(hook.accumulatedFees(poolId, currency1), 0);
    }

    function test_revert_withdrawNoFees() public {
        vm.expectRevert(ImpactHook.NoFeesToWithdraw.selector);
        hook.withdraw(poolId, currency1);
    }

    // ────────── View Function Tests ──────────

    function test_isMilestoneVerified_outOfBounds() public view {
        assertFalse(hook.isMilestoneVerified(poolId, 99));
    }

    function test_getMilestoneCount() public view {
        assertEq(hook.getMilestoneCount(poolId), 4);
    }

    // ────────── Admin Tests ──────────

    function test_updateRecipient() public {
        address newRecipient = makeAddr("newRecipient");
        vm.prank(recipient);
        hook.updateRecipient(poolKey, newRecipient);

        (address r,,,,,) = hook.getProjectInfo(poolId);
        assertEq(r, newRecipient);
    }

    function test_revert_updateRecipient_unauthorized() public {
        vm.prank(alice);
        vm.expectRevert(ImpactHook.NotRecipient.selector);
        hook.updateRecipient(poolKey, alice);
    }

    function test_updateVerifier() public {
        address newVerifier = makeAddr("newVerifier");
        vm.prank(verifier);
        hook.updateVerifier(poolKey, newVerifier);

        (, address v,,,,) = hook.getProjectInfo(poolId);
        assertEq(v, newVerifier);
    }

    function test_setCallbackProxy() public {
        address newProxy = makeAddr("newProxy");
        hook.setCallbackProxy(newProxy);
        assertEq(hook.callbackProxy(), newProxy);
    }

    function test_revert_setCallbackProxy_unauthorized() public {
        vm.prank(alice);
        vm.expectRevert();
        hook.setCallbackProxy(alice);
    }

    // ────────── Reactive Network Callback Tests ──────────

    function test_verifyMilestoneReactive() public {
        // Must come from the callback proxy
        vm.prank(callbackProxy);
        hook.verifyMilestoneReactive(verifier, poolId, 0);

        assertTrue(hook.isMilestoneVerified(poolId, 0));
    }

    function test_revert_verifyMilestoneReactive_wrongCaller() public {
        // Not from callback proxy — should revert
        vm.prank(alice);
        vm.expectRevert(ImpactHook.NotCallbackProxy.selector);
        hook.verifyMilestoneReactive(verifier, poolId, 0);
    }

    function test_revert_verifyMilestoneReactive_wrongRvmId() public {
        vm.prank(callbackProxy);
        vm.expectRevert(ImpactHook.NotVerifier.selector);
        hook.verifyMilestoneReactive(alice, poolId, 0);
    }

    // ────────── MilestoneArbiter Tests ──────────

    function test_arbiter_returnsTrueWhenVerified() public {
        MilestoneArbiter arbiter = new MilestoneArbiter(address(hook));

        // Verify milestone 0
        vm.prank(verifier);
        hook.verifyMilestone(poolKey, 0);

        // Encode demand: poolId, milestone 0
        bytes memory demand = abi.encode(MilestoneArbiter.DemandData({
            poolId: poolId,
            requiredMilestone: 0
        }));

        Attestation memory emptyAttestation;
        assertTrue(arbiter.checkObligation(emptyAttestation, demand, bytes32(0)));
    }

    function test_arbiter_returnsFalseWhenNotVerified() public {
        MilestoneArbiter arbiter = new MilestoneArbiter(address(hook));

        // Don't verify any milestones
        bytes memory demand = abi.encode(MilestoneArbiter.DemandData({
            poolId: poolId,
            requiredMilestone: 0
        }));

        Attestation memory emptyAttestation;
        assertFalse(arbiter.checkObligation(emptyAttestation, demand, bytes32(0)));
    }

    function test_arbiter_returnsFalseForInvalidMilestone() public {
        MilestoneArbiter arbiter = new MilestoneArbiter(address(hook));

        bytes memory demand = abi.encode(MilestoneArbiter.DemandData({
            poolId: poolId,
            requiredMilestone: 99 // doesn't exist
        }));

        Attestation memory emptyAttestation;
        assertFalse(arbiter.checkObligation(emptyAttestation, demand, bytes32(0)));
    }

    // ────────── Fuzz Tests ──────────

    function testFuzz_feeCalculation(uint16 feeBps) public {
        feeBps = uint16(bound(feeBps, 1, 500));

        PoolKey memory newKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 10000,
            tickSpacing: 200,
            hooks: IHooks(address(hook))
        });

        string[] memory desc = new string[](1);
        desc[0] = "test";
        uint16[] memory fees = new uint16[](1);
        fees[0] = feeBps;

        hook.registerProject(newKey, recipient, verifier, desc, fees);
        manager.initialize(newKey, SQRT_PRICE_1_1);

        modifyLiquidityRouter.modifyLiquidity(
            newKey,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -200,
                tickUpper: 200,
                liquidityDelta: 100 ether,
                salt: bytes32(0)
            }),
            ""
        );

        PoolId newPoolId = newKey.toId();

        vm.prank(verifier);
        hook.verifyMilestone(newKey, 0);

        swapRouter.swap(
            newKey,
            IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: -1 ether,
                sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );

        uint256 accFees = hook.accumulatedFees(newPoolId, currency1);
        assertGt(accFees, 0, "Should accumulate fees for any valid bps");
    }

    // ────────── Helpers ──────────

    function _swap(bool zeroForOne, int256 amountSpecified) internal {
        swapRouter.swap(
            poolKey,
            IPoolManager.SwapParams({
                zeroForOne: zeroForOne,
                amountSpecified: amountSpecified,
                sqrtPriceLimitX96: zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
    }
}
