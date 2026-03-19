# Feynman Deep Logic Audit - Raw Analysis

**Contract:** `src/ImpactHook.sol`
**Date:** 2026-03-19
**Auditor:** Claude Opus 4.6 (automated)
**Method:** Line-by-line logical trace of every state-mutating path

---

## 1. afterSwap Fee Routing (afterSwapReturnDelta pattern)

### Trace (lines 272-341)

The hook intercepts swap output, calculates a fee in bps, calls `POOL_MANAGER.take()` to claim tokens, then returns the fee as `int128` via the second return value. The PoolManager uses this return delta to reduce the swapper's output.

**Delta convention check:**
- `zeroForOne`: swapper pays token0 (amount0 < 0), receives token1 (amount1 > 0). Code reads `delta.amount1()` -- correct.
- `!zeroForOne`: swapper pays token1 (amount1 < 0), receives token0 (amount0 > 0). Code reads `delta.amount0()` -- correct.

**Fee calculation (line 319):**
```
uint256 feeAmount = (uint256(uint128(outputAmount)) * feeBps) / 10_000;
```
- `outputAmount` is verified > 0 on line 314, so the `int128 -> uint128` cast is safe.
- `uint128(outputAmount)` max = ~3.4e38. Multiplied by max feeBps (500) = ~1.7e41. `uint256` max is ~1.15e77. No overflow.

**Return delta (line 340):**
```
return (this.afterSwap.selector, int128(int256(feeAmount)));
```
- Line 325 checks `feeAmount <= uint128(type(int128).max)`. This guard is correct -- prevents overflow on the cast chain.
- Positive return = hook claims these tokens from the swapper's output. Correct per v4 spec.

**State updates:**
- `accumulatedFees[poolId][feeCurrency] += feeAmount` -- tracks the hook's token balance per pool/currency.
- `contributions[sender][poolId] += feeAmount` -- tracks per-user per-pool contributions.
- `globalContributions[sender] += feeAmount` -- tracks per-user global contributions.

**FINDING RAW-1: `sender` parameter is the swap router address, not the end user.**
The `afterSwap` first parameter (`address sender`) is the address that called `poolManager.swap()`. In Uniswap v4, this is typically the swap router contract (e.g., `PoolSwapTest`, `SwapRouter`), NOT the end-user EOA. The contributions and loyalty discounts are therefore tracked against the router address, not the actual swapper. This means:
- All swappers through the same router share one loyalty tier.
- `contributions[sender][poolId]` is the router's cumulative, not any individual user's.
- The loyalty discount system is effectively broken for end users.

**Severity assessment:** Medium-High (loyalty system does not work as documented; contributions tracking is misleading).

**FINDING RAW-2: No pause check on LP fee skim.**
`afterSwap` checks `paused` at line 279. However, `_skimLpFees` (called from `afterAddLiquidity` and `afterRemoveLiquidity`) also checks `paused` at line 811. This is correct -- both paths are independently guarded. No issue here on closer inspection.

---

## 2. LP Fee Skim Logic (_skimLpFees via afterAddLiquidity/afterRemoveLiquidity)

### Trace (lines 806-842)

The hook receives `feesAccrued` (the LP fees earned by this position since last interaction) and skims a percentage.

**Casting chain (line 823):**
```
skim0 = int128(int256(uint256(uint128(fees0)) * skimBps / 10_000));
```
- `fees0` is verified > 0.
- `uint128(fees0)` is safe (fees0 > 0 means positive int128, fits in uint128).
- Max product: `uint128.max * 5000 / 10000` = ~1.7e38. Fits in `uint256`.
- `int128(int256(...))`: result is at most `uint128.max * 5000 / 10000` = ~1.7e38, which fits in int128 (max ~1.7e38). Actually, `type(int128).max` = 2^127 - 1 = ~1.7e38. And `uint128.max * 5000 / 10000` = `(2^128-1) * 5000 / 10000` = ~1.7e38. This is dangerously close.

**FINDING RAW-3: Potential int128 overflow in _skimLpFees casting.**
If `fees0` = `type(int128).max` (= 2^127 - 1) and `skimBps` = 5000:
- `uint128(fees0)` = 2^127 - 1
- `(2^127 - 1) * 5000 / 10000` = `(2^127 - 1) / 2` = ~8.5e37
- `int128(int256(8.5e37))` -- this fits, since int128 max is ~1.7e38.

Actually this is fine. The skim is always <= 50% of the original int128 value, which always fits back in int128. No overflow. Retracting.

**POOL_MANAGER.take() in skim context:**
The hook calls `POOL_MANAGER.take()` inside the afterAddLiquidity/afterRemoveLiquidity callback, and returns the delta. The PoolManager will account for this take against the hook's balance. This is the correct pattern for return-delta hooks.

**FINDING RAW-4: LP skim does not update contributions or globalContributions.**
When LP fees are skimmed, `accumulatedFees` is updated but `contributions` and `globalContributions` are not. This is arguably by design (LP skim is not a "contribution" from a specific user), but it creates an inconsistency: `accumulatedFees` can exceed the sum of all tracked contributions + donations. This is cosmetic/accounting only -- no funds at risk.

**FINDING RAW-5: LP skim applies even when no milestones are verified.**
`_skimLpFees` checks `skimBps == 0 || paused` but does NOT check whether any milestones are verified. If the owner sets `lpSkimBps` before any milestone verification, LP fees will be skimmed immediately. This may be intentional (owner configures it), but it differs from the swap fee behavior which requires milestone verification.

---

## 3. Milestone Verification Paths

### Path A: Direct (verifyMilestone, lines 349-369)

- Checks: registered, msg.sender == verifier, milestoneIndex == currentMilestone, index < length, not already verified.
- State: sets verified = true, increments currentMilestone if not last.
- All checks are correct and in the right order.

### Path B: Reactive Network (verifyMilestoneReactive, lines 377-397)

- Checks: msg.sender == callbackProxy, registered, rvmId == verifier, milestoneIndex == currentMilestone, index < length, not already verified.
- Identical state mutation logic.

**FINDING RAW-6: callbackProxy can be set to address(0) by owner.**
`setCallbackProxy` (line 608) has no zero-address check. If set to address(0), no one can call `verifyMilestoneReactive` (since `msg.sender` can never be address(0)). This is not exploitable but could be a footgun if the owner accidentally clears it. Low severity.

### Path C: EAS (verifyMilestoneEAS, lines 403-436)

- Reads attestation from EAS contract.
- Validates: schema matches, attester == verifier, not revoked.
- Decodes `(bytes32 poolId, uint256 milestoneIndex, string evidence)` from attestation data.
- Validates: decoded poolId matches, milestoneIndex == currentMilestone, index < length, not already verified.

**FINDING RAW-7: EAS attestation can be replayed if milestoneSchemaUID is changed and then changed back.**
If the owner calls `setMilestoneSchema(X)`, then milestone is verified with schema X. Later, if schema is changed to Y and then back to X, any remaining unverified milestones could potentially be verified using old attestations from schema X. However, the sequential milestone enforcement (`milestoneIndex == currentMilestone`) limits this -- only the next milestone in sequence could be verified. The attestation would need to match the exact next milestoneIndex. This is a very narrow edge case. Low severity.

**FINDING RAW-8: EAS attestation expirationTime is not checked.**
The IEAS.Attestation struct has `expirationTime` but `verifyMilestoneEAS` only checks `revocationTime != 0`. An expired attestation (where `block.timestamp > expirationTime` and `expirationTime != 0`) would still be accepted. This could allow verifying milestones with stale/expired evidence.

---

## 4. Loyalty Discount Calculation

### Trace (lines 845-865)

```
uint16 discountedFee = feeBps - uint16((uint256(feeBps) * discountBps) / 10_000);
```

- Max discount: 5000 bps (50% off).
- `uint256(feeBps) * discountBps` max = 500 * 5000 = 2,500,000. Fits in uint256.
- `2,500,000 / 10,000` = 250.
- `uint16(250)` = 250. Fits.
- `feeBps - 250` = 250. Non-negative since max discount is 50%.

**The math is sound.** A 50% max discount on a 500 max fee gives a minimum discounted fee of 250 bps. No underflow possible.

**However, per RAW-1 above, this discount is applied based on the router's contributions, not the end user's.** The discount system works mechanically but not as intended for individual users.

---

## 5. donate() Function

### Trace (lines 468-492)

**Native ETH path:**
- Uses `msg.value` as donation amount.
- Adds to `accumulatedFees[poolId][currency]`.
- The hook contract will hold the ETH.

**FINDING RAW-9: ETH donations use native ETH, but withdraw uses Currency.transfer().**
`withdraw()` at line 455 calls `currency.transfer(project.recipient, amount)`. For native ETH (currency = address(0)), `CurrencyLibrary.transfer` sends ETH via a low-level call. This should work correctly. No issue.

**ERC20 path:**
- Uses SafeERC20.safeTransferFrom with balance-before/after pattern for fee-on-transfer safety.
- Correctly uses actual received amount.

**FINDING RAW-10: ERC20 donate() does not reject msg.value.**
If a caller sends ETH along with an ERC20 donation (non-zero msg.value with a non-zero currency address), the ETH is silently trapped in the contract with no way to recover it. There is no `msg.value == 0` check for the ERC20 branch.

**FINDING RAW-11: donate() does not update contributions or globalContributions.**
Donations via `donate()` update `accumulatedFees` but NOT `contributions` or `globalContributions`. A donor who contributes via donate() gets no loyalty discount credit. This may be by design, but creates an inconsistency where `accumulatedFees` can exceed the sum of `contributions`.

---

## 6. Access Control Consistency

| Function | Access Control | Assessment |
|---|---|---|
| registerProject | onlyOwner | Correct |
| registerProjectFromTemplate | onlyOwner | Correct |
| createTemplate | onlyOwner | Correct |
| setLoyaltyTiers | onlyOwner | Correct |
| setLpSkimBps | onlyOwner | Correct |
| setCallbackProxy | onlyOwner | Correct |
| setMilestoneSchema | onlyOwner | Correct |
| setPaused | onlyOwner | Correct |
| transferOwnership | onlyOwner | Correct |
| acceptOwnership | pendingOwner only | Correct |
| verifyMilestone | project.verifier | Correct |
| verifyMilestoneReactive | callbackProxy + rvmId==verifier | Correct |
| verifyMilestoneEAS | permissionless (attestation-gated) | Correct |
| withdraw | project.recipient + nonReentrant | Correct |
| donate | anyone (payable) + nonReentrant | Correct |
| updateRecipient | current recipient | Correct |
| updateVerifier | current verifier | Correct |
| beforeInitialize | onlyPoolManager | Correct |
| afterSwap | onlyPoolManager | Correct |
| afterAddLiquidity | onlyPoolManager | Correct |
| afterRemoveLiquidity | onlyPoolManager | Correct |

**FINDING RAW-12: setLpSkimBps has no project-registration check.**
The owner can call `setLpSkimBps` for any PoolId, even one without a registered project. If `lpSkimBps` is set for an unregistered pool, and that pool is later initialized somehow (unlikely since `beforeInitialize` blocks it), the skim would run. Practically no risk since `beforeInitialize` prevents initialization without registration.

**FINDING RAW-13: setLoyaltyTiers and setLpSkimBps take raw PoolId, not PoolKey.**
These admin functions accept a `PoolId` directly, unlike `registerProject` which takes a `PoolKey`. There is no validation that the PoolId corresponds to a registered project. The owner could accidentally configure loyalty tiers or skim rates for non-existent pools, wasting gas. Low severity.

---

## 7. withdraw() and Reentrancy Protection

### Trace (lines 443-458)

```solidity
function withdraw(PoolId poolId, Currency currency) external nonReentrant {
    // checks
    uint256 amount = accumulatedFees[poolId][currency];
    if (amount == 0) revert ...;
    // effects
    accumulatedFees[poolId][currency] = 0;
    // interactions
    currency.transfer(project.recipient, amount);
}
```

**CEI pattern:** Correctly zeros balance before transfer. Even without the nonReentrant modifier, a reentrant call would see `amount == 0` and revert.

**nonReentrant modifier:** Uses `_locked` bool. The error message is misleading -- it reverts with `ImpactHook__Paused()` instead of a reentrancy-specific error (line 164). This is a minor quality issue.

**FINDING RAW-14: nonReentrant modifier reuses ImpactHook__Paused error.**
Line 164: `if (_locked) revert ImpactHook__Paused();`. This is misleading -- a reentrancy attempt would produce a "Paused" error, not a reentrancy error. Should use a dedicated error. Informational severity.

**Native ETH transfer in withdraw:**
`CurrencyLibrary.transfer` for native ETH uses a low-level call that forwards all gas. The recipient could be a contract that reenters, but the nonReentrant guard + CEI pattern makes this safe.

---

## 8. Cross-Function State Consistency

### accumulatedFees

**Incremented by:**
1. `afterSwap` -- swap fee portion (line 331)
2. `_skimLpFees` -- LP fee skim (lines 826, 835)
3. `donate()` -- direct donations (line 488)

**Decremented by:**
1. `withdraw()` -- zeroed out per currency (line 452)

**Invariant:** `accumulatedFees[poolId][currency]` should equal the contract's token balance attributable to that pool/currency, minus any already-withdrawn amounts. Since all three increment paths correspond to actual token inflows (take from PM, or safeTransferFrom), and withdraw is the only decrement with an actual transfer out, the accounting is consistent.

**FINDING RAW-15: No cross-pool balance isolation.**
The contract holds all tokens for all pools in a single balance. If there's a bug in `POOL_MANAGER.take()` or a token with unexpected behavior, one pool's balance could theoretically be drained by another pool's withdrawal. However, this is standard practice for multi-pool hooks and not a realistic attack vector given the PoolManager's own accounting.

### contributions / globalContributions

**Incremented by:**
1. `afterSwap` only (lines 334-335)

**Never decremented.** These are monotonically increasing counters. This is correct for a cumulative loyalty system.

**Consistency gap:** As noted in RAW-4 and RAW-11, LP skims and donations increase `accumulatedFees` without corresponding `contributions` updates. This means `sum(accumulatedFees) >= sum(contributions)` at all times, but they measure different things.

---

## 9. Additional Findings

**FINDING RAW-16: _getCurrentFeeBps returns the last verified milestone's fee forever.**
Once all milestones are verified, `currentMilestone` stays at N-1 (last index). `_getCurrentFeeBps` checks `ms[current].verified` which is true, and returns `ms[current].projectFeeBps`. This fee persists indefinitely with no mechanism to reduce it to zero or change it after all milestones are done. This is documented in the project memory as a known quirk, but from a design perspective, there's no way for the project to "graduate" and stop collecting fees unless the owner pauses the contract.

**FINDING RAW-17: No mechanism to deregister a project or modify milestones.**
Once registered, a project cannot be removed or have its milestones modified. If a project becomes malicious or abandoned, the only recourse is pausing the entire contract (affecting all pools). There is no per-project pause.

**FINDING RAW-18: Template IDs use sequential counter, but _templates mapping allows collision avoidance.**
`templateCount` is incremented with post-increment (`templateId = templateCount++`). This is correct -- first template gets ID 0, second gets ID 1, etc. No collision possible.
