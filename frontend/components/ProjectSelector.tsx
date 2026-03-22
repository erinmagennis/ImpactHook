"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePoolDiscovery, DiscoveredProject } from "../hooks/usePoolDiscovery";

interface ProjectSelectorProps {
  value: string;
  onChange: (poolId: string) => void;
  label?: string;
}

export function ProjectSelector({ value, onChange, label = "PROJECT" }: ProjectSelectorProps) {
  const { projects, isLoading } = usePoolDiscovery();
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes into the input
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useCallback(
    (query: string): DiscoveredProject[] => {
      if (!query) return projects;
      const q = query.toLowerCase();
      return projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.poolId.toLowerCase().includes(q)
      );
    },
    [projects]
  );

  const matchingProjects = filtered(inputValue);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    // If the user typed a full valid pool ID, propagate immediately
    if (val.startsWith("0x") && val.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(val)) {
      onChange(val);
    } else if (val === "") {
      onChange("");
    }
  }

  function handleSelect(project: DiscoveredProject) {
    setInputValue(project.poolId);
    onChange(project.poolId);
    setIsOpen(false);
  }

  function handleFocus() {
    setIsOpen(true);
  }

  function truncatePoolId(id: string) {
    return `${id.slice(0, 10)}...${id.slice(-6)}`;
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label
        style={{
          fontSize: 11,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        placeholder={
          isLoading
            ? "Loading projects..."
            : projects.length > 0
            ? "Search by project name or paste pool ID (0x...)"
            : "Paste pool ID (0x...)"
        }
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      {/* Dropdown */}
      {isOpen && (matchingProjects.length > 0 || isLoading) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 50,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: "12px 14px",
                fontSize: 12,
                color: "var(--text-dim)",
              }}
            >
              Loading projects...
            </div>
          ) : (
            matchingProjects.map((project) => (
              <button
                key={project.poolId}
                onClick={() => handleSelect(project)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {project.name || "Unnamed Project"}
                  </div>
                  <div
                    className="font-data"
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                    }}
                  >
                    {truncatePoolId(project.poolId)}
                  </div>
                </div>
                {project.category && (
                  <span
                    style={{
                      marginLeft: 10,
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      background: "rgba(13,148,136,0.08)",
                      color: "var(--accent)",
                      border: "1px solid rgba(13,148,136,0.15)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {project.category}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Hint text */}
      {inputValue.length > 0 &&
        !(inputValue.startsWith("0x") && inputValue.length === 66) &&
        !isOpen && (
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
            Enter a valid pool ID (0x followed by 64 hex characters) or select a project above
          </div>
        )}
    </div>
  );
}
