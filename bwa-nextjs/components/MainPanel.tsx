"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutList, Search, FileText, Image, Terminal, Zap, ExternalLink } from "lucide-react";
import type { GenerateStatus, PlanData, EvidenceItem, LogLine } from "@/hooks/useSSEGenerate";
import PlanTab from "./tabs/PlanTab";
import EvidenceTab from "./tabs/EvidenceTab";
import MarkdownTab from "./tabs/MarkdownTab";
import ImagesTab from "./tabs/ImagesTab";
import LogsTab from "./tabs/LogsTab";

const TABS = [
  { id: "plan",     label: "Plan",            Icon: LayoutList },
  { id: "evidence", label: "Evidence",        Icon: Search     },
  { id: "markdown", label: "Markdown Preview", Icon: FileText   },
  { id: "images",   label: "Images",          Icon: Image      },
  { id: "logs",     label: "Logs",            Icon: Terminal   },
] as const;

type TabId = typeof TABS[number]["id"];

interface Props {
  status: GenerateStatus;
  plan: PlanData | null;
  evidence: EvidenceItem[];
  markdown: string;
  imageSpecs: Record<string, string>[];
  logs: LogLine[];
}

export default function MainPanel({ status, plan, evidence, markdown, imageSpecs, logs }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("plan");
  const underlineRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const headerLineRef = useRef<HTMLDivElement>(null);

  // Animate underline indicator on tab change
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement!.getBoundingClientRect();
      setUnderlineStyle({
        left: rect.left - parentRect.left + 8,
        width: rect.width - 16,
      });
    }
  }, [activeTab]);

  // Animate header underline on mount
  useEffect(() => {
    const el = headerLineRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.style.width = "70%";
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // Auto-switch to logs on generation start
  useEffect(() => {
    if (status === "loading") setActiveTab("logs");
  }, [status]);

  // Auto-switch to plan when done
  useEffect(() => {
    if (status === "done" && plan) setActiveTab("plan");
  }, [status, plan]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1, height: "100vh", display: "flex", flexDirection: "column",
        background: "var(--bg-base)", overflow: "hidden", position: "relative", zIndex: 1,
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          height: 56, padding: "0 24px", flexShrink: 0,
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <h1 style={{
            fontFamily: "var(--font-bricolage)", fontWeight: 700,
            fontSize: 22, color: "var(--text-primary)",
            letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            Blog Writing Agent
          </h1>
          <div
            ref={headerLineRef}
            style={{
              position: "absolute", bottom: -4, left: 0,
              height: 2, width: 0,
              background: "linear-gradient(90deg, var(--brand-500), var(--purple), transparent)",
              borderRadius: 2,
              transition: "width 0.8s cubic-bezier(0.23,1,0.32,1) 0.3s",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{
              height: 30, padding: "0 14px", background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-full)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "var(--font-geist)", fontSize: 12,
              color: "var(--text-secondary)", transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "var(--brand-500)";
              b.style.color = "var(--brand-500)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "var(--border-default)";
              b.style.color = "var(--text-secondary)";
            }}
          >
            <Zap size={12} />
            Deploy
          </button>
          <button
            style={{
              height: 30, padding: "0 14px", background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-full)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "var(--font-geist)", fontSize: 12,
              color: "var(--text-secondary)", transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "var(--border-strong)";
              b.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "var(--border-default)";
              b.style.color = "var(--text-secondary)";
            }}
          >
            <ExternalLink size={12} />
            Docs
          </button>
        </div>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <motion.div
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          height: 44, padding: "0 20px", flexShrink: 0,
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "flex-end", position: "relative",
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              ref={(el) => { tabRefs.current[id] = el; }}
              onClick={() => setActiveTab(id)}
              style={{
                position: "relative", height: 44,
                padding: "0 16px",
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "var(--font-geist)", fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                transition: "color var(--dur-fast)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}

        {/* Sliding indicator */}
        <motion.div
          animate={underlineStyle}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          style={{
            position: "absolute", bottom: 0, height: 2,
            background: "var(--brand-500)",
            borderRadius: "2px 2px 0 0",
            boxShadow: "0 0 8px var(--brand-500)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, overflow: "auto" }}
          >
            {activeTab === "plan"     && <PlanTab plan={plan} status={status} />}
            {activeTab === "evidence" && <EvidenceTab evidence={evidence} status={status} />}
            {activeTab === "markdown" && <MarkdownTab markdown={markdown} status={status} />}
            {activeTab === "images"   && <ImagesTab imageSpecs={imageSpecs} />}
            {activeTab === "logs"     && <LogsTab logs={logs} status={status} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
