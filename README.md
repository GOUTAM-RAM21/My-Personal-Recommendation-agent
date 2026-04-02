# BWA — Blog Writing Agent

> **LangGraph-powered multi-agent AI system** that autonomously researches topics and writes full technical blog posts with a world-class Next.js command center UI.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/Agents-LangGraph-4B32C3?logo=langchain)](https://langchain-ai.github.io/langgraph/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)

---

## ✨ What It Does

BWA uses a **multi-agent LangGraph pipeline** that:

1. **ROUTER** — decides between open-book research or closed-book generation
2. **RESEARCH** — queries Tavily API for live web sources
3. **ORCHESTRATOR** — creates a structured blog plan (title, tone, tasks)
4. **WORKER(s)** — parallel worker agents write each section
5. **REDUCER** — merges sections, decides image placement, generates images via Gemini

All events stream **live** to the Next.js frontend via **Server-Sent Events (SSE)**.

---

## 🗂 Project Structure

```
 Agentic AI Project/
├── bwa_backend.py          # LangGraph agent pipeline
├── bwa_server.py           # FastAPI SSE streaming server
├── requirements.txt        # Python backend dependencies
├── .env                    # API keys (not committed)
│
├── bwa-nextjs/             # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx      # Fonts: Bricolage Grotesque + Geist
│   │   ├── page.tsx        # Root app page
│   │   └── globals.css     # Full design token system
│   ├── components/
│   │   ├── NeuralMesh.tsx  # Animated canvas background
│   │   ├── Sidebar.tsx     # Blog input + history
│   │   ├── MainPanel.tsx   # Tab navigation + content
│   │   └── tabs/
│   │       ├── PlanTab.tsx      # Task table (Linear-style)
│   │       ├── EvidenceTab.tsx  # Research sources grid
│   │       ├── MarkdownTab.tsx  # Blog preview + download
│   │       ├── ImagesTab.tsx    # Generated images
│   │       └── LogsTab.tsx      # Live pipeline terminal
│   ├── hooks/
│   │   └── useSSEGenerate.ts   # SSE streaming hook
│   └── lib/
│       └── api.ts               # API client
│
└── notebooks/                   # Development Jupyter notebooks
    ├── 1_bwa_basic.ipynb
    ├── 2_bwa_improved_prompting.ipynb
    ├── 3_bwa_research.ipynb
    ├── 4_bwa_research_fine_tuned.ipynb
    └── 5_bwa_image.ipynb
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# NVIDIA NIM (LLM inference — powers ROUTER, ORCHESTRATOR, WORKER)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxx

# Tavily (web research for RESEARCH node)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini (image generation in REDUCER)
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxx
```

| Variable | Where to get it |
|---|---|
| `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com/) |
| `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com/) |
| `GOOGLE_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

---

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- `pip` and `npm`

### 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/bwa-blog-writing-agent.git
cd bwa-blog-writing-agent
```

### 2 — Backend setup

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Add your API keys
cp .env.example .env
# Edit .env with your keys

# Start FastAPI server
uvicorn bwa_server:app --reload --port 8000
```

Backend runs at **http://localhost:8000**  
API docs at **http://localhost:8000/docs**

### 3 — Frontend setup

```bash
cd bwa-nextjs

# Install dependencies
npm install

# Set backend URL (optional — defaults to localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🚀 Deployment

### Backend → Render

1. **Push your code to GitHub** (see GitHub section below)

2. Go to [render.com](https://render.com) → **New → Web Service**

3. Connect your GitHub repo and configure:

   | Setting | Value |
   |---|---|
   | **Name** | `bwa-backend` |
   | **Region** | Oregon (US West) |
   | **Branch** | `main` |
   | **Root Directory** | *(leave blank — root of repo)* |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn bwa_server:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | `Starter` (free tier) or `Standard` |
   | **Auto-Deploy** | ✅ Yes |

4. **Add Environment Variables** in the Render dashboard:
   ```
   NVIDIA_API_KEY   = nvapi-xxx
   TAVILY_API_KEY   = tvly-xxx
   GOOGLE_API_KEY   = AIzaxxx
   ```

5. Click **Deploy** — Render builds and launches the server. Copy the URL (e.g. `https://bwa-backend.onrender.com`).

> **Important:** Render free tier **spins down after 15 min of inactivity**. Use the Starter plan ($7/mo) to keep it always-on, or add a keep-alive ping via [UptimeRobot](https://uptimerobot.com/).

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**

2. Import your GitHub repo

3. Configure the project:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Next.js` |
   | **Root Directory** | `bwa-nextjs` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` *(auto-detected)* |
   | **Install Command** | `npm install` |
   | **Node.js Version** | `20.x` |

4. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL = https://bwa-backend.onrender.com
   ```
   > Replace with your actual Render backend URL.

5. Click **Deploy** — Vercel builds and deploys. Your app is live at `https://your-project.vercel.app`.

> **CORS note:** After deploying, add your Vercel domain to the CORS `allow_origins` in `bwa_server.py`:
> ```python
> allow_origins=[
>     "http://localhost:3000",
>     "https://your-project.vercel.app",   # ← add this
> ]
> ```

---

## 📦 GitHub Setup

### First time — init and push

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
.venv/
__pycache__/
*.pyc
*.pyo
*.egg-info/
.pytest_cache/

# Environment
.env
.env.local

# Next.js
bwa-nextjs/.next/
bwa-nextjs/node_modules/
bwa-nextjs/out/

# Generated content
images/
*.md
!README.md

# macOS
.DS_Store
EOF

# Add all files
git add .
git commit -m "feat: initial BWA — Blog Writing Agent"

# Create repo on GitHub (requires GitHub CLI)
gh repo create bwa-blog-writing-agent --public --source=. --remote=origin --push

# OR manually: go to github.com/new, create the repo, then:
# git remote add origin https://github.com/YOUR_USERNAME/bwa-blog-writing-agent.git
# git push -u origin main
```

### Environment file template

Create `.env.example` (safe to commit — no real keys):

```bash
cat > .env.example << 'EOF'
# Copy this file to .env and fill in your keys

NVIDIA_API_KEY=nvapi-your-key-here
TAVILY_API_KEY=tvly-your-key-here
GOOGLE_API_KEY=AIza-your-key-here
EOF
```

### Ongoing workflow

```bash
# Make changes, then:
git add .
git commit -m "fix: clean image error blocks from markdown"
git push

# Render and Vercel auto-deploy from main branch ✅
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│              Next.js 14 (Vercel)                        │
│   Sidebar │ Plan │ Evidence │ Markdown │ Images │ Logs  │
└─────────────────────┬───────────────────────────────────┘
                      │  POST /api/generate (SSE stream)
                      │  GET  /api/blogs
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI Server (Render)                    │
│                   bwa_server.py                         │
│   SSE streaming · asyncio.Queue · heartbeat pings       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           LangGraph Pipeline (bwa_backend.py)           │
│                                                         │
│  ┌────────┐   ┌──────────┐   ┌───────────────────────┐ │
│  │ ROUTER │──▶│ RESEARCH │──▶│     ORCHESTRATOR      │ │
│  └────────┘   └──────────┘   └───────────┬───────────┘ │
│                                           │  fan-out    │
│                               ┌───────────▼───────────┐ │
│                               │  WORKER · WORKER · …  │ │
│                               └───────────┬───────────┘ │
│                                           │             │
│                               ┌───────────▼───────────┐ │
│                               │  REDUCER SUBGRAPH     │ │
│                               │  merge → images → out │ │
│                               └───────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                      │
          ┌───────────┼─────────────┐
          ▼           ▼             ▼
   NVIDIA NIM      Tavily        Google
   (LLM text)    (Research)   (Imagen gen)
```

---

## 🎨 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.135.3 | REST API + SSE streaming |
| Uvicorn | 0.42.0 | ASGI server |
| LangGraph | 1.0.7 | Multi-agent orchestration |
| LangChain | 1.2.7 | LLM abstraction layer |
| OpenAI SDK | 2.16.0 | NVIDIA NIM compatible client |
| Google GenAI | 1.61.0 | Gemini image generation |
| Python-dotenv | 1.2.1 | Environment management |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 16.2.2 | App Router framework |
| Framer Motion | 12.x | Animations |
| Lucide React | 1.7.0 | Icons |
| React Markdown | 10.x | Blog content rendering |
| Tailwind CSS | 4.x | Utility CSS |

### Fonts
- **Bricolage Grotesque** — headings and display
- **Geist** — UI labels and body text
- **Geist Mono** — code, timestamps, IDs

---

## ⚙️ API Reference

### `POST /api/generate`
Start blog generation. Returns **SSE stream**.

```json
{
  "topic": "LLMs in healthcare 2026",
  "as_of": "2026-04-02"
}
```

Each SSE event carries a LangGraph update dict. Key fields extracted:
- `plan` — blog plan object
- `evidence` — list of research sources
- `final` — completed markdown string
- `__done__` — stream complete sentinel

### `GET /api/blogs`
List all generated `.md` files.

### `GET /api/blogs/{filename}`
Fetch markdown content of a specific blog.

### `GET /api/health`
```json
{ "status": "ok", "nvidia_key": true }
```

---

## 🐛 Known Issues & Tips

| Issue | Solution |
|---|---|
| Image generation fails (429) | Gemini free tier has low quota. The app gracefully replaces failed images with compact placeholders. Upgrade your Google API plan for production. |
| Backend timeout on long blogs | Extended to 30-minute timeout with 15-second heartbeat pings. Large/complex topics may still be slow. |
| Render cold starts | Free tier sleeps after 15 min. Use UptimeRobot ping or upgrade to Starter plan. |
| CORS error after Vercel deploy | Add your Vercel URL to `allow_origins` in `bwa_server.py` and redeploy backend. |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Built With

- [LangGraph](https://langchain-ai.github.io/langgraph/) — agent orchestration
- [NVIDIA NIM](https://build.nvidia.com/) — fast LLM inference
- [Tavily](https://tavily.com/) — AI-powered web research
- [Google Gemini](https://ai.google.dev/) — image generation
- [Vercel](https://vercel.com/) — frontend hosting
- [Render](https://render.com/) — backend hosting
