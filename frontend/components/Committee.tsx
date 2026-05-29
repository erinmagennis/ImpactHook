"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BrandMark } from "./Brand";
import { useInView } from "./useInView";

/**
 * The committee visual for Pantheon: a bench of seats — standards-trained agents,
 * a values figure, human experts, and an adversarial Critic — that deliberate and
 * converge on one signed verdict which releases the tranche.
 *
 * Lines are drawn from each seat to the verdict box via measured positions (refs +
 * ResizeObserver), so they stay aligned even as the chips wrap. They draw in on scroll.
 */

type Kind = "Agent" | "Human" | "Critic" | "Figure";
type Seat = { label: string; kind: Kind };

const SEATS: Seat[] = [
  { label: "Convention on the Rights of the Child", kind: "Agent" },
  { label: "Principles for Digital Development", kind: "Agent" },
  { label: "Digital Public Goods Standard", kind: "Agent" },
  { label: "Child-safeguarding (RD4C)", kind: "Agent" },
  { label: "SDG indicators", kind: "Agent" },
  { label: "Mother Teresa", kind: "Figure" },
  { label: "Domain expert", kind: "Human" },
  { label: "Local, in-country reviewer", kind: "Human" },
  { label: "The Critic", kind: "Critic" },
];

const FIGURE_COLOR = "#caa46a";

function kindColor(kind: Kind) {
  if (kind === "Human") return "var(--slate-light)";
  if (kind === "Critic") return "var(--warning)";
  if (kind === "Figure") return FIGURE_COLOR;
  return "var(--accent-light)";
}

const LEGEND: { k: Kind; label: string }[] = [
  { k: "Agent", label: "Standards agent" },
  { k: "Figure", label: "Values figure (iNFT)" },
  { k: "Human", label: "Human expert" },
  { k: "Critic", label: "Adversarial Critic" },
];

export default function Committee({ compact = false }: { compact?: boolean }) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const seatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ d: string; color: string }[]>([]);

  const compactLabels = ["Convention on the Rights of the Child", "Child-safeguarding (RD4C)", "Mother Teresa", "Domain expert", "The Critic"];
  const seats = compact ? SEATS.filter((s) => compactLabels.includes(s.label)) : SEATS;

  useLayoutEffect(() => {
    function compute() {
      const c = containerRef.current;
      const box = boxRef.current;
      if (!c || !box) return;
      const cr = c.getBoundingClientRect();
      const br = box.getBoundingClientRect();
      const ex = br.left + br.width / 2 - cr.left;
      const ey = br.top - cr.top;
      const next: { d: string; color: string }[] = [];
      seats.forEach((seat, i) => {
        const el = seatRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        const sx = r.left + r.width / 2 - cr.left;
        const sy = r.bottom - cr.top;
        const dy = Math.max(24, ey - sy);
        next.push({ d: `M${sx} ${sy} C ${sx} ${sy + dy * 0.55}, ${ex} ${ey - dy * 0.55}, ${ex} ${ey}`, color: kindColor(seat.kind) });
      });
      setLines(next);
    }
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  return (
    <div
      ref={viewRef}
      className={inView ? "in-view" : ""}
      style={{
        padding: "34px 28px",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        background: "var(--bg-card)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* example + legend, on one line */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="status-pill status-pill-pending">Under review</span>
          <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Milestone 2 · &ldquo;Clean-water well installed&rdquo; · Agua Limpia, Chiapas
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {LEGEND.map((l) => (
            <span key={l.k} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-dim)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: kindColor(l.k) }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* container holds the line overlay + bench + verdict box */}
      <div ref={containerRef} style={{ position: "relative" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible", zIndex: 0 }} aria-hidden="true">
          {lines.map((ln, i) => (
            <path
              key={i}
              d={ln.d}
              fill="none"
              stroke={ln.color}
              strokeWidth={1.1}
              opacity={0.6}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: inView ? 0 : 1, transition: "stroke-dashoffset 0.7s ease", transitionDelay: `${i * 0.05}s` }}
            />
          ))}
        </svg>

        {/* the bench of seats */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", position: "relative", zIndex: 1 }}>
          {seats.map((s, i) => (
            <div
              key={s.label}
              ref={(el) => { seatRefs.current[i] = el; }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${kindColor(s.kind)}40`,
                background: "var(--bg-elevated)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: kindColor(s.kind), flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* the signed verdict */}
        <div ref={boxRef} style={{ position: "relative", zIndex: 1, marginTop: 64 }}>
          <div style={{ padding: 22, borderRadius: "var(--radius-card)", border: "1px solid var(--accent)", background: "#14201e", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
            <BrandMark size={30} animate={inView} />
            <div className="heading-sm" style={{ fontSize: 15 }}>The committee returns one signed verdict</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
              Milestone 2 verified · Committee agrees · Critic: no objection · verdict 0x9f2a…c41d ↗{" "}
              <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>→ tranche releases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
