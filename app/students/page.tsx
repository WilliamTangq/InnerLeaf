"use client";

import { Card, LinkButton, PageHeader, PageShell } from "../components/ui";
import { useLanguage } from "../components/language-provider";

export default function StudentsPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.forStudents} title={t.students.title}>
        {t.students.purpose}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {t.students.sections.map(([title, items]) => (
          <Card key={title} className="hover:translate-y-0">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-muted)]">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/register" size="lg">
          {t.common.getStarted}
        </LinkButton>
        <LinkButton href="/demo" variant="secondary" size="lg">
          {t.common.viewDemo}
        </LinkButton>
      </div>
    </PageShell>
  );
}
