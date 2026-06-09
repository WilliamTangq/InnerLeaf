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

function DemoReflectionCard() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <SectionLabel>{t.reflectionCard.trigger}</SectionLabel>
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
