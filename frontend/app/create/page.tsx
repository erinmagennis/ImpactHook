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
import { keccak256, encodeAbiParameters } from "viem";

const POOL_MANAGER_ADDRESS = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
const SQRT_PRICE_X96_1_1 = BigInt("79228162514264337593543950336");

const poolManagerAbi = [{
  type: "function",
  name: "initialize",
  inputs: [
    { name: "key", type: "tuple", components: [
      { name: "currency0", type: "address" },
      { name: "currency1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickSpacing", type: "int24" },
      { name: "hooks", type: "address" },
    ]},
    { name: "sqrtPriceX96", type: "uint160" },
  ],
  outputs: [{ name: "tick", type: "int24" }],
  stateMutability: "nonpayable",
}] as const;

export default function CreateProjectPage() {
  const { address, isConnected } = useAccount();

  const [currency0, setCurrency0] = useState("");
  const [currency1, setCurrency1] = useState("");
  const [fee, setFee] = useState("3000");
  const [tickSpacing, setTickSpacing] = useState("60");
  const [recipientInput, setRecipientInput] = useState("");
  const [verifierInput, setVerifierInput] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
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

  // Step 1: Register project
  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Step 2: Initialize pool
  const {
    writeContract: writeInitialize,
    data: initTxHash,
  } = useWriteContract();
  const {
    isLoading: isInitLoading,
    isSuccess: isInitSuccess,
  } = useWaitForTransactionReceipt({
    hash: initTxHash,
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
        projectName,
        projectCategory,
        descriptions,
        feeBpsValues,
      ],
      chainId: unichainSepolia.id,
    });
  };

  const handleInitialize = () => {
    const poolKey = {
      currency0: currency0 as `0x${string}`,
      currency1: currency1 as `0x${string}`,
      fee: parseInt(fee),
      tickSpacing: parseInt(tickSpacing),
      hooks: HOOK_ADDRESS,
    };

    writeInitialize({
      address: POOL_MANAGER_ADDRESS,
      abi: poolManagerAbi,
      functionName: "initialize",
      args: [poolKey, SQRT_PRICE_X96_1_1],
      chainId: unichainSepolia.id,
    });
  };

  // Compute pool ID from key
  const poolId =
    isSuccess && currency0 && currency1
      ? keccak256(
          encodeAbiParameters(
            [{ type: "address" }, { type: "address" }, { type: "uint24" }, { type: "int24" }, { type: "address" }],
            [
              currency0 as `0x${string}`,
              currency1 as `0x${string}`,
              parseInt(fee),
              parseInt(tickSpacing),
              HOOK_ADDRESS,
            ]
          )
        )
      : null;

  const hasAllFields =
    currency0 &&
    currency1 &&
    recipientInput &&
    verifierInput &&
    projectName &&
    projectCategory &&
    milestones.every((m) => m.description && m.feeBps);
  const isEnabled = isOwner && hasAllFields && !isLoading;

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <Navigation />
      <main style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Create Project
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Register a new impact project for a Uniswap v4 pool. Currently
            owner-gated for safety. Permissionless registration is on the
            roadmap.
          </p>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>
            This is a 2-step process: register the project, then initialize the pool.
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {/* Pool Key */}
          <div
            style={{
              fontSize: 11,
              color: "var(--accent)",
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
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>
                Token address. Currency0 must be the lower address.
              </div>
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
              {fee && (
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                  = {(parseInt(fee) / 100 || 0).toFixed(2)}%
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>
                Uniswap LP fee tier. Common values: 100, 500, 3000, 10000.
              </div>
            </div>
            <div>
              <label style={labelStyle}>TICK SPACING</label>
              <input
                type="text"
                value={tickSpacing}
                onChange={(e) => setTickSpacing(e.target.value)}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>
                Must match the fee tier. Common: fee 500 = spacing 10, fee 3000 = spacing 60.
              </div>
            </div>
          </div>

          {/* Project Config */}
          <div
            style={{
              fontSize: 11,
              color: "var(--accent)",
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
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.5 }}>
              The verifier address determines the verification path:
              <strong style={{ color: "var(--text-secondary)" }}> Direct</strong> - use your wallet or a multisig.
              <strong style={{ color: "var(--text-secondary)" }}> Reactive Network</strong> - use the MilestoneReactor address for cross-chain verification.
              <strong style={{ color: "var(--text-secondary)" }}> EAS</strong> - use any address that will create attestations.
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
              <label style={labelStyle}>PROJECT NAME</label>
              <input
                type="text"
                placeholder="e.g. Clean Water Initiative"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>CATEGORY</label>
              <input
                type="text"
                placeholder="e.g. Infrastructure"
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Milestones */}
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4, marginBottom: 8 }}>
            Fees increase as milestones are verified. Set 0 for the first milestone so funding only starts after initial progress.
          </div>
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
                color: "var(--accent)",
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
                borderRadius: 6,
                border: "1px solid rgba(13,148,136,0.2)",
                background: "rgba(13,148,136,0.05)",
                color: "var(--accent)",
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
                <label style={labelStyle}>FEE (BPS)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={m.feeBps}
                  onChange={(e) =>
                    updateMilestone(i, "feeBps", e.target.value)
                  }
                  style={inputStyle}
                />
                {m.feeBps && (
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                    = {(parseInt(m.feeBps) / 100 || 0).toFixed(2)}%
                  </div>
                )}
              </div>
              <button
                onClick={() => removeMilestone(i)}
                style={{
                  padding: "10px 0",
                  borderRadius: 6,
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
                borderRadius: 6,
                border: isEnabled
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border-subtle)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: isEnabled ? "pointer" : "not-allowed",
                background: isEnabled
                  ? "var(--accent)"
                  : "var(--bg-elevated)",
                color: isEnabled ? "#ffffff" : "var(--text-dim)",
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

          {isConnected && !isOwner && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(217,119,6,0.06)",
                border: "1px solid rgba(217,119,6,0.12)",
                color: "var(--warning)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Project registration is currently restricted to the hook owner
              for quality control. Connect the owner wallet to register, or
              contact the team to have your project added.
            </div>
          )}

          {isSuccess && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(5,150,105,0.06)",
                border: "1px solid rgba(5,150,105,0.12)",
                color: "var(--success)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Step 1 complete - project registered.{" "}
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

        {/* Step 2: Initialize Pool */}
        {isSuccess && (
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 12,
              }}
            >
              Step 2 - Initialize Pool
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              The project is registered. Now initialize the pool on PoolManager so swaps can begin routing fees.
              This uses a 1:1 starting price (sqrtPriceX96).
            </p>

            <div style={{ marginBottom: 16 }}>
              <div style={{
                padding: "10px 12px",
                borderRadius: 6,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: 11,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                wordBreak: "break-all",
              }}>
                <div><span style={{ color: "var(--text-secondary)" }}>PoolManager:</span> {POOL_MANAGER_ADDRESS}</div>
                <div><span style={{ color: "var(--text-secondary)" }}>Currency0:</span> {currency0}</div>
                <div><span style={{ color: "var(--text-secondary)" }}>Currency1:</span> {currency1}</div>
                <div><span style={{ color: "var(--text-secondary)" }}>Fee:</span> {fee} / <span style={{ color: "var(--text-secondary)" }}>Tick Spacing:</span> {tickSpacing}</div>
                <div><span style={{ color: "var(--text-secondary)" }}>Hook:</span> {HOOK_ADDRESS}</div>
              </div>
            </div>

            {!isInitSuccess && (
              <button
                onClick={handleInitialize}
                disabled={isInitLoading}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 6,
                  border: isInitLoading
                    ? "1px solid var(--border-subtle)"
                    : "1px solid var(--accent)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: isInitLoading ? "not-allowed" : "pointer",
                  background: isInitLoading
                    ? "var(--bg-elevated)"
                    : "var(--accent)",
                  color: isInitLoading ? "var(--text-dim)" : "#ffffff",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {isInitLoading ? "Initializing Pool..." : "Initialize Pool"}
              </button>
            )}

            {isInitSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "rgba(5,150,105,0.06)",
                  border: "1px solid rgba(5,150,105,0.12)",
                  color: "var(--success)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Pool initialized.{" "}
                <a
                  href={`https://sepolia.uniscan.xyz/tx/${initTxHash}`}
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
        )}

        {/* Step 3: Success with Pool ID */}
        {isInitSuccess && poolId && (
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--accent-emerald)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 12,
              }}
            >
              Setup Complete
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              Your project is registered and the pool is initialized. Swaps on this pool will now route fees
              to the project as milestones are verified.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>POOL ID</label>
              <div style={{
                padding: "10px 12px",
                borderRadius: 6,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: 11,
                color: "var(--accent-cyan)",
                wordBreak: "break-all",
                fontFamily: "inherit",
              }}>
                {poolId}
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: 8,
            }}>
              <a
                href="/dashboard"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}
              >
                View Dashboard
              </a>
              <a
                href="/milestones"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--accent)",
                  background: "rgba(13,148,136,0.08)",
                  color: "var(--accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}
              >
                Verify Milestones
              </a>
            </div>
          </div>
        )}
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
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
