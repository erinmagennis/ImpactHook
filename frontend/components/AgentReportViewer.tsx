"use client";

import { useState, useEffect } from "react";

interface CriterionMatch {
  criterion: string;
  met: boolean;
  notes: string;
}

interface VerificationReport {
  version: string;
  agentId: string;
  timestamp: string;
  project: { poolId: string; name: string; category: string };
  milestone: { index: number; description: string };
  evidence: { cid: string; type: string; size: number };
  analysis: {
    approved: boolean;
    confidence: number;
    reasoning: string;
    evidenceType: string;
    criteriaMatch: CriterionMatch[];
  };
  decision: "approved" | "rejected" | "deferred";
  onchainTx?: string;
}

export function AgentReportViewer({ reportCid }: { reportCid: string }) {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportCid || report) return;

    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://${reportCid}.ipfs.storacha.link`,
          { signal: AbortSignal.timeout(10_000) }
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setReport(data);
      } catch {
        try {
          const res = await fetch(
            `https://ipfs.io/ipfs/${reportCid}`,
            { signal: AbortSignal.timeout(10_000) }
          );
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          setReport(data);
        } catch {
          setError("Could not load report");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportCid]);

  if (loading) {
    return (
      <div style={{ fontSize: 12, color: "var(--text-dim)", padding: "6px 0" }}>
        Loading agent report...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontSize: 12, color: "var(--text-dim)", padding: "6px 0" }}>
        <a
          href={`https://ipfs.io/ipfs/${reportCid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#3b82f6", textDecoration: "none" }}
        >
          View raw report
        </a>
      </div>
    );
  }

  if (!report) return null;

  const decisionColor =
    report.decision === "approved"
      ? "var(--success)"
      : report.decision === "rejected"
        ? "#ef4444"
        : "#f59e0b";

  return (
    <div
      style={{
        borderRadius: 6,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: decisionColor,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            Agent Report
          </span>
          <span
            className="font-data"
            style={{ fontSize: 11, color: "var(--text-dim)" }}
          >
            {report.analysis.confidence}% confidence
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {expanded ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: "0 12px 12px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ paddingTop: 10, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {report.analysis.reasoning}
          </div>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {report.analysis.criteriaMatch.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: c.met ? "var(--success)" : "#ef4444", flexShrink: 0 }}>
                  {c.met ? "\u2713" : "\u2717"}
                </span>
                <span>
                  <strong style={{ color: "var(--text-primary)" }}>{c.criterion}</strong>
                  {" \u2014 "}
                  {c.notes}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="font-data" style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {new Date(report.timestamp).toLocaleString()}
            </span>
            <a
              href={`https://ipfs.io/ipfs/${reportCid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#3b82f6", textDecoration: "none" }}
            >
              Full report (IPFS)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentVerifierBadge({ verifier }: { verifier: string }) {
  // Known agent addresses could be expanded
  // For now, show a distinct badge when the verifier is not a typical EOA pattern
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        background: "rgba(59,130,246,0.06)",
        border: "1px solid rgba(59,130,246,0.12)",
        color: "#3b82f6",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1L10.5 3.5L14 3L13.5 6.5L16 8L13.5 9.5L14 13L10.5 12.5L8 15L5.5 12.5L2 13L2.5 9.5L0 8L2.5 6.5L2 3L5.5 3.5L8 1Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      AI Agent Verifier
    </div>
  );
}
