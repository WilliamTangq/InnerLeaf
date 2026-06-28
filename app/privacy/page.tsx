"use client";

import { AlertTriangle, CheckCircle2, Download, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { Card, IconFrame, LinkButton, PageHeader, PageShell, SectionLabel } from "../components/ui";
import { useLanguage } from "../components/language-provider";

const controlIcons = [LockKeyhole, Trash2, Trash2, Download, ShieldCheck] as const;

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.privacy} title={t.privacy.title}>
        {t.privacy.purpose}
      </PageHeader>

      <Card
        variant="muted"
        className="mb-5 border-[rgba(180,90,45,0.18)] bg-[linear-gradient(135deg,rgba(255,248,226,0.72),rgba(255,254,248,0.92))] hover:translate-y-0"
      >
        <div className="flex gap-3">
          <IconFrame icon={AlertTriangle} tone="gold" size="sm" />
          <div>
            <SectionLabel>{t.privacy.safetyTitle}</SectionLabel>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.privacy.safetyBody}
            </p>
          </div>
        </div>
      </Card>

      <section className="mb-5">
        <SectionLabel>{t.privacy.controlsTitle}</SectionLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {t.privacy.controls.map(([title, body], index) => {
            const Icon = controlIcons[index % controlIcons.length];

            return (
              <Card key={title} className="hover:translate-y-0">
                <div className="flex items-start gap-3">
                  <IconFrame icon={Icon} size="sm" tone={index === 0 ? "sage" : "gold"} />
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {body}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {t.privacy.sections.map(([heading, content]) => (
          <Card key={heading} className="hover:translate-y-0">
            <div className="flex items-start gap-3">
              <IconFrame icon={CheckCircle2} size="sm" tone="sage" />
              <div>
                <SectionLabel>{heading}</SectionLabel>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                  {content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card
        variant="muted"
        className="mt-5 flex flex-col gap-4 hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
          {t.common.footer}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/demo" variant="secondary" size="sm">
            {t.common.viewDemo}
          </LinkButton>
          <LinkButton href="/feedback" size="sm">
            {t.nav.feedback}
          </LinkButton>
        </div>
      </Card>
    </PageShell>
  );
}
