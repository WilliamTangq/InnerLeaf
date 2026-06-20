"use client";

import { AnalyticsPageView } from "../components/analytics-tracker";
import { Card, LinkButton, PageHeader, PageShell } from "../components/ui";
import { useLanguage } from "../components/language-provider";

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-5xl">
      <AnalyticsPageView event="pricing_viewed" />
      <PageHeader eyebrow={t.nav.pricing} title={t.pricing.title}>
        {t.pricing.purpose}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {t.pricing.plans.map(([name, label, body]) => (
          <Card key={name} className="hover:translate-y-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              {label}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {name}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
              {body}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 hover:translate-y-0" variant="muted">
        <p className="text-sm leading-7 text-[var(--foreground-muted)]">
          {t.pricing.note}
        </p>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/register" size="lg">
          {t.common.getStarted}
        </LinkButton>
        <LinkButton href="/feedback" variant="secondary" size="lg">
          {t.nav.feedback}
        </LinkButton>
      </div>
    </PageShell>
  );
}
