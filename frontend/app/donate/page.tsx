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
import { ProjectSelector } from "../../components/ProjectSelector";
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

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: currency as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      HOOK_ADDRESS,
    ],
    chainId: unichainSepolia.id,
    query: { enabled: !isNativeETH && !!address },
  });

  const { data: erc20Balance } = useReadContract({
    address: currency as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    chainId: unichainSepolia.id,
    query: { enabled: !isNativeETH && !!address && !!currencyInput },
  });

  const { data: ethBalance } = useBalance({
    address: address,
    chainId: unichainSepolia.id,
    query: { enabled: isNativeETH && !!address },
  });

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  const {
    writeContract: writeDonate,
    data: donateTxHash,
    error: donateError,
    reset: resetDonate,
  } = useWriteContract();
  const { isLoading: isDonating, isSuccess: donateSuccess } =
    useWaitForTransactionReceipt({ hash: donateTxHash });

  useEffect(() => {
    if (approveSuccess && step === "approving") {
      refetchAllowance();
      setStep("input");
    }
  }, [approveSuccess, step, refetchAllowance]);

  useEffect(() => {
    if (donateSuccess && step === "donating") {
      setStep("input");
    }
  }, [donateSuccess, step]);

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

  const getParsedAmount = (): bigint | null => {
    try {
      if (!amountInput || parseFloat(amountInput) <= 0) return null;
      return parseEther(amountInput);
    } catch {
      return null;
    }
  };

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
        args: [poolId, "0x0000000000000000000000000000000000000000", BigInt(0)],
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
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-narrow" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Donate</h1>
          <p className="text-body" style={{ margin: 0 }}>
            Send tokens directly to an impact project. Same milestone-gating rules apply: funding only unlocks as milestones are verified onchain.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Pool ID */}
          <div style={{ marginBottom: 20 }}>
            <ProjectSelector value={poolIdInput} onChange={setPoolIdInput} />
          </div>

          {/* Currency address */}
          <div style={{ marginBottom: 20 }}>
            <label className="text-label">Currency (token address)</label>
            <input
              type="text"
              className="input"
              placeholder="0x0 for native ETH, or ERC20 address"
              value={currencyInput}
              onChange={(e) => { setCurrencyInput(e.target.value); setErrorMsg(""); }}
            />
            {isNativeETH && currencyInput === "" && (
              <div className="text-helper">Defaults to native ETH</div>
            )}
            {address && isNativeETH && ethBalance && (
              <div className="text-helper">
                Balance: {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
              </div>
            )}
            {address && !isNativeETH && currencyInput && erc20Balance !== undefined && (
              <div className="text-helper">
                Balance: {parseFloat(formatEther(erc20Balance as bigint)).toFixed(4)}
              </div>
            )}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label className="text-label">
              Amount {isNativeETH ? "(ETH)" : "(token units)"}
            </label>
            <input
              type="text"
              className="input"
              placeholder="0.1"
              value={amountInput}
              onChange={(e) => { setAmountInput(e.target.value); setErrorMsg(""); }}
            />
          </div>

          {/* Project info */}
          {registered && poolIdInput && (
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label" style={{ marginBottom: 4 }}>Recipient</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {projectRecipient ? `${projectRecipient.slice(0, 6)}...${projectRecipient.slice(-4)}` : "-"}
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label" style={{ marginBottom: 4 }}>Milestones</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {currentMilestone?.toString()}/{milestoneCount?.toString()} verified
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="text-label" style={{ marginBottom: 4 }}>Current Fee</div>
                <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {feePercent !== null ? `${feePercent}%` : "-"}
                </div>
              </div>
            </div>
          )}

          {/* Not registered warning */}
          {poolIdInput && poolIdInput.length > 10 && registered === false && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <span className="status-error" style={{ marginTop: 0 }}>No project registered for this Pool ID.</span>
            </div>
          )}

          {/* Impact stats */}
          {registered && poolIdInput && isConnected && (
            <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", marginBottom: 20 }}>
              <div className="text-superhead" style={{ marginBottom: 10 }}>Your Impact</div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="text-caption" style={{ marginBottom: 2 }}>This pool</div>
                  <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                    {poolContribution}
                  </div>
                </div>
                <div>
                  <div className="text-caption" style={{ marginBottom: 2 }}>All pools</div>
                  <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                    {globalContribution}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approve button */}
          {!isNativeETH && isEnabled && needsApproval() && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn-form"
              style={{ marginBottom: 8, background: "rgba(245,158,11,0.08)", border: "1px solid var(--warning)", color: "var(--warning)" }}
            >
              {isApproving ? "Approving..." : `Approve ${amountInput} tokens`}
            </button>
          )}

          {/* Donate button */}
          <button
            onClick={handleDonate}
            disabled={!isEnabled || (!isNativeETH && needsApproval())}
            className="btn-form"
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

          {/* Transaction statuses */}
          {isApproving && approveTxHash && (
            <div className="status-pending">
              Approval pending...{" "}
              <a href={`https://sepolia.uniscan.xyz/tx/${approveTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                View transaction
              </a>
            </div>
          )}

          {approveSuccess && !donateSuccess && (
            <div className="status-success">
              Approval confirmed. You can now donate.
            </div>
          )}

          {isDonating && donateTxHash && (
            <div className="status-pending">
              Donation pending...{" "}
              <a href={`https://sepolia.uniscan.xyz/tx/${donateTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                View transaction
              </a>
            </div>
          )}

          {donateSuccess && (
            <div className="status-success">
              Donation successful!{" "}
              <a href={`https://sepolia.uniscan.xyz/tx/${donateTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                View transaction
              </a>
            </div>
          )}

          {errorMsg && (
            <div className="status-error">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Demo preview */}
        {!poolIdInput && (
          <div className="animate-fade-up delay-200" style={{ marginTop: 24, position: "relative" }}>
            <div className="card" style={{ padding: 32, position: "relative" }}>
              <span className="badge badge-violet" style={{ position: "absolute", top: 16, right: 16, fontSize: 11, padding: "2px 10px" }}>
                Preview
              </span>
              <div className="text-label" style={{ marginBottom: 12 }}>
                Example: Clean Water - Chiapas Schools
              </div>
              <div className="grid-3" style={{ marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>Recipient</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>0x1a2B...9c4D</div>
                </div>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>Milestones</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>4/4 verified</div>
                </div>
                <div style={{ padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="text-label" style={{ marginBottom: 4 }}>Current Fee</div>
                  <div className="font-data" style={{ fontSize: 13, color: "var(--text-secondary)" }}>3.00%</div>
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: "var(--radius-btn)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", marginBottom: 16 }}>
                <div className="text-superhead" style={{ marginBottom: 8 }}>Your Impact</div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <div className="text-caption" style={{ marginBottom: 2 }}>This pool</div>
                    <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>0.847</div>
                  </div>
                  <div>
                    <div className="text-caption" style={{ marginBottom: 2 }}>All pools</div>
                    <div className="font-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>2.134</div>
                  </div>
                </div>
              </div>

              <button disabled className="btn-form" style={{ opacity: 0.5 }}>
                Donate 0.5 ETH
              </button>

              <div className="text-helper" style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", textAlign: "center" }}>
                Enter a Pool ID above to donate directly to an impact project. For ERC20 tokens, approve the hook contract first.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
