import type { Verdict } from "@/lib/types";

const styles: Record<Verdict, { label: string; icon: string; className: string }> = {
  good: {
    label: "Good",
    icon: "✓",
    className: "bg-good-bg text-good border-good-border",
  },
  moderate: {
    label: "Moderate",
    icon: "!",
    className: "bg-moderate-bg text-moderate border-moderate-border",
  },
  bad: {
    label: "Avoid",
    icon: "✕",
    className: "bg-bad-bg text-bad border-bad-border",
  },
};

export default function VerdictBadge({
  verdict,
  size = "sm",
}: {
  verdict: Verdict | null;
  size?: "sm" | "lg";
}) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-xs text-muted">
        Not analyzed
      </span>
    );
  }
  const s = styles[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${s.className} ${
        size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      }`}
    >
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}
