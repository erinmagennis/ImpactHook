"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { NavMenu } from "./navConfig";

// One shared dropdown primitive for both the app nav and the landing nav.
// - If menu.href is set, the label is a Link to that "Overview" and a caret button opens the menu.
// - If menu.href is omitted (Learn), the label itself toggles the menu.
export function NavDropdown({ menu, variant }: { menu: NavMenu; variant: "app" | "landing" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkClass = variant === "landing" ? "landing-nav-link" : "nav-link";
  const isActive =
    (menu.href && pathname === menu.href) ||
    menu.items.some((i) => !i.external && pathname === i.href);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {/* One cohesive tab: label + caret are a single toggle. The "Overview" destination
          (where a menu has one) is the first item in the dropdown. */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${linkClass} ${isActive ? "nav-link-active" : ""}`}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        {menu.label}
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="nav-role-dropdown" style={{ minWidth: 248 }}>
          {menu.description && (
            <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-dim)" }}>
              {menu.description}
            </div>
          )}
          {menu.items.map((item) => {
            const active = !item.external && pathname === item.href;
            const inner = (
              <>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--accent)" : "var(--text-primary)", display: "block" }}>
                  {item.label}
                </span>
                {item.desc && (
                  <span className="text-caption" style={{ display: "block", marginTop: 1 }}>{item.desc}</span>
                )}
              </>
            );
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="nav-role-option"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="nav-role-option"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
