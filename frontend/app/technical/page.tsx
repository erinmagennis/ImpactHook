"use client";

import { Navigation } from "../../components/Navigation";

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
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-cyan)' }}>
            Technical Deep Dive
          </span>
          <h1
            className="font-display text-[clamp(1.8rem,5vw,2.8rem)] mt-3 mb-4"
            style={{ color: 'var(--text-bright)', lineHeight: 1.1 }}
          >
            Architecture
          </h1>
          <p className="text-[14px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            A Uniswap v4 hook creating asset-class specific liquidity via milestone-gated
            fee routing. Four contracts across three chains.
          </p>
        </div>

        {/* Contracts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up delay-100" style={{ marginBottom: 32 }}>
          <ContractCard
            name="ImpactHook.sol"
            role="Core Hook"
            description="afterSwap fee routing, LP fee skim, milestone tracking, 3 verification paths, loyalty discounts, heartbeat expiration, project templates"
            chain="Unichain Sepolia"
            address="0x4A5EC52aa4F86F2947bB710cD34Cd272adC62547"
            accent="cyan"
          />
          <ContractCard
            name="MilestoneArbiter.sol"
            role="Escrow Gate"
            description="Alkahest IArbiter - gates escrow release on verified milestone state"
            chain="Unichain Sepolia"
            address="0x1af58d1A851Ab874776329b11838C6C37C81Ce62"
            accent="violet"
          />
          <ContractCard
            name="MilestoneReactor.sol"
            role="Reactive RSC"
            description="Subscribes to origin chain events, emits cross-chain callbacks to ImpactHook"
            chain="Reactive Lasna"
            address="0x4CB877dee81E9e68533FFaf8495Ce9bCdc9518a4"
            accent="emerald"
          />
          <ContractCard
            name="MilestoneOracle.sol"
            role="Event Source"
            description="Origin chain contract - emits MilestoneSubmitted events for cross-chain verification"
            chain="Ethereum Sepolia"
            address="0x9845d22Fbb33f30E241824aCB1813c041291A4Ca"
            accent="amber"
          />
        </div>

        {/* Cross-chain flow */}
        <div className="card p-6 animate-fade-up delay-200" style={{ marginBottom: 32, overflowX: 'auto' }}>
          <div className="text-[11px] tracking-[0.12em] uppercase mb-4" style={{ color: 'var(--text-dim)' }}>
            Cross-Chain Milestone Verification
          </div>
          <pre className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)', whiteSpace: 'pre' }}>
{`Origin Chain              Reactive Network           Destination Chain
(any supported)           (ReactVM)                  (Unichain)

MilestoneOracle    -->    MilestoneReactor    -->    ImpactHook
  emits event              subscribes &               verifyMilestoneReactive()
  MilestoneSubmitted       emits Callback             updates milestone state`}
          </pre>
          <p className="text-[12px] mt-4 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Authorization: Reactive Network overwrites the first callback argument with the ReactVM ID.
            The hook checks <span className="font-data" style={{ color: 'var(--accent-cyan)' }}>msg.sender == callbackProxy</span> and{' '}
            <span className="font-data" style={{ color: 'var(--accent-cyan)' }}>rvmId == project.verifier</span>.
          </p>
        </div>

        {/* Verification paths */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 32 }}>
          <h2 className="font-display text-[18px] mb-4" style={{ color: 'var(--text-bright)' }}>
            Three verification paths
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                <span className="font-display text-[13px]" style={{ color: 'var(--text-bright)' }}>Direct</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Verifier calls <span className="font-data" style={{ color: 'var(--accent-cyan)' }}>verifyMilestone()</span> directly.
                Simple, gas-efficient. Works for EOAs, multisigs, DAOs.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-violet)', boxShadow: '0 0 8px var(--accent-violet)' }} />
                <span className="font-display text-[13px]" style={{ color: 'var(--text-bright)' }}>Reactive Cross-Chain</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Oracle on origin chain emits event. Reactor RSC on Reactive Network
                subscribes and triggers callback on Unichain.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
                <span className="font-display text-[13px]" style={{ color: 'var(--text-bright)' }}>EAS Attestation</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Verifier creates EAS attestation with evidence. Anyone can
                call <span className="font-data" style={{ color: 'var(--accent-emerald)' }}>verifyMilestoneEAS()</span> permissionlessly.
              </p>
            </div>
          </div>
        </div>

        {/* Code snippet */}
        <div className="card p-6 animate-fade-up delay-400" style={{ marginBottom: 32, overflowX: 'auto' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
            <span className="ml-3 text-[11px] tracking-wider" style={{ color: 'var(--text-dim)' }}>ImpactHook.sol : afterSwap()</span>
          </div>
          <pre className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            <code>{`// Fee on TOP of LP fee - LPs earn full yield
uint16 feeBps = _getCurrentFeeBps(poolId);
uint256 feeAmount = (uint256(uint128(outputAmount)) * feeBps) / 10_000;

// Take fee from pool manager into hook contract
poolManager.take(feeCurrency, address(this), feeAmount);
accumulatedFees[poolId][feeCurrency] += feeAmount;

// Return delta - reduces swapper's output by fee amount
return (this.afterSwap.selector, int128(int256(feeAmount)));`}</code>
          </pre>
        </div>

        {/* Fee model */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h2 className="font-display text-[18px] mb-4" style={{ color: 'var(--text-bright)' }}>
            Fee model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                The hook charges a fee <strong style={{ color: 'var(--text-bright)' }}>on top of</strong> the
                standard LP fee via <span className="font-data" style={{ color: 'var(--accent-cyan)' }}>afterSwapReturnDelta</span>.
                LP yield is completely unaffected. Fee rate is determined by the current verified
                milestone&apos;s <span className="font-data" style={{ color: 'var(--accent-cyan)' }}>projectFeeBps</span>.
                Maximum capped at 500 bps (5%).
              </p>
            </div>
            <div className="card p-5">
              <div className="text-[11px] tracking-[0.12em] uppercase mb-4" style={{ color: 'var(--text-dim)' }}>
                Example progression
              </div>
              <div className="relative">
                <div className="absolute left-[11px] top-[12px] bottom-[12px] w-px"
                  style={{
                    background: `linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-cyan) ${progress}%, var(--border-subtle) ${progress}%)`
                  }} />
                <div className="flex flex-col gap-4">
                  {MILESTONES.map((m, i) => {
                    const isActive = i === currentMilestoneIdx;
                    const nodeClass = m.verified ? 'milestone-verified' : isActive ? 'milestone-active' : 'milestone-pending';
                    return (
                      <div key={m.index} className="flex items-center gap-4">
                        <div className={`milestone-node ${nodeClass}`} style={{ width: 22, height: 22 }}>
                          {m.verified ? (
                            <span style={{ color: 'var(--accent-cyan)' }}><CheckIcon /></span>
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-violet)' }} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} />
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-[12px]" style={{ color: m.verified ? 'var(--text-bright)' : 'var(--text-dim)' }}>
                            {m.name}
                          </span>
                          <span className="font-data text-[12px]" style={{ color: m.verified ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                            {m.feeBps} bps
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* Test coverage */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-emerald)' }}>
            Quality
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-6" style={{ color: 'var(--text-bright)' }}>
            Test coverage
          </h2>

          <div className="card p-6" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="font-data text-3xl" style={{ color: 'var(--accent-emerald)' }}>147</div>
              <div>
                <div className="text-[13px]" style={{ color: 'var(--text-bright)' }}>tests passing</div>
                <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>0 failed, 0 skipped</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TestGroup name="Core Hook" count={35} items={["Registration", "Fee routing (both dirs)", "Milestone progression", "Withdrawal", "Impact tracking", "LP fee skim"]} />
              <TestGroup name="Access & Safety" count={28} items={["Verifier auth", "Recipient auth", "Callback proxy", "Owner checks", "Heartbeat expiry", "Per-project pause"]} />
              <TestGroup name="Integrations" count={19} items={["MilestoneArbiter (3)", "Reactive callbacks (5)", "Oracle events (4)", "EAS verification (7)"]} />
              <TestGroup name="Features & Fuzz" count={30} items={["Loyalty discounts (6)", "Templates (7)", "Donations (8)", "Fuzz tests", "HookMiner (7)", "Edge cases"]} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Contracts" value="4" />
            <StatCard label="Chains" value="3" />
            <StatCard label="Verification Paths" value="3" />
            <StatCard label="Max Fee" value="500 bps" />
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* Deployed addresses */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h2 className="font-display text-[18px] mb-4" style={{ color: 'var(--text-bright)' }}>
            Deployed contracts
          </h2>
          <div className="card p-5" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="text-left text-[10px] tracking-[0.12em] uppercase pb-3" style={{ color: 'var(--text-dim)' }}>Contract</th>
                  <th className="text-left text-[10px] tracking-[0.12em] uppercase pb-3" style={{ color: 'var(--text-dim)' }}>Chain</th>
                  <th className="text-left text-[10px] tracking-[0.12em] uppercase pb-3" style={{ color: 'var(--text-dim)' }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "ImpactHook", chain: "Unichain Sepolia", address: "0x4A5EC52aa4F86F2947bB710cD34Cd272adC62547" },
                  { name: "MilestoneArbiter", chain: "Unichain Sepolia", address: "0x1af58d1A851Ab874776329b11838C6C37C81Ce62" },
                  { name: "MilestoneOracle", chain: "Ethereum Sepolia", address: "0x9845d22Fbb33f30E241824aCB1813c041291A4Ca" },
                  { name: "MilestoneReactor", chain: "Reactive Lasna", address: "0x4CB877dee81E9e68533FFaf8495Ce9bCdc9518a4" },
                ].map((c) => (
                  <tr key={c.name} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-3 text-[13px]" style={{ color: 'var(--text-bright)' }}>{c.name}</td>
                    <td className="py-3 text-[12px]" style={{ color: 'var(--text-dim)' }}>{c.chain}</td>
                    <td className="py-3 font-data text-[11px]" style={{ color: 'var(--accent-cyan)' }}>{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>EAS Schema UID</span>
              <span className="font-data text-[10px]" style={{ color: 'var(--accent-cyan)' }}>
                0xe4614a0cea117a9a198431d54972835ab8d84b8d6e3d18e482032377af9bfb52
              </span>
            </div>
          </div>
        </div>

        {/* Key addresses */}
        <div className="card p-5 animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-[11px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
            Key Addresses (Unichain Sepolia)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "PoolManager", address: "0x1F98400000000000000000000000000000000004" },
              { label: "Callback Proxy", address: "0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4" },
              { label: "EAS", address: "0x4200000000000000000000000000000000000021" },
              { label: "SchemaRegistry", address: "0x4200000000000000000000000000000000000020" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
                <span className="font-data text-[10px]" style={{ color: 'var(--text-mid)' }}>{item.address}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 animate-fade-up">
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
             className="cta-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide" style={{ borderRadius: 2, textDecoration: 'none' }}>
            View on GitHub
          </a>
          <a href="/dashboard"
             className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide"
             style={{ color: 'var(--text-mid)', border: '1px solid var(--border-subtle)', borderRadius: 2, textDecoration: 'none' }}>
            Launch App
          </a>
        </div>
      </main>
    </div>
  );
}

function ContractCard({ name, role, description, chain, address, accent }: {
  name: string; role: string; description: string; chain: string; address: string;
  accent: 'cyan' | 'violet' | 'emerald' | 'amber';
}) {
  const accentColors = {
    cyan: 'var(--accent-cyan)',
    violet: 'var(--accent-violet)',
    emerald: 'var(--accent-emerald)',
    amber: 'var(--accent-amber)',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-data text-[13px]" style={{ color: accentColors[accent] }}>{name}</span>
        <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5"
              style={{ color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
          {chain}
        </span>
      </div>
      <div className="text-[11px] tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>{role}</div>
      <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-dim)' }}>{description}</p>
      <div className="font-data text-[10px]" style={{ color: 'var(--text-mid)' }}>{address}</div>
    </div>
  );
}

function TestGroup({ name, count, items }: { name: string; count: number; items: string[] }) {
  return (
    <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: '2px' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-data text-[15px]" style={{ color: 'var(--accent-emerald)' }}>{count}</span>
        <span className="text-[11px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>{name}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map(item => (
          <li key={item} className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--accent-emerald)' }}>+</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-data text-[18px] mb-1" style={{ color: 'var(--text-bright)' }}>{value}</div>
      <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>{label}</div>
    </div>
  );
}
