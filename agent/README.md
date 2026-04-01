# Impact Accountability Agent

Autonomous AI agent that monitors, evaluates, and verifies impact project milestones on ImpactHook. Retrieves evidence from decentralized storage (Storacha/IPFS), analyzes it using Claude, stores verification reports on Filecoin, and submits onchain verification transactions.

## Architecture

```
EvidenceAttached event (Unichain Sepolia)
  → Agent fetches evidence from Storacha/IPFS
    → Claude analyzes evidence vs milestone criteria
      → Verification report stored on Filecoin (Calibration)
        → Agent memory saved to Storacha
          → verifyMilestone() submitted onchain (if approved + confident)
```

### Storage

| Data | Storage | Purpose |
|------|---------|---------|
| Agent memory (state, past verifications) | Storacha (IPFS) | Persistent across sessions |
| Verification reports | Filecoin Pin (Calibration) | Permanent, verifiable audit trail |
| Execution logs | Filecoin Pin (Calibration) | Flushed on shutdown |
| Evidence CIDs | Onchain (ImpactHook contract) | Already stored by project |

### Integration with ImpactHook

The agent plugs into the existing ImpactHook contract without modifications:

- **As verifier**: Set the agent's wallet as a project's `verifier` address via `registerProject()`
- **Event monitoring**: Watches `EvidenceAttached` events for new evidence uploads
- **Verification**: Calls `verifyMilestone()` when evidence is approved with sufficient confidence
- **Alkahest/Arkhai**: When the agent verifies a milestone, `MilestoneArbiter.checkObligation()` returns true, releasing any gated escrow funds

## Setup

```bash
cd agent
bun install
cp .env.example .env
# Fill in .env with your credentials
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AGENT_PRIVATE_KEY` | Agent wallet private key (must be set as verifier for target projects) |
| `ANTHROPIC_API_KEY` | Claude API key for evidence analysis |
| `STORACHA_KEY` | Storacha Ed25519 key (for persistent memory) |
| `STORACHA_PROOF` | Storacha space delegation proof |
| `FILECOIN_PRIVATE_KEY` | Filecoin wallet key (for storing reports on Calibration) |

## Usage

### Dry run (analyze without submitting transactions)

```bash
bun agent.ts --dry-run
```

Monitors all registered pools, fetches evidence, runs Claude analysis, stores reports, but does not submit any onchain transactions.

### Live mode

```bash
bun agent.ts
```

Only monitors pools where this agent is the assigned verifier. Automatically submits `verifyMilestone()` when evidence is approved with confidence >= 70%.

### Demo flow

1. Register a project with the agent's wallet as verifier (via frontend or forge script)
2. Upload milestone evidence via the frontend's evidence upload
3. Run the agent: `bun agent.ts --dry-run`
4. Watch the agent detect the evidence, fetch it, analyze it, and produce a report

## File Structure

```
agent/
  agent.ts              Main entry point (event loop, orchestration)
  agent.json            Capability manifest (EF Agent track)
  package.json          Dependencies
  .env.example          Environment variable template
  lib/
    chain.ts            Viem clients, contract ABIs, Unichain Sepolia config
    evidence.ts         Fetch evidence from Storacha/IPFS gateways
    analyzer.ts         Claude API evidence analysis (vision + text + PDF)
    memory.ts           Storacha-backed persistent agent state
    reporter.ts         Filecoin Pin verification report storage
    logger.ts           Structured execution logs (Filecoin or local fallback)
```

## How Analysis Works

The agent sends milestone criteria and evidence to Claude for evaluation:

- **Images**: Analyzed using Claude's vision capability
- **PDFs**: Sent as document content
- **Text/JSON/CSV**: Sent as text (truncated to 50K chars)
- **Other**: Logged as binary, limited analysis

Claude returns a structured assessment:
- `approved`: Whether the evidence meets the milestone criteria
- `confidence`: 0-100 score
- `reasoning`: Explanation of the decision
- `criteriaMatch`: Per-criterion breakdown

The agent only auto-verifies when `approved = true` AND `confidence >= 70%`. Below that threshold, it stores the report but defers to human review.

## Guardrails

- **Confidence threshold**: Only auto-verifies at >= 70% confidence
- **Dry run mode**: Full analysis pipeline without onchain transactions
- **Budget awareness**: Configurable max Claude calls per hour
- **Error recovery**: Continues polling after individual failures
- **Graceful shutdown**: Flushes execution logs on SIGINT/SIGTERM
