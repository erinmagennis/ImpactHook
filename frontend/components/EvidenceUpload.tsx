"use client";

import { useState, useRef } from "react";

type StorageBackend = "storacha" | "filecoin";

interface EvidenceUploadProps {
  onUpload: (cid: string, url: string) => void;
  disabled?: boolean;
}

export function EvidenceUpload({ onUpload, disabled }: EvidenceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [backend, setBackend] = useState<StorageBackend>("storacha");
  const [usedBackend, setUsedBackend] = useState<StorageBackend | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);

    const endpoint =
      backend === "filecoin" ? "/api/upload-filecoin" : "/api/upload";

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setUploadedCid(data.cid);
      setUploadedUrl(data.url);
      setUsedBackend(backend);
      onUpload(data.cid, data.url);
    } catch {
      setError("Failed to connect to upload service");
    } finally {
      setUploading(false);
    }
  };

  const backendLabel =
    usedBackend === "filecoin"
      ? "Stored on Filecoin (Calibration)"
      : "Stored on Filecoin/IPFS";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          ref={fileRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          disabled={disabled || uploading}
          style={{ display: "none" }}
          accept="image/*,.pdf,.json,.csv,.txt,.md"
        />

        {/* Storage backend toggle */}
        <div
          style={{
            display: "flex",
            borderRadius: 6,
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <button
            onClick={() => setBackend("storacha")}
            disabled={uploading}
            style={{
              padding: "5px 10px",
              border: "none",
              background:
                backend === "storacha"
                  ? "rgba(59,130,246,0.12)"
                  : "var(--bg-elevated)",
              color:
                backend === "storacha" ? "#3b82f6" : "var(--text-dim)",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Storacha
          </button>
          <button
            onClick={() => setBackend("filecoin")}
            disabled={uploading}
            style={{
              padding: "5px 10px",
              border: "none",
              borderLeft: "1px solid var(--border-subtle)",
              background:
                backend === "filecoin"
                  ? "rgba(59,130,246,0.12)"
                  : "var(--bg-elevated)",
              color:
                backend === "filecoin" ? "#3b82f6" : "var(--text-dim)",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Filecoin Pin
          </button>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid rgba(59,130,246,0.2)",
            background: uploadedCid
              ? "rgba(5,150,105,0.06)"
              : "rgba(59,130,246,0.06)",
            color: uploadedCid ? "var(--success)" : "#3b82f6",
            fontSize: 13,
            fontWeight: 500,
            cursor: disabled || uploading ? "default" : "pointer",
            whiteSpace: "nowrap",
            opacity: disabled || uploading ? 0.4 : 1,
          }}
        >
          {uploading
            ? `Uploading to ${backend === "filecoin" ? "Filecoin" : "IPFS"}...`
            : uploadedCid
            ? `Stored: ${fileName}`
            : "Upload Evidence"}
        </button>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {uploadedCid ? backendLabel : "Images, PDFs, reports, data"}
        </span>
      </div>

      {uploadedCid && uploadedUrl && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 12px",
            borderRadius: 6,
            background: "rgba(59,130,246,0.04)",
            border: "1px solid rgba(59,130,246,0.08)",
            fontSize: 12,
            color: "var(--text-dim)",
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>CID: </span>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3b82f6", textDecoration: "none" }}
          >
            {uploadedCid}
          </a>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 12px",
            borderRadius: 6,
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.08)",
            fontSize: 12,
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
