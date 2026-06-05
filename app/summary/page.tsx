import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, Footprints, Leaf, Sparkles } from "lucide-react";
import { PatternSection } from "../components/pattern-section";
import {
  Card,
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

const summarySelect =
  "id, created_at, emotion, trigger, thought_pattern, behaviour, next_step_type, follow_up_result";

const legacySummarySelect =
  "id, created_at, emotion, trigger, thought_pattern, behaviour";

type SummaryReflection = {
  id: string | number;
  created_at: string;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
  next_step_type: string | null;
  follow_up_result: string | null;
};

function normalizeValue(value: string | null) {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  if (
    !normalized ||
    lower === "unspecified" ||
    lower === "not clearly identified" ||
    lower === "not identified"
  ) {
    return "";
  }

  return normalized;
}

function topPatterns(values: Array<string | null>) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const normalized = normalizeValue(value);

    if (!normalized) {
      return;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return first.value.localeCompare(second.value);
    })
    .slice(0, 3);
}

function uniqueCount(values: Array<string | null>) {
  return new Set(values.map(normalizeValue).filter(Boolean)).size;
}

function changeSignals(reflections: SummaryReflection[]) {
  if (reflections.length < 3) {
    return [];
  }

  const signals = [
    `You have ${reflections.length} recent cards to compare — easier than relying on memory alone.`,
  ];
  const triggerCount = uniqueCount(reflections.map((item) => item.trigger));
  const behaviourCount = uniqueCount(reflections.map((item) => item.behaviour));
  const latest = reflections[0];
  const older = reflections.slice(1);
  const olderThoughtPatterns = topPatterns(
    older.map((item) => item.thought_pattern)
  );

  if (triggerCount > 1) {
    signals.push(
      "More than one trigger shows up in your recent cards — useful to compare side by side."
    );
  }

  if (behaviourCount > 1) {
    signals.push(
      "Your responses vary across cards — a reminder that different choices may be possible."
    );
  }

  if (
    latest?.thought_pattern &&
    olderThoughtPatterns[0]?.value &&
    latest.thought_pattern !== olderThoughtPatterns[0].value
  ) {
    signals.push(
      "Your latest thought pattern differs from the most repeated recent one."
    );
  }

  return signals.slice(0, 3);
}

function helpfulNextSteps(reflections: SummaryReflection[]) {
  const counts = new Map<string, { value: string; used: number; helped: number }>();

  reflections.forEach((item) => {
    const type = normalizeValue(item.next_step_type);
    const result = normalizeValue(item.follow_up_result);

    if (!type || !result) {
      return;
    }

    const current = counts.get(type) ?? {
      value: type,
      used: 0,
      helped: 0,
    };

    current.used += 1;

    if (result === "Helped" || result === "Somewhat") {
      current.helped += 1;
    }

    counts.set(type, current);
  });

  return Array.from(counts.values())
    .sort((first, second) => {
      if (second.helped !== first.helped) {
        return second.helped - first.helped;
      }

      if (second.used !== first.used) {
        return second.used - first.used;
      }

      return first.value.localeCompare(second.value);
    })
    .slice(0, 3);
}

function ChangeSection({ signals }: { signals: string[] }) {
  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Gentle observations
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            Themes to notice — not conclusions about you
          </p>
        </div>
        <Leaf
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {signals.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          Save a few more cards to compare moments more easily.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {signals.map((signal) => (
            <li
              key={signal}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground-muted)]"
            >
              <Sparkles
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
              />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function HelpfulNextStepsSection({
  items,
}: {
  items: Array<{ value: string; used: number; helped: number }>;
}) {
  const maxUsed = Math.max(...items.map((item) => item.used), 1);

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Helpful next steps
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            Based on your saved check-ins
          </p>
        </div>
        <Footprints
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          Check in on a few next steps to see what tends to help.
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {items.map((item) => (
            <li
              key={item.value}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-start gap-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.8}
                    className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
                  />
                  {item.value}
                </span>
                <span className="shrink-0 text-xs text-[var(--foreground-subtle)]">
                  {item.used}×
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Used {item.used} time{item.used === 1 ? "" : "s"} · You marked
                helpful {item.helped} time{item.helped === 1 ? "" : "s"}
              </p>
              <span className="mt-3 block h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <span
                  className="block h-full rounded-full bg-[var(--brand-teal)]/55"
                  style={{
                    width: `${Math.max(16, (item.used / maxUsed) * 100)}%`,
                  }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default async function SummaryPage() {
  let data = null;
  let error: Error | { code?: string; message?: string } | null = null;

  if (supabase) {
    const response = await supabase
      .from("reflections")
      .select(summarySelect)
      .order("created_at", { ascending: false })
      .limit(10);

    data = response.data;
    error = response.error;

    if (response.error?.code === "42703") {
      const legacyResponse = await supabase
        .from("reflections")
        .select(legacySummarySelect)
        .order("created_at", { ascending: false })
        .limit(10);

      data = legacyResponse.data;
      error = legacyResponse.error;
    }
  } else {
    error = new Error("Missing Supabase server environment variables");
  }

  if (error) {
    console.error("Supabase summary fetch error:", error);
  }

  const reflections = (data ?? []) as SummaryReflection[];
  const hasEnoughData = reflections.length >= 3;
  const remaining = Math.max(0, 3 - reflections.length);

  const repeatedTriggers = topPatterns(reflections.map((item) => item.trigger));
  const repeatedThoughtPatterns = topPatterns(
    reflections.map((item) => item.thought_pattern)
  );
  const recentBehaviouralThemes = topPatterns(
    reflections.map((item) => item.behaviour)
  );
  const signals = changeSignals(reflections);
  const nextSteps = helpfulNextSteps(reflections);

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow="Insights" title="Your recent patterns">
        Based on your saved reflection cards.
      </PageHeader>

      <PageActions className="mb-6">
        <LinkButton href="/quick">Create another reflection</LinkButton>
        <LinkButton href="/history" variant="secondary">
          View history
        </LinkButton>
      </PageActions>

      {error && (
        <StatusCard tone="error">
          Pattern summary is unavailable right now.
        </StatusCard>
      )}

      {!error && !hasEnoughData && (
        <EmptyState
          title={
            reflections.length === 0
              ? "No patterns yet"
              : `${remaining} more card${remaining === 1 ? "" : "s"} to go`
          }
          description={
            reflections.length === 0
              ? "Save at least 3 reflections to see repeated themes. Patterns become clearer when there is more than one moment to compare."
              : `You have ${reflections.length} saved. Add ${remaining} more to see repeated themes.`
          }
          action={<LinkButton href="/quick">Start quick reflection</LinkButton>}
        />
      )}

      {!error && hasEnoughData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <PatternSection
              title="Repeated triggers"
              description="What tends to set off strong reactions"
              items={repeatedTriggers}
            />
            <PatternSection
              title="Repeated thought patterns"
              description="How your mind often frames the moment"
              items={repeatedThoughtPatterns}
            />
            <PatternSection
              title="Behavioural themes"
              description="How you tend to respond"
              items={recentBehaviouralThemes}
            />
            <ChangeSection signals={signals} />
            <HelpfulNextStepsSection items={nextSteps} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/quick">
              Create another reflection to make patterns clearer
            </LinkButton>
            <LinkButton href="/history" variant="secondary">
              Open history
            </LinkButton>
          </div>
        </>
      )}
    </PageShell>
  );
}
