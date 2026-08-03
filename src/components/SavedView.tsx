"use client";

import Link from "next/link";
import type { SlimProduct } from "@/lib/products";
import VerdictBadge from "./VerdictBadge";
import { useIdList, FAVORITES_KEY, SHOPPING_KEY } from "@/lib/storage";

function ProductRow({
  product,
  onRemove,
}: {
  product: SlimProduct;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
      <Link href={`/product/${product.id}`} className="min-w-0 flex-1 hover:text-accent">
        <div className="flex items-center gap-2">
          <VerdictBadge verdict={product.verdict} />
          <span className="truncate text-sm font-medium">{product.name}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{product.category}</p>
      </Link>
      <button
        onClick={onRemove}
        aria-label={`Remove ${product.name}`}
        className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-bad hover:text-bad"
      >
        Remove
      </button>
    </li>
  );
}

function SavedList({
  title,
  emptyHint,
  storageKey,
  products,
}: {
  title: string;
  emptyHint: string;
  storageKey: string;
  products: SlimProduct[];
}) {
  const { ids, remove, clear } = useIdList(storageKey);
  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is SlimProduct => Boolean(p));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {title} <span className="text-sm font-normal text-muted">({items.length})</span>
        </h2>
        {items.length > 0 && (
          <button onClick={clear} className="text-xs text-muted underline hover:text-bad">
            Clear all
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
          {emptyHint}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <ProductRow key={p.id} product={p} onRemove={() => remove(p.id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function SavedView({ products }: { products: SlimProduct[] }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <SavedList
        title="🛒 Shopping list"
        emptyHint="Add products from any product page and they'll show up here for your store run."
        storageKey={SHOPPING_KEY}
        products={products}
      />
      <SavedList
        title="♥ Favorites"
        emptyHint="Tap the heart on any product to keep it handy here."
        storageKey={FAVORITES_KEY}
        products={products}
      />
    </div>
  );
}
