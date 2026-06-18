"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Card,
  SectionLabel,
  StatusCard,
} from "../../components/ui";

type FeedbackItem = {
  id: string | number;
  created_at: string | null;
  email: string | null;
  mode_tried: string | null;
  ease_of_start: string | null;
  reflection_length: string | null;
  clarity_help: string | null;
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
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [error, setError] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [useAgainFilter, setUseAgainFilter] = useState("all");
  const [search, setSearch] = useState("");

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

  const modes = Array.from(new Set(feedback.map((item) => item.mode_tried).filter(Boolean)));
  const useAgainValues = Array.from(
    new Set(feedback.map((item) => item.would_use_again).filter(Boolean))
  );
  const filteredFeedback = feedback.filter((item) => {
    const query = search.toLowerCase().trim();
    const values = [
      item.email,
      item.mode_tried,
      item.ease_of_start,
      item.reflection_length,
      item.clarity_help,
      item.would_use_again,
      item.alternative_tool,
      item.saving_blocker,
      item.comparison_feedback,
      item.blocker,
      item.other_thoughts,
    ].filter(Boolean);

    return (
      (modeFilter === "all" || item.mode_tried === modeFilter) &&
      (useAgainFilter === "all" || item.would_use_again === useAgainFilter) &&
      (!query || values.some((value) => value?.toLowerCase().includes(query)))
    );
  });

  return (
    <AdminShell title={t.admin.feedbackTitle} purpose={t.admin.feedbackPurpose}>
      {error && <StatusCard tone="error">{error}</StatusCard>}

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.admin.search}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        />
        <select
          value={modeFilter}
          onChange={(event) => setModeFilter(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        >
          <option value="all">{t.admin.filterAll}</option>
          {modes.map((mode) => (
            <option key={mode} value={mode || ""}>
              {mode}
            </option>
          ))}
        </select>
        <select
          value={useAgainFilter}
          onChange={(event) => setUseAgainFilter(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        >
          <option value="all">{t.admin.filterAll}</option>
          {useAgainValues.map((value) => (
            <option key={value} value={value || ""}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {!error && filteredFeedback.length === 0 ? (
        <StatusCard tone="neutral">{t.admin.noFeedback}</StatusCard>
      ) : (
        <div className="grid gap-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id} className="hover:translate-y-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SectionLabel>{t.admin.saved}</SectionLabel>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {formatDate(item.created_at)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
                    {item.email || t.admin.anonymous}
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:min-w-[360px] sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.modeTried}
                    </p>
                    <p className="mt-1 font-medium text-[var(--foreground)]">
                      {item.mode_tried || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.wouldUse}
                    </p>
                    <p className="mt-1 font-medium text-[var(--foreground)]">
                      {item.would_use_again || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.blocker}
                    </p>
                    <p className="mt-1 truncate font-medium text-[var(--foreground)]">
                      {item.saving_blocker || "-"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(item)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--brand-teal-deep)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                >
                  {t.admin.viewFeedback}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-[rgba(20,35,28,0.16)] px-4 py-4 backdrop-blur-[2px] sm:items-center">
          <button
            type="button"
            aria-label={t.admin.cancel}
            className="absolute inset-0"
            onClick={() => setSelectedFeedback(null)}
          />
          <div className="relative max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[rgba(40,80,60,0.14)] bg-[rgb(255,255,248)] p-5 shadow-[0_32px_110px_rgba(20,35,28,0.24)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <SectionLabel>{t.admin.feedbackDetail}</SectionLabel>
                <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {formatDate(selectedFeedback.created_at)}
                </h2>
                <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
                  {selectedFeedback.email || t.admin.anonymous}
                </p>
              </div>
              <button
                type="button"
                aria-label={t.admin.cancel}
                onClick={() => setSelectedFeedback(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                <X aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.admin.modeTried} value={selectedFeedback.mode_tried} />
              <Field label={t.admin.ease} value={selectedFeedback.ease_of_start} />
              <Field label={t.admin.reflectionLength} value={selectedFeedback.reflection_length} />
              <Field label={t.admin.clarityHelp} value={selectedFeedback.clarity_help} />
              <Field label={t.admin.wouldUse} value={selectedFeedback.would_use_again} />
              <Field label={t.admin.alternative} value={selectedFeedback.alternative_tool} />
              <Field label={t.admin.blocker} value={selectedFeedback.saving_blocker} />
            </div>

            {(selectedFeedback.comparison_feedback ||
              selectedFeedback.blocker ||
              selectedFeedback.other_thoughts) && (
              <div className="mt-4 grid gap-3">
                <Field label={t.admin.comments} value={selectedFeedback.comparison_feedback} />
                <Field label={t.feedback.openQuestions.blocker} value={selectedFeedback.blocker} />
                <Field label={t.feedback.anythingElse} value={selectedFeedback.other_thoughts} />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminFeedbackPage() {
  return (
    <RequireAdmin>
      <AdminFeedbackContent />
    </RequireAdmin>
  );
}
