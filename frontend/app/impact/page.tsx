"use client";

import Link from "next/link";
import { Navigation } from "../../components/Navigation";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MilestoneProof({ name, status, proof, date, feeBps }: {
  name: string; status: 'verified' | 'pending' | 'locked';
  proof: string; date: string; feeBps: number;
}) {
  const colors = {
    verified: { bg: 'rgba(13, 148, 136, 0.06)', border: 'rgba(13, 148, 136, 0.15)', text: 'var(--accent)' },
    pending: { bg: 'rgba(124, 58, 237, 0.06)', border: 'rgba(124, 58, 237, 0.15)', text: '#7c3aed' },
    locked: { bg: 'var(--bg-elevated)', border: 'var(--border-subtle)', text: 'var(--text-dim)' },
  };
  const c = colors[status];

  return (
    <div className="p-3" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "var(--radius-sm)" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {status === 'verified' && <span style={{ color: c.text }}><CheckIcon /></span>}
          {status === 'pending' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-2 h-2 rounded-full" style={{ background: c.text }} /></span>}
          {status === 'locked' && <span className="w-3 h-3 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }} /></span>}
          <span className="text-xs" style={{ color: status === 'locked' ? 'var(--text-dim)' : 'var(--text-primary)' }}>{name}</span>
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
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-article" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead">Why This Matters</div>
          <h1 className="heading-xl mt-3 mb-6" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)" }}>
            Liquidity with purpose
          </h1>
          <p className="text-body" style={{ fontSize: 15, maxWidth: 640, lineHeight: 1.7 }}>
            45.8% of children in Mexico live in poverty. In rural Chiapas, 44% of children under 5
            are stunted. $2.5 trillion in daily crypto trading volume generates zero social
            impact. ImpactHook connects the two.
          </p>
        </div>

        {/* The problem */}
        <div className="card card-accent p-6 animate-fade-up delay-100" style={{ marginBottom: 24 }}>
          <p className="text-small" style={{ lineHeight: 1.7, margin: 0 }}>
            You want to fund projects that help children. But you don&apos;t have time to research every
            organization, track where your money goes, or follow up months later to see if children
            actually received clean water, meals, or school supplies.
            ImpactHook handles all of that. The Uniswap v4 hook only releases funds when milestones are
            verified onchain. You see the outcomes without doing the work.
          </p>
        </div>

        {/* A new class of pool */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-6">A new class of liquidity pool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Impact-differentiated", text: "Pools defined by what they fund, not just token pair and fee tier. Clean water, school meals, rural solar." },
              { label: "Continuous", text: "Funding flows with every swap, not once-a-year grants. Sustained support through Uniswap v4 hook fee routing." },
              { label: "Milestone-gated", text: "No results, no funding. Water systems must be installed before the next tranche releases." },
              { label: "Cross-chain verified", text: "Milestones confirmed from any chain via Reactive Network. No bridges needed." },
              { label: "Permissionless", text: "Any organization serving children can create an impact pool. No gatekeepers." },
              { label: "Zero-friction", text: "Same tokens, same swap, different impact. Just pick a pool." },
            ].map((item) => (
              <div key={item.label} className="card p-4 flex gap-3 items-start">
                <span className="font-data mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)', fontSize: 11 }}>+</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}. </span>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Accountability */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: 'var(--success)' }}>Accountability</div>
          <h2 className="heading-md mt-3 mb-3">Full transparency, by default</h2>
          <p className="text-body mb-8" style={{ maxWidth: 640 }}>
            Not because we chose to be transparent. Because the protocol makes it impossible not to be.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Every fee onchain", desc: "Every swap fee is recorded as a FeesAccumulated event. Anyone can verify the exact amount collected for any project at any time.", icon: "{}" },
              { label: "Milestones are permanent", desc: "Milestone verifications are immutable onchain events. EAS attestations add an additional layer of credibly neutral proof.", icon: "[]" },
              { label: "Withdrawals are public", desc: "Every withdrawal is a FeesWithdrawn event with the recipient address and exact amount. No money moves without a visible onchain record.", icon: "->" },
              { label: "Heartbeat expiration", desc: "Projects must send periodic proof-of-life or fees stop automatically. Dead projects auto-expire without manual intervention.", icon: "~~" },
              { label: "Per-project controls", desc: "Individual projects can be paused without affecting others. Progressive decentralization from owner-gated to fully permissionless.", icon: "||" },
              { label: "Open source, auditable", desc: "All contracts verified onchain, source code public on GitHub. 174 tests, 94% line coverage. Audited with Slither and Feynman.", icon: "<>" },
            ].map((item) => (
              <div key={item.label} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-data" style={{ fontSize: 14, color: 'var(--success)' }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* For Projects */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: '#7c3aed' }}>For Projects</div>
          <h2 className="heading-md mt-3 mb-3">Prove your progress, get funded</h2>
          <p className="text-body mb-8" style={{ maxWidth: 640 }}>
            If you&apos;re building something that matters, ImpactHook gives you a new way to get funded.
            Create a pool, define your milestones, and let the trading community fund your work.
            No pitch decks. No grant committees. Just verified results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestone proof cards */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label" style={{ marginBottom: 0 }}>Project View</span>
                <span className="badge badge-success" style={{ fontSize: 10, padding: "2px 8px" }}>Funding Active</span>
              </div>
              <div className="heading-sm mb-4" style={{ fontSize: 14 }}>Clean Water - Chiapas Schools</div>

              <div className="flex flex-col gap-3">
                <MilestoneProof name="Baseline water testing" status="verified" proof="Tx: 0xa4f2...8b1c" date="Feb 14, 2026" feeBps={0} />
                <MilestoneProof name="Systems installed in 20 schools" status="verified" proof="Tx: 0x7e91...3d4a" date="Mar 2, 2026" feeBps={200} />
                <MilestoneProof name="3-month water quality verified" status="pending" proof="Awaiting verification" date="" feeBps={300} />
                <MilestoneProof name="Community management trained" status="locked" proof="" date="" feeBps={100} />
              </div>
            </div>

            {/* Funding summary + 5 channels */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <div className="text-label mb-3" style={{ marginBottom: 12 }}>Funding summary</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-data" style={{ fontSize: 15, color: 'var(--text-primary)' }}>1.247</div>
                    <div className="text-caption">ETH earned</div>
                  </div>
                  <div>
                    <div className="font-data" style={{ fontSize: 15, color: 'var(--text-primary)' }}>0.831</div>
                    <div className="text-caption">ETH withdrawn</div>
                  </div>
                  <div>
                    <div className="font-data" style={{ fontSize: 15, color: 'var(--accent)' }}>0.416</div>
                    <div className="text-caption">ETH available</div>
                  </div>
                </div>
              </div>

              {[
                { num: "1", title: "Swap Fees", desc: "A configurable fee on swap output, captured by the Uniswap v4 afterSwap hook. Continuous funding from trading volume.", accent: false },
                { num: "2", title: "LP Fee Skim", desc: "A percentage of LP earnings goes to the project via afterAddLiquidity. Swap pricing stays identical to regular pools. LPs opt in. Key to router-competitive impact funding.", accent: true },
                { num: "3", title: "Native v4 Donate Skim", desc: "When someone tips LPs via PoolManager.donate(), a share is routed to the project via the afterDonate hook.", accent: false },
                { num: "4", title: "Direct Donations", desc: "Anyone can donate ERC20 or native ETH directly. Same milestone-gated withdrawal rules apply.", accent: false },
                { num: "5", title: "Institutional Escrow", desc: "Alkahest integration (Zellic-audited) gates grant release on the same milestone state. All five channels share one source of truth.", accent: false, color: "#7c3aed" },
              ].map((ch) => (
                <div key={ch.num} className="card p-5" style={ch.accent ? { borderLeft: '3px solid var(--accent)' } : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-data" style={{ fontSize: 14, color: ch.color || 'var(--accent)' }}>{ch.num}</span>
                    <span className="text-label" style={{ marginBottom: 0 }}>{ch.title}</span>
                  </div>
                  <p className="text-caption" style={{ lineHeight: 1.6 }}>{ch.desc}</p>
                </div>
              ))}

              <div className="p-4" style={{ background: 'var(--accent-bg)', border: '1px solid rgba(13, 148, 136, 0.1)', borderRadius: "var(--radius-sm)" }}>
                <p className="text-caption" style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  Five funding channels, one source of truth. All gated by the same milestones, heartbeat expiration, and per-project pause controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Agent verification */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: '#3b82f6' }}>Autonomous Accountability</div>
          <h2 className="heading-md mt-3 mb-3">AI agent verifies milestones</h2>
          <p className="text-body mb-8" style={{ maxWidth: 640 }}>
            Milestone verification is the bottleneck in impact funding. An autonomous AI agent
            closes the loop: it monitors evidence uploads, analyzes them using Claude, and creates a permanent,
            decentralized audit trail on Filecoin. No human bottleneck. No trust gap.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Watches", desc: "Monitors EvidenceAttached events onchain. When a project uploads evidence to Storacha or Filecoin, the agent detects it automatically." },
              { title: "Analyzes", desc: "Retrieves the evidence (images, documents, data), evaluates it against the milestone criteria using Claude, and produces a structured verdict." },
              { title: "Verifies", desc: "If confident, submits the verification onchain. The report is stored permanently on Filecoin. Anyone can audit why the agent approved or rejected." },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="font-data mb-2" style={{ fontSize: 14, color: '#3b82f6' }}>{item.title}</div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="card p-4 mt-4" style={{ borderLeft: '2px solid #3b82f6' }}>
            <p className="text-caption" style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              When the agent verifies a milestone, Alkahest escrow funds release automatically.
              Evidence upload, AI analysis, onchain verification, escrow release. The complete
              accountability cycle, fully autonomous.
            </p>
          </div>
        </div>

        <div className="divider" />

        {/* Direct donations */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Direct donations</h2>
          <p className="text-body mb-6" style={{ maxWidth: 640 }}>
            Beyond swap fees, anyone can donate directly. Institutions, DAOs, and individuals
            contribute alongside continuous DeFi funding. Same milestone-gated rules apply.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "ERC20", desc: "Approve and donate any ERC20 token. SafeERC20 handles non-standard tokens." },
              { title: "Native ETH", desc: "Send ETH directly. No approval needed." },
              { title: "Same rules", desc: "Donations accumulate alongside swap fees. Same recipient, same milestone-gated withdrawal." },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="font-data mb-2" style={{ fontSize: 14, color: 'var(--accent)' }}>{item.title}</div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Alignment */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: 'var(--success)' }}>Alignment</div>
          <h2 className="heading-md mt-3 mb-6">Built for real-world impact</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { area: "Health & WASH", example: "e.g. school water purification in Chiapas", how: "Organizations installing water systems for children could use milestone-gated funding. Each verified installation unlocks the next tranche." },
              { area: "Nutrition", example: "e.g. child nutrition programs in Oaxaca", how: "Programs delivering food to children under 5 have natural milestone cycles that map directly to onchain verification checkpoints." },
              { area: "Education & Climate", example: "e.g. solar-powered schools, digital literacy", how: "Each solar installation or computer lab is a discrete, verifiable milestone with measurable child outcomes." },
              { area: "Global Expansion", example: "Starting in Mexico, designed for any programme country", how: "Cross-chain verification via Reactive Network lets projects anywhere prove milestones to funders on Unichain." },
            ].map((item) => (
              <div key={item.area} className="card p-5">
                <div className="heading-sm" style={{ fontSize: 14, marginBottom: 4 }}>{item.area}</div>
                <div className="text-caption mb-3" style={{ color: 'var(--accent)' }}>{item.example}</div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.how}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card p-8 text-center animate-fade-up">
          <h3 className="heading-sm mb-3">Ready to create impact?</h3>
          <p className="text-small mb-6" style={{ margin: "0 auto 24px", maxWidth: 400 }}>
            Register a project, start trading in an impact pool, or donate directly.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="btn-primary">
              Launch App
            </Link>
            <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              View Source
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
