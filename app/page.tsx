import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] px-6 py-10 text-[#24352B]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col">
        <p className="mb-3 text-sm tracking-wide text-[#6B7C6A]">InnerLeaf</p>

        <section className="flex flex-1 flex-col justify-center">
          <h1 className="mb-4 text-4xl font-semibold leading-tight">
            Understand the pattern behind your emotional reaction.
          </h1>

          <p className="mb-10 text-lg leading-8 text-[#5F6F61]">
            Turn emotional moments into structured reflection cards.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/quick"
              className="rounded-3xl bg-white/80 p-6 shadow-sm transition hover:bg-white"
            >
              <h2 className="text-2xl font-semibold">Quick Reflection</h2>
              <p className="mt-3 leading-7 text-[#5F6F61]">
                I just want to write it down.
              </p>
            </Link>

            <Link
              href="/guided"
              className="rounded-3xl bg-white/80 p-6 shadow-sm transition hover:bg-white"
            >
              <h2 className="text-2xl font-semibold">Guided Reflection</h2>
              <p className="mt-3 leading-7 text-[#5F6F61]">
                I want to reflect step by step.
              </p>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#5F7F63]">
            <Link href="/history">View reflection history</Link>
            <Link href="/summary">View pattern summary</Link>
            <Link href="/feedback">Share feedback</Link>
          </div>
        </section>

        <p className="mt-8 text-xs leading-6 text-[#7A8377]">
          InnerLeaf is not therapy, diagnosis, or medical advice.
        </p>
      </div>
    </main>
  );
}
