import type { VerificationResult } from "./analyzer.js";

export interface VerificationReport {
  version: "1.0";
  agentId: string;
  timestamp: string;
  project: { poolId: string; name: string; category: string };
  milestone: { index: number; description: string };
  evidence: { cid: string; type: string; size: number };
  analysis: VerificationResult;
  decision: "approved" | "rejected" | "deferred";
  onchainTx?: string;
}

export async function storeReport(report: VerificationReport): Promise<string> {
  const privateKey = process.env.FILECOIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FILECOIN_PRIVATE_KEY must be set for Filecoin report storage");
  }

  // Dynamic import to avoid issues if filecoin-pin isn't installed yet
  const { initializeSynapse, createCarFromFile, checkUploadReadiness, executeUpload } =
    await import("filecoin-pin");
  const { calibration } = await import("@filoz/synapse-sdk");

  const noopLogger = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    child: () => noopLogger,
  } as any;

  const synapse = await initializeSynapse({
    privateKey: privateKey as `0x${string}`,
    chain: calibration,
  });

  const reportJson = JSON.stringify(report, null, 2);
  const blob = new Blob([reportJson], { type: "application/json" });
  const filename = `verification-report-${report.project.poolId.slice(0, 10)}-m${report.milestone.index}-${Date.now()}.json`;
  const file = new File([blob], filename, { type: "application/json" });

  const { carBytes, rootCid } = await createCarFromFile(file);
  await checkUploadReadiness({ synapse, fileSize: carBytes.length });
  await executeUpload(synapse, carBytes, rootCid, { logger: noopLogger });

  return rootCid.toString();
}
