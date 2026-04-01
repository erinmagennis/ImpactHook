"use client";

import Link from "next/link";
import { Navigation } from "../../components/Navigation";
import {
  HOOK_ADDRESS,
  ARBITER_ADDRESS,
  ORACLE_ADDRESS,
  REACTOR_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  POOL_MANAGER_ADDRESS,
  CALLBACK_PROXY_ADDRESS,
  EAS_ADDRESS,
  SCHEMA_REGISTRY,
  MILESTONE_SCHEMA_UID,
} from "../../lib/contracts";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const MILESTONES = [
  { index: 0, name: "Project registered", feeBps: 0, verified: true },
  { index: 1, name: "Phase 1 complete", feeBps: 200, verified: true },
  { index: 2, name: "Phase 2 complete", feeBps: 300, verified: false },
  { index: 3, name: "Self-sustaining", feeBps: 100, verified: false },
];

export default function TechnicalPage() {
  const currentMilestoneIdx = MILESTONES.findIndex(m => !m.verified);
  const progress = (MILESTONES.filter(m => m.verified).length / MILESTONES.length) * 100;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-article" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead">Technical Deep Dive</div>
          <h1 className="heading-xl mt-3 mb-4" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)" }}>
            Architecture
          </h1>
          <p className="text-body" style={{ maxWidth: 640, lineHeight: 1.7 }}>
            A Uniswap v4 hook that creates impact-differentiated liquidity via milestone-gated
            fee routing. Seven hook callbacks, five funding channels, five contracts across three chains,
            and an autonomous AI verification agent.
          </p>
        </div>

        {/* Contracts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up delay-100" style={{ marginBottom: 48 }}>
          <ContractCard name="ImpactHook.sol" role="Core Hook" description="afterSwap fee routing, LP fee skim via afterAddLiquidity, donate skim via afterDonate, milestone tracking, 3 verification paths, loyalty discounts, heartbeat expiration, project templates" chain="Unichain Sepolia" address={HOOK_ADDRESS} accent="cyan" />
          <ContractCard name="MilestoneArbiter.sol" role="Alkahest Escrow Gate" description="Implements IArbiter from the Zellic-audited Alkahest escrow protocol. Gates grant release on verified milestone state from ImpactHook." chain="Unichain Sepolia" address={ARBITER_ADDRESS} accent="violet" />
          <ContractCard name="MilestoneReactor.sol" role="Reactive Network RSC" description="Subscribes to MilestoneSubmitted events on origin chain. Emits cross-chain callbacks to ImpactHook on Unichain. No bridges needed." chain="Reactive Lasna" address={REACTOR_ADDRESS} accent="emerald" />
          <ContractCard name="MilestoneOracle.sol" role="Origin Chain Event Source" description="Deployed on any supported origin chain. Emits MilestoneSubmitted events that Reactive Network relays to Unichain." chain="Ethereum Sepolia" address={ORACLE_ADDRESS} accent="amber" />
          <ContractCard name="ImpactSwapRouter.sol" role="Custom Swap Router" description="Clean swap(key, zeroForOne, amountIn, minAmountOut) interface with slippage protection. Handles afterSwapReturnDelta internally so callers don't need to." chain="Unichain Sepolia" address={SWAP_ROUTER_ADDRESS} accent="cyan" />
        </div>

        {/* Cross-chain flow */}
        <div className="card p-6 animate-fade-up delay-200" style={{ marginBottom: 48, overflowX: 'auto' }}>
          <div className="text-label" style={{ marginBottom: 16 }}>Cross-Chain Milestone Verification via Reactive Network</div>
          <pre className="font-data" style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre' }}>
{`Origin Chain              Reactive Network           Destination Chain
(any supported)           (ReactVM)                  (Unichain Sepolia)

MilestoneOracle    -->    MilestoneReactor    -->    ImpactHook
  emits event              subscribes &               verifyMilestoneReactive()
  MilestoneSubmitted       emits Callback             updates milestone state`}
          </pre>
          <p className="text-caption mt-4" style={{ lineHeight: 1.6 }}>
            Authorization: Reactive Network overwrites the first callback argument with the ReactVM ID.
            The hook checks <span className="font-data" style={{ color: 'var(--accent)' }}>msg.sender == callbackProxy</span> and{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>rvmId == project.verifier</span>.
          </p>
        </div>

        {/* Verification paths */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Three verification paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: 'var(--accent)' }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>Direct</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Verifier calls <span className="font-data" style={{ color: 'var(--accent)' }}>verifyMilestone()</span> directly on Unichain.
                Simple, gas-efficient. Works for EOAs, multisigs, DAOs, and AI agents.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: '#7c3aed' }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>Reactive Cross-Chain</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                MilestoneOracle on origin chain emits event. MilestoneReactor on Reactive Network
                subscribes and triggers <span className="font-data" style={{ color: '#7c3aed' }}>verifyMilestoneReactive()</span> on Unichain. No bridges.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>EAS Attestation</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Verifier creates an Ethereum Attestation Service attestation with evidence. Anyone can then
                call <span className="font-data" style={{ color: 'var(--success)' }}>verifyMilestoneEAS()</span> permissionlessly. Credibly neutral.
              </p>
            </div>
          </div>
        </div>

        {/* Hook callbacks */}
        <div className="animate-fade-up delay-400" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Hook callbacks</h2>
          <p className="text-caption mb-4" style={{ lineHeight: 1.6 }}>
            Seven Uniswap v4 hook callbacks:{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>beforeInitialize</span>,{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>afterSwap + afterSwapReturnDelta</span>,{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>afterAddLiquidity + afterAddLiquidityReturnDelta</span>,{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>afterRemoveLiquidity + afterRemoveLiquidityReturnDelta</span>,{' '}
            <span className="font-data" style={{ color: 'var(--accent)' }}>afterDonate</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="code-block" style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-3 text-caption">afterSwap() — Swap Fee Capture</span>
              </div>
              <pre style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
{`// Fee on TOP of LP fee — LPs earn full yield
uint16 feeBps = _getCurrentFeeBps(poolId);
uint256 feeAmount = (uint256(uint128(outputAmount))
    * feeBps) / 10_000;

// Take fee from pool manager
poolManager.take(feeCurrency, address(this), feeAmount);
accumulatedFees[poolId][feeCurrency] += feeAmount;

// Return delta — reduces swapper output
return (this.afterSwap.selector,
    int128(int256(feeAmount)));`}
              </pre>
            </div>
            <div className="code-block" style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-3 text-caption">afterAddLiquidity() — LP Fee Skim</span>
              </div>
              <pre style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
{`// LP collects fees -> hook skims a %
function afterAddLiquidity(
    ..., BalanceDelta feesAccrued, ...
) {
    return _skimLpFees(key, feesAccrued);
}

// Swap pricing stays identical
// Routers have no reason to skip this pool
// LPs opt in, swappers don't pay extra`}
              </pre>
            </div>
          </div>
        </div>

        {/* Fee model */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Fee model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-small" style={{ lineHeight: 1.7, margin: 0 }}>
                The hook charges a fee <strong style={{ color: 'var(--text-primary)' }}>on top of</strong> the
                standard Uniswap v4 LP fee via <span className="font-data" style={{ color: 'var(--accent)' }}>afterSwapReturnDelta</span>.
                LP yield is completely unaffected. Fee rate is determined by the current verified
                milestone&apos;s <span className="font-data" style={{ color: 'var(--accent)' }}>projectFeeBps</span>.
                Maximum capped at 5% (500 BPS).
              </p>
            </div>
            <div className="card p-5">
              <div className="text-label mb-4">Example progression</div>
              <div className="relative">
                <div className="absolute left-[11px] top-[12px] bottom-[12px] w-px"
                  style={{ background: `linear-gradient(180deg, var(--accent) 0%, var(--accent) ${progress}%, var(--border-subtle) ${progress}%)` }} />
                <div className="flex flex-col gap-4">
                  {MILESTONES.map((m, i) => {
                    const isActive = i === currentMilestoneIdx;
                    return (
                      <div key={m.index} className="flex items-center gap-4">
                        <div className={`milestone-node ${m.verified ? 'milestone-verified' : isActive ? 'milestone-verified' : 'milestone-pending'}`} style={{ width: 22, height: 22 }}>
                          {m.verified ? (
                            <span style={{ color: 'var(--accent)' }}><CheckIcon /></span>
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full" style={{ background: '#7c3aed' }} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} />
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <span style={{ fontSize: 12, color: m.verified ? 'var(--text-primary)' : 'var(--text-dim)' }}>{m.name}</span>
                          <span className="font-data" style={{ fontSize: 12, color: m.verified ? 'var(--text-secondary)' : 'var(--text-dim)' }}>{m.feeBps / 100}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LP Fee Skim */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">LP Fee Skim (Dual Funding Model)</h2>
          <div className="card p-6" style={{ marginBottom: 16 }}>
            <span className="badge badge-accent mb-4" style={{ display: "inline-flex" }}>Key Innovation</span>
            <p className="text-small" style={{ lineHeight: 1.7, marginBottom: 16 }}>
              Pools can skim a percentage of LP fees for the impact project via{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>afterAddLiquidity</span> and{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>afterRemoveLiquidity</span> return deltas.
              When LPs collect accrued fees, the hook transparently routes a configurable share to the project.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: "var(--radius-sm)" }}>
                <div className="text-label mb-2">How it works</div>
                <ul className="flex flex-col gap-2">
                  {[
                    "Swap pricing stays identical to regular pools",
                    "Routers have no reason to skip or avoid these pools",
                    "LPs opt in by providing liquidity to the pool",
                    "Swappers don't pay any extra fees",
                    "Configurable per pool, max 50% skim rate",
                  ].map(item => (
                    <li key={item} className="text-caption flex items-start gap-2">
                      <span style={{ color: 'var(--accent)', marginTop: 2 }}><CheckIcon /></span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: "var(--radius-sm)" }}>
                <div className="text-label mb-2">Why it matters</div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>
                  Traditional impact funding hooks add a swap fee that makes the pool uncompetitive for routers.
                  LP fee skimming funds impact projects without touching swap pricing at all. The pool looks identical
                  to any other v4 pool from the router&apos;s perspective, so it gets normal trade flow.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Native v4 Donate Skim */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Native v4 Donate Skim</h2>
          <div className="card p-5">
            <p className="text-small" style={{ lineHeight: 1.7, marginBottom: 16 }}>
              The <span className="font-data" style={{ color: 'var(--accent)' }}>afterDonate</span> hook intercepts{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>PoolManager.donate()</span> calls.
              When users tip LPs via the native v4 donate mechanism, a configurable percentage is routed to the impact project.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Gating", detail: "Same milestone verification" },
                { label: "Safety", detail: "Heartbeat and pause checks" },
                { label: "Config", detail: "donateSkimBps per template" },
              ].map(item => (
                <div key={item.label} className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: "var(--radius-sm)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>{item.label}</div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Accountability */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Safety and accountability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Heartbeat Expiration", desc: "Projects must send periodic proof-of-life transactions. If the heartbeat interval passes without a signal, fee collection stops automatically until the project proves it is still active." },
              { title: "Per-Project Pause", desc: "Any individual project can be paused without affecting other projects on the same hook. Paused projects stop accumulating fees immediately." },
              { title: "Sequential Milestones", desc: "Milestones must be verified in order. A project cannot skip ahead or verify out of sequence. Each milestone can only be verified once." },
              { title: "Checks-Effects-Interactions", desc: "All state-changing functions follow the checks-effects-interactions pattern. Static analysis with Slither confirms no reentrancy or state ordering issues." },
            ].map(item => (
              <div key={item.title} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot" style={{ background: 'var(--accent)' }} />
                  <span className="heading-sm" style={{ fontSize: 13 }}>{item.title}</span>
                </div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Behavior-customizable templates</h2>
          <div className="card p-5" style={{ overflowX: 'auto' }}>
            <p className="text-caption mb-4" style={{ lineHeight: 1.6 }}>
              Templates define <span className="font-data" style={{ color: 'var(--accent)' }}>lpSkimBps</span>,{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>donateSkimBps</span>,{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>heartbeatInterval</span>, and{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>swapFeeEnabled</span> per project type.
              One hook deployment serves different impact verticals with appropriate defaults.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {["Template", "LP Skim", "Heartbeat", "Swap Fees", "Use Case"].map(h => (
                    <th key={h} className="text-left text-caption pb-3" style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { template: "Climate", lpSkim: "10%", heartbeat: "30 days", swapFees: "Enabled", useCase: "Long-term environmental" },
                  { template: "Emergency Relief", lpSkim: "20%", heartbeat: "7 days", swapFees: "Disabled", useCase: "Crisis response, router-competitive" },
                  { template: "Open Source", lpSkim: "0%", heartbeat: "None", swapFees: "Enabled", useCase: "Traditional swap-fee dev grants" },
                ].map((row) => (
                  <tr key={row.template} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-3 font-data" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{row.template}</td>
                    <td className="py-3 font-data" style={{ fontSize: 12, color: 'var(--accent)' }}>{row.lpSkim}</td>
                    <td className="py-3" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.heartbeat}</td>
                    <td className="py-3" style={{ fontSize: 12, color: row.swapFees === 'Enabled' ? 'var(--success)' : 'var(--text-dim)' }}>{row.swapFees}</td>
                    <td className="py-3 text-caption">{row.useCase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence & Impact Records */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Evidence storage and impact records</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="heading-sm mb-2" style={{ fontSize: 13, color: '#3b82f6' }}>Storacha / Filecoin Pin</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Milestone evidence (reports, images, data) uploaded to Filecoin/IPFS via Storacha or Filecoin Pin.
                CIDs stored onchain via <span className="font-data" style={{ color: 'var(--accent)' }}>setMilestoneEvidence()</span>.
              </p>
            </div>
            <div className="card p-5">
              <div className="heading-sm mb-2" style={{ fontSize: 13, color: '#f97316' }}>Hypercerts</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Verified milestones mint Hypercerts on Ethereum, creating composable, tradeable impact certificates.
                Metadata auto-populated from onchain state: project name, milestone, contributors, evidence CIDs.
              </p>
            </div>
            <div className="card p-5">
              <div className="heading-sm mb-2" style={{ fontSize: 13, color: 'var(--accent)' }}>Triple persistence</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Evidence persists in three places: ImpactHook contract (Unichain), Hypercert metadata (Ethereum),
                and EAS attestation data (Unichain). Each independently verifiable.
              </p>
            </div>
          </div>
        </div>

        {/* AI Agent */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Autonomous verification agent</h2>
          <div className="card p-6 mb-4" style={{ borderLeft: '2px solid #3b82f6' }}>
            <span className="badge badge-accent mb-4" style={{ display: "inline-flex", background: "rgba(59,130,246,0.08)", color: "#3b82f6", borderColor: "rgba(59,130,246,0.2)" }}>AI-Powered Milestone Verification</span>
            <p className="text-small" style={{ lineHeight: 1.7, marginBottom: 16 }}>
              A standalone Bun service that monitors <span className="font-data" style={{ color: 'var(--accent)' }}>EvidenceAttached</span> events,
              retrieves evidence from Storacha/IPFS, analyzes it with Claude, and submits{' '}
              <span className="font-data" style={{ color: 'var(--accent)' }}>verifyMilestone()</span> when confidence exceeds the threshold.
              Reports stored permanently on Filecoin. Agent memory persists on Storacha across sessions.
            </p>
            <pre className="font-data" style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre', overflowX: 'auto' }}>
{`Evidence uploaded        Agent detects          Claude analyzes        Report stored
to Storacha/IPFS    -->  EvidenceAttached   -->  evidence vs         -->  on Filecoin Pin
                         event onchain          milestone criteria      (Calibration)
                                                      |
                                          confidence >= 70%?
                                           yes /        \\ no
                                              /          \\
                              verifyMilestone()    store report,
                              submitted onchain    defer to human`}
            </pre>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Storacha Memory", desc: "Agent state, past verifications, and project knowledge persist on Storacha. On restart, the agent loads its memory from the latest CID and resumes where it left off." },
              { title: "Filecoin Reports", desc: "Every verification produces a structured JSON report stored on Filecoin via Synapse SDK. Reports include per-criterion analysis, confidence scores, and reasoning." },
              { title: "Alkahest Integration", desc: "When the agent verifies a milestone, MilestoneArbiter.checkObligation() returns true, automatically releasing gated escrow funds. Fully autonomous funding cycle." },
              { title: "Guardrails", desc: "Confidence threshold gating (only auto-verifies above 70%), dry-run mode for analysis without onchain transactions, structured execution logs, budget-aware operation." },
            ].map(item => (
              <div key={item.title} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot" style={{ background: '#3b82f6' }} />
                  <span className="heading-sm" style={{ fontSize: 13 }}>{item.title}</span>
                </div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Test coverage */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: 'var(--success)' }}>Quality</div>
          <h2 className="heading-md mt-3 mb-6">Test coverage</h2>

          <div className="card p-6 mb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="stat-value" style={{ color: 'var(--success)' }}>174</div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>tests passing</div>
                <div className="text-caption">0 failed, 0 skipped</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TestGroup name="Core Hook" count={35} items={["Registration", "Fee routing (both dirs)", "Milestone progression", "Withdrawal", "Impact tracking", "LP fee skim"]} />
              <TestGroup name="Access & Safety" count={28} items={["Verifier auth", "Recipient auth", "Callback proxy", "Owner checks", "Heartbeat expiry", "Per-project pause"]} />
              <TestGroup name="Integrations" count={26} items={["MilestoneArbiter (3)", "Reactive callbacks (5)", "Oracle events (4)", "EAS verification (7)", "Evidence storage (7)"]} />
              <TestGroup name="Features & Fuzz" count={30} items={["Loyalty discounts (6)", "Templates (7)", "Donations (8)", "Fuzz tests", "HookMiner (7)", "Edge cases"]} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Contracts" value="5" />
            <StatCard label="Chains" value="3" />
            <StatCard label="Hook Callbacks" value="7" />
            <StatCard label="Funding Channels" value="5" />
          </div>
        </div>

        <div className="divider" />

        {/* Deployed contracts table */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Deployed contracts</h2>
          <div className="card p-5" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {["Contract", "Chain", "Address"].map(h => (
                    <th key={h} className="text-left text-caption pb-3" style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "ImpactHook", chain: "Unichain Sepolia", address: HOOK_ADDRESS },
                  { name: "MilestoneArbiter", chain: "Unichain Sepolia", address: ARBITER_ADDRESS },
                  { name: "MilestoneOracle", chain: "Ethereum Sepolia", address: ORACLE_ADDRESS },
                  { name: "MilestoneReactor", chain: "Reactive Lasna", address: REACTOR_ADDRESS },
                  { name: "ImpactSwapRouter", chain: "Unichain Sepolia", address: SWAP_ROUTER_ADDRESS },
                ].map((c) => (
                  <tr key={c.name} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-3" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td className="py-3 text-caption">{c.chain}</td>
                    <td className="py-3 font-data" style={{ fontSize: 11, color: 'var(--accent)' }}>{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-caption">EAS Schema UID</span>
              <span className="font-data" style={{ fontSize: 10, color: 'var(--accent)' }}>
                {MILESTONE_SCHEMA_UID}
              </span>
            </div>
          </div>
        </div>

        {/* Key addresses */}
        <div className="card p-5 animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-label mb-3">Key Addresses (Unichain Sepolia)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "PoolManager", address: POOL_MANAGER_ADDRESS },
              { label: "Callback Proxy", address: CALLBACK_PROXY_ADDRESS },
              { label: "EAS", address: EAS_ADDRESS },
              { label: "SchemaRegistry", address: SCHEMA_REGISTRY },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-caption">{item.label}</span>
                <span className="font-data" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{item.address}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 animate-fade-up">
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" className="btn-primary">
            View on GitHub
          </a>
          <Link href="/dashboard" className="btn-secondary">
            Launch App
          </Link>
        </div>
      </main>
    </div>
  );
}

function ContractCard({ name, role, description, chain, address, accent }: {
  name: string; role: string; description: string; chain: string; address: string;
  accent: 'cyan' | 'violet' | 'emerald' | 'amber';
}) {
  const accentColors = { cyan: 'var(--accent)', violet: '#7c3aed', emerald: 'var(--success)', amber: '#d97706' };
  return (
    <div className="card p-5" style={{ borderLeft: `2px solid ${accentColors[accent]}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-data" style={{ fontSize: 13, color: accentColors[accent] }}>{name}</span>
        <span className="badge badge-neutral" style={{ fontSize: 10, padding: "2px 8px" }}>{chain}</span>
      </div>
      <div className="text-label mb-2">{role}</div>
      <p className="text-caption mb-3" style={{ lineHeight: 1.6 }}>{description}</p>
      <div className="font-data" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{address}</div>
    </div>
  );
}

function TestGroup({ name, count, items }: { name: string; count: number; items: string[] }) {
  return (
    <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: "var(--radius-sm)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-data" style={{ fontSize: 15, color: 'var(--success)' }}>{count}</span>
        <span className="text-caption">{name}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map(item => (
          <li key={item} className="text-caption flex items-center gap-2">
            <span style={{ color: 'var(--success)' }}>+</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-data" style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div className="text-caption">{label}</div>
    </div>
  );
}
