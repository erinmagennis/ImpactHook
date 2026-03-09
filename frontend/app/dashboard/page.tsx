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
      <div style={cardStyle}>
        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "40px 0" }}>
          No projects registered yet. Register a project to get started.
        </div>
      </div>
    );
  }

  const milestoneProgress = milestoneCount
    ? Number(currentMilestone) / Number(milestoneCount)
    : 0;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Active Pool
          </div>
          <div style={{ fontSize: 14, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>
            {poolId.slice(0, 10)}...{poolId.slice(-8)}
          </div>
        </div>
        <div style={{
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          background: currentFeeBps && currentFeeBps > 0
            ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))"
            : "rgba(255,255,255,0.05)",
          color: currentFeeBps && currentFeeBps > 0 ? "#22c55e" : "rgba(255,255,255,0.4)",
          border: `1px solid ${currentFeeBps && currentFeeBps > 0 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}>
          {currentFeeBps ? `${currentFeeBps} bps` : "0 bps"}
        </div>
      </div>

      {/* Milestone progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Milestone Progress</span>
          <span style={{ fontSize: 13, color: "#fff" }}>
            {currentMilestone?.toString()} / {milestoneCount?.toString()}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${milestoneProgress * 100}%`,
              borderRadius: 3,
              background: "linear-gradient(90deg, #6366f1, #22c55e)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <InfoItem label="Recipient" value={`${recipient?.slice(0, 6)}...${recipient?.slice(-4)}`} />
        <InfoItem label="Verifier" value={`${verifier?.slice(0, 6)}...${verifier?.slice(-4)}`} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>
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
    <div style={cardStyle}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
        Hook Status
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <StatusRow label="Contract" value={HOOK_ADDRESS} mono />
        <StatusRow label="Owner" value={owner as string} mono />
        <StatusRow label="Callback Proxy" value={proxy as string} mono />
        <StatusRow label="EAS Schema" value={schemaUID ? `${(schemaUID as string).slice(0, 14)}...` : "-"} mono />
        <StatusRow
          label="Status"
          value={isPaused ? "Paused" : "Active"}
          color={isPaused ? "#ef4444" : "#22c55e"}
        />
      </div>
    </div>
  );
}

function StatusRow({ label, value, mono, color }: { label: string; value?: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontFamily: mono ? "monospace" : "inherit",
          color: color || "rgba(255,255,255,0.7)",
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
    <div style={{ minHeight: "100vh", background: "#08080c" }}>
      <Navigation />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
            {isConnected
              ? "Live contract state from Unichain Sepolia"
              : "Connect your wallet to interact with ImpactHook"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <HookStatus />
          <PoolCard poolId={DEMO_POOL_ID as `0x${string}`} />
        </div>

        {/* Verification paths */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
            Verification Paths
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <PathCard
              title="Direct"
              description="Verifier calls verifyMilestone() directly on Unichain Sepolia"
              status="active"
            />
            <PathCard
              title="Reactive Cross-Chain"
              description="Oracle (Sepolia) -> Reactor (Reactive) -> Hook (Unichain)"
              status="active"
            />
            <PathCard
              title="EAS Attestation"
              description="Create attestation on EAS, then call verifyMilestoneEAS()"
              status="active"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function PathCard({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <div style={{
      ...cardStyle,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: status === "active" ? "#22c55e" : "#ef4444",
        }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 12,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};
