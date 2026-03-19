# ImpactHook

**Asset-class specific liquidity for real-world impact.**

ImpactHook is a Uniswap v4 hook that creates a new category of liquidity pool where swap fees are programmatically routed to verified impact projects. Pools are differentiated not just by token pair or fee tier, but by the real-world outcome they fund - clean water, climate research, school meals, open-source infrastructure.

This is asset-class specific liquidity: pools with distinct characteristics shaped by milestone-gated funding, cross-chain verification, and performance-based fee progression. Traders self-select into impact-aligned venues. LPs provide liquidity knowing their pools serve a purpose beyond yield. The result is a new DeFi primitive that turns trading volume into measurable social impact.

**LPs earn full yield. Traders choose their impact. Projects get funded when milestones are proven on-chain.**

## Why This Matters

$2.5 trillion in daily crypto trading volume generates zero social impact. Meanwhile, traditional impact funding is opaque and slow - grant recipients wait months for disbursement, donors can't verify outcomes, and intermediaries take cuts.

ImpactHook connects these two worlds:
- **Continuous funding**: Every swap generates fees, not once-a-year grants
- **Milestone-gated**: No results, no funding. Verification happens on-chain before fees release
- **Dual-channel**: DeFi swap fees and institutional escrow share the same source of truth
- **Cross-chain**: Milestones can be verified from any supported chain via Reactive Network
- **Permissionless**: Anyone can create an impact pool for any cause. No gatekeepers

## How It Works

```
Swap happens → afterSwap() takes fee based on current milestone tier
                    ↓
Fee accumulates in contract per pool per currency
                    ↓
Verifier confirms milestone → fee tier adjusts for future swaps
                    ↓
Project recipient withdraws accumulated fees
```

Each pool has a `Project` config with:
- **Recipient**: address that receives accumulated fees
- **Verifier**: address authorized to verify milestones (EOA, multisig, or Reactive Network RSC)
- **Milestones**: ordered list with descriptions and fee tiers (in bps)

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        ImpactHook.sol                            │
│  afterSwap() fee routing · milestone tracking · withdrawal       │
│  verifyMilestoneReactive() cross-chain callback handler          │
└──────┬────────────────────────┬──────────────────────┬───────────┘
       │                        │                      │
       ▼                        ▼                      ▼
┌──────────────┐  ┌─────────────────────┐  ┌────────────────────┐
│ MilestoneArbiter│  │  MilestoneReactor   │  │  MilestoneOracle   │
│ (Alkahest escrow)│  │  (Reactive Network) │  │  (Origin chain)    │
│ IArbiter gate   │  │  RSC: subscribes to │  │  Emits Milestone-  │
│ on milestones   │  │  origin events,     │  │  Submitted events  │
└──────────────┘  │  emits Callbacks     │  │  for cross-chain   │
                  └─────────────────────┘  │  verification       │
                                           └────────────────────┘
```

### Contracts

| Contract | Description |
|----------|-------------|
| `ImpactHook.sol` | Core Uniswap v4 hook - swap fee routing, LP fee skim, afterDonate skim, milestone tracking, loyalty discounts, project templates, heartbeat expiration, per-project pause, on-chain project registry |
| `MilestoneArbiter.sol` | Alkahest IArbiter - gates escrow release on milestone verification |
| `MilestoneReactor.sol` | Reactive Network RSC - subscribes to origin chain events, emits cross-chain callbacks |
| `MilestoneOracle.sol` | Origin chain event emitter - milestone submissions trigger the cross-chain flow |

### Multiple Funding Channels, One Source of Truth

1. **Swap fees** (DeFi-native): The hook charges a small fee on swap output via `afterSwapReturnDelta`. Continuous funding from trading activity.

2. **LP fee skim**: A configurable percentage of LP fees is routed to the project when LPs collect earnings. Swap pricing stays competitive for router aggregation.

3. **Native v4 donate skim**: When someone tips LPs via `PoolManager.donate()`, a percentage is routed to the project via `afterDonate`.

4. **Direct donations**: Anyone can donate ERC20 or native ETH directly to a project's fund.

5. **Grant escrow** (institutional): Integration with [Alkahest](https://github.com/arkhai-io/alkahest) (Zellic-audited) escrow. `MilestoneArbiter` reads milestone state from the hook to gate escrow release.

All channels are gated by the same on-chain milestone state, heartbeat expiration, and per-project pause controls.

### Cross-Chain Milestone Verification

```
Origin Chain              Reactive Network           Destination Chain
(any supported)           (ReactVM)                  (Unichain)

MilestoneOracle    ──→    MilestoneReactor    ──→    ImpactHook
  emits event              subscribes &               verifyMilestoneReactive()
  MilestoneSubmitted       emits Callback             updates milestone state
```

The hook supports [Reactive Network](https://reactive.network) callbacks for cross-chain milestone verification. `MilestoneReactor` (deployed on Reactive Network) subscribes to `MilestoneSubmitted` events from `MilestoneOracle` on any origin chain and triggers `verifyMilestoneReactive()` on the hook via the chain's Callback Proxy.

Authorization: the Reactive Network overwrites the first callback argument with the ReactVM ID. The hook checks `msg.sender == callbackProxy` and `rvmId == project.verifier`.

## Partner Integrations

| Partner | Integration | Location |
|---------|-------------|----------|
| **Uniswap Foundation** | Novel v4 hook creating asset-class specific liquidity via milestone-gated fee routing (`afterSwapReturnDelta`) | `src/ImpactHook.sol` |
| **Unichain** | Deployed on Unichain Sepolia (OP Stack L2). EAS attestations for milestone verification. | All contracts |
| **Reactive Network** | Cross-chain milestone verification: `MilestoneOracle` → `MilestoneReactor` RSC → `verifyMilestoneReactive()` | `src/MilestoneOracle.sol`, `src/MilestoneReactor.sol`, `src/ImpactHook.sol` |
| **Arkhai (Alkahest)** | Milestone-gated escrow via `IArbiter` integration | `src/MilestoneArbiter.sol` |

## Fee Model

The hook charges a fee **on top of** the standard LP fee, taken from the swapper's output:

- LP yield is **unaffected** - no reason not to LP in impact pools
- Fee rate is determined by the current verified milestone's `projectFeeBps`
- Maximum fee capped at 500 bps (5%)
- Before any milestones are verified, the fee is 0
- Permissionless project registration - anyone can create an impact pool
- **Loyalty discounts** reward repeat contributors with reduced fees
- **LP fee skim** option: a configurable percentage of LP fees funds the project, keeping swap pricing competitive for router aggregation

Example progression:
| Milestone | Status | Fee |
|-----------|--------|-----|
| 0: "Project registered" | Verified | 0% |
| 1: "Phase 1 complete" | Verified | 2% |
| 2: "Phase 2 complete" | Not yet | - |
| 3: "Self-sustaining" | Not yet | - |

### Impact Tracking & Loyalty Discounts

Every swap that generates a fee is tracked per address. The hook maintains:
- **Per-pool contributions**: how much each address has contributed to each project
- **Global contributions**: cumulative contributions across all pools

Pool owners can configure **loyalty discount tiers** that reward repeat contributors:

| Cumulative Contribution | Discount |
|------------------------|----------|
| > 0.1 ETH | 5% off fees |
| > 1 ETH | 10% off fees |
| > 10 ETH | 20% off fees |

This creates a retention flywheel: swappers are incentivized to keep trading through the same impact pool to unlock better rates, addressing the [vampire/fork risk](https://twitter.com/saucepoint/status/1744385686621372723) inherent in hook fees.

### Project Templates

Predefined milestone configurations make it easy to create impact pools for common use cases:

```
hook.createTemplate("Climate", descriptions, feeBpsValues);
hook.registerProjectFromTemplate(poolKey, recipient, verifier, templateId);
```

Templates standardize fee progressions and milestone structures for categories like climate, education, health, and open-source infrastructure - making the hook a reusable framework for any impact vertical.

### LP Fee Skim (Dual Funding Model)

Pools can be configured with an LP fee skim - a percentage of LP fees that is routed to the impact project when LPs collect their earnings. This creates a second funding model where **swappers pay no extra fee** and pricing is identical to regular pools, keeping the pool competitive for router aggregation. LPs earn slightly less but opted into the pool knowing the deal.

Both models can be active on the same pool:
- **Swap fee** (via `afterSwapReturnDelta`): fee on swapper output, configurable per milestone
- **LP skim** (via `afterAddLiquidity`/`afterRemoveLiquidity` return deltas): percentage of LP fees, configurable per pool (max 50%)

The LP skim makes impact pools viable even in a fully agentic routing environment where aggregators optimize purely on price.

## Quick Start

```shell
forge test         # 155 tests, all passing
forge coverage     # 94%+ line coverage on core hook, 100% on supporting contracts
```

Frontend (live at [impacthook.vercel.app](https://impacthook.vercel.app)):
```shell
cd frontend && bun install && bun run dev
```

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

155 tests covering: project registration, swap fee accumulation (both directions), LP fee skimming, milestone verification (direct, Reactive, EAS), fee progression, withdrawal, direct donations, impact contribution tracking, loyalty fee discounts, project templates, access control, Reactive Network callbacks, MilestoneOracle, MilestoneReactor, MilestoneArbiter (Alkahest), EAS attestation verification, end-to-end cross-chain flow, and fuzz testing.


### Deploy (Unichain Sepolia)

```shell
forge script script/DeployHook.s.sol:DeployHookScript \
  --rpc-url https://sepolia.unichain.org \
  --private-key <key> \
  --broadcast
```

The deployment script mines a CREATE2 salt to produce a hook address with the correct permission flags (`beforeInitialize`, `afterSwap`, `afterSwapReturnDelta`).

## Deployed Contracts

| Contract | Chain | Address |
|----------|-------|---------|
| ImpactHook | Unichain Sepolia | `0x2caDc1E168F99e70a228A154733c6AE129982557` |
| MilestoneArbiter | Unichain Sepolia | `0x4C4e3C8cC92b02192E885285D6a17519626d9468` |
| MilestoneOracle | Ethereum Sepolia | `0x9845d22Fbb33f30E241824aCB1813c041291A4Ca` |
| MilestoneReactor | Reactive Lasna | `0x4CB877dee81E9e68533FFaf8495Ce9bCdc9518a4` |

EAS Schema UID: `0xe4614a0cea117a9a198431d54972835ab8d84b8d6e3d18e482032377af9bfb52`

## Key Addresses (Unichain Sepolia)

| Contract | Address |
|----------|---------|
| PoolManager | `0x1F98400000000000000000000000000000000004` |
| Callback Proxy | `0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4` |
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

## License

MIT
