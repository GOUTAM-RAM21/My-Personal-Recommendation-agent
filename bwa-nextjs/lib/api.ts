const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateRequest {
  topic: string;
  as_of: string;
}

export interface BlogMeta {
  filename: string;
  title: string;
  modified: number;
}

export async function listBlogs(): Promise<BlogMeta[]> {
  const r = await fetch(`${BASE}/api/blogs`);
  if (!r.ok) return [];
  return r.json();
}

export async function getBlog(filename: string): Promise<string> {
  const r = await fetch(`${BASE}/api/blogs/${encodeURIComponent(filename)}`);
  if (!r.ok) throw new Error("Blog not found");
  const j = await r.json();
  return j.content;
}

export function streamGenerate(
  body: GenerateRequest,
  onEvent: (data: Record<string, unknown>) => void,
  onDone: () => void,
  onError: (e: string) => void
): AbortController {
  const ctrl = new AbortController();

  fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) { onError(`HTTP ${res.status}`); return; }
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) { onDone(); break; }
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.startsWith("data: ") ? part.slice(6) : part;
          if (!line.trim()) continue;
          try { onEvent(JSON.parse(line)); } catch { /* skip */ }
        }
      }
    })
    .catch((e) => { if (e.name !== "AbortError") onError(String(e)); });

  return ctrl;
}
