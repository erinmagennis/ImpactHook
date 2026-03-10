"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, formatUnits } from "viem";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function WithdrawPage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");

  const poolId = (poolIdInput ||
    "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;
  const currency = (currencyInput ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const registered = projectInfo?.[5];
  const recipient = projectInfo?.[0];
  const isRecipient =
    isConnected && address?.toLowerCase() === recipient?.toLowerCase();

  const { data: fees } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "accumulatedFees",
    args: [poolId, currency],
    chainId: unichainSepolia.id,
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleWithdraw = () => {
    writeContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "withdraw",
      args: [poolId, currency],
      chainId: unichainSepolia.id,
    });
  };

  const feeAmount = fees ? formatEther(fees as bigint) : "0";
  const hasFees = fees && (fees as bigint) > BigInt(0);

  const isEnabled = hasFees && isRecipient && !isLoading;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Navigation />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
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
            Withdraw Fees
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-mid)" }}>
            Withdraw accumulated swap fees for your impact project
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {/* Pool ID */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>POOL ID</label>
            <input
              type="text"
              placeholder="0x..."
              value={poolIdInput}
              onChange={(e) => setPoolIdInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Currency address */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>CURRENCY (TOKEN ADDRESS)</label>
            <input
              type="text"
              placeholder="0x... (use 0x0 for native ETH)"
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Fee display */}
          {registered && poolIdInput && (
            <div className="card" style={{ padding: 16, marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 8,
                }}
              >
                Accumulated Fees
              </div>
              <div
                className="font-data"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: hasFees
                    ? "var(--accent-emerald)"
                    : "var(--text-dim)",
                }}
              >
                {feeAmount}
              </div>
              {recipient && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    marginTop: 8,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Recipient: {recipient.slice(0, 8)}...{recipient.slice(-6)}
                </div>
              )}
            </div>
          )}

          {/* Withdraw button */}
          <button
            onClick={handleWithdraw}
            disabled={!hasFees || !isRecipient || isLoading}
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
              ? "Withdrawing..."
              : !isConnected
                ? "Connect wallet"
                : !registered
                  ? "No project found"
                  : !isRecipient
                    ? "Only recipient can withdraw"
                    : !hasFees
                      ? "No fees to withdraw"
                      : `Withdraw ${feeAmount}`}
          </button>

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
              Fees withdrawn successfully!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-violet)", textDecoration: "underline" }}
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
