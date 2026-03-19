"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Role = "trader" | "project" | "sponsor" | "explore";

const roleConfig: Record<
  Role,
  { label: string; description: string; nav: { href: string; label: string }[] }
> = {
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
    label: "Project",
    description: "Register, verify milestones, withdraw",
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
  explore: {
    label: "Explore All",
    description: "See everything",
    nav: [
      { href: "/swap", label: "Swap" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/milestones", label: "Milestones" },
      { href: "/withdraw", label: "Withdraw" },
      { href: "/donate", label: "Donate" },
      { href: "/create", label: "Create" },
      { href: "/impact", label: "Impact" },
      { href: "/technical", label: "Technical" },
    ],
  },
};

const roleOrder: Role[] = ["trader", "project", "sponsor", "explore"];

const roleColors: Record<Role, string> = {
  trader: "var(--accent-cyan)",
  project: "var(--accent-emerald)",
  sponsor: "var(--accent-violet)",
  explore: "var(--text-mid)",
};

export function Navigation() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>("explore");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load saved role
  useEffect(() => {
    const saved = localStorage.getItem("impacthook-role") as Role | null;
    if (saved && roleConfig[saved]) setRole(saved);
  }, []);

  // Close dropdown on outside click
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
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(5,5,8,0.88)",
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="text-hero-gradient">Impact</span>Hook
          </Link>

          {/* Role selector */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 2,
                border: `1px solid ${color}33`,
                background: `${color}0d`,
                color: color,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {currentRole.label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>
                {dropdownOpen ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  minWidth: 220,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-card)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
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
                          ? `${rColor}0d`
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
                          color: isSelected ? rColor : "var(--text-bright)",
                          marginBottom: 2,
                        }}
                      >
                        {rc.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-dim)",
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
          <div style={{ display: "flex", gap: 4 }}>
            {currentRole.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 2,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    backgroundColor: isActive
                      ? "rgba(99,102,241,0.15)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(99,102,241,0.2)"
                      : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <ConnectButton
          chainStatus="icon"
          accountStatus="address"
          showBalance={false}
        />
      </div>
    </nav>
  );
}
