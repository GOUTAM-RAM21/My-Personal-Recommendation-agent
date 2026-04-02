"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { EvidenceItem, GenerateStatus } from "@/hooks/useSSEGenerate";

function Empty({ status }: { status: GenerateStatus }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 12, color: "var(--text-tertiary)",
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.06)" stroke="rgba(0,194,255,0.12)" />
        <circle cx="18" cy="18" r="7" stroke="rgba(0,194,255,0.3)" strokeWidth="1.5"/>
        <line x1="23" y1="23" x2="30" y2="30" stroke="rgba(0,194,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p style={{ fontFamily: "var(--font-geist)", fontSize: 14, textAlign: "center" }}>
        {status === "loading" ? "Researching sources…" : "No evidence yet — research runs in hybrid/open_book mode"}
      </p>
    </div>
  );
}

export default function EvidenceTab({ evidence, status }: { evidence: EvidenceItem[]; status: GenerateStatus }) {
  if (!evidence.length) return <Empty status={status} />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: "var(--font-geist)", fontSize: 10, fontWeight: 600,
          color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Research Sources
        </span>
        <span style={{
          padding: "1px 7px", borderRadius: "var(--radius-full)",
          background: "var(--success-bg)", border: "1px solid rgba(0,208,132,0.2)",
          fontFamily: "var(--font-geist)", fontSize: 11, color: "var(--success)",
        }}>
          {evidence.length}
        </span>
      </div>

      <motion.div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {evidence.map((item, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } } }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: 16, position: "relative",
              transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
            }}
            onHoverStart={(e) => {
              const el = e.target as HTMLDivElement;
              el.style.borderColor = "var(--border-strong)";
              el.style.boxShadow = "var(--shadow-sm)";
            }}
            onHoverEnd={(e) => {
              const el = e.target as HTMLDivElement;
              el.style.borderColor = "var(--border-default)";
              el.style.boxShadow = "none";
            }}
          >
            {/* Source domain badge */}
            {item.source && (
              <span style={{
                display: "inline-block",
                fontFamily: "var(--font-geist-mono)", fontSize: 10,
                color: "var(--brand-500)",
                padding: "1px 6px", borderRadius: "var(--radius-sm)",
                background: "var(--brand-glow)",
                border: "1px solid rgba(0,194,255,0.15)",
                marginBottom: 8,
              }}>
                {item.source}
              </span>
            )}

            <h3 style={{
              fontFamily: "var(--font-geist)", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)", lineHeight: 1.5,
              marginBottom: 8, display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
            }}>
              {item.title}
            </h3>

            {item.snippet && (
              <p style={{
                fontFamily: "var(--font-geist)", fontSize: 12,
                color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: 12,
                display: "-webkit-box",
                WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
              }}>
                {item.snippet}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
              {item.published_at && (
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--text-tertiary)" }}>
                  {item.published_at}
                </span>
              )}
              {item.url && (
                <a
                  href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--font-geist)", fontSize: 11, color: "var(--brand-500)",
                    textDecoration: "none",
                    transition: "color var(--dur-fast)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--brand-400)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--brand-500)"; }}
                >
                  View source <ExternalLink size={10} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
