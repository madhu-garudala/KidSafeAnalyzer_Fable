"use client";

import Link from "next/link";
import { useIdList, FAVORITES_KEY, SHOPPING_KEY, COMPARE_KEY } from "@/lib/storage";

export default function ProductActions({ productId }: { productId: string }) {
  const favorites = useIdList(FAVORITES_KEY);
  const shopping = useIdList(SHOPPING_KEY);
  const compare = useIdList(COMPARE_KEY);

  const isFav = favorites.ids.includes(productId);
  const inList = shopping.ids.includes(productId);
  const inCompare = compare.ids.includes(productId);

  const base =
    "rounded-full border px-3 py-1.5 text-xs font-medium transition";
  const off = "border-line bg-surface text-muted hover:border-accent";
  const on = "border-accent bg-accent-soft text-foreground";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => favorites.toggle(productId)} className={`${base} ${isFav ? on : off}`}>
        ♥ {isFav ? "Favorited" : "Favorite"}
      </button>
      <button onClick={() => shopping.toggle(productId)} className={`${base} ${inList ? on : off}`}>
        🛒 {inList ? "On shopping list" : "Add to shopping list"}
      </button>
      <button
        onClick={() => {
          if (!inCompare && compare.ids.length >= 3) return;
          compare.toggle(productId);
        }}
        className={`${base} ${inCompare ? on : off}`}
        title={!inCompare && compare.ids.length >= 3 ? "Compare holds up to 3 products" : undefined}
      >
        ⇄ {inCompare ? "In compare" : "Compare"}
      </button>
      {compare.ids.length >= 2 && (
        <Link
          href={`/compare?ids=${compare.ids.join(",")}`}
          className={`${base} border-accent text-accent hover:bg-accent-soft`}
        >
          View comparison ({compare.ids.length})
        </Link>
      )}
    </div>
  );
}
