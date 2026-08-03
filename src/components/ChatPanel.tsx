"use client";

import { useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface Props {
  productName?: string;
  ingredients?: string;
  analysisSummary?: string;
  suggestions?: string[];
}

export default function ChatPanel({ productName, ingredients, analysisSummary, suggestions }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setBusy(true);
    setInput("");
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history, productName, ingredients, analysisSummary }),
      });
      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error ?? `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) => (m[m.length - 1]?.content === "" ? m.slice(0, -2) : m));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold">Ask about {productName ?? "ingredients"}</h2>
        <p className="text-xs text-muted">Answered by AI using the same evidence base as the analysis.</p>
      </div>

      <div ref={scrollRef} className="flex max-h-96 min-h-40 flex-col gap-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {(suggestions ?? [
              "What's the worst ingredient here?",
              "Is this okay for a 3-year-old?",
              "What should I look for in a better alternative?",
            ]).map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                disabled={busy}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-accent text-white dark:text-black"
                : "self-start border border-line bg-background"
            }`}
          >
            {m.content || <span className="animate-pulse text-muted">Thinking…</span>}
          </div>
        ))}
        {error && <p className="text-xs text-bad">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question…"
          className="flex-1 rounded-full border border-line bg-background px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40 dark:text-black"
        >
          Send
        </button>
      </form>
    </div>
  );
}
