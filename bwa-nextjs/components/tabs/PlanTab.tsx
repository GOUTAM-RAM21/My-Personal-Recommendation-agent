"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check } from "lucide-react";
import type { GenerateStatus, PlanData, TaskData } from "@/hooks/useSSEGenerate";

/* ── Status dot ── */
function StatusDot({ on }: { on: boolean }) {
  if (on) {
    return (
      <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 13, height: 13, borderRadius: "50%",
          background: "var(--success-bg)",
          border: "1px solid rgba(0,208,132,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)" }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 5, height: 5, borderRadius: "50%",
        background: "var(--bg-hover)",
        border: "1px solid var(--border-default)",
      }} />
    </div>
  );
}

/* ── Tag chip ── */
function TagChip({ tag }: { tag: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-geist-mono)", fontSize: 10,
      padding: "2px 7px", borderRadius: "var(--radius-sm)",
      background: "rgba(0,194,255,0.06)",
      border: "1px solid rgba(0,194,255,0.15)",
      color: "var(--brand-400)",
    }}>
      {tag}
    </span>
  );
}

/* ── JSON accordion ── */
function JsonViewer({ data }: { data: PlanData }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      marginTop: 16,
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-subtle)",
      overflow: "hidden",
      background: "var(--bg-void)",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "10px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-tertiary)",
          transition: "color var(--dur-fast)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)"; }}
      >
        View raw JSON
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ position: "relative" }}>
              <pre style={{
                fontFamily: "var(--font-geist-mono)", fontSize: 11,
                padding: "14px 16px", overflowX: "auto", lineHeight: 1.7,
                color: "var(--text-tertiary)", maxHeight: 320, overflowY: "auto",
              }}>
                {json}
              </pre>
              <button
                onClick={copy}
                style={{
                  position: "absolute", top: 10, right: 10,
                  width: 28, height: 28, borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: copied ? "var(--success)" : "var(--text-tertiary)",
                  transition: "all var(--dur-fast)",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Task table ── */
function TaskTable({ tasks }: { tasks: TaskData[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const cols = [
    { label: "ID",        w: 48   },
    { label: "Title",     w: "1fr" as const },
    { label: "Words",     w: 80   },
    { label: "Research",  w: 90   },
    { label: "Citations", w: 90   },
    { label: "Code",      w: 70   },
    { label: "Tags",      w: "1fr" as const },
  ];

  const gridTemplate = cols.map(c => typeof c.w === "number" ? `${c.w}px` : c.w).join(" ");

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: gridTemplate,
        background: "var(--bg-overlay)",
        borderBottom: "1px solid var(--border-default)",
        padding: "0 16px", height: 36,
      }}>
        {cols.map(c => (
          <div key={c.label} style={{
            display: "flex", alignItems: "center",
            fontFamily: "var(--font-geist)", fontSize: 10, fontWeight: 600,
            color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {c.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
        {tasks.map((t) => {
          const isSelected = selected === t.id;
          return (
            <motion.div
              key={t.id}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } } }}
              onClick={() => setSelected(isSelected ? null : t.id)}
              style={{
                display: "grid", gridTemplateColumns: gridTemplate,
                padding: "0 16px", height: 48, alignItems: "center",
                borderBottom: "1px solid var(--border-subtle)",
                cursor: "pointer", position: "relative",
                background: isSelected ? "rgba(0,194,255,0.04)" : "transparent",
                boxShadow: isSelected ? "inset 1px 0 0 var(--brand-500)" : "none",
                transition: "background var(--dur-fast), box-shadow var(--dur-fast)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                  const bar = e.currentTarget.querySelector<HTMLSpanElement>(".row-accent");
                  if (bar) bar.style.background = "var(--border-strong)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  const bar = e.currentTarget.querySelector<HTMLSpanElement>(".row-accent");
                  if (bar) bar.style.background = "transparent";
                }
              }}
            >
              {/* Left accent bar */}
              <span className="row-accent" style={{
                position: "absolute", left: 0, top: 8, bottom: 8, width: 2,
                background: isSelected ? "var(--brand-500)" : "transparent",
                borderRadius: "0 2px 2px 0",
                transition: "background var(--dur-fast)",
              }} />

              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--text-brand)" }}>
                #{t.id}
              </span>
              <span style={{ fontFamily: "var(--font-geist)", fontSize: 13, color: "var(--text-primary)", paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.title}
              </span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
                {t.target_words}
              </span>
              <div style={{ display: "flex", justifyContent: "center" }}><StatusDot on={t.requires_research} /></div>
              <div style={{ display: "flex", justifyContent: "center" }}><StatusDot on={t.requires_citations} /></div>
              <div style={{ display: "flex", justifyContent: "center" }}><StatusDot on={t.requires_code} /></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(t.tags ?? []).map(g => <TagChip key={g} tag={g} />)}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ── Empty state ── */
function Empty({ status }: { status: GenerateStatus }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 12,
      color: "var(--text-tertiary)",
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.06)" stroke="rgba(0,194,255,0.12)" />
        <rect x="10" y="12" width="20" height="3" rx="1.5" fill="rgba(0,194,255,0.2)" />
        <rect x="10" y="18" width="14" height="3" rx="1.5" fill="rgba(0,194,255,0.12)" />
        <rect x="10" y="24" width="17" height="3" rx="1.5" fill="rgba(0,194,255,0.12)" />
      </svg>
      <p style={{ fontFamily: "var(--font-geist)", fontSize: 14, lineHeight: 1.5, textAlign: "center" }}>
        {status === "loading" ? "Building your plan…" : "Enter a topic and generate to see the plan"}
      </p>
    </div>
  );
}

export default function PlanTab({ plan, status }: { plan: PlanData | null; status: GenerateStatus }) {
  if (!plan) return <Empty status={status} />;

  const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Success banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", borderRadius: "var(--radius-md)",
          background: "var(--success-bg)",
          border: "1px solid rgba(0,208,132,0.2)",
        }}
      >
        <span style={{ color: "var(--success)", fontSize: 16 }}>✓</span>
        <span style={{ fontFamily: "var(--font-geist)", fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
          Plan complete — {tasks.length} sections
        </span>
      </motion.div>

      {/* Plan card */}
      <div style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", padding: 24,
      }}>
        <p style={{
          fontFamily: "var(--font-geist)", fontSize: 10, fontWeight: 600,
          color: "var(--text-tertiary)", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 8,
        }}>
          Blog Plan
        </p>
        <h2 style={{
          fontFamily: "var(--font-bricolage)", fontWeight: 700,
          fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.25,
          color: "var(--text-primary)", marginBottom: 16,
        }}>
          {plan.blog_title}
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {[
            { label: "Audience", val: plan.audience },
            { label: "Tone",     val: plan.tone     },
            { label: "Kind",     val: plan.blog_kind },
          ].map(chip => (
            <div key={chip.label} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: "var(--radius-full)",
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
            }}>
              <span style={{ fontFamily: "var(--font-geist)", fontSize: 11, color: "var(--text-tertiary)" }}>
                {chip.label}:
              </span>
              <span style={{ fontFamily: "var(--font-geist)", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>
                {chip.val}
              </span>
            </div>
          ))}
        </div>

        <TaskTable tasks={tasks} />
        <JsonViewer data={plan} />
      </div>
    </div>
  );
}
