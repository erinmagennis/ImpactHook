"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";
import { usePoolDiscovery, DiscoveredProject } from "../../hooks/usePoolDiscovery";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

// ── Summary Card ──────────────────────────────────────────────

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
          color: "var(--text-primary)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────

const ACCENT_CYCLE = [
  { color: "var(--accent)", bg: "rgba(34, 211, 238, 0.08)", border: "rgba(34, 211, 238, 0.2)" },
  { color: "var(--success)", bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.2)" },
  { color: "#7c3aed", bg: "rgba(167, 139, 250, 0.08)", border: "rgba(167, 139, 250, 0.2)" },
  { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.2)" },
];

function ContributedProjectCard({
  project,
  contribution,
  index,
}: {
  project: DiscoveredProject;
  contribution: bigint;
  index: number;
}) {
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];
  const verified = Number(project.currentMilestone);
  const total = Number(project.milestoneCount);
  const progressPct = total > 0 ? (verified / total) * 100 : 0;
  const allVerified = total > 0 && verified >= total - 1;

  return (
    <div
      className={`card animate-fade-up delay-${(index + 4) * 100}`}
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
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {project.name || "Unnamed Project"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {project.category || "Uncategorized"}
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: accent.bg,
            color: accent.color,
            border: `1px solid ${accent.border}`,
          }}
        >
          {allVerified ? "Complete" : "Active"}
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
        <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Your contribution
        </span>
        <span
          className="font-data"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {formatEther(contribution)} ETH
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
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
            style={{ fontSize: 13, color: "var(--text-secondary)" }}
          >
            {verified} / {total}
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 8,
            background: "var(--bg-elevated)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: 8,
              background: `linear-gradient(90deg, ${accent.color}, ${accent.color}88)`,
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* Fee rate + recipient */}
      <div
        style={{
          display: "flex",
          gap: 24,
          fontSize: 13,
          color: "var(--text-dim)",
        }}
      >
        <span>
          Fee rate:{" "}
          <span className="font-data" style={{ color: "var(--text-secondary)" }}>
            {project.currentFeeBps / 100}%
          </span>
        </span>
        <span>
          Recipient:{" "}
          <span className="font-data" style={{ color: "var(--text-secondary)" }}>
            {project.recipient.slice(0, 6)}...{project.recipient.slice(-4)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 28,
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "var(--text-dim)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            Loading onchain data...
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

function EmptyState({ isConnected }: { isConnected: boolean }) {
  return (
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
          opacity: 0.5,
        }}
      >
        {/* simple icon placeholder */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{ display: "inline-block" }}
        >
          <rect
            x="4"
            y="8"
            width="40"
            height="32"
            rx="2"
            stroke="var(--text-dim)"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="4"
            y1="18"
            x2="44"
            y2="18"
            stroke="var(--text-dim)"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        {isConnected ? "No contributions yet" : "Connect your wallet"}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: 400,
          margin: "0 auto",
        }}
      >
        {isConnected
          ? "Swap through any impact pool to start building your portfolio. Every trade routed through an ImpactHook pool is recorded onchain."
          : "Connect your wallet to see your impact portfolio. Every swap through an impact pool automatically tracks your contributions onchain."}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { projects, poolIds, isLoading: poolsLoading } = usePoolDiscovery();

  // Read globalContributions for connected wallet
  const { data: globalContribution } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "globalContributions",
    args: address ? [address] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!address },
  });

  // Batch read contributions(address, poolId) for every discovered pool
  const contributionCalls = address
    ? poolIds.map((poolId) => ({
        address: HOOK_ADDRESS as `0x${string}`,
        abi: impactHookAbi,
        functionName: "contributions" as const,
        args: [address, poolId] as const,
        chainId: unichainSepolia.id,
      }))
    : [];

  const { data: contributionResults, isLoading: contributionsLoading } =
    useReadContracts({
      contracts: contributionCalls,
      query: { enabled: contributionCalls.length > 0 },
    });

  // Build list of pools where user has non-zero contributions
  const fundedProjects: { project: DiscoveredProject; contribution: bigint }[] =
    [];
  if (contributionResults && projects.length > 0) {
    for (let i = 0; i < poolIds.length; i++) {
      const result = contributionResults[i];
      if (result?.status === "success" && result.result) {
        const amount = result.result as bigint;
        if (amount > BigInt(0)) {
          const project = projects.find((p) => p.poolId === poolIds[i]);
          if (project) {
            fundedProjects.push({ project, contribution: amount });
          }
        }
      }
    }
  }

  const isLoading = poolsLoading || contributionsLoading;
  const totalContributed = globalContribution as bigint | undefined;
  const projectCount = fundedProjects.length;

  // Count verified milestones across funded projects
  const totalVerifiedMilestones = fundedProjects.reduce(
    (sum, { project }) => sum + Number(project.currentMilestone),
    0
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navigation />
      <main
        style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}
      >
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
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            Every swap through an impact pool funds real-world outcomes. This is
            what your trades have built so far.
          </p>
        </div>

        {/* Connected state with data */}
        {isConnected && !isLoading && fundedProjects.length > 0 && (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 40,
              }}
            >
              <SummaryCard
                label="Total contributed"
                value={
                  totalContributed
                    ? `${formatEther(totalContributed)} ETH`
                    : "0 ETH"
                }
                delay="delay-100"
              />
              <SummaryCard
                label="Projects funded"
                value={String(projectCount)}
                delay="delay-200"
              />
              <SummaryCard
                label="Milestones verified"
                value={String(totalVerifiedMilestones)}
                delay="delay-300"
              />
            </div>

            {/* Project cards */}
            <div style={{ marginBottom: 40 }}>
              <h2
                className="font-display animate-fade-up delay-300"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
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
                {fundedProjects.map(({ project, contribution }, i) => (
                  <ContributedProjectCard
                    key={project.poolId}
                    project={project}
                    contribution={contribution}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isConnected && isLoading && (
          <div style={{ marginBottom: 40 }}>
            <LoadingSkeleton />
          </div>
        )}

        {/* Empty / disconnected state */}
        {(!isConnected || (!isLoading && fundedProjects.length === 0)) && (
          <div style={{ marginBottom: 40 }}>
            <EmptyState isConnected={isConnected} />
          </div>
        )}

        {/* How this works */}
        <div
          className="card animate-fade-up delay-800"
          style={{
            padding: "24px 28px",
            borderLeft: "2px solid var(--accent)",
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            How this works
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Your portfolio builds automatically from your swaps. There is no
            opt-in or sign-up. Every trade routed through an impact pool is
            recorded onchain via the ImpactHook contract. As milestones are
            verified, you can see the real-world outcomes your contributions
            helped fund.
          </p>
        </div>
      </main>
    </div>
  );
}
