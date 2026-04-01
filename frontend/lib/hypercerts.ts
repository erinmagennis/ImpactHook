import { sepolia } from "viem/chains";

export const HYPERCERT_MINTER_ADDRESS = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as const;
export const HYPERCERT_CHAIN = sepolia;

// Minimal ABI for HypercertMinter - mintClaim function
export const hypercertMinterAbi = [
  {
    type: "function",
    name: "mintClaim",
    inputs: [
      { name: "account", type: "address" },
      { name: "units", type: "uint256" },
      { name: "uri_", type: "string" },
      { name: "restrictions", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintClaimWithFractions",
    inputs: [
      { name: "account", type: "address" },
      { name: "units", type: "uint256" },
      { name: "fractions", type: "uint256[]" },
      { name: "uri_", type: "string" },
      { name: "restrictions", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// Transfer restriction enum matching the contract
export enum TransferRestrictions {
  AllowAll = 0,
  DisallowAll = 1,
  FromCreatorOnly = 2,
}

export interface HypercertMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  hypercert: {
    work_scope: { value: string[]; display_value: string };
    impact_scope: { value: string[]; display_value: string };
    work_timeframe: { value: [number, number]; display_value: string };
    impact_timeframe: { value: [number, number]; display_value: string };
    contributors: { value: string[]; display_value: string };
    rights: { value: string[]; display_value: string };
  };
}

export function buildMilestoneHypercertMetadata({
  projectName,
  milestoneDescription,
  milestoneIndex,
  poolId,
  recipient,
  verifier,
  evidenceCid,
}: {
  projectName: string;
  milestoneDescription: string;
  milestoneIndex: number;
  poolId: string;
  recipient: string;
  verifier: string;
  evidenceCid?: string;
}): HypercertMetadata {
  const now = Math.floor(Date.now() / 1000);
  // Work timeframe: from start of 2026 to now (approximate)
  const startOf2026 = 1767225600; // Jan 1 2026

  return {
    name: `${projectName} - Milestone ${milestoneIndex} Verified`,
    description: `Milestone ${milestoneIndex} verified for impact project "${projectName}" on ImpactHook (Uniswap v4). ${milestoneDescription}. Pool ID: ${poolId}${evidenceCid ? `. Evidence: ipfs://${evidenceCid}` : ""}`,
    image: evidenceCid ? `ipfs://${evidenceCid}` : "",
    external_url: "https://impacthook.vercel.app",
    hypercert: {
      work_scope: {
        value: ["Public goods funding", "DeSci", projectName, milestoneDescription],
        display_value: `${projectName}: ${milestoneDescription}`,
      },
      impact_scope: {
        value: ["Public goods", "Impact funding", "DeFi for good"],
        display_value: "Public goods funding via DeFi",
      },
      work_timeframe: {
        value: [startOf2026, now],
        display_value: "2026",
      },
      impact_timeframe: {
        value: [startOf2026, now + 365 * 24 * 60 * 60],
        display_value: "2026-2027",
      },
      contributors: {
        value: [recipient, verifier],
        display_value: `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      },
      rights: {
        value: ["Public display"],
        display_value: "Public display",
      },
    },
  };
}

// Encode metadata as a data URI for onchain storage (no IPFS dependency needed)
export function metadataToDataUri(metadata: HypercertMetadata): string {
  const json = JSON.stringify(metadata);
  const base64 = btoa(json);
  return `data:application/json;base64,${base64}`;
}
