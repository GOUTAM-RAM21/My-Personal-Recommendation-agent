"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowUpFromLine, Sparkles, Loader2 } from "lucide-react";
import type { GenerateStatus } from "@/hooks/useSSEGenerate";

const PAST_BLOGS = [
  "How NVIDIA NIM makes LLM inference faster",
  "LangGraph Multi-Agent Patterns 2026",
  "RAG vs Fine-Tuning: When to use each",
  "Deploying Llama 3.3 on Kubernetes",
];

interface Props {
  topic: string; setTopic: (v: string) => void;
  asOf: string;  setAsOf:  (v: string) => void;
  status: GenerateStatus;
  onGenerate: () => void;
  onReset: () => void;
  selectedBlog: string | null;
  setSelectedBlog: (b: string | null) => void;
}

/* ── Status indicator ── */
function StatusDot({ status }: { status: GenerateStatus }) {
  const isRunning = status === "loading";
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: isRunning ? "var(--success)" : status === "done" ? "var(--success)" : "var(--text-tertiary)",
      animation: isRunning ? "statusPulse 2s ease infinite" : "none",
      flexShrink: 0,
    }} />
  );
}

/* ── Generate button ── */
function GenerateBtn({ status, onClick, onReset }: {
  status: GenerateStatus; onClick: () => void; onReset: () => void;
}) {
  if (status === "done") {
    return (
      <div style={{ marginTop: 10 }}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          style={{
            height: 42,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg,#00d084,#00a066)",
            boxShadow: "0 4px 16px rgba(0,208,132,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, cursor: "default",
          }}
        >
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-geist)" }}>
            ✓  Blog Generated!
          </span>
        </motion.div>
        <button
          onClick={onReset}
          style={{
            marginTop: 8, width: "100%", height: 30, background: "transparent",
            border: "none", cursor: "pointer", fontSize: 12,
            color: "var(--text-brand)", fontFamily: "var(--font-geist)",
            textAlign: "center", letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { (e.currentTarget).style.textDecoration = "none"; }}
        >
          Write Another Blog →
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <motion.button
        onClick={onReset}
        initial={{ x: 0 }}
        animate={{ x: [0, -4, 4, -4, 4, 0] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          marginTop: 10, width: "100%", height: 42,
          borderRadius: "var(--radius-md)",
          background: "var(--error-bg)",
          border: "1px solid rgba(255,77,106,0.3)",
          color: "var(--error)", fontSize: 13,
          fontFamily: "var(--font-geist)", fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Error — Try Again
      </motion.button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={status === "loading"}
      style={{
        position: "relative",
        marginTop: 10, width: "100%", height: 42,
        borderRadius: "var(--radius-md)", border: "none",
        background: status === "loading"
          ? "linear-gradient(135deg,#0088cc,#005599)"
          : "linear-gradient(135deg,#00c2ff 0%,#0088dd 50%,#005bb5 100%)",
        boxShadow: status === "loading"
          ? "none"
          : "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,194,255,0.3), 0 1px 3px rgba(0,0,0,0.4)",
        cursor: status === "loading" ? "not-allowed" : "pointer",
        overflow: "hidden",
        transition: "all var(--dur-base) var(--ease-spring)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        color: "#fff", fontSize: 13, fontWeight: 600,
        fontFamily: "var(--font-geist)",
      }}
      onMouseEnter={(e) => {
        if (status !== "loading") {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.transform = "translateY(-1px)";
          b.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 20px rgba(0,194,255,0.4), 0 2px 8px rgba(0,0,0,0.4)";
          b.style.filter = "brightness(1.08)";
        }
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.transform = "";
        b.style.boxShadow = status === "loading"
          ? "none"
          : "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,194,255,0.3), 0 1px 3px rgba(0,0,0,0.4)";
        b.style.filter = "";
      }}
      onMouseDown={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.transform = "translateY(1px) scale(0.99)";
        b.style.boxShadow = "0 1px 4px rgba(0,194,255,0.2), 0 1px 2px rgba(0,0,0,0.4)";
        b.style.filter = "brightness(0.95)";
      }}
      onMouseUp={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.transform = "";
        b.style.filter = "";
      }}
    >
      {/* Shimmer overlay */}
      {status === "idle" && (
        <span style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)",
          animation: "shimmer 2.5s ease infinite 1s",
        }} />
      )}

      {/* Loading progress bar */}
      {status === "loading" && (
        <span style={{
          position: "absolute", bottom: 0, left: 0, height: 2, width: "40%",
          background: "linear-gradient(90deg,transparent,#00c2ff,#fff,#00c2ff,transparent)",
          animation: "progressSweep 1.2s ease infinite",
        }} />
      )}

      {status === "loading"
        ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
        : <Sparkles size={14} />
      }
      {status === "loading" ? "Generating…" : "Generate Blog"}
    </button>
  );
}

export default function Sidebar({ topic, setTopic, asOf, setAsOf, status, onGenerate, onReset, selectedBlog, setSelectedBlog }: Props) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        width: 260, minWidth: 260, height: "100vh",
        display: "flex", flexDirection: "column",
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border-subtle)",
        position: "relative", zIndex: 10,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        height: 56, padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Logo mark */}
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#00c2ff,#0066ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(0,194,255,0.3)",
          }}>
            <span style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1,
            }}>B</span>
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-bricolage)", fontWeight: 700,
              fontSize: 15, color: "var(--text-primary)", lineHeight: 1.2,
            }}>BWA</div>
            <div style={{
              fontFamily: "var(--font-geist)", fontSize: 10,
              color: "var(--text-tertiary)", letterSpacing: "0.02em",
              lineHeight: 1.3,
            }}>Blog Writing Agent</div>
          </div>
        </div>
        <StatusDot status={status} />
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Generate section */}
        <div style={{ padding: 16, borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{
            fontFamily: "var(--font-geist)", fontSize: 10, fontWeight: 600,
            color: "var(--text-tertiary)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 10,
          }}>
            New Blog
          </p>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to write about?"
            rows={4}
            style={{
              width: "100%", minHeight: 88,
              background: "var(--bg-base)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              fontFamily: "var(--font-geist-mono)", fontSize: 12,
              color: "var(--text-secondary)",
              resize: "none", outline: "none",
              lineHeight: 1.6,
              transition: "border-color 150ms, box-shadow 150ms",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand-500)";
              e.target.style.boxShadow = "0 0 0 3px var(--brand-ring), var(--shadow-sm)";
              e.target.style.color = "var(--text-primary)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-default)";
              e.target.style.boxShadow = "none";
              e.target.style.color = "var(--text-secondary)";
            }}
          />

          {/* Date row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
              style={{
                flex: 1, height: 36, padding: "0 10px",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-geist)", fontSize: 13,
                color: "var(--text-secondary)", outline: "none",
                transition: "border-color 150ms",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--brand-500)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
            />
          </div>

          <GenerateBtn status={status} onClick={onGenerate} onReset={onReset} />
        </div>

        {/* Past blogs */}
        <div style={{ flex: 1, padding: "12px 0" }}>
          <p style={{
            fontFamily: "var(--font-geist)", fontSize: 10, fontWeight: 600,
            color: "var(--text-tertiary)", letterSpacing: "0.08em",
            textTransform: "uppercase", padding: "0 16px", marginBottom: 6,
          }}>
            Recent
          </p>

          {PAST_BLOGS.map((b, i) => {
            const isSelected = selectedBlog === b;
            return (
              <motion.button
                key={b}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedBlog(isSelected ? null : b)}
                style={{
                  position: "relative",
                  width: "100%", height: 36,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 12px 0 20px",
                  margin: "1px 6px",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected ? "var(--bg-active)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transition: "background var(--dur-fast)",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                {/* Left accent bar */}
                {isSelected && (
                  <span style={{
                    position: "absolute", left: 0, top: 6, bottom: 6,
                    width: 2, background: "var(--brand-500)",
                    borderRadius: "0 2px 2px 0",
                  }} />
                )}
                {/* Status dot */}
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: isSelected ? "var(--brand-500)" : "var(--success)",
                }} />
                <span style={{
                  fontFamily: "var(--font-geist)", fontSize: 13,
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  transition: "color var(--dur-fast)",
                }}>
                  {b}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Load button ── */}
      <div style={{
        padding: "12px 10px",
        borderTop: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}>
        <button
          style={{
            width: "100%", height: 34, background: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-secondary)",
            transition: "all var(--dur-fast)",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "var(--border-strong)";
            b.style.color = "var(--text-primary)";
            b.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "var(--border-default)";
            b.style.color = "var(--text-secondary)";
            b.style.background = "transparent";
          }}
        >
          <ArrowUpFromLine size={12} />
          Load Selected Blog
        </button>
      </div>
    </motion.aside>
  );
}
