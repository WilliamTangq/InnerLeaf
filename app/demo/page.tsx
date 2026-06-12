"use client";

import {
  Archive,
  Brain,
  HelpCircle,
  MessageCircle,
  PencilLine,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { VideoBlock } from "../components/video-block";
import { useLanguage } from "../components/language-provider";
import {
  Badge,
  Card,
  LinkButton,
  PageHeader,
  PageShell,
  SectionLabel,
} from "../components/ui";

const flowIcons = [
  PencilLine,
  Scale,
  Brain,
  HelpCircle,
  Archive,
  TrendingUp,
] as const;

type DemoCase = {
  title: string;
  messy: string;
  trigger: string;
  facts: string;
  interpretation: string;
  pattern: string;
  behaviour: string;
  question: string;
  step: string;
};

function DemoReflectionCard() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <SectionLabel>{t.reflectionCard.trigger}</SectionLabel>
          <Badge variant="outline">{t.common.demoData}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          {t.home.previewTrigger}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <SectionLabel>{t.reflectionCard.facts}</SectionLabel>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.home.previewFacts}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <SectionLabel>{t.reflectionCard.interpretation}</SectionLabel>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.home.previewInterpretation}
          </p>
        </div>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)] p-4">
        <SectionLabel>{t.reflectionCard.nextStep}</SectionLabel>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          {t.home.previewStep}
        </p>
      </div>
    </div>
  );
}

function DemoCaseCard({
  item,
}: {
  item: DemoCase;
}) {
  const { t } = useLanguage();
  const fields = [
    [t.demo.caseFields.messy, item.messy],
    [t.demo.caseFields.trigger, item.trigger],
    [t.demo.caseFields.facts, item.facts],
    [t.demo.caseFields.interpretation, item.interpretation],
    [t.demo.caseFields.pattern, item.pattern],
    [t.demo.caseFields.behaviour, item.behaviour],
    [t.demo.caseFields.question, item.question],
    [t.demo.caseFields.step, item.step],
  ] as const;

  return (
    <Card className="h-full hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {item.title}
        </h2>
        <Badge variant="outline">{t.common.demoData}</Badge>
      </div>
      <div className="mt-5 grid gap-3">
        {fields.map(([label, value], index) => (
          <div
            key={label}
            className={[
              "rounded-[var(--radius-lg)] border border-[var(--border)] p-3.5",
              index === fields.length - 1
                ? "bg-[var(--accent-soft)]"
                : "bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              {label}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DemoPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.demo} title={t.demo.title}>
        {t.demo.purpose}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <Card variant="elevated">
          <Badge variant="accent">{t.demo.storyLabel}</Badge>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {t.demo.story}
          </h2>
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              <MessageCircle aria-hidden="true" size={14} strokeWidth={1.8} />
              {t.home.heroStructured}
            </div>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              “{t.home.heroMessy}”
            </p>
          </div>
        </Card>

        <VideoBlock fallback={<DemoReflectionCard />} />
      </div>

      <section className="mt-10">
        <SectionLabel>{t.demo.flowTitle}</SectionLabel>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.demo.steps.map(([title, description], index) => {
            const Icon = flowIcons[index];
            return (
              <Card key={title} className="h-full hover:translate-y-0">
                <Icon
                  aria-hidden="true"
                  size={19}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <h2 className="mt-4 text-sm font-semibold leading-6 text-[var(--foreground)]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>{t.demo.casesTitle}</SectionLabel>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {t.demo.cases.map((item) => (
            <DemoCaseCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <Card variant="elevated" className="mt-10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionLabel>{t.demo.whyMattersTitle}</SectionLabel>
            <p className="mt-4 text-base leading-7 text-[var(--foreground-muted)]">
              {t.demo.whyMattersCopy}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {t.demo.pitchBullets.map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium leading-6 text-[var(--foreground-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="mt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <Sparkles
              aria-hidden="true"
              size={20}
              strokeWidth={1.8}
              className="text-[var(--brand-teal-deep)]"
            />
            <h2 className="mt-3 text-xl font-semibold leading-8 text-[var(--foreground)]">
              {t.demo.valueTitle}
            </h2>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <LinkButton href="/quick" size="lg">
              {t.demo.tryQuick}
            </LinkButton>
            <LinkButton href="/test" variant="secondary">
              {t.demo.joinTesting}
            </LinkButton>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
