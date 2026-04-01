import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  type Hex,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Unichain Sepolia
export const unichainSepolia = defineChain({
  id: 1301,
  name: "Unichain Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.UNICHAIN_RPC_URL || "https://sepolia.unichain.org"] },
  },
  blockExplorers: {
    default: { name: "Uniscan", url: "https://sepolia.uniscan.xyz" },
  },
  testnet: true,
});

// Deployed contract addresses
export const HOOK_ADDRESS = "0xD178A9caEB1AA3EB89363E035e288433CD002557" as const;
export const ARBITER_ADDRESS = "0xEf78e662F587C3193dfD22853dd039F258C6537A" as const;

// ABI for the functions/events the agent needs
export const impactHookAbi = [
  // Read: project info
  {
    type: "function",
    name: "getProjectInfo",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "recipient", type: "address" },
      { name: "verifier", type: "address" },
      { name: "currentMilestone", type: "uint256" },
      { name: "milestoneCount", type: "uint256" },
      { name: "currentFeeBps", type: "uint16" },
      { name: "registered", type: "bool" },
    ],
    stateMutability: "view",
  },
  // Read: milestone details
  {
    type: "function",
    name: "milestones",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "description", type: "string" },
      { name: "projectFeeBps", type: "uint16" },
      { name: "verified", type: "bool" },
    ],
    stateMutability: "view",
  },
  // Read: evidence CID
  {
    type: "function",
    name: "milestoneEvidence",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  // Read: verification status
  {
    type: "function",
    name: "isMilestoneVerified",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "milestoneIndex", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  // Read: project metadata
  {
    type: "function",
    name: "getProjectMetadata",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
    ],
    stateMutability: "view",
  },
  // Read: pool discovery
  {
    type: "function",
    name: "getRegisteredPoolCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegisteredPool",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  // Write: verify milestone
  {
    type: "function",
    name: "verifyMilestone",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "milestoneIndex", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Event: evidence attached (agent monitors this)
  {
    type: "event",
    name: "EvidenceAttached",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "milestoneIndex", type: "uint256", indexed: true },
      { name: "cid", type: "string", indexed: false },
    ],
  },
  // Event: milestone verified
  {
    type: "event",
    name: "MilestoneVerified",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "milestoneIndex", type: "uint256", indexed: false },
      { name: "newFeeBps", type: "uint16", indexed: false },
    ],
  },
  // Event: project registered
  {
    type: "event",
    name: "ProjectRegistered",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "verifier", type: "address", indexed: false },
      { name: "milestoneCount", type: "uint256", indexed: false },
    ],
  },
] as const;

// Pool key type (matches Uniswap v4 PoolKey)
export interface PoolKey {
  currency0: Hex;
  currency1: Hex;
  fee: number;
  tickSpacing: number;
  hooks: Hex;
}

export function createClients() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY must be set");
  }

  const account = privateKeyToAccount(privateKey as Hex);
  const transport = http();

  const publicClient = createPublicClient({
    chain: unichainSepolia,
    transport,
  });

  const walletClient = createWalletClient({
    chain: unichainSepolia,
    transport,
    account,
  });

  return { publicClient, walletClient, account };
}
