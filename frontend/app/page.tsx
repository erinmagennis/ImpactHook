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
          ImpactHook
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

/* ── Section wrapper ── */
function Section({
  children,
  style,
  id,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "0 32px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* ── Step component for How It Works ── */
function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div
        style={{
          fontFamily: "'Departure Mono', 'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--accent)",
          marginBottom: 12,
          letterSpacing: "0.04em",
        }}
      >
        {number}
      </div>
      <h3
        style={{
          fontFamily: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ── Stat component ── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'Departure Mono', 'SF Mono', monospace",
          fontSize: 32,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--text-dim)",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
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
      <Section
        style={{
          paddingTop: 140,
          paddingBottom: 120,
          display: "flex",
          alignItems: "flex-start",
          gap: 80,
          flexWrap: "wrap",
        }}
      >
        {/* Left: text */}
        <div style={{ flex: "1 1 480px", maxWidth: 560 }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 6,
              background: "var(--accent-bg)",
              color: "var(--accent)",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
              letterSpacing: "0.02em",
            }}
          >
            Uniswap v4 Hook
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
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
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
                <div
                  style={{
                    fontFamily: "'Departure Mono', 'SF Mono', monospace",
                    fontSize: 12,
                    color: "var(--accent)",
                    minWidth: 20,
                    paddingTop: 2,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
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
              gap: 16,
            }}
          >
            {[
              { value: "155", label: "Tests passing" },
              { value: "4", label: "Contracts" },
              { value: "3", label: "Chains" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "16px 14px",
                  textAlign: "center" as const,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Departure Mono', 'SF Mono', monospace",
                    fontSize: 24,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <Section style={{ paddingTop: 96, paddingBottom: 96 }}>
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
            display: "flex",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          <Step
            number="01"
            title="Register a project"
            description="Define milestones and assign a verifier. The hook deploys with your parameters and begins collecting fees from swaps on that pool."
          />
          <Step
            number="02"
            title="Trade and fund"
            description="Traders swap as normal. A small fee (up to 5%) is captured by the hook. LPs can also contribute a share of yield. Both channels accumulate in the hook contract."
          />
          <Step
            number="03"
            title="Verify and withdraw"
            description="Milestones are verified onchain via EAS attestations, oracle callbacks, or the Reactive Network. Each verified milestone unlocks the next fee tier and allows withdrawal."
          />
        </div>
      </Section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 3: LIVE PROOF / CREDIBILITY
          ═══════════════════════════════════════════ */}
      <Section style={{ paddingTop: 96, paddingBottom: 96 }}>
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
            Deployed and tested
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
            Live on Unichain Sepolia with a fully verified demo project.
            All milestones attested, fees accumulated, withdrawal tested.
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 56,
            flexWrap: "wrap",
            marginBottom: 48,
          }}
        >
          <Stat value="155" label="Tests passing" />
          <Stat value="4" label="Contracts deployed" />
          <Stat value="3" label="Chains (Unichain, Sepolia, Reactive)" />
          <Stat value="4/4" label="Demo milestones verified" />
        </div>

        {/* Contracts + Partners */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Deployed contracts */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Deployed contracts
            </div>
            {[
              { name: "ImpactHook", chain: "Unichain Sepolia", addr: "0x6b3C...2044" },
              { name: "MilestoneArbiter", chain: "Unichain Sepolia", addr: "0xfF42...Bf63" },
              { name: "MilestoneOracle", chain: "Ethereum Sepolia", addr: "0x9845...A4Ca" },
              { name: "MilestoneReactor", chain: "Reactive Lasna", addr: "0x4CB8...8a4" },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{c.chain}</div>
                </div>
                <div
                  style={{
                    fontFamily: "'Departure Mono', 'SF Mono', monospace",
                    fontSize: 12,
                    color: "var(--text-dim)",
                  }}
                >
                  {c.addr}
                </div>
              </div>
            ))}
          </div>

          {/* Built with */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Built with
            </div>
            {[
              {
                name: "Uniswap Foundation",
                detail: "v4 Hooks framework",
              },
              {
                name: "Unichain",
                detail: "Deployment chain (Sepolia testnet)",
              },
              {
                name: "Reactive Network",
                detail: "Cross-chain milestone verification (RSC)",
              },
              {
                name: "Ethereum Attestation Service",
                detail: "Onchain milestone attestations",
              },
              {
                name: "Alkahest (Arkhai)",
                detail: "Escrow-based funding channel",
              },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 0",
                  borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.4 }}>
                  {p.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: FOR WHO (role-based)
          ═══════════════════════════════════════════ */}
      <Section style={{ paddingTop: 96, paddingBottom: 96 }}>
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
            gridTemplateColumns: "1.1fr 0.9fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Traders - tallest */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: 32,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-subtle)")
            }
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Traders
            </div>
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

          {/* LPs / Sponsors - shorter, offset */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: 32,
              marginTop: 24,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-subtle)")
            }
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              LPs / Sponsors
            </div>
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
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: 32,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-subtle)")
            }
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Project Owners
            </div>
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
      </Section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 32px",
          borderTop: "1px solid var(--border-subtle)",
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
