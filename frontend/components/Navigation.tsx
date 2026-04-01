"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { unichainSepolia } from "../lib/chains";

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
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== unichainSepolia.id;

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
    <>
      <nav className="nav-bar">
        <div className="nav-inner">
          <div className="nav-left">
            <Link href="/" className="nav-logo">
              <span style={{ color: "var(--accent)" }}>Impact</span>Hook
            </Link>

            {/* Role selector */}
            <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-role-trigger"
                style={{
                  borderColor: role === "none" ? "var(--border-subtle)" : `${color}33`,
                  background: role === "none" ? "var(--bg-elevated)" : `${color}0d`,
                  color: role === "none" ? "var(--text-secondary)" : color,
                }}
              >
                {currentRole.label}
                <span style={{ fontSize: 9, opacity: 0.6 }}>
                  {dropdownOpen ? "\u25B2" : "\u25BC"}
                </span>
              </button>

              {dropdownOpen && (
                <div className="nav-role-dropdown">
                  {roleOrder.map((r) => {
                    const rc = roleConfig[r];
                    const isSelected = r === role;
                    const rColor = roleColors[r];
                    return (
                      <button
                        key={r}
                        onClick={() => selectRole(r)}
                        className="nav-role-option"
                        style={{
                          borderLeft: isSelected
                            ? `2px solid ${rColor}`
                            : "2px solid transparent",
                          background: isSelected ? `${rColor}08` : "transparent",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isSelected ? rColor : "var(--text-primary)",
                            marginBottom: 2,
                          }}
                        >
                          {rc.label}
                        </div>
                        <div className="text-caption">
                          {rc.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div className="nav-links">
              {currentRole.nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? "nav-link-active" : ""}`}
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

      {isWrongChain && (
        <div className="chain-warning">
          <span>You are connected to the wrong network.</span>
          <button
            onClick={() => switchChain({ chainId: unichainSepolia.id })}
            className="chain-warning-btn"
          >
            Switch to Unichain Sepolia
          </button>
        </div>
      )}
    </>
  );
}
