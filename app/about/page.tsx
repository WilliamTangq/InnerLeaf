"use client";

import { CheckCircle2, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import {
  Card,
  IconFrame,
  LinkButton,
  PageHeader,
  PageShell,
  SectionLabel,
} from "../components/ui";
import { useLanguage } from "../components/language-provider";

const sectionIcons = [Leaf, Sparkles, ShieldCheck, CheckCircle2] as const;

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader eyebrow={t.nav.about} title={t.about.title}>
        {t.about.purpose}
      </PageHeader>

      <Card
        variant="hero"
        className="mb-5 overflow-hidden bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(230,245,239,0.56))] hover:translate-y-0"
      >
        <div className="grid gap-5 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
          <div>
            <IconFrame icon={Leaf} size="lg" />
            <div className="mt-4">
              <SectionLabel>{t.about.originTitle}</SectionLabel>
            </div>
          </div>
          <div>
            <p className="text-lg leading-8 text-[var(--foreground)]">
              {t.about.originBody}
            </p>
            <p className="mt-4 rounded-[1.2rem] border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] px-4 py-3 text-sm leading-6 text-[var(--brand-teal-deep)]">
              {t.about.founderNote}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {t.about.sections.map(([heading, content], index) => {
          const Icon = sectionIcons[index % sectionIcons.length];

          return (
            <Card
              key={heading}
              className="relative min-h-[180px] overflow-hidden hover:translate-y-0"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(31,155,143,0.09),transparent_66%)]"
                aria-hidden="true"
              />
              <div className="relative flex items-start gap-3.5">
                <IconFrame icon={Icon} size="sm" tone={index % 2 ? "gold" : "sage"} />
                <div className="min-w-0 flex-1">
                  <SectionLabel>{heading}</SectionLabel>
                  {Array.isArray(content) ? (
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {content.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2
                            aria-hidden="true"
                            size={14}
                            strokeWidth={1.8}
                            className="mt-1 shrink-0 text-[var(--brand-teal-deep)]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
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
        className="mt-5 flex flex-col gap-4 hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
          {t.common.footer}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/demo" variant="secondary" size="sm">
            {t.common.tryDemo}
          </LinkButton>
          <LinkButton href="/test" size="sm">
            {t.common.helpTest}
          </LinkButton>
        </div>
      </Card>
    </PageShell>
  );
}
