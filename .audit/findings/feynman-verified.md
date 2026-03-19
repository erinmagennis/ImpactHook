# Feynman Deep Logic Audit - Verified Findings

**Contract:** `src/ImpactHook.sol`
**Date:** 2026-03-19
**Auditor:** Claude Opus 4.6 (automated)
**Raw findings reviewed:** 18 candidates -> 8 verified findings below

Only findings with concrete evidence and clear impact are included. Speculative or retracted findings from the raw analysis are excluded.

---

## VERIFIED FINDINGS

### V-1: Loyalty discounts track router address, not end user [MEDIUM]

**Location:** `afterSwap()` lines 293, 334-335
**Evidence:** The `sender` parameter in `afterSwap(address sender, ...)` is the address that called `poolManager.swap()`. In Uniswap v4's architecture, this is the swap router contract, not the EOA that initiated the transaction. The code:
```solidity
feeBps = _applyLoyaltyDiscount(poolId, sender, feeBps);
// ...
contributions[sender][poolId] += feeAmount;
globalContributions[sender] += feeAmount;
```
All loyalty tracking and discount application use the router address. Every user swapping through the same router shares a single loyalty tier. Individual users cannot earn or benefit from loyalty discounts.

**Impact:** The loyalty discount feature does not work as designed. The `contributions` and `globalContributions` mappings are effectively useless for per-user tracking when swaps go through standard routers. `getContributorStats()` returns router-level data, not user-level data.

**Recommendation:** Accept `hookData` in `afterSwap` and decode the original swapper address, or remove the loyalty system. Alternatively, use `tx.origin` (with its known limitations) or accept that loyalty is per-router.

---

### V-2: EAS attestation expirationTime not checked [LOW]

**Location:** `verifyMilestoneEAS()` lines 410-415
**Evidence:** The function checks `att.revocationTime != 0` (revoked attestations) and `att.schema` (correct schema), but does not check `att.expirationTime`. The IEAS.Attestation struct includes `expirationTime` (line 11 of IEAS.sol). An attestation with `expirationTime != 0 && block.timestamp > expirationTime` would be accepted as valid.

**Impact:** Expired attestations can be used to verify milestones. If a verifier creates a time-limited attestation intending it to expire, the milestone can still be verified after expiry. Mitigated by: sequential milestone enforcement limits which attestations are useful, and the verifier controls attestation creation.

**Recommendation:** Add: `if (att.expirationTime != 0 && block.timestamp > att.expirationTime) revert ImpactHook__AttestationExpired();`

---

### V-3: ERC20 donate() silently traps ETH sent alongside [LOW]

**Location:** `donate()` lines 468-492
**Evidence:** The function is `payable` to support native ETH donations. When `currency` is a non-zero address (ERC20), the code enters the ERC20 branch and ignores `msg.value`. Any ETH sent with the call is permanently locked in the contract.

```solidity
function donate(PoolId poolId, Currency currency, uint256 amount) external payable nonReentrant {
    if (currency.isAddressZero()) {
        donationAmount = msg.value;    // ETH path
    } else {
        // ERC20 path -- msg.value silently ignored
    }
}
```

**Impact:** Users who accidentally send ETH with an ERC20 donation lose that ETH. No recovery mechanism exists.

**Recommendation:** Add `if (msg.value != 0) revert ImpactHook__UnexpectedETH();` at the start of the ERC20 branch.

---

### V-4: donate() does not credit contributions or globalContributions [INFORMATIONAL]

**Location:** `donate()` lines 468-492 vs `afterSwap()` lines 334-335
**Evidence:** `afterSwap` updates three state variables: `accumulatedFees`, `contributions`, `globalContributions`. `donate()` only updates `accumulatedFees`. Direct donors receive no loyalty discount credit and are invisible in `getContributorStats()`.

**Impact:** Inconsistency in contribution tracking. A user who donates 10 ETH directly gets no loyalty recognition, while the same amount routed through swaps would. This may be intentional (donations are not "swapper contributions"), but is not documented.

**Recommendation:** If intentional, document it. If donations should count, add `contributions[msg.sender][poolId] += donationAmount; globalContributions[msg.sender] += donationAmount;` to `donate()`.

---

### V-5: LP skim applies regardless of milestone verification state [INFORMATIONAL]

**Location:** `_skimLpFees()` lines 806-842
**Evidence:** `_skimLpFees` checks `skimBps == 0 || paused` but does not call `_getCurrentFeeBps()` or check any milestone state. The swap fee path (`afterSwap`) returns 0 when no milestones are verified (via `_getCurrentFeeBps`), but LP skimming runs as long as `lpSkimBps > 0`.

**Impact:** If the owner sets `lpSkimBps` before any milestones are verified, LPs will have fees skimmed immediately even though the project has demonstrated no progress. This is a design asymmetry between the two funding channels.

**Recommendation:** Consider gating LP skim behind the same milestone logic, or document this as intentional (owner explicitly opts in to LP skimming independent of milestone progress).

---

### V-6: nonReentrant modifier uses misleading ImpactHook__Paused error [INFORMATIONAL]

**Location:** `nonReentrant` modifier, line 164
**Evidence:**
```solidity
modifier nonReentrant() {
    if (_locked) revert ImpactHook__Paused();  // misleading error
    _locked = true;
    _;
    _locked = false;
}
```

**Impact:** If a reentrancy attempt occurs on `withdraw()` or `donate()`, the error message will say "Paused" rather than indicating reentrancy. This complicates debugging and transaction analysis.

**Recommendation:** Add a dedicated `ImpactHook__ReentrancyGuard()` error.

---

### V-7: No per-project pause or deregistration mechanism [INFORMATIONAL]

**Location:** Contract-wide design
**Evidence:** `setPaused()` (line 622) is a global toggle affecting ALL pools. There is no `setProjectPaused(PoolId, bool)` function. Once registered, a project cannot be removed, paused, or have its milestones modified. The only way to stop a single project from collecting fees is to pause the entire contract.

**Impact:** If one project among many becomes compromised or abandoned, the owner must choose between pausing all fee collection (harming all projects) or allowing the compromised project to continue operating. Registered projects with verified milestones collect fees indefinitely with no shutdown mechanism.

**Recommendation:** Add a per-project pause flag checked in `afterSwap` and `_skimLpFees`, or add a `deregisterProject` function that zeros the project's fee tier.

---

### V-8: No fee graduation mechanism after all milestones verified [INFORMATIONAL]

**Location:** `_getCurrentFeeBps()` lines 780-802, `verifyMilestone()` lines 363-366
**Evidence:** When the last milestone is verified, `currentMilestone` stays at N-1 (not incremented past the array). `_getCurrentFeeBps` returns `ms[N-1].projectFeeBps` forever. There is no mechanism to set fees to 0 after a project completes all milestones.

**Impact:** Projects collect fees at their last milestone rate indefinitely. The only way to stop is a global pause or setting the last milestone's `projectFeeBps` to 0 at registration time (which eliminates the incentive to verify the last milestone).

**Recommendation:** Consider adding an owner/recipient function to close a project (set fee to 0), or add a `postCompletionFeeBps` field. Alternatively, document that projects should set their last milestone fee to the desired long-term rate.

---

## SUMMARY TABLE

| ID | Severity | Title |
|----|----------|-------|
| V-1 | MEDIUM | Loyalty discounts track router address, not end user |
| V-2 | LOW | EAS attestation expirationTime not checked |
| V-3 | LOW | ERC20 donate() silently traps ETH sent alongside |
| V-4 | INFORMATIONAL | donate() does not credit contributions |
| V-5 | INFORMATIONAL | LP skim applies regardless of milestone state |
| V-6 | INFORMATIONAL | nonReentrant uses misleading Paused error |
| V-7 | INFORMATIONAL | No per-project pause or deregistration |
| V-8 | INFORMATIONAL | No fee graduation after all milestones verified |

---

## AREAS WITH NO ISSUES FOUND

- **afterSwap delta math:** Fee calculation, casting chain, and overflow guard are all correct.
- **LP skim casting:** The int128/uint128 conversions in `_skimLpFees` are safe because the skim is always <= 50% of the original positive int128 value.
- **CEI pattern in withdraw():** Balance is zeroed before external transfer. Reentrancy guard is redundant but present.
- **Access control matrix:** All 18 state-mutating functions have appropriate access controls. No privilege escalation paths found.
- **Two-step ownership transfer:** Correctly implemented with pendingOwner pattern.
- **SafeERC20 usage:** Correctly applied in donate() with fee-on-transfer handling.
- **Milestone sequential enforcement:** All three verification paths correctly enforce `milestoneIndex == currentMilestone`.
- **Template system:** No collision or overwrite risks. Sequential IDs are correctly assigned.
- **Hook permissions flags:** Match the implemented callbacks. Unused callbacks correctly revert.
