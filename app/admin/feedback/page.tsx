"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Inbox,
  MessageSquareText,
  Search,
  X,
} from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Badge,
  Card,
  IconFrame,
  MiniBar,
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

const reviewedStorageKey = "innerleaf_admin_reviewed_feedback";

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

function FeedbackStatusBadge({
  reviewed,
  labels,
}: {
  reviewed: boolean;
  labels: { reviewed: string; unreviewed: string };
}) {
  return reviewed ? (
    <Badge variant="outline">{labels.reviewed}</Badge>
  ) : (
    <span className="inline-flex items-center rounded-full border border-[rgba(177,154,70,0.28)] bg-[rgba(217,194,92,0.16)] px-2.5 py-1 text-xs font-semibold text-[rgb(113,91,28)]">
      {labels.unreviewed}
    </span>
  );
}

function AdminFeedbackContent() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }

    try {
      const stored = window.localStorage.getItem(reviewedStorageKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const [error, setError] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [useAgainFilter, setUseAgainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const modes = useMemo(
    () => Array.from(new Set(feedback.map((item) => item.mode_tried).filter(Boolean))),
    [feedback]
  );
  const useAgainValues = useMemo(
    () =>
      Array.from(
        new Set(feedback.map((item) => item.would_use_again).filter(Boolean))
      ),
    [feedback]
  );
  const reviewedCount = feedback.filter((item) =>
    reviewedIds.has(String(item.id))
  ).length;
  const unreviewedCount = feedback.length - reviewedCount;
  const wouldUseCount = feedback.filter((item) =>
    item.would_use_again?.toLowerCase().includes("yes") ||
    item.would_use_again?.includes("有")
  ).length;

  const filteredFeedback = useMemo(
    () =>
      feedback.filter((item) => {
        const query = search.toLowerCase().trim();
        const reviewed = reviewedIds.has(String(item.id));
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
          (useAgainFilter === "all" ||
            item.would_use_again === useAgainFilter) &&
          (statusFilter === "all" ||
            (statusFilter === "reviewed" && reviewed) ||
            (statusFilter === "unreviewed" && !reviewed)) &&
          (!query || values.some((value) => value?.toLowerCase().includes(query)))
        );
      }),
    [feedback, modeFilter, reviewedIds, search, statusFilter, useAgainFilter]
  );

  function setReviewed(id: string | number, reviewed: boolean) {
    setReviewedIds((current) => {
      const next = new Set(current);
      if (reviewed) {
        next.add(String(id));
      } else {
        next.delete(String(id));
      }
      window.localStorage.setItem(reviewedStorageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function openDetail(item: FeedbackItem) {
    setSelectedFeedback(item);
  }

  function RowSummary({ item }: { item: FeedbackItem }) {
    const reviewed = reviewedIds.has(String(item.id));

    return (
      <>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {formatDate(item.created_at)}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            {item.email || t.admin.anonymous}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
            {t.admin.modeTried}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {item.mode_tried || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
            {t.admin.wouldUse}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {item.would_use_again || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
            {t.admin.blocker}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-[var(--foreground)]">
            {item.saving_blocker || "-"}
          </p>
        </div>
        <div>
          <FeedbackStatusBadge
            reviewed={reviewed}
            labels={{ reviewed: t.admin.reviewed, unreviewed: t.admin.unreviewed }}
          />
        </div>
      </>
    );
  }

  return (
    <AdminShell title={t.admin.feedbackTitle} purpose={t.admin.feedbackPurpose}>
      {error && <StatusCard tone="error">{error}</StatusCard>}

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Card className="hover:translate-y-0">
          <div className="flex items-center gap-3">
            <IconFrame icon={Inbox} size="sm" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                {t.admin.totalFeedback}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {feedback.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:translate-y-0">
          <div className="flex items-center gap-3">
            <IconFrame icon={MessageSquareText} size="sm" tone="gold" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                {t.admin.unreviewed}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {unreviewedCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:translate-y-0">
          <div className="flex items-center gap-3">
            <IconFrame icon={CheckCircle2} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                {t.admin.wouldUse}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {wouldUseCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {feedback.length > 0 && (
        <Card className="mb-5 hover:translate-y-0">
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniBar
              label={t.admin.reviewed}
              value={reviewedCount}
              max={feedback.length}
            />
            <MiniBar
              label={t.admin.unreviewed}
              value={unreviewedCount}
              max={feedback.length}
            />
            <MiniBar
              label={t.admin.wouldUse}
              value={wouldUseCount}
              max={feedback.length}
            />
          </div>
        </Card>
      )}

      <Card className="mb-5 hover:translate-y-0">
        <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_180px]">
          <label className="relative block">
            <span className="sr-only">{t.admin.searchFeedback}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]"
              size={18}
              strokeWidth={1.8}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.admin.searchFeedback}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
          </label>
          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
          >
            <option value="all">{t.admin.filterAllModes}</option>
            {modes.map((mode) => (
              <option key={mode} value={mode || ""}>
                {mode}
              </option>
            ))}
          </select>
          <select
            value={useAgainFilter}
            onChange={(event) => setUseAgainFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
          >
            <option value="all">{t.admin.filterUseAgain}</option>
            {useAgainValues.map((value) => (
              <option key={value} value={value || ""}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
          >
            <option value="all">{t.admin.filterAllStatus}</option>
            <option value="unreviewed">{t.admin.unreviewed}</option>
            <option value="reviewed">{t.admin.reviewed}</option>
          </select>
        </div>
      </Card>

      {!error && filteredFeedback.length === 0 ? (
        <Card className="hover:translate-y-0">
          <div className="mx-auto max-w-md py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(55,112,99,0.16)] bg-[rgba(84,164,148,0.12)] text-[var(--brand-teal-deep)]">
              <Inbox aria-hidden="true" size={22} strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
              {t.admin.noFeedbackTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.admin.noFeedbackBody}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] lg:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--surface-muted)]">
                <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  <th className="px-5 py-4">{t.admin.saved}</th>
                  <th className="px-5 py-4">{t.admin.modeTried}</th>
                  <th className="px-5 py-4">{t.admin.wouldUse}</th>
                  <th className="px-5 py-4">{t.admin.blocker}</th>
                  <th className="px-5 py-4">{t.admin.status}</th>
                  <th className="px-5 py-4 text-right">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredFeedback.map((item) => {
                  const reviewed = reviewedIds.has(String(item.id));

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[rgba(84,164,148,0.045)]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {formatDate(item.created_at)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
                          {item.email || t.admin.anonymous}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[var(--foreground)]">
                        {item.mode_tried || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[var(--foreground)]">
                        {item.would_use_again || "-"}
                      </td>
                      <td className="max-w-[280px] px-5 py-4 text-sm text-[var(--foreground-muted)]">
                        <span className="line-clamp-2">
                          {item.saving_blocker || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <FeedbackStatusBadge
                          reviewed={reviewed}
                          labels={{
                            reviewed: t.admin.reviewed,
                            unreviewed: t.admin.unreviewed,
                          }}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewed(item.id, !reviewed)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                          >
                            <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
                            {reviewed ? t.admin.markUnreviewed : t.admin.markReviewed}
                          </button>
                          <button
                            type="button"
                            onClick={() => openDetail(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--brand-teal-deep)] transition hover:bg-[var(--surface-muted)]"
                          >
                            <MessageSquareText aria-hidden="true" size={15} strokeWidth={1.8} />
                            {t.admin.viewFeedback}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filteredFeedback.map((item) => {
              const reviewed = reviewedIds.has(String(item.id));

              return (
                <Card key={item.id} className="hover:translate-y-0">
                  <div className="grid gap-3">
                    <RowSummary item={item} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewed(item.id, !reviewed)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                    >
                      <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
                      {reviewed ? t.admin.markUnreviewed : t.admin.markReviewed}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--brand-teal-deep)] transition hover:bg-[var(--surface-muted)]"
                    >
                      <MessageSquareText aria-hidden="true" size={15} strokeWidth={1.8} />
                      {t.admin.viewFeedback}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-[rgba(20,35,28,0.18)] px-4 py-4 backdrop-blur-[2px] sm:items-center">
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
                <div className="mt-3">
                  <FeedbackStatusBadge
                    reviewed={reviewedIds.has(String(selectedFeedback.id))}
                    labels={{
                      reviewed: t.admin.reviewed,
                      unreviewed: t.admin.unreviewed,
                    }}
                  />
                </div>
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

            <div className="mb-5">
              <button
                type="button"
                onClick={() =>
                  setReviewed(
                    selectedFeedback.id,
                    !reviewedIds.has(String(selectedFeedback.id))
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
                {reviewedIds.has(String(selectedFeedback.id))
                  ? t.admin.markUnreviewed
                  : t.admin.markReviewed}
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
