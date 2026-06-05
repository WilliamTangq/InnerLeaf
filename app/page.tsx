import type { ReactNode } from "react";
import {
  Archive,
  Brain,
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
    description: "A few honest sentences. Messy is fine.",
  },
  {
    icon: Leaf,
    title: "Get your reflection card",
    description: "Trigger, facts, interpretation, and one small next step.",
  },
  {
    icon: Archive,
    title: "Revisit in History",
    description: "Each moment stays in your personal archive.",
  },
  {
    icon: TrendingUp,
    title: "Notice patterns",
    description: "See what repeats across your last saved cards.",
  },
] as const;

function LandingSection({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "mt-16 border-t border-[var(--border)] pt-12 sm:mt-20 sm:pt-14",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.65rem]">
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
      label: "Thought pattern",
      text: "Jumping to a negative conclusion.",
      highlight: false,
    },
    {
      icon: HelpCircle,
      label: "One next question",
      text: "What else could explain the delay besides rejection?",
      highlight: true,
    },
  ] as const;

  return (
    <Card
      variant="elevated"
      className="relative overflow-hidden border-[rgba(31,155,143,0.15)] lg:order-2"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-70"
        style={{ background: "var(--brand-gradient-soft)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionLabel>The reflection card</SectionLabel>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              One moment, structured
            </p>
          </div>
          <Badge variant="accent">~3 min</Badge>
        </div>

        <div className="mt-5 grid gap-2.5 sm:gap-3">
          {preview.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={[
                  "rounded-[var(--radius-lg)] border p-3.5 sm:p-4",
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
                <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
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
      <section className="grid gap-10 py-4 sm:gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:py-6">
        <div className="max-w-xl lg:order-1">
          <BrandLogo
            size="hero"
            href={null}
            showWordmark={false}
            className="mb-6 sm:mb-8"
          />
          <Badge variant="accent">One emotional moment at a time</Badge>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-[var(--foreground)] sm:mt-5 sm:text-[2.75rem] sm:leading-[1.08]">
            Turn a reaction into a{" "}
            <span className="brand-gradient-text">reflection card</span>.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--foreground-muted)] sm:mt-5 sm:text-lg sm:leading-8">
            Write freely. InnerLeaf separates facts from interpretation and ends
            with one small next step — then saves the card so you can check in
            and spot patterns later.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <LinkButton href="/quick" size="lg" className="w-full sm:w-auto">
              Start quick reflection
            </LinkButton>
            <LinkButton
              href="/guided"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Prefer step-by-step? Try guided
            </LinkButton>
          </div>
        </div>

        <ReflectionPreview />
      </section>

      <LandingSection eyebrow="How it works" title="Write once. Review clearly.">
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full hover:translate-y-0">
                <div className="flex items-center justify-between gap-3">
                  <Icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.8}
                    className="text-[var(--brand-teal-deep)]"
                  />
                  <span className="text-xs font-medium text-[var(--foreground-subtle)]">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Why InnerLeaf"
        title="Episode breakdown — not another wellness app."
        className="mb-16 sm:mb-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <Card className="hover:translate-y-0">
            <h3 className="font-semibold text-[var(--foreground)]">
              Not a mood tracker
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              See what triggered the reaction and how your mind framed it.
            </p>
          </Card>
          <Card className="hover:translate-y-0">
            <h3 className="font-semibold text-[var(--foreground)]">
              Not open-ended journaling
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              One episode, one card — not a daily diary habit.
            </p>
          </Card>
          <Card className="hover:translate-y-0">
            <h3 className="font-semibold text-[var(--foreground)]">
              Not a chat thread
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              The same structured format every time, saved for comparison.
            </p>
          </Card>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/quick" size="lg">
            Start quick reflection
          </LinkButton>
          <LinkButton href="/history" variant="secondary">
            View history
          </LinkButton>
        </div>
      </LandingSection>
    </PageShell>
  );
}
