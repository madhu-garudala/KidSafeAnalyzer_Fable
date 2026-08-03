"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SlimProduct } from "@/lib/products";
import type { Verdict } from "@/lib/types";
import VerdictBadge from "./VerdictBadge";
import { useIdList, FAVORITES_KEY } from "@/lib/storage";

const verdictFilters: { value: Verdict | "all"; label: string }[] = [
  { value: "all", label: "All verdicts" },
  { value: "good", label: "Good" },
  { value: "moderate", label: "Moderate" },
  { value: "bad", label: "Avoid" },
];

export default function ProductBrowser({
  products,
  categories,
}: {
  products: SlimProduct[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { ids: favorites, toggle: toggleFavorite } = useIdList(FAVORITES_KEY);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.category !== category) return false;
      if (verdict !== "all" && p.verdict !== verdict) return false;
      if (favoritesOnly && !favorites.includes(p.id)) return false;
      return true;
    });
  }, [products, query, category, verdict, favoritesOnly, favorites]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition focus:border-accent sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1.5">
          {verdictFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setVerdict(f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                verdict === f.value
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-line bg-surface text-muted hover:border-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              favoritesOnly
                ? "border-accent bg-accent-soft text-foreground"
                : "border-line bg-surface text-muted hover:border-accent"
            }`}
          >
            ♥ Favorites
          </button>
        </div>
      </div>

      <p className="text-xs text-muted">
        {filtered.length} of {products.length} products
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No products match. Try clearing filters, or{" "}
          <Link href="/analyze" className="text-accent underline">
            analyze a custom ingredient list
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="group relative rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                aria-label={favorites.includes(p.id) ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(p.id)}
                className={`absolute right-3 top-3 z-10 text-lg transition ${
                  favorites.includes(p.id) ? "text-bad" : "text-line hover:text-bad"
                }`}
              >
                ♥
              </button>
              <Link href={`/product/${p.id}`} className="block">
                <div className="mb-2 flex items-center gap-2 pr-7">
                  <VerdictBadge verdict={p.verdict} />
                  <span className="truncate text-xs text-muted">{p.category}</span>
                </div>
                <h3 className="mb-1 font-medium leading-snug group-hover:text-accent">{p.name}</h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">{p.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
