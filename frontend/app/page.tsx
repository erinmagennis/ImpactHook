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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: scrolled ? "rgba(252,251,249,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link
          href="/"
          style={{
            fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "var(--accent)" }}>Impact</span>Hook
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/impact", label: "Impact" },
            { href: "/technical", label: "Technical" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderRadius: 6,
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <a
        href="https://github.com/erinmagennis/ImpactHook"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-secondary)",
          textDecoration: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        GitHub
      </a>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <LandingNav />

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════ */}
      <div className="section-teal" style={{ position: "relative", overflow: "hidden" }}>
        {/* Dot pattern overlay */}
        <div
          className="pattern-dots"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
        <section
          style={{
            position: "relative",
            maxWidth: 1120,
            margin: "0 auto",
            padding: "140px 32px 120px",
            display: "flex",
            alignItems: "flex-start",
            gap: 80,
            flexWrap: "wrap",
          }}
        >
          {/* Left: text */}
          <div style={{ flex: "1 1 480px", maxWidth: 560 }}>
            {/* Feature tags */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <span className="feature-tag">Uniswap v4 Hook</span>
              <span className="feature-tag">Deployed on Unichain</span>
            </div>
            <h1
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                margin: "0 0 20px 0",
              }}
            >
              Every swap funds
              <br />
              verified impact
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: "0 0 36px 0",
                maxWidth: 460,
              }}
            >
              ImpactHook routes a share of trading fees and LP yield to
              milestone-verified projects. Funding unlocks only when real
              progress is proven onchain.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 28px",
                  borderRadius: 6,
                  background: "var(--accent)",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Launch App
              </Link>
              <Link
                href="/impact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 28px",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid var(--border-subtle)",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: flow visual + stats */}
          <div style={{ flex: "1 1 360px", maxWidth: 440, paddingTop: 16 }}>
            {/* Flow diagram */}
            <div
              className="card card-glow"
              style={{
                padding: 28,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  marginBottom: 20,
                }}
              >
                Funding flow
              </div>
              {[
                { step: "Swap", detail: "Traders swap on any ImpactHook pool" },
                { step: "Route", detail: "Hook captures a small fee automatically" },
                { step: "Verify", detail: "Milestones proven via EAS attestations" },
                { step: "Fund", detail: "Project withdraws earned fees" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    marginBottom: i < 3 ? 16 : 0,
                  }}
                >
                  <div className="step-number" style={{ width: 28, height: 28, fontSize: 12 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {item.step}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.4 }}>
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { value: "5", label: "Funding channels" },
                { value: "3", label: "Verification paths" },
                { value: "Live", label: "On Unichain" },
              ].map((s, i) => (
                <div key={i} className="stat-highlight">
                  <div
                    style={{
                      fontFamily: "'Departure Mono', 'SF Mono', monospace",
                      fontSize: 24,
                      fontWeight: 600,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <div style={{ background: "var(--bg-primary)" }}>
        <section
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "96px 32px",
          }}
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                margin: "0 0 12px 0",
              }}
            >
              How it works
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text-secondary)",
                margin: 0,
                maxWidth: 520,
                lineHeight: 1.5,
              }}
            >
              Two funding channels - swap fees from traders and yield skim from
              LPs - both gated by the same onchain milestone verification.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 32,
            }}
          >
            {[
              {
                number: "1",
                title: "Register a project",
                description:
                  "Define milestones and assign a verifier. The hook deploys with your parameters and begins collecting fees from swaps on that pool.",
                barWidth: "100%",
              },
              {
                number: "2",
                title: "Trade and fund",
                description:
                  "Traders swap as normal. A small fee (up to 5%) is captured by the hook. LPs can also contribute a share of yield. Both channels accumulate in the hook contract.",
                barWidth: "65%",
              },
              {
                number: "3",
                title: "Verify and withdraw",
                description:
                  "Milestones are verified onchain via EAS attestations, oracle callbacks, or the Reactive Network. Each verified milestone unlocks the next fee tier and allows withdrawal.",
                barWidth: "40%",
              },
            ].map((step, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div className="step-number">{step.number}</div>
                  <h3
                    style={{
                      fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                    margin: "0 0 16px 0",
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 3: ACCOUNTABILITY
          ═══════════════════════════════════════════ */}
      <div style={{ background: "var(--bg-primary)" }}>
        <section
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "96px 32px",
          }}
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                margin: "0 0 12px 0",
              }}
            >
              Built-in accountability
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text-secondary)",
                margin: 0,
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              Every dollar is tracked onchain. Projects must prove progress before
              funding unlocks. Dead projects auto-expire. No intermediaries, no opacity.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {/* Example project */}
            <div className="card card-accent" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                    Clean Water - Chiapas Schools
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Climate / WASH</div>
                </div>
                <span className="feature-tag">Live</span>
              </div>
              {[
                { name: "Baseline water testing", status: "verified", fee: "0 bps" },
                { name: "Systems installed in 20 schools", status: "verified", fee: "100 bps" },
                { name: "3-month water quality verified", status: "verified", fee: "200 bps" },
                { name: "Community management trained", status: "verified", fee: "300 bps" },
              ].map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderTop: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: m.status === "verified" ? "var(--accent-bg)" : "var(--bg-elevated)",
                      border: m.status === "verified" ? "1.5px solid var(--accent)" : "1.5px solid var(--border-subtle)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "var(--accent)",
                    }}>
                      {m.status === "verified" && "\u2713"}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{m.name}</span>
                  </div>
                  <span className="font-data" style={{ fontSize: 12, color: "var(--text-dim)" }}>{m.fee}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 6, background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Accumulated fees</span>
                  <span className="font-data" style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>1.247 ETH</span>
                </div>
              </div>
            </div>

            {/* Why it works */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "Milestone-gated", desc: "Fee tiers increase as projects deliver. Zero funding until the first milestone is verified. No results, no money." },
                { title: "Heartbeat expiration", desc: "Projects must send periodic proof-of-life. If a project goes silent, fees stop automatically. No manual intervention needed." },
                { title: "Cross-chain verification", desc: "Milestones can be verified from any supported chain via Reactive Network, or through EAS attestations on Unichain." },
                { title: "Per-project controls", desc: "Individual projects can be paused without affecting others. Progressive decentralization from owner-gated to fully permissionless." },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: BUILT FOR EVERY PARTICIPANT
          ═══════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "96px 32px",
        }}
      >
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              margin: "0 0 12px 0",
            }}
          >
            Built for every participant
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Whether you trade, provide liquidity, or run an impact project,
            the hook works for you.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Traders */}
          <div
            className="card card-accent"
            style={{
              padding: 32,
              transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
          >
            <span className="feature-tag" style={{ marginBottom: 16, display: "inline-block" }}>
              Traders
            </span>
            <h3
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 12px 0",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Swap as usual.
              <br />
              Impact happens automatically.
            </h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              A small fee on each swap is routed to verified impact projects.
              No extra steps, no separate donations. Your trading volume
              directly funds real-world outcomes.
            </p>
            <Link
              href="/dashboard"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View dashboard
            </Link>
          </div>

          {/* LPs / Sponsors */}
          <div
            className="card card-accent-success"
            style={{
              padding: 32,
              transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
          >
            <span
              className="feature-tag"
              style={{
                marginBottom: 16,
                display: "inline-block",
                background: "#ecfdf5",
                color: "var(--success)",
                borderColor: "#a7f3d0",
              }}
            >
              LPs / Sponsors
            </span>
            <h3
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 12px 0",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Provide liquidity.
              <br />
              A share of yield funds impact.
            </h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              Liquidity providers can allocate a portion of their yield
              to milestone-gated projects through the Alkahest escrow channel.
            </p>
            <Link
              href="/impact"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Learn more
            </Link>
          </div>

          {/* Project Owners */}
          <div
            className="card card-accent-violet"
            style={{
              padding: 32,
              transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
          >
            <span
              className="feature-tag"
              style={{
                marginBottom: 16,
                display: "inline-block",
                background: "#f5f3ff",
                color: "#7c3aed",
                borderColor: "#c4b5fd",
              }}
            >
              Project Owners
            </span>
            <h3
              style={{
                fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 12px 0",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Register your project.
              <br />
              Hit milestones. Get funded.
            </h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              Define milestones, assign a verifier, and let funding accumulate
              as your pool trades. Withdraw earned fees as each milestone
              is verified onchain.
            </p>
            <Link
              href="/milestones"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View milestones
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 32px",
          borderTop: "2px solid var(--accent)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
          Built for the UHI8 Hookathon. Deployed on Unichain Sepolia.
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a
            href="https://github.com/erinmagennis/ImpactHook"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            GitHub
          </a>
          <a
            href="/technical"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Technical
          </a>
          <a
            href="/impact"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Impact
          </a>
        </div>
      </footer>
    </div>
  );
}
