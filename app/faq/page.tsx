"use client";

import { Card, PageHeader, PageShell } from "../components/ui";
import { useLanguage } from "../components/language-provider";

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader eyebrow={t.nav.faq} title={t.faq.title}>
        {t.faq.purpose}
      </PageHeader>

      <div className="grid gap-4">
        {t.faq.items.map(([question, answer]) => (
          <Card key={question} className="hover:translate-y-0">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {question}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">
              {answer}
            </p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
