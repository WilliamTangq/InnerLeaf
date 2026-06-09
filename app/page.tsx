"use client";

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
import { useLanguage } from "./components/language-provider";

const stepIcons = [PencilLine, Leaf, Archive, TrendingUp] as const;

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
  const { t } = useLanguage();
  const preview = [
    {
      icon: Zap,
      label: "Trigger",
      labelText: t.reflectionCard.trigger,
      text: t.home.previewTrigger,
      highlight: false,
    },
    {
      icon: Scale,
      label: "Facts",
      labelText: t.reflectionCard.facts,
      text: t.home.previewFacts,
      highlight: false,
    },
    {
      icon: Route,
      label: "Interpretation",
      labelText: t.reflectionCard.interpretation,
      text: t.home.previewInterpretation,
      highlight: false,
    },
    {
      icon: Brain,
      label: "Thought pattern",
      labelText: t.reflectionCard.thoughtPattern,
      text: t.home.previewPattern,
      highlight: false,
    },
    {
      icon: HelpCircle,
      label: "One small next step",
      labelText: t.reflectionCard.nextStep,
      text: t.home.previewStep,
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
            <SectionLabel>{t.home.previewEyebrow}</SectionLabel>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              {t.home.previewTitle}
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
                  {item.labelText}
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
  const { t } = useLanguage();

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
          <Badge variant="accent">{t.home.badge}</Badge>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-[var(--foreground)] sm:mt-5 sm:text-[2.75rem] sm:leading-[1.08]">
            {t.home.headline}
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--foreground-muted)] sm:mt-5 sm:text-lg sm:leading-8">
            {t.home.subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <LinkButton href="/quick" size="lg" className="w-full sm:w-auto">
              {t.common.startQuick}
            </LinkButton>
            <LinkButton
              href="/guided"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              {t.common.tryGuided}
            </LinkButton>
          </div>
          <p className="mt-4 text-sm text-[var(--foreground-subtle)]">
            {t.home.boundary}
          </p>
        </div>

        <ReflectionPreview />
      </section>

      <LandingSection eyebrow={t.home.howEyebrow} title={t.home.howTitle}>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {t.home.steps.map(([title, description], index) => {
            const Icon = stepIcons[index];
            return (
              <Card key={title} className="h-full hover:translate-y-0">
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
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                  {description}
                </p>
              </Card>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow={t.home.whyEyebrow}
        title={t.home.whyTitle}
        className="mb-16 sm:mb-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {t.home.differences.map(([title, description]) => (
            <Card key={title} className="hover:translate-y-0">
              <h3 className="font-semibold text-[var(--foreground)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {description}
              </p>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/quick" size="lg">
            {t.common.startQuick}
          </LinkButton>
          <LinkButton href="/history" variant="secondary">
            {t.common.viewHistory}
          </LinkButton>
          <LinkButton href="/summary" variant="ghost">
            {t.home.patternSummary}
          </LinkButton>
          <LinkButton href="/feedback" variant="ghost">
            {t.nav.feedback}
          </LinkButton>
        </div>
      </LandingSection>
    </PageShell>
  );
}
