"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodePacked, encodeAbiParameters, keccak256 } from "viem";
import { Navigation } from "../../components/Navigation";
import {
  HOOK_ADDRESS,
  EAS_ADDRESS,
  MILESTONE_SCHEMA_UID,
  impactHookAbi,
  easAbi,
} from "../../lib/contracts";
import { unichainSepolia } from "../../lib/chains";

// Placeholder - in production this comes from pool registration
const DEMO_POOL_KEY = {
  currency0: "0x0000000000000000000000000000000000000000" as const,
  currency1: "0x0000000000000000000000000000000000000000" as const,
  fee: 3000,
  tickSpacing: 60,
  hooks: HOOK_ADDRESS,
};

function MilestoneCard({
  poolId,
  index,
  isVerifier,
}: {
  poolId: `0x${string}`;
  index: number;
  isVerifier: boolean;
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

  // Direct verification
  const { writeContract: verifyDirect, data: directHash } = useWriteContract();
  const { isLoading: directLoading, isSuccess: directSuccess } =
    useWaitForTransactionReceipt({ hash: directHash });

  // EAS attestation flow
  const [evidence, setEvidence] = useState("");
  const { writeContract: createAttestation, data: attestHash } =
    useWriteContract();
  const { isLoading: attestLoading, isSuccess: attestSuccess } =
    useWaitForTransactionReceipt({ hash: attestHash });

  const handleDirectVerify = () => {
    verifyDirect({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "verifyMilestone",
      args: [DEMO_POOL_KEY, BigInt(index)],
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
            Fee tier: {feeBps} bps
          </span>
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

      {/* Action buttons for unverified milestones */}
      {!verified && isVerifier && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
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
  const [poolIdInput, setPoolIdInput] = useState("");
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
  const verifier = projectInfo?.[1];
  const milestoneCount = Number(projectInfo?.[3] || 0);
  const isVerifier =
    isConnected && address?.toLowerCase() === verifier?.toLowerCase();

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

        {/* Pool ID input */}
        <div className="animate-fade-up delay-100" style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 11,
              color: 'var(--text-dim)',
              display: 'block',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Pool ID
          </label>
          <input
            type="text"
            placeholder="0x8aacd18e0dedc2317591fd43b6bd25d5ee9268950181bb6b34a5550b06b215db"
            value={poolIdInput}
            onChange={(e) => setPoolIdInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
            }}
          />
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
                index={i}
                isVerifier={isVerifier}
              />
            ))}
          </div>
        ) : (
          /* Demo milestones preview */
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
                        Fee tier: {m.fee} bps
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
              Enter a Pool ID above to view real milestone data, or connect your wallet to verify milestones.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
