import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AnalysisView from "@/components/AnalysisView";
import ChatPanel from "@/components/ChatPanel";
import ProductActions from "@/components/ProductActions";
import VerdictVideo from "@/components/VerdictVideo";
import { getProduct, getProducts } from "@/lib/products";

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/" className="text-xs text-muted hover:text-accent">
          ← All products
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-muted">{product.category}</p>
          </div>
          <ProductActions productId={product.id} />
        </div>
      </div>

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-semibold">Ingredient list (as labeled)</summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">{product.ingredients}</p>
      </details>

      {product.analysis && (
        <div className="lg:hidden">
          <VerdictVideo verdict={product.analysis.verdict} productName={product.name} />
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          {product.analysis ? (
            <AnalysisView analysis={product.analysis} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
              This product hasn&apos;t been analyzed yet. Run <code>npm run precompute</code> or use the{" "}
              <Link href="/analyze" className="text-accent underline">
                custom analyzer
              </Link>
              .
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5 lg:sticky lg:top-20">
          {product.analysis && (
            <div className="hidden lg:block">
              <VerdictVideo verdict={product.analysis.verdict} productName={product.name} />
            </div>
          )}
          <ChatPanel
            productName={product.name}
            ingredients={product.ingredients}
            analysisSummary={product.analysis?.summary}
          />
        </div>
      </div>
    </div>
  );
}
