"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePoolDiscovery, DiscoveredProject } from "../hooks/usePoolDiscovery";

interface ProjectSelectorProps {
  value: string;
  onChange: (poolId: string) => void;
  label?: string;
}

export function ProjectSelector({ value, onChange, label = "Project" }: ProjectSelectorProps) {
  const { projects, isLoading } = usePoolDiscovery();
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
      <label className="text-label">{label}</label>
      <input
        ref={inputRef}
        type="text"
        className="input"
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
      />

      {isOpen && (matchingProjects.length > 0 || isLoading) && (
        <div className="selector-dropdown">
          {isLoading ? (
            <div className="selector-loading">Loading projects...</div>
          ) : (
            matchingProjects.map((project) => (
              <button
                key={project.poolId}
                onClick={() => handleSelect(project)}
                className="selector-item"
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="selector-item-name">
                    {project.name || "Unnamed Project"}
                  </div>
                  <div className="font-data text-caption">
                    {truncatePoolId(project.poolId)}
                  </div>
                </div>
                {project.category && (
                  <span className="badge badge-accent" style={{ fontSize: 11, padding: "2px 8px" }}>
                    {project.category}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {inputValue.length > 0 &&
        !(inputValue.startsWith("0x") && inputValue.length === 66) &&
        !isOpen && (
          <div className="text-helper">
            Enter a valid pool ID (0x followed by 64 hex characters) or select a project above
          </div>
        )}
    </div>
  );
}
