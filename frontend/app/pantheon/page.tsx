"use client";

import Link from "next/link";
import { Navigation } from "../../components/Navigation";
import { BrandMark } from "../../components/Brand";
import Committee from "../../components/Committee";

/**
 * Pantheon — the committee verification path for ImpactHook.
 * A funder convenes a committee of standards agents + domain experts + an
 * adversarial Critic that review a milestone's evidence and return a signed,
 * reasoned verdict that releases the escrow tranche. Humans and agents together.
 * Framed honestly as in-development (Growth / LTAS-stage capability).
 */

const ROLES = [
  { name: "Coordinator", desc: "Convenes the committee the funder configured and runs the review." },
  { name: "Validator", desc: "Checks the evidence against its assigned standard or domain and proposes a verdict." },
  { name: "Critic", desc: "Adversarial seat: tries to refute the evidence and surface what is missing or overstated." },
  { name: "Aggregator", desc: "Weighs the seats' verdicts into a single, reasoned decision." },
  { name: "Notary", desc: "Signs the verdict and its rationale and records it onchain." },
];

const FLOW = [
  "A funder convenes the committee for a milestone",
  "Each seat reviews the evidence against its standard",
  "The Critic tries to refute it",
  "The Aggregator weighs the verdicts",
  "The Notary signs the verdict onchain",
  "The matching tranche releases",
];

export default function PantheonPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ maxWidth: 760, marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <BrandMark size={30} />
            <span className="status-pill status-pill-pending">Built · ImpactHook integration on the roadmap</span>
          </div>
          <div className="text-superhead" style={{ marginBottom: 10 }}>The committee verification path</div>
          <h1 className="heading-display" style={{ marginBottom: 18 }}>
            Pantheon: a standards committee for{" "}
            <span className="accent-word">every milestone</span>
          </h1>
          <p className="text-body" style={{ fontSize: 18, lineHeight: 1.65 }}>
            A milestone gate is only as good as the judgment behind it. Pantheon lets a funder
            convene a review committee for each milestone: standards agents, domain experts, and
            a dedicated Critic. They review the evidence and return a{" "}
            <span style={{ color: "var(--accent-light)" }}>signed, reasoned verdict</span> that
            releases the tranche. Don&apos;t trust, verify.
          </p>
        </div>

        {/* What it is */}
        <div className="grid-2" style={{ gap: 24, marginBottom: 72 }}>
          <div className="card" style={{ padding: 32 }}>
            <h3 className="heading-md" style={{ fontSize: 20, marginBottom: 10 }}>A marketplace for verifiable expertise</h3>
            <p className="text-small" style={{ lineHeight: 1.65, margin: 0 }}>
              Pantheon mints experts, and historical or archetypal figures, as intelligent NFTs
              (ERC-7857). You assemble them into a committee on demand and get a signed, reasoned
              verdict on any claim. For ImpactHook, the claim is &ldquo;this milestone was met.&rdquo;
            </p>
          </div>
          <div className="card" style={{ padding: 32 }}>
            <h3 className="heading-md" style={{ fontSize: 20, marginBottom: 10 }}>People and agents, together</h3>
            <p className="text-small" style={{ lineHeight: 1.65, margin: 0 }}>
              A single verifier can be a person or an agent. A committee is both at once: expert
              agents do the first pass, a human Critic and in-country reviewers keep oversight, and
              no single party decides alone. This is the &ldquo;humans + agents&rdquo; verification path.
            </p>
          </div>
        </div>

        {/* The committee → verdict visual */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 36, maxWidth: 680 }}>
            <div className="text-superhead" style={{ marginBottom: 10 }}>Who sits on the committee</div>
            <h2 className="heading-lg" style={{ marginBottom: 12 }}>The funder picks the seats</h2>
            <p className="text-body">
              Standards-trained agents do the first pass, human experts and a local reviewer keep
              oversight, and an adversarial Critic tries to refute the evidence. They deliberate and
              converge on one signed verdict. No single party decides alone.
            </p>
          </div>
          <Committee />
        </div>

        {/* The flow */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 28, maxWidth: 640 }}>
            <div className="text-superhead" style={{ marginBottom: 10 }}>How a verdict is reached</div>
            <h2 className="heading-lg">From evidence to release</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {FLOW.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="font-data" style={{ fontSize: 12, color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{step}</span>
                </div>
                {i < FLOW.length - 1 && <span style={{ color: "var(--text-dim)" }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* The roles */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 28, maxWidth: 640 }}>
            <div className="text-superhead" style={{ marginBottom: 10 }}>Five roles</div>
            <h2 className="heading-lg">Every decision has an author</h2>
            <p className="text-body" style={{ marginTop: 10 }}>
              Roles are explicit, so a verdict is never an anonymous black box. The adversarial
              Critic is the most important detail: it builds skepticism into the system and
              preempts impact-washing.
            </p>
          </div>
          <div className="grid-3" style={{ gap: 20 }}>
            {ROLES.map((r) => (
              <div key={r.name} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <BrandMark size={18} />
                  <h4 className="heading-sm" style={{ fontSize: 15 }}>{r.name}</h4>
                </div>
                <p className="text-small" style={{ lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters + tech + CTA */}
        <div className="card" style={{ padding: 40 }}>
          <div className="grid-2" style={{ gap: 40, alignItems: "center" }}>
            <div>
              <h2 className="heading-md" style={{ marginBottom: 12 }}>Why a committee, and why now</h2>
              <p className="text-small" style={{ lineHeight: 1.7, marginBottom: 16 }}>
                It answers the obvious question a funder asks: who decides a milestone is met?
                A committee of named, standards-anchored seats, with a Critic, is more credible
                than a single oracle, and it encodes public standards as a digital public good.
                Pantheon itself is built; wiring it into ImpactHook as a verification path is the
                Growth-stage roadmap.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["ERC-7857 iNFT", "0G", "ENS", "Gensyn", "Built at ETHGlobal OpenAgents"].map((t) => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="https://github.com/erinmagennis/pantheon" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "13px 28px" }}>
                View Pantheon on GitHub
              </a>
              <Link href="/dashboard" className="btn-secondary" style={{ padding: "13px 28px" }}>
                Back to the app
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
