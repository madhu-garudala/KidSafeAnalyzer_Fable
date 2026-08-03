import type { Verdict } from "@/lib/types";

const captions: Record<Verdict, string> = {
  good: "Good news — this one gets a thumbs up!",
  moderate: "Okay sometimes — best in moderation.",
  bad: "Heads up — better to skip this one.",
};

/**
 * Per-verdict character video ("Rumi's Quick Take"), carried over from v1.
 * The three template clips live in /public/videos and are picked by verdict.
 */
export default function VerdictVideo({
  verdict,
  productName,
}: {
  verdict: Verdict;
  productName: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3">
        <span aria-hidden className="text-2xl">🐶</span>
        <div>
          <h2 className="text-sm font-semibold">Rumi&apos;s Quick Take</h2>
          <p className="text-xs text-muted">{captions[verdict]}</p>
        </div>
      </div>
      <video
        key={verdict}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
        aria-label={`Rumi's video verdict for ${productName}`}
      >
        <source src={`/videos/${verdict}.mp4`} type="video/mp4" />
        Your browser doesn&apos;t support video playback.
      </video>
    </div>
  );
}
