import { NextResponse } from "next/server";
import * as Client from "@storacha/client";
import { StoreMemory } from "@storacha/client/stores/memory";
import * as Proof from "@storacha/client/proof";
import { Signer } from "@storacha/client/principal/ed25519";

async function getStorachaClient() {
  const key = process.env.STORACHA_KEY;
  const proof = process.env.STORACHA_PROOF;

  if (!key || !proof) {
    throw new Error("STORACHA_KEY and STORACHA_PROOF must be set");
  }

  const principal = Signer.parse(key);
  const store = new StoreMemory();
  const client = await Client.create({ principal, store });
  const parsedProof = await Proof.parse(proof);
  const space = await client.addSpace(parsedProof);
  await client.setCurrentSpace(space.did());
  return client;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const client = await getStorachaClient();
    const cid = await client.uploadFile(file);

    return NextResponse.json({
      cid: cid.toString(),
      url: `https://${cid}.ipfs.storacha.link/${file.name}`,
      filename: file.name,
      size: file.size,
      description: description || "",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";

    // Return helpful error if credentials not configured
    if (message.includes("STORACHA_KEY")) {
      return NextResponse.json(
        {
          error: "Storacha not configured. Set STORACHA_KEY and STORACHA_PROOF environment variables.",
          cid: null,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
