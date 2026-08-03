"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SlimProduct } from "@/lib/products";
import VerdictBadge from "./VerdictBadge";
import { useIdList, COMPARE_KEY } from "@/lib/storage";

export default function ComparePicker({ products }: { products: SlimProduct[] }) {
  const router = useRouter();
  const { ids, toggle, clear } = useIdList(COMPARE_KEY);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [products, query]);

  const selected = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is SlimProduct => Boolean(p));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {selected.length === 0 && (
            <span className="text-sm text-muted">Pick 2–3 products to compare.</span>
          )}
          {selected.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-3 py-1.5 text-xs font-medium"
              title="Remove"
            >
              {p.name} <span aria-hidden>✕</span>
            </button>
          ))}
          {selected.length > 0 && (
            <button onClick={clear} className="text-xs text-muted underline">
              clear
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a product to add…"
            className="w-full rounded-full border border-line bg-background px-4 py-2 text-sm outline-none focus:border-accent sm:max-w-sm"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      if (!ids.includes(p.id) && ids.length >= 3) return;
                      toggle(p.id);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-background"
                  >
                    <span className="truncate">{p.name}</span>
                    <VerdictBadge verdict={p.verdict} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <button
            onClick={() => router.push(`/compare?ids=${ids.join(",")}`)}
            disabled={ids.length < 2}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition disabled:opacity-40 dark:text-black"
          >
            Compare {ids.length >= 2 ? `${ids.length} products` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
