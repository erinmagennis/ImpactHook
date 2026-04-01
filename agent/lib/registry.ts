import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Filecoin Calibration Testnet
export const filecoinCalibration = defineChain({
  id: 314159,
  name: "Filecoin Calibration",
  nativeCurrency: { name: "Test Filecoin", symbol: "tFIL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.calibration.node.glif.io/rpc/v1"] },
  },
  blockExplorers: {
    default: { name: "Filfox", url: "https://calibration.filfox.info" },
  },
  testnet: true,
});

// Will be set after deployment
export const AGENT_REGISTRY_ADDRESS = (process.env.AGENT_REGISTRY_ADDRESS || "") as `0x${string}`;

export const agentRegistryAbi = [
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "name", type: "string" },
      { name: "metadataCid", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateState",
    inputs: [{ name: "stateCid", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordVerification",
    inputs: [
      { name: "poolId", type: "string" },
      { name: "milestoneIndex", type: "uint256" },
      { name: "approved", type: "bool" },
      { name: "reportCid", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "agents",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "operator", type: "address" },
      { name: "name", type: "string" },
      { name: "metadataCid", type: "string" },
      { name: "stateCid", type: "string" },
      { name: "registeredAt", type: "uint256" },
      { name: "verificationsCompleted", type: "uint256" },
      { name: "verificationsApproved", type: "uint256" },
      { name: "lastActive", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApprovalRate",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isActive",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "operator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "metadataCid", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "VerificationRecorded",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "poolId", type: "string", indexed: false },
      { name: "milestoneIndex", type: "uint256", indexed: false },
      { name: "approved", type: "bool", indexed: false },
      { name: "reportCid", type: "string", indexed: false },
    ],
  },
] as const;

export class AgentRegistryClient {
  private publicClient;
  private walletClient;
  private address: `0x${string}`;
  private enabled: boolean;

  constructor() {
    this.enabled = !!AGENT_REGISTRY_ADDRESS;

    const privateKey = process.env.FILECOIN_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
    if (!privateKey || !this.enabled) {
      this.publicClient = null;
      this.walletClient = null;
      this.address = "0x" as `0x${string}`;
      this.enabled = false;
      return;
    }

    const account = privateKeyToAccount(privateKey as Hex);
    this.address = account.address;
    const transport = http();

    this.publicClient = createPublicClient({
      chain: filecoinCalibration,
      transport,
    });

    this.walletClient = createWalletClient({
      chain: filecoinCalibration,
      transport,
      account,
    });
  }

  async register(name: string, metadataCid: string): Promise<string | null> {
    if (!this.enabled || !this.walletClient || !this.publicClient) return null;

    // Check if already registered
    const info = await this.publicClient.readContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: agentRegistryAbi,
      functionName: "agents",
      args: [this.address],
    });

    if (info[4] > 0n) {
      // Already registered (registeredAt > 0)
      return null;
    }

    const hash = await this.walletClient.writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: agentRegistryAbi,
      functionName: "registerAgent",
      args: [name, metadataCid],
    });

    return hash;
  }

  async updateState(stateCid: string): Promise<string | null> {
    if (!this.enabled || !this.walletClient) return null;

    const hash = await this.walletClient.writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: agentRegistryAbi,
      functionName: "updateState",
      args: [stateCid],
    });

    return hash;
  }

  async recordVerification(
    poolId: string,
    milestoneIndex: number,
    approved: boolean,
    reportCid: string
  ): Promise<string | null> {
    if (!this.enabled || !this.walletClient) return null;

    const hash = await this.walletClient.writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: agentRegistryAbi,
      functionName: "recordVerification",
      args: [poolId, BigInt(milestoneIndex), approved, reportCid],
    });

    return hash;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
