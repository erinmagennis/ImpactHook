# ImpactHook

A Uniswap v4 hook that turns any swap pool into a milestone-gated funding mechanism for real-world impact projects.

Traders swap normally. The hook routes a small fee (1-5%) from swap output to registered projects. As projects hit verified milestones, the fee tier adjusts - creating performance-based funding powered by trading activity.

**LPs earn full yield. Swappers choose impact. Projects get funded based on milestones.**

## Why This Matters

Traditional impact funding is opaque and slow. Grant recipients wait months for disbursement. Donors can't verify outcomes. Intermediaries take cuts.

ImpactHook makes funding **continuous, transparent, and performance-based**:
- Every fee is an on-chain transaction anyone can verify
- Milestone verification gates funding progression - no results, no fees
- Two independent funding channels (DeFi swap fees + institutional escrow) share the same source of truth
- Cross-chain verification means milestones can be confirmed from any supported chain

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
| `ImpactHook.sol` | Core Uniswap v4 hook - fee routing, milestone tracking, withdrawal, cross-chain callback handler |
| `MilestoneArbiter.sol` | Alkahest IArbiter - gates escrow release on milestone verification |
| `MilestoneReactor.sol` | Reactive Network RSC - subscribes to origin chain events, emits cross-chain callbacks |
| `MilestoneOracle.sol` | Origin chain event emitter - milestone submissions trigger the cross-chain flow |

### Two Funding Channels, One Source of Truth

1. **Swap fees** (DeFi-native): The hook charges a small fee on swap output via `afterSwapReturnDelta`. Continuous funding from trading activity.

2. **Grant escrow** (institutional): Integration with [Alkahest](https://github.com/arkhai-io/alkahest) (Zellic-audited) escrow. `MilestoneArbiter` reads milestone state from the hook to gate escrow release.

Both channels are gated by the same on-chain milestone state.

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
| **Uniswap Foundation** | Novel v4 hook with dynamic milestone-gated fee routing via `afterSwapReturnDelta` | `src/ImpactHook.sol` |
| **Unichain** | Targets Unichain Sepolia (OP Stack L2). EAS available as predeploy. | All contracts |
| **Reactive Network** | Cross-chain milestone verification: `MilestoneOracle` → `MilestoneReactor` RSC → `verifyMilestoneReactive()` | `src/MilestoneOracle.sol`, `src/MilestoneReactor.sol`, `src/ImpactHook.sol` |
| **Arkhai (Alkahest)** | Milestone-gated escrow via `IArbiter` integration | `src/MilestoneArbiter.sol` |

## Fee Model

The hook charges a fee **on top of** the standard LP fee, taken from the swapper's output:

- LP yield is **unaffected** - no reason not to LP in impact pools
- Fee rate is determined by the current verified milestone's `projectFeeBps`
- Maximum fee capped at 500 bps (5%)
- Before any milestones are verified, the fee is 0
- Permissionless project registration - anyone can create an impact pool

Example progression:
| Milestone | Status | Fee |
|-----------|--------|-----|
| 0: "Project registered" | Verified | 0% |
| 1: "Phase 1 complete" | Verified | 2% |
| 2: "Phase 2 complete" | Not yet | - |
| 3: "Self-sustaining" | Not yet | - |

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

39 tests covering: project registration, swap fee accumulation (both directions), milestone verification, fee progression, withdrawal, access control, Reactive Network callbacks, MilestoneOracle, MilestoneReactor, MilestoneArbiter (Alkahest), end-to-end cross-chain flow, and fuzz testing.

### Deploy (Unichain Sepolia)

```shell
forge script script/DeployHook.s.sol:DeployHookScript \
  --rpc-url https://sepolia.unichain.org \
  --private-key <key> \
  --broadcast
```

The deployment script mines a CREATE2 salt to produce a hook address with the correct permission flags (`beforeInitialize`, `afterSwap`, `afterSwapReturnDelta`).

## Key Addresses (Unichain Sepolia)

| Contract | Address |
|----------|---------|
| PoolManager | `0x1F98400000000000000000000000000000000004` |
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

## License

MIT
