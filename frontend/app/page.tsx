"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" className="nav-logo">
          <span style={{ color: "var(--accent)" }}>Impact</span>Hook
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <Link href="/impact" className="landing-nav-link">Impact</Link>
          <Link href="/agent" className="landing-nav-link">Agent</Link>
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

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <LandingNav />

      {/* ── HERO ── */}
      <section className="container" style={{ paddingTop: 140, paddingBottom: 140 }}>
        <div style={{ display: "flex", gap: 80, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 480px", maxWidth: 560 }}>
            <span className="badge badge-accent" style={{ marginBottom: 20, display: "inline-flex" }}>
              Uniswap v4 Hook · Live on Unichain
            </span>
            <h1 className="heading-xl" style={{ fontSize: 56, marginBottom: 20 }}>
              Every swap funds{"\n"}verified impact
            </h1>
            <p className="text-body" style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              ImpactHook routes a share of trading fees and LP yield to
              milestone-verified projects. Funding unlocks only when real
              progress is proven onchain.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
                Launch App
              </Link>
              <Link href="/technical" className="btn-secondary" style={{ padding: "14px 32px", fontSize: 16 }}>
                Read the Docs
              </Link>
            </div>
          </div>

          <div className="animate-fade-up delay-200" style={{ flex: "1 1 400px", maxWidth: 520 }}>
            <BrowserFrame>
              {/* Mini dashboard preview */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="heading-sm" style={{ fontSize: 14 }}>Dashboard</span>
                <span className="badge badge-success" style={{ fontSize: 10, padding: "2px 8px" }}>Live</span>
              </div>
              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)" }}>
                  <div className="text-caption" style={{ marginBottom: 4 }}>Impact Fee</div>
                  <div className="font-data" style={{ fontSize: 18, color: "var(--accent)" }}>2.00%</div>
                </div>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)" }}>
                  <div className="text-caption" style={{ marginBottom: 4 }}>Milestones</div>
                  <div className="font-data" style={{ fontSize: 18, color: "var(--success)" }}>2 / 4</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="text-caption" style={{ marginBottom: 6 }}>Milestone Progress</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "50%" }} />
                </div>
              </div>
              <div className="grid-3" style={{ gap: 8 }}>
                {[
                  { label: "Swap Fees", value: "0.847 ETH" },
                  { label: "LP Skim", value: "0.312 ETH" },
                  { label: "Donations", value: "0.088 ETH" },
                ].map((s) => (
                  <div key={s.label} style={{ padding: 8, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", textAlign: "center" }}>
                    <div className="font-data" style={{ fontSize: 13, color: "var(--accent)", marginBottom: 2 }}>{s.value}</div>
                    <div className="text-caption" style={{ fontSize: 10 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="container" style={{ paddingBottom: 140 }}>
        <div style={{ marginBottom: 48 }}>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>How it works</h2>
          <p className="text-body" style={{ maxWidth: 560 }}>
            Two funding channels -- swap fees from traders and yield skim from
            LPs -- both gated by the same onchain milestone verification.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {[
            {
              num: "01",
              title: "Register a project",
              desc: "Define milestones and assign a verifier. The Uniswap v4 hook deploys with your parameters and begins collecting fees from swaps on that pool.",
            },
            {
              num: "02",
              title: "Trade and fund",
              desc: "Traders swap as normal. A small fee is captured by the hook. LPs can also contribute a share of yield via afterAddLiquidity. Both channels accumulate in the hook contract.",
            },
            {
              num: "03",
              title: "Verify and withdraw",
              desc: "Milestones are verified onchain via direct call, Reactive Network cross-chain callbacks, or EAS attestations. Each verified milestone unlocks the next fee tier.",
            },
          ].map((step) => (
            <div key={step.num} className="card" style={{ padding: 28 }}>
              <div className="font-data" style={{ fontSize: 40, fontWeight: 700, color: "var(--text-dim)", opacity: 0.3, marginBottom: 12 }}>
                {step.num}
              </div>
              <h3 className="heading-sm" style={{ marginBottom: 8 }}>{step.title}</h3>
              <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THREE AUDIENCES ── */}
      <section className="container" style={{ paddingBottom: 140 }}>
        <div style={{ marginBottom: 48 }}>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Built for every participant</h2>
          <p className="text-body" style={{ maxWidth: 520 }}>
            Whether you trade, provide liquidity, or run an impact project, the hook works for you.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          <div className="card" style={{ padding: 32 }}>
            <span className="badge badge-accent" style={{ marginBottom: 16, display: "inline-flex" }}>Traders</span>
            <h3 className="heading-md" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 12 }}>
              Swap as usual.{"\n"}Impact happens automatically.
            </h3>
            <p className="text-small" style={{ lineHeight: 1.6, marginBottom: 20 }}>
              A small fee on each swap is routed to verified impact projects via the Uniswap v4 afterSwap hook.
              No extra steps. Your trading volume directly funds real-world outcomes.
            </p>
            <Link href="/swap" className="btn-ghost">View swap &rarr;</Link>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <span className="badge badge-success" style={{ marginBottom: 16, display: "inline-flex" }}>Projects</span>
            <h3 className="heading-md" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 12 }}>
              Register your project.{"\n"}Hit milestones. Get funded.
            </h3>
            <p className="text-small" style={{ lineHeight: 1.6, marginBottom: 20 }}>
              Define milestones, assign a verifier, and let funding accumulate
              as your pool trades. Withdraw earned fees as each milestone
              is verified onchain. Mint Hypercerts as composable proof of impact.
            </p>
            <Link href="/create" className="btn-ghost">Create project &rarr;</Link>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <span className="badge badge-violet" style={{ marginBottom: 16, display: "inline-flex" }}>LPs / Sponsors</span>
            <h3 className="heading-md" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 12 }}>
              Provide liquidity.{"\n"}A share of yield funds impact.
            </h3>
            <p className="text-small" style={{ lineHeight: 1.6, marginBottom: 20 }}>
              LP fee skim via afterAddLiquidity routes a portion of yield
              to milestone-gated projects. Institutional sponsors can use
              Alkahest escrow gated by the same onchain milestone state.
            </p>
            <Link href="/impact" className="btn-ghost">Learn more &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── ACCOUNTABILITY + TECH PROOF ── */}
      <section className="container" style={{ paddingBottom: 140 }}>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          {/* Left: accountability features */}
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="heading-lg" style={{ marginBottom: 32 }}>Built for accountability</h2>
            {[
              { title: "Milestone-gated", desc: "Fee tiers increase as projects deliver. Zero funding until the first milestone is verified. No results, no money." },
              { title: "Heartbeat expiration", desc: "Projects must send periodic proof-of-life via heartbeat(). Silent projects auto-expire. No manual intervention." },
              { title: "Cross-chain verification via Reactive Network", desc: "Milestones can be verified from any supported chain. Events on the origin chain trigger callbacks on Unichain automatically." },
              { title: "EAS attestations", desc: "Ethereum Attestation Service provides credibly neutral, composable proof. Anyone can call verifyMilestoneEAS() permissionlessly." },
              { title: "AI agent verification", desc: "An autonomous agent monitors evidence uploads, analyzes them with Claude, and submits verification onchain. Reports stored permanently on Filecoin." },
            ].map((f) => (
              <div key={f.title} style={{ marginBottom: 24 }}>
                <h4 className="heading-sm" style={{ fontSize: 15, marginBottom: 4 }}>{f.title}</h4>
                <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Right: technical stats */}
          <div style={{ flex: "1 1 320px" }}>
            <div className="card" style={{ padding: 32 }}>
              <div className="text-superhead" style={{ marginBottom: 24 }}>Technical Proof</div>
              <div className="grid-2" style={{ gap: 24 }}>
                {[
                  { value: "174", label: "Tests Passing" },
                  { value: "5", label: "Contracts" },
                  { value: "3", label: "Verification Paths" },
                  { value: "5", label: "Funding Channels" },
                  { value: "7", label: "Hook Callbacks" },
                  { value: "3", label: "Chains" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="stat-value" style={{ color: "var(--accent)" }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-caption" style={{ marginTop: 20 }}>
                All contracts deployed and verified on Unichain Sepolia, Ethereum Sepolia, and Reactive Lasna.
              </div>
            </div>

            {/* Tech stack badges */}
            <div className="card" style={{ padding: 24, marginTop: 16 }}>
              <div className="text-superhead" style={{ marginBottom: 12 }}>Built With</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Uniswap v4", "EAS", "Reactive Network", "Alkahest", "Hypercerts", "Filecoin/IPFS", "Claude"].map((t) => (
                  <span key={t} className="badge badge-accent" style={{ fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container" style={{ paddingBottom: 120, textAlign: "center" }}>
        <h2 className="heading-lg" style={{ marginBottom: 12 }}>Start building impact</h2>
        <p className="text-body" style={{ maxWidth: 480, margin: "0 auto 32px" }}>
          Create a project, make a swap, or explore the architecture.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
            Launch App
          </Link>
          <a href="https://github.com/erinmagennis/ImpactHook" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "14px 32px", fontSize: 16 }}>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="container" style={{ paddingTop: 32, paddingBottom: 32, borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span className="text-caption">Built for the UHI8 Hookathon. Deployed on Unichain Sepolia.</span>
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
