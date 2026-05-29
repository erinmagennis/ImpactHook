"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandMark, ImageSlot, CircleCutout } from "../components/Brand";
import HeroFlow from "../components/HeroFlow";
import FundingFlow from "../components/FundingFlow";
import Committee from "../components/Committee";

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="landing-nav"
      style={{
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" className="nav-logo" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <BrandMark size={26} />
          <span><span style={{ color: "var(--accent)" }}>Impact</span>Hook</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#funding-models" className="landing-nav-link">Funding</a>
          <a href="#principles" className="landing-nav-link">Principles</a>
          <Link href="/impact" className="landing-nav-link">Impact</Link>
          <Link href="/technical" className="landing-nav-link">Technical</Link>
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" className="landing-nav-link">GitHub</a>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ height: 36, background: "var(--bg-elevated)", display: "flex", alignItems: "center", padding: "0 12px", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ flex: 1, textAlign: "right", fontSize: 11, color: "var(--text-dim)" }}>impacthook.vercel.app</span>
      </div>
      <div style={{ background: "var(--bg-primary)", padding: 24, minHeight: 280 }}>
        {children}
      </div>
    </div>
  );
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: { [k: string]: React.ReactNode } = {
    swap: <><path d="M4 9h13M14 6l3 3-3 3" /><path d="M20 15H7M10 12l-3 3 3 3" /></>,
    yield: <path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" />,
    heart: <path d="M12 20l-1.6-1.5C5 14 2 11.2 2 7.8 2 5.1 4.1 3 6.8 3c1.7 0 3.3.9 4.2 2.3C11.9 3.9 13.5 3 15.2 3 17.9 3 20 5.1 20 7.8c0 3.4-3 6.2-8.4 10.7L12 20z" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    shield: <><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
    link: <><path d="M9 13a4 4 0 0 0 6 0l2-2a4 4 0 1 0-6-6l-1 1" /><path d="M15 11a4 4 0 0 0-6 0l-2 2a4 4 0 1 0 6 6l1-1" /></>,
    seal: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>,
    users: <><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6.2a3 3 0 0 1 0 5.6M20.5 20a5.5 5.5 0 0 0-4-5.3" /></>,
    data: <><path d="M3 20h18" /><path d="M6 20v-6M11 20V8M16 20v-10" /></>,
    code: <><path d="M8 7l-5 5 5 5" /><path d="M16 7l5 5-5 5" /></>,
    recycle: <><path d="M4 12a8 8 0 0 1 13-6" /><path d="M20 12a8 8 0 0 1-13 6" /><path d="M17 3l1 3-3 1M7 21l-1-3 3-1" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" /></>,
    config: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2.2" /><circle cx="15" cy="12" r="2.2" /><circle cx="8" cy="18" r="2.2" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <LandingNav />

      {/* ── HERO (scroll-driven funding → outcome flow) ── */}
      <HeroFlow />

      {/* ── THE PROBLEM ── */}
      <section style={{ background: "var(--bg-card)", padding: "72px 0", marginBottom: 96 }}>
        <div className="container">
          <div style={{ maxWidth: 940 }}>
            <div className="text-superhead" style={{ marginBottom: 16 }}>The accountability gap</div>
            <h2 className="heading-lg" style={{ marginBottom: 20, lineHeight: 1.3 }}>
              Giving isn&apos;t the problem. Knowing it worked is.
            </h2>
            <p className="text-body" style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 16 }}>
              Hundreds of billions flow to impact and aid programs every year. But money is
              often released before results are proven, much of it leaks before it reaches the
              front line, and the difference between programs that deliver and ones that
              don&apos;t is far larger than most funders realize.
            </p>
            <p className="text-body" style={{ fontSize: 18, lineHeight: 1.7 }}>
              ImpactHook makes that difference visible. Funding is held in escrow and released
              milestone by milestone, each one verified onchain, so money flows to the
              organizations that actually deliver, and reaches the children and communities it
              was meant for.
            </p>
          </div>

          {/* Stat band */}
          <div className="grid-3" style={{ gap: 24, marginTop: 48 }}>
            {[
              { value: "$592B", label: "given to US charities in 2024" },
              { value: "13% → 90%", label: "funds delivered once the money trail was made public (Uganda)" },
              { value: "1.5× vs ~100×", label: "how much better the best charities are than average: what donors guess vs. what experts estimate" },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: 28 }}>
                <div className="stat-value" style={{ color: "var(--accent)", marginBottom: 8 }}>{s.value}</div>
                <div className="text-small" style={{ lineHeight: 1.5, margin: 0 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, maxWidth: 820, borderRadius: "var(--radius-card)", overflow: "hidden", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)", background: "#fff" }}>
            <img
              src="/dcp2-cost-effectiveness.jpeg"
              alt="Cost-effectiveness of health interventions, sorted low to high: most have low impact while a few are dramatically more effective"
              style={{ width: "100%", display: "block" }}
              onError={(e) => { const fig = e.currentTarget.parentElement; if (fig) fig.style.display = "none"; }}
            />
          </div>
          <p className="text-caption" style={{ marginTop: 16 }}>
            The best interventions are vastly more effective than the rest. Sources: 80,000 Hours / DCP2 (2006); Giving USA 2025; Reinikka &amp; Svensson (Uganda); Caviola et al. 2020.
          </p>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section style={{ padding: "72px 0", marginBottom: 96, background: "var(--bg-card)" }}>
        <div className="container">
          <div style={{ marginBottom: 48, maxWidth: 620 }}>
            <div className="text-superhead" style={{ marginBottom: 16 }}>Why it matters</div>
            <h2 className="heading-lg" style={{ marginBottom: 12 }}>People give more when they can see it working</h2>
            <p className="text-body">
              People want to back organizations doing real good. But finding the ones that
              deliver, knowing they still have impact, and seeing your money was used well is
              hard. When you can&apos;t close that loop, you give less.
            </p>
          </div>
          <div className="grid-2" style={{ gap: 24 }}>
            <div className="card" style={{ padding: 32 }}>
              <span className="badge badge-accent" style={{ marginBottom: 16, display: "inline-flex" }}>For funders</span>
              <h3 className="heading-md" style={{ fontSize: 20, marginBottom: 10 }}>See exactly where your money goes</h3>
              <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>
                Funds release only against verified milestones, so they reach the organizations
                actually delivering, and you watch your impact accrue in real time.
              </p>
            </div>
            <div className="card" style={{ padding: 32 }}>
              <span className="badge badge-accent" style={{ marginBottom: 16, display: "inline-flex" }}>For organizations</span>
              <h3 className="heading-md" style={{ fontSize: 20, marginBottom: 10 }}>Spend time on the mission, not fundraising</h3>
              <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>
                Funding arrives automatically as milestones are hit, so more of every dollar
                reaches the work instead of a fundraising team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="container" style={{ paddingBottom: 96, scrollMarginTop: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          <h2 style={{ fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--accent-light)", marginBottom: 14, lineHeight: 1.05 }}>
            How it works
          </h2>
          <p className="text-body">
            A project defines its milestones, funding accumulates from any channel, and money is
            only ever released against{" "}
            <span style={{ color: "var(--accent-light)" }}>proof-of-progress or proof-of-impact</span>,
            verified onchain.
          </p>
        </div>

        <div className="feature-row">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className="font-data" style={{ fontSize: 14, color: "var(--accent)" }}>01</span>
              <span className="status-pill status-pill-idle">For projects</span>
            </div>
            <h3 className="heading-md" style={{ marginBottom: 12 }}>Register a project</h3>
            <p className="text-body" style={{ maxWidth: 440, marginBottom: 18 }}>
              A project sets its milestones and assigns who can verify them, then funding starts
              accumulating in escrow against those milestones. This is where a project comes to
              get set up.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["ImpactHook hook", "Milestone registry", "Escrow contract"].map((t) => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="feature-visual">
            <div style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ height: 34, background: "var(--bg-elevated)", display: "flex", alignItems: "center", padding: "0 12px", gap: 6, borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
                <span style={{ flex: 1, textAlign: "right", fontSize: 10, color: "var(--text-dim)" }}>impacthook.vercel.app/create</span>
              </div>
              <ImageSlot label="Create / register screen" hint="Screenshot of the project creation flow (you capture)" ratio="16 / 10" rounded="0" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNDING MODELS ── */}
      <section id="funding-models" className="container" style={{ paddingBottom: 96, scrollMarginTop: 80 }}>
        <div style={{ marginBottom: 48, maxWidth: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span className="font-data" style={{ fontSize: 14, color: "var(--accent)" }}>02</span>
            <span className="status-pill status-pill-idle">Fund it, any way</span>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Four ways to fund. One milestone gate.</h2>
          <p className="text-body" style={{ maxWidth: 580 }}>
            However the money arrives, it&apos;s held to the same standard: nothing is
            released until the project proves it delivered.
          </p>
        </div>

        <FundingFlow />
        <p className="text-caption" style={{ marginTop: 28, maxWidth: 640 }}>
          The same gate lets grant programs and institutional funders disburse the way they
          already want to: programmatically, transparently, and only against proven results.
        </p>
      </section>

      {/* ── VERIFICATION & ACCOUNTABILITY ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div style={{ marginBottom: 40, maxWidth: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span className="font-data" style={{ fontSize: 14, color: "var(--accent)" }}>03</span>
            <span className="status-pill status-pill-idle">Prove, verify, release</span>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Built so funds can&apos;t be misused</h2>
          <p className="text-body" style={{ maxWidth: 560 }}>
            <span style={{ color: "var(--accent-light)" }}>Verified by people or by agents</span>, never by
            a single party. A milestone can be proven through several independent paths. Don&apos;t
            take our word for it, check the record.
          </p>
        </div>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Left: accountability features as an accordion */}
          <div style={{ flex: "1 1 420px" }}>
            <div className="accordion">
              {[
                { icon: "shield", title: "Milestone-gated release", desc: "Funding tiers unlock only as a project delivers. Zero funds move until the first milestone is verified onchain." },
                { icon: "config", title: "Set by the project or the funder", desc: "Whoever sets up the pool sets the milestones and chooses how they're verified: a trusted person, an autonomous agent, an onchain attestation, or a cross-chain proof. A project can run its own pool, or a funder can set one up to their own standard." },
                { icon: "link", title: "Direct & cross-chain verification", desc: "Verify by direct onchain call, or from another chain via Reactive Network callbacks. Evidence on one chain can unlock funding on another." },
                { icon: "seal", title: "EAS attestations", desc: "Ethereum Attestation Service provides credibly neutral, composable proof that anyone can verify permissionlessly." },
                { icon: "cpu", title: "AI agent verification", desc: "An autonomous agent monitors evidence uploads, analyzes them, and submits verification onchain. Reports are stored on Filecoin." },
                { icon: "users", title: "Expert committee verification", badge: "Built · roadmap", desc: "Pantheon: a committee of domain-expert agents each review the evidence and return a signed, reasoned verdict, with a dedicated Critic whose job is to challenge it. Accountability by panel, not a single oracle." },
              ].map((f, i) => (
                <details key={f.title} open={i === 0}>
                  <summary>
                    <span className="acc-icon"><Icon name={f.icon} size={18} /></span>
                    <span>{f.title}</span>
                    {f.badge && <span className="status-pill status-pill-pending" style={{ marginLeft: 8 }}>{f.badge}</span>}
                    <svg className="acc-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </summary>
                  <div className="acc-body">
                    {f.desc}
                    {f.title === "Expert committee verification" && (
                      <>
                        {" "}
                        <a
                          href="https://github.com/erinmagennis/pantheon"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent-light)", textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          View Pantheon on GitHub ↗
                        </a>
                      </>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Right: real-time data + proof */}
          <div style={{ flex: "1 1 320px" }}>
            <div className="card" style={{ padding: 32 }}>
              <div className="text-superhead" style={{ marginBottom: 16 }}>Verifiable by construction</div>
              <p className="text-small" style={{ lineHeight: 1.6, marginBottom: 24 }}>
                Every action is an onchain event: indexable, queryable, and available in
                real time. A funder gets a live view of where money is and what it unlocked,
                without waiting on a custom report from anyone.
              </p>
              <div className="grid-2" style={{ gap: 24 }}>
                {[
                  { value: "5", label: "Funding Channels" },
                  { value: "5", label: "Verification Paths" },
                  { value: "100%", label: "Onchain Evidence" },
                  { value: "24/7", label: "Real-Time Data" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="stat-value" style={{ color: "var(--accent)" }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PANTHEON (committee verification path) ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 820 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="text-superhead" style={{ margin: 0 }}>The committee path</span>
              <span className="status-pill status-pill-pending">Built · roadmap</span>
            </div>
            <h2 className="heading-lg" style={{ marginBottom: 12 }}>Pantheon: humans and agents verify together</h2>
            <p className="text-body" style={{ maxWidth: 640, margin: 0 }}>
              For the highest-stakes milestones, a funder can convene a committee: standards-trained
              agents, human experts, and an adversarial Critic that review the evidence and return one
              signed verdict. Accountability by panel, not a single oracle.
            </p>
          </div>
          <Link href="/pantheon" className="btn-secondary" style={{ padding: "11px 24px", flexShrink: 0 }}>
            See how the committee works
          </Link>
        </div>
        <Committee compact />
      </section>

      {/* ── CLOSE THE LOOP (funder payoff, big image) ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div style={{ marginBottom: 40, maxWidth: 780 }}>
          <div className="text-superhead" style={{ marginBottom: 16 }}>Close the loop</div>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Track outcomes, not just where the money went</h2>
          <p className="text-body">
            As a funder you don&apos;t just see that funds moved. You see{" "}
            <span style={{ color: "var(--accent-light)" }}>what they achieved</span>: every
            milestone, every release, every result, in one live view. Every action is an onchain
            event, so you can{" "}
            <span style={{ color: "var(--accent-light)" }}>track and verify impact in real time</span>{" "}
            and auto-generate the reports funders need from the same public record. The loop between
            giving and impact finally closes.
          </p>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="status-pill status-pill-pending">In development</span>
            <span className="text-small" style={{ margin: 0 }}>
              Projects that automatically track their own impact can pipe that data straight into
              milestone verification.
            </span>
          </div>
        </div>
        <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/impact-preview.png" alt="A funder's live view of milestones, releases, and outcomes" style={{ width: "100%", display: "block" }} />
        </div>
      </section>

      {/* ── PRINCIPLES FOR DIGITAL DEVELOPMENT ── */}
      <section id="principles" style={{ padding: "72px 0", marginBottom: 96, scrollMarginTop: 80, background: "var(--bg-card)" }}>
        <div className="container">
          <div style={{ marginBottom: 48, maxWidth: 900 }}>
            <div className="text-superhead" style={{ marginBottom: 16 }}>Aligned by design</div>
            <h2 className="heading-lg" style={{ marginBottom: 12 }}>The Principles for Digital Development</h2>
            <p className="text-body" style={{ maxWidth: 760 }}>
              ImpactHook was built to embody the nine principles that guide responsible technology for development.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 20 }}>
            {[
              { p: "Design With the User", icon: "users", d: "Milestones are defined by the project and its community, not imposed by the protocol." },
              { p: "Understand the Ecosystem", icon: "eye", d: "Built for the real funding gap facing NGOs and impact projects in México and beyond." },
              { p: "Design for Scale", icon: "cpu", d: "A permissionless hook: any pool, any project, with near-zero marginal cost to onboard the next one." },
              { p: "Build for Sustainability", icon: "yield", d: "Funded by protocol fees and services, not only by perpetual grants. It outlives any single funding round." },
              { p: "Be Data Driven", icon: "data", d: "All impact lives onchain in real time: live metrics, queryable evidence, verifiable milestone state. Real-time proof can release funding the moment a milestone is met." },
              { p: "Open Source & Open Standards", icon: "code", d: "MIT licensed and public, built on ERC standards, EAS, and Hypercerts." },
              { p: "Reuse and Improve", icon: "recycle", d: "Composes Uniswap v4, EAS, Hypercerts, Reactive, and Alkahest rather than reinventing them." },
              { p: "Do No Harm", icon: "shield", d: "No personal data onchain; funds gated behind verified results; transparent and auditable by anyone." },
              { p: "Be Collaborative", icon: "link", d: "An open repo and interoperable agents, ready for NGO, funder, and ecosystem partnerships." },
            ].map((item, i) => (
              <div key={item.p} className="card principle-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                  <span className="principle-icon"><Icon name={item.icon} size={20} /></span>
                  <h4 className="heading-sm" style={{ fontSize: 15, margin: 0, flex: 1 }}>{item.p}</h4>
                  <span className="font-data" style={{ fontSize: 11, color: "var(--text-dim)" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="text-small" style={{ lineHeight: 1.55, margin: 0 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div style={{ marginBottom: 48, maxWidth: 720 }}>
          <span className="badge badge-accent" style={{ marginBottom: 16, display: "inline-flex" }}>Women-led · Youth-led · DeSci México</span>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Two founders, technical and operational and community-rooted</h2>
          <p className="text-body">
            DeSci México is a women-led, youth-led company founded by Pamela in 2023. We are both
            scientists with years of work across decentralized science and web3 public goods, and
            we each work across all of it: the technical build, the partnerships, and the
            communities this is for. We care about public goods because we come from science.
          </p>
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          {[
            {
              name: "Erin Magennis",
              role: "Co-founder · Scientist, builder & community",
              quote: "I want funding for good to be something you can verify, not just trust.",
              facts: "Builds the contracts, the app, and the verification stack, and works across partnerships and community. Five years in DeSci and web3 public goods, and runs the MuseMatrix DeSci fellowship across four cohorts.",
            },
            {
              name: "Pamela Limón López",
              role: "Co-founder · Scientist, partnerships & operations",
              quote: "As a biologist, community builder, and mother of two, I want a future where funding reaches the people creating measurable impact, and where every outcome can be transparently verified.",
              facts: "Founded DeSci México in 2023. A biologist who shapes company strategy, identifies promising projects, and builds partnerships, making sure the platform solves real problems in education, health, nutrition, and the environment, and anchoring operations in México.",
            },
          ].map((m) => (
            <div key={m.name} className="card" style={{ padding: 32 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18 }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: "1px dashed var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textAlign: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", padding: 6 }}>Headshot<br />slot</span>
                </div>
                <div>
                  <h3 className="heading-md" style={{ fontSize: 20, marginBottom: 4 }}>{m.name}</h3>
                  <div className="text-caption">{m.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)", fontStyle: "italic", marginBottom: 14, borderLeft: "2px solid var(--accent)", paddingLeft: 14 }}>
                &ldquo;{m.quote}&rdquo;
              </p>
              <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>{m.facts}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SUSTAINABILITY / REVENUE ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ marginBottom: 16 }}>Built to last past the grant</div>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>ImpactHook primary revenue streams</h2>
          <p className="text-body" style={{ maxWidth: 580 }}>
            The protocol stays free and open. DeSci México sustains it through three
            diverse, scaling streams.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {[
            { n: "01", title: "Protocol fees", desc: "A small optional fee on impact contributions flowing through managed pools accrues to the treasury. Scales with adoption, with no active sales motion." },
            { n: "02", title: "Impact dashboard SaaS", desc: "Audit-grade impact reports generated from onchain data, in Spanish and English. Subscription tiers for NGOs and institutions." },
            { n: "03", title: "Paid institutional deployment", desc: "Foundations, governments, and large NGOs pay us to set up and run ImpactHook for their own grant programs: their pools, their milestone rules, their reporting. Fixed-fee engagements." },
          ].map((r) => (
            <div key={r.n} className="card" style={{ padding: 28 }}>
              <div className="font-data" style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>{r.n}</div>
              <h3 className="heading-sm" style={{ marginBottom: 8 }}>{r.title}</h3>
              <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECHNICAL PROOF ── */}
      <section style={{ background: "var(--bg-card)", padding: "64px 0", marginBottom: 96 }}>
        <div className="container">
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 360px" }}>
              <h2 className="heading-lg" style={{ marginBottom: 12 }}>A working prototype,<br />not a pitch deck</h2>
              <p className="text-body" style={{ maxWidth: 480, marginBottom: 16 }}>
                Five contracts deployed and verified across three testnets, a full app at
                impacthook.vercel.app, and a public test suite. Winner of the Fresh Code
                prize at Protocol Labs Genesis.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {["Uniswap v4", "EAS", "Reactive Network", "Alkahest", "Hypercerts", "Filecoin / IPFS", "Storacha", "Autonomous agent", "Pantheon committees"].map((t) => (
                  <span key={t} className="badge badge-accent" style={{ fontSize: 12 }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <Link href="/technical" className="btn-ghost">See the full architecture →</Link>
              </div>
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <div className="card" style={{ padding: 32 }}>
                <div className="grid-2" style={{ gap: 24 }}>
                  {[
                    { value: "174", label: "Tests Passing" },
                    { value: "5", label: "Contracts" },
                    { value: "3", label: "Chains Deployed" },
                    { value: "12", label: "App Pages" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="stat-value" style={{ color: "var(--accent)" }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-caption" style={{ marginTop: 20 }}>
                  Deployed on Unichain Sepolia, Ethereum Sepolia, and Reactive Lasna.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT CLOSING (wholesome, human) ── */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <div className="feature-row" style={{ alignItems: "center" }}>
          <div>
            <div className="text-superhead" style={{ marginBottom: 16 }}>Why this matters</div>
            <h2 className="heading-lg" style={{ marginBottom: 14 }}>
              When the right things get funded, people can focus on the{" "}
              <span className="accent-word">work that matters</span>
            </h2>
            <p className="text-body" style={{ maxWidth: 460, marginBottom: 16 }}>
              Less time chasing grants and writing reports. More clean water, more kids in
              school, more measurable good, with every outcome public and verified onchain.
            </p>
            <p className="text-body" style={{ maxWidth: 460 }}>
              And when people can see that their giving works, they give more. Efficient,
              verifiable impact compounds: the more good we can prove, the more good gets funded.
            </p>
            <Link href="/impact" className="btn-ghost" style={{ marginTop: 18, display: "inline-block" }}>Read the accountability story →</Link>
          </div>
          <div className="feature-visual" style={{ display: "flex", justifyContent: "center" }}>
            <CircleCutout
              size={320}
              alt="Children and community in a funded México project"
              hint="Dignified, joyful photo of kids / community in a funded project (you source). Square crop."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-accent" style={{ padding: "80px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Get hooked on impact</h2>
          <p style={{ maxWidth: 460, margin: "0 auto 32px", fontSize: 16, color: "rgba(255,255,255,0.9)" }}>
            Register a project, fund one, or see how verification works.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{ padding: "14px 32px", fontSize: 16, fontWeight: 600, background: "#ffffff", color: "#0b5f57", borderRadius: "var(--radius-btn)", textDecoration: "none" }}>
              Launch App
            </Link>
            <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" style={{ padding: "14px 32px", fontSize: 16, fontWeight: 600, background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.55)", borderRadius: "var(--radius-btn)", textDecoration: "none" }}>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="container" style={{ paddingTop: 32, paddingBottom: 32, borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span className="text-caption" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18">
              <path d="M8 8L2 16L8 24" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M24 8L30 16L24 24" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 16.5L15 19.5L21 12.5" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            Accountable impact funding, built with DeSci México.
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" className="landing-nav-link">GitHub</a>
            <Link href="/impact" className="landing-nav-link">Impact</Link>
            <Link href="/agent" className="landing-nav-link">Agent</Link>
            <Link href="/technical" className="landing-nav-link">Technical</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
