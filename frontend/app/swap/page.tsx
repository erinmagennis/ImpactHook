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
        BigInt(0),
      ],
      chainId: unichainSepolia.id,
    });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-narrow" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Swap</h1>
          <p className="text-body" style={{ margin: 0 }}>
            Trade tokens through an impact pool. A portion of each swap funds verified projects via the Uniswap v4 hook.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Project selector */}
          <div style={{ marginBottom: 20 }}>
            <ProjectSelector value={poolIdInput} onChange={setPoolIdInput} />
          </div>

          {/* Token inputs */}
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <div>
              <label className="text-label">Token 0</label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={token0Input}
                onChange={(e) => setToken0Input(e.target.value)}
              />
              {token0Input && address && token0Balance !== undefined && (
                <div className="text-helper">
                  Balance: {parseFloat(formatEther(token0Balance as bigint)).toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <label className="text-label">Token 1</label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={token1Input}
                onChange={(e) => setToken1Input(e.target.value)}
              />
              {token1Input && address && token1Balance !== undefined && (
                <div className="text-helper">
                  Balance: {parseFloat(formatEther(token1Balance as bigint)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <div className="text-helper" style={{ marginBottom: 20 }}>
            Must match the token addresses used when the pool was created.
          </div>

          {/* Fee / Tick Spacing */}
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <div>
              <label className="text-label">Fee</label>
              <input
                type="text"
                className="input"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-label">Tick Spacing</label>
              <input
                type="text"
                className="input"
                value={tickSpacingInput}
                onChange={(e) => setTickSpacingInput(e.target.value)}
              />
            </div>
          </div>
          <div className="text-helper" style={{ marginBottom: 20 }}>
            Must match the pool&#39;s fee tier and tick spacing.
          </div>

          {/* Direction toggle */}
          <div style={{ marginBottom: 20 }}>
            <label className="text-label">Swap Direction</label>
            <div className="grid-2" style={{ gap: 8 }}>
              {(["0to1", "1to0"] as const).map((d) => {
                const isActive = direction === d;
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
                      borderRadius: "var(--radius-pill)",
                      border: isActive ? "1px solid rgba(13,148,136,0.4)" : "1px solid var(--border-subtle)",
                      background: isActive ? "var(--accent)" : "transparent",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {`${fromLabel} \u2192 ${toLabel}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label className="text-label">Amount (input)</label>
            <input
              type="text"
              className="input"
              placeholder="1.0"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>

          {/* Fee breakdown */}
          {registered && poolIdInput && amount > 0 && (
            <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--bg-elevated)", marginBottom: 20 }}>
              <div className="text-superhead" style={{ marginBottom: 12 }}>Fee Breakdown</div>
              <div style={{ display: "grid", gap: 8 }}>
                <div className="fee-row">
                  <span className="text-small" style={{ margin: 0 }}>Impact fee rate</span>
                  <span className="font-data" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    {(feeBps / 100).toFixed(2)}%
                  </span>
                </div>
                {discount > 0 && (
                  <div className="fee-row">
                    <span className="text-small" style={{ margin: 0 }}>Loyalty discount</span>
                    <span className="font-data" style={{ fontSize: 14, color: "var(--success)" }}>
                      -{discount / 100}%
                    </span>
                  </div>
                )}
                <div className="fee-row">
                  <span className="text-small" style={{ margin: 0 }}>Effective fee</span>
                  <span className="font-data" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    {(effectiveFeeBps / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="divider-sm" style={{ margin: "4px 0" }} />
                <div className="fee-row">
                  <span className="text-small" style={{ margin: 0, color: "var(--accent)", fontWeight: 600 }}>Impact contribution</span>
                  <span className="font-data" style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700 }}>
                    {estimatedFee.toFixed(6)}
                  </span>
                </div>
                <div className="fee-row">
                  <span className="text-small" style={{ margin: 0 }}>Estimated output</span>
                  <span className="font-data" style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 700 }}>
                    ~{estimatedOutput.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pool info */}
          {registered && poolIdInput && (
            <div className="grid-2" style={{ gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label" style={{ marginBottom: 4 }}>Current Fee</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {(feeBps / 100).toFixed(2)}%
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label" style={{ marginBottom: 4 }}>Milestones</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {currentMilestone?.toString()}/{milestoneCount?.toString()}
                </div>
              </div>
            </div>
          )}

          {/* Impact stats */}
          {registered && poolIdInput && (
            <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", marginBottom: 20 }}>
              <div className="text-superhead" style={{ marginBottom: 10 }}>Impact</div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div>
                  <div className="text-caption" style={{ marginBottom: 2 }}>This swap</div>
                  <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: amount > 0 && estimatedFee > 0 ? "var(--accent)" : "var(--text-dim)" }}>
                    {amount > 0 ? estimatedFee.toFixed(4) : "0"}
                  </div>
                </div>
                {isConnected && (
                  <>
                    <div>
                      <div className="text-caption" style={{ marginBottom: 2 }}>Pool total</div>
                      <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                        {(Number(poolContribution) + estimatedFee).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-caption" style={{ marginBottom: 2 }}>All pools</div>
                      <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                        {(Number(globalContribution) + estimatedFee).toFixed(4)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Approve button */}
          {needsApproval && (
            <button
              onClick={handleApprove}
              disabled={approveLoading}
              className="btn-form"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid var(--warning)",
                color: "var(--warning)",
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
            className="btn-form"
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
            <div className="status-success">
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
            <div className="status-success" style={{ fontSize: 12 }}>
              Token approved. Click Swap to proceed.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
