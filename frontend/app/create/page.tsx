"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function CreateProjectPage() {
  const { address, isConnected } = useAccount();

  const [currency0, setCurrency0] = useState("");
  const [currency1, setCurrency1] = useState("");
  const [fee, setFee] = useState("3000");
  const [tickSpacing, setTickSpacing] = useState("60");
  const [recipientInput, setRecipientInput] = useState("");
  const [verifierInput, setVerifierInput] = useState("");
  const [milestones, setMilestones] = useState([
    { description: "", feeBps: "" },
  ]);

  const { data: owner } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "owner",
    chainId: unichainSepolia.id,
  });

  const isOwner =
    isConnected && address?.toLowerCase() === (owner as string)?.toLowerCase();

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", feeBps: "" }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (
    index: number,
    field: "description" | "feeBps",
    value: string
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleCreate = () => {
    const descriptions = milestones.map((m) => m.description);
    const feeBpsValues = milestones.map((m) => parseInt(m.feeBps) || 0);

    const poolKey = {
      currency0: currency0 as `0x${string}`,
      currency1: currency1 as `0x${string}`,
      fee: parseInt(fee),
      tickSpacing: parseInt(tickSpacing),
      hooks: HOOK_ADDRESS,
    };

    writeContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "registerProject",
      args: [
        poolKey,
        recipientInput as `0x${string}`,
        verifierInput as `0x${string}`,
        descriptions,
        feeBpsValues,
      ],
      chainId: unichainSepolia.id,
    });
  };

  const hasAllFields =
    currency0 &&
    currency1 &&
    recipientInput &&
    verifierInput &&
    milestones.every((m) => m.description && m.feeBps);
  const isEnabled = isOwner && hasAllFields && !isLoading;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-bright)",
              marginBottom: 8,
            }}
          >
            Create Project
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-mid)" }}>
            Register a new impact project for a Uniswap v4 pool. Owner only.
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {/* Pool Key */}
          <div
            style={{
              fontSize: 11,
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            Pool Key
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={labelStyle}>CURRENCY 0</label>
              <input
                type="text"
                placeholder="0x..."
                value={currency0}
                onChange={(e) => setCurrency0(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>CURRENCY 1</label>
              <input
                type="text"
                placeholder="0x..."
                value={currency1}
                onChange={(e) => setCurrency1(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <label style={labelStyle}>FEE (BPS)</label>
              <input
                type="text"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>TICK SPACING</label>
              <input
                type="text"
                value={tickSpacing}
                onChange={(e) => setTickSpacing(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Project Config */}
          <div
            style={{
              fontSize: 11,
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            Project Config
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>RECIPIENT</label>
            <input
              type="text"
              placeholder="0x... (receives accumulated fees)"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>VERIFIER</label>
            <input
              type="text"
              placeholder="0x... (authorized to verify milestones)"
              value={verifierInput}
              onChange={(e) => setVerifierInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Milestones */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--accent-cyan)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Milestones
            </div>
            <button
              onClick={addMilestone}
              style={{
                padding: "4px 10px",
                borderRadius: 2,
                border: "1px solid rgba(34,211,238,0.2)",
                background: "rgba(34,211,238,0.06)",
                color: "var(--accent-cyan)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + Add
            </button>
          </div>

          {milestones.map((m, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 30px",
                gap: 8,
                marginBottom: 8,
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>
                  MILESTONE {i}
                </label>
                <input
                  type="text"
                  placeholder="Description"
                  value={m.description}
                  onChange={(e) =>
                    updateMilestone(i, "description", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>BPS</label>
                <input
                  type="text"
                  placeholder="0"
                  value={m.feeBps}
                  onChange={(e) =>
                    updateMilestone(i, "feeBps", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
              <button
                onClick={() => removeMilestone(i)}
                style={{
                  padding: "10px 0",
                  borderRadius: 2,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-dim)",
                  fontSize: 13,
                  cursor: milestones.length > 1 ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  opacity: milestones.length > 1 ? 1 : 0.3,
                }}
              >
                x
              </button>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleCreate}
              disabled={!isEnabled}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 2,
                border: isEnabled
                  ? "1px solid rgba(139,92,246,0.4)"
                  : "1px solid var(--border-subtle)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: isEnabled ? "pointer" : "not-allowed",
                background: isEnabled
                  ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))"
                  : "var(--bg-elevated)",
                color: isEnabled ? "var(--text-bright)" : "var(--text-dim)",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {isLoading
                ? "Registering..."
                : !isConnected
                  ? "Connect wallet"
                  : !isOwner
                    ? "Only hook owner can register"
                    : !hasAllFields
                      ? "Fill all fields"
                      : "Register Project"}
            </button>
          </div>

          {isSuccess && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 2,
                background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.15)",
                color: "var(--accent-emerald)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Project registered!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--accent-violet)",
                  textDecoration: "underline",
                }}
              >
                View transaction
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-dim)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 2,
  border: "1px solid var(--border-subtle)",
  background: "var(--bg-elevated)",
  color: "var(--text-bright)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
