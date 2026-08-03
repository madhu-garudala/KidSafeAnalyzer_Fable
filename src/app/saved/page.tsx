import type { Metadata } from "next";
import SavedView from "@/components/SavedView";
import { getSlimIndex } from "@/lib/products";

export const metadata: Metadata = { title: "Saved" };

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-sm text-muted">
          Your shopping list and favorites — stored on this device.
        </p>
      </section>
      <SavedView products={getSlimIndex()} />
    </div>
  );
}
