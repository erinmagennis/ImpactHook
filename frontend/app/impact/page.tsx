"use client";

import { Navigation } from "../../components/Navigation";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MilestoneProof({ index, name, status, proof, date, feeBps }: {
  index: number; name: string; status: 'verified' | 'pending' | 'locked';
  proof: string; date: string; feeBps: number;
}) {
  const colors = {
    verified: { bg: 'rgba(34, 211, 238, 0.06)', border: 'rgba(34, 211, 238, 0.15)', text: 'var(--accent-cyan)' },
    pending: { bg: 'rgba(167, 139, 250, 0.06)', border: 'rgba(167, 139, 250, 0.15)', text: 'var(--accent-violet)' },
    locked: { bg: 'var(--bg-elevated)', border: 'var(--border-subtle)', text: 'var(--text-dim)' },
  };
  const c = colors[status];

  return (
    <div className="p-3 rounded-sm" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {status === 'verified' && <span style={{ color: c.text }}><CheckIcon /></span>}
          {status === 'pending' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-2 h-2 rounded-full" style={{ background: c.text, animation: 'pulse-glow 2s ease-in-out infinite' }} /></span>}
          {status === 'locked' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} /></span>}
          <span className="text-[12px]" style={{ color: status === 'locked' ? 'var(--text-dim)' : 'var(--text-bright)' }}>{name}</span>
        </div>
        <span className="font-data text-[10px]" style={{ color: c.text }}>
          {feeBps} bps
        </span>
      </div>
      {(proof || date) && (
        <div className="flex items-center gap-3 ml-5">
          {proof && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{proof}</span>}
          {date && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{date}</span>}
        </div>
      )}
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-emerald)' }}>
            Why This Matters
          </span>
          <h1
            className="font-display text-[clamp(1.8rem,5vw,2.8rem)] mt-3 mb-6"
            style={{ color: 'var(--text-bright)', lineHeight: 1.1 }}
          >
            Liquidity with purpose
          </h1>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            $2.5 trillion in daily crypto trading volume generates zero social impact.
            Every pool looks the same: token pair, fee tier, TVL. There is no way to
            differentiate liquidity by what it does in the real world.
          </p>
        </div>

        {/* The problem */}
        <div className="card p-6 animate-fade-up delay-100" style={{ marginBottom: 24, borderLeft: '2px solid var(--accent-cyan)' }}>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            You want to support projects that matter. But you don&apos;t have time to research every
            organization, track where your money goes, or follow up months later to see if it worked.
            ImpactHook handles all of that. The protocol only releases funds when milestones are
            verified on-chain. You see the outcomes without doing the work.
          </p>
        </div>

        {/* A new class of pool */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: 48 }}>
          <h2 className="font-display text-[18px] mb-6" style={{ color: 'var(--text-bright)' }}>
            A new class of liquidity pool
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Impact-differentiated", text: "Pools defined by the real-world outcome they fund, not just token pair and fee tier" },
              { label: "Continuous", text: "Funding flows with every swap, not once-a-year grants" },
              { label: "Milestone-gated", text: "No results, no funding. Verification happens on-chain before fees release" },
              { label: "Cross-chain verified", text: "Milestones confirmed from any chain via Reactive Network" },
              { label: "Permissionless", text: "Anyone can create an impact pool for any cause. No gatekeepers" },
              { label: "Zero-friction", text: "Same tokens, same swap, different impact. Just pick a pool" },
            ].map((item) => (
              <div key={item.label} className="card p-4 flex gap-3 items-start">
                <span className="text-[11px] font-data mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-cyan)' }}>+</span>
                <div>
                  <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>{item.label}. </span>
                  <span className="text-[13px]" style={{ color: 'var(--text-dim)' }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* Accountability */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-emerald)' }}>
            Accountability
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-3" style={{ color: 'var(--text-bright)' }}>
            Full transparency, by default
          </h2>
          <p className="text-[14px] mb-8 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            Not because we chose to be transparent - because the protocol makes it impossible not to be.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Every fee on-chain",
                desc: "Every swap fee is recorded as a FeesAccumulated event. Anyone can verify the exact amount collected for any project at any time.",
                icon: "{}",
              },
              {
                label: "Milestones are permanent",
                desc: "Milestone verifications are immutable on-chain events. Once verified, the record can never be altered or deleted. EAS attestations add an additional layer of proof.",
                icon: "[]",
              },
              {
                label: "Withdrawals are public",
                desc: "Every withdrawal is a FeesWithdrawn event with the recipient address and exact amount. No money moves without a visible on-chain record.",
                icon: "->",
              },
              {
                label: "Open source, auditable",
                desc: "All contracts are verified on-chain and the source code is public on GitHub. Anyone can read the logic, run the tests, or fork the project.",
                icon: "<>",
              },
            ].map((item) => (
              <div key={item.label} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-data text-[14px]" style={{ color: 'var(--accent-emerald)' }}>{item.icon}</span>
                  <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>{item.label}</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* For Projects */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-violet)' }}>
            For Projects
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-3" style={{ color: 'var(--text-bright)' }}>
            Prove your progress, get funded
          </h2>
          <p className="text-[14px] leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            If you&apos;re building something that matters, ImpactHook gives you a new way to get funded.
            Create a pool, define your milestones, and let the trading community fund your work.
            No pitch decks. No grant committees. Just verified results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestone proof cards */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Project View</span>
                <span className="text-[10px] px-2 py-0.5" style={{ color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.2)', background: 'rgba(52, 211, 153, 0.05)' }}>
                  Funding Active
                </span>
              </div>
              <div className="font-display text-sm mb-4" style={{ color: 'var(--text-bright)' }}>Clean Water in Rural Kenya</div>

              <div className="flex flex-col gap-3">
                <MilestoneProof index={0} name="Equipment sourced" status="verified" proof="Tx: 0xa4f2...8b1c" date="Feb 14, 2026" feeBps={0} />
                <MilestoneProof index={1} name="Installation complete" status="verified" proof="Tx: 0x7e91...3d4a" date="Mar 2, 2026" feeBps={200} />
                <MilestoneProof index={2} name="First 1,000 liters filtered" status="pending" proof="Awaiting verification" date="" feeBps={300} />
                <MilestoneProof index={3} name="Community-maintained" status="locked" proof="" date="" feeBps={100} />
              </div>
            </div>

            {/* Funding summary + dual channels */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <div className="text-[11px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Funding summary</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--text-bright)' }}>1.247</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH earned</div>
                  </div>
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--text-bright)' }}>0.831</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH withdrawn</div>
                  </div>
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--accent-cyan)' }}>0.416</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH available</div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg" style={{ color: 'var(--accent-cyan)' }}>~</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Channel 1: Swap Fees</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  DeFi-native continuous funding. The hook charges a fee on swap output.
                  LPs earn full yield. Fees come from swappers who choose impact pools.
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg" style={{ color: 'var(--accent-violet)' }}>#</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Channel 2: Grant Escrow</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  Institutional milestone-gated funding via Alkahest (Zellic-audited).
                  Both channels share one source of truth for milestone state.
                </p>
              </div>

              <div className="p-4" style={{ background: 'rgba(167, 139, 250, 0.04)', border: '1px solid rgba(167, 139, 250, 0.1)', borderRadius: '2px' }}>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  Two funding paths, same on-chain accountability. Whether funds come from
                  DeFi trading or institutional grants, milestones must be verified before a single dollar moves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* Direct donations */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="font-display text-[18px] mb-4" style={{ color: 'var(--text-bright)' }}>
            Direct donations
          </h2>
          <p className="text-[14px] leading-relaxed mb-6 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            Beyond swap fees, anyone can donate directly to a project&apos;s fund - institutions,
            DAOs, and individuals contribute alongside continuous DeFi funding. Same milestone-gated
            rules apply. No money moves until milestones are verified.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent-cyan)' }}>ERC20</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Approve and donate any ERC20 token. SafeERC20 handles non-standard tokens.
              </p>
            </div>
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent-cyan)' }}>Native ETH</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Send ETH directly. No approval needed.
              </p>
            </div>
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent-cyan)' }}>Same rules</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Donations accumulate alongside swap fees. Same recipient, same withdrawal process.
              </p>
            </div>
          </div>
        </div>

        {/* UNICEF alignment */}
        <div className="divider" style={{ margin: '48px 0' }} />

        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-emerald)' }}>
            Alignment
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-6" style={{ color: 'var(--text-bright)' }}>
            Built for real-world impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                area: "Health & WASH",
                example: "Clean water filtration, vaccine cold chains",
                how: "Milestone-gated funding ensures equipment is delivered and operational before more funding flows.",
              },
              {
                area: "Education",
                example: "School meals, open textbooks",
                how: "Track meals served, students reached, materials published - all verified on-chain.",
              },
              {
                area: "Climate & DeSci",
                example: "Satellite data, reforestation tracking",
                how: "Public datasets and environmental outcomes verified through EAS attestations.",
              },
              {
                area: "Social Inclusion",
                example: "Microgrids, community infrastructure",
                how: "Cross-chain verification lets projects on any chain prove milestones to funders on Unichain.",
              },
            ].map((item) => (
              <div key={item.area} className="card p-5">
                <div className="font-display text-[14px] mb-1" style={{ color: 'var(--text-bright)' }}>{item.area}</div>
                <div className="text-[12px] mb-3" style={{ color: 'var(--accent-cyan)' }}>{item.example}</div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{item.how}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card card-glow p-8 text-center animate-fade-up">
          <h3 className="font-display text-[18px] mb-3" style={{ color: 'var(--text-bright)' }}>
            Ready to create impact?
          </h3>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-mid)' }}>
            Register a project, start trading in an impact pool, or donate directly.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard" className="cta-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide" style={{ borderRadius: 2 }}>
              Launch App
            </a>
            <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide"
               style={{ color: 'var(--text-mid)', border: '1px solid var(--border-subtle)', borderRadius: 2, textDecoration: 'none' }}>
              View Source
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
