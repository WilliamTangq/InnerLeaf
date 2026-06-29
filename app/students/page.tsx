"use client";

import { BookOpen, HeartHandshake, MessageCircle, TrendingUp, Users } from "lucide-react";
import {
  Badge,
  Card,
  IconFrame,
  LinkButton,
  PageHeader,
  PageShell,
  SectionLabel,
} from "../components/ui";
import { useLanguage } from "../components/language-provider";

const useCaseIcons = [MessageCircle, BookOpen, TrendingUp, HeartHandshake] as const;
const sectionIcons = [Users, BookOpen, HeartHandshake] as const;

export default function StudentsPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-6xl">
      <PageHeader eyebrow={t.nav.forStudents} title={t.students.title}>
        {t.students.purpose}
      </PageHeader>

      <Card
        variant="hero"
        className="mb-6 overflow-hidden bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(230,245,239,0.58))] hover:translate-y-0"
      >
        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <Badge variant="accent">{t.students.short}</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {t.students.useCasesTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.students.ctaBody}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.students.useCases.map(([title, body], index) => {
              const Icon = useCaseIcons[index % useCaseIcons.length];

              return (
                <div
                  key={title}
                  className="rounded-[1.35rem] border border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)]"
                >
                  <IconFrame icon={Icon} size="sm" tone={index % 2 ? "gold" : "sage"} />
                  <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {t.students.sections.map(([title, items], index) => {
          const Icon = sectionIcons[index % sectionIcons.length];

          return (
            <Card key={title} className="hover:translate-y-0">
              <IconFrame icon={Icon} size="md" tone={index % 2 ? "gold" : "sage"} />
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-muted)]">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal-deep)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card
        variant="elevated"
        className="mt-8 flex flex-col gap-5 hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <SectionLabel>{t.students.ctaTitle}</SectionLabel>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
            {t.students.ctaBody}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <LinkButton href="/demo" size="lg">
            {t.common.tryDemo}
          </LinkButton>
          <LinkButton href="/register" variant="secondary" size="lg">
            {t.common.createAccount}
          </LinkButton>
        </div>
      </Card>
    </PageShell>
  );
}
