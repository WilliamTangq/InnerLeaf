"use client";

import { Archive, Footprints, PencilLine, TrendingUp } from "lucide-react";
import { RequireAuth } from "../components/route-guards";
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

const icons = [PencilLine, Footprints, Archive, TrendingUp] as const;

function WorkspaceContent() {
  const { t } = useLanguage();
  const { profile, user } = useAuth();
  const name = profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow={t.nav.workspace} title={t.app.title}>
        {t.app.subtitle}
      </PageHeader>

      <p className="-mt-3 mb-5 text-sm font-medium text-[var(--brand-teal-deep)]">
        {t.app.welcome}, {name}
      </p>

      <StatusCard tone="neutral">{t.app.privacy}</StatusCard>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {t.app.cards.map(([title, description, cta, href], index) => {
          const Icon = icons[index];

          return (
            <Card key={href} variant="elevated" className="h-full">
              <Icon
                aria-hidden="true"
                size={20}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {description}
              </p>
              <LinkButton href={href} size="sm" className="mt-5">
                {cta}
              </LinkButton>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <SectionLabel>{t.app.recent}</SectionLabel>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.app.noRecent}
          </p>
          <LinkButton href="/history" variant="secondary" size="sm" className="mt-4">
            {t.common.viewHistory}
          </LinkButton>
        </Card>
        <Card className="hover:translate-y-0">
          <SectionLabel>{t.summary.title}</SectionLabel>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.app.summaryTeaser}
          </p>
          <LinkButton href="/summary" variant="secondary" size="sm" className="mt-4">
            {t.common.viewPatterns}
          </LinkButton>
        </Card>
      </div>

      <p className="mt-6 text-sm text-[var(--foreground-subtle)]">
        {user?.email || profile?.email}
      </p>
    </PageShell>
  );
}

export default function WorkspacePage() {
  return (
    <RequireAuth>
      <WorkspaceContent />
    </RequireAuth>
  );
}
