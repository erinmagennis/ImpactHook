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
    verified: { bg: 'rgba(13, 148, 136, 0.06)', border: 'rgba(13, 148, 136, 0.15)', text: 'var(--accent)' },
    pending: { bg: 'rgba(124, 58, 237, 0.06)', border: 'rgba(124, 58, 237, 0.15)', text: '#7c3aed' },
    locked: { bg: 'var(--bg-elevated)', border: 'var(--border-subtle)', text: 'var(--text-dim)' },
  };
  const c = colors[status];

  return (
    <div className="p-3" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8 }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {status === 'verified' && <span style={{ color: c.text }}><CheckIcon /></span>}
          {status === 'pending' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-2 h-2 rounded-full" style={{ background: c.text }} /></span>}
          {status === 'locked' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} /></span>}
          <span className="text-[12px]" style={{ color: status === 'locked' ? 'var(--text-dim)' : 'var(--text-primary)' }}>{name}</span>
        </div>
        <span className="font-data text-[10px]" style={{ color: c.text }}>
          {feeBps / 100}%
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
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <Navigation />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--success)' }}>
            Why This Matters
          </span>
          <h1
            className="font-display text-[clamp(1.8rem,5vw,2.8rem)] mt-3 mb-6"
            style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}
          >
            Liquidity with purpose
          </h1>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            45.8% of children in Mexico live in poverty. In rural Chiapas, 44% of children under 5
            are stunted. $2.5 trillion in daily crypto trading volume generates zero social
            impact. ImpactHook connects the two.
          </p>
        </div>

        {/* The problem */}
        <div className="card p-6 animate-fade-up delay-100" style={{ marginBottom: 24, borderLeft: '2px solid var(--accent)' }}>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            You want to fund projects that help children. But you don&apos;t have time to research every
            organization, track where your money goes, or follow up months later to see if children
            actually received clean water, meals, or school supplies.
            ImpactHook handles all of that. The protocol only releases funds when milestones are
            verified on-chain. You see the outcomes without doing the work.
          </p>
        </div>

        {/* A new class of pool */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: 48 }}>
          <h2 className="font-display text-[18px] mb-6" style={{ color: 'var(--text-primary)' }}>
            A new class of liquidity pool
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Impact-differentiated", text: "Pools defined by what they fund - clean water for children, school meals, rural solar - not just token pair and fee tier" },
              { label: "Continuous", text: "Funding flows with every swap, not once-a-year grants. Children get sustained support" },
              { label: "Milestone-gated", text: "No results, no funding. Water systems must be installed before the next tranche releases" },
              { label: "Cross-chain verified", text: "Milestones confirmed from any chain via Reactive Network" },
              { label: "Permissionless", text: "Any organization serving children can create an impact pool. No gatekeepers" },
              { label: "Zero-friction", text: "Same tokens, same swap, different impact. Just pick a pool" },
            ].map((item) => (
              <div key={item.label} className="card p-4 flex gap-3 items-start">
                <span className="text-[11px] font-data mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>+</span>
                <div>
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{item.label}. </span>
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
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--success)' }}>
            Accountability
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-3" style={{ color: 'var(--text-primary)' }}>
            Full transparency, by default
          </h2>
          <p className="text-[14px] mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
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
                label: "Heartbeat expiration",
                desc: "Projects must send periodic proof-of-life or fees stop automatically. Dead projects auto-expire without manual intervention.",
                icon: "~~",
              },
              {
                label: "Per-project controls",
                desc: "Individual projects can be paused without affecting others. Progressive decentralization from owner-gated to fully permissionless.",
                icon: "||",
              },
              {
                label: "Open source, auditable",
                desc: "All contracts verified on-chain, source code public on GitHub. 156 tests, 94% line coverage. Audited with Slither and Feynman deep logic analysis.",
                icon: "<>",
              },
            ].map((item) => (
              <div key={item.label} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-data text-[14px]" style={{ color: 'var(--success)' }}>{item.icon}</span>
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* For Projects */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: '#7c3aed' }}>
            For Projects
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-3" style={{ color: 'var(--text-primary)' }}>
            Prove your progress, get funded
          </h2>
          <p className="text-[14px] leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            If you&apos;re building something that matters, ImpactHook gives you a new way to get funded.
            Create a pool, define your milestones, and let the trading community fund your work.
            No pitch decks. No grant committees. Just verified results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestone proof cards */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Project View</span>
                <span className="text-[10px] px-2 py-0.5" style={{ color: 'var(--success)', border: '1px solid rgba(5, 150, 105, 0.2)', background: 'rgba(5, 150, 105, 0.05)', borderRadius: 6 }}>
                  Funding Active
                </span>
              </div>
              <div className="font-display text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Clean Water - Chiapas Schools</div>

              <div className="flex flex-col gap-3">
                <MilestoneProof index={0} name="Baseline water testing" status="verified" proof="Tx: 0xa4f2...8b1c" date="Feb 14, 2026" feeBps={0} />
                <MilestoneProof index={1} name="Systems installed in 20 schools" status="verified" proof="Tx: 0x7e91...3d4a" date="Mar 2, 2026" feeBps={200} />
                <MilestoneProof index={2} name="3-month water quality verified" status="pending" proof="Awaiting verification" date="" feeBps={300} />
                <MilestoneProof index={3} name="Community management trained" status="locked" proof="" date="" feeBps={100} />
              </div>
            </div>

            {/* Funding summary + dual channels */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <div className="text-[11px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Funding summary</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--text-primary)' }}>1.247</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH earned</div>
                  </div>
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--text-primary)' }}>0.831</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH withdrawn</div>
                  </div>
                  <div>
                    <div className="font-data text-[15px]" style={{ color: 'var(--accent)' }}>0.416</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH available</div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-data text-[14px]" style={{ color: 'var(--accent)' }}>1</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Swap Fees</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  A small fee on swap output, configured per milestone. Continuous funding from trading volume.
                </p>
              </div>

              <div className="card p-5" style={{ borderLeft: '3px solid var(--accent)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-data text-[14px]" style={{ color: 'var(--accent)' }}>2</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>LP Fee Skim</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  A percentage of LP earnings goes to the project. Swap pricing stays identical to regular pools - routers have no reason to skip it. LPs opt in. This is the key to router-competitive impact funding.
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-data text-[14px]" style={{ color: 'var(--accent)' }}>3</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Native v4 Donate Skim</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  When someone tips LPs via PoolManager.donate(), a share is routed to the project via the afterDonate hook.
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-data text-[14px]" style={{ color: 'var(--accent)' }}>4</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Direct Donations</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  Anyone can donate ERC20 or native ETH directly. Same milestone-gated withdrawal rules apply.
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-data text-[14px]" style={{ color: '#7c3aed' }}>5</span>
                  <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Institutional Escrow</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  Alkahest integration (Zellic-audited) gates grant release on the same milestone state. All five channels share one source of truth.
                </p>
              </div>

              <div className="p-4" style={{ background: 'rgba(13, 148, 136, 0.04)', border: '1px solid rgba(13, 148, 136, 0.1)', borderRadius: 8 }}>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Five funding channels, one source of truth. All gated by the same milestones, heartbeat expiration, and per-project pause controls. Dead projects auto-expire. No manual intervention needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '48px 0' }} />

        {/* Direct donations */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="font-display text-[18px] mb-4" style={{ color: 'var(--text-primary)' }}>
            Direct donations
          </h2>
          <p className="text-[14px] leading-relaxed mb-6 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Beyond swap fees, anyone can donate directly to a project&apos;s fund - institutions,
            DAOs, and individuals contribute alongside continuous DeFi funding. Same milestone-gated
            rules apply. No money moves until milestones are verified.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent)' }}>ERC20</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Approve and donate any ERC20 token. SafeERC20 handles non-standard tokens.
              </p>
            </div>
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent)' }}>Native ETH</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Send ETH directly. No approval needed.
              </p>
            </div>
            <div className="card p-5">
              <div className="font-data text-[14px] mb-2" style={{ color: 'var(--accent)' }}>Same rules</div>
              <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                Donations accumulate alongside swap fees. Same recipient, same withdrawal process.
              </p>
            </div>
          </div>
        </div>

        {/* UNICEF alignment */}
        <div className="divider" style={{ margin: '48px 0' }} />

        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--success)' }}>
            Alignment
          </span>
          <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] mt-3 mb-6" style={{ color: 'var(--text-primary)' }}>
            Built for real-world impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                area: "Health & WASH",
                example: "e.g. school water purification in Chiapas or Guanajuato",
                how: "Organizations installing water systems for children could use milestone-gated funding - each verified installation unlocks the next tranche.",
              },
              {
                area: "Nutrition",
                example: "e.g. child nutrition programs in Oaxaca or Guerrero",
                how: "Programs delivering food to children under 5 have natural milestone cycles that map directly to on-chain verification checkpoints.",
              },
              {
                area: "Education & Climate",
                example: "e.g. solar-powered schools, digital literacy programs",
                how: "Each solar installation or computer lab is a discrete, verifiable milestone with measurable child outcomes.",
              },
              {
                area: "Global Expansion",
                example: "Starting in Mexico, designed for any programme country",
                how: "Cross-chain verification lets projects anywhere prove milestones to funders on Unichain. The protocol is permissionless.",
              },
            ].map((item) => (
              <div key={item.area} className="card p-5">
                <div className="font-display text-[14px] mb-1" style={{ color: 'var(--text-primary)' }}>{item.area}</div>
                <div className="text-[12px] mb-3" style={{ color: 'var(--accent)' }}>{item.example}</div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{item.how}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card card-glow p-8 text-center animate-fade-up">
          <h3 className="font-display text-[18px] mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to create impact?
          </h3>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            Register a project, start trading in an impact pool, or donate directly.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard" className="cta-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide" style={{ borderRadius: 6 }}>
              Launch App
            </a>
            <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide"
               style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, textDecoration: 'none' }}>
              View Source
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
