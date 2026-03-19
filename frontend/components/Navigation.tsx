"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Role = "none" | "trader" | "project" | "sponsor" | "learn";

const roleConfig: Record<
  Role,
  { label: string; description: string; nav: { href: string; label: string }[] }
> = {
  none: {
    label: "I'm a...",
    description: "",
    nav: [
      { href: "/swap", label: "Swap" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/donate", label: "Donate" },
      { href: "/impact", label: "Impact" },
      { href: "/technical", label: "Technical" },
    ],
  },
  trader: {
    label: "Trader",
    description: "Swap tokens, fund impact automatically",
    nav: [
      { href: "/swap", label: "Swap" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/donate", label: "Donate" },
    ],
  },
  project: {
    label: "Project Owner",
    description: "Register, verify milestones, withdraw funds",
    nav: [
      { href: "/create", label: "Create" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/milestones", label: "Milestones" },
      { href: "/withdraw", label: "Withdraw" },
    ],
  },
  sponsor: {
    label: "LP / Sponsor",
    description: "Provide liquidity, fund impact through yield",
    nav: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/swap", label: "Swap" },
      { href: "/donate", label: "Donate" },
    ],
  },
  learn: {
    label: "Learn More",
    description: "How ImpactHook works",
    nav: [
      { href: "/impact", label: "Impact" },
      { href: "/technical", label: "Technical" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
};

const roleOrder: Role[] = ["trader", "project", "sponsor", "learn"];

const roleColors: Record<Role, string> = {
  none: "var(--text-dim)",
  trader: "#0d9488",
  project: "#059669",
  sponsor: "#7c3aed",
  learn: "#d97706",
};

export function Navigation() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>("none");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("impacthook-role") as Role | null;
    if (saved && roleConfig[saved]) setRole(saved);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectRole = (r: Role) => {
    setRole(r);
    localStorage.setItem("impacthook-role", r);
    setDropdownOpen(false);
  };

  const currentRole = roleConfig[role];
  const color = roleColors[role];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border-subtle, #e4e4e7)",
        backdropFilter: "blur(16px)",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary, #18181b)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            <span style={{ color: "var(--accent, #0d9488)" }}>Impact</span>Hook
          </Link>

          {/* Role selector */}
          <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 6,
                border: role === "none"
                  ? "1px solid var(--border-subtle, #e4e4e7)"
                  : `1px solid ${color}33`,
                background: role === "none"
                  ? "var(--bg-elevated, #f4f4f5)"
                  : `${color}0d`,
                color: role === "none" ? "var(--text-secondary, #52525b)" : color,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {currentRole.label}
              <span style={{ fontSize: 9, opacity: 0.6 }}>
                {dropdownOpen ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  minWidth: 240,
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle, #e4e4e7)",
                  background: "#ffffff",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                }}
              >
                {roleOrder.map((r) => {
                  const rc = roleConfig[r];
                  const isSelected = r === role;
                  const rColor = roleColors[r];
                  return (
                    <button
                      key={r}
                      onClick={() => selectRole(r)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        border: "none",
                        borderLeft: isSelected
                          ? `2px solid ${rColor}`
                          : "2px solid transparent",
                        background: isSelected
                          ? `${rColor}08`
                          : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        transition: "all 0.1s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isSelected ? rColor : "var(--text-primary, #18181b)",
                          marginBottom: 2,
                        }}
                      >
                        {rc.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-dim, #a1a1aa)",
                        }}
                      >
                        {rc.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nav links for current role */}
          <div style={{ display: "flex", gap: 4, overflow: "hidden" }}>
            {currentRole.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: isActive
                      ? "var(--text-primary, #18181b)"
                      : "var(--text-secondary, #52525b)",
                    backgroundColor: isActive
                      ? "var(--bg-elevated, #f4f4f5)"
                      : "transparent",
                    border: isActive
                      ? "1px solid var(--border-subtle, #e4e4e7)"
                      : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <ConnectButton
            chainStatus="icon"
            accountStatus="address"
            showBalance={false}
          />
        </div>
      </div>
    </nav>
  );
}
