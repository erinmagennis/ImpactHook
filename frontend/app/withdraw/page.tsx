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

  return (
    <div style={{ minHeight: "100vh", background: "#08080c" }}>
      <Navigation />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
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
            Withdraw Fees
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
            Withdraw accumulated swap fees for your impact project
          </p>
        </div>

        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Pool ID */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Pool ID</label>
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
            <label style={labelStyle}>Currency (token address)</label>
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
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Accumulated Fees
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: hasFees ? "#22c55e" : "rgba(255,255,255,0.3)",
                  fontFamily: "monospace",
                }}
              >
                {feeAmount}
              </div>
              {recipient && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 8,
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
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              cursor:
                hasFees && isRecipient && !isLoading
                  ? "pointer"
                  : "not-allowed",
              background:
                hasFees && isRecipient
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "rgba(255,255,255,0.06)",
              color:
                hasFees && isRecipient ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "all 0.2s",
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
                borderRadius: 8,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#22c55e",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Fees withdrawn successfully!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6366f1", textDecoration: "underline" }}
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
  fontSize: 13,
  color: "rgba(255,255,255,0.4)",
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  fontFamily: "monospace",
  boxSizing: "border-box",
};
