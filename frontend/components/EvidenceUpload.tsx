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
        <div className="evidence-toggle">
          <button
            onClick={() => setBackend("storacha")}
            disabled={uploading}
            className={`evidence-toggle-btn ${backend === "storacha" ? "evidence-toggle-active" : ""}`}
          >
            Storacha
          </button>
          <button
            onClick={() => setBackend("filecoin")}
            disabled={uploading}
            className={`evidence-toggle-btn ${backend === "filecoin" ? "evidence-toggle-active" : ""}`}
            style={{ borderLeft: "1px solid var(--border-subtle)" }}
          >
            Filecoin Pin
          </button>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          className={`evidence-upload-btn ${uploadedCid ? "evidence-upload-done" : ""}`}
        >
          {uploading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: backend === "filecoin" ? "#3b82f6" : "var(--accent)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              {backend === "filecoin"
                ? "Storing on Filecoin..."
                : "Storing on IPFS..."}
            </span>
          ) : uploadedCid ? (
            `Stored: ${fileName}`
          ) : (
            "Upload Evidence"
          )}
        </button>
        <span className="text-caption">
          {uploading && backend === "filecoin"
            ? "First upload may take ~30s (deposit + storage)"
            : uploadedCid
            ? backendLabel
            : "Images, PDFs, reports, data"}
        </span>
      </div>

      {uploadedCid && uploadedUrl && (
        <div className="evidence-cid">
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
        <div className="evidence-error">{error}</div>
      )}
    </div>
  );
}
