"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { LogLine, GenerateStatus } from "@/hooks/useSSEGenerate";

const NODE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  ROUTER:        { bg: "rgba(255,170,0,0.10)",    color: "#ffaa00", border: "rgba(255,170,0,0.25)"    },
  RESEARCH:      { bg: "rgba(0,194,255,0.10)",   color: "#00c2ff", border: "rgba(0,194,255,0.25)"    },
  ORCHESTRATOR:  { bg: "rgba(157,122,255,0.10)", color: "#9d7aff", border: "rgba(157,122,255,0.25)"  },
  WORKER:        { bg: "rgba(0,208,132,0.08)",   color: "#00d084", border: "rgba(0,208,132,0.20)"    },
  REDUCER:       { bg: "rgba(255,140,66,0.10)",  color: "#ff8c42", border: "rgba(255,140,66,0.25)"   },
  SYSTEM:        { bg: "rgba(255,255,255,0.05)", color: "#5a6380", border: "rgba(255,255,255,0.10)"  },
};

function getNodeStyle(node?: string) {
  if (!node) return NODE_STYLES.SYSTEM;
  return NODE_STYLES[node] ?? NODE_STYLES.SYSTEM;
}

function formatMsg(msg: string) {
  // Highlight success
  if (/✅|complete|ready|generated/i.test(msg)) {
    return <span style={{ color: "var(--success)", fontWeight: 600 }}>{msg}</span>;
  }
  // Error
  if (/error|❌/i.test(msg)) {
    return <span style={{ color: "var(--error)" }}>{msg}</span>;
  }
  // Recovered from disk
  if (/📂/.test(msg)) {
    return <span style={{ color: "var(--warning)" }}>{msg}</span>;
  }
  // Rocket / system init
  if (msg.startsWith("🚀")) {
    return <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{msg}</span>;
  }
  // Pipe-separated segments
  if (msg.includes("|")) {
    const parts = msg.split("|").map(s => s.trim());
    return (
      <>
        {parts.map((p, i) => (
          <span key={i} style={{ display: "inline" }}>
            {i > 0 && (
              <span style={{
                display: "inline-block", width: 1, height: "0.85em",
                background: "#1e2535", margin: "0 8px",
                verticalAlign: "middle",
              }} />
            )}
            {p}
          </span>
        ))}
      </>
    );
  }
  return <span style={{ color: "var(--text-secondary)" }}>{msg}</span>;
}

function LogLineItem({ line, isLast }: { line: LogLine; isLast: boolean }) {
  const style = getNodeStyle(line.node);
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "1px 0", lineHeight: 1.7,
      }}
    >
      {/* Timestamp */}
      <span style={{
        fontFamily: "var(--font-geist-mono)", fontSize: 10,
        color: "#3a4055", width: 68, flexShrink: 0,
      }}>
        {line.ts}
      </span>

      {/* Node badge */}
      <span style={{
        fontFamily: "var(--font-geist-mono)", fontSize: 10, fontWeight: 700,
        padding: "1px 7px", borderRadius: 4,
        background: style.bg, color: style.color,
        border: `1px solid ${style.border}`,
        flexShrink: 0, minWidth: 90, textAlign: "center" as const,
      }}>
        {line.node ?? "SYSTEM"}
      </span>

      {/* Message */}
      <span style={{
        flex: 1, fontFamily: "var(--font-geist-mono)", fontSize: 12,
        lineHeight: 1.7,
      }}>
        {formatMsg(line.msg)}
        {isLast && (
          <span style={{
            display: "inline-block", width: 8, height: 14,
            background: "var(--brand-500)", borderRadius: 1,
            marginLeft: 4, verticalAlign: "middle",
            animation: "cursorBlink 1.1s step-end infinite",
          }} />
        )}
      </span>
    </motion.div>
  );
}

export default function LogsTab({ logs, status }: { logs: LogLine[]; status: GenerateStatus }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cleared, setCleared] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<LogLine[]>(logs);

  useEffect(() => { if (!cleared) setVisibleLogs(logs); }, [logs, cleared]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleLogs]);

  const startTime = visibleLogs[0]?.ts;
  const endTime   = visibleLogs[visibleLogs.length - 1]?.ts;

  const statusLabel = status === "loading" ? "Running" : status === "done" ? "Complete" : status === "error" ? "Error" : "Idle";
  const statusColor = status === "loading" ? "var(--warning)" : status === "done" ? "var(--success)" : status === "error" ? "var(--error)" : "var(--text-tertiary)";

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      padding: 16, gap: 12, background: "var(--bg-base)",
    }}>
      {/* Stats bar */}
      <div style={{
        height: 40, display: "flex", alignItems: "center", gap: 12,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", padding: "0 16px", flexShrink: 0,
      }}>
        {[
          { label: "Events", value: visibleLogs.length },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-tertiary)" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {s.value}
            </span>
          </div>
        ))}
        <div style={{ width: 1, height: 16, background: "var(--border-default)" }} />
        {/* Status badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: status === "loading" ? "var(--warning-bg)"
            : status === "done" ? "var(--success-bg)"
            : status === "error" ? "var(--error-bg)"
            : "transparent",
          borderRadius: "var(--radius-full)",
          padding: "2px 8px",
          border: `1px solid ${status === "loading" ? "rgba(255,170,0,0.2)"
            : status === "done" ? "rgba(0,208,132,0.2)"
            : status === "error" ? "rgba(255,77,106,0.2)"
            : "transparent"}`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: statusColor,
            animation: status === "loading" ? "statusPulse 2s ease infinite" : "none",
          }} />
          <span style={{ fontFamily: "var(--font-geist)", fontSize: 11, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Terminal window */}
      <div style={{
        flex: 1, minHeight: 0,
        background: "#04060a",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Title bar */}
        <div style={{
          height: 36, flexShrink: 0,
          background: "linear-gradient(180deg,#0d0f16,#080a10)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[["#ff5f57","#e0443e"], ["#febc2e","#d4a017"], ["#28c840","#1da832"]].map(([bg, hover], i) => (
              <span key={i} style={{
                width: 11, height: 11, borderRadius: "50%",
                background: bg,
                border: "1px solid rgba(0,0,0,0.3)",
                cursor: "default", display: "block",
                transition: "filter 100ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.filter = ""; }}
              />
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-tertiary)" }}>
            BWA Pipeline
          </span>
          <button
            onClick={() => { setCleared(true); setVisibleLogs([]); }}
            title="Clear logs"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--text-tertiary)", display: "flex", alignItems: "center",
              transition: "color var(--dur-fast)", padding: 4,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--error)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)"; }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Scroll area */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: "auto", padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: 0,
          }}
        >
          {visibleLogs.length === 0 ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "100%", color: "var(--text-tertiary)",
              fontFamily: "var(--font-geist-mono)", fontSize: 13,
            }}>
              <span style={{
                display: "inline-block", width: 8, height: 14,
                background: "var(--brand-500)", borderRadius: 1,
                verticalAlign: "middle",
                animation: "cursorBlink 1.1s step-end infinite",
              }} />
            </div>
          ) : (
            visibleLogs.map((line, i) => (
              <LogLineItem key={line.id} line={line} isLast={i === visibleLogs.length - 1} />
            ))
          )}
        </div>

        {/* Status bar */}
        <div style={{
          height: 30, flexShrink: 0,
          background: "#04060a",
          borderTop: "1px solid var(--border-subtle)",
          padding: "0 16px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: statusColor,
              animation: status === "loading" ? "statusPulse 2s ease infinite" : "none",
            }} />
            <span style={{ fontFamily: "var(--font-geist)", fontSize: 11, color: "var(--text-tertiary)" }}>
              {statusLabel} — {visibleLogs.length} events · {visibleLogs.length} lines
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
