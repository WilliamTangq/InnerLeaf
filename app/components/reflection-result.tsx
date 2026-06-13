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
  Waves,
  Zap,
} from "lucide-react";
import { Card, LinkButton, PageActions, SectionLabel } from "./ui";
import { useLanguage } from "./language-provider";
import { translateDetectedMode, translateNextStepType } from "../lib/i18n";

export type StructuredReflectionResult = {
  emotional_validation?: string;
  emotion?: string;
  trigger?: string;
  facts?: string[];
  interpretation?: string[];
  thought_pattern?: string;
  behaviour?: string;
  body_factor?: string;
  behavioural_insight?: string;
  next_question?: string;
  next_step_type?: string;
  next_step?: string;
  mode_detected?: string;
  captured_clearly?: string;
  still_unclear?: string;
  completed_reflection?: string;
} | null;

const SECTIONS = [
  { key: "Emotional Validation", label: "What came up" },
  { key: "Trigger", label: "Trigger" },
  { key: "Facts vs Interpretation", label: "Facts & interpretation" },
  { key: "Thought Pattern", label: "Thought pattern" },
  { key: "Behaviour", label: "Behaviour" },
  { key: "Body / context", label: "Body / context" },
  { key: "Behavioural Insight", label: "Behavioural insight" },
  { key: "One Next Question", label: "One next question" },
  { key: "One Small Next Step", label: "One small next step" },
] as const;

const sectionIcons = {
  "What came up": Sparkles,
  Emotion: Heart,
  Trigger: Zap,
  Facts: ListChecks,
  Interpretation: Route,
  "Thought pattern": Brain,
  Behaviour: Footprints,
  "Body / context": Waves,
  "Behavioural insight": Leaf,
  "One next question": MessageCircleQuestion,
  "One small next step": Footprints,
  "Captured clearly": ListChecks,
  "Still unclear": HelpCircle,
  "Completed reflection": Leaf,
} as const;

function extractSection(text: string, section: string) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Emotion|Trigger|Facts vs Interpretation|Thought Pattern|Behaviour|Body / context|Behavioural Insight|One Next Question|One Small Next Step|What You Captured Clearly|What May Still Be Unclear|Completed Reflection Card)\\s*\\n|$)`,
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

function bulletList(items?: string[], fallback = "Not clearly identified.") {
  const values = items?.filter(Boolean) ?? [];

  if (values.length === 0) {
    return fallback;
  }

  return values.map((item) => `- ${item}`).join("\n");
}

function meaningfulBodyFactor(value?: string) {
  const text = value?.trim();

  if (!text) {
    return "";
  }

  const lower = text.toLowerCase();
  const neutralPhrases = [
    "not mentioned",
    "not clearly identified",
    "no clear body",
    "no body",
    "not identified",
    "未提到",
    "没有明显",
    "尚未清楚",
    "未明确",
  ];

  return neutralPhrases.some((phrase) => lower.includes(phrase)) ? "" : text;
}

function ReflectionSection({
  label,
  labelText,
  content,
  tone = "default",
}: {
  label: string;
  labelText?: string;
  content?: string;
  tone?: "default" | "highlight";
}) {
  if (!content) {
    return null;
  }

  const Icon = sectionIcons[label as keyof typeof sectionIcons] || Leaf;

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border p-3.5 transition duration-200 sm:p-4",
        tone === "highlight"
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
          {labelText || label}
        </h3>
      </div>
      <div
        className={[
          "mt-2 whitespace-pre-wrap text-[var(--foreground-muted)]",
          tone === "highlight" ? "text-[15px] leading-7" : "text-sm leading-6",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
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
    {
      label: "Body / context",
      content: meaningfulBodyFactor(structured.body_factor),
    },
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
  statusText,
}: {
  result: string;
  structured?: StructuredReflectionResult;
  showActions?: boolean;
  statusText?: string;
}) {
  const { language, t } = useLanguage();
  const sections = structured
    ? structuredSections(structured)
    : parseSections(result);
  const nextStep = structured?.next_step?.trim();
  const nextStepType = structured?.next_step_type?.trim();
  const modeDetected = structured?.mode_detected?.trim();
  const isStructured = Boolean(structured);
  const labels = t.reflectionCard;
  const facts = structured ? bulletList(structured.facts, labels.notIdentified) : "";
  const interpretation = structured
    ? bulletList(structured.interpretation, labels.notIdentified)
    : "";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SectionLabel id="reflection-card-heading">
              {labels.title}
            </SectionLabel>
            <p className="mt-2 text-sm text-[var(--foreground-subtle)]">
              {statusText || labels.saved}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {structured?.emotion && (
              <span className="self-start rounded-full border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                {structured.emotion}
              </span>
            )}
            {modeDetected && modeDetected !== "General" && (
              <span className="self-start rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                {labels.reflectionMode}:{" "}
                {translateDetectedMode(language, modeDetected)}
              </span>
            )}
          </div>
        </div>

        {isStructured && structured ? (
          <div className="mt-5 grid gap-2.5 sm:gap-3">
            <ReflectionSection
              label="What came up"
              labelText={labels.emotionalValidation}
              content={structured.emotional_validation}
            />
            <ReflectionSection
              label="Trigger"
              labelText={labels.trigger}
              content={structured.trigger}
            />
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 sm:p-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-teal-deep)]"
                  aria-hidden="true"
                >
                  <ListChecks size={15} strokeWidth={1.8} />
                </span>
                <h3 className="text-sm font-medium text-[var(--foreground)]">
                  {labels.factsInterpretation}
                </h3>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {labels.facts}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                    {facts}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {labels.interpretation}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
                    {interpretation}
                  </p>
                </div>
              </div>
            </div>
            <ReflectionSection
              label="Thought pattern"
              labelText={labels.thoughtPattern}
              content={structured.thought_pattern}
            />
            <ReflectionSection
              label="Behaviour"
              labelText={labels.behaviour}
              content={structured.behaviour}
            />
            <ReflectionSection
              label="Body / context"
              labelText={labels.bodyContext}
              content={meaningfulBodyFactor(structured.body_factor)}
            />
            <ReflectionSection
              label="Behavioural insight"
              labelText={labels.behaviouralInsight}
              content={structured.behavioural_insight}
            />
            <ReflectionSection
              label="One next question"
              labelText={labels.nextQuestion}
              content={structured.next_question}
              tone="highlight"
            />
          </div>
        ) : sections ? (
          <div className="mt-5 grid gap-2.5 sm:gap-3">
            {sections.map((section) => {
              const isQuestion =
                section.label === "One next question" ||
                section.label === "One small next step";

              return (
                <ReflectionSection
                  key={section.label}
                  label={section.label}
                  labelText={
                    section.label === "One next question"
                      ? labels.nextQuestion
                      : section.label === "One small next step"
                        ? labels.nextStep
                        : section.label
                  }
                  content={section.content}
                  tone={isQuestion ? "highlight" : "default"}
                />
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
                {labels.nextStep}
              </h3>
              {nextStepType && (
                <span className="rounded-full border border-[rgba(31,155,143,0.24)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {translateNextStepType(language, nextStepType)}
                </span>
              )}
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
              {nextStep}
            </p>
            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
              {labels.nextStepHint}
            </p>
          </div>
        )}

        {showActions && (
          <PageActions className="mb-0 mt-8 border-t border-[var(--border)] pt-6">
            <LinkButton href="/quick" size="sm">
              {labels.newReflection}
            </LinkButton>
            <LinkButton href="/history" variant="secondary" size="sm">
              {t.common.viewHistory}
            </LinkButton>
            <LinkButton href="/summary" variant="ghost" size="sm">
              {labels.seePatterns}
            </LinkButton>
          </PageActions>
        )}
      </Card>
    </section>
  );
}
