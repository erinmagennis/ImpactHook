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

function MilestoneCard({
  poolId,
  poolKey,
  index,
  isVerifier,
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
  projectName: string;
  recipient: string;
  verifier: string;
}) {
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

  // Read stored evidence CID from contract
  const { data: storedEvidence } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestoneEvidence",
    args: [poolId, BigInt(index)],
    chainId: unichainSepolia.id,
  });
  const storedCid = (storedEvidence as string) || "";

  // Read stored Hypercert tx hash from contract
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
  const { writeContract: storeEvidence, data: evidenceHash } = useWriteContract();
  const { isLoading: evidenceStoring, isSuccess: evidenceStored } =
    useWaitForTransactionReceipt({ hash: evidenceHash });

  // Store Hypercert reference onchain after successful mint
  const { writeContract: storeHypercert } = useWriteContract();

  // EAS attestation flow
  const [evidence, setEvidence] = useState("");
  const [evidenceCid, setEvidenceCid] = useState<string | null>(null);
  const { writeContract: createAttestation, data: attestHash } =
    useWriteContract();
  const { isLoading: attestLoading, isSuccess: attestSuccess } =
    useWaitForTransactionReceipt({ hash: attestHash });

  const handleEvidenceUpload = (cid: string, url: string) => {
    setEvidenceCid(cid);
    setEvidence(`ipfs://${cid}`);

    // Store evidence CID onchain
    storeEvidence({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "setMilestoneEvidence",
      args: [poolId, BigInt(index), cid],
      chainId: unichainSepolia.id,
    });
  };

  // Hypercert minting
  const { switchChain } = useSwitchChain();
  const { writeContract: mintHypercert, data: hypercertHash } =
    useWriteContract();
  const { isLoading: hypercertLoading, isSuccess: hypercertSuccess } =
    useWaitForTransactionReceipt({ hash: hypercertHash, chainId: sepolia.id });

  // After Hypercert mint succeeds, store the tx hash onchain on Unichain
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

    // Switch to Sepolia for Hypercert minting
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
            refUID:
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            data: attestationData,
            value: BigInt(0),
          },
        },
      ],
      chainId: unichainSepolia.id,
    });
  };

  return (
    <div
      className={`card ${verified ? '' : ''}`}
      style={{
        padding: 20,
        background: verified
          ? 'rgba(5,150,105,0.04)'
          : 'var(--bg-card)',
        borderColor: verified ? 'rgba(5,150,105,0.12)' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div
              className={verified ? 'milestone-verified' : 'milestone-pending'}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: verified ? 'var(--accent)' : 'var(--text-dim)',
              }}
            >
              {verified ? '\u2713' : index}
            </div>
            <span
              className="font-display"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {description || `Milestone ${index}`}
            </span>
          </div>
          <span
            className="font-data"
            style={{
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            Fee tier: {(Number(feeBps) / 100).toFixed(2)}%
          </span>
          {storedCid && (
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-dim)' }}>
              Evidence:{' '}
              <a
                href={`https://${storedCid}.ipfs.storacha.link`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none' }}
              >
                {storedCid.slice(0, 20)}...
              </a>
            </div>
          )}
        </div>
        <div
          style={{
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: verified ? 'var(--success)' : 'var(--text-dim)',
            background: verified
              ? 'rgba(5,150,105,0.06)'
              : 'var(--bg-elevated)',
            border: `1px solid ${verified ? 'rgba(5,150,105,0.12)' : 'var(--border-subtle)'}`,
          }}
        >
          {verified ? 'Verified' : 'Pending'}
        </div>
      </div>

      {/* Mint Hypercert for verified milestones */}
      {verified && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <EvidenceUpload onUpload={handleEvidenceUpload} />
          {hasHypercert ? (
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                background: 'rgba(249,115,22,0.04)',
                border: '1px solid rgba(249,115,22,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f97316' }}>
                Hypercert Minted
              </span>
              <a
                href={`https://sepolia.etherscan.io/tx/${storedHypercertHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
              >
                View on Etherscan
              </a>
            </div>
          ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleMintHypercert}
              disabled={hypercertLoading || hypercertSuccess}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid rgba(249,115,22,0.2)',
                background: hypercertSuccess
                  ? 'rgba(5,150,105,0.06)'
                  : 'rgba(249,115,22,0.06)',
                color: hypercertSuccess ? 'var(--success)' : '#f97316',
                fontSize: 13,
                fontWeight: 500,
                cursor: hypercertSuccess ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: hypercertLoading ? 0.4 : 1,
              }}
            >
              {hypercertSuccess
                ? 'Hypercert Minted'
                : hypercertLoading
                ? 'Minting...'
                : 'Mint Hypercert'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {hypercertSuccess
                ? 'Impact recorded on Ethereum Sepolia'
                : 'Mint a Hypercert on Ethereum to record this verified impact'}
            </span>
          </div>
          )}
          {hypercertSuccess && hypercertHash && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-dim)',
              }}
            >
              <a
                href={`https://sepolia.etherscan.io/tx/${hypercertHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                View on Etherscan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action buttons for unverified milestones */}
      {!verified && isVerifier && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4, marginBottom: 8 }}>
            Direct: verifier calls directly. EAS: create an attestation with evidence, then call verifyMilestoneEAS() separately.
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <button
              onClick={handleDirectVerify}
              disabled={directLoading}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid rgba(13,148,136,0.2)',
                background: 'rgba(13,148,136,0.06)',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                opacity: directLoading ? 0.4 : 1,
              }}
            >
              {directLoading ? 'Verifying...' : 'Direct Verify'}
            </button>
          </div>

          {/* Upload evidence to Storacha/IPFS */}
          <div style={{ marginBottom: 8 }}>
            <EvidenceUpload onUpload={handleEvidenceUpload} />
          </div>

          {/* EAS attestation */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Evidence (IPFS CID or description)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={handleEASAttest}
              disabled={attestLoading || !evidence}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: `1px solid ${evidence ? 'rgba(124,58,237,0.2)' : 'rgba(13,148,136,0.2)'}`,
                background: evidence
                  ? 'rgba(124,58,237,0.06)'
                  : 'rgba(13,148,136,0.06)',
                color: evidence ? '#7c3aed' : 'var(--accent)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                opacity: (attestLoading || !evidence) ? 0.4 : 1,
              }}
            >
              {attestLoading ? 'Attesting...' : 'EAS Attest'}
            </button>
          </div>

          {directSuccess && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(5,150,105,0.06)',
                border: '1px solid rgba(5,150,105,0.12)',
                color: 'var(--success)',
                fontSize: 12,
              }}
            >
              Milestone verified via direct call
            </div>
          )}
          {attestSuccess && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(5,150,105,0.06)',
                border: '1px solid rgba(5,150,105,0.12)',
                color: 'var(--success)',
                fontSize: 12,
              }}
            >
              EAS attestation created. Call verifyMilestoneEAS() to complete.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MilestonesPage() {
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
  const recipient = projectInfo?.[0] as string || "";
  const verifier = projectInfo?.[1] as string || "";
  const currentFeeBps = projectInfo?.[4];
  const milestoneCount = Number(projectInfo?.[3] || 0);
  const isVerifier =
    isConnected && address?.toLowerCase() === verifier?.toLowerCase();

  const { data: projectMetadata } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectMetadata",
    args: [poolId],
    chainId: unichainSepolia.id,
  });
  const projectName = (projectMetadata?.[0] as string) || "Impact Project";

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navigation />
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Milestones
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            View and verify project milestones via direct call or EAS attestation
          </p>
        </div>

        {/* Pool Key inputs */}
        <div className="animate-fade-up delay-100 card" style={{ padding: 24, marginBottom: 24 }}>
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
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>
            Enter the same token addresses, fee, and tick spacing used when the project was created.
          </div>
          {hasPoolKey && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', wordBreak: 'break-all', marginTop: 12 }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>Pool ID:</span>
              <span className="font-data" style={{ color: 'var(--text-secondary)' }}>{poolId}</span>
            </div>
          )}
          {registered && currentFeeBps !== undefined && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-dim)' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>Current Fee:</span>
              <span className="font-data" style={{ color: 'var(--accent)' }}>{(Number(currentFeeBps) / 100).toFixed(2)}%</span>
            </div>
          )}
        </div>

        {registered ? (
          <div className="animate-fade-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isVerifier && (
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  background: 'rgba(124,58,237,0.05)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  fontSize: 13,
                  color: '#7c3aed',
                  marginBottom: 4,
                }}
              >
                You are the verifier for this pool
              </div>
            )}
            {Array.from({ length: milestoneCount }, (_, i) => (
              <MilestoneCard
                key={i}
                poolId={poolId}
                poolKey={poolKey}
                index={i}
                isVerifier={isVerifier}
                projectName={projectName}
                recipient={recipient}
                verifier={verifier}
              />
            ))}
          </div>
        ) : (
          /* Demo milestones preview */
          <DemoMilestones />
        )}
      </main>
    </div>
  );
}

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

  return (
          <div className="animate-fade-up delay-200" style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'rgba(124,58,237,0.08)',
                color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.15)',
                zIndex: 1,
              }}
            >
              Preview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { desc: "Baseline water testing complete", fee: 0, verified: true },
                { desc: "Purification systems installed in 20 schools", fee: 100, verified: true },
                { desc: "3-month water quality verification", fee: 200, verified: false },
                { desc: "Community management trained", fee: 300, verified: false },
              ].map((m, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: 20,
                    background: m.verified ? 'rgba(5,150,105,0.04)' : 'var(--bg-card)',
                    borderColor: m.verified ? 'rgba(5,150,105,0.12)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div
                          className={m.verified ? 'milestone-verified' : 'milestone-pending'}
                          style={{
                            width: 24, height: 24, borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700,
                            color: m.verified ? 'var(--accent)' : 'var(--text-dim)',
                          }}
                        >
                          {m.verified ? '\u2713' : i}
                        </div>
                        <span className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.desc}
                        </span>
                      </div>
                      <span className="font-data" style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                        Fee tier: {(m.fee / 100).toFixed(2)}%
                      </span>
                    </div>
                    <div
                      style={{
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em',
                        color: m.verified ? 'var(--success)' : 'var(--text-dim)',
                        background: m.verified ? 'rgba(5,150,105,0.06)' : 'var(--bg-elevated)',
                        border: `1px solid ${m.verified ? 'rgba(5,150,105,0.12)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {m.verified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                  {/* Storacha upload + Hypercert mint on demo cards */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <EvidenceUpload onUpload={(cid) => setDemoCids(prev => ({ ...prev, [i]: cid }))} />
                    {m.verified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleDemoMint(m, i)}
                          disabled={!isConnected || (hypercertLoading && mintingIndex === i) || (hypercertSuccess && mintingIndex === i)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: '1px solid rgba(249,115,22,0.2)',
                            background: (hypercertSuccess && mintingIndex === i)
                              ? 'rgba(5,150,105,0.06)'
                              : 'rgba(249,115,22,0.06)',
                            color: (hypercertSuccess && mintingIndex === i) ? 'var(--success)' : '#f97316',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: !isConnected || (hypercertLoading && mintingIndex === i) ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                            opacity: !isConnected || (hypercertLoading && mintingIndex === i) ? 0.4 : 1,
                          }}
                        >
                          {(hypercertSuccess && mintingIndex === i)
                            ? 'Hypercert Minted'
                            : (hypercertLoading && mintingIndex === i)
                            ? 'Minting...'
                            : 'Mint Hypercert'}
                        </button>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          {(hypercertSuccess && mintingIndex === i)
                            ? 'Impact recorded on Ethereum Sepolia'
                            : isConnected
                            ? 'Mint a Hypercert on Ethereum to record this verified impact'
                            : 'Connect wallet to mint impact record on Ethereum'}
                        </span>
                      </div>
                    )}
                    {hypercertSuccess && mintingIndex === i && hypercertHash && (
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${hypercertHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent)', textDecoration: 'none' }}
                        >
                          View on Etherscan
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--accent-bg)',
                border: '1px solid rgba(13,148,136,0.08)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Enter your pool key above to view real milestone data, or connect your wallet to verify milestones.
            </div>
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
