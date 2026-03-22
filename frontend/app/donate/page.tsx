"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, erc20Abi } from "viem";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

type DonateStep = "input" | "approving" | "donating";

export default function DonatePage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [step, setStep] = useState<DonateStep>("input");
  const [errorMsg, setErrorMsg] = useState("");

  const poolId = (poolIdInput ||
    "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;
  const currency = (currencyInput ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const isNativeETH =
    !currencyInput ||
    currencyInput === "0x0000000000000000000000000000000000000000" ||
    currencyInput.toLowerCase() === "0x0";

  // Read project info
  const { data: projectInfo } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectInfo",
    args: [poolId],
    chainId: unichainSepolia.id,
  });

  const registered = projectInfo?.[5];
  const projectRecipient = projectInfo?.[0];
  const currentFeeBps = projectInfo?.[4];
  const milestoneCount = projectInfo?.[3];
  const currentMilestone = projectInfo?.[2];

  // Read contributor stats
  const { data: contributorStats } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getContributorStats",
    args: [address || "0x0000000000000000000000000000000000000000", poolId],
    chainId: unichainSepolia.id,
  });

  // Read ERC20 allowance (only for non-native tokens)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: currency as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      HOOK_ADDRESS,
    ],
    chainId: unichainSepolia.id,
    query: {
      enabled: !isNativeETH && !!address,
    },
  });

  // Read ERC20 balance (non-native tokens)
  const { data: erc20Balance } = useReadContract({
    address: currency as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: !isNativeETH && !!address && !!currencyInput },
  });

  // Read native ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: unichainSepolia.id,
    query: { enabled: isNativeETH && !!address },
  });

  // Approve transaction
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();
  const {
    isLoading: isApproving,
    isSuccess: approveSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Donate transaction
  const {
    writeContract: writeDonate,
    data: donateTxHash,
    error: donateError,
    reset: resetDonate,
  } = useWriteContract();
  const {
    isLoading: isDonating,
    isSuccess: donateSuccess,
  } = useWaitForTransactionReceipt({
    hash: donateTxHash,
  });

  // After approve succeeds, refetch allowance and proceed to donate
  useEffect(() => {
    if (approveSuccess && step === "approving") {
      refetchAllowance();
      setStep("input");
    }
  }, [approveSuccess, step, refetchAllowance]);

  // After donate succeeds, reset step
  useEffect(() => {
    if (donateSuccess && step === "donating") {
      setStep("input");
    }
  }, [donateSuccess, step]);

  // Track errors
  useEffect(() => {
    if (approveError) {
      setErrorMsg(approveError.message?.split("\n")[0] || "Approval failed");
      setStep("input");
    }
  }, [approveError]);

  useEffect(() => {
    if (donateError) {
      setErrorMsg(donateError.message?.split("\n")[0] || "Donation failed");
      setStep("input");
    }
  }, [donateError]);

  // Parse amount safely
  const getParsedAmount = (): bigint | null => {
    try {
      if (!amountInput || parseFloat(amountInput) <= 0) return null;
      return parseEther(amountInput);
    } catch {
      return null;
    }
  };

  // Check if ERC20 needs approval
  const needsApproval = (): boolean => {
    if (isNativeETH) return false;
    const parsed = getParsedAmount();
    if (!parsed) return false;
    if (allowance === undefined) return true;
    return (allowance as bigint) < parsed;
  };

  const handleApprove = () => {
    const parsed = getParsedAmount();
    if (!parsed) return;
    setErrorMsg("");
    resetApprove();
    setStep("approving");

    writeApprove({
      address: currency as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [HOOK_ADDRESS, parsed],
      chainId: unichainSepolia.id,
    });
  };

  const handleDonate = () => {
    const parsed = getParsedAmount();
    if (!parsed) return;
    setErrorMsg("");
    resetDonate();
    setStep("donating");

    if (isNativeETH) {
      writeDonate({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "donate",
        args: [
          poolId,
          "0x0000000000000000000000000000000000000000",
          BigInt(0),
        ],
        value: parsed,
        chainId: unichainSepolia.id,
      });
    } else {
      writeDonate({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "donate",
        args: [poolId, currency, parsed],
        chainId: unichainSepolia.id,
      });
    }
  };

  const hasAmount = amountInput && parseFloat(amountInput) > 0;
  const isEnabled =
    isConnected && registered && hasAmount && poolIdInput && !isApproving && !isDonating;

  const poolContribution = contributorStats?.[0]
    ? formatEther(contributorStats[0] as bigint)
    : "0";
  const globalContribution = contributorStats?.[1]
    ? formatEther(contributorStats[1] as bigint)
    : "0";

  const feePercent =
    currentFeeBps !== undefined ? (Number(currentFeeBps) / 100).toFixed(2) : null;

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
            Donate
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Donate directly to an impact project. Same milestone-gated
            withdrawal rules apply.
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
              onChange={(e) => {
                setPoolIdInput(e.target.value);
                setErrorMsg("");
              }}
              style={inputStyle}
            />
          </div>

          {/* Currency address */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>CURRENCY (TOKEN ADDRESS)</label>
            <input
              type="text"
              placeholder="0x0 for native ETH, or ERC20 address"
              value={currencyInput}
              onChange={(e) => {
                setCurrencyInput(e.target.value);
                setErrorMsg("");
              }}
              style={inputStyle}
            />
            {isNativeETH && currencyInput === "" && (
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Defaults to native ETH
              </div>
            )}
            {address && isNativeETH && ethBalance && (
              <div style={balanceTextStyle}>
                Balance: {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
              </div>
            )}
            {address && !isNativeETH && currencyInput && erc20Balance !== undefined && (
              <div style={balanceTextStyle}>
                Balance: {parseFloat(formatEther(erc20Balance as bigint)).toFixed(4)}
              </div>
            )}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              AMOUNT {isNativeETH ? "(ETH)" : "(TOKEN UNITS)"}
            </label>
            <input
              type="text"
              placeholder="0.1"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setErrorMsg("");
              }}
              style={inputStyle}
            />
          </div>

          {/* Project info display */}
          {registered && poolIdInput && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Recipient</div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {projectRecipient
                    ? `${projectRecipient.slice(0, 6)}...${projectRecipient.slice(-4)}`
                    : "-"}
                </div>
              </div>
              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Milestones</div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {currentMilestone?.toString()}/{milestoneCount?.toString()}{" "}
                  verified
                </div>
              </div>
              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>Current Fee</div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--accent-cyan, var(--text-secondary))" }}
                >
                  {feePercent !== null ? `${feePercent}%` : "-"}
                </div>
              </div>
            </div>
          )}

          {/* Not registered warning */}
          {poolIdInput && poolIdInput.length > 10 && registered === false && (
            <div
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                borderRadius: 2,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444",
                fontSize: 12,
              }}
            >
              No project registered for this Pool ID.
            </div>
          )}

          {/* Your impact stats */}
          {registered && poolIdInput && isConnected && (
            <div
              style={{
                padding: 16,
                borderRadius: 2,
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
                    {poolContribution}
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
                    {globalContribution}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approve button (ERC20 only, when allowance insufficient) */}
          {!isNativeETH && isEnabled && needsApproval() && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              style={{
                ...buttonBaseStyle,
                marginBottom: 10,
                border: "1px solid var(--accent-amber, #fbbf24)",
                background: isApproving
                  ? "var(--bg-elevated)"
                  : "rgba(251,191,36,0.1)",
                color: isApproving
                  ? "var(--text-dim)"
                  : "var(--accent-amber, #fbbf24)",
                cursor: isApproving ? "not-allowed" : "pointer",
              }}
            >
              {isApproving
                ? "Approving..."
                : `Approve ${amountInput} tokens`}
            </button>
          )}

          {/* Donate button */}
          <button
            onClick={handleDonate}
            disabled={
              !isEnabled ||
              (!isNativeETH && needsApproval())
            }
            style={{
              ...buttonBaseStyle,
              border:
                isEnabled && (isNativeETH || !needsApproval())
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border-subtle)",
              background:
                isEnabled && (isNativeETH || !needsApproval())
                  ? "var(--accent)"
                  : "var(--bg-elevated)",
              color:
                isEnabled && (isNativeETH || !needsApproval())
                  ? "#ffffff"
                  : "var(--text-dim)",
              cursor:
                isEnabled && (isNativeETH || !needsApproval())
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {isDonating
              ? "Donating..."
              : !isConnected
                ? "Connect wallet"
                : !registered
                  ? "No project found"
                  : !hasAmount
                    ? "Enter amount"
                    : !isNativeETH && needsApproval()
                      ? "Approve tokens first"
                      : `Donate ${amountInput} ${isNativeETH ? "ETH" : "tokens"}`}
          </button>

          {/* Transaction status: Approving */}
          {isApproving && approveTxHash && (
            <div style={{ ...statusStyle, ...statusPendingStyle }}>
              Approval pending...{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${approveTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                View transaction
              </a>
            </div>
          )}

          {/* Transaction status: Approve success */}
          {approveSuccess && !donateSuccess && (
            <div style={{ ...statusStyle, ...statusSuccessStyle }}>
              Approval confirmed. You can now donate.
            </div>
          )}

          {/* Transaction status: Donating */}
          {isDonating && donateTxHash && (
            <div style={{ ...statusStyle, ...statusPendingStyle }}>
              Donation pending...{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${donateTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                View transaction
              </a>
            </div>
          )}

          {/* Transaction status: Donate success */}
          {donateSuccess && (
            <div style={{ ...statusStyle, ...statusSuccessStyle }}>
              Donation successful!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${donateTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                View transaction
              </a>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div style={{ ...statusStyle, ...statusErrorStyle }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Demo preview when no pool entered */}
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
                borderRadius: 2,
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
                  marginBottom: 6,
                }}
              >
                Example: Clean Water - Chiapas Schools
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Recipient</div>
                  <div
                    className="font-data"
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    0x1a2B...9c4D
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Milestones</div>
                  <div
                    className="font-data"
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    4/4 verified
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Current Fee</div>
                  <div
                    className="font-data"
                    style={{ fontSize: 13, color: "var(--accent-cyan, var(--text-secondary))" }}
                  >
                    3.00%
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 2,
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
                  ...buttonBaseStyle,
                  border: "1px solid rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.08)",
                  color: "var(--text-primary)",
                  cursor: "not-allowed",
                  opacity: 0.6,
                }}
              >
                Donate 0.5 ETH
              </button>
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 2,
                  background: "var(--accent-bg)",
                  border: "1px solid rgba(13,148,136,0.08)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Enter a Pool ID above to donate directly to an impact project.
                For ERC20 tokens, approve the hook contract first.
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
  borderRadius: 2,
  border: "1px solid var(--border-subtle)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const buttonBaseStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 20px",
  borderRadius: 2,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  transition: "all 0.2s",
  fontFamily: "inherit",
};

const infoCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 2,
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

const statusStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 2,
  fontSize: 13,
  textAlign: "center",
};

const statusPendingStyle: React.CSSProperties = {
  background: "rgba(251,191,36,0.06)",
  border: "1px solid rgba(251,191,36,0.15)",
  color: "var(--accent-amber, #fbbf24)",
};

const statusSuccessStyle: React.CSSProperties = {
  background: "rgba(5,150,105,0.06)",
  border: "1px solid rgba(5,150,105,0.12)",
  color: "var(--success)",
};

const statusErrorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
  color: "#ef4444",
};

const linkStyle: React.CSSProperties = {
  color: "#7c3aed",
  textDecoration: "underline",
};

const balanceTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-dim)",
  marginTop: 4,
  fontFamily: "inherit",
};
