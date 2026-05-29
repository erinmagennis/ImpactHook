"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import { Navigation } from "../../components/Navigation";
import { ProjectSelector } from "../../components/ProjectSelector";
import { usePoolDiscovery, type DiscoveredProject } from "../../hooks/usePoolDiscovery";

// A card for one of the connected wallet's own projects (where it is recipient or verifier).
function MyProjectCard({ project, address }: { project: DiscoveredProject; address: `0x${string}` }) {
  const { data: isPaused } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "projectPaused",
    args: [project.poolId],
    chainId: unichainSepolia.id,
  });

  const total = Number(project.milestoneCount) || 0;
  const verified = Number(project.currentMilestone) || 0;
  const progress = total ? verified / total : 0;

  const a = address.toLowerCase();
  const roles: string[] = [];
  if (project.recipient.toLowerCase() === a) roles.push("You receive funds");
  if (project.verifier.toLowerCase() === a) roles.push("You verify milestones");

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div className="text-label" style={{ marginBottom: 4 }}>{project.category || "Impact Project"}</div>
          {project.name && (
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              {project.name}
            </div>
          )}
          <div className="font-data text-caption">
            {project.poolId.slice(0, 10)}...{project.poolId.slice(-8)}
          </div>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexShrink: 0 }}>
          <span
            className="status-dot"
            style={{ background: isPaused ? "var(--error)" : "var(--success)", animation: isPaused ? "none" : "pulse-dot 2s ease-in-out infinite" }}
          />
          <span style={{ color: isPaused ? "var(--error)" : "var(--success)" }}>{isPaused ? "Paused" : "Live"}</span>
        </span>
      </div>

      {/* Role badges */}
      {roles.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {roles.map((r) => (
            <span key={r} className="badge badge-accent" style={{ fontSize: 11, padding: "2px 10px" }}>{r}</span>
          ))}
        </div>
      )}

      {/* Milestone progress */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="text-label" style={{ marginBottom: 0 }}>Milestone progress</span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-primary)" }}>{verified} / {total}</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`milestone-node ${i < verified ? "milestone-verified" : "milestone-pending"}`}
              style={{ width: 20, height: 20 }}
            >
              {i < verified && <span style={{ fontSize: 10, color: "var(--accent)" }}>&#10003;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/milestones" className="btn-action-teal">Verify milestones</Link>
        <Link href="/withdraw" className="btn-action-teal">Withdraw funds</Link>
      </div>
    </div>
  );
}

// Read-only inspector for ANY pool (kept so power users keep the manual lookup).
function PoolCard({ poolId }: { poolId: `0x${string}` }) {
  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const { data: metadata } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectMetadata",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const projectName = metadata?.[0] || "";
  const projectCategory = metadata?.[1] || "";

  const registered = projectInfo?.[5];
  const recipient = projectInfo?.[0];
  const verifier = projectInfo?.[1];
  const currentMilestone = projectInfo?.[2];
  const milestoneCount = projectInfo?.[3];
  const currentFeeBps = projectInfo?.[4];

  const total = Number(milestoneCount) || 0;
  const verified = Number(currentMilestone) || 0;
  const progress = total ? verified / total : 0;
  const feeBps = Number(currentFeeBps) || 0;

  if (!registered) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
        <span className="text-small">No registered project at this pool ID.</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div className="text-label" style={{ marginBottom: 4 }}>{projectCategory || "Impact Project"}</div>
          {projectName && (
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{projectName}</div>
          )}
          <div className="font-data text-caption">{poolId.slice(0, 10)}...{poolId.slice(-8)}</div>
        </div>
        <span className={feeBps > 0 ? "badge badge-success" : "badge badge-neutral"} style={{ fontSize: 12 }}>
          {feeBps > 0 ? `${(feeBps / 100).toFixed(feeBps % 100 === 0 ? 0 : 1)}%` : "0%"}
        </span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="text-label" style={{ marginBottom: 0 }}>Milestone progress</span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-primary)" }}>{verified} / {total}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid-2" style={{ gap: 10 }}>
        <InfoItem label="Recipient" value={recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : "-"} />
        <InfoItem label="Verifier" value={verifier ? `${verifier.slice(0, 6)}...${verifier.slice(-4)}` : "-"} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="text-label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{value || "-"}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { projects, isLoading } = usePoolDiscovery();

  const myProjects = address
    ? projects.filter(
        (p) =>
          p.recipient.toLowerCase() === address.toLowerCase() ||
          p.verifier.toLowerCase() === address.toLowerCase()
      )
    : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-wide" style={{ paddingTop: 40, paddingBottom: 48 }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="heading-lg" style={{ marginBottom: 8 }}>Your organization</h1>
            <p className="text-body" style={{ margin: 0, maxWidth: 520 }}>
              {isConnected
                ? "Projects where your wallet receives funds or verifies milestones, live from Unichain Sepolia."
                : "Connect your wallet to see the projects you run."}
            </p>
          </div>
          <Link href="/create" className="btn-primary" style={{ padding: "10px 22px", fontSize: 14 }}>
            Register a project
          </Link>
        </div>

        {/* My projects */}
        {isConnected && isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
            {[1, 2].map((i) => (
              <div key={i} className="card" style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="text-small">Loading onchain data...</span>
              </div>
            ))}
          </div>
        )}

        {isConnected && !isLoading && myProjects.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: 48 }}>
            <h2 className="heading-md" style={{ marginBottom: 20 }}>My projects</h2>
            <div className="grid-2" style={{ gap: 16 }}>
              {myProjects.map((p) => (
                <MyProjectCard key={p.poolId} project={p} address={address as `0x${string}`} />
              ))}
            </div>
          </div>
        )}

        {isConnected && !isLoading && myProjects.length === 0 && (
          <div className="card card-accent animate-fade-up" style={{ marginBottom: 48, padding: 32 }}>
            <div className="heading-sm" style={{ fontSize: 16, marginBottom: 8 }}>No projects yet</div>
            <p className="text-small" style={{ lineHeight: 1.6, marginBottom: 16 }}>
              You are not listed as the recipient or verifier on any registered project. Register
              one to start accumulating milestone-gated funding.
            </p>
            <Link href="/create" className="btn-primary" style={{ padding: "10px 22px", fontSize: 14 }}>
              Register a project
            </Link>
          </div>
        )}

        {!isConnected && (
          <div className="card animate-fade-up" style={{ marginBottom: 48, padding: 40, textAlign: "center" }}>
            <p className="text-small" style={{ margin: 0 }}>Connect your wallet to see the projects you run.</p>
          </div>
        )}

        {/* Verification paths — how milestones get verified */}
        <div className="animate-fade-up" style={{ marginBottom: 48 }}>
          <h2 className="heading-md" style={{ marginBottom: 8 }}>How your milestones get verified</h2>
          <p className="text-body" style={{ margin: "0 0 20px", maxWidth: 620 }}>
            Funds release only against verified milestones. ImpactHook supports three verification
            paths, all writing to the same onchain milestone state.
          </p>
          <div className="grid-3">
            <PathCard
              title="Direct"
              description="Your assigned verifier calls verifyMilestone() on Unichain Sepolia. Simplest path for single-chain projects."
            />
            <PathCard
              title="Reactive cross-chain"
              description="An oracle emits an event on the origin chain and Reactive Network relays a callback to ImpactHook on Unichain. No bridges needed."
            />
            <PathCard
              title="EAS attestation"
              description="Create an Ethereum Attestation Service attestation, then call verifyMilestoneEAS(). Composable, credibly neutral proof."
            />
          </div>
          <Link href="/technical" className="btn-ghost" style={{ marginTop: 16, display: "inline-block" }}>
            See the full architecture →
          </Link>
        </div>

        {/* Inspect any pool — power-user lookup */}
        <details className="accordion animate-fade-up">
          <summary>
            <span className="acc-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            Inspect any pool
            <span className="acc-chev">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </summary>
          <div className="acc-body">
            <LookupAnyPool />
          </div>
        </details>
      </main>
    </div>
  );
}

function LookupAnyPool() {
  const [poolIdInput, setPoolIdInput] = useState("");
  const poolId =
    poolIdInput.startsWith("0x") && poolIdInput.length === 66
      ? (poolIdInput as `0x${string}`)
      : null;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <ProjectSelector
          value={poolIdInput}
          onChange={setPoolIdInput}
          label="Search by Pool ID or Project Name"
        />
      </div>
      {poolId ? (
        <PoolCard poolId={poolId} />
      ) : (
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
          <span className="text-small">Enter a Pool ID above to view any project's state</span>
        </div>
      )}
    </div>
  );
}

function PathCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="status-dot" style={{ background: "var(--accent)" }} />
        <span className="heading-sm" style={{ fontSize: 14 }}>{title}</span>
      </div>
      <p className="text-small" style={{ margin: 0, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
