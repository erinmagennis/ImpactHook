"use client";

import { BrandMark } from "./Brand";
import { useInView } from "./useInView";

/**
 * Convergence diagram: four funding channels connect into ONE milestone gate,
 * which releases to the project. Replaces the old four-identical-cards grid with
 * a picture of the core idea — "four ways in, one rule out." Lines draw on scroll.
 */

const SOURCES = [
  { icon: "swap", label: "Trade-to-Fund", sub: "share of swap fees" },
  { icon: "yield", label: "Yield-to-Fund", sub: "LP fee yield" },
  { icon: "heart", label: "Direct Donation", sub: "ETH or any ERC-20" },
  { icon: "lock", label: "Institutional Escrow", sub: "foundations & agencies" },
];

function SrcIcon({ name }: { name: string }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "swap": return <svg {...c}><path d="M4 9h13M14 6l3 3-3 3" /><path d="M20 15H7M10 12l-3 3 3 3" /></svg>;
    case "yield": return <svg {...c}><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" /></svg>;
    case "heart": return <svg {...c}><path d="M12 20l-1.6-1.5C5 14 2 11.2 2 7.8 2 5.1 4.1 3 6.8 3c1.7 0 3.3.9 4.2 2.3C11.9 3.9 13.5 3 15.2 3 17.9 3 20 5.1 20 7.8c0 3.4-3 6.2-8.4 10.7L12 20z" /></svg>;
    default: return <svg {...c}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  }
}

export default function FundingFlow() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className={inView ? "in-view" : ""}>
      <div className="converge">
        {/* Sources */}
        <div className="converge-sources">
          {SOURCES.map((s, i) => (
            <div key={s.label} className={`converge-source reveal d${i + 1}`}>
              <span className="flow-icon"><SrcIcon name={s.icon} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</span>
                <span className="text-caption">{s.sub}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Converging connectors */}
        <div className="converge-connector" style={{ minHeight: 200 }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {[12, 37, 63, 88].map((y, i) => (
              <path key={y} className="draw-path" d={`M0 ${y} C 55 ${y}, 45 50, 100 50`} fill="none" stroke="var(--accent)" strokeWidth="0.8" strokeLinecap="round" style={{ animationDelay: `${0.2 + i * 0.1}s` }} />
            ))}
          </svg>
        </div>

        {/* The one gate */}
        <div className="converge-gate reveal d4">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <BrandMark size={34} animate={inView} />
          </div>
          <div className="heading-sm" style={{ marginBottom: 6 }}>One milestone gate</div>
          <p className="text-small" style={{ margin: 0, lineHeight: 1.55 }}>
            However the money arrives, nothing releases until the project proves its milestone
            onchain. Then the matching tranche unlocks, to the project.
          </p>
        </div>
      </div>
    </div>
  );
}
