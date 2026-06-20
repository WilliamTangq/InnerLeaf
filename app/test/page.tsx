"use client";

import {
  Archive,
  LogIn,
  MessageSquare,
  PencilLine,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../components/auth-provider";
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
  const { user, isAdmin } = useAuth();
  const testingLinks = [
    [t.quick.title, "/dashboard/quick"],
    [t.guided.title, "/dashboard/guided"],
    [t.history.title, "/dashboard/history"],
    [t.summary.title, "/dashboard/summary"],
    [t.feedback.title, "/feedback"],
  ] as const;
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.test} title={t.test.title}>
        {t.test.purpose}
      </PageHeader>

      <Card variant="elevated" className="hover:translate-y-0">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <SectionLabel>{t.nav.test}</SectionLabel>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
              {user ? t.test.loggedInNote : t.test.loggedOutNote}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-subtle)]">
              {t.test.demoNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <>
                <LinkButton href={dashboardHref}>
                  {t.test.goDashboard}
                </LinkButton>
                <LinkButton href="/dashboard/quick" variant="secondary">
                  {t.test.startQuick}
                </LinkButton>
              </>
            ) : (
              <>
                <LinkButton href="/register">
                  <UserPlus aria-hidden="true" size={15} strokeWidth={1.8} />
                  {t.test.createAccount}
                </LinkButton>
                <LinkButton href="/login" variant="secondary">
                  <LogIn aria-hidden="true" size={15} strokeWidth={1.8} />
                  {t.test.login}
                </LinkButton>
              </>
            )}
            <LinkButton href="/demo" variant="ghost">
              {t.test.viewDemo}
            </LinkButton>
          </div>
        </div>
      </Card>

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
