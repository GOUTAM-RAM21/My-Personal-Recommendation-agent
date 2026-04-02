from __future__ import annotations
import asyncio
import json
import os
import threading
import queue as _queue
from datetime import date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from bwa_backend import app as langgraph_app

app = FastAPI(title="BWA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    topic: str
    as_of: Optional[str] = None


def _initial_state(body: GenerateRequest) -> dict:
    return {
        "topic": body.topic.strip(),
        "mode": "",
        "needs_research": False,
        "queries": [],
        "evidence": [],
        "plan": None,
        "as_of": body.as_of or date.today().isoformat(),
        "recency_days": 7,
        "sections": [],
        "merged_md": "",
        "md_with_placeholders": "",
        "image_specs": [],
        "final": "",
    }


def _serialize(obj):
    """Recursively serialize Pydantic models and standard types."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    return obj


def _deep_extract(d: dict, keys: list) -> dict:
    """
    Walk any dict (including nested subgraph updates) and collect
    the first value found for each key in 'keys'.
    e.g. {"reducer": {"generate_and_place_images": {"final": "..."}}}
    → {"final": "..."}
    """
    found = {}
    if not isinstance(d, dict):
        return found
    for k, v in d.items():
        if k in keys:
            found[k] = v
        elif isinstance(v, dict):
            found.update(_deep_extract(v, [key for key in keys if key not in found]))
    return found


@app.post("/api/generate")
async def generate(body: GenerateRequest):
    """Stream LangGraph pipeline events as SSE — one event per node step."""
    initial = _initial_state(body)

    async def event_stream():
        q: _queue.Queue = _queue.Queue()

        def _run():
            try:
                for step in langgraph_app.stream(initial, stream_mode="updates"):
                    q.put(step)
            except Exception as exc:
                q.put({"__error__": str(exc)})
            finally:
                q.put(None)

        t = threading.Thread(target=_run, daemon=True)
        t.start()

        loop = asyncio.get_event_loop()
        HEARTBEAT = 15    # seconds per poll / keep-alive ping
        MAX_WAIT  = 1800  # 30 minutes hard cap
        elapsed   = 0

        while elapsed < MAX_WAIT:
            try:
                item = await loop.run_in_executor(None, q.get, True, HEARTBEAT)
            except Exception:
                # Nothing arrived in HEARTBEAT seconds — send SSE comment to keep conn alive
                yield ": heartbeat\n\n"
                elapsed += HEARTBEAT
                continue

            if item is None:
                yield f"data: {json.dumps({'__done__': True})}\n\n"
                break

            if isinstance(item, dict) and "__error__" in item:
                fallback = _try_disk_fallback()
                if fallback:
                    item["__fallback_md__"] = fallback
                yield f"data: {json.dumps(item)}\n\n"
                break

            serialized = _serialize(item)
            KEY_FIELDS = ["plan", "evidence", "final", "image_specs",
                          "mode", "sections", "merged_md"]
            extracted = _deep_extract(serialized, KEY_FIELDS)
            if extracted:
                serialized["__extracted__"] = extracted

            yield f"data: {json.dumps(serialized, default=str)}\n\n"
            elapsed = 0  # reset on successful event
            await asyncio.sleep(0)
        else:
            # Hard timeout — try disk recovery
            fallback_md = _try_disk_fallback()
            if fallback_md:
                yield f"data: {json.dumps({'__extracted__': {'final': fallback_md}, '__timeout_recovered__': True})}\n\n"
                yield f"data: {json.dumps({'__done__': True})}\n\n"
            else:
                yield f"data: {json.dumps({'__error__': 'Generation timed out (30 min). Blog may be saved on disk.'})}\n\n"



    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def _try_disk_fallback() -> str:
    """Read the most recently modified .md blog saved by generate_and_place_images."""
    cwd = Path(__file__).parent
    mds = sorted(cwd.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    mds = [f for f in mds if f.stem.lower() not in ("readme", "agents", "claude")]
    if mds:
        try:
            return mds[0].read_text(encoding="utf-8")
        except Exception:
            pass
    return ""


@app.get("/api/blogs")
async def list_blogs():
    cwd = Path(__file__).parent
    files = sorted(cwd.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    result = []
    for f in files[:50]:
        title = f.stem.replace("_", " ").title()
        try:
            for line in f.read_text(encoding="utf-8").splitlines():
                if line.startswith("# "):
                    title = line[2:].strip()
                    break
        except Exception:
            pass
        result.append({"filename": f.name, "title": title,
                        "modified": int(f.stat().st_mtime)})
    return result


@app.get("/api/blogs/{filename}")
async def get_blog(filename: str):
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = Path(__file__).parent / filename
    if not path.exists() or path.suffix != ".md":
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"content": path.read_text(encoding="utf-8")}


@app.get("/api/health")
async def health():
    return {"status": "ok", "nvidia_key": bool(os.getenv("NVIDIA_API_KEY"))}
