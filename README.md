# Poker Coach — PokerSense AI

A finalized RAG-powered live poker coach built on **ChromaDB vector search + BM25 keyword search** with **70/30 hybrid fusion**, a pure-Python Texas Hold'em engine, Monte Carlo equity simulation, opponent profiling, and Gemini 4-section prompt synthesis.

> **`conv.md` is the single source of truth** for every design decision in this project: the 70/30 weighted hybrid retrieval (5 vector + 5 BM25 candidates fused to the best 5), the 4-section Gemini prompt (CURRENT HAND / OPPONENT SUMMARY / RETRIEVED BOOK KNOWLEDGE / COACH INSTRUCTIONS), and conflict resolution that always prioritizes the live hand situation over theoretical book excerpts.

---

## Architecture

```
Books/ (7 canonical poker PDFs)
   │
   ▼
src/  — RAG CORE (shared library + ingestion CLI)
   ├── config.py     # Paths, chunking params, 70/30 weights — single config
   ├── parser.py     # PyMuPDF extraction + metadata cleaning
   ├── chunker.py    # ~1000 char chunks, 200 overlap, deterministic IDs
   ├── ingest.py     # Incremental ChromaDB upserts + BM25 index sync (MD5 manifest)
   └── retriever.py  # THE HybridRetriever (used by CLI and backend)
   │
   ▼
backend/  — FastAPI API LAYER
   ├── main.py           # All REST endpoints
   ├── rag/coach.py      # 4-section Gemini prompt + deterministic GTO fallback
   └── poker/            # Pure-Python engine, equity, bluff, stats
   │
   ▼
frontend/  — React + TypeScript + Tailwind + Zustand UI
   Live table → action tracker → AI HUD (RAG advice) → showdown → analytics
```

### The RAG pipeline (per conv.md)

1. **Hybrid retrieval** — 5 ChromaDB vector hits + 5 BM25 hits, each min-max normalized within its own result set, fused as `0.70·vector + 0.30·bm25`, top 5 deduplicated chunks returned.
2. **Prompt synthesis** — a fixed 4-section template (CURRENT HAND, OPPONENT SUMMARY, RETRIEVED BOOK KNOWLEDGE, COACH INSTRUCTIONS) is assembled and sent to Gemini (if `GEMINI_API_KEY` is set); otherwise a deterministic GTO decision engine answers.
3. **Conflict resolution** — the coach instructions explicitly prioritize the actual hand context (pot odds, live opponent tendencies) and use book excerpts as strategic guidance.

---

## Setup

```bash
# 1. Python environment
uv venv
uv pip install -r requirements.txt

# 2. Configure
copy .env.example .env   # set GEMINI_API_KEY for Gemini synthesis (optional)

# 3. Build the knowledge base (idempotent, MD5-checksummed)
uv run python -m src.ingest              # all books
uv run python -m src.ingest --sample     # smallest book only
uv run python -m src.ingest --book "Harrington"
uv run python -m src.ingest --force      # full rebuild
```

This produces:
- `data/chroma_db/` — persistent ChromaDB collection (`poker_coach_knowledge`, ~5,020 chunks)
- `data/bm25_index.pkl` — synchronized BM25Okapi corpus
- `data/ingestion_manifest.json` — MD5 manifest for incremental ingestion

## Run

```bash
# Backend (FastAPI on 127.0.0.1:8000)
uv run uvicorn backend.main:app --reload

# Frontend (Vite on 5173, proxies /api → 8000)
cd frontend && npm install && npm run dev

# Retrieval CLI
uv run python test_retrieval.py --query "calculating pot odds with a flush draw"

# Backend integration test (requires server running)
uv run python test_backend_direct.py
```

## API Surface

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Status, chunk count, weights |
| POST | `/api/v1/game/start` \| `/action` \| `/showdown` | Stateless game engine |
| POST | `/api/v1/ai/analyze-full` | Full RAG pipeline (equity → math → profile → 70/30 retrieval → Gemini synthesis) |
| POST | `/api/v1/ai/win-probability` | Monte Carlo equity |
| GET/POST | `/api/v1/stats/*` | Opponent profiles, notes, hand history, session analytics |
| POST | `/api/coach/advise` | Direct 4-section RAG coaching |
| POST | `/api/equity`, `/api/retrieve` | Direct equity / hybrid retrieval access |

## Knowledge Base

| Book | Author | Chunks |
|---|---|---|
| Modern Poker Theory | Michael Acevedo | 1,136 |
| The Mathematics of Poker | Bill Chen, Jerrod Ankenman | 1,339 |
| Applications of No-Limit Hold'em | Matthew Janda | 1,005 |
| The Theory of Poker | David Sklansky | 702 |
| Harrington on Hold'em | Dan Harrington | 694 |
| Poker Math | James Chesterton | 68 |
| STOP | Ed Miller, James Sweeney et al. | 76 |

## Project Layout

```
Poker Coach/
├── conv.md                  # SOURCE OF TRUTH — all design decisions
├── Books/                   # 7 canonical poker PDFs
├── data/                    # chroma_db/, bm25_index.pkl, ingestion_manifest.json
├── src/                     # RAG core: config, parser, chunker, ingest, retriever
├── backend/                 # FastAPI: main, rag/coach, poker engine modules
├── frontend/                # React UI (live table, HUD, analytics, theory course)
├── test_retrieval.py        # Hybrid retrieval CLI verification
├── test_backend_direct.py   # End-to-end API integration test
├── requirements.txt
└── .env                     # EMBEDDING_PROVIDER, GEMINI_API_KEY, weights
```
