"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/milestones", label: "Milestones" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Navigation() {
  const pathname = usePathname();

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
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
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
            ImpactHook
          </Link>
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map((item) => {
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
                    border: isActive ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
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
