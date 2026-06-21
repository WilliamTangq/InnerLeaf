"use client";

import { CheckCircle2, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Card, IconFrame, LinkButton, PageHeader, PageShell, SectionLabel } from "./ui";
import { useLanguage } from "./language-provider";

type InfoSection = readonly [string, string | readonly string[]];
const infoIcons = [Leaf, Sparkles, ShieldCheck, CheckCircle2] as const;

export function InfoPage({
  eyebrow,
  title,
  purpose,
  sections,
}: {
  eyebrow: string;
  title: string;
  purpose: string;
  sections: readonly InfoSection[];
}) {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader eyebrow={eyebrow} title={title}>
        {purpose}
      </PageHeader>

      <div className="grid gap-4">
        {sections.map(([heading, content], index) => {
          const Icon = infoIcons[index % infoIcons.length];

          return (
          <Card
            key={heading}
            className="relative overflow-hidden hover:translate-y-0"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(31,155,143,0.10),transparent_66%)]"
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-4">
              <IconFrame icon={Icon} size="sm" tone={index % 2 ? "gold" : "sage"} />
              <div className="min-w-0 flex-1">
                <SectionLabel>{heading}</SectionLabel>
            {Array.isArray(content) ? (
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {content.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      size={15}
                      strokeWidth={1.8}
                      className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
                {content}
              </p>
            )}
              </div>
            </div>
          </Card>
        );
        })}
      </div>

      <Card
        variant="muted"
        className="mt-6 flex flex-col gap-4 hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
          {t.common.footer}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/demo" variant="secondary" size="sm">
            {t.common.viewDemo}
          </LinkButton>
          <LinkButton href="/register" size="sm">
            {t.common.createAccount}
          </LinkButton>
        </div>
      </Card>
    </PageShell>
  );
}
