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
  captured_clearly?: string;
  still_unclear?: string;
  completed_reflection?: string;
} | null;

const SECTIONS = [
  { key: "Emotional Validation", label: "Validation" },
  { key: "Emotion", label: "Emotion" },
  { key: "Trigger", label: "Trigger" },
  { key: "Facts vs Interpretation", label: "Facts & interpretation" },
  { key: "Thought Pattern", label: "Thought pattern" },
  { key: "Behaviour", label: "Behaviour" },
  { key: "Behavioural Insight", label: "Behavioural insight" },
  { key: "One Next Question", label: "Next question" },
] as const;

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
    { label: "Validation", content: structured.emotional_validation },
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
    { label: "Next question", content: structured.next_question },
  ].filter((section) => section.content);

  const guidedSections = [
    { label: "Captured clearly", content: structured.captured_clearly },
    { label: "Still unclear", content: structured.still_unclear },
    { label: "Completed reflection", content: structured.completed_reflection },
  ].filter((section) => section.content);

  return guidedSections.length > 0
    ? [...guidedSections, ...sections]
    : sections;
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

  return (
    <Card
      variant="elevated"
      className="mt-8 overflow-hidden border-[rgba(31,155,143,0.12)]"
    >
      <div
        className="-mx-5 -mt-5 mb-5 h-1 sm:-mx-6 sm:-mt-6"
        style={{ background: "var(--brand-gradient)" }}
        aria-hidden
      />
      <SectionLabel>Your reflection card</SectionLabel>

      {sections ? (
        <div className="mt-5 space-y-5">
          {sections.map((section) => (
            <div
              key={section.label}
              className="border-t border-[var(--border)] pt-5 first:border-0 first:pt-0"
            >
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                {section.label}
              </h3>
              <div className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[var(--foreground-muted)]">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[var(--foreground-muted)]">
          {result}
        </div>
      )}

      {showActions && (
        <PageActions className="mb-0 mt-8 border-t border-[var(--border)] pt-6">
          <LinkButton href="/history" variant="secondary" size="sm">
            View history
          </LinkButton>
          <LinkButton href="/summary" variant="ghost" size="sm">
            See patterns
          </LinkButton>
        </PageActions>
      )}
    </Card>
  );
}
