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

  // Compute pool ID from pool key components
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
          [
            {
              type: "tuple",
              components: [
                { name: "currency0", type: "address" },
                { name: "currency1", type: "address" },
                { name: "fee", type: "uint24" },
                { name: "tickSpacing", type: "int24" },
                { name: "hooks", type: "address" },
              ],
            },
          ],
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
  const isRecipient =
    isConnected && address?.toLowerCase() === recipient?.toLowerCase();

  // Read accumulated fees for token0
  const { data: fees0 } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "accumulatedFees",
    args: [poolId, poolKey.currency0],
    chainId: unichainSepolia.id,
    query: { enabled: hasPoolKey },
  });

  // Read accumulated fees for token1
  const { data: fees1 } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "accumulatedFees",
    args: [poolId, poolKey.currency1],
    chainId: unichainSepolia.id,
    query: { enabled: hasPoolKey },
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <Navigation />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
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
            Withdraw Fees
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Withdraw accumulated swap fees for your impact project
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {/* Pool Key inputs */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>TOKEN 0 (CURRENCY0)</label>
            <input
              type="text"
              placeholder="0x..."
              value={token0Input}
              onChange={(e) => setToken0Input(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>TOKEN 1 (CURRENCY1)</label>
            <input
              type="text"
              placeholder="0x..."
              value={token1Input}
              onChange={(e) => setToken1Input(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>FEE (BPS)</label>
              <input
                type="text"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>TICK SPACING</label>
              <input
                type="text"
                value={tickSpacingInput}
                onChange={(e) => setTickSpacingInput(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {hasPoolKey && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', wordBreak: 'break-all', marginBottom: 16 }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>Pool ID:</span>
              <span className="font-data" style={{ color: 'var(--text-secondary)' }}>{poolId}</span>
            </div>
          )}

          {registered && currentFeeBps !== undefined && (
            <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-dim)' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>Current Fee:</span>
              <span className="font-data" style={{ color: 'var(--accent)' }}>{(Number(currentFeeBps) / 100).toFixed(2)}%</span>
            </div>
          )}

          {/* Fee display for both tokens */}
          {registered && hasPoolKey && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 8,
                  }}
                >
                  Token 0 Fees
                </div>
                <div
                  className="font-data"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: hasFees0 ? "var(--success)" : "var(--text-dim)",
                    marginBottom: 12,
                  }}
                >
                  {feeAmount0}
                </div>
                <button
                  onClick={() => handleWithdraw(poolKey.currency0)}
                  disabled={!getButtonEnabled(!!hasFees0)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: getButtonEnabled(!!hasFees0)
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border-subtle)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: getButtonEnabled(!!hasFees0) ? "pointer" : "not-allowed",
                    background: getButtonEnabled(!!hasFees0) ? "var(--accent)" : "var(--bg-elevated)",
                    color: getButtonEnabled(!!hasFees0) ? "#ffffff" : "var(--text-dim)",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {getButtonLabel(!!hasFees0, feeAmount0)}
                </button>
              </div>
              <div className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 8,
                  }}
                >
                  Token 1 Fees
                </div>
                <div
                  className="font-data"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: hasFees1 ? "var(--success)" : "var(--text-dim)",
                    marginBottom: 12,
                  }}
                >
                  {feeAmount1}
                </div>
                <button
                  onClick={() => handleWithdraw(poolKey.currency1)}
                  disabled={!getButtonEnabled(!!hasFees1)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: getButtonEnabled(!!hasFees1)
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border-subtle)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: getButtonEnabled(!!hasFees1) ? "pointer" : "not-allowed",
                    background: getButtonEnabled(!!hasFees1) ? "var(--accent)" : "var(--bg-elevated)",
                    color: getButtonEnabled(!!hasFees1) ? "#ffffff" : "var(--text-dim)",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {getButtonLabel(!!hasFees1, feeAmount1)}
                </button>
              </div>
            </div>
          )}

          {registered && hasPoolKey && recipient && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                marginBottom: 16,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Recipient: {recipient.slice(0, 8)}...{recipient.slice(-6)}
            </div>
          )}

          {/* Fallback button when no pool key entered */}
          {!hasPoolKey && (
            <button
              disabled
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 6,
                border: "1px solid var(--border-subtle)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "not-allowed",
                background: "var(--bg-elevated)",
                color: "var(--text-dim)",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              Enter pool key to view fees
            </button>
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
              Fees withdrawn successfully!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7c3aed", textDecoration: "underline" }}
              >
                View transaction
              </a>
            </div>
          )}
        </div>

        {/* Demo preview when no pool key entered */}
        {!hasPoolKey && (
          <div className="animate-fade-up delay-200" style={{ marginTop: 24, position: "relative" }}>
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
                zIndex: 1,
              }}
            >
              Preview
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Example: Clean Water - Chiapas Schools
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 16, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Accumulated (Token 0)</div>
                  <div className="font-data" style={{ fontSize: 24, fontWeight: 700, color: "var(--success)" }}>0.284</div>
                </div>
                <div style={{ padding: 16, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Accumulated (Token 1)</div>
                  <div className="font-data" style={{ fontSize: 24, fontWeight: 700, color: "var(--success)" }}>412.50</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Recipient</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>0x1a2B...9c4D</div>
                </div>
                <div style={{ flex: 1, padding: 12, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current Fee</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>3%</div>
                </div>
              </div>
              <button
                disabled
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 6,
                  border: "1px solid rgba(124,58,237,0.3)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "not-allowed",
                  background: "rgba(124,58,237,0.08)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  opacity: 0.6,
                }}
              >
                Withdraw 0.284
              </button>
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--accent-bg)",
                  border: "1px solid rgba(13,148,136,0.08)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Enter your pool key above to view accumulated fees for both tokens and withdraw.
              </div>
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
