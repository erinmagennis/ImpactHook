"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther, erc20Abi } from "viem";
import { Navigation } from "../../components/Navigation";
import { ProjectSelector } from "../../components/ProjectSelector";
import {
  HOOK_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  impactHookAbi,
  impactSwapRouterAbi,
} from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const [feeInput, setFeeInput] = useState("500");
  const [tickSpacingInput, setTickSpacingInput] = useState("10");
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

  // Token balances
  const { data: token0Balance } = useReadContract({
    address: (token0Input || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: !!token0Input && !!address },
  });

  const { data: token1Balance } = useReadContract({
    address: (token1Input || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: !!token1Input && !!address },
  });

  // Approval state
  const inputToken = direction === "0to1" ? token0Input : token1Input;
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: (inputToken || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      SWAP_ROUTER_ADDRESS,
    ],
    chainId: unichainSepolia.id,
    query: { enabled: !!inputToken && !!address },
  });

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { isLoading: approveLoading, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Swap state
  const { writeContract: writeSwap, data: swapHash } = useWriteContract();
  const { isLoading: swapLoading, isSuccess: swapSuccess } =
    useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (approveSuccess) refetchAllowance();
  }, [approveSuccess, refetchAllowance]);

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

  const needsApproval = inputToken && amount > 0 && allowance !== undefined
    && (allowance as bigint) < parseEther(amountInput || "0");

  const canSwap = isConnected && registered && token0Input && token1Input
    && amount > 0 && !needsApproval && !swapLoading;

  const handleApprove = () => {
    if (!inputToken) return;
    writeApprove({
      address: inputToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [SWAP_ROUTER_ADDRESS, parseEther("1000000")],
      chainId: unichainSepolia.id,
    });
  };

  const handleSwap = () => {
    if (!token0Input || !token1Input) return;
    writeSwap({
      address: SWAP_ROUTER_ADDRESS,
      abi: impactSwapRouterAbi,
      functionName: "swap",
      args: [
        {
          currency0: token0Input as `0x${string}`,
          currency1: token1Input as `0x${string}`,
          fee: parseInt(feeInput),
          tickSpacing: parseInt(tickSpacingInput),
          hooks: HOOK_ADDRESS,
        },
        direction === "0to1",
        parseEther(amountInput || "0"),
        BigInt(0), // minAmountOut = 0 for demo (no slippage protection)
      ],
      chainId: unichainSepolia.id,
    });
  };

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
          {/* Project selector */}
          <div style={{ marginBottom: 16 }}>
            <ProjectSelector value={poolIdInput} onChange={setPoolIdInput} label="SELECT PROJECT" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>TOKEN 0</label>
              <input
                type="text"
                placeholder="0x..."
                value={token0Input}
                onChange={(e) => setToken0Input(e.target.value)}
                style={inputStyle}
              />
              {token0Input && address && token0Balance !== undefined && (
                <div style={balanceStyle}>
                  Balance: {parseFloat(formatEther(token0Balance as bigint)).toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>TOKEN 1</label>
              <input
                type="text"
                placeholder="0x..."
                value={token1Input}
                onChange={(e) => setToken1Input(e.target.value)}
                style={inputStyle}
              />
              {token1Input && address && token1Balance !== undefined && (
                <div style={balanceStyle}>
                  Balance: {parseFloat(formatEther(token1Balance as bigint)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: -12, marginBottom: 12, lineHeight: 1.4 }}>
            Must match the token addresses used when the pool was created.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>FEE</label>
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
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: -12, marginBottom: 12, lineHeight: 1.4 }}>
            Must match the pool&#39;s fee tier and tick spacing.
          </div>

          {/* Direction toggle */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>SWAP DIRECTION</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["0to1", "1to0"] as const).map((d) => {
                const fromToken = d === "0to1" ? token0Input : token1Input;
                const toToken = d === "0to1" ? token1Input : token0Input;
                const fromLabel = fromToken ? `${fromToken.slice(0, 6)}...` : (d === "0to1" ? "Token 0" : "Token 1");
                const toLabel = toToken ? `${toToken.slice(0, 6)}...` : (d === "0to1" ? "Token 1" : "Token 0");
                return (
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
                  {`${fromLabel} \u2192 ${toLabel}`}
                </button>
              );})}
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
              <div style={{ display: "grid", gap: 8 }}>
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Impact fee rate</span>
                  <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                    {(feeBps / 100).toFixed(2)}%
                  </span>
                </div>
                {discount > 0 && (
                  <div style={feeRowStyle}>
                    <span style={{ color: "var(--text-dim)" }}>Loyalty discount</span>
                    <span className="font-data" style={{ color: "var(--success)" }}>
                      -{discount / 100}%
                    </span>
                  </div>
                )}
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Effective fee</span>
                  <span className="font-data" style={{ color: "var(--text-secondary)" }}>
                    {(effectiveFeeBps / 100).toFixed(2)}%
                  </span>
                </div>
                <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Impact contribution</span>
                  <span className="font-data" style={{ color: "var(--success)", fontWeight: 700 }}>
                    {estimatedFee.toFixed(6)}
                  </span>
                </div>
                <div style={feeRowStyle}>
                  <span style={{ color: "var(--text-dim)" }}>Estimated output</span>
                  <span className="font-data" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    ~{estimatedOutput.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pool info */}
          {registered && poolIdInput && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Current Fee</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {(feeBps / 100).toFixed(2)}%
                </div>
              </div>
              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Milestones</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {currentMilestone?.toString()}/{milestoneCount?.toString()}
                </div>
              </div>
            </div>
          )}

          {/* Impact stats - dynamic */}
          {registered && poolIdInput && (
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
                Impact
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>This swap</div>
                  <div className="font-data" style={{ fontSize: 16, fontWeight: 700, color: amount > 0 && estimatedFee > 0 ? "var(--success)" : "var(--text-dim)" }}>
                    {amount > 0 ? estimatedFee.toFixed(4) : "0"}
                  </div>
                </div>
                {isConnected && (
                  <>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>This pool (total)</div>
                      <div className="font-data" style={{ fontSize: 16, fontWeight: 700, color: "var(--success)" }}>
                        {(Number(poolContribution) + estimatedFee).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>All pools</div>
                      <div className="font-data" style={{ fontSize: 16, fontWeight: 700, color: "var(--success)" }}>
                        {(Number(globalContribution) + estimatedFee).toFixed(4)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Approve button (if needed) */}
          {needsApproval && (
            <button
              onClick={handleApprove}
              disabled={approveLoading}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 6,
                border: "1px solid var(--warning)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: approveLoading ? "not-allowed" : "pointer",
                background: "rgba(245,158,11,0.08)",
                color: "var(--warning)",
                fontFamily: "inherit",
                marginBottom: 8,
              }}
            >
              {approveLoading ? "Approving..." : "Approve Token"}
            </button>
          )}

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: 6,
              border: canSwap
                ? "1px solid var(--accent)"
                : "1px solid var(--border-subtle)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: canSwap ? "pointer" : "not-allowed",
              background: canSwap ? "var(--accent)" : "var(--bg-elevated)",
              color: canSwap ? "#ffffff" : "var(--text-dim)",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {!isConnected
              ? "Connect wallet"
              : swapLoading
              ? "Swapping..."
              : needsApproval
              ? "Approve first"
              : !registered
              ? "No project registered"
              : amount <= 0
              ? "Enter amount"
              : `Swap ${amountInput}`}
          </button>

          {/* Tx status */}
          {swapSuccess && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.12)",
                color: "var(--success)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Swap successful!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${swapHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7c3aed", textDecoration: "underline" }}
              >
                View transaction
              </a>
            </div>
          )}

          {approveSuccess && !swapSuccess && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.12)",
                color: "var(--success)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Token approved. Click Swap to proceed.
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

const balanceStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-dim)",
  marginTop: 4,
  fontFamily: "inherit",
};
