"use client";
import { useCallback, useRef, useState } from "react";
import { streamGenerate } from "@/lib/api";

export interface LogLine {
  id: string;
  ts: string;
  node?: string;
  msg: string;
}

export interface PlanData {
  blog_title: string;
  audience: string;
  tone: string;
  blog_kind: string;
  tasks: TaskData[];
}

export interface TaskData {
  id: number;
  title: string;
  target_words: number;
  requires_research: boolean;
  requires_citations: boolean;
  requires_code: boolean;
  tags: string[];
}

export interface EvidenceItem {
  title: string;
  url: string;
  snippet?: string;
  published_at?: string;
  source?: string;
}

export type GenerateStatus = "idle" | "loading" | "done" | "error";

function nowTs() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

const NODE_LABEL: Record<string, string> = {
  router: "ROUTER",
  research: "RESEARCH",
  orchestrator: "ORCHESTRATOR",
  worker: "WORKER",
  reducer: "REDUCER",
  merge_content: "REDUCER",
  decide_images: "REDUCER",
  generate_and_place_images: "REDUCER",
};

export function useSSEGenerate() {
  const [status, setStatus]         = useState<GenerateStatus>("idle");
  const [logs, setLogs]             = useState<LogLine[]>([]);
  const [plan, setPlan]             = useState<PlanData | null>(null);
  const [evidence, setEvidence]     = useState<EvidenceItem[]>([]);
  const [markdown, setMarkdown]     = useState<string>("");
  const [imageSpecs, setImageSpecs] = useState<Record<string, string>[]>([]);
  const ctrl = useRef<AbortController | null>(null);

  const addLog = useCallback((node: string | undefined, msg: string) => {
    const line: LogLine = { id: crypto.randomUUID(), ts: nowTs(), node, msg };
    setLogs((p) => [...p, line]);
  }, []);

  const generate = useCallback((topic: string, asOf: string) => {
    // Abort any in-flight stream
    if (ctrl.current) ctrl.current.abort();

    setStatus("loading");
    setLogs([]);
    setPlan(null);
    setEvidence([]);
    setMarkdown("");
    setImageSpecs([]);

    addLog(undefined, "🚀 Initializing BWA pipeline…");

    ctrl.current = streamGenerate(
      { topic: topic.trim(), as_of: asOf },
      (payload) => {
        // ── sentinel events ──────────────────────────────────────────────
        if (payload.__done__) return;
        if (payload.__error__) {
          // Check if server attached a fallback blog from disk
          if (payload.__fallback_md__) {
            setMarkdown(payload.__fallback_md__ as string);
            addLog(undefined, "📂 Blog recovered from disk (image generation was slow)");
          }
          addLog(undefined, `❌ ${payload.__error__}`);
          setStatus("error");
          return;
        }
        // Timeout recovery — server read blog from disk
        if (payload.__timeout_recovered__) {
          addLog(undefined, "📂 Blog recovered from disk after timeout");
        }

        // ── determine which node fired ───────────────────────────────────
        // Keys: the actual node names + our injected __extracted__ sentinel
        const nodeKey = Object.keys(payload).find(
          (k) => !k.startsWith("__") && k in NODE_LABEL
        ) ?? Object.keys(payload).find((k) => !k.startsWith("__"));
        const nodeLabel = nodeKey ? (NODE_LABEL[nodeKey] ?? nodeKey.toUpperCase()) : undefined;

        // ── prefer server-extracted flat fields ──────────────────────────
        const extracted = (payload.__extracted__ ?? {}) as Record<string, unknown>;

        // Fall back to searching the direct node value
        const nodeValue = nodeKey
          ? (payload[nodeKey] as Record<string, unknown> | undefined) ?? {}
          : {};

        const update: Record<string, unknown> = { ...nodeValue, ...extracted };

        // ── build log message ─────────────────────────────────────────────
        const msgs: string[] = [];
        if (update.mode)        msgs.push(`Mode: ${update.mode}`);
        if (update.plan)        msgs.push(`Plan: "${(update.plan as PlanData)?.blog_title}"`);
        if (update.evidence)    msgs.push(`Evidence: ${(update.evidence as unknown[]).length} sources`);
        if (update.sections)    msgs.push(`Sections: ${(update.sections as unknown[]).length} written`);
        if (update.merged_md)   msgs.push("Content merged ✓");
        if (update.image_specs) msgs.push(`Images: ${(update.image_specs as unknown[]).length} specs`);
        if (update.final)       msgs.push("✅ Blog ready");

        addLog(nodeLabel, msgs.length ? msgs.join(" | ") : `→ ${nodeKey}`);

        // ── update react state ────────────────────────────────────────────
        if (update.plan)        setPlan(update.plan as PlanData);
        if (update.evidence && (update.evidence as unknown[]).length > 0)
          setEvidence(update.evidence as EvidenceItem[]);
        if (update.final)       setMarkdown(update.final as string);
        if (update.image_specs) setImageSpecs(update.image_specs as Record<string, string>[]);
      },
      () => {
        addLog(undefined, "✅ Pipeline complete — check all tabs!");
        setStatus("done");
      },
      (e) => {
        addLog(undefined, `❌ Error: ${e}`);
        setStatus("error");
      }
    );
  }, [addLog]);

  // reset clears state but does NOT call generate
  const reset = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
    setStatus("idle");
    setLogs([]);
    setPlan(null);
    setEvidence([]);
    setMarkdown("");
    setImageSpecs([]);
  }, []);

  return { generate, reset, status, logs, plan, evidence, markdown, imageSpecs };
}
