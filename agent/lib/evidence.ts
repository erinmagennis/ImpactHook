const GATEWAYS = [
  (cid: string) => `https://${cid}.ipfs.storacha.link`,
  (cid: string) => `https://ipfs.io/ipfs/${cid}`,
  (cid: string) => `https://dweb.link/ipfs/${cid}`,
];

const FETCH_TIMEOUT = 30_000;

export interface EvidenceFile {
  content: Buffer;
  mimeType: string;
  size: number;
}

export async function fetchEvidence(cid: string): Promise<EvidenceFile> {
  let lastError: Error | null = null;

  for (const makeUrl of GATEWAYS) {
    const url = makeUrl(cid);
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!response.ok) {
        lastError = new Error(`${url} returned ${response.status}`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get("content-type") || detectMimeType(cid, buffer);

      return { content: buffer, mimeType, size: buffer.length };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw new Error(`Failed to fetch evidence CID ${cid}: ${lastError?.message}`);
}

function detectMimeType(_cid: string, buffer: Buffer): string {
  // Check magic bytes
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
  if (buffer[0] === 0x25 && buffer[1] === 0x50) return "application/pdf";
  if (buffer[0] === 0x7b) return "application/json"; // starts with {
  return "text/plain";
}

export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isTextType(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "text/csv"
  );
}
