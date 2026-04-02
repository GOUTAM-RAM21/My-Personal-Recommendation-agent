"use client";
import { motion } from "framer-motion";
import { Download, Clock, ImageOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { GenerateStatus } from "@/hooks/useSSEGenerate";

// ── Strip ugly image-generation error blocks before rendering ──────────────
function cleanMarkdown(raw: string): string {
  let md = raw;

  // Pattern 1: [[> [IMAGE GENERATION FAILED] ... ]] — un-replaced placeholder that
  // leaked into the final string (contains raw JSON / 429 error body)
  md = md.replace(/\[\[>[\s\S]*?\]\]/g, (match) => {
    const captionMatch = match.match(/Figure\s*\d*:?\s*([^\n[\]]+)/i);
    const caption = captionMatch ? captionMatch[1].trim() : "Image";
    return `\n> 📷 **Figure: ${caption}**  \n> \`Image unavailable — API quota exceeded\`\n`;
  });

  // Pattern 2: > **[IMAGE GENERATION FAILED]** ... multi-line blockquote
  // This is what the OLD backend wrote — handle it for already-saved files
  md = md.replace(
    /> \*\*\[IMAGE GENERATION FAILED\]\*\*[\s\S]*?(?=\n(?!>)|\n*$)/g,
    (match) => {
      const captionMatch = match.match(/Figure[^:]*:\s*([^\n]+)/);
      const caption = captionMatch ? captionMatch[1].trim() : "Image";
      return `> 📷 **Figure: ${caption}**  \n> \`Image unavailable — API quota exceeded\``;
    }
  );

  // Pattern 3: bare 429 error JSON that slipped into body text
  md = md.replace(/'error':.*?'RESOURCE_EXHAUSTED'.*?\}\}/gs, "");
  md = md.replace(/\{'error':[\s\S]*?\}\}/g, "");

  return md;
}

function wordCount(md: string) {
  return md.replace(/[#*`>\[\]()_~]/g, "").split(/\s+/).filter(Boolean).length;
}

function readTime(words: number) {
  return Math.max(1, Math.round(words / 200));
}

function Empty({ status }: { status: GenerateStatus }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 12, color: "var(--text-tertiary)",
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.06)" stroke="rgba(0,194,255,0.12)" />
        <rect x="10" y="10" width="20" height="20" rx="3" stroke="rgba(0,194,255,0.3)" strokeWidth="1.5"/>
        <line x1="14" y1="16" x2="26" y2="16" stroke="rgba(0,194,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="14" y1="20" x2="22" y2="20" stroke="rgba(0,194,255,0.2)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="14" y1="24" x2="24" y2="24" stroke="rgba(0,194,255,0.2)" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <p style={{ fontFamily: "var(--font-geist)", fontSize: 14, textAlign: "center" }}>
        {status === "loading" ? "Writing your blog…" : "Generated blog will appear here"}
      </p>
    </div>
  );
}

export default function MarkdownTab({ markdown, status }: { markdown: string; status: GenerateStatus }) {
  if (!markdown) return <Empty status={status} />;

  const clean = cleanMarkdown(markdown);
  const words = wordCount(clean);
  const mins  = readTime(words);

  const download = () => {
    const blob = new Blob([clean], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "blog.md";
    a.click();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{
        padding: "12px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, background: "var(--bg-elevated)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={12} style={{ color: "var(--text-tertiary)" }} />
            <span style={{ fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-tertiary)" }}>
              {mins} min read
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-tertiary)" }}>
            {words.toLocaleString()} words
          </span>
          {clean !== markdown && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              background: "var(--warning-bg)",
              border: "1px solid rgba(255,170,0,0.2)",
            }}>
              <ImageOff size={10} style={{ color: "var(--warning)" }} />
              <span style={{ fontFamily: "var(--font-geist)", fontSize: 10, color: "var(--warning)" }}>
                Some images unavailable (API quota)
              </span>
            </div>
          )}
        </div>

        <motion.button
          onClick={download}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{
            height: 30, padding: "0 12px",
            display: "flex", alignItems: "center", gap: 5,
            background: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            fontFamily: "var(--font-geist)", fontSize: 12, color: "var(--text-secondary)",
            transition: "all var(--dur-fast)",
          }}
          onHoverStart={(e) => {
            const b = e.target as HTMLButtonElement;
            b.style.borderColor = "var(--brand-500)";
            b.style.color = "var(--brand-500)";
          }}
          onHoverEnd={(e) => {
            const b = e.target as HTMLButtonElement;
            b.style.borderColor = "var(--border-default)";
            b.style.color = "var(--text-secondary)";
          }}
        >
          <Download size={12} />
          Download .md
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px", maxWidth: 860, margin: "0 auto", width: "100%" }}>
        <motion.article
          className="prose-bwa"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ReactMarkdown>{clean}</ReactMarkdown>
        </motion.article>
      </div>
    </div>
  );
}
