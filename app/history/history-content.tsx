"use client";

import { useEffect, useState } from "react";
import { Archive, CheckCircle2, Clock3 } from "lucide-react";
import {
  Card,
  EmptyState,
  IconFrame,
  LinkButton,
  PageActions,
  PageHeader,
  StatusCard,
} from "../components/ui";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  isVisibleHistoryReflection,
  ReflectionCards,
} from "./reflection-cards";
import type { Reflection } from "./page";
import { trackEvent } from "../lib/analytics";

export function HistoryContent() {
  const { language, t } = useLanguage();
  const { role, session, user, loading: authLoading } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const visibleReflections = reflections.filter(isVisibleHistoryReflection);
  const latest = visibleReflections[0];
  const checkedInCount = visibleReflections.filter(
    (item) => item.follow_up_result
  ).length;

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

  useEffect(() => {
    if (!authLoading) {
      trackEvent("history_viewed", {
        locale: language,
        authenticated_state: Boolean(user),
        role_bucket: role ?? (user ? "user" : "logged_out"),
      });
    }
  }, [authLoading, language, role, user]);

  return (
    <div className="max-w-4xl">
      <PageHeader compact eyebrow={t.common.revisit} title={t.history.title}>
        {t.history.purpose}
      </PageHeader>

      <PageActions className="mb-5">
        <LinkButton href="/dashboard/quick">{t.common.startQuick}</LinkButton>
        <LinkButton href="/dashboard/summary" variant="secondary">
          {t.common.viewPatterns}
        </LinkButton>
      </PageActions>

      {!hasError && visibleReflections.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="py-3.5 hover:translate-y-0">
            <div className="flex items-center gap-3">
              <IconFrame icon={Archive} size="sm" />
              <div>
                <p className="text-xl font-semibold text-[var(--foreground)]">
                  {visibleReflections.length}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  {t.history.saved}
                </p>
              </div>
            </div>
          </Card>
          <Card className="py-3.5 hover:translate-y-0">
            <div className="flex items-center gap-3">
              <IconFrame icon={CheckCircle2} size="sm" />
              <div>
                <p className="text-xl font-semibold text-[var(--foreground)]">
                  {checkedInCount}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  {t.history.checkedIn}
                </p>
              </div>
            </div>
          </Card>
          <Card className="py-3.5 hover:translate-y-0">
            <div className="flex items-center gap-3">
              <IconFrame icon={Clock3} size="sm" tone="gold" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {latest ? (
                    <time dateTime={latest.created_at}>
                      {new Date(latest.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  ) : (
                    "-"
                  )}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  {t.history.latest}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {hasError && <StatusCard tone="error">{t.history.unavailable}</StatusCard>}

      {!hasError && loaded && !user && (
        <EmptyState
          icon={Archive}
          title={t.history.authTitle}
          description={t.history.authBody}
          action={
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <LinkButton href="/login?next=/dashboard/history">
                {t.auth.loginRequired}
              </LinkButton>
              <LinkButton href="/register?next=/dashboard/history" variant="secondary">
                {t.auth.createAccount}
              </LinkButton>
            </div>
          }
        />
      )}

      {!hasError && loaded && user && visibleReflections.length === 0 && (
        <div className="space-y-4">
          <EmptyState
            icon={Archive}
            title={t.history.emptyTitle}
            description={t.history.emptyDescription}
            action={
              <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                <LinkButton href="/dashboard/quick">{t.common.startQuick}</LinkButton>
                <LinkButton href="/dashboard/guided" variant="secondary">
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

      {!hasError && loaded && user && visibleReflections.length > 0 && (
        <ReflectionCards reflections={visibleReflections} />
      )}
    </div>
  );
}
