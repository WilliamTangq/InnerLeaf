import {
  Brain,
  Footprints,
  Heart,
  HelpCircle,
  Leaf,
  ListChecks,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card, LinkButton, PageActions, SectionLabel } from "./ui";

export type StructuredReflectionResult = {
  emotional_validation?: string;
  emotion?: string;
  trigger?: string;
  facts?: string[];
  interpretation?: string[];
  thought_pattern?: string;
  behaviour?: string;
  behavioural_insight?: string;
  next_question?: string;
  next_step_type?: string;
  next_step?: string;
  captured_clearly?: string;
  still_unclear?: string;
  completed_reflection?: string;
} | null;

const SECTIONS = [
  { key: "Emotional Validation", label: "What came up" },
  { key: "Emotion", label: "Emotion" },
  { key: "Trigger", label: "Trigger" },
  { key: "Facts vs Interpretation", label: "Facts & interpretation" },
  { key: "Thought Pattern", label: "Thought pattern" },
  { key: "Behaviour", label: "Behaviour" },
  { key: "Behavioural Insight", label: "Behavioural insight" },
  { key: "One Next Question", label: "One next question" },
] as const;

const sectionIcons = {
  "What came up": Sparkles,
  Emotion: Heart,
  Trigger: Zap,
  Facts: ListChecks,
  Interpretation: Route,
  "Thought pattern": Brain,
  Behaviour: Footprints,
  "Behavioural insight": Leaf,
  "One next question": MessageCircleQuestion,
  "One small next step": Footprints,
  "Captured clearly": ListChecks,
  "Still unclear": HelpCircle,
  "Completed reflection": Leaf,
} as const;

function extractSection(text: string, section: string) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion|Trigger|Facts vs Interpretation|Thought Pattern|Behaviour|Behavioural Insight|One Next Question|What You Captured Clearly|What May Still Be Unclear|Completed Reflection Card)\\s*\\n|$)`,
    "i"
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function parseSections(result: string) {
  const parsed = SECTIONS.map(({ key, label }) => ({
    label,
    content: extractSection(result, key),
  })).filter((s) => s.content);

  return parsed.length > 0 ? parsed : null;
}

function bulletList(items?: string[]) {
  const values = items?.filter(Boolean) ?? [];

  if (values.length === 0) {
    return "Not clearly identified.";
  }

  return values.map((item) => `- ${item}`).join("\n");
}

function structuredSections(structured: NonNullable<StructuredReflectionResult>) {
  const sections = [
    { label: "What came up", content: structured.emotional_validation },
    { label: "Emotion", content: structured.emotion },
    { label: "Trigger", content: structured.trigger },
    {
      label: "Facts",
      content: bulletList(structured.facts),
    },
    {
      label: "Interpretation",
      content: bulletList(structured.interpretation),
    },
    { label: "Thought pattern", content: structured.thought_pattern },
    { label: "Behaviour", content: structured.behaviour },
    { label: "Behavioural insight", content: structured.behavioural_insight },
    { label: "One next question", content: structured.next_question },
  ].filter((section) => section.content);

  const guidedSections = [
    { label: "Captured clearly", content: structured.captured_clearly },
    { label: "Still unclear", content: structured.still_unclear },
  ].filter((section) => section.content);

  if (guidedSections.length > 0) {
    return [...guidedSections, ...sections];
  }

  return sections;
}

export function ReflectionResultCard({
  result,
  structured,
  showActions = true,
}: {
  result: string;
  structured?: StructuredReflectionResult;
  showActions?: boolean;
}) {
  const sections = structured
    ? structuredSections(structured)
    : parseSections(result);
  const nextStep = structured?.next_step?.trim();
  const nextStepType = structured?.next_step_type?.trim();

  return (
    <section aria-labelledby="reflection-card-heading" className="mt-8">
      <Card
        variant="elevated"
        className="overflow-hidden border-[rgba(31,155,143,0.12)]"
      >
        <div
          className="-mx-5 -mt-5 mb-5 h-1 sm:-mx-6 sm:-mt-6"
          style={{ background: "var(--brand-gradient)" }}
          aria-hidden="true"
        />
        <SectionLabel id="reflection-card-heading">Your reflection card</SectionLabel>
        <p className="mt-2 text-sm text-[var(--foreground-subtle)]">
          Saved automatically. Revisit anytime in History.
        </p>

        {sections ? (
          <div className="mt-5 grid gap-2.5 sm:gap-3">
            {sections.map((section) => {
              const Icon =
                sectionIcons[section.label as keyof typeof sectionIcons] ||
                Leaf;
              const isQuestion = section.label === "One next question";

              return (
                <div
                  key={section.label}
                  className={[
                    "rounded-[var(--radius-lg)] border p-3.5 sm:p-4",
                    isQuestion
                      ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] ring-1 ring-[rgba(31,155,143,0.12)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-teal-deep)]"
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {section.label}
                    </h3>
                  </div>
                  <div
                    className={[
                      "mt-2 whitespace-pre-wrap text-[var(--foreground-muted)]",
                      isQuestion
                        ? "text-[15px] leading-7"
                        : "text-sm leading-6",
                    ].join(" ")}
                  >
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
            {result}
          </div>
        )}

        {nextStep && (
          <div className="mt-5 rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.24)] bg-[var(--accent-soft)] p-4 ring-1 ring-[rgba(31,155,143,0.1)] sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-soft)]"
                aria-hidden="true"
              >
                <Footprints size={16} strokeWidth={1.8} />
              </span>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                One small next step
              </h3>
              {nextStepType && (
                <span className="rounded-full border border-[rgba(31,155,143,0.24)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {nextStepType}
                </span>
              )}
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
              {nextStep}
            </p>
            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
              Try this gently, or skip it if it does not fit the moment.
            </p>
          </div>
        )}

        {showActions && (
          <PageActions className="mb-0 mt-8 border-t border-[var(--border)] pt-6">
            <LinkButton href="/quick" size="sm">
              New reflection
            </LinkButton>
            <LinkButton href="/history" variant="secondary" size="sm">
              View history
            </LinkButton>
            <LinkButton href="/summary" variant="ghost" size="sm">
              See patterns
            </LinkButton>
          </PageActions>
        )}
      </Card>
    </section>
  );
}
