import Link from "next/link";
import type { Metadata } from "next";
import ComparePicker from "@/components/ComparePicker";
import VerdictBadge from "@/components/VerdictBadge";
import { getProduct, getSlimIndex } from "@/lib/products";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Compare" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="col-span-full border-t border-line py-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      {children}
    </>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const products = (idsParam ?? "")
    .split(",")
    .map((id) => getProduct(id.trim()))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 3);

  const cols = products.length;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Compare products</h1>
        <p className="mt-1 text-sm text-muted">
          Put up to three products side by side to pick the better option.
        </p>
      </section>

      <ComparePicker products={getSlimIndex()} />

      {cols >= 2 && (
        <div className="overflow-x-auto">
          <div
            className="grid min-w-2xl gap-x-5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(240px, 1fr))` }}
          >
            {products.map((p) => (
              <div key={p.id} className="rounded-t-2xl border border-b-0 border-line bg-surface p-4">
                <VerdictBadge verdict={p.analysis?.verdict ?? null} size="lg" />
                <h2 className="mt-2 font-semibold leading-snug">
                  <Link href={`/product/${p.id}`} className="hover:text-accent">
                    {p.name}
                  </Link>
                </h2>
                <p className="text-xs text-muted">{p.category}</p>
              </div>
            ))}

            <Row label="Summary">
              {products.map((p) => (
                <p key={p.id} className="pr-2 text-sm leading-relaxed">
                  {p.analysis?.summary ?? "—"}
                </p>
              ))}
            </Row>

            <Row label="Red flags">
              {products.map((p) => {
                const flags = p.analysis?.redFlags ?? [];
                return (
                  <div key={p.id} className="pr-2 text-sm">
                    {flags.length === 0 ? (
                      <span className="text-good">None ✓</span>
                    ) : (
                      <ul className="space-y-1">
                        {flags.map((f) => (
                          <li key={f.name} className="text-bad">
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </Row>

            <Row label="Added sugar">
              {products.map((p) => (
                <p key={p.id} className="pr-2 text-sm leading-relaxed text-muted">
                  {p.analysis?.addedSugar ?? "—"}
                </p>
              ))}
            </Row>

            <Row label="Top concerns">
              {products.map((p) => {
                const concerns = (p.analysis?.keyConcerns ?? []).slice(0, 3);
                return (
                  <div key={p.id} className="pr-2 text-sm">
                    {concerns.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <ol className="list-decimal space-y-1 pl-4">
                        {concerns.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </Row>

            <Row label="Positives">
              {products.map((p) => {
                const pos = (p.analysis?.positives ?? []).slice(0, 3);
                return (
                  <div key={p.id} className="pb-4 pr-2 text-sm">
                    {pos.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <ul className="space-y-1">
                        {pos.map((x, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span aria-hidden className="text-good">✓</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}
