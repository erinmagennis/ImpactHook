"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";
import { ProjectSelector } from "../../components/ProjectSelector";

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

  const rawTotal = Number(milestoneCount) || 0;
  const lastIndex = rawTotal > 0 ? rawTotal - 1 : 0;

  const { data: lastMilestoneVerified } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "isMilestoneVerified",
    args: [poolId, BigInt(lastIndex)],
    chainId: unichainSepolia.id,
  });

  const showDemo = !registered;

  const demoRecipient = "0x1a2B...9c4D";
  const demoVerifier = "0x7e8F...3a1B";
  const rawCurrent = Number(currentMilestone);
  const verifiedCount = lastMilestoneVerified ? rawTotal : rawCurrent;
  const demoCurrent = showDemo ? 2 : verifiedCount;
  const demoTotal = showDemo ? 4 : rawTotal;
  const demoFee = showDemo ? 200 : (currentFeeBps || 0);
  const demoProgress = demoTotal ? demoCurrent / demoTotal : 0;

  return (
    <div className="card animate-fade-up delay-200" style={{ position: "relative" }}>
      {showDemo && (
        <span className="badge badge-violet" style={{ position: "absolute", top: 16, right: 16, fontSize: 11, padding: "2px 10px" }}>
          Preview
        </span>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div className="text-label" style={{ marginBottom: 4 }}>
            {registered ? (projectCategory || "Impact Project") : "No project registered"}
          </div>
          {registered && projectName && (
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              {projectName}
            </div>
          )}
          <div className="font-data text-caption">
            {showDemo ? "0xa3f7c2...1b9e04d8" : `${poolId.slice(0, 10)}...${poolId.slice(-8)}`}
          </div>
        </div>
        <span
          className={demoFee > 0 ? "badge badge-success" : "badge"}
          style={{
            fontSize: 12,
            ...(!demoFee ? { background: "var(--bg-elevated)", color: "var(--text-dim)", border: "1px solid var(--border-subtle)" } : {}),
          }}
        >
          {demoFee > 0 ? `${(Number(demoFee) / 100).toFixed(demoFee % 100 === 0 ? 0 : 1)}%` : "0%"}
        </span>
      </div>

      {/* Milestone progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="text-label" style={{ marginBottom: 0 }}>Milestone Progress</span>
          <span className="font-data" style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {demoCurrent} / {demoTotal}
          </span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: `${demoProgress * 100}%` }} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: demoTotal }, (_, i) => {
            const isVerified = i < demoCurrent;
            return (
              <div
                key={i}
                className={`milestone-node ${isVerified ? "milestone-verified" : "milestone-pending"}`}
                style={{ width: 20, height: 20 }}
              >
                {isVerified && (
                  <span style={{ fontSize: 10, color: "var(--accent)" }}>&#10003;</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid-2" style={{ gap: 10 }}>
        <InfoItem label="Recipient" value={showDemo ? demoRecipient : `${recipient?.slice(0, 6)}...${recipient?.slice(-4)}`} />
        <InfoItem label="Verifier" value={showDemo ? demoVerifier : `${verifier?.slice(0, 6)}...${verifier?.slice(-4)}`} />
      </div>

      {showDemo && (
        <div className="text-helper" style={{ marginTop: 16, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)" }}>
          This is a preview. Register a project to see live data from the hook contract.
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="text-label" style={{ marginBottom: 4 }}>{label}</div>
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
    <div className="card animate-fade-up delay-100">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span className="heading-sm" style={{ fontSize: 15 }}>Hook Status</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span
            className="status-dot"
            style={{ background: isPaused ? "var(--error)" : "var(--success)", animation: isPaused ? "none" : "pulse-dot 2s ease-in-out infinite" }}
          />
          <span style={{ color: isPaused ? "var(--error)" : "var(--success)" }}>
            {isPaused ? "Paused" : "Live"}
          </span>
        </span>
      </div>
      <div style={{ display: "grid", gap: 0 }}>
        <StatusRow label="Contract" value={HOOK_ADDRESS} />
        <StatusRow label="Owner" value={owner as string} />
        <StatusRow label="Callback Proxy" value={proxy as string} />
        <StatusRow label="EAS Schema" value={schemaUID ? `${(schemaUID as string).slice(0, 14)}...` : "-"} last />
      </div>
    </div>
  );
}

function StatusRow({ label, value, last }: { label: string; value?: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <span className="text-label" style={{ marginBottom: 0 }}>{label}</span>
      <span className="font-data" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        {value ? (value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value) : "-"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");

  const poolId = poolIdInput.startsWith("0x") && poolIdInput.length === 66
    ? poolIdInput as `0x${string}`
    : null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-wide" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Dashboard</h1>
          <p className="text-body" style={{ margin: 0 }}>
            {isConnected
              ? "Live contract state from Unichain Sepolia"
              : "Connect your wallet to interact with ImpactHook"}
          </p>
        </div>

        <div className="card animate-fade-up" style={{ marginBottom: 16, padding: 16 }}>
          <ProjectSelector
            value={poolIdInput}
            onChange={setPoolIdInput}
            label="Search by Pool ID or Project Name"
          />
        </div>

        <div className="grid-2">
          <HookStatus />
          {poolId ? (
            <PoolCard poolId={poolId} />
          ) : (
            <div className="card animate-fade-up delay-200" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-small">Enter a Pool ID above to view project state</span>
            </div>
          )}
        </div>

        {/* Your Impact */}
        <YourImpact poolId={poolId} isConnected={isConnected} />

        {/* Verification paths */}
        <div style={{ marginTop: 48 }}>
          <h2 className="heading-md animate-fade-up delay-300" style={{ marginBottom: 16 }}>
            Verification Paths
          </h2>
          <div className="grid-3">
            <PathCard
              title="Direct"
              description="Verifier calls verifyMilestone() directly on Unichain Sepolia. Simplest path for single-chain projects."
              accent="var(--accent)"
              delay="delay-400"
            />
            <PathCard
              title="Reactive Cross-Chain"
              description="Oracle emits event on origin chain. Reactive Network relays callback to ImpactHook on Unichain. No bridges needed."
              accent="#7c3aed"
              delay="delay-500"
            />
            <PathCard
              title="EAS Attestation"
              description="Create an Ethereum Attestation Service attestation, then call verifyMilestoneEAS(). Composable, credibly neutral proof."
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
    <div className="card" style={{ textAlign: "center" }}>
      <div className="font-data" style={{ fontSize: 22, fontWeight: 700, color: accent, marginBottom: 6 }}>
        {value}
      </div>
      <div className="text-label" style={{ marginBottom: 0 }}>{label}</div>
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
    <div className="card" style={{ borderLeft: `2px solid ${accent}` }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
        {name}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span className="text-small" style={{ margin: 0 }}>Contributed</span>
          <span className="font-data" style={{ color: accent, fontSize: 13 }}>{contributed} ETH</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span className="text-small" style={{ margin: 0 }}>Milestones</span>
          <span className="font-data" style={{ color: "var(--text-secondary)", fontSize: 13 }}>{milestones}</span>
        </div>
        <div
          style={{
            marginTop: 4,
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: `${accent}0d`,
            border: `1px solid ${accent}22`,
            fontSize: 12,
            color: accent,
            lineHeight: 1.4,
          }}
        >
          {impact}
        </div>
      </div>
    </div>
  );
}

function YourImpact({ poolId, isConnected }: { poolId: `0x${string}` | null; isConnected: boolean }) {
  const { address } = useAccount();

  const { data: stats } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getContributorStats",
    args: [address || "0x0000000000000000000000000000000000000000", poolId || "0x0000000000000000000000000000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: isConnected && !!poolId && !!address },
  });

  const { data: discount } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getLoyaltyDiscount",
    args: [address || "0x0000000000000000000000000000000000000000", poolId || "0x0000000000000000000000000000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: isConnected && !!poolId && !!address },
  });

  const poolContribution = stats?.[0] ? formatEther(stats[0] as bigint) : "0";
  const globalContribution = stats?.[1] ? formatEther(stats[1] as bigint) : "0";
  const discountBps = Number(discount || 0);
  const hasRealData = isConnected && !!poolId && (poolContribution !== "0" || globalContribution !== "0");

  return (
    <div className="animate-fade-up delay-300" style={{ marginTop: 48 }}>
      <h2 className="heading-md" style={{ marginBottom: 16 }}>Your Impact</h2>

      {hasRealData ? (
        <div className="grid-3">
          <ImpactMetric label="This Pool" value={`${Number(poolContribution).toFixed(4)} ETH`} accent="var(--accent)" />
          <ImpactMetric label="All Pools" value={`${Number(globalContribution).toFixed(4)} ETH`} accent="var(--success)" />
          <ImpactMetric label="Loyalty Discount" value={discountBps > 0 ? `${(discountBps / 100).toFixed(discountBps % 100 === 0 ? 0 : 1)}%` : "None"} accent="var(--warning)" />
        </div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <ImpactMetric label="Total Contributed" value="2.134 ETH" accent="var(--success)" />
            <ImpactMetric label="Projects Supported" value="3" accent="var(--accent)" />
            <ImpactMetric label="People Reached" value="~1,240" accent="#7c3aed" />
            <ImpactMetric label="Loyalty Tier" value="Silver" accent="var(--warning)" />
          </div>

          <div className="grid-3">
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

          <div className="text-helper" style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.08)", textAlign: "center" }}>
            {isConnected && poolId
              ? "No contributions yet. Swap through this impact pool to see your real stats."
              : "Preview data. Connect wallet and enter a pool ID to see your real contributions."}
          </div>
        </>
      )}
    </div>
  );
}

function PathCard({
  title,
  description,
  accent,
  delay,
}: {
  title: string;
  description: string;
  accent: string;
  delay: string;
}) {
  return (
    <div className={`card animate-fade-up ${delay}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="status-dot" style={{ background: accent }} />
        <span className="heading-sm" style={{ fontSize: 14 }}>{title}</span>
      </div>
      <p className="text-small" style={{ margin: 0, lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}
