"use client";

import { useEffect, useState } from "react";
import {
  EmptyState,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { ReflectionCards } from "./reflection-cards";
import type { Reflection } from "./page";

export function HistoryContent() {
  const { t } = useLanguage();
  const { session, user, loading: authLoading } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const latest = reflections[0];

  useEffect(() => {
    async function loadReflections() {
      if (authLoading) {
        return;
      }

      if (!session?.access_token) {
        setReflections([]);
        setLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/reflections", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "History unavailable");
        }

        setReflections(data.reflections || []);
      } catch {
        setHasError(true);
      } finally {
        setLoaded(true);
      }
    }

    loadReflections();
  }, [authLoading, session?.access_token]);

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

      {!hasError && loaded && !user && (
        <EmptyState
          title={t.history.authTitle}
          description={t.history.authBody}
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/login?next=/history">
                {t.auth.loginRequired}
              </LinkButton>
              <LinkButton href="/register?next=/history" variant="secondary">
                {t.auth.createAccount}
              </LinkButton>
            </div>
          }
        />
      )}

      {!hasError && loaded && user && reflections.length === 0 && (
        <div className="space-y-4">
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
          <p className="mx-auto max-w-xl text-center text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.history.emptyNote}
          </p>
        </div>
      )}

      {!hasError && loaded && user && reflections.length > 0 && (
        <ReflectionCards reflections={reflections} />
      )}
    </PageShell>
  );
}
