import * as Client from "@storacha/client";
import { StoreMemory } from "@storacha/client/stores/memory";
import * as Proof from "@storacha/client/proof";
import { Signer } from "@storacha/client/principal/ed25519";
import type { VerificationResult } from "./analyzer.js";

const STATE_FILE = ".agent-state";

export interface VerificationRecord {
  poolId: string;
  milestoneIndex: number;
  cid: string;
  result: VerificationResult;
  reportCid?: string;
  timestamp: string;
  txHash?: string;
}

export interface ProjectKnowledge {
  poolId: string;
  name: string;
  category: string;
  milestoneDescriptions: string[];
  verificationsCompleted: number[];
  riskFactors: string[];
}

export interface AgentMemoryData {
  agentId: string;
  createdAt: string;
  lastUpdated: string;
  verifications: VerificationRecord[];
  projectKnowledge: Record<string, ProjectKnowledge>;
  processedEvents: string[];
  stats: {
    totalVerifications: number;
    approvalRate: number;
    totalEvidenceAnalyzed: number;
  };
}

export class AgentMemory {
  data: AgentMemoryData;
  private latestCid: string | null = null;

  constructor(agentId: string) {
    this.data = {
      agentId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      verifications: [],
      projectKnowledge: {},
      processedEvents: [],
      stats: {
        totalVerifications: 0,
        approvalRate: 0,
        totalEvidenceAnalyzed: 0,
      },
    };
  }

  hasProcessed(eventKey: string): boolean {
    return this.data.processedEvents.includes(eventKey);
  }

  addVerification(record: VerificationRecord) {
    this.data.verifications.push(record);
    const eventKey = `${record.poolId}-${record.milestoneIndex}-${record.cid}`;
    if (!this.data.processedEvents.includes(eventKey)) {
      this.data.processedEvents.push(eventKey);
    }

    // Update stats
    this.data.stats.totalVerifications++;
    this.data.stats.totalEvidenceAnalyzed++;
    const approved = this.data.verifications.filter(
      (v) => v.result.approved
    ).length;
    this.data.stats.approvalRate = Math.round(
      (approved / this.data.verifications.length) * 100
    );
    this.data.lastUpdated = new Date().toISOString();
  }

  async load(): Promise<void> {
    // Try to load latest CID from local state file
    try {
      const file = Bun.file(STATE_FILE);
      if (await file.exists()) {
        const state = JSON.parse(await file.text());
        this.latestCid = state.memoryCid;
      }
    } catch {
      // No local state, try fresh
      return;
    }

    if (!this.latestCid) return;

    // Fetch from Storacha gateway
    const url = `https://${this.latestCid}.ipfs.storacha.link`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch memory: ${response.status}`);
    }

    this.data = (await response.json()) as AgentMemoryData;
  }

  async save(): Promise<string> {
    const key = process.env.STORACHA_KEY;
    const proof = process.env.STORACHA_PROOF;

    if (!key || !proof) {
      throw new Error("STORACHA_KEY and STORACHA_PROOF must be set for memory persistence");
    }

    const principal = Signer.parse(key);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });
    const parsedProof = await Proof.parse(proof);
    const space = await client.addSpace(parsedProof);
    await client.setCurrentSpace(space.did());

    const blob = new Blob([JSON.stringify(this.data, null, 2)], {
      type: "application/json",
    });
    const file = new File([blob], "agent-memory.json", {
      type: "application/json",
    });

    const cid = await client.uploadFile(file);
    this.latestCid = cid.toString();

    // Save CID reference locally
    await Bun.write(
      STATE_FILE,
      JSON.stringify({ memoryCid: this.latestCid, updatedAt: new Date().toISOString() })
    );

    return this.latestCid;
  }
}
