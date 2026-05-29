"use client";

import React from "react";

/**
 * Brand primitives shared across the landing page and the dApp.
 * The identity is the logo: gray code brackets < > wrapping a teal checkmark.
 * The checkmark is the "verified" state; the brackets signal open-source / onchain.
 */

/** The logo mark. `animate` draws the checkmark in (verification moment). */
export function BrandMark({
  size = 32,
  animate = false,
  title,
}: {
  size?: number;
  animate?: boolean;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`brand-check${animate ? " brand-check-animate" : ""}`}
      role="img"
      aria-label={title ?? "ImpactHook"}
    >
      <path className="bracket" d="M8 8L2 16L8 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="bracket" d="M24 8L30 16L24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="check" d="M12 16.5L15 19.5L21 12.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Wordmark: logo + "ImpactHook". */
export function BrandLockup({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <BrandMark size={size} />
      <span style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: size * 0.82 }}>
        <span style={{ color: "var(--accent)" }}>Impact</span>Hook
      </span>
    </span>
  );
}

/**
 * Circle cutout — the UNICEF Office of Innovation photo motif: a large circle
 * framing a real, dignified photo against the dark field. Falls back to an
 * ImageSlot placeholder (with a sourcing hint) until a real photo is dropped in.
 */
export function CircleCutout({
  src,
  alt,
  size = 360,
  ring = true,
  hint,
}: {
  src?: string;
  alt: string;
  size?: number;
  ring?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size, maxWidth: "100%" }}>
      {ring && <div className="circle-cutout-ring" />}
      <div className="circle-cutout">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} />
        ) : (
          <div className="image-slot" style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
            <BrandMark size={28} />
            <span className="image-slot-label">Photo slot</span>
            <span>{hint ?? alt}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** A rectangular image slot placeholder with a sourcing hint. */
export function ImageSlot({
  label,
  hint,
  ratio = "16 / 9",
  rounded = "var(--radius-card)",
}: {
  label: string;
  hint?: string;
  ratio?: string;
  rounded?: string;
}) {
  return (
    <div className="image-slot" style={{ aspectRatio: ratio, borderRadius: rounded }}>
      <BrandMark size={26} />
      <span className="image-slot-label">{label}</span>
      {hint && <span style={{ maxWidth: 320 }}>{hint}</span>}
    </div>
  );
}

/** A verified onchain artifact, shown with pride (charity:water "GPS coordinate" style). */
export function ProofRow({
  statement,
  hash,
  href,
}: {
  statement: string;
  hash: string;
  href?: string;
}) {
  return (
    <div className="proof-row">
      <BrandMark size={22} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{statement}</div>
        {href ? (
          <a className="proof-hash" href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            {hash} ↗
          </a>
        ) : (
          <span className="proof-hash">{hash}</span>
        )}
      </div>
    </div>
  );
}

/** Quiet semantic status pill. */
export function StatusPill({ state, children }: { state: "verified" | "pending" | "idle"; children: React.ReactNode }) {
  return <span className={`status-pill status-pill-${state}`}>{children}</span>;
}

/** Data freshness indicator — a small trust signal for onchain views. */
export function DataFreshness({ block, ago }: { block: number | string; ago?: string }) {
  return (
    <span className="data-freshness">
      <span className="status-dot status-dot-live" />
      Synced at block {block}
      {ago ? ` · ${ago}` : ""}
    </span>
  );
}
