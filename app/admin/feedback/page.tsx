"use client";

import { useEffect, useState } from "react";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  SectionLabel,
  StatusCard,
} from "../../components/ui";

type FeedbackItem = {
  id: string | number;
  created_at: string | null;
  email: string | null;
  mode_tried: string | null;
  ease_of_start: string | null;
  would_use_again: string | null;
  alternative_tool: string | null;
  saving_blocker: string | null;
  comparison_feedback: string | null;
  blocker: string | null;
  other_thoughts: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
        {value}
      </p>
    </div>
  );
}

function AdminFeedbackContent() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeedback() {
      if (!session?.access_token) {
        return;
      }

      try {
        const response = await fetch("/api/admin/feedback", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Feedback unavailable");
        }

        setFeedback(data.feedback || []);
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadFeedback();
  }, [session?.access_token, t.admin.unavailable]);

  return (
    <PageShell maxWidth="max-w-5xl">
      <PageHeader compact eyebrow={t.admin.title} title={t.admin.feedbackTitle}>
        {t.admin.feedbackPurpose}
      </PageHeader>

      <PageActions>
        <LinkButton href="/admin">{t.admin.overview}</LinkButton>
        <LinkButton href="/admin/users" variant="secondary">
          {t.admin.users}
        </LinkButton>
      </PageActions>

      {error && <StatusCard tone="error">{error}</StatusCard>}

      {!error && feedback.length === 0 ? (
        <StatusCard tone="neutral">{t.admin.noFeedback}</StatusCard>
      ) : (
        <div className="grid gap-4">
          {feedback.map((item) => (
            <Card key={item.id} className="hover:translate-y-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <SectionLabel>{t.admin.saved}</SectionLabel>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <p className="text-sm text-[var(--foreground-subtle)]">
                  {item.email || "Anonymous"}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label={t.admin.modeTried} value={item.mode_tried} />
                <Field label={t.admin.ease} value={item.ease_of_start} />
                <Field label={t.admin.wouldUse} value={item.would_use_again} />
                <Field label={t.admin.alternative} value={item.alternative_tool} />
                <Field label={t.admin.blocker} value={item.saving_blocker} />
              </div>

              {(item.comparison_feedback || item.blocker || item.other_thoughts) && (
                <div className="mt-4 grid gap-3">
                  <Field label={t.admin.comments} value={item.comparison_feedback} />
                  <Field label={t.feedback.openQuestions.blocker} value={item.blocker} />
                  <Field label={t.feedback.anythingElse} value={item.other_thoughts} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function AdminFeedbackPage() {
  return (
    <RequireAdmin>
      <AdminFeedbackContent />
    </RequireAdmin>
  );
}
