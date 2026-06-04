import Link from "next/link";
import { BrandLogo } from "./components/brand-logo";
import {
  Badge,
  Card,
  Disclaimer,
  LinkButton,
  PageShell,
  SectionLabel,
} from "./components/ui";

const steps = [
  {
    step: "01",
    title: "Write the moment",
    description:
      "Capture what happened in your own words—quick freeform or a gentle guided flow.",
  },
  {
    step: "02",
    title: "See the structure",
    description:
      "InnerLeaf organises triggers, facts, interpretations, and thought patterns into a clear card.",
  },
  {
    step: "03",
    title: "Notice patterns",
    description:
      "Revisit history and spot recurring themes in triggers, thinking, and behaviour over time.",
  },
] as const;

export default function Home() {
  return (
    <PageShell maxWidth="max-w-6xl">
      <section className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <BrandLogo size="hero" href={null} showWordmark={false} className="mb-8" />
          <Badge variant="accent">AI-assisted reflection</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.75rem] sm:leading-[1.12]">
            Understand the pattern behind your{" "}
            <span className="brand-gradient-text">emotional reaction</span>.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--foreground-muted)]">
            Turn emotional moments into structured reflection cards you can
            revisit over time.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/quick" size="lg">
              Start quick reflection
            </LinkButton>
            <LinkButton href="/guided" variant="secondary" size="lg">
              Try guided flow
            </LinkButton>
          </div>

          <Disclaimer className="mt-6" />
        </div>

        <div className="grid gap-4">
          <Card
            variant="elevated"
            className="relative overflow-hidden border-[rgba(31,155,143,0.15)]"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-60"
              style={{ background: "var(--brand-gradient-soft)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Quick Reflection</h2>
                <Badge variant="accent">Recommended</Badge>
              </div>
              <p className="mt-2 font-medium text-[var(--foreground)]">
                I just want to write it down.
              </p>
              <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
                Write freely. InnerLeaf will help organise the moment into a
                clear reflection card.
              </p>
              <div className="mt-6">
                <LinkButton href="/quick">Start quick reflection</LinkButton>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Guided Reflection</h2>
            <p className="mt-2 font-medium text-[var(--foreground)]">
              I want to reflect step by step.
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--foreground-muted)]">
              Use a CBT-informed structure to separate facts, thoughts,
              emotions, interpretations, and reactions.
            </p>
            <div className="mt-6">
              <LinkButton href="/guided" variant="secondary">
                Start guided reflection
              </LinkButton>
            </div>
          </Card>

          <div className="flex flex-wrap gap-4 px-1 text-sm text-[var(--foreground-muted)]">
            <Link
              className="font-medium transition hover:text-[var(--brand-teal-deep)]"
              href="/history"
            >
              View history →
            </Link>
            <Link
              className="font-medium transition hover:text-[var(--brand-teal-deep)]"
              href="/summary"
            >
              Pattern Summary →
            </Link>
            <Link
              className="font-medium transition hover:text-[var(--brand-teal-deep)]"
              href="/feedback"
            >
              Feedback →
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-24 border-t border-[var(--border)] pt-16">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Simple, intentional, private
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
            >
              <span
                className="font-mono text-xs font-medium"
                style={{ color: "var(--brand-teal)" }}
              >
                {item.step}
              </span>
              <h3 className="mt-3 font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
