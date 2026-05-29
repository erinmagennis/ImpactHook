"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { unichainSepolia } from "../lib/chains";
import { BrandMark } from "./Brand";
import { NavDropdown } from "./NavDropdown";
import { ABOUT, FUNDER, ORGANIZATION, LEARN } from "./navConfig";

// One nav bar, every page. The tabs (About / Funder / Organization / Learn) never move; only the
// right-side button swaps (Launch App on the landing, Connect Wallet in the app). On the landing
// the bar is transparent over the hero and blurs on scroll; elsewhere it's the standard sticky bar.
export function Navigation() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== unichainSepolia.id;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const variant = isLanding ? "landing" : "app";

  return (
    <>
      <nav
        className={isLanding ? "landing-nav" : "nav-bar"}
        style={
          isLanding
            ? {
                background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: "1px solid var(--border-subtle)",
              }
            : undefined
        }
      >
        <div
          className={isLanding ? "container" : "nav-inner"}
          style={isLanding ? { display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 } : undefined}
        >
          <Link href="/" className="nav-logo" style={{ display: "inline-flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <BrandMark size={24} />
            <span><span style={{ color: "var(--accent)" }}>Impact</span>Hook</span>
          </Link>

          {/* Tabs + action grouped on the right. NOTE: do not use .nav-links here — its
              overflow-x:auto clips the absolutely-positioned dropdown menus. Keep overflow visible. */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <NavDropdown menu={ABOUT} variant={variant} />
              <NavDropdown menu={FUNDER} variant={variant} />
              <NavDropdown menu={ORGANIZATION} variant={variant} />
              <NavDropdown menu={LEARN} variant={variant} />
            </div>
            <div style={{ flexShrink: 0 }}>
              {isLanding ? (
                <Link href="/portfolio" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
                  Launch App
                </Link>
              ) : (
                <ConnectButton chainStatus="icon" accountStatus="address" showBalance={false} />
              )}
            </div>
          </div>
        </div>
      </nav>

      {isWrongChain && !isLanding && (
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
