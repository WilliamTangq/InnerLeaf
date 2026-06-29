"use client";

import { Bell, CheckCircle2, Leaf, Sparkles, Users } from "lucide-react";
import { AnalyticsPageView } from "../components/analytics-tracker";
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

const pricingIcons = [Leaf, Sparkles, Users] as const;

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-6xl">
      <AnalyticsPageView event="pricing_viewed" />
      <PageHeader eyebrow={t.nav.pricing} title={t.pricing.title}>
        {t.pricing.purpose}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        {t.pricing.plans.map(([name, label, body], index) => {
          const Icon = pricingIcons[index % pricingIcons.length];
          const featured = index === 0;

          return (
            <Card
              key={name}
              variant={featured ? "elevated" : "default"}
              className={[
                "hover:translate-y-0",
                featured
                  ? "border-[rgba(31,155,143,0.22)] bg-[linear-gradient(135deg,rgba(230,245,239,0.70),rgba(255,254,248,0.96))]"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <IconFrame
                  icon={Icon}
                  size="md"
                  tone={index === 1 ? "gold" : "sage"}
                />
                <Badge variant={featured ? "accent" : "outline"}>{label}</Badge>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
                {body}
              </p>
            </Card>
          );
        })}
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
        <Card className="hover:translate-y-0">
          <SectionLabel>{t.pricing.premiumHooksTitle}</SectionLabel>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {t.pricing.premiumHooks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-[1rem] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm font-medium text-[var(--foreground-muted)]"
              >
                <CheckCircle2
                  aria-hidden="true"
                  size={15}
                  strokeWidth={1.9}
                  className="shrink-0 text-[var(--brand-teal-deep)]"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-[linear-gradient(145deg,rgba(255,254,248,0.96),rgba(255,248,226,0.54))] hover:translate-y-0"
        >
          <IconFrame icon={Bell} tone="gold" size="md" />
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {t.pricing.waitlistTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.pricing.waitlistBody}
          </p>
          <div className="mt-5">
            <LinkButton href="/feedback" size="lg">
              {t.pricing.waitlistCta}
            </LinkButton>
          </div>
        </Card>
      </section>

      <Card className="mt-6 hover:translate-y-0" variant="muted">
        <p className="text-sm leading-7 text-[var(--foreground-muted)]">
          {t.pricing.note}
        </p>
      </Card>
    </PageShell>
  );
}
