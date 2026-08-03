"use client";

import { useState } from "react";
import AnalysisView from "@/components/AnalysisView";
import ChatPanel from "@/components/ChatPanel";
import VerdictVideo from "@/components/VerdictVideo";
import type { Analysis } from "@/lib/types";

export default function AnalyzePage() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; ingredients: string; analysis: Analysis } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name, ingredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
      setResult({ name: name.trim(), ingredients: ingredients.trim(), analysis: data.analysis });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Analyze any product</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Type or paste the ingredient list from any package and get the same structured verdict
          as the built-in catalog — usually in a few seconds.
        </p>
      </section>

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Product name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Trader Joe's Fruit Wrap"
            className="rounded-xl border border-line bg-background px-4 py-2 text-sm font-normal outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Ingredients (copy from the label)
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            rows={5}
            placeholder="Whole grain oats, sugar, corn syrup, salt, Red 40, BHT for freshness…"
            className="resize-y rounded-xl border border-line bg-background px-4 py-2 text-sm font-normal leading-relaxed outline-none focus:border-accent"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !name.trim() || !ingredients.trim()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition disabled:opacity-40 dark:text-black"
          >
            {busy ? "Analyzing…" : "Analyze"}
          </button>
          {busy && <span className="text-xs text-muted">Claude Haiku is reading the label…</span>}
          {error && <span className="text-xs text-bad">{error}</span>}
        </div>
      </form>

      {result && (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="mb-3 text-lg font-semibold">{result.name}</h2>
            <AnalysisView analysis={result.analysis} />
          </div>
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <VerdictVideo verdict={result.analysis.verdict} productName={result.name} />
            <ChatPanel
              productName={result.name}
              ingredients={result.ingredients}
              analysisSummary={result.analysis.summary}
            />
          </div>
        </div>
      )}
    </div>
  );
}
