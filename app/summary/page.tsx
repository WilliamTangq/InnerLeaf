import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type SummaryReflection = {
  id: string | number;
  trigger: string | null;
  thought_pattern: string | null;
  behaviour: string | null;
};

type PatternItem = {
  value: string;
  count: number;
};

function normalizeValue(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
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

function PatternSection({
  title,
  items,
}: {
  title: string;
  items: PatternItem[];
}) {
  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[#5F6F61]">
          Not enough structured data yet.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.value}
              className="rounded-2xl bg-[#F7F4EF] p-4 text-sm leading-6 text-[#4F5F51]"
            >
              <span>{item.value}</span>
              <span className="ml-2 text-xs text-[#7A8377]">
                {item.count} time{item.count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function SummaryPage() {
  const { data, error } = await supabase
    .from("reflections")
    .select("id, trigger, thought_pattern, behaviour")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase summary fetch error:", error);
  }

  const reflections = (data ?? []) as SummaryReflection[];
  const hasEnoughData = reflections.length >= 3;

  const repeatedTriggers = topPatterns(reflections.map((item) => item.trigger));
  const repeatedThoughtPatterns = topPatterns(
    reflections.map((item) => item.thought_pattern)
  );
  const recentBehaviouralThemes = topPatterns(
    reflections.map((item) => item.behaviour)
  );

  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#5F7F63]">
          Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Pattern Summary</h1>

        <p className="mt-3 leading-7 text-[#5F6F61]">
          These patterns are based on your saved reflection cards. They are not
          diagnosis or medical advice.
        </p>

        <Link
          href="/feedback"
          className="mt-5 inline-flex rounded-full border border-[#D8D2C4] px-5 py-3 text-sm text-[#5F7F63]"
        >
          Share feedback
        </Link>

        {error && (
          <p className="mt-8 rounded-3xl bg-white/80 p-6 text-red-600 shadow-sm">
            Failed to load pattern summary.
          </p>
        )}

        {!error && !hasEnoughData && (
          <div className="mt-8 rounded-3xl bg-white/80 p-6 shadow-sm">
            <p className="text-[#5F6F61]">
              Save at least 3 reflections to see your repeated patterns.
            </p>
            <Link
              href="/quick"
              className="mt-5 inline-flex rounded-full bg-[#5F7F63] px-5 py-3 text-sm text-white"
            >
              Start Quick Reflection
            </Link>
          </div>
        )}

        {!error && hasEnoughData && (
          <div className="mt-8 grid gap-5">
            <PatternSection
              title="Repeated Triggers"
              items={repeatedTriggers}
            />
            <PatternSection
              title="Repeated Thought Patterns"
              items={repeatedThoughtPatterns}
            />
            <PatternSection
              title="Recent Behavioural Themes"
              items={recentBehaviouralThemes}
            />
          </div>
        )}
      </div>
    </main>
  );
}
