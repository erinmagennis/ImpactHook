const MILESTONES = [
  { index: 0, name: "Project registered", feeBps: 0, verified: true },
  { index: 1, name: "Phase 1 complete", feeBps: 200, verified: true },
  { index: 2, name: "Phase 2 complete", feeBps: 300, verified: false },
  { index: 3, name: "Self-sustaining", feeBps: 100, verified: false },
];

const POOL = {
  pair: "USDC / ETH",
  lpFee: "0.30%",
  hookFee: "2.00%",
  hookFeeBps: 200,
  totalSwaps: "1,847",
  accumulatedFees: "1.247",
  feeCurrency: "ETH",
  tvl: "$2.4M",
  volume24h: "$847K",
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-30">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-40">
      <path d="M4.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5C2 9.77614 2.22386 10 2.5 10H9.5C9.77614 10 10 9.77614 10 9.5V7.5M7 2H10V5M10 2L5.5 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── HERO ─────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 bg-mesh scanline overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tag */}
        <div className="animate-fade-up delay-100 mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase"
                style={{ color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238, 0.15)', background: 'rgba(34, 211, 238, 0.04)' }}>
            Uniswap v4 Hook
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            Unichain
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up delay-200 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] font-display tracking-tight mb-6">
          <span className="text-gradient-full">Impact</span>
          <span style={{ color: 'var(--text-bright)' }}>Hook</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up delay-300 text-[clamp(0.85rem,2vw,1.1rem)] leading-relaxed max-w-2xl mx-auto mb-12"
           style={{ color: 'var(--text-mid)' }}>
          Every swap funds real-world impact. A Uniswap v4 hook that routes
          fees to milestone-gated projects — performance-based funding powered
          by DeFi trading activity.
        </p>

        {/* Stats row */}
        <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
          <Stat label="Accumulated" value="1.247 ETH" />
          <Stat label="Current Fee" value="2.00%" />
          <Stat label="Milestones" value="2 / 4" />
          <Stat label="Total Swaps" value="1,847" />
        </div>

        {/* CTA */}
        <div className="animate-fade-up delay-500 flex flex-wrap gap-4 justify-center">
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-all hover:scale-[1.02]"
             style={{ background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.25)', color: 'var(--accent-cyan)' }}>
            View Source <ExternalIcon />
          </a>
          <a href="#dashboard"
             className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-all hover:scale-[1.02]"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-mid)' }}>
            Dashboard
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-800">
        <div className="w-px h-8 mx-auto animate-float" style={{ background: 'linear-gradient(180deg, var(--accent-cyan), transparent)' }} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-data text-[clamp(1.2rem,3vw,1.5rem)] mb-1" style={{ color: 'var(--text-bright)' }}>{value}</div>
      <div className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>{label}</div>
    </div>
  );
}

/* ── HOW IT WORKS ─────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { num: "01", title: "Swap", desc: "Trader swaps on a Uniswap v4 pool with ImpactHook attached", icon: "~" },
    { num: "02", title: "Fee Route", desc: "afterSwap() takes a small fee from output based on current milestone tier", icon: ">" },
    { num: "03", title: "Accumulate", desc: "Fees accumulate per pool per currency in the hook contract", icon: "#" },
    { num: "04", title: "Verify", desc: "Verifier confirms milestone completion, fee tier adjusts", icon: "!" },
    { num: "05", title: "Withdraw", desc: "Project recipient withdraws accumulated fees to fund their work", icon: "$" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Mechanism" title="How it works" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-16">
          {steps.map((step, i) => (
            <div key={step.num} className="animate-fade-up card p-5 flex flex-col" style={{ animationDelay: `${200 + i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-data text-[11px]" style={{ color: 'var(--accent-cyan)' }}>{step.num}</span>
                <span className="text-lg" style={{ color: 'var(--text-dim)' }}>{step.icon}</span>
              </div>
              <h3 className="font-display text-sm mb-2" style={{ color: 'var(--text-bright)' }}>{step.title}</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                  <ArrowIcon />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Code snippet */}
        <div className="mt-12 card p-6 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
            <span className="ml-3 text-[11px] tracking-wider" style={{ color: 'var(--text-dim)' }}>ImpactHook.sol : afterSwap()</span>
          </div>
          <pre className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            <code>{`// Fee on TOP of LP fee — LPs earn full yield
uint16 feeBps = _getCurrentFeeBps(poolId);
uint256 feeAmount = (uint256(uint128(outputAmount)) * feeBps) / 10_000;

poolManager.take(feeCurrency, address(this), feeAmount);
accumulatedFees[poolId][feeCurrency] += feeAmount;

return (this.afterSwap.selector, int128(int256(feeAmount)));`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ── DASHBOARD ────────────────────────────────────── */

function Dashboard() {
  const currentMilestoneIdx = MILESTONES.findIndex(m => !m.verified);
  const progress = (MILESTONES.filter(m => m.verified).length / MILESTONES.length) * 100;

  return (
    <section id="dashboard" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Live Data" title="Pool dashboard" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-16">
          {/* Pool info */}
          <div className="card p-6 card-glow lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[11px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>Pool</div>
                <div className="font-display text-xl" style={{ color: 'var(--text-bright)' }}>{POOL.pair}</div>
              </div>
              <span className="status-live text-[11px] tracking-wider" style={{ color: 'var(--accent-emerald)' }}>Active</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DataCell label="LP Fee" value={POOL.lpFee} />
              <DataCell label="Impact Fee" value={POOL.hookFee} accent />
              <DataCell label="TVL" value={POOL.tvl} />
              <DataCell label="24h Volume" value={POOL.volume24h} />
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Milestone progress</span>
                <span className="font-data text-[13px]" style={{ color: 'var(--accent-cyan)' }}>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full animate-progress-bar"
                     style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))' }} />
              </div>
            </div>
          </div>

          {/* Fees card */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="text-[11px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>Accumulated fees</div>
              <div className="font-data text-3xl mb-1" style={{ color: 'var(--text-bright)' }}>
                {POOL.accumulatedFees}
                <span className="text-lg ml-2" style={{ color: 'var(--text-dim)' }}>{POOL.feeCurrency}</span>
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-dim)' }}>from {POOL.totalSwaps} swaps</div>
            </div>
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="text-[11px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>Current tier</div>
              <div className="font-data text-lg">
                <span style={{ color: 'var(--accent-cyan)' }}>{POOL.hookFeeBps}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-dim)' }}>bps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones timeline */}
        <div className="card p-6 mt-4">
          <div className="text-[11px] tracking-[0.12em] uppercase mb-6" style={{ color: 'var(--text-dim)' }}>Milestones</div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-[12px] bottom-[12px] w-px"
                 style={{
                   background: `linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-cyan) ${progress}%, var(--border-subtle) ${progress}%)`
                 }} />

            <div className="flex flex-col gap-6">
              {MILESTONES.map((m, i) => {
                const isActive = i === currentMilestoneIdx;
                const nodeClass = m.verified ? 'milestone-verified' : isActive ? 'milestone-active' : 'milestone-pending';

                return (
                  <div key={m.index} className="flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${300 + i * 100}ms` }}>
                    <div className={`milestone-node ${nodeClass}`}>
                      {m.verified ? (
                        <span style={{ color: 'var(--accent-cyan)' }}><CheckIcon /></span>
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-violet)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between min-h-[24px]">
                      <div>
                        <span className="text-[13px]" style={{ color: m.verified ? 'var(--text-bright)' : isActive ? 'var(--accent-violet)' : 'var(--text-dim)' }}>
                          {m.name}
                        </span>
                        {m.verified && (
                          <span className="ml-2 text-[10px] tracking-wider uppercase" style={{ color: 'var(--accent-cyan)' }}>verified</span>
                        )}
                        {isActive && (
                          <span className="ml-2 text-[10px] tracking-wider uppercase" style={{ color: 'var(--accent-violet)' }}>next</span>
                        )}
                      </div>
                      <span className="font-data text-[13px]"
                            style={{ color: m.verified ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                        {m.feeBps === 0 ? '0' : m.feeBps} <span className="text-[10px]">bps</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: 'var(--text-dim)' }}>{label}</div>
      <div className="font-data text-[15px]" style={{ color: accent ? 'var(--accent-cyan)' : 'var(--text-bright)' }}>{value}</div>
    </div>
  );
}

/* ── ARCHITECTURE ─────────────────────────────────── */

function Architecture() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="System" title="Architecture" />

        {/* Contract map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          <ContractCard
            name="ImpactHook.sol"
            role="Core Hook"
            description="afterSwap fee routing, milestone tracking, withdrawal, cross-chain callback handler"
            chain="Unichain"
            accent="cyan"
          />
          <ContractCard
            name="MilestoneArbiter.sol"
            role="Escrow Gate"
            description="Alkahest IArbiter — gates escrow release on verified milestone state"
            chain="Unichain"
            accent="violet"
          />
          <ContractCard
            name="MilestoneReactor.sol"
            role="Reactive RSC"
            description="Subscribes to origin chain events, emits cross-chain callbacks to ImpactHook"
            chain="Reactive Network"
            accent="emerald"
          />
          <ContractCard
            name="MilestoneOracle.sol"
            role="Event Source"
            description="Origin chain contract — emits MilestoneSubmitted events for cross-chain verification"
            chain="Any Origin"
            accent="amber"
          />
        </div>

        {/* Flow diagram */}
        <div className="card p-8 mt-4 overflow-x-auto">
          <div className="text-[11px] tracking-[0.12em] uppercase mb-6" style={{ color: 'var(--text-dim)' }}>Cross-chain verification flow</div>
          <div className="font-data text-[12px] leading-loose whitespace-pre" style={{ color: 'var(--text-mid)' }}>
{`  Origin Chain              Reactive Network           Unichain
  ────────────              ────────────────           ────────

  MilestoneOracle    ───>   MilestoneReactor    ───>   ImpactHook
  emit                      subscribe &                verify
  MilestoneSubmitted        emit Callback              MilestoneReactive()
                                    │
                                    └── rvmId injected by network
                                        used for authorization`}
          </div>
        </div>

        {/* Two channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg" style={{ color: 'var(--accent-cyan)' }}>~</span>
              <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Channel 1</span>
            </div>
            <h3 className="font-display text-sm mb-2" style={{ color: 'var(--text-bright)' }}>Swap Fees</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              DeFi-native continuous funding. The hook charges a fee on swap output via afterSwapReturnDelta.
              LPs earn full yield — fees come from swappers who choose impact pools.
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg" style={{ color: 'var(--accent-violet)' }}>#</span>
              <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Channel 2</span>
            </div>
            <h3 className="font-display text-sm mb-2" style={{ color: 'var(--text-bright)' }}>Grant Escrow</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Institutional milestone-gated funding via Alkahest (Zellic-audited). MilestoneArbiter reads
              the same on-chain state — both channels share one source of truth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContractCard({ name, role, description, chain, accent }: {
  name: string; role: string; description: string; chain: string;
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
      <div className="flex items-center justify-between mb-3">
        <span className="font-data text-[13px]" style={{ color: accentColors[accent] }}>{name}</span>
        <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5"
              style={{ color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
          {chain}
        </span>
      </div>
      <div className="text-[11px] tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>{role}</div>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{description}</p>
    </div>
  );
}

/* ── PARTNERS ─────────────────────────────────────── */

function Partners() {
  const partners = [
    { name: "Uniswap Foundation", role: "v4 Hook Framework", url: "https://uniswap.org" },
    { name: "Unichain", role: "OP Stack L2", url: "https://unichain.org" },
    { name: "Reactive Network", role: "Cross-Chain RSC", url: "https://reactive.network" },
    { name: "Arkhai", role: "Alkahest Escrow", url: "https://arkhai.io" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Ecosystem" title="Built with" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {partners.map((p, i) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
               className="card p-6 text-center group transition-all animate-fade-up"
               style={{ animationDelay: `${200 + i * 100}ms` }}>
              <div className="font-display text-[15px] mb-2 transition-colors group-hover:text-gradient-cyan"
                   style={{ color: 'var(--text-bright)' }}>
                {p.name}
              </div>
              <div className="text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>{p.role}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTING ──────────────────────────────────────── */

function Testing() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Quality" title="Test coverage" />

        <div className="card p-6 mt-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="font-data text-3xl" style={{ color: 'var(--accent-emerald)' }}>39</div>
            <div>
              <div className="text-[13px]" style={{ color: 'var(--text-bright)' }}>tests passing</div>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>0 failed, 0 skipped</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TestGroup name="Core Hook" count={12} items={["Registration", "Fee routing (both dirs)", "Milestone progression", "Withdrawal"]} />
            <TestGroup name="Access Control" count={8} items={["Verifier auth", "Recipient auth", "Callback proxy", "Owner checks"]} />
            <TestGroup name="Integrations" count={11} items={["MilestoneArbiter (3)", "Reactive callbacks (3)", "Oracle events (4)", "E2E cross-chain"]} />
            <TestGroup name="Edge Cases" count={8} items={["Fuzz (257 runs)", "Multiple pools", "Zero fees", "Out of bounds"]} />
          </div>
        </div>
      </div>
    </section>
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

/* ── FOOTER ───────────────────────────────────────── */

function Footer() {
  return (
    <footer className="py-16 px-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-sm" style={{ color: 'var(--text-dim)' }}>
          ImpactHook — UHI Hookathon 2026
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
             className="text-[12px] flex items-center gap-1.5 transition-colors hover:text-[var(--accent-cyan)]"
             style={{ color: 'var(--text-dim)' }}>
            GitHub <ExternalIcon />
          </a>
          <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>MIT License</span>
        </div>
      </div>
    </footer>
  );
}

/* ── SHARED ───────────────────────────────────────── */

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="animate-fade-up">
      <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-cyan)' }}>{label}</span>
      <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] mt-2" style={{ color: 'var(--text-bright)' }}>{title}</h2>
    </div>
  );
}

/* ── PAGE ─────────────────────────────────────────── */

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="divider" />
      <HowItWorks />
      <div className="divider" />
      <Dashboard />
      <div className="divider" />
      <Architecture />
      <div className="divider" />
      <Testing />
      <div className="divider" />
      <Partners />
      <Footer />
    </main>
  );
}
