import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ReflectionCards } from "./reflection-cards";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export type Reflection = {
  id: string | number;
  created_at: string;
  user_input: string | null;
  ai_result: string | null;
  emotion: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  facts: string | null;
  interpretation: string | null;
  behaviour: string | null;
  next_question: string | null;
};

export default async function HistoryPage() {
  const { data, error } = await supabase
    .from("reflections")
    .select(
      "id, created_at, user_input, ai_result, emotion, trigger, thought_pattern, facts, interpretation, behaviour, next_question"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase history fetch error:", error);
  }

  const reflections = (data ?? []) as Reflection[];

  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#5F7F63]">
          ← Back to reflection
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Reflection History</h1>

        <p className="mt-3 text-[#5F6F61]">
          Past emotional reflections saved from InnerLeaf.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/summary"
            className="inline-flex rounded-full bg-[#5F7F63] px-5 py-3 text-sm text-white"
          >
            View Pattern Summary
          </Link>
          <Link
            href="/feedback"
            className="inline-flex rounded-full border border-[#D8D2C4] px-5 py-3 text-sm text-[#5F7F63]"
          >
            Share feedback
          </Link>
        </div>

        {error && (
          <p className="mt-8 rounded-3xl bg-white/80 p-6 text-red-600 shadow-sm">
            Failed to load reflections.
          </p>
        )}

        {!error && reflections.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white/80 p-6 shadow-sm">
            <p className="text-[#5F6F61]">
              No reflections saved yet. Start with a quick reflection.
            </p>
            <Link
              href="/quick"
              className="mt-5 inline-flex rounded-full bg-[#5F7F63] px-5 py-3 text-sm text-white"
            >
              Start Quick Reflection
            </Link>
          </div>
        )}

        {!error && reflections.length > 0 && (
          <ReflectionCards reflections={reflections} />
        )}
      </div>
    </main>
  );
}
