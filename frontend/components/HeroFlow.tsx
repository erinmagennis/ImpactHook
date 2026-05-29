"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark, StatusPill } from "./Brand";

/**
 * The hero IS the flow. As the user scrolls through this section, the funding
 * pipeline animates step by step: four funding sources accumulate, capital is
 * held in escrow, evidence is submitted, the milestone is verified onchain
 * (the bracket-checkmark draws in), funds release, and impact is delivered —
 * ending on a real outcome (photo + concrete metric).
 *
 * Built with a vanilla scroll-progress hook + CSS transitions (no motion lib).
 * Respects prefers-reduced-motion by showing the completed flow statically.
 */

const SOURCES = ["Trade-to-Fund", "Yield-to-Fund", "Direct Donation", "Institutional Escrow"];

type Stage = { key: string; title: string; desc: string; tech: string };

const STAGES: Stage[] = [
  { key: "sources", title: "Funding accumulates", desc: "Four channels feed one project: trades, LP yield, donations, and institutional escrow.", tech: "Uniswap v4 hook · ERC-20" },
  { key: "escrow", title: "Held in escrow", desc: "Nothing moves yet. Capital is locked against the project's milestones.", tech: "Escrow smart contract" },
  { key: "evidence", title: "Evidence submitted", desc: "The project uploads proof of the milestone, stored on IPFS and Filecoin.", tech: "IPFS · Filecoin · Storacha" },
  { key: "verified", title: "Verified onchain", desc: "By people or by agents: a direct call, a cross-chain message, an attestation, or an expert committee. The milestone is proven.", tech: "EAS · Reactive Network · AI agent · Pantheon" },
  { key: "released", title: "Funds released", desc: "The matching tranche unlocks automatically. Every release is public and checkable.", tech: "Onchain settlement" },
  { key: "outcome", title: "Impact delivered", desc: "Money reaches the organizations that actually deliver, and the children they serve.", tech: "Hypercerts · public onchain record" },
];

const VERIFIED_INDEX = STAGES.findIndex((s) => s.key === "verified");

function FlowIcon({ name }: { name: string }) {
  const common = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "sources":
      return <svg {...common}><path d="M3 7h7M3 12h12M3 17h7" /><path d="M17 8l4 4-4 4" /></svg>;
    case "escrow":
      return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case "evidence":
      return <svg {...common}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>;
    case "released":
      return <svg {...common}><path d="M12 21V8M8 12l4-4 4 4" /><path d="M5 4h14" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export default function HeroFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setActive(STAGES.length - 1);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        // Map progress across stages, with a little settle room at the end.
        const idx = Math.min(STAGES.length - 1, Math.floor(p * (STAGES.length + 0.4)));
        setActive(idx);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const stage = STAGES[active];

  return (
    <section
      ref={ref}
      style={{ height: reduced ? "auto" : `${STAGES.length * 46 + 100}vh`, position: "relative" }}
    >
      <div
        className="motif-field"
        style={{
          position: reduced ? "relative" : "sticky",
          top: 0,
          minHeight: reduced ? "auto" : "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: 96,
          paddingBottom: 48,
        }}
      >
        <div className="container" style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
          {/* Left: narration */}
          <div style={{ flex: "1 1 420px", maxWidth: 520 }}>
            <span className="badge badge-accent" style={{ marginBottom: 24, display: "inline-flex" }}>
              Open source · Women-led · Built with DeSci México
            </span>
            <h1 className="heading-display" style={{ marginBottom: 20 }}>
              Automatically fund{" "}
              <span className="accent-word">verified impact.</span>
            </h1>
            <p className="text-body" style={{ fontSize: 18, lineHeight: 1.65, marginBottom: 28, maxWidth: 480 }}>
              Impact funding waits in escrow and releases only when a project proves its
              milestone, <span style={{ color: "var(--accent-light)" }}>verified onchain</span> and
              public for anyone to check. Money reaches the organizations that deliver, so teams
              spend their time on the mission, not on fundraising.
            </p>

            {/* Dynamic step caption that tracks the flow */}
            <div className="card" style={{ padding: 18, marginBottom: 28, minHeight: 116, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="font-data" style={{ fontSize: 13, color: "var(--accent)", paddingTop: 2 }}>
                {String(active + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flow-node-title" key={stage.key}>{stage.title}</div>
                <div className="flow-node-desc" style={{ fontSize: 13.5 }}>{stage.desc}</div>
                <div className="font-data" style={{ marginTop: 8, fontSize: 11, color: "var(--accent-light)", letterSpacing: "0.02em" }}>
                  {stage.tech}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <Link href="/dashboard" className="btn-primary" style={{ padding: "13px 30px", fontSize: 16 }}>
                Create impact
              </Link>
              <Link href="/technical" className="btn-secondary" style={{ padding: "13px 30px", fontSize: 16 }}>
                See the proof
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--text-dim)", fontSize: 12.5 }}>
              <BrandMark size={16} />
              Every release is recorded publicly. You can check it yourself.
            </div>
            {!reduced && (
              <div className="text-caption" style={{ marginTop: 18, opacity: 0.6 }}>↓ Scroll to follow a dollar</div>
            )}
          </div>

          {/* Right: the animated pipeline */}
          <div style={{ flex: "1 1 360px", maxWidth: 440, width: "100%" }}>
            {STAGES.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              const node = (
                <div key={s.key} className={`flow-node${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}>
                  <div className="flow-icon">
                    {s.key === "verified" ? (
                      <BrandMark size={24} animate={active >= VERIFIED_INDEX} />
                    ) : s.key === "outcome" ? (
                      <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20l-1.6-1.5C5 14 2 11.2 2 7.8 2 5.1 4.1 3 6.8 3c1.7 0 3.3.9 4.2 2.3C11.9 3.9 13.5 3 15.2 3 17.9 3 20 5.1 20 7.8c0 3.4-3 6.2-8.4 10.7L12 20z" />
                      </svg>
                    ) : (
                      <FlowIcon name={s.key} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span className="flow-node-title">{s.title}</span>
                      {s.key === "verified" && (isActive || isDone) && <StatusPill state="verified">Verified</StatusPill>}
                    </div>

                    {/* Stage-specific detail — only the ACTIVE node expands */}
                    {s.key === "sources" && isActive && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {SOURCES.map((src, si) => (
                          <span key={src} className="flow-source-chip is-on" style={{ transitionDelay: `${si * 90}ms` }}>
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.key === "escrow" && isActive && (
                      <div className="flow-node-desc">
                        <span className="font-data" style={{ color: "var(--accent)" }}>2.48 ETH</span> locked · 0 released
                      </div>
                    )}
                    {s.key === "evidence" && isActive && (
                      <div className="proof-hash" style={{ marginTop: 6 }}>proof.pdf · CID bafy…h3kq · pinned to Filecoin ↗</div>
                    )}
                    {s.key === "verified" && isActive && (
                      <div className="proof-hash" style={{ marginTop: 6 }}>attestation 0xe461…fb52 · block 8,241,077 ↗</div>
                    )}
                    {s.key === "released" && isActive && (
                      <div className="flow-node-desc">
                        <span className="font-data" style={{ color: "var(--accent)" }}>1.24 ETH</span> released to the project
                      </div>
                    )}
                    {s.key === "outcome" && isActive && (
                      <div style={{ marginTop: 10 }}>
                        <div className="image-slot" style={{ aspectRatio: "16 / 7", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
                          <span className="image-slot-label">Outcome photo</span>
                          <span>Dignified photo of kids / the delivered result (you source)</span>
                        </div>
                        <div style={{ display: "flex", gap: 18 }}>
                          <div>
                            <div className="stat-value" style={{ fontSize: 22, color: "var(--accent)" }}>120</div>
                            <div className="stat-label" style={{ fontSize: 12 }}>children reached</div>
                          </div>
                          <div>
                            <div className="stat-value" style={{ fontSize: 22, color: "var(--text-primary)" }}>1</div>
                            <div className="stat-label" style={{ fontSize: 12 }}>clean-water system</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              return (
                <div key={s.key}>
                  {i > 0 && (
                    <div className={`flow-connector${i <= active ? " is-filled" : ""}`}>
                      <span className="flow-fill" />
                    </div>
                  )}
                  {node}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
