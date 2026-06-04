import { Card, LinkButton, PageActions, SectionLabel } from "./ui";

const SECTIONS = [
  { key: "Emotional Validation", label: "Validation" },
  { key: "Trigger", label: "Trigger" },
  { key: "Facts vs Interpretation", label: "Facts & interpretation" },
  { key: "Thought Pattern", label: "Thought pattern" },
  { key: "Behavioural Insight", label: "Behavioural insight" },
  { key: "One Next Question", label: "Next question" },
] as const;

function extractSection(text: string, section: string) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:\\d+\\.\\s*)?${section}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.\\s*)?(?:Emotional Validation|Trigger|Facts vs Interpretation|Thought Pattern|Behavioural Insight|One Next Question)\\s*\\n|$)`,
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

export function ReflectionResultCard({
  result,
  showActions = true,
}: {
  result: string;
  showActions?: boolean;
}) {
  const sections = parseSections(result);

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
