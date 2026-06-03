import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function HistoryPage() {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">History</h1>
          <p className="mt-4 text-red-600">Failed to load reflections.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-[#5F7F63]">
          ← Back to reflection
        </a>

        <h1 className="mt-6 text-3xl font-semibold">Reflection History</h1>

        <p className="mt-3 text-[#5F6F61]">
          Past emotional reflections saved from InnerLeaf.
        </p>

        <div className="mt-8 space-y-6">
          {data?.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl bg-white/80 p-6 shadow-sm"
            >
              <p className="text-xs text-[#7A8377]">
                {new Date(item.created_at).toLocaleString()}
              </p>

              <h2 className="mt-4 font-semibold">What happened</h2>
              <p className="mt-2 whitespace-pre-wrap text-[#4F5F51]">
                {item.user_input}
              </p>

              <h2 className="mt-5 font-semibold">InnerLeaf Reflection</h2>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-[#4F5F51]">
                {item.ai_result}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}