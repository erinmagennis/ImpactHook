"use client";

import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS } from "../../lib/contracts";

const CONTACT_EMAIL = "erin@erinmagennis.com";

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: { [k: string]: React.ReactNode } = {
    bank: <><path d="M3 21h18" /><path d="M5 21V10M10 21V10M14 21V10M19 21V10" /><path d="M12 3l9 5H3z" /></>,
    yield: <path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    data: <><path d="M3 20h18" /><path d="M6 20v-6M11 20V8M16 20v-10" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function PartnersPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <div className="container" style={{ paddingTop: 64, paddingBottom: 96 }}>
        {/* Hero */}
        <div className="animate-fade-up" style={{ maxWidth: 720, marginBottom: 56 }}>
          <div className="text-superhead">Partner with us</div>
          <h1 className="heading-xl" style={{ marginBottom: 16 }}>
            Fund the work that <span className="accent-word">delivers</span>, with proof
          </h1>
          <p className="text-body">
            ImpactHook routes capital to impact projects and releases it only against milestones
            verified onchain. For institutions and liquidity providers, that means audit-grade
            accountability by default: every dollar is traceable, and funds reach organizations as
            they actually deliver. We are looking for partners on both fronts.
          </p>
        </div>

        {/* Two audiences */}
        <div className="grid-2" style={{ gap: 24, marginBottom: 48 }}>
          {/* Institutions */}
          <div className="card card-accent" style={{ padding: 32 }}>
            <span style={{ color: "var(--accent-light)", display: "inline-flex", marginBottom: 16 }}>
              <Icon name="bank" size={26} />
            </span>
            <div className="badge badge-accent" style={{ marginBottom: 12 }}>For institutions &amp; funders</div>
            <h2 className="heading-md" style={{ marginBottom: 12 }}>Milestone-gated escrow for grants</h2>
            <p className="text-small" style={{ marginBottom: 20 }}>
              Run a funding pool to your own standard. Capital sits in milestone-gated escrow
              (Alkahest, Zellic-audited) and releases only as verified milestones are hit, with the
              same onchain source of truth your reporting can read directly.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["lock", "Funds release only against verified milestones"],
                ["data", "Audit-grade onchain reporting, no trust required"],
                ["bank", "Run your own pool, recipients, and verification standard"],
              ].map(([icon, text]) => (
                <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "var(--accent-light)", flexShrink: 0, marginTop: 1 }}>
                    <Icon name={icon} size={16} />
                  </span>
                  <span className="text-small">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Liquidity providers */}
          <div className="card card-accent" style={{ padding: 32 }}>
            <span style={{ color: "var(--accent-light)", display: "inline-flex", marginBottom: 16 }}>
              <Icon name="yield" size={26} />
            </span>
            <div className="badge badge-accent" style={{ marginBottom: 12 }}>For liquidity providers</div>
            <h2 className="heading-md" style={{ marginBottom: 12 }}>Provide liquidity, fund impact through yield</h2>
            <p className="text-small" style={{ marginBottom: 20 }}>
              When you provide liquidity to an impact pool, the hook skims a small, configurable
              share of LP fees to the project. You keep earning on your position while a slice of
              the yield flows to verified impact. No extra steps after you add liquidity.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                ["yield", "Your position keeps earning; a configurable slice funds impact"],
                ["lock", "Skim only flows while milestones gate the release"],
                ["data", "Every contribution is visible onchain"],
              ].map(([icon, text]) => (
                <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "var(--accent-light)", flexShrink: 0, marginTop: 1 }}>
                    <Icon name={icon} size={16} />
                  </span>
                  <span className="text-small">{text}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://app.uniswap.org/positions/create"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ width: "100%" }}
            >
              Add liquidity on Uniswap
            </a>
            <div className="text-helper" style={{ marginTop: 10 }}>
              Add liquidity to a pool that uses the ImpactHook hook on Unichain Sepolia. Hook
              address: <span className="font-data" style={{ color: "var(--text-secondary)" }}>{HOOK_ADDRESS}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <h2 className="heading-md" style={{ marginBottom: 10 }}>Let&apos;s talk</h2>
          <p className="text-small" style={{ maxWidth: 520, margin: "0 auto 24px" }}>
            Whether you are an institution looking to fund with accountability or an LP who wants
            your yield to do more, reach out and we will get you set up.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary">
            Partner with us
          </a>
        </div>
      </div>
    </div>
  );
}
