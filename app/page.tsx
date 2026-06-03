import Link from "next/link";
import { Card, Disclaimer, LinkButton, PageShell } from "./components/ui";

export default function Home() {
  return (
    <PageShell maxWidth="max-w-5xl">
      <section className="grid min-h-[calc(100vh-9rem)] items-center gap-10 py-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-sm font-medium tracking-wide text-[#6B7C6A]">
            InnerLeaf
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#24352B] sm:text-5xl">
            Understand the pattern behind your emotional reaction.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F6F61]">
            Turn emotional moments into structured reflection cards you can
            revisit over time.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#5F7F63]">
            <Link className="hover:text-[#38533D]" href="/history">
              View history
            </Link>
            <Link className="hover:text-[#38533D]" href="/summary">
              View pattern summary
            </Link>
            <Link className="hover:text-[#38533D]" href="/feedback">
              Share feedback
            </Link>
          </div>

          <Disclaimer />
        </div>

        <div className="grid gap-4">
          <Card>
            <h2 className="text-2xl font-semibold">Quick Reflection</h2>
            <p className="mt-3 leading-7 text-[#5F6F61]">
              I just want to write it down.
            </p>
            <div className="mt-6">
              <LinkButton href="/quick">Start quick reflection</LinkButton>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold">Guided Reflection</h2>
            <p className="mt-3 leading-7 text-[#5F6F61]">
              I want to reflect step by step.
            </p>
            <div className="mt-6">
              <LinkButton href="/guided">Start guided reflection</LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
