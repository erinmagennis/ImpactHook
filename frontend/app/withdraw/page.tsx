"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, encodeAbiParameters, keccak256 } from "viem";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function WithdrawPage() {
  const { address, isConnected } = useAccount();
  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const [feeInput, setFeeInput] = useState("3000");
  const [tickSpacingInput, setTickSpacingInput] = useState("60");

  const hasPoolKey = token0Input.startsWith("0x") && token1Input.startsWith("0x");
  const poolKey = {
    currency0: (token0Input || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    currency1: (token1Input || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    fee: parseInt(feeInput) || 0,
    tickSpacing: parseInt(tickSpacingInput) || 0,
    hooks: HOOK_ADDRESS,
  };

  const poolId = hasPoolKey
    ? keccak256(
        encodeAbiParameters(
          [{ type: "tuple", components: [
            { name: "currency0", type: "address" },
            { name: "currency1", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "tickSpacing", type: "int24" },
            { name: "hooks", type: "address" },
          ]}],
          [poolKey]
        )
      )
    : ("0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`);

  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const registered = projectInfo?.[5];
  const recipient = projectInfo?.[0];
  const currentFeeBps = projectInfo?.[4];
  const isRecipient = isConnected && address?.toLowerCase() === recipient?.toLowerCase();

  const { data: fees0 } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "accumulatedFees",
    args: [poolId, poolKey.currency0],
    chainId: unichainSepolia.id,
    query: { enabled: hasPoolKey },
  });

  const { data: fees1 } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "accumulatedFees",
    args: [poolId, poolKey.currency1],
    chainId: unichainSepolia.id,
    query: { enabled: hasPoolKey },
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleWithdraw = (currency: `0x${string}`) => {
    writeContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "withdraw",
      args: [poolId, currency],
      chainId: unichainSepolia.id,
    });
  };

  const feeAmount0 = fees0 ? formatEther(fees0 as bigint) : "0";
  const feeAmount1 = fees1 ? formatEther(fees1 as bigint) : "0";
  const hasFees0 = fees0 && (fees0 as bigint) > BigInt(0);
  const hasFees1 = fees1 && (fees1 as bigint) > BigInt(0);

  const getButtonLabel = (hasFees: boolean, amount: string) => {
    if (isLoading) return "Withdrawing...";
    if (!isConnected) return "Connect wallet";
    if (!registered) return "No project found";
    if (!isRecipient) return "Only recipient can withdraw";
    if (!hasFees) return "No fees to withdraw";
    return `Withdraw ${amount}`;
  };

  const getButtonEnabled = (hasFees: boolean) => hasFees && isRecipient && !isLoading;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-narrow" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Withdraw Fees</h1>
          <p className="text-body" style={{ margin: 0 }}>
            Withdraw accumulated swap fees. Funding is gated by verified milestone progress. Only the project recipient can withdraw.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Pool Key inputs */}
          <div style={{ marginBottom: 16 }}>
            <label className="text-label">Token 0 (currency0)</label>
            <input type="text" className="input" placeholder="0x..." value={token0Input} onChange={(e) => setToken0Input(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="text-label">Token 1 (currency1)</label>
            <input type="text" className="input" placeholder="0x..." value={token1Input} onChange={(e) => setToken1Input(e.target.value)} />
          </div>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="text-label">Fee (BPS)</label>
              <input type="text" className="input" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
            </div>
            <div>
              <label className="text-label">Tick Spacing</label>
              <input type="text" className="input" value={tickSpacingInput} onChange={(e) => setTickSpacingInput(e.target.value)} />
            </div>
          </div>
          <div className="text-helper" style={{ marginBottom: 16 }}>
            Enter the same token addresses, fee, and tick spacing used when the project was created.
          </div>

          {hasPoolKey && (
            <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)" }}>
              <span className="text-label" style={{ marginBottom: 0, display: "inline", marginRight: 6 }}>Pool ID:</span>
              <span className="font-data text-caption" style={{ color: "var(--text-secondary)", wordBreak: "break-all" }}>{poolId}</span>
            </div>
          )}

          {registered && currentFeeBps !== undefined && (
            <div style={{ marginBottom: 16 }}>
              <span className="text-label" style={{ marginBottom: 0, display: "inline", marginRight: 6 }}>Current Fee:</span>
              <span className="font-data" style={{ fontSize: 13, color: "var(--accent)" }}>{(Number(currentFeeBps) / 100).toFixed(2)}%</span>
            </div>
          )}

          {/* Fee display */}
          {registered && hasPoolKey && (
            <div className="grid-2" style={{ gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label">Token 0 Fees</div>
                <div className="font-data" style={{ fontSize: 22, fontWeight: 700, color: hasFees0 ? "var(--accent)" : "var(--text-dim)", marginBottom: 12 }}>
                  {feeAmount0}
                </div>
                <button
                  onClick={() => handleWithdraw(poolKey.currency0)}
                  disabled={!getButtonEnabled(!!hasFees0)}
                  className="btn-form"
                  style={{ fontSize: 12 }}
                >
                  {getButtonLabel(!!hasFees0, feeAmount0)}
                </button>
              </div>
              <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label">Token 1 Fees</div>
                <div className="font-data" style={{ fontSize: 22, fontWeight: 700, color: hasFees1 ? "var(--accent)" : "var(--text-dim)", marginBottom: 12 }}>
                  {feeAmount1}
                </div>
                <button
                  onClick={() => handleWithdraw(poolKey.currency1)}
                  disabled={!getButtonEnabled(!!hasFees1)}
                  className="btn-form"
                  style={{ fontSize: 12 }}
                >
                  {getButtonLabel(!!hasFees1, feeAmount1)}
                </button>
              </div>
            </div>
          )}

          {registered && hasPoolKey && recipient && (
            <div style={{ marginBottom: 16 }}>
              <span className="text-label" style={{ marginBottom: 0, display: "inline", marginRight: 6 }}>Recipient:</span>
              <span className="font-data text-caption" style={{ color: "var(--text-secondary)" }}>{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
            </div>
          )}

          {!hasPoolKey && (
            <button disabled className="btn-form" style={{ opacity: 0.5 }}>
              Enter pool key to view fees
            </button>
          )}

          {isSuccess && (
            <div className="status-success">
              Fees withdrawn!{" "}
              <a href={`https://sepolia.uniscan.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                View transaction
              </a>
            </div>
          )}
        </div>

        {/* Demo preview */}
        {!hasPoolKey && (
          <div className="animate-fade-up delay-200" style={{ marginTop: 24, position: "relative" }}>
            <div className="card" style={{ padding: 32, position: "relative" }}>
              <span className="badge badge-violet" style={{ position: "absolute", top: 16, right: 16, fontSize: 11, padding: "2px 10px" }}>
                Preview
              </span>
              <div className="text-label" style={{ marginBottom: 12 }}>
                Example: Clean Water - Chiapas Schools
              </div>
              <div className="grid-2" style={{ gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label">Accumulated (Token 0)</div>
                  <div className="font-data" style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>0.284</div>
                </div>
                <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label">Accumulated (Token 1)</div>
                  <div className="font-data" style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>412.50</div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>Recipient</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>0x1a2B...9c4D</div>
                </div>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>Current Fee</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>3%</div>
                </div>
              </div>
              <button disabled className="btn-form" style={{ opacity: 0.5 }}>
                Withdraw 0.284
              </button>
              <div className="text-helper" style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", textAlign: "center" }}>
                Enter your pool key above to view accumulated fees for both tokens and withdraw.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
