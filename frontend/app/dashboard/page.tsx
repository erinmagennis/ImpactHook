"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";

// Pool ID for demo project (Clean Water - Chiapas Schools)
// Computed from PoolKey: token0=0x01, token1=0x02, fee=3000, tickSpacing=60, hooks=ImpactHook
const DEMO_POOL_ID =
  "0x9c6994c178bf047c0dba4ed49b56a302c0bb69b5a8bb54f7e13f8ec2be85bb4a";

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

  const rawTotal = Number(milestoneCount) || 0;
  const lastIndex = rawTotal > 0 ? rawTotal - 1 : 0;

  // Check if the last milestone is verified (contract doesn't increment
  // currentMilestone past the last index, so we check directly)
  const { data: lastMilestoneVerified } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "isMilestoneVerified",
    args: [poolId, BigInt(lastIndex)],
    chainId: unichainSepolia.id,
  });

  const showDemo = !registered;

  // Demo data for preview when no real pool exists
  const demoRecipient = "0x1a2B...9c4D";
  const demoVerifier = "0x7e8F...3a1B";
  const rawCurrent = Number(currentMilestone);
  const verifiedCount = lastMilestoneVerified ? rawTotal : rawCurrent;
  const demoCurrent = showDemo ? 2 : verifiedCount;
  const demoTotal = showDemo ? 4 : rawTotal;
  const demoFee = showDemo ? 200 : (currentFeeBps || 0);
  const demoProgress = demoTotal ? demoCurrent / demoTotal : 0;

  const milestoneNodes = [];
  for (let i = 0; i < demoTotal; i++) {
    const isVerified = i < demoCurrent;
    const isActive = i === demoCurrent;
    milestoneNodes.push(
      <div
        key={i}
        className={`milestone-node ${isVerified ? "milestone-verified" : isActive ? "milestone-active" : "milestone-pending"}`}
        style={{ width: 20, height: 20 }}
      >
        {isVerified && (
          <span style={{ fontSize: 10, color: "var(--accent)" }}>&#10003;</span>
        )}
      </div>
    );
  }

  return (
    <div className="card card-glow animate-fade-up delay-200" style={{ padding: 24, position: "relative" }}>
      {showDemo && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: "rgba(124,58,237,0.08)",
            color: "#7c3aed",
            border: "1px solid rgba(124,58,237,0.15)",
          }}
        >
          Preview
        </div>
      )}
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
            {showDemo ? "Clean Water - Chiapas Schools" : "Clean Water - Chiapas Schools"}
          </div>
          <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {showDemo ? "0xa3f7c2...1b9e04d8" : `${poolId.slice(0, 10)}...${poolId.slice(-8)}`}
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            background:
              demoFee > 0
                ? "rgba(5,150,105,0.08)"
                : "var(--bg-elevated)",
            color:
              demoFee > 0
                ? "var(--success)"
                : "var(--text-dim)",
            border: `1px solid ${
              demoFee > 0
                ? "rgba(5,150,105,0.2)"
                : "var(--border-subtle)"
            }`,
          }}
        >
          {demoFee} bps
        </div>
      </div>

      {/* Milestone progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Milestone Progress
          </span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {demoCurrent} / {demoTotal}
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
              width: `${demoProgress * 100}%`,
              borderRadius: 1,
              background: "var(--accent)",
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
        <InfoItem label="Recipient" value={showDemo ? demoRecipient : `${recipient?.slice(0, 6)}...${recipient?.slice(-4)}`} />
        <InfoItem label="Verifier" value={showDemo ? demoVerifier : `${verifier?.slice(0, 6)}...${verifier?.slice(-4)}`} />
      </div>

      {showDemo && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--accent-bg)",
            border: "1px solid rgba(13,148,136,0.08)",
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          This is a preview. Register a project to see live data from the hook contract.
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
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
      <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
        <span className="font-display" style={{ fontSize: 14, color: "var(--text-primary)" }}>
          Hook Status
        </span>
        <span
          className="status-live"
          style={{ fontSize: 12, color: isPaused ? "var(--error)" : "var(--success)" }}
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
          color: "var(--text-secondary)",
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
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <Navigation />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            {isConnected
              ? "Live contract state from Unichain Sepolia"
              : "Connect your wallet to interact with ImpactHook"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <HookStatus />
          <PoolCard poolId={DEMO_POOL_ID as `0x${string}`} />
        </div>

        {/* Your Impact - shown for traders/LPs */}
        <div className="animate-fade-up delay-300" style={{ marginTop: 32 }}>
          <h2
            className="font-display"
            style={{
              fontSize: 15,
              color: "var(--text-primary)",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Your Impact
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <ImpactMetric label="Total Contributed" value="2.134 ETH" accent="var(--success)" />
            <ImpactMetric label="Projects Supported" value="3" accent="var(--accent)" />
            <ImpactMetric label="People Reached" value="~1,240" accent="#7c3aed" />
            <ImpactMetric label="Loyalty Tier" value="Silver" accent="var(--warning)" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <ProjectImpactCard
              name="Clean Water - Chiapas"
              contributed="0.847"
              impact="420 students with clean water"
              milestones="4/4"
              accent="var(--accent)"
            />
            <ProjectImpactCard
              name="Solar Schools - Oaxaca"
              contributed="0.892"
              impact="8 schools powered by solar"
              milestones="2/3"
              accent="var(--success)"
            />
            <ProjectImpactCard
              name="Reforestation - Yucatan"
              contributed="0.395"
              impact="2,400 trees planted"
              milestones="1/4"
              accent="#7c3aed"
            />
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(124,58,237,0.08)",
              fontSize: 11,
              color: "var(--text-dim)",
              textAlign: "center",
            }}
          >
            Preview data. Connect wallet and swap through impact pools to see your real contributions.
          </div>
        </div>

        {/* Verification paths */}
        <div style={{ marginTop: 32 }}>
          <h2
            className="font-display animate-fade-up delay-300"
            style={{
              fontSize: 15,
              color: "var(--text-primary)",
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
              accent="var(--accent)"
              delay="delay-400"
            />
            <PathCard
              title="Reactive Cross-Chain"
              description="Oracle (Sepolia) -> Reactor (Reactive) -> Hook (Unichain)"
              status="active"
              accent="#7c3aed"
              delay="delay-500"
            />
            <PathCard
              title="EAS Attestation"
              description="Create attestation on EAS, then call verifyMilestoneEAS()"
              status="active"
              accent="var(--success)"
              delay="delay-600"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ImpactMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div className="font-data" style={{ fontSize: 20, fontWeight: 700, color: accent, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
    </div>
  );
}

function ProjectImpactCard({
  name,
  contributed,
  impact,
  milestones,
  accent,
}: {
  name: string;
  contributed: string;
  impact: string;
  milestones: string;
  accent: string;
}) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
        {name}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "var(--text-dim)" }}>Contributed</span>
          <span className="font-data" style={{ color: accent }}>{contributed} ETH</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "var(--text-dim)" }}>Milestones</span>
          <span className="font-data" style={{ color: "var(--text-secondary)" }}>{milestones}</span>
        </div>
        <div
          style={{
            marginTop: 4,
            padding: "6px 10px",
            borderRadius: 6,
            background: `${accent}0d`,
            border: `1px solid ${accent}22`,
            fontSize: 11,
            color: accent,
          }}
        >
          {impact}
        </div>
      </div>
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
            background: status === "active" ? accent : "var(--error)",
            boxShadow: status === "active" ? `0 0 8px ${accent}` : "none",
          }}
        />
        <span className="font-display" style={{ fontSize: 13, color: "var(--text-primary)" }}>
          {title}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}
