"use client";

import Link from "next/link";
import { Navigation } from "../../components/Navigation";

export default function AgentPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-article" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: "#3b82f6" }}>Autonomous Verification</div>
          <h1 className="heading-xl mt-3 mb-6" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)" }}>
            Impact Accountability Agent
          </h1>
          <p className="text-body" style={{ fontSize: 15, maxWidth: 640, lineHeight: 1.7 }}>
            An autonomous AI agent that monitors milestone evidence, analyzes it with Claude,
            stores verification reports on Filecoin, and submits onchain verification transactions.
            Every decision is logged. Every report is permanent. No human bottleneck.
          </p>
        </div>

        {/* The Problem */}
        <div className="card card-accent p-6 animate-fade-up delay-100" style={{ marginBottom: 32 }}>
          <p className="text-small" style={{ lineHeight: 1.7, margin: 0 }}>
            Milestone verification is the bottleneck in impact funding. Donors don&apos;t know if their money
            was used well. Projects hate the overhead of proving it. Manual review is slow, expensive, and
            subjective. The agent closes this loop: autonomous analysis with a permanent, decentralized audit trail.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="card p-6 animate-fade-up delay-200" style={{ marginBottom: 32, overflowX: "auto" }}>
          <div className="text-label" style={{ marginBottom: 16 }}>Verification Flow</div>
          <pre className="font-data" style={{ fontSize: 12, lineHeight: 2, color: "var(--text-secondary)", whiteSpace: "pre" }}>
{`Project uploads         Agent detects           Claude analyzes         Report stored
evidence to          →  EvidenceAttached     →  evidence against     →  permanently on
Storacha/IPFS           event onchain           milestone criteria      Filecoin Pin
                                                      │
                                            confidence ≥ 70%?
                                             yes │         │ no
                                                 ↓         ↓
                                   verifyMilestone()    store report,
                                   submitted onchain    defer to human
                                         │
                                         ↓
                              MilestoneArbiter returns true
                              → Alkahest escrow releases funds`}
          </pre>
        </div>

        {/* How It Works - 4 steps */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-data" style={{ fontSize: 18, color: "#3b82f6" }}>1</span>
                <span className="heading-sm">Watches</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Monitors <span className="font-data" style={{ color: "var(--accent)" }}>EvidenceAttached</span> events
                on ImpactHook. When a project uploads evidence to Storacha or Filecoin and stores the CID onchain,
                the agent detects it within seconds.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-data" style={{ fontSize: 18, color: "#3b82f6" }}>2</span>
                <span className="heading-sm">Fetches</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Retrieves the evidence file from Storacha/IPFS gateways using the CID. Supports images,
                PDFs, JSON reports, CSV data, and text documents. Multiple gateway fallbacks for reliability.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-data" style={{ fontSize: 18, color: "#3b82f6" }}>3</span>
                <span className="heading-sm">Analyzes</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Sends the evidence and milestone description to Claude for structured evaluation.
                Returns a confidence score, per-criterion breakdown, and reasoning. Vision capability
                for image evidence, document analysis for PDFs.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-data" style={{ fontSize: 18, color: "#3b82f6" }}>4</span>
                <span className="heading-sm">Verifies</span>
              </div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                If approved with confidence above the threshold, submits{" "}
                <span className="font-data" style={{ color: "var(--accent)" }}>verifyMilestone()</span> onchain.
                The verification report is stored permanently on Filecoin. MilestoneArbiter gates unlock,
                releasing Alkahest escrow funds.
              </p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Storage Architecture */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: "#3b82f6" }}>Decentralized Storage</div>
          <h2 className="heading-md mt-3 mb-6">Where agent data lives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: "#3b82f6" }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>Agent Memory</span>
              </div>
              <div className="font-data text-caption mb-2" style={{ color: "#3b82f6" }}>Storacha (IPFS)</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Past verifications, project knowledge, and processed event history.
                Persists across sessions. Agent loads its memory from the latest CID on restart.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: "#3b82f6" }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>Verification Reports</span>
              </div>
              <div className="font-data text-caption mb-2" style={{ color: "#3b82f6" }}>Filecoin Pin (Calibration)</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Structured JSON reports with per-criterion analysis, confidence scores, and reasoning.
                Stored via Synapse SDK. Permanent, verifiable audit trail accessible via IPFS CID.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="status-dot" style={{ background: "#3b82f6" }} />
                <span className="heading-sm" style={{ fontSize: 13 }}>Execution Logs</span>
              </div>
              <div className="font-data text-caption mb-2" style={{ color: "#3b82f6" }}>Filecoin Pin (Calibration)</div>
              <p className="text-caption" style={{ lineHeight: 1.6 }}>
                Structured logs of every decision, tool call, and error. Flushed to Filecoin on shutdown.
                Proves the agent operated autonomously and made verifiable decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Guardrails */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: "var(--success)" }}>Safety</div>
          <h2 className="heading-md mt-3 mb-6">Guardrails and accountability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Confidence threshold",
                desc: "Only auto-verifies when Claude's confidence exceeds 70%. Below that, stores the report but defers the decision to a human verifier.",
                icon: "70%",
              },
              {
                label: "Dry-run mode",
                desc: "Full analysis pipeline without submitting onchain transactions. Analyze evidence, generate reports, persist memory, but never call verifyMilestone().",
                icon: "--",
              },
              {
                label: "Structured audit trail",
                desc: "Every decision is logged with timestamp, action type, and details. Logs are flushed to Filecoin on shutdown. Anyone can audit why the agent approved or rejected.",
                icon: "{}",
              },
              {
                label: "Budget awareness",
                desc: "Configurable max Claude calls per hour. Agent tracks gas costs and storage costs per session. Designed to operate under real economic constraints.",
                icon: "$",
              },
            ].map((item) => (
              <div key={item.label} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-data" style={{ fontSize: 14, color: "var(--success)" }}>{item.icon}</span>
                  <span className="heading-sm" style={{ fontSize: 13 }}>{item.label}</span>
                </div>
                <p className="text-caption" style={{ lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Agent Registry */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md mb-4">Onchain Agent Registry</h2>
          <div className="card p-6" style={{ marginBottom: 16 }}>
            <p className="text-small" style={{ lineHeight: 1.7, marginBottom: 16 }}>
              <span className="font-data" style={{ color: "#3b82f6" }}>AgentRegistry.sol</span> on Filecoin Calibration
              lets agents register identity, store metadata and state CIDs, and build verifiable reputation from
              their verification history.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Register", detail: "Name + agent.json CID" },
                { label: "Update", detail: "Latest memory CID" },
                { label: "Record", detail: "Each verification + report CID" },
                { label: "Reputation", detail: "Approval rate from history" },
              ].map((item) => (
                <div key={item.label} className="p-3" style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
                  <div className="text-label mb-1">{item.label}</div>
                  <div className="text-caption">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Live Demo Result */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <div className="text-superhead" style={{ color: "var(--accent)" }}>Live Result</div>
          <h2 className="heading-md mt-3 mb-6">Agent verification in action</h2>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="status-dot" style={{ background: "var(--success)" }} />
              <span className="heading-sm">Clean Water Initiative - Milestone #0</span>
              <span className="badge badge-success" style={{ marginLeft: "auto" }}>Approved</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-label mb-1">Confidence</div>
                <div className="font-data" style={{ fontSize: 18, color: "var(--success)" }}>85%</div>
              </div>
              <div>
                <div className="text-label mb-1">Analysis Time</div>
                <div className="font-data" style={{ fontSize: 18, color: "var(--text-primary)" }}>6s</div>
              </div>
              <div>
                <div className="text-label mb-1">Evidence</div>
                <div className="font-data" style={{ fontSize: 18, color: "var(--text-primary)" }}>1.2 KB</div>
              </div>
              <div>
                <div className="text-label mb-1">Model</div>
                <div className="font-data" style={{ fontSize: 18, color: "var(--text-primary)" }}>Haiku</div>
              </div>
            </div>
            <div className="text-label mb-2">Criteria Evaluation</div>
            <div className="flex flex-col gap-2">
              {[
                { met: true, criterion: "Project officially registered", notes: 'Report states "Project registered and ready for Phase 1 implementation"' },
                { met: true, criterion: "Registration documented in credible record", notes: "Professional baseline report with institutional backing (Universidad Autonoma de Chiapas)" },
                { met: true, criterion: "Project scope clearly defined", notes: "20 schools in rural Chiapas identified with baseline conditions established" },
                { met: true, criterion: "Initial planning/setup activities completed", notes: "WHO/UNICEF protocol testing complete, priority installation order established" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2" style={{ fontSize: 12 }}>
                  <span style={{ color: c.met ? "var(--success)" : "#ef4444", flexShrink: 0, marginTop: 1 }}>
                    {c.met ? "\u2713" : "\u2717"}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{c.criterion}</strong>
                    {" \u2014 "}
                    {c.notes}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <a
                href="https://bafkreihotoq7p7kfktdosvotvkuujlsrx66xkpielk5ujm3vobuuf25fcu.ipfs.storacha.link"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}
              >
                View evidence on Storacha
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card p-8 text-center animate-fade-up">
          <h3 className="heading-md mb-3">Run the agent</h3>
          <pre className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            cd agent && bun install && bun agent.ts --dry-run
          </pre>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/erinmagennis/ImpactHook/tree/main/agent"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide"
              style={{ borderRadius: 6, textDecoration: "none" }}
            >
              View Source
            </a>
            <Link
              href="/technical"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-wide"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", borderRadius: 6, textDecoration: "none" }}
            >
              Technical Deep Dive
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
