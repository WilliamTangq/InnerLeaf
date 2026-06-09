"use client";

import {
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { ReflectionCards } from "./reflection-cards";
import type { Reflection } from "./page";

export function HistoryContent({
  reflections,
  hasError,
}: {
  reflections: Reflection[];
  hasError: boolean;
}) {
  const { t } = useLanguage();
  const latest = reflections[0];

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader compact eyebrow={t.common.revisit} title={t.history.title}>
        {t.history.purpose}
      </PageHeader>

      <PageActions className="mb-6">
        <LinkButton href="/quick">{t.common.startQuick}</LinkButton>
        <LinkButton href="/summary" variant="secondary">
          {t.common.viewPatterns}
        </LinkButton>
      </PageActions>

      {!hasError && reflections.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm text-[var(--foreground-muted)]">
          <span>
            <span className="font-medium text-[var(--foreground)]">
              {reflections.length}
            </span>{" "}
            {t.history.saved}
          </span>
          {latest && (
            <>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                ·
              </span>
              <span>
                {t.history.latest}{" "}
                <time dateTime={latest.created_at}>
                  {new Date(latest.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
            </>
          )}
        </div>
      )}

      {hasError && <StatusCard tone="error">{t.history.unavailable}</StatusCard>}

      {!hasError && reflections.length === 0 && (
        <EmptyState
          title={t.history.emptyTitle}
          description={t.history.emptyDescription}
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/quick">{t.common.startQuick}</LinkButton>
              <LinkButton href="/guided" variant="secondary">
                {t.common.tryGuided}
              </LinkButton>
            </div>
          }
        />
      )}

      {!hasError && reflections.length > 0 && (
        <ReflectionCards reflections={reflections} />
      )}
    </PageShell>
  );
}
