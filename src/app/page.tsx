import Link from "next/link";
import ProductBrowser from "@/components/ProductBrowser";
import { getCategories, getSlimIndex } from "@/lib/products";

export default function Home() {
  const products = getSlimIndex();
  const categories = getCategories();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Is it safe for your kids?
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Instant, evidence-based verdicts on {products.length} popular packaged foods — plus
          on-demand AI analysis for anything else. Grounded in FDA labeling guidance and
          AAP/AHA recommendations for children.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/analyze"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:text-black"
          >
            Analyze custom ingredients
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:border-accent"
          >
            Compare products
          </Link>
        </div>
      </section>
      <ProductBrowser products={products} categories={categories} />
    </div>
  );
}
