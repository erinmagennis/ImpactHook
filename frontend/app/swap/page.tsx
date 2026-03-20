"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [direction, setDirection] = useState<"0to1" | "1to0">("0to1");

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
  const currentFeeBps = projectInfo?.[4];
  const milestoneCount = projectInfo?.[3];
  const currentMilestone = projectInfo?.[2];

  const { data: contributorStats } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getContributorStats",
    args: [address || "0x0000000000000000000000000000000000000000", poolId],
    chainId: unichainSepolia.id,
  });

  const { data: loyaltyDiscount } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getLoyaltyDiscount",
    args: [address || "0x0000000000000000000000000000000000000000", poolId],
    chainId: unichainSepolia.id,
  });

  const feeBps = Number(currentFeeBps || 0);
  const discount = Number(loyaltyDiscount || 0);
  const effectiveFeeBps = feeBps - Math.floor((feeBps * discount) / 10000);
  const amount = parseFloat(amountInput) || 0;
  const estimatedFee = (amount * effectiveFeeBps) / 10000;
  const estimatedOutput = amount - estimatedFee;

  const poolContribution = contributorStats?.[0]
    ? formatEther(contributorStats[0] as bigint)
    : "0";
  const globalContribution = contributorStats?.[1]
    ? formatEther(contributorStats[1] as bigint)
    : "0";

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
            Swap
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Swap tokens through an impact pool. A small fee funds verified
            projects.
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {/* Pool ID */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>POOL ID</label>
            <input
              type="text"
              placeholder="0x6bc91b5e91380a168a3d85fd1ea27b250b10b40390b9da68bb07ebfd4f95f205"
              value={poolIdInput}
              onChange={(e) => setPoolIdInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Direction toggle */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>DIRECTION</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["0to1", "1to0"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border:
                      direction === d
                        ? "1px solid rgba(13,148,136,0.4)"
                        : "1px solid var(--border-subtle)",
                    background:
                      direction === d
                        ? "rgba(13,148,136,0.08)"
                        : "var(--bg-elevated)",
                    color:
                      direction === d
                        ? "var(--text-primary)"
                        : "var(--text-dim)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {d === "0to1" ? "Token0 \u2192 Token1" : "Token1 \u2192 Token0"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>AMOUNT (INPUT)</label>
            <input
              type="text"
              placeholder="1.0"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Fee breakdown */}
          {registered && poolIdInput && amount > 0 && (
            <div
              className="card"
              style={{ padding: 16, marginBottom: 20 }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 12,
                }}
              >
                Fee Breakdown
              </div>
              <div
                style={{ display: "grid", gap: 8 }}
              >
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Impact fee rate</span>
                  <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                    {feeBps} bps ({(feeBps / 100).toFixed(2)}%)
                  </span>
                </div>
                {discount > 0 && (
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>
                      Loyalty discount
                    </span>
                    <span
                      className="font-data"
                      style={{ color: "var(--success)" }}
                    >
                      -{discount / 100}%
                    </span>
                  </div>
                )}
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Effective fee</span>
                  <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                    {effectiveFeeBps} bps ({(effectiveFeeBps / 100).toFixed(2)}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 1,
                    background: "var(--border-subtle)",
                    margin: "4px 0",
                  }}
                />
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Impact contribution</span>
                  <span
                    className="font-data"
                    style={{ color: "var(--success)", fontWeight: 700 }}
                  >
                    {estimatedFee.toFixed(6)}
                  </span>
                </div>
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Estimated output</span>
                  <span
                    className="font-data"
                    style={{ color: "var(--text-primary)", fontWeight: 700 }}
                  >
                    ~{estimatedOutput.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pool info */}
          {registered && poolIdInput && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Current Fee</div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {feeBps} bps
                </div>
              </div>
              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Milestones</div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {currentMilestone?.toString()}/{milestoneCount?.toString()}
                </div>
              </div>
            </div>
          )}

          {/* Impact stats */}
          {registered && poolIdInput && isConnected && (
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                background: "var(--accent-bg)",
                border: "1px solid rgba(13,148,136,0.08)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                }}
              >
                Your Impact
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>
                    This pool
                  </div>
                  <div
                    className="font-data"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--success)",
                    }}
                  >
                    {poolContribution}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>
                    All pools
                  </div>
                  <div
                    className="font-data"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--success)",
                    }}
                  >
                    {globalContribution}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Swap button */}
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
            {!isConnected
              ? "Connect wallet"
              : "Swap (requires deployed router)"}
          </button>
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "var(--text-dim)",
              textAlign: "center",
            }}
          >
            Swaps execute through Uniswap v4 PoolManager. Pool initialization
            and a swap router are required for live swaps.
          </div>
        </div>

        {/* Demo preview */}
        {!poolIdInput && (
          <div
            className="animate-fade-up delay-200"
            style={{ marginTop: 24, position: "relative" }}
          >
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
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 16,
                }}
              >
                Example: Swap 1.0 ETH in Clean Water pool
              </div>

              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 12,
                  }}
                >
                  Fee Breakdown
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>Impact fee rate</span>
                    <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                      300 bps (3.00%)
                    </span>
                  </div>
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>Loyalty discount</span>
                    <span
                      className="font-data"
                      style={{ color: "var(--success)" }}
                    >
                      -10% (repeat contributor)
                    </span>
                  </div>
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>Effective fee</span>
                    <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                      270 bps (2.70%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: "var(--border-subtle)",
                      margin: "4px 0",
                    }}
                  />
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>
                      Impact contribution
                    </span>
                    <span
                      className="font-data"
                      style={{
                        color: "var(--success)",
                        fontWeight: 700,
                      }}
                    >
                      0.027000
                    </span>
                  </div>
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>Estimated output</span>
                    <span
                      className="font-data"
                      style={{ color: "var(--text-primary)", fontWeight: 700 }}
                    >
                      ~0.973000
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--accent-bg)",
                  border: "1px solid rgba(13,148,136,0.08)",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 8,
                  }}
                >
                  Your Impact
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        marginBottom: 2,
                      }}
                    >
                      This pool
                    </div>
                    <div
                      className="font-data"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--success)",
                      }}
                    >
                      0.847
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        marginBottom: 2,
                      }}
                    >
                      All pools
                    </div>
                    <div
                      className="font-data"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--success)",
                      }}
                    >
                      2.134
                    </div>
                  </div>
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
                Swap 1.0 ETH
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
                Enter a Pool ID above to see live fee calculations. The impact
                fee is charged on swap output via afterSwapReturnDelta. LP yield
                is unaffected.
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

const feeRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
};

const infoBoxStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-subtle)",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};
