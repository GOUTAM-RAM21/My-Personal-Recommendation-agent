"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ImagesTab({ imageSpecs }: { imageSpecs: Record<string, string>[] }) {
  const [lightbox, setLightbox] = useState<Record<string, string> | null>(null);

  if (!imageSpecs.length) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", gap: 12, color: "var(--text-tertiary)",
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.06)" stroke="rgba(0,194,255,0.12)" />
          <rect x="8" y="10" width="24" height="18" rx="3" stroke="rgba(0,194,255,0.3)" strokeWidth="1.5"/>
          <circle cx="15" cy="17" r="3" stroke="rgba(0,194,255,0.3)" strokeWidth="1.2"/>
          <path d="M8 25l7-5 6 5 4-4 7 4" stroke="rgba(0,194,255,0.25)" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
        <p style={{ fontFamily: "var(--font-geist)", fontSize: 14, textAlign: "center" }}>
          No images generated yet
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}>
        {imageSpecs.map((spec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: "easeOut" }}
            onClick={() => setLightbox(spec)}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)", overflow: "hidden",
              cursor: "pointer", transition: "all var(--dur-base)",
            }}
            whileHover={{ borderColor: "var(--border-strong)", boxShadow: "var(--shadow-md)" }}
          >
            <div style={{
              height: 160, background: "var(--bg-overlay)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderBottom: "1px solid var(--border-subtle)",
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="rgba(0,194,255,0.04)"/>
                <rect x="6" y="8" width="28" height="22" rx="3" stroke="rgba(0,194,255,0.2)" strokeWidth="1.2"/>
                <circle cx="14" cy="16" r="3" stroke="rgba(0,194,255,0.25)" strokeWidth="1.2"/>
                <path d="M6 24l9-6 7 6 4-4 9 4" stroke="rgba(0,194,255,0.2)" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {spec.caption && (
                <p style={{
                  fontFamily: "var(--font-geist)", fontSize: 12,
                  color: "var(--text-secondary)", lineHeight: 1.5,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                }}>
                  {spec.caption}
                </p>
              )}
              {spec.alt && (
                <p style={{
                  fontFamily: "var(--font-geist-mono)", fontSize: 10,
                  color: "var(--text-tertiary)", marginTop: 4,
                }}>
                  alt: {spec.alt}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(6,7,9,0.92)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: 24, maxWidth: 600, width: "100%",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div style={{
                height: 280, background: "var(--bg-overlay)",
                borderRadius: "var(--radius-md)", marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid var(--border-subtle)",
              }}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect width="60" height="60" rx="12" fill="rgba(0,194,255,0.06)"/>
                  <rect x="10" y="14" width="40" height="30" rx="5" stroke="rgba(0,194,255,0.2)" strokeWidth="1.5"/>
                  <circle cx="22" cy="25" r="4" stroke="rgba(0,194,255,0.25)" strokeWidth="1.5"/>
                  <path d="M10 37l12-9 10 9 6-6 12 6" stroke="rgba(0,194,255,0.2)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              {lightbox.caption && (
                <p style={{ fontFamily: "var(--font-geist)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {lightbox.caption}
                </p>
              )}
              {lightbox.prompt && (
                <p style={{
                  fontFamily: "var(--font-geist-mono)", fontSize: 11,
                  color: "var(--text-tertiary)", marginTop: 10,
                  padding: "8px 12px", background: "var(--bg-void)",
                  borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)",
                }}>
                  Prompt: {lightbox.prompt}
                </p>
              )}
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
