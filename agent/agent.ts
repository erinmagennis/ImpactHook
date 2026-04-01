import { type Hex } from "viem";
import {
  createClients,
  impactHookAbi,
  HOOK_ADDRESS,
  type PoolKey,
} from "./lib/chain.js";
import { fetchEvidence } from "./lib/evidence.js";
import { analyzeEvidence, type VerificationResult } from "./lib/analyzer.js";
import { AgentLogger } from "./lib/logger.js";
import { AgentMemory } from "./lib/memory.js";
import { storeReport, type VerificationReport } from "./lib/reporter.js";
import { AgentRegistryClient } from "./lib/registry.js";

// --- Configuration ---
const DRY_RUN = process.argv.includes("--dry-run");
const CONFIDENCE_THRESHOLD = 70; // Minimum confidence to auto-verify
const POLL_INTERVAL = 10_000; // 10s between poll cycles

// --- State ---
const processedEvents = new Set<string>();
let logger: AgentLogger;
let memory: AgentMemory;
let registry: AgentRegistryClient;

// --- Main ---
async function main() {
  console.log("=================================================");
  console.log("  ImpactHook Accountability Agent");
  console.log("  Mode:", DRY_RUN ? "DRY RUN (no onchain txs)" : "LIVE");
  console.log("=================================================\n");

  const { publicClient, walletClient, account } = createClients();
  console.log(`Agent wallet: ${account.address}`);

  logger = new AgentLogger(account.address);
  memory = new AgentMemory(account.address);

  // Load persistent memory from Storacha
  try {
    await memory.load();
    console.log(
      `Loaded memory: ${memory.data.stats.totalVerifications} past verifications`
    );
    logger.log("memory_loaded", {
      verifications: memory.data.stats.totalVerifications,
    });
  } catch {
    console.log("No existing memory found, starting fresh");
    logger.log("memory_fresh", {});
  }

  // Register with AgentRegistry on Filecoin Calibration
  registry = new AgentRegistryClient();
  if (registry.isEnabled()) {
    try {
      const regTx = await registry.register(
        "ImpactAccountabilityAgent",
        "" // metadataCid - set after agent.json is uploaded to Filecoin
      );
      if (regTx) {
        console.log(`Registered on AgentRegistry: ${regTx}`);
        logger.log("registry_registered", { txHash: regTx });
      } else {
        console.log("Already registered on AgentRegistry");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`AgentRegistry registration skipped: ${msg}`);
    }
  } else {
    console.log("AgentRegistry not configured (set AGENT_REGISTRY_ADDRESS)");
  }

  // Discover registered projects
  const poolCount = await publicClient.readContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getRegisteredPoolCount",
  });
  console.log(`\nFound ${poolCount} registered pools`);

  // Check which pools have this agent as verifier
  const agentPools: Hex[] = [];
  for (let i = 0; i < Number(poolCount); i++) {
    const poolId = await publicClient.readContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "getRegisteredPool",
      args: [BigInt(i)],
    });

    const [, verifier, , , , registered] = await publicClient.readContract({
      address: HOOK_ADDRESS,
      abi: impactHookAbi,
      functionName: "getProjectInfo",
      args: [poolId],
    });

    if (
      registered &&
      verifier.toLowerCase() === account.address.toLowerCase()
    ) {
      agentPools.push(poolId);
      const [name, category] = await publicClient.readContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "getProjectMetadata",
        args: [poolId],
      });
      console.log(`  Assigned to verify: "${name}" [${category}] (${poolId.slice(0, 10)}...)`);
    }
  }

  if (agentPools.length === 0) {
    console.log(
      "\nNo pools assigned to this agent as verifier."
    );
    console.log(
      "Register a project with this agent's address as verifier, or use --dry-run to monitor all pools.\n"
    );
    if (!DRY_RUN) {
      process.exit(1);
    }
  }

  console.log("\nWatching for EvidenceAttached events...\n");
  logger.log("agent_started", {
    mode: DRY_RUN ? "dry-run" : "live",
    assignedPools: agentPools.length,
    wallet: account.address,
  });

  // Set dashboard metadata and write initial state
  setAgentMeta({
    wallet: account.address,
    mode: DRY_RUN ? "dry-run" : "live",
    assignedPools: agentPools.length,
    registryEnabled: registry.isEnabled(),
  });
  await writeDashboardState();

  // Start event polling loop
  let lastBlock = await publicClient.getBlockNumber();

  // Check for any existing evidence we haven't processed
  await scanExistingEvidence(publicClient, agentPools, account.address);

  while (true) {
    try {
      const currentBlock = await publicClient.getBlockNumber();

      if (currentBlock > lastBlock) {
        const logs = await publicClient.getContractEvents({
          address: HOOK_ADDRESS,
          abi: impactHookAbi,
          eventName: "EvidenceAttached",
          fromBlock: lastBlock + 1n,
          toBlock: currentBlock,
        });

        for (const log of logs) {
          await handleEvidenceEvent(
            log,
            publicClient,
            walletClient,
            account.address,
            agentPools
          );
        }

        lastBlock = currentBlock;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Poll error: ${msg}`);
      logger.log("error", { phase: "polling", error: msg });
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

// --- Scan existing evidence on startup ---
async function scanExistingEvidence(
  publicClient: any,
  agentPools: Hex[],
  agentAddress: string
) {
  const poolsToScan = DRY_RUN
    ? await getAllPools(publicClient)
    : agentPools;

  for (const poolId of poolsToScan) {
    const [, , currentMilestone, milestoneCount] =
      await publicClient.readContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "getProjectInfo",
        args: [poolId],
      });

    for (let i = 0; i < Number(milestoneCount); i++) {
      const [, , verified] = await publicClient.readContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "milestones",
        args: [poolId, BigInt(i)],
      });

      if (verified) continue;

      const cid = await publicClient.readContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "milestoneEvidence",
        args: [poolId, BigInt(i)],
      });

      if (cid && cid !== "") {
        const eventKey = `${poolId}-${i}-${cid}`;
        if (!processedEvents.has(eventKey) && !memory.hasProcessed(eventKey)) {
          console.log(
            `Found unprocessed evidence: pool ${poolId.slice(0, 10)}... milestone #${i}`
          );
          // Create a synthetic log-like object for processing
          await processEvidence(
            poolId,
            BigInt(i),
            cid,
            publicClient,
            null, // no wallet client in scan mode if dry-run
            agentAddress,
            agentPools
          );
        }
      }
    }
  }
}

async function getAllPools(publicClient: any): Promise<Hex[]> {
  const count = await publicClient.readContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getRegisteredPoolCount",
  });
  const pools: Hex[] = [];
  for (let i = 0; i < Number(count); i++) {
    pools.push(
      await publicClient.readContract({
        address: HOOK_ADDRESS,
        abi: impactHookAbi,
        functionName: "getRegisteredPool",
        args: [BigInt(i)],
      })
    );
  }
  return pools;
}

// --- Handle evidence event ---
async function handleEvidenceEvent(
  log: any,
  publicClient: any,
  walletClient: any,
  agentAddress: string,
  agentPools: Hex[]
) {
  const poolId = log.args.poolId as Hex;
  const milestoneIndex = log.args.milestoneIndex as bigint;
  const cid = log.args.cid as string;

  await processEvidence(
    poolId,
    milestoneIndex,
    cid,
    publicClient,
    walletClient,
    agentAddress,
    agentPools
  );
}

async function processEvidence(
  poolId: Hex,
  milestoneIndex: bigint,
  cid: string,
  publicClient: any,
  walletClient: any,
  agentAddress: string,
  agentPools: Hex[]
) {
  const eventKey = `${poolId}-${Number(milestoneIndex)}-${cid}`;
  if (processedEvents.has(eventKey)) return;
  processedEvents.add(eventKey);

  const isAssigned =
    DRY_RUN ||
    agentPools.some((p) => p.toLowerCase() === poolId.toLowerCase());

  console.log("\n--- New Evidence Detected ---");
  console.log(`Pool:      ${poolId.slice(0, 18)}...`);
  console.log(`Milestone: #${milestoneIndex}`);
  console.log(`CID:       ${cid}`);
  console.log(`Assigned:  ${isAssigned ? "yes" : "no (monitoring only)"}`);

  logger.log("event_detected", {
    poolId,
    milestoneIndex: Number(milestoneIndex),
    cid,
    assigned: isAssigned,
  });

  // 1. Fetch project context
  const [name, category] = await publicClient.readContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getProjectMetadata",
    args: [poolId],
  });

  const [description] = await publicClient.readContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "milestones",
    args: [poolId, milestoneIndex],
  });

  console.log(`Project:   "${name}" [${category}]`);
  console.log(`Criteria:  "${description}"`);

  // 2. Fetch evidence from IPFS/Storacha
  console.log("\nFetching evidence...");
  const startFetch = Date.now();
  let evidence;
  try {
    evidence = await fetchEvidence(cid);
    console.log(
      `  Retrieved: ${evidence.mimeType} (${(evidence.size / 1024).toFixed(1)} KB) in ${Date.now() - startFetch}ms`
    );
    logger.log("evidence_fetched", {
      cid,
      mimeType: evidence.mimeType,
      size: evidence.size,
    }, Date.now() - startFetch);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  Failed to fetch evidence: ${msg}`);
    logger.log("error", { phase: "fetch", cid, error: msg });
    return;
  }

  // 3. Analyze with Claude
  console.log("Analyzing evidence with Claude...");
  const startAnalysis = Date.now();
  let result: VerificationResult;
  try {
    result = await analyzeEvidence({
      milestoneDescription: description,
      evidence: evidence.content,
      mimeType: evidence.mimeType,
      projectName: name,
      projectCategory: category,
      milestoneIndex: Number(milestoneIndex),
    });
    console.log(`  Analysis complete in ${Date.now() - startAnalysis}ms`);
    console.log(`  Decision:   ${result.approved ? "APPROVED" : "REJECTED"}`);
    console.log(`  Confidence: ${result.confidence}%`);
    console.log(`  Reasoning:  ${result.reasoning}`);
    for (const c of result.criteriaMatch) {
      console.log(`    ${c.met ? "[x]" : "[ ]"} ${c.criterion}: ${c.notes}`);
    }
    logger.log("analysis_complete", {
      approved: result.approved,
      confidence: result.confidence,
    }, Date.now() - startAnalysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  Analysis failed: ${msg}`);
    logger.log("error", { phase: "analysis", error: msg });
    return;
  }

  // 4. Store verification report on Filecoin
  let reportCid: string | undefined;
  try {
    const report: VerificationReport = {
      version: "1.0",
      agentId: agentAddress,
      timestamp: new Date().toISOString(),
      project: { poolId, name, category },
      milestone: { index: Number(milestoneIndex), description },
      evidence: { cid, type: evidence.mimeType, size: evidence.size },
      analysis: result,
      decision: result.approved && result.confidence >= CONFIDENCE_THRESHOLD
        ? "approved"
        : result.approved
          ? "deferred"
          : "rejected",
    };

    console.log("\nStoring verification report on Filecoin...");
    reportCid = await storeReport(report);
    console.log(`  Report CID: ${reportCid}`);
    logger.log("report_stored", { reportCid, storage: "filecoin" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  Report storage skipped: ${msg}`);
    logger.log("error", { phase: "report_storage", error: msg });
  }

  // 5. Submit verification tx (if live mode, assigned, approved, and confident)
  if (
    !DRY_RUN &&
    isAssigned &&
    walletClient &&
    result.approved &&
    result.confidence >= CONFIDENCE_THRESHOLD
  ) {
    console.log("\nSubmitting verification transaction...");
    try {
      // We need the pool key to call verifyMilestone
      // For now, we'll need to reconstruct it or have it stored
      // The agent can't derive the pool key from poolId alone without
      // additional data. This is a known limitation - in production,
      // the agent would index ProjectRegistered events to cache pool keys.
      console.log(
        "  Note: Pool key reconstruction needed. Use --pool-key flag or index ProjectRegistered events."
      );
      console.log("  Skipping onchain verification (pool key not available).");
      logger.log("tx_skipped", {
        reason: "pool_key_not_cached",
        poolId,
        milestoneIndex: Number(milestoneIndex),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Transaction failed: ${msg}`);
      logger.log("error", { phase: "tx_submit", error: msg });
    }
  } else if (DRY_RUN) {
    console.log("\n[DRY RUN] Would submit verification tx if in live mode.");
  } else if (!result.approved || result.confidence < CONFIDENCE_THRESHOLD) {
    console.log(
      `\nVerification not submitted: ${!result.approved ? "evidence rejected" : `confidence ${result.confidence}% < ${CONFIDENCE_THRESHOLD}% threshold`}`
    );
  }

  // 6. Update agent memory
  memory.addVerification({
    poolId,
    milestoneIndex: Number(milestoneIndex),
    cid,
    result,
    reportCid,
    timestamp: new Date().toISOString(),
  });

  try {
    const memoryCid = await memory.save();
    console.log("Memory saved to Storacha");
    logger.log("memory_updated", {
      totalVerifications: memory.data.stats.totalVerifications,
    });

    // 7. Record verification on AgentRegistry (Filecoin Calibration)
    if (registry.isEnabled() && reportCid) {
      try {
        const regTx = await registry.recordVerification(
          poolId,
          Number(milestoneIndex),
          result.approved,
          reportCid
        );
        if (regTx) console.log(`Recorded on AgentRegistry: ${regTx}`);

        // Update state CID on registry
        if (memoryCid) {
          await registry.updateState(memoryCid);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`Registry update skipped: ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`Memory save skipped: ${msg}`);
  }

  console.log("\n--- Processing Complete ---\n");

  // Update dashboard state
  await writeDashboardState();
}

// --- Dashboard state sync ---
const DASHBOARD_STATE_FILE = ".agent-dashboard-state.json";
let agentMeta = { wallet: "", mode: "", assignedPools: 0, registryEnabled: false };

function setAgentMeta(meta: typeof agentMeta) {
  agentMeta = meta;
}

async function writeDashboardState() {
  try {
    await Bun.write(
      DASHBOARD_STATE_FILE,
      JSON.stringify({
        running: true,
        wallet: agentMeta.wallet,
        mode: agentMeta.mode,
        assignedPools: agentMeta.assignedPools,
        registry: agentMeta.registryEnabled ? "Connected" : "Not configured",
        stats: memory.data.stats,
        verifications: memory.data.verifications.slice(-20),
        logs: logger.getLog().entries.slice(-50),
      })
    );
  } catch {}
}

// --- Graceful shutdown ---
async function shutdown() {
  console.log("\nShutting down...");
  try {
    await logger.flush();
    console.log("Execution logs flushed to Filecoin");
  } catch (err) {
    console.log("Log flush skipped:", err instanceof Error ? err.message : err);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// --- Start ---
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
