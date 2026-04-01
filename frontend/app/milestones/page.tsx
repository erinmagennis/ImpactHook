"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { encodeAbiParameters, keccak256 } from "viem";
import { sepolia } from "viem/chains";
import { Navigation } from "../../components/Navigation";
import {
  HOOK_ADDRESS,
  EAS_ADDRESS,
  MILESTONE_SCHEMA_UID,
  impactHookAbi,
  easAbi,
} from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";
import {
  HYPERCERT_MINTER_ADDRESS,
  hypercertMinterAbi,
  TransferRestrictions,
  buildMilestoneHypercertMetadata,
  metadataToDataUri,
} from "../../lib/hypercerts";
import { EvidenceUpload } from "../../components/EvidenceUpload";
import { AgentVerifierBadge } from "../../components/AgentReportViewer";

/* ─────────────────────────────────────────────
   MilestoneCard — single milestone with all actions
   ───────────────────────────────────────────── */
function MilestoneCard({
  poolId,
  poolKey,
  index,
  isVerifier,
  isAgentVerifier,
  projectName,
  recipient,
  verifier,
}: {
  poolId: `0x${string}`;
  poolKey: {
    currency0: `0x${string}`;
    currency1: `0x${string}`;
    fee: number;
    tickSpacing: number;
    hooks: `0x${string}`;
  };
  index: number;
  isVerifier: boolean;
  isAgentVerifier: boolean;
  projectName: string;
  recipient: string;
  verifier: string;
}) {
  // Read milestone data
  const { data: milestone } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestones",
    args: [poolId, BigInt(index)],
    chainId: unichainSepolia.id,
  });

  const description = milestone?.[0] || "";
  const feeBps = milestone?.[1] || 0;
  const verified = milestone?.[2] || false;

  // Read stored evidence CID
  const { data: storedEvidence } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestoneEvidence",
    args: [poolId, BigInt(index)],
    chainId: unichainSepolia.id,
  });
  const storedCid = (storedEvidence as string) || "";

  // Read stored Hypercert tx hash
  const { data: storedHypercertHash } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestoneHypercert",
    args: [poolId, BigInt(index)],
    chainId: unichainSepolia.id,
  });
  const hasHypercert = storedHypercertHash && storedHypercertHash !== "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Direct verification
  const { writeContract: verifyDirect, data: directHash } = useWriteContract();
  const { isLoading: directLoading, isSuccess: directSuccess } =
    useWaitForTransactionReceipt({ hash: directHash });

  // Store evidence onchain
  const { writeContract: storeEvidence } = useWriteContract();

  // Store Hypercert reference onchain
  const { writeContract: storeHypercert } = useWriteContract();

  // EAS attestation
  const [evidence, setEvidence] = useState("");
  const [evidenceCid, setEvidenceCid] = useState<string | null>(null);
  const [attestationUID, setAttestationUID] = useState("");
  const { writeContract: createAttestation, data: attestHash } = useWriteContract();
  const { isLoading: attestLoading, isSuccess: attestSuccess, data: attestReceipt } =
    useWaitForTransactionReceipt({ hash: attestHash });

  // EAS verification completion (step 2: call verifyMilestoneEAS with attestation UID)
  const { writeContract: completeEASVerify, data: easVerifyHash } = useWriteContract();
  const { isLoading: easVerifyLoading, isSuccess: easVerifySuccess } =
    useWaitForTransactionReceipt({ hash: easVerifyHash });

  // Auto-extract attestation UID from receipt and trigger verification
  useEffect(() => {
    if (attestSuccess && attestReceipt && !attestationUID) {
      // The EAS contract emits Attested(address,address,bytes32,bytes32)
      // The attestation UID is in the first log's first topic after the event signature
      const attestedLog = attestReceipt.logs.find(
        (log: any) => log.address.toLowerCase() === EAS_ADDRESS.toLowerCase()
      );
      if (attestedLog && attestedLog.topics.length >= 2) {
        // UID is typically the data or a topic - for EAS the UID is returned as data
        // Actually EAS emits: event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)
        // uid is NOT indexed, so it's in the data field
        const uid = attestedLog.data.slice(0, 66); // first bytes32 from data
        if (uid && uid.startsWith("0x")) {
          setAttestationUID(uid);
          // Auto-call verifyMilestoneEAS
          completeEASVerify({
            address: HOOK_ADDRESS,
            abi: impactHookAbi,
            functionName: "verifyMilestoneEAS",
            args: [poolKey, uid as `0x${string}`],
            chainId: unichainSepolia.id,
          });
        }
      }
    }
  }, [attestSuccess, attestReceipt]);

  const handleEvidenceUpload = (cid: string, url: string) => {
    setEvidenceCid(cid);
    setEvidence(`ipfs://${cid}`);
    storeEvidence({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "setMilestoneEvidence",
      args: [poolId, BigInt(index), cid],
      chainId: unichainSepolia.id,
    });
  };

  // Hypercert minting (on Sepolia)
  const { switchChain } = useSwitchChain();
  const { writeContract: mintHypercert, data: hypercertHash } = useWriteContract();
  const { isLoading: hypercertLoading, isSuccess: hypercertSuccess } =
    useWaitForTransactionReceipt({ hash: hypercertHash, chainId: sepolia.id });

  // After mint succeeds, store tx hash back on Unichain
  useEffect(() => {
    if (hypercertSuccess && hypercertHash && !hasHypercert) {
      switchChain({ chainId: unichainSepolia.id });
      storeHypercert({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "setMilestoneHypercert",
        args: [poolId, BigInt(index), hypercertHash as `0x${string}`],
        chainId: unichainSepolia.id,
      });
    }
  }, [hypercertSuccess]);

  const handleMintHypercert = () => {
    const metadata = buildMilestoneHypercertMetadata({
      projectName,
      milestoneDescription: description,
      milestoneIndex: index,
      poolId,
      recipient,
      verifier,
      evidenceCid: evidenceCid || storedCid || undefined,
    });
    const uri = metadataToDataUri(metadata);
    switchChain({ chainId: sepolia.id });
    mintHypercert({
      address: HYPERCERT_MINTER_ADDRESS,
      abi: hypercertMinterAbi,
      functionName: "mintClaim",
      args: [
        recipient as `0x${string}`,
        BigInt(10000),
        uri,
        TransferRestrictions.AllowAll,
      ],
      chainId: sepolia.id,
    });
  };

  const handleDirectVerify = () => {
    verifyDirect({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "verifyMilestone",
      args: [poolKey, BigInt(index)],
      chainId: unichainSepolia.id,
    });
  };

  const handleEASAttest = () => {
    const attestationData = encodeAbiParameters(
      [
        { type: "bytes32", name: "poolId" },
        { type: "uint256", name: "milestoneIndex" },
        { type: "string", name: "evidence" },
      ],
      [poolId, BigInt(index), evidence]
    );
    createAttestation({
      address: EAS_ADDRESS,
      abi: easAbi,
      functionName: "attest",
      args: [
        {
          schema: MILESTONE_SCHEMA_UID,
          data: {
            recipient: "0x0000000000000000000000000000000000000000",
            expirationTime: BigInt(0),
            revocable: true,
            refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
            data: attestationData,
            value: BigInt(0),
          },
        },
      ],
      chainId: unichainSepolia.id,
    });
  };

  const handleCompleteEASVerify = () => {
    if (!attestationUID || !attestationUID.startsWith("0x")) return;
    completeEASVerify({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "verifyMilestoneEAS",
      args: [poolKey, attestationUID as `0x${string}`],
      chainId: unichainSepolia.id,
    });
  };

  return (
    <div
      className={`card ${verified ? "milestone-verified-card" : ""}`}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              className={`milestone-node ${verified ? "milestone-verified" : "milestone-pending"}`}
              style={{ fontSize: 12, fontWeight: 700, color: verified ? "var(--accent)" : "var(--text-dim)" }}
            >
              {verified ? "\u2713" : index}
            </div>
            <span className="heading-sm" style={{ fontSize: 15 }}>
              {description || `Milestone ${index}`}
            </span>
          </div>
          <div className="font-data text-caption">
            Unlocks {(Number(feeBps) / 100).toFixed(2)}% fee tier
          </div>
          {storedCid && (
            <div className="text-helper" style={{ marginTop: 4 }}>
              Evidence:{" "}
              <a
                href={`https://${storedCid}.ipfs.storacha.link`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                {storedCid.slice(0, 20)}...
              </a>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {verified && isAgentVerifier && <AgentVerifierBadge verifier={verifier} />}
          <span className={`badge ${verified ? "badge-success" : "badge-neutral"}`}>
            {verified ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      {/* Verified: evidence upload + Hypercert */}
      {verified && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 12 }}>
          <EvidenceUpload onUpload={handleEvidenceUpload} />
          {hasHypercert ? (
            <div style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge badge-warning" style={{ fontSize: 12, padding: "2px 10px" }}>Hypercert Minted</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${storedHypercertHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}
              >
                View on Etherscan
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={handleMintHypercert}
                disabled={hypercertLoading || hypercertSuccess}
                className={hypercertSuccess ? "btn-action-teal" : "btn-action-orange"}
              >
                {hypercertSuccess ? "Hypercert Minted" : hypercertLoading ? "Minting..." : "Mint Hypercert"}
              </button>
              <span className="text-caption">
                {hypercertSuccess
                  ? "Impact certificate recorded on Ethereum Sepolia"
                  : "Mint a Hypercert on Ethereum to create a composable, tradeable proof of this verified impact"}
              </span>
            </div>
          )}
          {hypercertSuccess && hypercertHash && (
            <div className="text-caption">
              <a href={`https://sepolia.etherscan.io/tx/${hypercertHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                View on Etherscan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Unverified + verifier: verification actions */}
      {!verified && isVerifier && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <div className="text-helper" style={{ marginBottom: 12 }}>
            Direct: verifier calls verifyMilestone() on Unichain. EAS: create an Ethereum Attestation Service attestation with evidence, then call verifyMilestoneEAS() to complete verification.
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={handleDirectVerify}
              disabled={directLoading}
              className="btn-action-teal"
            >
              {directLoading ? "Verifying..." : "Verify Direct"}
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <EvidenceUpload onUpload={handleEvidenceUpload} />
          </div>

          {/* EAS attestation */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder="Evidence (IPFS CID or description)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleEASAttest}
              disabled={attestLoading || !evidence}
              className="btn-action-violet"
            >
              {attestLoading ? "Attesting..." : "Verify via EAS"}
            </button>
          </div>

          {directSuccess && (
            <div className="status-success">
              Milestone verified via direct call
            </div>
          )}
          {attestSuccess && !easVerifySuccess && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <div className="status-success" style={{ marginTop: 0, marginBottom: 8 }}>
                EAS attestation created.{" "}
                <a href={`https://sepolia.uniscan.xyz/tx/${attestHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>View tx</a>
              </div>
              <div className="text-helper" style={{ marginBottom: 8 }}>
                Step 2: Paste the attestation UID from EAS Explorer, then complete verification onchain.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Attestation UID (0x...)"
                  value={attestationUID}
                  onChange={(e) => setAttestationUID(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleCompleteEASVerify}
                  disabled={easVerifyLoading || !attestationUID.startsWith("0x")}
                  className="btn-action-violet"
                >
                  {easVerifyLoading ? "Verifying..." : "Complete EAS Verify"}
                </button>
              </div>
            </div>
          )}
          {easVerifySuccess && (
            <div className="status-success">
              Milestone verified via EAS attestation
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────── */
export default function MilestonesPage() {
  const { address, isConnected } = useAccount();
  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const [feeInput, setFeeInput] = useState("3000");
  const [tickSpacingInput, setTickSpacingInput] = useState("60");

  // Compute pool ID from pool key
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
  const recipient = projectInfo?.[0] as string || "";
  const verifier = projectInfo?.[1] as string || "";
  const currentFeeBps = projectInfo?.[4];
  const milestoneCount = Number(projectInfo?.[3] || 0);
  const isVerifier =
    isConnected && address?.toLowerCase() === verifier?.toLowerCase();

  const KNOWN_AGENT_ADDRESSES = [
    "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
  ].map((a) => a.toLowerCase());
  const isAgentVerifier =
    !!verifier && KNOWN_AGENT_ADDRESSES.includes(verifier.toLowerCase());

  const { data: projectMetadata } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectMetadata",
    args: [poolId],
    chainId: unichainSepolia.id,
  });
  const projectName = (projectMetadata?.[0] as string) || "Impact Project";

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main className="container-medium" style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 className="heading-page" style={{ marginBottom: 8 }}>Milestones</h1>
          <p className="text-body" style={{ margin: 0 }}>
            View and verify project milestones. Three verification paths: direct call, cross-chain via Reactive Network, and EAS attestations.
          </p>
        </div>

        {/* Pool Key inputs */}
        <div className="card animate-fade-up delay-100" style={{ marginBottom: 24 }}>
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
          <div className="text-helper">
            Enter the same token addresses, fee, and tick spacing used when the project was created.
          </div>
          {hasPoolKey && (
            <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)" }}>
              <span className="text-label" style={{ marginBottom: 0, display: "inline", marginRight: 6 }}>Pool ID:</span>
              <span className="font-data text-caption" style={{ color: "var(--text-secondary)", wordBreak: "break-all" }}>{poolId}</span>
            </div>
          )}
          {registered && currentFeeBps !== undefined && (
            <div style={{ marginTop: 8 }}>
              <span className="text-label" style={{ marginBottom: 0, display: "inline", marginRight: 6 }}>Current Fee:</span>
              <span className="font-data" style={{ fontSize: 13, color: "var(--accent)" }}>{(Number(currentFeeBps) / 100).toFixed(2)}%</span>
            </div>
          )}
        </div>

        {/* Milestones list */}
        {registered ? (
          <div className="animate-fade-up delay-200" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {isVerifier && (
              <div className="badge badge-violet" style={{ padding: "8px 14px", fontSize: 13, width: "fit-content" }}>
                You are the verifier for this pool
              </div>
            )}
            {isAgentVerifier && !isVerifier && (
              <div style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)", fontSize: 13, color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
                <AgentVerifierBadge verifier={verifier} />
                <span>This project is verified by an autonomous AI agent</span>
              </div>
            )}
            {Array.from({ length: milestoneCount }, (_, i) => (
              <MilestoneCard
                key={i}
                poolId={poolId}
                poolKey={poolKey}
                index={i}
                isVerifier={isVerifier}
                isAgentVerifier={isAgentVerifier}
                projectName={projectName}
                recipient={recipient}
                verifier={verifier}
              />
            ))}

            {/* Heartbeat — proof-of-life for active projects */}
            <HeartbeatSection
              poolId={poolId}
              isRecipient={isConnected && address?.toLowerCase() === recipient?.toLowerCase()}
              isVerifier={isVerifier}
            />
          </div>
        ) : (
          <DemoMilestones />
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Heartbeat — proof-of-life for active projects
   ───────────────────────────────────────────── */
function HeartbeatSection({
  poolId,
  isRecipient,
  isVerifier,
}: {
  poolId: `0x${string}`;
  isRecipient: boolean;
  isVerifier: boolean;
}) {
  const canSendHeartbeat = isRecipient || isVerifier;

  const { writeContract: sendHeartbeat, data: heartbeatHash } = useWriteContract();
  const { isLoading: heartbeatLoading, isSuccess: heartbeatSuccess } =
    useWaitForTransactionReceipt({ hash: heartbeatHash });

  const handleHeartbeat = () => {
    sendHeartbeat({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "heartbeat",
      args: [poolId],
      chainId: unichainSepolia.id,
    });
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="heading-sm" style={{ fontSize: 14, marginBottom: 4 }}>Heartbeat</div>
          <div className="text-helper" style={{ marginTop: 0 }}>
            Projects must send periodic proof-of-life. If a project goes silent, fee accumulation stops automatically. Only the recipient or verifier can send a heartbeat.
          </div>
        </div>
        {canSendHeartbeat && (
          <button
            onClick={handleHeartbeat}
            disabled={heartbeatLoading}
            className="btn-action-teal"
            style={{ flexShrink: 0 }}
          >
            {heartbeatSuccess ? "Heartbeat Sent" : heartbeatLoading ? "Sending..." : "Send Heartbeat"}
          </button>
        )}
      </div>
      {heartbeatSuccess && heartbeatHash && (
        <div className="status-success">
          Heartbeat recorded.{" "}
          <a href={`https://sepolia.uniscan.xyz/tx/${heartbeatHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "underline" }}>
            View transaction
          </a>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Demo milestones (shown when no pool registered)
   ───────────────────────────────────────────── */
function DemoMilestones() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [demoCids, setDemoCids] = useState<Record<number, string>>({});

  const { writeContract: mintHypercert, data: hypercertHash } = useWriteContract();
  const { isLoading: hypercertLoading, isSuccess: hypercertSuccess } =
    useWaitForTransactionReceipt({ hash: hypercertHash, chainId: sepolia.id });
  const [mintingIndex, setMintingIndex] = useState<number | null>(null);

  const handleDemoMint = (milestone: { desc: string }, index: number) => {
    setMintingIndex(index);
    const metadata = buildMilestoneHypercertMetadata({
      projectName: "Clean Water Initiative",
      milestoneDescription: milestone.desc,
      milestoneIndex: index,
      poolId: "0xdemo",
      recipient: address || "0x0000000000000000000000000000000000000000",
      verifier: address || "0x0000000000000000000000000000000000000000",
      evidenceCid: demoCids[index] || undefined,
    });
    const uri = metadataToDataUri(metadata);

    if (chainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
    }

    mintHypercert({
      address: HYPERCERT_MINTER_ADDRESS,
      abi: hypercertMinterAbi,
      functionName: "mintClaim",
      args: [
        address as `0x${string}`,
        BigInt(10000),
        uri,
        TransferRestrictions.AllowAll,
      ],
      chainId: sepolia.id,
    });
  };

  const demoMilestones = [
    { desc: "Baseline water testing complete", fee: 0, verified: true },
    { desc: "Purification systems installed in 20 schools", fee: 100, verified: true },
    { desc: "3-month water quality verification", fee: 200, verified: false },
    { desc: "Community management trained", fee: 300, verified: false },
  ];

  return (
    <div className="animate-fade-up delay-200" style={{ position: "relative" }}>
      <span className="badge badge-violet" style={{ marginBottom: 12, display: "inline-flex", fontSize: 11, padding: "2px 10px" }}>
        Preview
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {demoMilestones.map((m, i) => (
          <div
            key={i}
            className={`card ${m.verified ? "milestone-verified-card" : ""}`}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div
                    className={`milestone-node ${m.verified ? "milestone-verified" : "milestone-pending"}`}
                    style={{ fontSize: 12, fontWeight: 700, color: m.verified ? "var(--accent)" : "var(--text-dim)" }}
                  >
                    {m.verified ? "\u2713" : i}
                  </div>
                  <span className="heading-sm" style={{ fontSize: 15 }}>
                    {m.desc}
                  </span>
                </div>
                <div className="font-data text-caption">
                  Unlocks {(m.fee / 100).toFixed(2)}% fee tier
                </div>
              </div>
              <span className={`badge ${m.verified ? "badge-success" : ""}`}
                style={!m.verified ? { background: "var(--bg-elevated)", color: "var(--text-dim)", border: "1px solid var(--border-subtle)" } : {}}
              >
                {m.verified ? "Verified" : "Pending"}
              </span>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 12 }}>
              <EvidenceUpload onUpload={(cid) => setDemoCids(prev => ({ ...prev, [i]: cid }))} />
              {m.verified && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => handleDemoMint(m, i)}
                    disabled={!isConnected || (hypercertLoading && mintingIndex === i) || (hypercertSuccess && mintingIndex === i)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(249,115,22,0.2)",
                      background: (hypercertSuccess && mintingIndex === i) ? "rgba(5,150,105,0.06)" : "rgba(249,115,22,0.06)",
                      color: (hypercertSuccess && mintingIndex === i) ? "var(--success)" : "#f97316",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: (!isConnected || (hypercertLoading && mintingIndex === i)) ? "default" : "pointer",
                      whiteSpace: "nowrap",
                      opacity: (!isConnected || (hypercertLoading && mintingIndex === i)) ? 0.4 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {(hypercertSuccess && mintingIndex === i) ? "Hypercert Minted" : (hypercertLoading && mintingIndex === i) ? "Minting..." : "Mint Hypercert"}
                  </button>
                  <span className="text-caption">
                    {(hypercertSuccess && mintingIndex === i)
                      ? "Impact certificate recorded on Ethereum Sepolia"
                      : isConnected
                      ? "Mint a Hypercert on Ethereum to create a composable proof of this verified impact"
                      : "Connect wallet to mint impact certificate on Ethereum"}
                  </span>
                </div>
              )}
              {hypercertSuccess && mintingIndex === i && hypercertHash && (
                <div className="text-caption">
                  <a href={`https://sepolia.etherscan.io/tx/${hypercertHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    View on Etherscan
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-helper" style={{ marginTop: 16, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-bg)", border: "1px solid rgba(13,148,136,0.08)", textAlign: "center" }}>
        Enter your pool key above to view real milestone data, or connect your wallet to verify milestones.
      </div>
    </div>
  );
}
