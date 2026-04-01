# ImpactHook

**Automatically turns trading volume into verified, milestone-gated public goods funding.**

ImpactHook is a Uniswap v4 hook that creates a new category of liquidity pool where fees are programmatically routed to verified impact projects. Pools are differentiated not just by token pair or fee tier, but by the real-world outcome they fund: DeSci research, open-source infrastructure, climate action, education.

Juan Benet has long advocated for chains to donate a percentage of fees to open source, DeSci, and public goods. ImpactHook makes this vision practical: instead of requiring protocol-level changes or political consensus, normal DeFi activity becomes continuous, verified public goods funding through a single Uniswap v4 hook. Traders self-select into impact-aligned venues. LPs provide liquidity knowing their yield serves a purpose beyond returns. The result is a new DeFi primitive that turns trading volume into measurable social impact.

**Five funding channels. Three verification paths. All milestone-gated.**

## What's Novel

Most fee-charging hooks make pools less competitive for routing - aggregators skip them for cheaper alternatives. ImpactHook solves this with the **LP fee skim model**: a configurable percentage of LP earnings funds the project, while swap pricing stays identical to regular pools. Routers have no reason to skip it. LPs opt in. Swappers don't pay extra. Impact happens as a byproduct of normal DeFi activity.

**Key features:**
- **5 funding channels**: swap fees, LP fee skim, native v4 donate skim, direct donations, and institutional grant escrow via [Arkhai's](https://github.com/arkhai-io/alkahest) Zellic-audited Alkahest protocol - all gated by the same milestones
- **3 verification paths**: direct (EOA/multisig), Reactive Network cross-chain, and [EAS](https://attest.org) attestations with a custom schema for third-party milestone verification
- **Heartbeat expiration**: projects must prove they're still alive or fees stop automatically
- **Loyalty discounts**: repeat contributors earn reduced swap fees
- **Behavior-customizable templates**: templates define LP skim rates, donate skim rates, heartbeat intervals, and swap fee mode per project type
- **On-chain registry**: project metadata stored on-chain for frontend discovery
- **Per-project pause**: stop one project without affecting others

## Why This Matters

$2.5 trillion in daily crypto trading volume generates zero social impact. Meanwhile, DeSci researchers wait months for grant disbursements, open-source maintainers go unpaid, and public goods funding remains opaque and slow. Donors can't verify outcomes. Intermediaries take cuts.

ImpactHook connects these two worlds:
- **Continuous public goods funding**: Every swap and LP fee collection generates funding for DeSci, open source, and public goods - not once-a-year grants
- **Milestone-gated accountability**: No results, no funding. Verification happens onchain before fees release
- **Router-competitive**: LP skim model keeps swap pricing identical to regular pools
- **Cross-chain**: Milestones can be verified from any supported chain via Reactive Network
- **Institutional escrow**: Arkhai's Alkahest protocol enables milestone-gated grant escrow, with `MilestoneArbiter` reading onchain milestone state to gate release
- **Attestation-based verification**: EAS integration enables third-party verifiers to attest to milestone completion, adding an independent accountability layer
- **Self-enforcing**: Heartbeat expiration auto-stops dead projects

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
| `ImpactSwapRouter.sol` | Simple swap router for impact pools. Users approve once, then swap with slippage protection. Handles afterSwapReturnDelta (hook fees) internally. |

### Multiple Funding Channels, One Source of Truth

1. **Swap fees** (DeFi-native): The hook charges a small fee on swap output via `afterSwapReturnDelta`. Continuous funding from trading activity.

2. **LP fee skim**: A configurable percentage of LP fees is routed to the project when LPs collect earnings. Swap pricing stays competitive for router aggregation.

3. **Native v4 donate skim**: When someone tips LPs via `PoolManager.donate()`, a percentage is routed to the project via `afterDonate`.

4. **Direct donations**: Anyone can donate ERC20 or native ETH directly to a project's fund.

5. **Grant escrow** (institutional): Integration with [Arkhai's Alkahest](https://github.com/arkhai-io/alkahest) (Zellic-audited) escrow protocol. `MilestoneArbiter` implements Alkahest's `IArbiter` interface, reading milestone state directly from the hook to gate escrow release. This enables traditional grant-makers and institutions to fund DeSci and public goods projects with the same milestone accountability as DeFi-native channels.

All channels are gated by the same onchain milestone state, heartbeat expiration, and per-project pause controls. Milestone verification supports three paths: direct verification (EOA/multisig), cross-chain via Reactive Network, and [EAS](https://attest.org) attestations using a custom schema that enables independent third-party verification.

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
| **Arkhai (Alkahest)** | Milestone-gated escrow via `IArbiter` integration. Zellic-audited escrow protocol gates grant release on onchain milestone state. | `src/MilestoneArbiter.sol` |
| **Hypercerts** | Verified milestones mint Hypercerts on Ethereum, creating composable impact records in the public goods funding ecosystem | `frontend/lib/hypercerts.ts`, `frontend/app/milestones/page.tsx` |
| **Storacha (Filecoin/IPFS)** | Milestone evidence (reports, images, data) uploaded to decentralized storage via Storacha. CIDs embedded in EAS attestations and Hypercert metadata. | `frontend/app/api/upload/route.ts`, `frontend/components/EvidenceUpload.tsx` |
| **EAS** | Custom attestation schema for independent third-party milestone verification on Unichain | `frontend/app/milestones/page.tsx`, `src/ImpactHook.sol` |

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

### Behavior-Customizable Templates

Templates define not just milestones but how the pool behaves per project type:

```
hook.createTemplate(
    "Emergency Relief",
    descriptions, feeBpsValues,
    2000,   // 20% LP skim
    0,      // no donate skim
    7 days, // 7-day heartbeat (must prove alive weekly)
    false   // swap fees DISABLED (LP-skim-only, maximally router-competitive)
);
```

Example configurations:
| Template | LP Skim | Heartbeat | Swap Fees | Use Case |
|----------|---------|-----------|-----------|----------|
| Climate | 10% | 30 days | Enabled | Long-term environmental projects |
| Emergency Relief | 20% | 7 days | Disabled | Fast-moving crisis response, router-competitive |
| Open Source | 0% | None | Enabled | Traditional swap-fee-funded dev grants |

### LP Fee Skim (Dual Funding Model)

Pools can be configured with an LP fee skim - a percentage of LP fees that is routed to the impact project when LPs collect their earnings. This creates a second funding model where **swappers pay no extra fee** and pricing is identical to regular pools, keeping the pool competitive for router aggregation. LPs earn slightly less but opted into the pool knowing the deal.

Both models can be active on the same pool:
- **Swap fee** (via `afterSwapReturnDelta`): fee on swapper output, configurable per milestone
- **LP skim** (via `afterAddLiquidity`/`afterRemoveLiquidity` return deltas): percentage of LP fees, configurable per pool (max 50%)

The LP skim makes impact pools viable even in a fully agentic routing environment where aggregators optimize purely on price.

## Quick Start

```shell
forge test         # 167 tests, all passing
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

167 tests covering: project registration, swap fee accumulation (both directions), LP fee skimming, milestone verification (direct, Reactive, EAS), fee progression, withdrawal, direct donations, impact contribution tracking, loyalty fee discounts, project templates, access control, Reactive Network callbacks, MilestoneOracle, MilestoneReactor, MilestoneArbiter (Alkahest), EAS attestation verification, end-to-end cross-chain flow, and fuzz testing.


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
| ImpactHook | Unichain Sepolia | `0xD178A9caEB1AA3EB89363E035e288433CD002557` |
| MilestoneArbiter | Unichain Sepolia | `0xEf78e662F587C3193dfD22853dd039F258C6537A` |
| MilestoneOracle | Ethereum Sepolia | `0xDd5c349fb1dcc3Daf60cC7a5ff73175ef9567cBc` |
| MilestoneReactor | Reactive Lasna | `0x19D5bfa64Ff4992e917FC627B246eBdDf6A7d872` |
| ImpactSwapRouter | Unichain Sepolia | `0x66452162B01442d92fc77d607EE2Cff3e76043c2` |

EAS Schema UID: `0xe4614a0cea117a9a198431d54972835ab8d84b8d6e3d18e482032377af9bfb52`

## Key Addresses (Unichain Sepolia)

| Contract | Address |
|----------|---------|
| PoolManager | `0x00B036B58a818B1BC34d502D3fE730Db729e62AC` |
| Callback Proxy | `0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4` |
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

## Hackathon Changelog (PL Genesis, Feb 10 - Apr 1 2026)

Everything in this repo was built from scratch during the hackathon window. Repo created March 2, 2026.

- **Core hook** (`ImpactHook.sol`): 7 callbacks, fee routing via `afterSwapReturnDelta`, LP fee skim, donate skim, milestone tracking, loyalty discounts, project templates, heartbeat expiration, per-project pause, onchain registry
- **ImpactSwapRouter**: custom swap router with slippage protection for impact pools
- **MilestoneArbiter**: Alkahest `IArbiter` integration for milestone-gated grant escrow
- **MilestoneOracle + MilestoneReactor**: Reactive Network cross-chain milestone verification
- **EAS integration**: custom attestation schema for third-party milestone verification
- **Hypercerts integration**: mint composable impact records on Ethereum when milestones are verified, with project metadata and evidence CIDs auto-populated from onchain state
- **Storacha integration**: upload milestone evidence (reports, images, data) to Filecoin/IPFS, CIDs stored onchain via `setMilestoneEvidence()` and embedded in Hypercert metadata and EAS attestations
- **Filecoin Pin integration**: alternative decentralized storage backend via Filecoin Calibration network
- **Onchain evidence persistence**: `milestoneEvidence` mapping + `EvidenceAttached` event for permanent, queryable evidence records
- **167 tests**: comprehensive coverage including evidence storage, access control, and fuzz tests
- **Full Next.js frontend**: swap, donate, milestones, withdraw, create, portfolio, dashboard, impact, technical pages
- **Deployed**: Unichain Sepolia (hook, router, arbiter), Ethereum Sepolia (oracle, Hypercerts), Reactive Lasna (reactor)

## License

MIT
