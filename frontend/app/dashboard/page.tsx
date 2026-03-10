"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";

// Demo pool ID - in production this would come from event indexing
// For now we'll show a "no pools" state until one is registered
const DEMO_POOL_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function PoolCard({ poolId }: { poolId: `0x${string}` }) {
  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const registered = projectInfo?.[5];
  const recipient = projectInfo?.[0];
  const verifier = projectInfo?.[1];
  const currentMilestone = projectInfo?.[2];
  const milestoneCount = projectInfo?.[3];
  const currentFeeBps = projectInfo?.[4];

  if (!registered) {
    return (
      <div className="card card-glow animate-fade-up delay-200" style={{ padding: 24 }}>
        <div
          style={{
            color: "var(--text-dim)",
            textAlign: "center",
            padding: "40px 0",
            fontSize: 13,
          }}
        >
          No projects registered yet. Register a project to get started.
        </div>
      </div>
    );
  }

  const milestoneProgress = milestoneCount
    ? Number(currentMilestone) / Number(milestoneCount)
    : 0;

  const milestoneNodes = [];
  for (let i = 0; i < Number(milestoneCount); i++) {
    const isVerified = i < Number(currentMilestone);
    const isActive = i === Number(currentMilestone);
    milestoneNodes.push(
      <div
        key={i}
        className={`milestone-node ${isVerified ? "milestone-verified" : isActive ? "milestone-active" : "milestone-pending"}`}
        style={{ width: 20, height: 20 }}
      >
        {isVerified && (
          <span style={{ fontSize: 10, color: "var(--accent-cyan)" }}>&#10003;</span>
        )}
      </div>
    );
  }

  return (
    <div className="card card-glow animate-fade-up delay-200" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Active Pool
          </div>
          <div className="font-data" style={{ fontSize: 13, color: "var(--text-mid)" }}>
            {poolId.slice(0, 10)}...{poolId.slice(-8)}
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            background:
              currentFeeBps && currentFeeBps > 0
                ? "rgba(52, 211, 153, 0.1)"
                : "var(--bg-elevated)",
            color:
              currentFeeBps && currentFeeBps > 0
                ? "var(--accent-emerald)"
                : "var(--text-dim)",
            border: `1px solid ${
              currentFeeBps && currentFeeBps > 0
                ? "rgba(52, 211, 153, 0.25)"
                : "var(--border-subtle)"
            }`,
          }}
        >
          {currentFeeBps ? `${currentFeeBps} bps` : "0 bps"}
        </div>
      </div>

      {/* Milestone progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Milestone Progress
          </span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-bright)" }}>
            {currentMilestone?.toString()} / {milestoneCount?.toString()}
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 1,
            background: "var(--bg-elevated)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${milestoneProgress * 100}%`,
              borderRadius: 1,
              background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {milestoneNodes}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InfoItem label="Recipient" value={`${recipient?.slice(0, 6)}...${recipient?.slice(-4)}`} />
        <InfoItem label="Verifier" value={`${verifier?.slice(0, 6)}...${verifier?.slice(-4)}`} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 2,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div className="font-data" style={{ fontSize: 13, color: "var(--text-mid)" }}>
        {value || "-"}
      </div>
    </div>
  );
}

function HookStatus() {
  const { data: owner } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "owner",
    chainId: unichainSepolia.id,
  });

  const { data: isPaused } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "paused",
    chainId: unichainSepolia.id,
  });

  const { data: proxy } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "callbackProxy",
    chainId: unichainSepolia.id,
  });

  const { data: schemaUID } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestoneSchemaUID",
    chainId: unichainSepolia.id,
  });

  return (
    <div className="card card-glow animate-fade-up delay-100" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span className="font-display" style={{ fontSize: 14, color: "var(--text-bright)" }}>
          Hook Status
        </span>
        <span
          className="status-live"
          style={{ fontSize: 12, color: isPaused ? "#ef4444" : "var(--accent-emerald)" }}
        >
          {isPaused ? "Paused" : "Live"}
        </span>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <StatusRow label="Contract" value={HOOK_ADDRESS} />
        <StatusRow label="Owner" value={owner as string} />
        <StatusRow label="Callback Proxy" value={proxy as string} />
        <StatusRow
          label="EAS Schema"
          value={schemaUID ? `${(schemaUID as string).slice(0, 14)}...` : "-"}
        />
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span
        className="font-data"
        style={{
          fontSize: 12,
          color: "var(--text-mid)",
        }}
      >
        {value ? (value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value) : "-"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useAccount();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-bright)",
              marginBottom: 8,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0 }}>
            {isConnected
              ? "Live contract state from Unichain Sepolia"
              : "Connect your wallet to interact with ImpactHook"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <HookStatus />
          <PoolCard poolId={DEMO_POOL_ID as `0x${string}`} />
        </div>

        {/* Verification paths */}
        <div style={{ marginTop: 32 }}>
          <h2
            className="font-display animate-fade-up delay-300"
            style={{
              fontSize: 15,
              color: "var(--text-bright)",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Verification Paths
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <PathCard
              title="Direct"
              description="Verifier calls verifyMilestone() directly on Unichain Sepolia"
              status="active"
              accent="var(--accent-cyan)"
              delay="delay-400"
            />
            <PathCard
              title="Reactive Cross-Chain"
              description="Oracle (Sepolia) -> Reactor (Reactive) -> Hook (Unichain)"
              status="active"
              accent="var(--accent-violet)"
              delay="delay-500"
            />
            <PathCard
              title="EAS Attestation"
              description="Create attestation on EAS, then call verifyMilestoneEAS()"
              status="active"
              accent="var(--accent-emerald)"
              delay="delay-600"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function PathCard({
  title,
  description,
  status,
  accent,
  delay,
}: {
  title: string;
  description: string;
  status: string;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className={`card animate-fade-up ${delay}`}
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: status === "active" ? accent : "#ef4444",
            boxShadow: status === "active" ? `0 0 8px ${accent}` : "none",
          }}
        />
        <span className="font-display" style={{ fontSize: 13, color: "var(--text-bright)" }}>
          {title}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-mid)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}
