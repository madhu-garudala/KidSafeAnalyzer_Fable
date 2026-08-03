/**
 * Regenerate the precomputed analyses in src/data/products.json using
 * Claude Haiku 4.5 and the current knowledge base.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npm run precompute            # only products still on migrated data
 *   ANTHROPIC_API_KEY=sk-... npm run precompute -- --force  # regenerate everything
 *   ANTHROPIC_API_KEY=sk-... npm run precompute -- --only wonder-bread-classic-white
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeIngredients } from "../src/lib/analyze";
import type { Product, ProductsFile } from "../src/lib/types";

const DATA_PATH = path.join(process.cwd(), "src/data/products.json");
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const onlyId = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set.");
  process.exit(1);
}

const client = new Anthropic();
const data: ProductsFile = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

const targets = data.products.filter((p) => {
  if (onlyId) return p.id === onlyId;
  if (force) return true;
  return !p.analysis || p.analysis.source === "migrated";
});

if (targets.length === 0) {
  console.log("Nothing to do — all products already have haiku-4-5 analyses. Use --force to regenerate.");
  process.exit(0);
}
console.log(`Regenerating ${targets.length} of ${data.products.length} products with Claude Haiku 4.5...`);

let done = 0;
const failures: string[] = [];

async function worker(queue: Product[]) {
  for (;;) {
    const product = queue.shift();
    if (!product) return;
    try {
      const analysis = await analyzeIngredients(
        client,
        product.name,
        product.ingredients,
        product.category,
      );
      product.analysis = analysis;
      product.analyzedAt = new Date().toISOString();
      done++;
      console.log(`  [${done}/${targets.length}] ${product.name} -> ${analysis.verdict.toUpperCase()}`);
    } catch (err) {
      failures.push(product.name);
      console.error(`  FAILED ${product.name}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

const queue = [...targets];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

data.generatedAt = new Date().toISOString();
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 1));
console.log(`\nWrote ${DATA_PATH}`);
if (failures.length > 0) {
  console.error(`${failures.length} failed: ${failures.join(", ")} — re-run to retry (successes are saved).`);
  process.exit(1);
}
