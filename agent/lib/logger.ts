export interface LogEntry {
  timestamp: string;
  action:
    | "agent_started"
    | "memory_loaded"
    | "memory_fresh"
    | "memory_updated"
    | "event_detected"
    | "evidence_fetched"
    | "analysis_complete"
    | "report_stored"
    | "tx_submitted"
    | "tx_confirmed"
    | "tx_skipped"
    | "error";
  details: Record<string, unknown>;
  durationMs?: number;
}

export interface ExecutionLog {
  agentId: string;
  sessionStart: string;
  sessionEnd?: string;
  entries: LogEntry[];
  summary: {
    eventsProcessed: number;
    verificationsApproved: number;
    verificationsRejected: number;
    errors: number;
  };
}

export class AgentLogger {
  private log_data: ExecutionLog;

  constructor(agentId: string) {
    this.log_data = {
      agentId,
      sessionStart: new Date().toISOString(),
      entries: [],
      summary: {
        eventsProcessed: 0,
        verificationsApproved: 0,
        verificationsRejected: 0,
        errors: 0,
      },
    };
  }

  log(action: LogEntry["action"], details: Record<string, unknown>, durationMs?: number) {
    this.log_data.entries.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      durationMs,
    });

    // Update summary counters
    if (action === "event_detected") this.log_data.summary.eventsProcessed++;
    if (action === "analysis_complete") {
      if (details.approved) this.log_data.summary.verificationsApproved++;
      else this.log_data.summary.verificationsRejected++;
    }
    if (action === "error") this.log_data.summary.errors++;
  }

  getLog(): ExecutionLog {
    return {
      ...this.log_data,
      sessionEnd: new Date().toISOString(),
    };
  }

  async flush(): Promise<string | null> {
    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    if (!privateKey) {
      // Fall back to local file storage
      const filename = `agent_log_${Date.now()}.json`;
      await Bun.write(filename, JSON.stringify(this.getLog(), null, 2));
      return filename;
    }

    try {
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

      const logJson = JSON.stringify(this.getLog(), null, 2);
      const blob = new Blob([logJson], { type: "application/json" });
      const file = new File([blob], `agent_log_${Date.now()}.json`, {
        type: "application/json",
      });

      const { carBytes, rootCid } = await createCarFromFile(file);
      await checkUploadReadiness({ synapse, fileSize: carBytes.length });
      await executeUpload(synapse, carBytes, rootCid, { logger: noopLogger });

      return rootCid.toString();
    } catch (err) {
      // Fall back to local
      const filename = `agent_log_${Date.now()}.json`;
      await Bun.write(filename, JSON.stringify(this.getLog(), null, 2));
      return filename;
    }
  }
}
