"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodePacked, encodeAbiParameters, keccak256 } from "viem";
import { Navigation } from "../../components/Navigation";
import {
  HOOK_ADDRESS,
  EAS_ADDRESS,
  MILESTONE_SCHEMA_UID,
  impactHookAbi,
  easAbi,
} from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

// Placeholder - in production this comes from pool registration
const DEMO_POOL_KEY = {
  currency0: "0x0000000000000000000000000000000000000000" as const,
  currency1: "0x0000000000000000000000000000000000000000" as const,
  fee: 3000,
  tickSpacing: 60,
  hooks: HOOK_ADDRESS,
};

function MilestoneCard({
  poolId,
  index,
  isVerifier,
}: {
  poolId: `0x${string}`;
  index: number;
  isVerifier: boolean;
}) {
  const { data: milestone } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestones",
    args: [poolId, BigInt(index)],
    chainId: unichainSepolia.id,
  });

  const description = milestone?.[0] || "";
  const feeBps = milestone?.[1] || 0;
  const verified = milestone?.[2] || false;

  // Direct verification
  const { writeContract: verifyDirect, data: directHash } = useWriteContract();
  const { isLoading: directLoading, isSuccess: directSuccess } =
    useWaitForTransactionReceipt({ hash: directHash });

  // EAS attestation flow
  const [evidence, setEvidence] = useState("");
  const { writeContract: createAttestation, data: attestHash } =
    useWriteContract();
  const { isLoading: attestLoading, isSuccess: attestSuccess } =
    useWaitForTransactionReceipt({ hash: attestHash });

  const handleDirectVerify = () => {
    verifyDirect({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "verifyMilestone",
      args: [DEMO_POOL_KEY, BigInt(index)],
      chainId: unichainSepolia.id,
    });
  };

  const handleEASAttest = () => {
    const attestationData = encodeAbiParameters(
      [
        { type: "bytes32", name: "poolId" },
        { type: "uint256", name: "milestoneIndex" },
        { type: "string", name: "evidence" },
      ],
      [poolId, BigInt(index), evidence]
    );

    createAttestation({
      address: EAS_ADDRESS,
      abi: easAbi,
      functionName: "attest",
      args: [
        {
          schema: MILESTONE_SCHEMA_UID,
          data: {
            recipient: "0x0000000000000000000000000000000000000000",
            expirationTime: BigInt(0),
            revocable: true,
            refUID:
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            data: attestationData,
            value: BigInt(0),
          },
        },
      ],
      chainId: unichainSepolia.id,
    });
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: verified
          ? "rgba(34,197,94,0.04)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${verified ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: verified
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "rgba(255,255,255,0.08)",
                color: verified ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              {verified ? "\u2713" : index}
            </div>
            <span
              style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}
            >
              {description || `Milestone ${index}`}
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Fee tier: {feeBps} bps
          </span>
        </div>
        <div
          style={{
            padding: "3px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: verified ? "#22c55e" : "rgba(255,255,255,0.3)",
            background: verified
              ? "rgba(34,197,94,0.1)"
              : "rgba(255,255,255,0.04)",
          }}
        >
          {verified ? "Verified" : "Pending"}
        </div>
      </div>

      {/* Action buttons for unverified milestones */}
      {!verified && isVerifier && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <button
              onClick={handleDirectVerify}
              disabled={directLoading}
              style={buttonStyle}
            >
              {directLoading ? "Verifying..." : "Direct Verify"}
            </button>
          </div>

          {/* EAS attestation */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Evidence (IPFS CID or description)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleEASAttest}
              disabled={attestLoading || !evidence}
              style={{
                ...buttonStyle,
                background:
                  evidence
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              {attestLoading ? "Attesting..." : "EAS Attest"}
            </button>
          </div>

          {directSuccess && (
            <div style={successStyle}>Milestone verified via direct call</div>
          )}
          {attestSuccess && (
            <div style={successStyle}>
              EAS attestation created. Call verifyMilestoneEAS() to complete.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MilestonesPage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const poolId = (poolIdInput ||
    "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;

  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const registered = projectInfo?.[5];
  const verifier = projectInfo?.[1];
  const milestoneCount = Number(projectInfo?.[3] || 0);
  const isVerifier =
    isConnected && address?.toLowerCase() === verifier?.toLowerCase();

  return (
    <div style={{ minHeight: "100vh", background: "#08080c" }}>
      <Navigation />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Milestones
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
            View and verify project milestones via direct call or EAS attestation
          </p>
        </div>

        {/* Pool ID input */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Pool ID
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={poolIdInput}
            onChange={(e) => setPoolIdInput(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>

        {!registered ? (
          <div
            style={{
              padding: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {poolIdInput
              ? "No project registered for this pool"
              : "Enter a Pool ID to view milestones"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isVerifier && (
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  fontSize: 13,
                  color: "#a5b4fc",
                  marginBottom: 4,
                }}
              >
                You are the verifier for this pool
              </div>
            )}
            {Array.from({ length: milestoneCount }, (_, i) => (
              <MilestoneCard
                key={i}
                poolId={poolId}
                index={i}
                isVerifier={isVerifier}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

const successStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "6px 12px",
  borderRadius: 6,
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontSize: 12,
};
