import index from "./dashboard.html";

// Shared state file that the agent writes to
const STATE_FILE = ".agent-dashboard-state.json";

interface DashboardState {
  running: boolean;
  wallet: string;
  mode: string;
  assignedPools: number;
  registry: string;
  stats: {
    totalVerifications: number;
    approvalRate: number;
    totalEvidenceAnalyzed: number;
  };
  verifications: Array<{
    poolId: string;
    milestoneIndex: number;
    cid: string;
    result: { approved: boolean; confidence: number; reasoning: string };
    reportCid?: string;
    timestamp: string;
  }>;
  logs: Array<{
    timestamp: string;
    action: string;
    details: Record<string, unknown>;
  }>;
}

async function getState(): Promise<DashboardState> {
  try {
    const file = Bun.file(STATE_FILE);
    if (await file.exists()) {
      return JSON.parse(await file.text());
    }
  } catch {}

  // Try reading from agent memory file
  try {
    const stateFile = Bun.file(".agent-state");
    if (await stateFile.exists()) {
      const state = JSON.parse(await stateFile.text());
      // Fetch memory from Storacha if we have a CID
      if (state.memoryCid) {
        const res = await fetch(
          `https://${state.memoryCid}.ipfs.storacha.link`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const memory = await res.json();
          return {
            running: false,
            wallet: memory.agentId || "--",
            mode: "unknown",
            assignedPools: 0,
            registry: "Unknown",
            stats: memory.stats || { totalVerifications: 0, approvalRate: 0, totalEvidenceAnalyzed: 0 },
            verifications: memory.verifications || [],
            logs: [],
          };
        }
      }
    }
  } catch {}

  return {
    running: false,
    wallet: "--",
    mode: "--",
    assignedPools: 0,
    registry: "Not configured",
    stats: { totalVerifications: 0, approvalRate: 0, totalEvidenceAnalyzed: 0 },
    verifications: [],
    logs: [],
  };
}

const PORT = parseInt(process.env.DASHBOARD_PORT || "3456");

Bun.serve({
  port: PORT,
  routes: {
    "/": index,
    "/api/status": {
      async GET() {
        const state = await getState();
        return Response.json(state);
      },
    },
  },
});

console.log(`Agent Dashboard running at http://localhost:${PORT}`);
