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
          <span className="text-gradient-full">Every swap</span>
          <br />
          <span style={{ color: 'var(--text-bright)' }}>funds what matters</span>
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
            Choose once. Fund forever.
          </span>
        </div>
        <div className="animate-fade-up delay-500 flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
          <Stat label="Funded" value="1.247 ETH" />
          <Stat label="Impact Fee" value="2.00%" />
          <Stat label="Milestones Verified" value="2 / 4" />
          <Stat label="Swaps" value="1,847" />
        </div>

        {/* CTA */}
        <div className="animate-fade-up delay-600 flex flex-wrap gap-4 justify-center">
          <a href="/dashboard"
             className="cta-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold tracking-wide transition-all hover:scale-[1.02]">
            Launch App
          </a>
          <a href="#impact"
             className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-all hover:scale-[1.02]"
             style={{ background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.25)', color: 'var(--accent-cyan)' }}>
            See the impact
          </a>
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-all hover:scale-[1.02]"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-mid)' }}>
            View Source <ExternalIcon />
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
            Any project can create a pool. Traders pick the cause they care about.
            Same tokens, same price, same liquidity - the only difference is where a small
            percentage of your swap goes. And it only goes when milestones are verified.
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
        <SectionHeader label="How It Works" title="Three steps. Zero friction." />

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
              desc="Funding happens automatically with every swap. No follow-up needed. As long as the project keeps hitting milestones, your trades keep fueling it. If progress stops, funding stops. Check your impact portfolio any time." />
          </div>
        </div>

        {/* Key message */}
        <div className="p-6 text-center animate-fade-up delay-500"
             style={{ background: 'rgba(34, 211, 238, 0.03)', border: '1px solid rgba(34, 211, 238, 0.08)', borderRadius: '2px' }}>
          <p className="text-[15px] leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-mid)' }}>
            You want to support projects that matter. But you don&apos;t have time to research every
            organization, track where your money goes, or follow up months later to see if it worked.
            ImpactHook handles all of that. The protocol only releases funds when milestones are
            verified on-chain. You see the outcomes without doing the work.
          </p>
        </div>

        {/* Project flow */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: 'var(--accent-violet)' }}><GlobeIcon /></span>
            <span className="text-[12px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-violet)' }}>For Impact Projects</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StepCard num="01" title="Register" color="var(--accent-violet)"
              desc="Define your milestones and fee tiers. Up to 5% per swap, capped for safety." small />
            <StepCard num="02" title="Set verifier" color="var(--accent-violet)"
              desc="A Safe multisig, a DAO, an oracle, or a cross-chain RSC. Your verifier can be any address. Your recipient can be a multisig too." small />
            <StepCard num="03" title="Hit milestones" color="var(--accent-violet)"
              desc="Do the work. Verifier confirms on-chain. Fee tier adjusts and funding grows." small />
            <StepCard num="04" title="Withdraw" color="var(--accent-violet)"
              desc="Accumulated fees go directly to you. No middlemen. No delays. Fully transparent." small />
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
          subtitle="Every swap you make through an impact pool is tracked. See what you've funded, what milestones have been hit, and the real-world outcomes your trades enabled."
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
              <div className="text-[11px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-dim)' }}>How it works</div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Your portfolio builds automatically from your swaps. No opt-in required.
                Every trade through an impact pool is recorded. You can see exactly which projects
                you funded, how much, and what those projects achieved.
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
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Accountability"
          title="Full transparency, by default"
          subtitle="Every dollar is traceable. Every milestone is permanent. Every withdrawal is public. Not because we chose to be transparent - because the protocol makes it impossible not to be."
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
            Beyond swap fees, anyone can donate directly to a project&apos;s fund. Institutions,
            DAOs, and individuals contribute alongside continuous DeFi funding. Same milestone-gated
            rules apply - no money moves until milestones are verified. Two funding paths, one
            source of truth.
          </p>
        </div>
      </div>
    </section>
  );
}

/* == WHY IT MATTERS ======================================= */

function WhyItMatters() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="The Problem" title="Why this exists" subtitle="Asset-class specific liquidity for real-world impact" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="animate-fade-up delay-200">
            <h3 className="font-display text-[15px] mb-4" style={{ color: 'var(--text-bright)' }}>
              Liquidity has no purpose beyond yield
            </h3>
            <div className="flex flex-col gap-4">
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                $2.5 trillion in daily crypto trading volume generates zero social impact.
                Every pool looks the same: token pair, fee tier, TVL. There is no way to differentiate
                liquidity by what it does in the real world.
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Meanwhile, billions in impact funding passes through layers of intermediaries.
                Donors can&apos;t verify outcomes. Recipients wait months. Nobody knows if the money
                did what it was supposed to. These two problems have the same solution.
              </p>
            </div>
          </div>
          <div className="animate-fade-up delay-300">
            <h3 className="font-display text-[15px] mb-4" style={{ color: 'var(--text-bright)' }}>
              A new class of liquidity pool
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Impact-differentiated", text: "Pools defined by the real-world outcome they fund, not just token pair and fee tier" },
                { label: "Continuous", text: "Funding flows with every swap, not once-a-year grants" },
                { label: "Milestone-gated", text: "No results, no funding. Verification happens on-chain before fees release" },
                { label: "Cross-chain verified", text: "Milestones confirmed from any chain via Reactive Network" },
                { label: "Permissionless", text: "Anyone can create an impact pool for any cause. No gatekeepers, no grant committees" },
                { label: "Zero-friction for traders", text: "Same tokens, same swap, different impact. Just pick a pool" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 items-start">
                  <span className="text-[11px] font-data mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-cyan)' }}>+</span>
                  <div>
                    <span className="text-[13px]" style={{ color: 'var(--text-bright)' }}>{item.label}. </span>
                    <span className="text-[13px]" style={{ color: 'var(--text-dim)' }}>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* == FOR PROJECTS (condensed) ============================= */

function ForProjects() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="For Projects" title="Prove your progress, get funded" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="animate-fade-up delay-200">
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>
              If you&apos;re building something that matters, ImpactHook gives you a new way to get funded.
              Create a pool, define your milestones, and let the trading community fund your work.
              No pitch decks. No grant committees. Just verified results.
            </p>

            {/* Mock project dashboard */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Project View</span>
                <span className="text-[10px] px-2 py-0.5" style={{ color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.2)', background: 'rgba(52, 211, 153, 0.05)' }}>
                  Funding Active
                </span>
              </div>
              <div className="font-display text-sm mb-4" style={{ color: 'var(--text-bright)' }}>Clean Water in Rural Kenya</div>

              {/* Milestone proof cards */}
              <div className="flex flex-col gap-3">
                <MilestoneProof index={0} name="Equipment sourced" status="verified" proof="Tx: 0xa4f2...8b1c" date="Feb 14, 2026" feeBps={0} />
                <MilestoneProof index={1} name="Installation complete" status="verified" proof="Tx: 0x7e91...3d4a" date="Mar 2, 2026" feeBps={200} />
                <MilestoneProof index={2} name="First 1,000 liters filtered" status="pending" proof="Awaiting verification" date="" feeBps={300} />
                <MilestoneProof index={3} name="Community-maintained" status="locked" proof="" date="" feeBps={100} />
              </div>
            </div>
          </div>

          {/* Funding summary + dual channels */}
          <div className="animate-fade-up delay-300 flex flex-col gap-4">
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

            {/* Two funding channels */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg" style={{ color: 'var(--accent-cyan)' }}>~</span>
                <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>Channel 1: Swap Fees</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                DeFi-native continuous funding. The hook charges a fee on swap output.
                LPs earn full yield. Fees come from swappers who choose impact pools.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
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
    </section>
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

/* == DASHBOARD ============================================ */

function DashboardSection() {
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

/* == ARCHITECTURE ========================================= */

function Architecture() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Under the Hood" title="Architecture" />

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

/* == TESTING ============================================== */

function Testing() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Quality" title="Test coverage" />

        <div className="card p-6 mt-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="font-data text-3xl" style={{ color: 'var(--accent-emerald)' }}>63</div>
            <div>
              <div className="text-[13px]" style={{ color: 'var(--text-bright)' }}>tests passing</div>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>0 failed, 0 skipped</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TestGroup name="Core Hook" count={16} items={["Registration", "Fee routing (both dirs)", "Milestone progression", "Withdrawal"]} />
            <TestGroup name="Access Control" count={10} items={["Verifier auth", "Recipient auth", "Callback proxy", "Owner checks"]} />
            <TestGroup name="Integrations" count={19} items={["MilestoneArbiter (3)", "Reactive callbacks (3)", "Oracle events (4)", "EAS verification (8)", "E2E cross-chain"]} />
            <TestGroup name="Donations & Edge" count={18} items={["Direct donations (6)", "Fuzz (257 runs)", "Multiple pools", "Zero fees", "Out of bounds"]} />
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
        <SectionHeader label="Ecosystem" title="Built with" />

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
      <Hero />
      <div className="divider" />
      <ImpactShowcase />
      <div className="divider" />
      <HowItWorks />
      <div className="divider" />
      <ImpactPortfolio />
      <div className="divider" />
      <Transparency />
      <div className="divider" />
      <WhyItMatters />
      <div className="divider" />
      <ForProjects />
      <div className="divider" />
      <DashboardSection />
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
