"use client";

import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";
import { usePoolDiscovery, DiscoveredProject } from "../../hooks/usePoolDiscovery";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

const ACCENT_CYCLE = [
  { color: "var(--accent)", border: "var(--accent)" },
  { color: "var(--success)", border: "var(--success)" },
  { color: "#7c3aed", border: "#7c3aed" },
  { color: "#fbbf24", border: "#fbbf24" },
];

function SummaryCard({ label, value, delay }: { label: string; value: string; delay: string }) {
  return (
    <div className={`card animate-fade-up ${delay}`}>
      <div className="text-label">{label}</div>
      <div className="stat-value" style={{ color: "var(--accent)" }}>{value}</div>
    </div>
  );
}

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
      className={`card animate-fade-up delay-${Math.min((index + 4) * 100, 800)}`}
      style={{ borderLeft: `2px solid ${accent.border}` }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="heading-sm" style={{ fontSize: 16, marginBottom: 4 }}>
            {project.name || "Unnamed Project"}
          </div>
          <div className="text-caption">{project.category || "Uncategorized"}</div>
        </div>
        <span className={`badge ${allVerified ? "badge-success" : "badge-accent"}`}>
          {allVerified ? "Complete" : "Active"}
        </span>
      </div>

      {/* Contribution */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span className="text-small" style={{ margin: 0 }}>Your contribution</span>
        <span className="font-data" style={{ fontSize: 16, fontWeight: 600, color: accent.color }}>
          {formatEther(contribution)} ETH
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span className="text-small" style={{ margin: 0 }}>Milestones</span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {verified} / {total}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: accent.color }} />
        </div>
      </div>

      {/* Fee rate + recipient */}
      <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
        <span className="text-small" style={{ margin: 0 }}>
          Fee: <span className="font-data" style={{ color: "var(--text-secondary)" }}>{project.currentFeeBps / 100}%</span>
        </span>
        <span className="text-small" style={{ margin: 0 }}>
          Recipient: <span className="font-data" style={{ color: "var(--text-secondary)" }}>{project.recipient.slice(0, 6)}...{project.recipient.slice(-4)}</span>
        </span>
      </div>
    </div>
  );
}

function EmptyState({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="card animate-fade-up delay-200" style={{ padding: "48px 32px", textAlign: "center" }}>
      <div style={{ marginBottom: 16, opacity: 0.4 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display: "inline-block" }}>
          <rect x="4" y="8" width="40" height="32" rx="4" stroke="var(--text-dim)" strokeWidth="2" fill="none" />
          <line x1="4" y1="18" x2="44" y2="18" stroke="var(--text-dim)" strokeWidth="2" />
        </svg>
      </div>
      <div className="heading-sm" style={{ marginBottom: 8 }}>
        {isConnected ? "No contributions yet" : "Connect your wallet"}
      </div>
      <p className="text-body" style={{ maxWidth: 400, margin: "0 auto 20px" }}>
        {isConnected
          ? "Swap through any impact pool to start building your portfolio. Every trade routed through a Uniswap v4 ImpactHook pool is recorded onchain."
          : "Connect your wallet to see your impact portfolio. Every swap through an impact pool automatically tracks your contributions onchain."}
      </p>
      {isConnected && (
        <Link href="/swap" className="btn-primary" style={{ fontSize: 14 }}>
          Make your first swap
        </Link>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { projects, poolIds, isLoading: poolsLoading } = usePoolDiscovery();

  const { data: globalContribution } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "globalContributions",
    args: address ? [address] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!address },
  });

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

  const fundedProjects: { project: DiscoveredProject; contribution: bigint }[] = [];
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
  const totalVerifiedMilestones = fundedProjects.reduce(
    (sum, { project }) => sum + Number(project.currentMilestone),
    0
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-wide" style={{ paddingTop: 40, paddingBottom: 48 }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>
            Your Impact Portfolio
          </h1>
          <p className="text-body" style={{ maxWidth: 520, margin: 0 }}>
            Every swap through an impact pool funds real-world outcomes. This is what your trades have built so far.
          </p>
        </div>

        {/* Summary stats */}
        {isConnected && !isLoading && fundedProjects.length > 0 && (
          <>
            <div className="grid-3" style={{ marginBottom: 40 }}>
              <SummaryCard
                label="Total contributed"
                value={totalContributed ? `${formatEther(totalContributed)} ETH` : "0 ETH"}
                delay="delay-100"
              />
              <SummaryCard label="Projects funded" value={String(projectCount)} delay="delay-200" />
              <SummaryCard label="Milestones verified" value={String(totalVerifiedMilestones)} delay="delay-300" />
            </div>

            {/* Project cards */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="heading-md animate-fade-up delay-300" style={{ marginBottom: 20 }}>
                Funded Projects
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {fundedProjects.map(({ project, contribution }, i) => (
                  <ContributedProjectCard key={project.poolId} project={project} contribution={contribution} index={i} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isConnected && isLoading && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2].map((i) => (
                <div key={i} className="card" style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-small">Loading onchain data...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty / disconnected */}
        {(!isConnected || (!isLoading && fundedProjects.length === 0)) && (
          <div style={{ marginBottom: 40 }}>
            <EmptyState isConnected={isConnected} />
          </div>
        )}

        {/* How this works */}
        <div className="card card-accent animate-fade-up delay-500">
          <div className="heading-sm" style={{ fontSize: 15, marginBottom: 8 }}>How portfolio tracking works</div>
          <p className="text-small" style={{ lineHeight: 1.7, margin: 0 }}>
            Your portfolio builds automatically from your swaps. There is no opt-in or sign-up. Every trade routed through a Uniswap v4 ImpactHook pool is recorded onchain. As milestones are verified, you can see the real-world outcomes your contributions helped fund.
          </p>
        </div>
      </main>
    </div>
  );
}
