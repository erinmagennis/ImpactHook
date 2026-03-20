"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, parseUnits, formatEther } from "viem";
import { Navigation } from "../../components/Navigation";
import { HOOK_ADDRESS, impactHookAbi } from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

export default function DonatePage() {
  const { address, isConnected } = useAccount();
  const [poolIdInput, setPoolIdInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const poolId = (poolIdInput ||
    "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;
  const currency = (currencyInput ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const isNativeETH =
    !currencyInput ||
    currencyInput === "0x0000000000000000000000000000000000000000" ||
    currencyInput === "0x0";

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

  const { data: contributorStats } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getContributorStats",
    args: [address || "0x0000000000000000000000000000000000000000", poolId],
    chainId: unichainSepolia.id,
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleDonate = () => {
    let amount: bigint;
    try {
      amount = parseEther(amountInput);
    } catch {
      return;
    }

    if (isNativeETH) {
      writeContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "donate",
        args: [
          poolId,
          "0x0000000000000000000000000000000000000000",
          BigInt(0),
        ],
        value: amount,
        chainId: unichainSepolia.id,
      });
    } else {
      writeContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "donate",
        args: [poolId, currency, amount],
        chainId: unichainSepolia.id,
      });
    }
  };

  const hasAmount = amountInput && parseFloat(amountInput) > 0;
  const isEnabled =
    isConnected && registered && hasAmount && poolIdInput && !isLoading;

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
              onChange={(e) => setPoolIdInput(e.target.value)}
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
              onChange={(e) => setCurrencyInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>AMOUNT</label>
            <input
              type="text"
              placeholder="0.1"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Project info display */}
          {registered && poolIdInput && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  Recipient
                </div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {projectRecipient
                    ? `${projectRecipient.slice(0, 8)}...${projectRecipient.slice(-6)}`
                    : "-"}
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  Milestones
                </div>
                <div
                  className="font-data"
                  style={{ fontSize: 13, color: "var(--text-secondary)" }}
                >
                  {currentMilestone?.toString()}/{milestoneCount?.toString()}{" "}
                  verified
                </div>
              </div>
            </div>
          )}

          {/* Your impact stats */}
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

          {/* Donate button */}
          <button
            onClick={handleDonate}
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
              ? "Donating..."
              : !isConnected
                ? "Connect wallet"
                : !registered
                  ? "No project found"
                  : !hasAmount
                    ? "Enter amount"
                    : `Donate ${amountInput} ${isNativeETH ? "ETH" : "tokens"}`}
          </button>

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
              Donation successful!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#7c3aed",
                  textDecoration: "underline",
                }}
              >
                View transaction
              </a>
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
                  marginBottom: 6,
                }}
              >
                Example: Clean Water - Chiapas Schools
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}
                  >
                    Recipient
                  </div>
                  <div
                    className="font-data"
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    0x1a2B...9c4D
                  </div>
                </div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}
                  >
                    Milestones
                  </div>
                  <div
                    className="font-data"
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    4/4 verified
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
                Donate 0.5 ETH
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
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
