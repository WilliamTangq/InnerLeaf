"use client";

import { Archive, Footprints, PencilLine, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  Card,
  LinkButton,
  PageHeader,
  SectionLabel,
  StatusCard,
} from "../components/ui";

const icons = [PencilLine, Footprints, Archive, TrendingUp] as const;

type RecentReflection = {
  id: string;
  created_at: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  emotion: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkspaceContent() {
  const { t } = useLanguage();
  const { isAdmin, profile, session, user } = useAuth();
  const [recent, setRecent] = useState<RecentReflection | null>(null);
  const name =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let mounted = true;

    fetch("/api/reflections", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const first = data.reflections?.[0];

        if (mounted && first) {
          setRecent({
            id: first.id,
            created_at: first.created_at ?? null,
            trigger: first.trigger ?? null,
            thought_pattern: first.thought_pattern ?? null,
            emotion: first.emotion ?? null,
          });
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [session?.access_token]);

  return (
    <>
      <PageHeader compact eyebrow={t.nav.workspace} title={t.app.title}>
        {t.app.subtitle}
      </PageHeader>

      <p className="-mt-3 mb-5 text-sm font-medium text-[var(--brand-teal-deep)]">
        {t.app.welcome}, {name}
      </p>

      <StatusCard tone="neutral">{t.app.privacy}</StatusCard>

      {isAdmin && (
        <Card
          variant="elevated"
          className="mt-5 border-[rgba(31,155,143,0.18)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.68))] hover:translate-y-0"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SectionLabel>{t.admin.title}</SectionLabel>
              <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {t.app.adminToolsTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.app.adminToolsBody}
              </p>
            </div>
            <LinkButton href="/admin" size="sm">
              {t.app.openAdmin}
            </LinkButton>
          </div>
        </Card>
      )}

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
          {recent ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {recent.emotion || formatDate(recent.created_at)}
              </p>
              {recent.trigger && (
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.app.recentTrigger}: {recent.trigger}
                </p>
              )}
              {recent.thought_pattern && (
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.app.recentPattern}: {recent.thought_pattern}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.app.noRecent}
            </p>
          )}
          <LinkButton
            href="/dashboard/history"
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            {t.common.viewHistory}
          </LinkButton>
        </Card>
        <Card className="hover:translate-y-0">
          <SectionLabel>{t.summary.title}</SectionLabel>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            {t.app.summaryTeaser}
          </p>
          <LinkButton
            href="/dashboard/summary"
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            {t.common.viewPatterns}
          </LinkButton>
        </Card>
      </div>

      <p className="mt-6 text-sm text-[var(--foreground-subtle)]">
        {user?.email || profile?.email}
      </p>
    </>
  );
}

