import { NextResponse } from "next/server";
import {
  initializeSynapse,
  createCarFromFile,
  checkUploadReadiness,
  executeUpload,
  setMaxAllowances,
} from "filecoin-pin";
import { depositUSDFC } from "filecoin-pin/core/payments";
import { calibration } from "@filoz/synapse-sdk";
import { parseUnits } from "viem";

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  child: () => noopLogger,
} as any;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        {
          error: "Filecoin not configured. Set FILECOIN_PRIVATE_KEY environment variable.",
          cid: null,
        },
        { status: 503 }
      );
    }

    const synapse = await initializeSynapse({
      privateKey: privateKey as `0x${string}`,
      chain: calibration,
    });

    // Ensure allowances are set for WarmStorage operator
    try {
      await setMaxAllowances(synapse);
    } catch {
      // Already set
    }

    const { carBytes, rootCid } = await createCarFromFile(file);

    // Deposit USDFC into Filecoin Pay contract if needed
    try {
      await depositUSDFC(synapse, parseUnits("1", 18));
    } catch {
      // May fail if already deposited sufficiently
    }

    await checkUploadReadiness({ synapse, fileSize: carBytes.length });
    await executeUpload(synapse, carBytes, rootCid, { logger: noopLogger });

    return NextResponse.json({
      cid: rootCid.toString(),
      url: `https://ipfs.io/ipfs/${rootCid.toString()}`,
      filename: file.name,
      size: file.size,
      storage: "filecoin",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
