"use client";

import {
  Archive,
  MessageSquare,
  PencilLine,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../components/language-provider";
import {
  Card,
  LinkButton,
  PageHeader,
  PageShell,
  SectionLabel,
  StatusCard,
} from "../components/ui";

const linkIcons = [PencilLine, Sparkles, Archive, TrendingUp, Send] as const;

export default function TestPage() {
  const { t } = useLanguage();
  const testingLinks = [
    [t.quick.title, "/quick"],
    [t.guided.title, "/guided"],
    [t.history.title, "/history"],
    [t.summary.title, "/summary"],
    [t.feedback.title, "/feedback"],
  ] as const;

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.test} title={t.test.title}>
        {t.test.purpose}
      </PageHeader>

      <StatusCard tone="neutral">{t.test.accountNote}</StatusCard>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton href="/register">{t.test.createAccount}</LinkButton>
        <LinkButton href="/login" variant="secondary">
          {t.test.login}
        </LinkButton>
        <LinkButton href="/demo" variant="ghost">
          {t.test.viewDemo}
        </LinkButton>
        <LinkButton href="/feedback" variant="ghost">
          {t.test.shareFeedback}
        </LinkButton>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="elevated">
          <SectionLabel>{t.test.whatToDo}</SectionLabel>
          <div className="mt-5 grid gap-3">
            {t.test.steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-medium text-[var(--brand-teal-deep)]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>{t.test.whatTesting}</SectionLabel>
          <ul className="mt-5 grid gap-3">
            {t.test.testingPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-6 text-[var(--foreground-muted)]">
                <MessageSquare
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.8}
                  className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section className="mt-8">
        <SectionLabel>{t.test.linksTitle}</SectionLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {testingLinks.map(([label, href], index) => {
            const Icon = linkIcons[index];
            return (
              <Card key={href} className="p-4 sm:p-5">
                <Icon
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <h2 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                  {label}
                </h2>
                <LinkButton href={href} variant="ghost" size="sm" className="mt-3">
                  {label}
                </LinkButton>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-8">
        <StatusCard tone="warning">{t.test.safety}</StatusCard>
      </div>
    </PageShell>
  );
}
