<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KidSafe Food Analyzer — project notes

- Single Next.js app (App Router, TypeScript, Tailwind v4). No Python backend — the old KidSafe-Analyzer's Flask/LangChain/Qdrant stack was intentionally removed.
- LLM: Claude Haiku 4.5 (`claude-haiku-4-5`) via `@anthropic-ai/sdk`, grounded by the curated knowledge base in `src/lib/knowledge.ts` (no RAG). Analysis output is enforced with the API's JSON-schema output mode (`output_config.format`) in `src/lib/analyze.ts`.
- `src/data/products.json` (~520KB) must never be imported into client components — client pages receive the slim index from `src/lib/products.ts` via server components.
- Precomputed analyses regenerate with `npm run precompute` (needs ANTHROPIC_API_KEY). Entries carry `source: "migrated"` (parsed from v1) or `"haiku-4-5"` (fresh).
- Favorites / shopping list / compare picks live in localStorage via the `useIdList` hook in `src/lib/storage.ts`.
