"use client";

import { useAccount } from "wagmi";
import { Navigation } from "../../components/Navigation";

const FUNDED_PROJECTS = [
  {
    name: "Clean Water - Kenya",
    category: "Public Health",
    contributed: "0.047",
    currentMilestone: 2,
    totalMilestones: 4,
    outcome: "812 people now have filtered water",
    accent: "cyan" as const,
    milestones: [
      { name: "Equipment sourced", status: "verified" as const },
      { name: "Installation complete", status: "verified" as const },
      { name: "1,000 liters filtered", status: "active" as const },
      { name: "Community-maintained", status: "pending" as const },
    ],
  },
  {
    name: "Climate Data API",
    category: "Climate / DeSci",
    contributed: "0.023",
    currentMilestone: 1,
    totalMilestones: 4,
    outcome: "Pipeline processing 3 regions of satellite data",
    accent: "emerald" as const,
    milestones: [
      { name: "Data pipeline live", status: "verified" as const },
      { name: "10 regions covered", status: "active" as const },
      { name: "API public launch", status: "pending" as const },
      { name: "Peer reviewed", status: "pending" as const },
    ],
  },
  {
    name: "School Meals - Oaxaca",
    category: "Education",
    contributed: "0.011",
    currentMilestone: 1,
    totalMilestones: 4,
    outcome: "Kitchen serving 200 students daily",
    accent: "violet" as const,
    milestones: [
      { name: "Kitchen operational", status: "verified" as const },
      { name: "1,000 meals served", status: "active" as const },
      { name: "Expanded to 2nd school", status: "pending" as const },
      { name: "Full year sustained", status: "pending" as const },
    ],
  },
];

const ACCENT_COLORS = {
  cyan: { color: "var(--accent-cyan)", bg: "rgba(34, 211, 238, 0.08)", border: "rgba(34, 211, 238, 0.2)" },
  emerald: { color: "var(--accent-emerald)", bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.2)" },
  violet: { color: "var(--accent-violet)", bg: "rgba(167, 139, 250, 0.08)", border: "rgba(167, 139, 250, 0.2)" },
};

function SummaryCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div
      className={`card card-glow animate-fade-up ${delay}`}
      style={{ padding: 24 }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        className="font-data"
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-bright)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MilestoneTimeline({
  milestones,
}: {
  milestones: { name: string; status: "verified" | "active" | "pending" }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {milestones.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            className={
              m.status === "verified"
                ? "milestone-verified"
                : m.status === "active"
                ? "milestone-active"
                : "milestone-pending"
            }
            style={{
              width: 20,
              height: 20,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {m.status === "verified" ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ display: "block" }}
              >
                <path
                  d="M2.5 6L5 8.5L9.5 4"
                  stroke="var(--accent-cyan)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : m.status === "active" ? (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-violet)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--text-dim)",
                }}
              />
            )}
          </div>
          <span
            style={{
              fontSize: 13,
              color:
                m.status === "verified"
                  ? "var(--text-bright)"
                  : m.status === "active"
                  ? "var(--text-mid)"
                  : "var(--text-dim)",
            }}
          >
            {m.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  delay,
}: {
  project: (typeof FUNDED_PROJECTS)[number];
  delay: string;
}) {
  const accent = ACCENT_COLORS[project.accent];
  const progressPct =
    (project.currentMilestone / project.totalMilestones) * 100;

  return (
    <div
      className={`card animate-fade-up ${delay}`}
      style={{ padding: 28 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-bright)",
              marginBottom: 4,
            }}
          >
            {project.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {project.category}
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: accent.bg,
            color: accent.color,
            border: `1px solid ${accent.border}`,
          }}
        >
          Active
        </div>
      </div>

      {/* Contribution */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "var(--text-dim)",
          }}
        >
          Your contribution
        </span>
        <span
          className="font-data"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-bright)",
          }}
        >
          {project.contributed} ETH
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Milestones
          </span>
          <span
            className="font-data"
            style={{ fontSize: 13, color: "var(--text-mid)" }}
          >
            {project.currentMilestone} / {project.totalMilestones}
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "var(--bg-elevated)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${accent.color}, ${accent.color}88)`,
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* Outcome */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 2,
          background: "rgba(52, 211, 153, 0.06)",
          border: "1px solid rgba(52, 211, 153, 0.12)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          Latest verified outcome
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--accent-emerald)",
            lineHeight: 1.5,
          }}
        >
          {project.outcome}
        </div>
      </div>

      {/* Milestone timeline */}
      <MilestoneTimeline milestones={project.milestones} />
    </div>
  );
}

export default function PortfolioPage() {
  const { isConnected } = useAccount();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <h1
            className="font-display text-gradient-cyan"
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Your Impact Portfolio
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-mid)",
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            Every swap through an impact pool funds real-world outcomes.
            This is what your trades have built so far.
          </p>
        </div>

        {!isConnected ? (
          <div
            className="card card-glow animate-fade-up delay-200"
            style={{
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                marginBottom: 16,
                opacity: 0.6,
              }}
            >
              {/* Wallet icon */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: "inline-block" }}
              >
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <circle cx="16" cy="14" r="1.5" fill="var(--accent-cyan)" />
              </svg>
            </div>
            <div
              className="font-display"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--text-bright)",
                marginBottom: 8,
              }}
            >
              Connect your wallet to view your portfolio
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-mid)",
                lineHeight: 1.6,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              Your impact portfolio is tied to your wallet address. Connect
              to see which projects you have funded through your swaps.
            </p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 40,
              }}
            >
              <SummaryCard label="Total contributed" value="0.081 ETH" delay="delay-100" />
              <SummaryCard label="Projects funded" value="3" delay="delay-200" />
              <SummaryCard label="Milestones verified" value="4" delay="delay-300" />
              <SummaryCard label="Beneficiaries reached" value="~1,400+" delay="delay-400" />
            </div>

            {/* Project cards */}
            <div style={{ marginBottom: 40 }}>
              <h2
                className="font-display animate-fade-up delay-300"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-bright)",
                  marginBottom: 20,
                }}
              >
                Funded Projects
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 20,
                }}
              >
                {FUNDED_PROJECTS.map((project, i) => (
                  <ProjectCard
                    key={project.name}
                    project={project}
                    delay={`delay-${(i + 4) * 100}`}
                  />
                ))}
              </div>
            </div>

            {/* How this works */}
            <div
              className="card animate-fade-up delay-800"
              style={{
                padding: "24px 28px",
                borderLeft: "2px solid var(--accent-cyan)",
              }}
            >
              <div
                className="font-display"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-bright)",
                  marginBottom: 8,
                }}
              >
                How this works
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-mid)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Your portfolio builds automatically from your swaps. There is
                no opt-in or sign-up. Every trade routed through an impact pool
                is recorded on-chain via the ImpactHook contract. As milestones
                are verified, you can see the real-world outcomes your
                contributions helped fund.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
