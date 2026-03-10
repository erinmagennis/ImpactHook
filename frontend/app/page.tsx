"use client";

import { useState, useEffect } from "react";

function ScrollNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 56,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(5,5,8,0.88)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <span
        className="font-display"
        style={{ fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}
      >
        <span className="text-hero-gradient">Impact</span>Hook
      </span>
      <a
        href="/dashboard"
        className="cta-primary"
        style={{
          padding: "8px 16px",
          fontSize: 13,
          borderRadius: 2,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Launch App
      </a>
    </nav>
  );
}

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

const IMPACT_EXAMPLES = [
  {
    title: "Clean Water in Rural Kenya",
    description: "Solar-powered filtration for 3 villages. Milestones track equipment delivery, installation, and first clean water served.",
    milestones: ["Equipment sourced", "Installation complete", "First 1,000 liters filtered", "Community-maintained"],
    category: "Public Health",
    accent: "cyan",
    funded: "0.82 ETH",
    beneficiaries: "~1,200 people",
  },
  {
    title: "Open Source Climate Data",
    description: "Public dataset of real-time deforestation tracking from satellite imagery. Funding flows as data milestones hit.",
    milestones: ["Data pipeline live", "First 10 regions covered", "API public launch", "Peer reviewed"],
    category: "Climate / DeSci",
    accent: "emerald",
    funded: "0.31 ETH",
    beneficiaries: "Open access",
  },
  {
    title: "School Meals in Oaxaca",
    description: "Daily meals for 200 students via a local cooperative. No middlemen. Every dollar visible on-chain.",
    milestones: ["Kitchen operational", "First 1,000 meals served", "Expanded to 2nd school", "Full year sustained"],
    category: "Education",
    accent: "violet",
    funded: "0.14 ETH",
    beneficiaries: "200 students",
  },
];

const PORTFOLIO_ITEMS = [
  {
    project: "Clean Water - Kenya",
    contributed: "0.047 ETH",
    milestones: "2/4 verified",
    status: "active",
    outcome: "812 people now have access to filtered water",
  },
  {
    project: "Climate Data API",
    contributed: "0.023 ETH",
    milestones: "1/4 verified",
    status: "active",
    outcome: "Pipeline processing 3 regions of satellite data",
  },
  {
    project: "School Meals - Oaxaca",
    contributed: "0.011 ETH",
    milestones: "1/4 verified",
    status: "active",
    outcome: "Kitchen serving 200 students daily",
  },
];

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

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.2"/>
      <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 6.5h14M2 11.5h14" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 7h14" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="13" cy="10.5" r="1" fill="currentColor"/>
      <path d="M5 4V3.5a2 2 0 012-2h4a2 2 0 012 2V4" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

/* == HERO ================================================= */

function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-6 bg-mesh scanline overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tag */}
        <div className="animate-fade-up delay-100 mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase"
                style={{ color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238, 0.15)', background: 'rgba(34, 211, 238, 0.04)' }}>
            Uniswap v4 Hook
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            Built for Real-World Impact
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up delay-200 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] font-display tracking-tight mb-6">
          <span style={{ color: 'var(--text-bright)' }}>Swap for</span>
          <br />
          <span className="text-gradient-full">impact</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up delay-300 text-[clamp(1rem,2.2vw,1.2rem)] leading-relaxed max-w-2xl mx-auto mb-10"
           style={{ color: 'var(--text-mid)' }}>
          Pick a pool that funds clean water, school meals, or climate research.
          Swap the same tokens you already trade. Funding only flows when milestones
          are proven on-chain.
        </p>

        {/* Stats row with tagline */}
        <div className="animate-fade-up delay-400 mb-4">
          <span className="text-[12px] tracking-[0.1em] uppercase" style={{ color: 'var(--accent-cyan)' }}>
            Impact on autopilot
          </span>
        </div>
        <div className="animate-fade-up delay-500 flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
          <Stat label="Funded" value="1.247 ETH" />
          <Stat label="Impact Fee" value="2.00%" />
          <Stat label="Milestones Verified" value="2 / 4" />
          <Stat label="Swaps" value="1,847" />
        </div>

        {/* CTA */}
        <div className="animate-fade-up delay-600 flex flex-col items-center gap-5">
          <a href="/dashboard"
             className="cta-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide transition-all hover:scale-[1.02]">
            Create Impact
          </a>
          <a href="#impact"
             className="inline-flex items-center gap-2 text-[13px] tracking-wide transition-all hover:opacity-80"
             style={{ color: 'var(--text-mid)' }}>
            See how it works <span style={{ color: 'var(--accent-cyan)' }}>&#8595;</span>
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

/* == IMPACT EXAMPLES ====================================== */

function ImpactShowcase() {
  return (
    <section id="impact" className="relative impact-gradient py-28 px-6">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-emerald)' }}>Real World Impact</span>
          <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] mt-3 mb-6" style={{ color: 'var(--text-bright)' }}>
            What your swaps can fund
          </h2>
          <p className="text-[15px] leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-mid)' }}>
            Same tokens, same liquidity. The only difference is where a small percentage of your swap goes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {IMPACT_EXAMPLES.map((example, i) => {
            const accentColors: Record<string, string> = {
              cyan: 'var(--accent-cyan)',
              emerald: 'var(--accent-emerald)',
              violet: 'var(--accent-violet)',
            };
            const color = accentColors[example.accent];

            return (
              <div key={example.title} className="impact-card p-6 flex flex-col animate-fade-up" style={{ animationDelay: `${200 + i * 150}ms` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5"
                        style={{ color, border: `1px solid ${color}33`, background: `${color}0d` }}>
                    {example.category}
                  </span>
                </div>
                <h3 className="font-display text-[15px] mb-3" style={{ color: 'var(--text-bright)' }}>
                  {example.title}
                </h3>
                <p className="text-[13px] leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-mid)' }}>
                  {example.description}
                </p>

                {/* Funding stats */}
                <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div className="font-data text-[14px]" style={{ color }}>{example.funded}</div>
                    <div className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Funded</div>
                  </div>
                  <div>
                    <div className="text-[14px]" style={{ color: 'var(--text-bright)' }}>{example.beneficiaries}</div>
                    <div className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Reached</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Milestones</div>
                  <div className="flex flex-col gap-2">
                    {example.milestones.map((m, j) => (
                      <div key={m} className="flex items-center gap-2">
                        {j < 2 ? (
                          <span style={{ color }}><CheckIcon /></span>
                        ) : (
                          <span className="w-3 h-3 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                          </span>
                        )}
                        <span className="text-[11px]" style={{ color: j < 2 ? 'var(--text-mid)' : 'var(--text-dim)' }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* == HOW IT WORKS (for everyone) ========================== */

function HowItWorks() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="How It Works" title="Three steps. Zero friction."
          subtitle="$2.5 trillion in daily crypto volume generates zero social impact. ImpactHook changes that." />

        {/* Trader flow */}
        <div className="mt-16 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: 'var(--accent-cyan)' }}><WalletIcon /></span>
            <span className="text-[12px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-cyan)' }}>For Traders & Funders</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard num="01" title="Choose a pool" color="var(--accent-cyan)"
              desc="You want to swap USDC for ETH. Two pools, same pair. One funds clean water in Kenya. You pick that one." />
            <StepCard num="02" title="Swap normally" color="var(--accent-cyan)"
              desc="Same tokens, same Uniswap interface. A small fee (currently 2%) goes to the project. LPs earn full yield." />
            <StepCard num="03" title="It runs in the background" color="var(--accent-cyan)"
              desc="Funding flows automatically. If the project keeps hitting milestones, your trades keep fueling it. If progress stops, funding stops." />
          </div>
        </div>

        {/* Project flow */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: 'var(--accent-violet)' }}><GlobeIcon /></span>
            <span className="text-[12px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-violet)' }}>For Impact Projects</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard num="01" title="Register your project" color="var(--accent-violet)"
              desc="Define milestones, fee tiers (up to 5%), and set your verifier - a multisig, DAO, oracle, or cross-chain RSC." />
            <StepCard num="02" title="Hit milestones" color="var(--accent-violet)"
              desc="Do the work. Verifier confirms on-chain. Fee tier adjusts and funding grows." />
            <StepCard num="03" title="Withdraw" color="var(--accent-violet)"
              desc="Accumulated fees go directly to you. No middlemen. No delays." />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ num, title, desc, color, small }: {
  num: string; title: string; desc: string; color: string; small?: boolean;
}) {
  return (
    <div className={`card ${small ? 'p-5' : 'p-6'} animate-fade-up`}>
      <div className={`font-data ${small ? 'text-lg' : 'text-2xl'} mb-3`} style={{ color }}>{num}</div>
      <h3 className={`font-display ${small ? 'text-[13px]' : 'text-sm'} mb-2`} style={{ color: 'var(--text-bright)' }}>{title}</h3>
      <p className={`${small ? 'text-[12px]' : 'text-[13px]'} leading-relaxed`} style={{ color: 'var(--text-dim)' }}>{desc}</p>
    </div>
  );
}

/* == IMPACT PORTFOLIO (NEW - for funders) ================= */

function ImpactPortfolio() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="For Funders"
          title="Your impact portfolio"
          subtitle="Every swap through an impact pool is tracked. See what you funded and what it achieved."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-16">
          {/* Portfolio summary */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card card-glow p-6">
              <div className="text-[11px] tracking-[0.12em] uppercase mb-4" style={{ color: 'var(--text-dim)' }}>Your Impact Summary</div>
              <div className="font-data text-3xl mb-1" style={{ color: 'var(--text-bright)' }}>
                0.081 <span className="text-lg" style={{ color: 'var(--text-dim)' }}>ETH</span>
              </div>
              <div className="text-[12px] mb-6" style={{ color: 'var(--text-dim)' }}>Total contributed across 3 projects</div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-data text-[18px]" style={{ color: 'var(--accent-emerald)' }}>3</div>
                  <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>Projects funded</div>
                </div>
                <div>
                  <div className="font-data text-[18px]" style={{ color: 'var(--accent-cyan)' }}>4</div>
                  <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>Milestones verified</div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Your portfolio builds automatically from your swaps. No opt-in required.
              </p>
            </div>
          </div>

          {/* Project list */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            {PORTFOLIO_ITEMS.map((item, i) => (
              <div key={item.project} className="card p-5 animate-fade-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>{item.project}</span>
                  <span className="text-[10px] tracking-wider uppercase px-2 py-0.5"
                        style={{ color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.2)', background: 'rgba(52, 211, 153, 0.05)' }}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <span className="font-data text-[13px]" style={{ color: 'var(--accent-cyan)' }}>{item.contributed}</span>
                    <span className="text-[10px] ml-1" style={{ color: 'var(--text-dim)' }}>contributed</span>
                  </div>
                  <div>
                    <span className="text-[13px]" style={{ color: 'var(--text-mid)' }}>{item.milestones}</span>
                  </div>
                </div>
                <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Latest outcome</div>
                  <p className="text-[12px]" style={{ color: 'var(--accent-emerald)' }}>{item.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* == TRANSPARENCY ========================================= */

function Transparency() {
  const items = [
    {
      label: "Every fee on-chain",
      desc: "Swap fees are recorded as events. Anyone can verify the exact amount collected for any project.",
      icon: "{}",
    },
    {
      label: "Milestones are permanent",
      desc: "Verifications are immutable on-chain. EAS attestations add an additional layer of proof.",
      icon: "[]",
    },
    {
      label: "Withdrawals are public",
      desc: "Every withdrawal includes the recipient address and exact amount. No money moves without a record.",
      icon: "->",
    },
    {
      label: "Open source, auditable",
      desc: "Contracts verified on-chain, source code public on GitHub. Read the logic, run the tests, or fork it.",
      icon: "<>",
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Accountability"
          title="Transparent by design"
          subtitle="Every fee, milestone, and withdrawal is recorded on-chain and publicly verifiable."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          {items.map((item, i) => (
            <div key={item.label} className="card p-6 animate-fade-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-data text-[14px]" style={{ color: 'var(--accent-emerald)' }}>{item.icon}</span>
                <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>{item.label}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Direct donation */}
        <div className="mt-6 card card-glow p-6 animate-fade-up delay-600">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-[14px]" style={{ color: 'var(--accent-cyan)' }}>+</span>
            <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>Direct donations</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            Anyone can donate directly to a project. Same milestone-gated rules apply.
            Two funding paths, one source of truth.
          </p>
        </div>
      </div>
    </section>
  );
}

/* == DISCOVER PROJECTS ==================================== */

const UNICEF_FOCUS_AREAS = [
  "All",
  "Health",
  "Education",
  "WASH",
  "Climate",
  "Nutrition",
  "Child Protection",
  "Social Inclusion",
  "DeSci",
  "Infrastructure",
];

const DISCOVERABLE_PROJECTS = [
  {
    name: "Clean Water - Kenya",
    tags: ["Health", "WASH"],
    status: "active" as const,
    funded: "0.82 ETH",
    milestones: "2/4",
    fee: "200 bps",
    accent: "cyan",
  },
  {
    name: "Climate Data API",
    tags: ["Climate", "DeSci"],
    status: "active" as const,
    funded: "0.31 ETH",
    milestones: "1/4",
    fee: "100 bps",
    accent: "emerald",
  },
  {
    name: "School Meals - Oaxaca",
    tags: ["Education", "Nutrition"],
    status: "active" as const,
    funded: "0.14 ETH",
    milestones: "1/4",
    fee: "150 bps",
    accent: "violet",
  },
  {
    name: "Solar Microgrids - Haiti",
    tags: ["Infrastructure", "Climate"],
    status: "upcoming" as const,
    funded: "0 ETH",
    milestones: "0/3",
    fee: "100 bps",
    accent: "amber",
  },
  {
    name: "Vaccine Cold Chain - DRC",
    tags: ["Health", "Child Protection"],
    status: "active" as const,
    funded: "0.09 ETH",
    milestones: "1/3",
    fee: "200 bps",
    accent: "cyan",
  },
  {
    name: "Open Textbooks - Global",
    tags: ["Education", "Social Inclusion"],
    status: "upcoming" as const,
    funded: "0 ETH",
    milestones: "0/5",
    fee: "50 bps",
    accent: "violet",
  },
];

function DiscoverProjects() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All"
    ? DISCOVERABLE_PROJECTS
    : DISCOVERABLE_PROJECTS.filter(p => p.tags.includes(activeTag));

  const accentMap: Record<string, string> = {
    cyan: 'var(--accent-cyan)',
    emerald: 'var(--accent-emerald)',
    violet: 'var(--accent-violet)',
    amber: 'var(--accent-amber)',
  };

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Discover"
          title="Find projects to fund"
          subtitle="Filter by UNICEF focus area, cause, or category. Every project is permissionless and milestone-gated."
        />

        {/* Tag filter */}
        <div className="mt-10 flex flex-wrap gap-2 animate-fade-up delay-200">
          {UNICEF_FOCUS_AREAS.map(tag => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  color: isActive ? '#fff' : 'var(--text-dim)',
                  background: isActive
                    ? 'rgba(34, 211, 238, 0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(34, 211, 238, 0.3)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {filtered.map((project, i) => {
            const color = accentMap[project.accent];
            return (
              <div
                key={project.name}
                className="card p-5 animate-fade-up flex flex-col"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-[14px]" style={{ color: 'var(--text-bright)' }}>
                    {project.name}
                  </span>
                  <span
                    className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5"
                    style={{
                      color: project.status === 'active' ? 'var(--accent-emerald)' : 'var(--text-dim)',
                      border: `1px solid ${project.status === 'active' ? 'rgba(52, 211, 153, 0.2)' : 'var(--border-subtle)'}`,
                      background: project.status === 'active' ? 'rgba(52, 211, 153, 0.05)' : 'transparent',
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider px-2 py-0.5"
                      style={{
                        color: color,
                        border: `1px solid ${color}33`,
                        background: `${color}0d`,
                        borderRadius: 2,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 mt-auto pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div className="font-data text-[13px]" style={{ color: 'var(--text-bright)' }}>{project.funded}</div>
                    <div className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>Funded</div>
                  </div>
                  <div>
                    <div className="font-data text-[13px]" style={{ color: 'var(--text-mid)' }}>{project.milestones}</div>
                    <div className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>Milestones</div>
                  </div>
                  <div>
                    <div className="font-data text-[13px]" style={{ color }}>{project.fee}</div>
                    <div className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>Impact fee</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card p-10 mt-8 text-center animate-fade-up">
            <p className="text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No projects in this category yet. Anyone can register an impact pool.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* == DASHBOARD ============================================ */

function DashboardSection() {
  const currentMilestoneIdx = MILESTONES.findIndex(m => !m.verified);
  const progress = (MILESTONES.filter(m => m.verified).length / MILESTONES.length) * 100;

  return (
    <section id="dashboard" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Live Data" title="Pool dashboard" subtitle="Real-time hook state and milestone progress from Unichain Sepolia." />

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
              <div className="text-[11px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text-dim)' }}>Impact fee tier</div>
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

/* == ARCHITECTURE + TESTING ================================ */

function Architecture() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Under the Hood" title="Architecture" subtitle="Four contracts across three chains, one shared milestone state." />

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
            description="Alkahest IArbiter - gates escrow release on verified milestone state"
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
            description="Origin chain contract - emits MilestoneSubmitted events for cross-chain verification"
            chain="Any Origin"
            accent="amber"
          />
        </div>

        {/* Code snippet */}
        <div className="mt-4 card p-6 overflow-x-auto">
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

poolManager.take(feeCurrency, address(this), feeAmount);
accumulatedFees[poolId][feeCurrency] += feeAmount;

return (this.afterSwap.selector, int128(int256(feeAmount)));`}</code>
          </pre>
        </div>

        {/* Test coverage - merged */}
        <div className="card p-6 mt-4">
          <div className="flex items-center gap-4">
            <div className="font-data text-3xl" style={{ color: 'var(--accent-emerald)' }}>102</div>
            <div>
              <div className="text-[13px]" style={{ color: 'var(--text-bright)' }}>tests passing</div>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>0 failed, 0 skipped</div>
            </div>
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

/* == LEARN MORE =========================================== */

function LearnMore() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Go Deeper" title="For institutions and builders" subtitle="Detailed pages for UNICEF reviewers and Hookathon judges." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
          <a href="/impact" className="card card-glow p-8 group transition-all" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-data text-[18px]" style={{ color: 'var(--accent-emerald)' }}>01</span>
              <span className="font-display text-[16px]" style={{ color: 'var(--text-bright)' }}>Impact & Accountability</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
              Why this exists, how accountability works, dual funding channels,
              UNICEF focus area alignment, and the full transparency model.
            </p>
            <span className="text-[12px] tracking-wide" style={{ color: 'var(--accent-emerald)' }}>
              Read more &#8594;
            </span>
          </a>

          <a href="/technical" className="card card-glow p-8 group transition-all" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-data text-[18px]" style={{ color: 'var(--accent-cyan)' }}>02</span>
              <span className="font-display text-[16px]" style={{ color: 'var(--text-bright)' }}>Technical Deep Dive</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
              Architecture, cross-chain verification flow, code snippets,
              102 tests, deployed contracts, and EAS integration.
            </p>
            <span className="text-[12px] tracking-wide" style={{ color: 'var(--accent-cyan)' }}>
              Read more &#8594;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* == PARTNERS ============================================= */

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
        <SectionHeader label="Ecosystem" title="Built with" subtitle="Partner protocols and infrastructure powering ImpactHook." />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {partners.map((p, i) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
               className="card p-6 text-center group transition-all animate-fade-up"
               style={{ animationDelay: `${200 + i * 100}ms` }}>
              <div className="font-display text-[15px] mb-2 transition-colors"
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

/* == FOOTER =============================================== */

function Footer() {
  return (
    <footer className="py-16 px-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-sm" style={{ color: 'var(--text-dim)' }}>
          ImpactHook / UHI Hookathon 2026
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

/* == SHARED =============================================== */

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="animate-fade-up">
      <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-cyan)' }}>{label}</span>
      <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] mt-2" style={{ color: 'var(--text-bright)' }}>{title}</h2>
      {subtitle && <p className="text-[14px] mt-2 max-w-2xl" style={{ color: 'var(--text-mid)' }}>{subtitle}</p>}
    </div>
  );
}

/* == PAGE ================================================= */

export default function Home() {
  return (
    <main>
      <ScrollNav />
      <Hero />
      <div className="divider" />
      <ImpactShowcase />
      <div className="divider" />
      <DiscoverProjects />
      <div className="divider" />
      <HowItWorks />
      <div className="divider" />
      <ImpactPortfolio />
      <div className="divider" />
      <Transparency />
      <div className="divider" />
      <DashboardSection />
      <div className="divider" />
      <Architecture />
      <div className="divider" />
      <LearnMore />
      <div className="divider" />
      <Partners />
      <Footer />
    </main>
  );
}
