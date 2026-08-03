# 🥕 KidSafe Food Analyzer

Instant, evidence-based ingredient analysis for parents. Browse 109 pre-analyzed packaged foods, paste any ingredient list for an on-demand AI verdict, ask follow-up questions in chat, compare products side by side, and keep favorites and a shopping list.

This is a ground-up rebuild of the original KidSafe-Analyzer (React + Flask + LangChain + Qdrant RAG on Render). The new architecture is a single Next.js app:

| | Old (v1) | New (this repo) |
|---|---|---|
| Hosting | Vercel frontend + Render Flask backend | One Next.js app on Vercel |
| Cold start | 30s+ (Render spins down, re-indexes a PDF) | None — pages are statically generated |
| Model | GPT-4o-mini behind a LangChain/LangGraph ensemble RAG pipeline | Claude Haiku 4.5 with a curated knowledge base in the prompt |
| Grounding | Vector DB + BM25 + Cohere reranking over one FDA PDF | Distilled FDA/AAP/AHA rules in `src/lib/knowledge.ts` |
| Precomputed data | Free-form markdown parsed at render time | Typed, structured JSON (`src/data/products.json`) |
| Analysis output | Markdown blob | Structured JSON enforced by the API's JSON-schema output mode |

## How it works

- **Browse (`/`)** — all 109 products with search, category, verdict, and favorites filters. Product pages are statically generated at build time from `src/data/products.json`, so results are instant with zero API calls.
- **Product detail (`/product/[id]`)** — structured analysis (verdict banner, red flags, added-sugar assessment, per-ingredient breakdown, concerns, positives) plus a streaming chat panel for follow-up questions.
- **Analyze (`/analyze`)** — paste any ingredient list; `/api/analyze` asks Claude Haiku 4.5 for a schema-validated structured analysis (typically a few seconds).
- **Compare (`/compare`)** — up to three products side by side.
- **Saved (`/saved`)** — favorites and shopping list, stored in `localStorage` on the device.

The AI is grounded by `src/lib/knowledge.ts` — a curated rubric of red-flag additives (artificial colors, HFCS, nitrites, BHA/TBHQ, …), AHA/AAP added-sugar rules, sodium guidance, and the top-9 allergens. This replaces v1's entire RAG stack with a prompt the small model follows reliably.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev                   # http://localhost:3000
```

Browsing and product pages work with **no API key**. The key is only needed for the custom analyzer, the chatbot, and the precompute script.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run precompute` | Regenerate the precomputed analyses with Claude Haiku 4.5. By default only refreshes products still carrying migrated v1 data; `-- --force` regenerates everything; `-- --only <id>` targets one product. Progress is saved as it goes, so re-running retries failures only. |
| `python3 scripts/migrate_from_v1.py` | One-off importer that built `src/data/products.json` from the old project's CSV + markdown analyses (kept for provenance; needs the old repo on disk). |

The 109 analyses currently in `src/data/products.json` were migrated from v1 (`"source": "migrated"`). Run `npm run precompute` once with an API key to regenerate them all with Haiku against the current knowledge base (`"source": "haiku-4-5"`) — roughly 110 small requests.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (or run `npx vercel`). No special config — it's a standard Next.js app.
2. In the Vercel project settings, add the environment variable `ANTHROPIC_API_KEY`.
3. Deploy. API routes declare `maxDuration = 60`.

## Project structure

```
src/
├── app/
│   ├── page.tsx               # Browse (server) → ProductBrowser (client)
│   ├── product/[id]/page.tsx  # Statically generated product pages
│   ├── analyze/page.tsx       # Custom ingredient analysis
│   ├── compare/page.tsx       # Side-by-side comparison (?ids=a,b,c)
│   ├── saved/page.tsx         # Favorites + shopping list
│   └── api/
│       ├── analyze/route.ts   # Structured analysis (JSON-schema output)
│       └── chat/route.ts      # Streaming follow-up Q&A
├── components/                # AnalysisView, ChatPanel, ProductBrowser, …
├── lib/
│   ├── knowledge.ts           # Curated food-safety knowledge base (the grounding)
│   ├── analyze.ts             # Shared Haiku analysis call + JSON schema
│   ├── products.ts            # Server-side data access (slim index for the client)
│   ├── storage.ts             # localStorage hook (favorites/list/compare)
│   └── types.ts               # Shared types
└── data/products.json         # 109 products with structured analyses
scripts/
├── precompute.ts              # Regenerate analyses with Haiku
└── migrate_from_v1.py         # One-off v1 data importer
```

## Roadmap: mobile app

The rebuild was designed with a mobile app in mind:

- The API routes (`/api/analyze`, `/api/chat`) are plain JSON/streaming HTTP — a React Native or Expo app can consume them as-is.
- `src/data/products.json` is a self-contained typed dataset that can ship inside an app bundle for offline browsing.
- The responsive UI already works well on phones; adding a web app manifest for install-to-home-screen (PWA) is the cheapest first step, with barcode/label scanning (OCR → `/api/analyze`) as the natural follow-on.

## Disclaimer

Ingredient analysis is informational, not medical advice. Grounded in FDA food-labeling guidance and AAP/AHA recommendations for children.
