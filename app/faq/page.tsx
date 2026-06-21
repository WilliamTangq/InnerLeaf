"use client";

import { HelpCircle, ShieldCheck } from "lucide-react";
import { Card, IconFrame, PageHeader, PageShell } from "../components/ui";
import { useLanguage } from "../components/language-provider";

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader eyebrow={t.nav.faq} title={t.faq.title}>
        {t.faq.purpose}
      </PageHeader>

      <Card
        variant="elevated"
        className="mb-5 flex items-start gap-4 hover:translate-y-0"
      >
        <IconFrame icon={ShieldCheck} size="md" />
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.common.footer}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.faq.purpose}
          </p>
        </div>
      </Card>

      <div className="grid gap-3">
        {t.faq.items.map(([question, answer], index) => (
          <details
            key={question}
            open={index < 2}
            className="group rounded-[1.45rem] border border-[var(--border)] bg-[rgba(255,254,248,0.86)] p-4 shadow-[var(--shadow-sm)] transition hover:border-[rgba(31,155,143,0.18)] hover:shadow-[var(--shadow-soft)]"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3">
              <IconFrame icon={HelpCircle} size="sm" tone={index % 2 ? "gold" : "sage"} />
              <span className="min-w-0 flex-1 text-base font-semibold leading-6 text-[var(--foreground)]">
                {question}
              </span>
              <span className="mt-1 text-sm text-[var(--foreground-subtle)] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="ml-11 mt-3 text-sm leading-7 text-[var(--foreground-muted)]">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
