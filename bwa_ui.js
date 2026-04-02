// ── Mock Data ──────────────────────────────────────────
const MOCK_PLAN = {
  blog_title: "Unlocking Faster LLM Inference with NVIDIA NIM",
  audience: "ML Engineers & DevOps",
  tone: "Technical, Authoritative",
  blog_kind: "explainer",
  tasks: [
    { id:1, title:"What is NVIDIA NIM?", target_words:200, requires_research:true, requires_citations:true, requires_code:false, tags:["intro","nvidia"] },
    { id:2, title:"Architecture Deep Dive: TensorRT-LLM", target_words:350, requires_research:true, requires_citations:true, requires_code:true, tags:["architecture","tensorrt"] },
    { id:3, title:"Benchmark: Tokens/Sec vs Raw llama.cpp", target_words:280, requires_research:true, requires_citations:false, requires_code:true, tags:["benchmarks","performance"] },
    { id:4, title:"Deploying NIM on Kubernetes", target_words:320, requires_research:false, requires_citations:false, requires_code:true, tags:["devops","k8s"] },
    { id:5, title:"Cost Analysis: NIM vs Self-Hosted", target_words:240, requires_research:true, requires_citations:true, requires_code:false, tags:["cost","comparison"] },
    { id:6, title:"Integration with LangChain & LangGraph", target_words:300, requires_research:false, requires_citations:false, requires_code:true, tags:["langchain","agents"] },
  ]
};

const MOCK_EVIDENCE = [
  { title:"NVIDIA NIM: Production-Grade AI Inference", url:"https://developer.nvidia.com/nim", published_at:"2026-03-28", snippet:"NVIDIA NIM microservices enable optimized inference on any cloud or on-prem NVIDIA GPU infrastructure." },
  { title:"TensorRT-LLM Performance Benchmarks 2026", url:"https://github.com/NVIDIA/TensorRT-LLM", published_at:"2026-03-15", snippet:"Up to 5x throughput gains vs baseline HuggingFace transformers on A100 GPUs." },
  { title:"Llama 3.3 70B on NIM: Latency Analysis", url:"https://blogs.nvidia.com/nim-llama-33", published_at:"2026-02-20", snippet:"First-token latency under 400ms on H100 SXM with quantization enabled." },
  { title:"LangChain NIM Integration Guide", url:"https://python.langchain.com/docs/integrations/nvidia-nim", published_at:"2026-03-01", snippet:"ChatNVIDIA class enables seamless drop-in replacement for any OpenAI-compatible workflow." },
];

const MOCK_MD = `# Unlocking Faster LLM Inference with NVIDIA NIM

> **Read time: ~8 min** | Published: April 2, 2026 | By BWA Agent

## What is NVIDIA NIM?

NVIDIA NIM (NVIDIA Inference Microservices) is a suite of containerized microservices designed to optimize price-performance for large language model inference on NVIDIA GPU infrastructure.

Rather than running raw HuggingFace transformers, NIM wraps your model in a **TensorRT-LLM compiled engine** that slashes latency by 2–5× while dramatically improving throughput. Think of it as a pit-crew for your LLM — same race car, tuned to perfection.

## Architecture Deep Dive: TensorRT-LLM

TensorRT-LLM is the secret sauce. It compiles your model weights into a highly optimized CUDA kernel graph that:

- **Fuses attention** — multi-head attention computed in a single kernel
- **In-flight batching** — handles requests of varying lengths without padding waste
- **FP8 quantization** — halves memory footprint on Hopper GPUs with < 1% accuracy loss

\`\`\`python
from langchain_nvidia_ai_endpoints import ChatNVIDIA

llm = ChatNVIDIA(
    model="meta/llama-3.3-70b-instruct",
    api_key="nvapi-...",
    base_url="https://integrate.api.nvidia.com/v1"
)

response = llm.invoke("Explain transformer attention in 2 sentences.")
print(response.content)
\`\`\`

## Benchmark: Tokens/Sec vs Raw llama.cpp

| Setup | Tokens/sec | P50 TTFT |
|-------|-----------|---------|
| llama.cpp (Q4_K_M) | 42 | 850ms |
| HuggingFace bf16 | 28 | 1200ms |
| **NVIDIA NIM (FP8)** | **218** | **380ms** |

> Source: [NVIDIA Developer Blog](https://developer.nvidia.com/nim)

## Integration with LangChain & LangGraph

Swapping NIM into your existing LangGraph pipeline is trivial — it exposes an **OpenAI-compatible REST API**, so any \`ChatOpenAI\` call just needs a \`base_url\` change.
`;

const MOCK_LOGS = [
  { type:"dim",  text:"[00:00.000] Initializing BWA pipeline…" },
  { type:"node", text:"[00:00.312] → Node: router" },
  { type:"dim",  text:'[00:01.204] RouterDecision: mode="hybrid", needs_research=true' },
  { type:"dim",  text:"[00:01.205] Generated 6 search queries" },
  { type:"node", text:"[00:01.210] → Node: research" },
  { type:"dim",  text:"[00:03.881] Tavily: query 1/6 done (5 results)" },
  { type:"dim",  text:"[00:05.112] Tavily: query 2/6 done (5 results)" },
  { type:"dim",  text:"[00:06.990] Tavily: query 3/6 done (4 results)" },
  { type:"dim",  text:"[00:08.441] Evidence synthesized: 14 items → dedup → 11 unique" },
  { type:"node", text:"[00:08.450] → Node: orchestrator" },
  { type:"dim",  text:"[00:11.203] Plan created: 6 tasks, blog_kind=explainer" },
  { type:"node", text:"[00:11.210] → Node: worker (task 1) [fan-out ×6]" },
  { type:"dim",  text:"[00:11.211] Workers 1-6 running in parallel…" },
  { type:"ok",   text:"[00:18.334] ✓ Section 3 done (298 words)" },
  { type:"ok",   text:"[00:19.112] ✓ Section 1 done (212 words)" },
  { type:"ok",   text:"[00:20.445] ✓ Section 5 done (248 words)" },
  { type:"ok",   text:"[00:22.001] ✓ Section 2 done (361 words)" },
  { type:"ok",   text:"[00:23.778] ✓ Section 4 done (315 words)" },
  { type:"ok",   text:"[00:24.990] ✓ Section 6 done (308 words)" },
  { type:"node", text:"[00:25.001] → Node: reducer/merge_content" },
  { type:"node", text:"[00:25.100] → Node: reducer/decide_images" },
  { type:"dim",  text:"[00:28.444] Image plan: 2 diagrams requested" },
  { type:"node", text:"[00:28.450] → Node: reducer/generate_and_place_images" },
  { type:"ok",   text:"[00:41.220] ✓ Image 1 generated: nim_architecture.png" },
  { type:"ok",   text:"[00:54.881] ✓ Image 2 generated: benchmark_chart.png" },
  { type:"ok",   text:"[00:55.001] ✓ Blog saved: unlocking_faster_llm_inference_with_nvidia_nim.md" },
  { type:"ok",   text:"[00:55.002] ✅ Pipeline complete." },
];

const MOCK_PAST_BLOGS = [
  { name:"How NVIDIA NIM makes inference faster", active:true },
  { name:"LangGraph Multi-Agent Patterns 2026", active:false },
  { name:"RAG vs Fine-Tuning: When to use each", active:false },
  { name:"Deploying Llama 3.3 on K8s", active:false },
];

const MOCK_IMAGES = [
  { src:"https://picsum.photos/seed/nim1/600/400", alt:"NIM Architecture Diagram" },
  { src:"https://picsum.photos/seed/bench2/600/350", alt:"Benchmark Chart: Tokens/Sec" },
];

// ── Tabs ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Sidebar past blogs ──────────────────────────────────
function renderPastBlogs() {
  const list = document.getElementById('past-blogs-list');
  MOCK_PAST_BLOGS.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'past-blog-item' + (b.active ? ' active' : '');
    el.style.animationDelay = (0.5 + i * 0.07) + 's';
    el.innerHTML = `<span class="past-blog-dot"></span><span class="past-blog-name">${b.name}</span>`;
    el.addEventListener('click', () => {
      document.querySelectorAll('.past-blog-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
    });
    list.appendChild(el);
  });
}
renderPastBlogs();

// ── Plan Tab ────────────────────────────────────────────
function renderPlan() {
  document.getElementById('blog-title-display').textContent = MOCK_PLAN.blog_title;
  document.getElementById('chip-audience').querySelector('.chip-val').textContent = MOCK_PLAN.audience;
  document.getElementById('chip-tone').querySelector('.chip-val').textContent = MOCK_PLAN.tone;
  document.getElementById('chip-kind').querySelector('.chip-val').textContent = MOCK_PLAN.blog_kind;

  const tbody = document.getElementById('plan-tbody');
  MOCK_PLAN.tasks.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = (0.1 + i * 0.06) + 's';
    tr.innerHTML = `
      <td>#${t.id}</td>
      <td>${t.title}</td>
      <td>${t.target_words}</td>
      <td><span class="status-dot ${t.requires_research?'on':'off'}"></span></td>
      <td><span class="status-dot ${t.requires_citations?'on':'off'}"></span></td>
      <td><span class="status-dot ${t.requires_code?'on':'off'}"></span></td>
      <td>${t.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}</td>
    `;
    tbody.appendChild(tr);
  });

  // JSON block
  const jsonBlock = document.getElementById('json-block');
  const pretty = JSON.stringify(MOCK_PLAN, null, 2);
  jsonBlock.innerHTML = `<button class="copy-btn" onclick="copyJSON()">Copy</button>` +
    syntaxHighlight(pretty);
}

function syntaxHighlight(json) {
  return json
    .replace(/("[\w_]+")\s*:/g, '<span class="json-key">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="json-str">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>')
    .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="json-num">$1</span>');
}

function copyJSON() {
  navigator.clipboard.writeText(JSON.stringify(MOCK_PLAN, null, 2));
  const btn = document.querySelector('.copy-btn');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 1500);
}

// ── Accordion ───────────────────────────────────────────
document.getElementById('accordion-toggle').addEventListener('click', function() {
  this.classList.toggle('open');
  document.getElementById('accordion-body').classList.toggle('open');
});

// ── Evidence Tab ────────────────────────────────────────
function renderEvidence() {
  const grid = document.getElementById('evidence-grid');
  MOCK_EVIDENCE.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'evidence-card';
    card.style.animationDelay = (0.05 + i * 0.08) + 's';
    card.innerHTML = `
      <div class="evidence-title">${e.title}</div>
      <div class="evidence-url">${e.url}</div>
      <div class="evidence-snippet">${e.snippet}</div>
      <div class="evidence-date">📅 ${e.published_at}</div>
    `;
    grid.appendChild(card);
  });
}

// ── Markdown Preview ────────────────────────────────────
function renderMarkdown() {
  const wpl = Math.round(MOCK_MD.split(' ').length / 200);
  document.getElementById('readtime').textContent = `⏱ ${wpl} min read`;
  const container = document.getElementById('md-content');
  // Basic MD → HTML conversion
  let html = MOCK_MD
    .replace(/^# (.+)$/m, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```python([\s\S]+?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\| (.+)$/gm, '') // skip table lines simple
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupb])/gm, '');
  container.innerHTML = `<p>${html}</p>`;
}

// ── Images Tab ──────────────────────────────────────────
function renderImages() {
  const grid = document.getElementById('images-grid');
  MOCK_IMAGES.forEach((img, i) => {
    const item = document.createElement('div');
    item.className = 'img-item';
    item.style.animationDelay = (0.1 + i * 0.15) + 's';
    item.innerHTML = `
      <img src="${img.src}" alt="${img.alt}" loading="lazy"/>
      <div class="img-overlay"><span>🔍 View Full</span></div>
    `;
    item.addEventListener('click', () => openLightbox(img.src, img.alt));
    grid.appendChild(item);
  });
}

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  lb.querySelector('img').src = src;
  lb.querySelector('img').alt = alt;
  lb.classList.add('open');
}
document.getElementById('lightbox-close').addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('open');
});
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});

// ── Logs Tab ────────────────────────────────────────────
function renderLogs() {
  const terminal = document.getElementById('terminal');
  let i = 0;
  function addLine() {
    if (i >= MOCK_LOGS.length) {
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      terminal.appendChild(cursor);
      return;
    }
    const log = MOCK_LOGS[i++];
    const line = document.createElement('div');
    line.className = 'term-line';
    const cls = log.type === 'node' ? 'term-node' : log.type === 'ok' ? 'term-ok' : log.type === 'err' ? 'term-err' : 'term-dim';
    line.innerHTML = `<span class="${cls}">${log.text}</span>`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    setTimeout(addLine, 60);
  }
  setTimeout(addLine, 400);
}

// ── Generate Button Simulation ──────────────────────────
const genBtn = document.getElementById('generate-btn');
const progressWrap = document.getElementById('progress-wrap');
const progressFill = document.getElementById('progress-fill');

genBtn.addEventListener('click', () => {
  if (genBtn.classList.contains('running')) return;
  const topic = document.getElementById('topic-input').value.trim();
  if (!topic) { document.getElementById('topic-input').focus(); return; }

  genBtn.classList.add('running');
  genBtn.textContent = '⚙ Generating…';
  progressWrap.style.display = 'block';

  let pct = 0;
  const nodes = ['Router','Research','Orchestrator','Workers (×6)','Reducer','Images'];
  let ni = 0;

  const interval = setInterval(() => {
    pct += Math.random() * 12 + 3;
    if (pct >= 100) { pct = 100; clearInterval(interval); }
    progressFill.style.width = pct + '%';

    const nodeIdx = Math.floor((pct / 100) * nodes.length);
    if (nodeIdx !== ni && nodeIdx < nodes.length) {
      ni = nodeIdx;
      genBtn.textContent = `⚙ ${nodes[ni]}…`;
    }

    if (pct >= 100) {
      setTimeout(() => {
        genBtn.classList.remove('running');
        genBtn.textContent = '🚀 Generate Blog';
        progressWrap.style.display = 'none';
        progressFill.style.width = '0%';
        document.getElementById('status-banner').style.display = 'flex';
      }, 600);
    }
  }, 300);
});

// ── Init ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderPlan();
  renderEvidence();
  renderMarkdown();
  renderImages();
  renderLogs();
});
