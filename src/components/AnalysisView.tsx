import type { Analysis, IngredientRating } from "@/lib/types";
import VerdictBadge from "./VerdictBadge";

const verdictBanner: Record<Analysis["verdict"], string> = {
  good: "border-good-border bg-good-bg",
  moderate: "border-moderate-border bg-moderate-bg",
  bad: "border-bad-border bg-bad-bg",
};

const verdictHeadline: Record<Analysis["verdict"], string> = {
  good: "Looks good for kids",
  moderate: "Okay in moderation",
  bad: "Better to avoid",
};

const ratingDot: Record<IngredientRating, string> = {
  good: "bg-good",
  neutral: "bg-muted/50",
  caution: "bg-moderate",
  avoid: "bg-bad",
};

const ratingLabel: Record<IngredientRating, string> = {
  good: "Good",
  neutral: "Neutral",
  caution: "Caution",
  avoid: "Avoid",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function AnalysisView({ analysis }: { analysis: Analysis }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-2xl border p-5 ${verdictBanner[analysis.verdict]}`}>
        <div className="mb-2 flex items-center gap-3">
          <VerdictBadge verdict={analysis.verdict} size="lg" />
          <h2 className="text-lg font-semibold">{verdictHeadline[analysis.verdict]}</h2>
        </div>
        <p className="text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {analysis.redFlags.length > 0 && (
        <Section title="Red flags">
          <ul className="flex flex-col gap-3">
            {analysis.redFlags.map((f) => (
              <li key={f.name} className="flex gap-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bad" />
                <div>
                  <p className="text-sm font-medium text-bad">{f.name}</p>
                  <p className="text-sm text-muted">{f.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Overall assessment">
        <p className="text-sm leading-relaxed">{analysis.overallAssessment}</p>
      </Section>

      <Section title="Added sugar">
        <p className="text-sm leading-relaxed">{analysis.addedSugar}</p>
      </Section>

      {analysis.ingredientBreakdown.length > 0 && (
        <Section title="Ingredient by ingredient">
          <ul className="divide-y divide-line">
            {analysis.ingredientBreakdown.map((ing, i) => (
              <li key={`${ing.name}-${i}`} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  aria-hidden
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ratingDot[ing.rating] ?? ratingDot.neutral}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {ing.name}{" "}
                    <span className="ml-1 text-xs font-normal text-muted">
                      {ratingLabel[ing.rating] ?? "Neutral"}
                    </span>
                  </p>
                  <p className="text-sm text-muted">{ing.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {analysis.keyConcerns.length > 0 && (
          <Section title="Key concerns">
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {analysis.keyConcerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ol>
          </Section>
        )}
        {analysis.positives.length > 0 && (
          <Section title="Positives">
            <ul className="space-y-2 text-sm leading-relaxed">
              {analysis.positives.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-good">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {analysis.conclusion && (
        <p className="rounded-2xl border border-line bg-surface p-5 text-sm italic leading-relaxed text-muted">
          {analysis.conclusion}
        </p>
      )}
    </div>
  );
}
