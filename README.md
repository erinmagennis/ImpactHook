# ImpactHook

A Uniswap v4 hook that turns any swap pool into a milestone-gated funding mechanism for real-world impact projects.

Traders swap normally. The hook routes a small fee (1-5%) from swap output to registered projects. As projects hit verified milestones, the fee tier adjusts — creating performance-based funding powered by trading activity.

**LPs earn full yield. Swappers choose impact. Projects get funded based on milestones.**

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

### Contracts

| Contract | Description |
|----------|-------------|
| `ImpactHook.sol` | Core Uniswap v4 hook — fee routing, milestone tracking, withdrawal |
| `MilestoneArbiter.sol` | Alkahest IArbiter — gates escrow release on milestone verification |

### Two Funding Channels, One Source of Truth

1. **Swap fees** (DeFi-native): The hook charges a small fee on swap output via `afterSwapReturnDelta`. Continuous funding from trading activity.

2. **Grant escrow** (institutional): Integration with [Alkahest](https://github.com/arkhai-io/alkahest) (Zellic-audited) escrow. `MilestoneArbiter` reads milestone state from the hook to gate escrow release.

Both channels are gated by the same on-chain milestone state.

### Cross-Chain Milestone Verification

The hook supports [Reactive Network](https://reactive.network) callbacks for cross-chain milestone verification. An RSC on Reactive Network can subscribe to `MilestoneSubmitted` events on any origin chain and trigger `verifyMilestoneReactive()` on the hook.

## Partner Integrations

| Partner | Integration | Location |
|---------|-------------|----------|
| **Uniswap Foundation** | Novel v4 hook with dynamic milestone-gated fee routing via `afterSwapReturnDelta` | `src/ImpactHook.sol` |
| **Unichain** | Deployed on Unichain (OP Stack L2). EAS available as predeploy for attestations. | All contracts |
| **Reactive Network** | Cross-chain milestone verification via RSC → `verifyMilestoneReactive()` callback | `src/ImpactHook.sol:verifyMilestoneReactive()` |
| **Arkhai (Alkahest)** | Milestone-gated escrow via `IArbiter` integration | `src/MilestoneArbiter.sol` |

## Fee Model

The hook charges a fee **on top of** the standard LP fee, taken from the swapper's output:

- LP yield is **unaffected** — no reason not to LP in impact pools
- Fee rate is determined by the current verified milestone's `projectFeeBps`
- Maximum fee capped at 500 bps (5%)
- Before any milestones are verified, the fee is 0

Example progression:
| Milestone | Status | Fee |
|-----------|--------|-----|
| 0: "Project registered" | Verified | 0% |
| 1: "Phase 1 complete" | Verified | 2% |
| 2: "Phase 2 complete" | Not yet | — |
| 3: "Self-sustaining" | Not yet | — |

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

22 tests covering: project registration, swap fee accumulation, milestone verification, fee progression, withdrawal, access control, Reactive Network callbacks, and fuzz testing.

### Deploy

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
