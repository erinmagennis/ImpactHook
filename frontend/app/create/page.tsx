"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, POOL_MANAGER_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import { keccak256, encodeAbiParameters } from "viem";
import Link from "next/link";

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
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Step 2: Initialize pool
  const { writeContract: writeInitialize, data: initTxHash } = useWriteContract();
  const { isLoading: isInitLoading, isSuccess: isInitSuccess } =
    useWaitForTransactionReceipt({ hash: initTxHash });

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", feeBps: "" }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: "description" | "feeBps", value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleCreate = () => {
    const descriptions = milestones.map((m) => m.description);
    const feeBpsValues = milestones.map((m) => parseInt(m.feeBps) || 0);

    writeContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "registerProject",
      args: [
        {
          currency0: currency0 as `0x${string}`,
          currency1: currency1 as `0x${string}`,
          fee: parseInt(fee),
          tickSpacing: parseInt(tickSpacing),
          hooks: HOOK_ADDRESS,
        },
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
    writeInitialize({
      address: POOL_MANAGER_ADDRESS,
      abi: poolManagerAbi,
      functionName: "initialize",
      args: [
        {
          currency0: currency0 as `0x${string}`,
          currency1: currency1 as `0x${string}`,
          fee: parseInt(fee),
          tickSpacing: parseInt(tickSpacing),
          hooks: HOOK_ADDRESS,
        },
        SQRT_PRICE_X96_1_1,
      ],
      chainId: unichainSepolia.id,
    });
  };

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
    currency0 && currency1 && recipientInput && verifierInput &&
    projectName && projectCategory &&
    milestones.every((m) => m.description && m.feeBps);
  const isEnabled = isOwner && hasAllFields && !isLoading;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-narrow" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Create Project</h1>
          <p className="text-body" style={{ margin: 0 }}>
            Register your impact project with milestones, then initialize the Uniswap v4 pool. Swaps on this pool will route fees to your project as milestones are verified.
          </p>
        </div>

        {/* Step 1: Register */}
        <div className="card" style={{ padding: 32 }}>
          <div className="text-superhead" style={{ marginBottom: 16 }}>Step 1</div>

          {/* Pool Key */}
          <div className="heading-sm" style={{ fontSize: 15, marginBottom: 12 }}>Pool Key</div>
          <div className="grid-2" style={{ marginBottom: 12 }}>
            <div>
              <label className="text-label">Currency 0</label>
              <input type="text" className="input" placeholder="0x..." value={currency0} onChange={(e) => setCurrency0(e.target.value)} />
              <div className="text-helper">Token address. Currency0 must be the lower address.</div>
            </div>
            <div>
              <label className="text-label">Currency 1</label>
              <input type="text" className="input" placeholder="0x..." value={currency1} onChange={(e) => setCurrency1(e.target.value)} />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="text-label">Fee (BPS)</label>
              <input type="text" className="input" value={fee} onChange={(e) => setFee(e.target.value)} />
              {fee && <div className="text-helper">= {(parseInt(fee) / 100 || 0).toFixed(2)}%</div>}
              <div className="text-helper">Uniswap LP fee tier. Common: 100, 500, 3000, 10000.</div>
            </div>
            <div>
              <label className="text-label">Tick Spacing</label>
              <input type="text" className="input" value={tickSpacing} onChange={(e) => setTickSpacing(e.target.value)} />
              <div className="text-helper">Must match fee tier. fee 500 = spacing 10, fee 3000 = spacing 60.</div>
            </div>
          </div>

          {/* Project Details */}
          <div className="heading-sm" style={{ fontSize: 15, marginBottom: 12 }}>Project Details</div>
          <div style={{ marginBottom: 12 }}>
            <label className="text-label">Recipient</label>
            <input type="text" className="input" placeholder="0x... (receives accumulated fees)" value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="text-label">Verifier</label>
            <input type="text" className="input" placeholder="0x... (authorized to verify milestones)" value={verifierInput} onChange={(e) => setVerifierInput(e.target.value)} />
            <div className="text-helper" style={{ lineHeight: 1.5 }}>
              The verifier determines the verification path.
              <strong style={{ color: "var(--text-secondary)" }}> Direct:</strong> use your wallet or a multisig.
              <strong style={{ color: "var(--text-secondary)" }}> Reactive Network:</strong> use the MilestoneReactor address for cross-chain verification from any supported chain.
              <strong style={{ color: "var(--text-secondary)" }}> EAS:</strong> use any address that will create Ethereum Attestation Service attestations.
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="text-label">Project Name</label>
              <input type="text" className="input" placeholder="e.g. Clean Water Initiative" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div>
              <label className="text-label">Category</label>
              <input type="text" className="input" placeholder="e.g. Infrastructure" value={projectCategory} onChange={(e) => setProjectCategory(e.target.value)} />
            </div>
          </div>

          {/* Milestones */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="heading-sm" style={{ fontSize: 15 }}>Milestones</div>
            <button onClick={addMilestone} className="btn-ghost" style={{ fontSize: 13 }}>+ Add</button>
          </div>
          <div className="text-helper" style={{ marginBottom: 12, marginTop: 0 }}>
            Each milestone unlocks its fee tier when verified. Set 0 for the first milestone so funding only starts after initial progress.
          </div>

          {milestones.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 30px", gap: 8, marginBottom: 8, alignItems: "end" }}>
              <div>
                <label className="text-label">Milestone {i}</label>
                <input type="text" className="input" placeholder="Description" value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} />
              </div>
              <div>
                <label className="text-label">Fee BPS</label>
                <input type="text" className="input" placeholder="0" value={m.feeBps} onChange={(e) => updateMilestone(i, "feeBps", e.target.value)} />
                {m.feeBps && <div className="text-helper">= {(parseInt(m.feeBps) / 100 || 0).toFixed(2)}%</div>}
              </div>
              <button
                onClick={() => removeMilestone(i)}
                style={{
                  padding: "10px 0",
                  borderRadius: "var(--radius-sm)",
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

          {/* Register button */}
          <div style={{ marginTop: 24 }}>
            <button onClick={handleCreate} disabled={!isEnabled} className="btn-form">
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
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <span className="status-pending" style={{ marginTop: 0, textAlign: "left" }}>
                Project registration is currently restricted to the hook owner for quality control. Permissionless registration is on the roadmap.
              </span>
            </div>
          )}

          {isSuccess && (
            <div className="status-success">
              Step 1 complete.{" "}
              <a href={`https://sepolia.uniscan.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                View transaction
              </a>
            </div>
          )}
        </div>

        {/* Step 2: Initialize Pool */}
        {isSuccess && (
          <div className="card" style={{ padding: 32, marginTop: 16 }}>
            <div className="text-superhead" style={{ marginBottom: 12 }}>Step 2 - Initialize Pool</div>
            <p className="text-small" style={{ marginBottom: 16, lineHeight: 1.5 }}>
              The project is registered on ImpactHook. Now initialize the pool on Uniswap v4 PoolManager so swaps can begin routing fees. Uses a 1:1 starting price.
            </p>

            <div className="code-block" style={{ marginBottom: 16, fontSize: 12, lineHeight: 1.6 }}>
              <div><span style={{ color: "var(--text-secondary)" }}>PoolManager:</span> {POOL_MANAGER_ADDRESS}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Currency0:</span> {currency0}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Currency1:</span> {currency1}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Fee:</span> {fee} / <span style={{ color: "var(--text-secondary)" }}>Tick Spacing:</span> {tickSpacing}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Hook:</span> {HOOK_ADDRESS}</div>
            </div>

            {!isInitSuccess && (
              <button onClick={handleInitialize} disabled={isInitLoading} className="btn-form">
                {isInitLoading ? "Initializing Pool..." : "Initialize Pool"}
              </button>
            )}

            {isInitSuccess && (
              <div className="status-success">
                Pool initialized.{" "}
                <a href={`https://sepolia.uniscan.xyz/tx/${initTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                  View transaction
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success */}
        {isInitSuccess && poolId && (
          <div className="card card-accent-success" style={{ padding: 32, marginTop: 16 }}>
            <span className="badge badge-success" style={{ marginBottom: 12 }}>Setup Complete</span>
            <p className="text-small" style={{ marginBottom: 16, lineHeight: 1.5 }}>
              Your project is registered and the pool is initialized. Swaps on this pool will now route fees to the project as milestones are verified via the Uniswap v4 hook.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label className="text-label">Pool ID</label>
              <div className="code-block font-data" style={{ fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>
                {poolId}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/dashboard" className="btn-secondary" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>
                View Dashboard
              </Link>
              <Link href="/milestones" className="btn-primary" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>
                Verify Milestones
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
