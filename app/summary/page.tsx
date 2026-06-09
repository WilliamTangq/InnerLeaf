import { createClient } from "@supabase/supabase-js";
import { SummaryContent } from "./summary-content";

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
    <SummaryContent
      hasError={Boolean(error)}
      reflectionCount={reflections.length}
      remaining={remaining}
      hasEnoughData={hasEnoughData}
      repeatedTriggers={repeatedTriggers}
      repeatedThoughtPatterns={repeatedThoughtPatterns}
      recentBehaviouralThemes={recentBehaviouralThemes}
      signals={signals}
      nextSteps={nextSteps}
    />
  );
}
