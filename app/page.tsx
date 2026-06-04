import type { ReactNode } from "react";
import {
  Archive,
  Brain,
  CheckCircle2,
  HelpCircle,
  Leaf,
  PencilLine,
  Route,
  Scale,
  TrendingUp,
  Zap,
} from "lucide-react";
import { BrandLogo } from "./components/brand-logo";
import {
  Badge,
  Card,
  LinkButton,
  PageShell,
  SectionLabel,
} from "./components/ui";

const steps = [
  {
    icon: PencilLine,
    title: "Write what happened",
    description: "Start messy. A few honest sentences are enough.",
  },
  {
    icon: Leaf,
    title: "InnerLeaf organises it",
    description: "The moment becomes trigger, facts, interpretation, and one next question.",
  },
  {
    icon: Archive,
    title: "Save a reflection card",
    description: "Each response becomes a structured card you can revisit.",
  },
  {
    icon: TrendingUp,
    title: "Notice repeated patterns",
    description: "Review recent triggers, thought patterns, and behaviours.",
  },
] as const;

const comparisons = [
  {
    title: "Not a mood tracker",
    description:
      "Name the moment, not just the mood. See what triggered the reaction and how your mind framed it.",
  },
  {
    title: "Not open-ended journaling",
    description:
      "You are breaking down one episode — not keeping a daily diary. Write freely; InnerLeaf structures the moment.",
  },
  {
    title: "Not a chat thread",
    description:
      "Each moment becomes the same reflection card format — saved, comparable, and easy to revisit.",
  },
] as const;

const clarityPoints = [
  "Facts vs interpretation",
  "One next question",
  "One main trigger",
  "One thought pattern",
  "Saved as a card",
  "Patterns over time",
] as const;

function LandingSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-24 border-t border-[var(--border)] pt-16">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ReflectionPreview() {
  const preview = [
    {
      icon: Zap,
      label: "Trigger",
      text: "A delayed reply from someone important.",
      highlight: false,
    },
    {
      icon: Scale,
      label: "Facts",
      text: "The message was sent. No reply yet.",
      highlight: false,
    },
    {
      icon: Route,
      label: "Interpretation",
      text: "They may be upset with me.",
      highlight: false,
    },
    {
      icon: Brain,
      label: "Thought Pattern",
      text: "This might be jumping to a negative conclusion.",
      highlight: false,
    },
    {
      icon: HelpCircle,
      label: "One Next Question",
      text: "What else could explain the delay besides rejection?",
      highlight: true,
    },
  ] as const;

  return (
    <Card
      variant="elevated"
      className="relative overflow-hidden border-[rgba(31,155,143,0.15)]"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-70"
        style={{ background: "var(--brand-gradient-soft)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionLabel>The reflection card</SectionLabel>
            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              One emotional moment, structured
            </h2>
          </div>
          <Badge variant="accent">3 min</Badge>
        </div>

        <div className="mt-5 grid gap-3">
          {preview.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={[
                  "rounded-[var(--radius-lg)] border p-4",
                  item.highlight
                    ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.8}
                    className="text-[var(--brand-teal-deep)]"
                  />
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function Home() {
  return (
    <PageShell maxWidth="max-w-6xl">
      <section className="grid gap-12 py-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <BrandLogo
            size="hero"
            href={null}
            showWordmark={false}
            className="mb-8"
          />
          <Badge variant="accent">Break down one emotional moment</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[3rem] sm:leading-[1.08]">
            Understand the pattern behind your{" "}
            <span className="brand-gradient-text">emotional reaction</span>.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--foreground-muted)]">
            InnerLeaf is for one intense moment at a time — not daily journaling.
            You get a reflection card that separates facts from interpretation
            and ends with one next question.
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {(["Facts vs interpretation", "One next question"] as const).map(
              (point) => (
                <li
                  key={point}
                  className="rounded-lg border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--brand-teal-deep)]"
                >
                  {point}
                </li>
              )
            )}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/quick" size="lg">
              Start quick reflection
            </LinkButton>
            <LinkButton href="/guided" variant="secondary" size="lg">
              Try guided reflection
            </LinkButton>
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            For self-reflection only — not clinical care or medical advice.
          </p>
        </div>

        <ReflectionPreview />
      </section>

      <LandingSection eyebrow="How it works" title="From messy feelings to a saved reflection card.">
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <Icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.8}
                    className="text-[var(--brand-teal-deep)]"
                  />
                  <span className="text-xs font-medium text-[var(--foreground-subtle)]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="What you get each time"
        title="Designed for clarity, not endless analysis."
      >
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clarityPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground-muted)] shadow-[var(--shadow-sm)]"
            >
              <CheckCircle2
                aria-hidden="true"
                size={16}
                strokeWidth={1.8}
                className="shrink-0 text-[var(--brand-teal-deep)]"
              />
              {point}
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Why InnerLeaf" title="Episode breakdown — not another wellness app.">
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {comparisons.map((item) => (
            <Card key={item.title}>
              <h3 className="font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </LandingSection>

      <section className="mt-24 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <SectionLabel>What InnerLeaf does not do</SectionLabel>
            <p className="mt-3 text-lg font-medium leading-8 text-[var(--foreground)]">
              InnerLeaf does not score your mood, label you, or tell you what is
              wrong with you. It helps you break down one moment and leave with
              one clearer question.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <LinkButton href="/quick">Start quick reflection</LinkButton>
            <LinkButton href="/history" variant="secondary">
              View history
            </LinkButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
