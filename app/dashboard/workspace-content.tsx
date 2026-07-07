"use client";

import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Heart,
  Footprints,
  PencilLine,
  ShieldCheck,
  TrendingUp,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  Card,
  IconFrame,
  LinkButton,
  PageHeader,
  SectionLabel,
} from "../components/ui";
import { trackEvent } from "../lib/analytics";

const icons = [PencilLine, Footprints, Archive, TrendingUp] as const;
const microActionIcons = [Wind, PencilLine, Heart, Footprints] as const;

type RecentReflection = {
  id: string;
  created_at: string | null;
  trigger: string | null;
  thought_pattern: string | null;
  emotion: string | null;
};

type WorkspaceStats = {
  savedCount: number;
  checkedInCount: number;
  latestSavedAt: string | null;
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

const moodStorageKey = "innerleaf:mood-checkin";

type MoodOption = readonly [string, string, string, string, string, string];

function MoodCheckInCard() {
  const { language, t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    try {
      return window.localStorage.getItem(moodStorageKey) ?? "";
    } catch {
      return "";
    }
  });
  const selectedOption = t.app.moodCheckIn.options.find(
    ([id]) => id === selectedMood
  );

  function chooseMood(option: MoodOption) {
    const [id] = option;
    setSelectedMood(id);

    try {
      window.localStorage.setItem(moodStorageKey, id);
    } catch {
      // Mood check-in is local-only and should never block the dashboard.
    }

    trackEvent("mood_checkin_selected", {
      mood: id,
      locale: language,
    });
  }

  return (
    <Card
      variant="support"
      className="overflow-hidden rounded-[1.25rem] border-[rgba(31,155,143,0.11)] bg-[linear-gradient(135deg,rgba(255,254,248,0.88),rgba(232,246,241,0.42),rgba(255,248,226,0.18))] p-3.5 shadow-[var(--shadow-sm)] hover:translate-y-0 sm:p-4"
    >
      <div className="grid gap-3 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {t.app.moodCheckIn.title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--foreground-subtle)]">
            {t.app.moodCheckIn.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {t.app.moodCheckIn.options.map((option) => {
            const [id, marker, label] = option;
            const active = selectedMood === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => chooseMood(option)}
                aria-pressed={active}
                className={[
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                  active
                    ? "border-[rgba(31,155,143,0.28)] bg-[linear-gradient(135deg,rgba(31,155,143,0.16),rgba(217,179,74,0.16))] text-[var(--brand-teal-deep)] shadow-[var(--shadow-soft)]"
                    : "border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.68)] text-[var(--foreground-muted)] hover:border-[rgba(31,155,143,0.2)] hover:bg-[rgba(255,254,248,0.86)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {marker}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption && (
        <motion.div
          key={selectedOption[0]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="mt-3 flex flex-col gap-3 rounded-[1rem] border border-[rgba(31,155,143,0.1)] bg-[rgba(255,254,248,0.58)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm leading-5 text-[var(--foreground-muted)]">
            {selectedOption[3]}
          </p>
          <LinkButton
            href={selectedOption[5]}
            variant="secondary"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
          >
            {selectedOption[4]}
          </LinkButton>
        </motion.div>
      )}
    </Card>
  );
}

function MicroActionRow() {
  const { language, t } = useLanguage();
  const [activeSupport, setActiveSupport] = useState<
    "encouragement" | "nextStep" | null
  >(null);
  const actions = [
    {
      id: "calm",
      label: t.app.microActions.actions.calm,
      href: "/dashboard/calm",
    },
    {
      id: "reflect",
      label: t.app.microActions.actions.reflect,
      href: "/dashboard/quick",
    },
    {
      id: "encouragement",
      label: t.app.microActions.actions.encouragement,
    },
    {
      id: "nextStep",
      label: t.app.microActions.actions.nextStep,
    },
  ] as const;
  const supportCopy =
    activeSupport === "encouragement"
      ? t.app.microActions.encouragement
      : activeSupport === "nextStep"
        ? t.app.microActions.nextStep
        : "";
  const supportCta =
    activeSupport === "encouragement"
      ? {
          href: "/dashboard/quick",
          label: t.app.microActions.encouragementCta,
        }
      : activeSupport === "nextStep"
        ? {
            href: "/dashboard/calm",
            label: t.app.microActions.nextStepCta,
          }
        : null;

  function trackMicroAction(action: string) {
    trackEvent("micro_action_clicked", {
      action,
      locale: language,
    });
  }

  return (
    <section className="rounded-[1.15rem] border border-[rgba(40,80,60,0.075)] bg-[rgba(255,254,248,0.62)] p-3 shadow-[var(--shadow-sm)] sm:p-3.5">
      <div className="mb-2.5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {t.app.microActions.title}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--foreground-subtle)]">
            {t.app.microActions.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = microActionIcons[index];
          const isActive = activeSupport === action.id;
          const className = [
            "group inline-flex min-h-11 items-center gap-2 rounded-[0.95rem] border px-3 py-2 text-left text-xs font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
            isActive
              ? "border-[rgba(31,155,143,0.24)] bg-[rgba(230,245,239,0.76)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-soft)]"
              : "border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.74)] text-[var(--foreground-muted)] hover:border-[rgba(31,155,143,0.18)] hover:bg-[rgba(255,254,248,0.92)] hover:text-[var(--foreground)]",
          ].join(" ");

          if ("href" in action) {
            return (
              <LinkButton
                key={action.id}
                href={action.href}
                variant="ghost"
                size="sm"
                className={className}
                onClick={() => trackMicroAction(action.id)}
              >
                <Icon
                  aria-hidden="true"
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-[var(--brand-teal-deep)]"
                />
                {action.label}
              </LinkButton>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                const next =
                  activeSupport === action.id
                    ? null
                    : (action.id as "encouragement" | "nextStep");
                setActiveSupport(next);
                trackMicroAction(action.id);
              }}
              aria-pressed={isActive}
              className={className}
            >
              <Icon
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="shrink-0 text-[var(--brand-teal-deep)]"
              />
              {action.label}
            </button>
          );
        })}
      </div>

      {activeSupport && supportCta && (
        <motion.div
          key={activeSupport}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-2.5 flex flex-col gap-2 rounded-[1rem] border border-[rgba(31,155,143,0.11)] bg-[linear-gradient(135deg,rgba(255,254,248,0.78),rgba(232,246,241,0.48))] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm leading-5 text-[var(--foreground-muted)]">
            {supportCopy}
          </p>
          <LinkButton
            href={supportCta.href}
            variant="ghost"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
          >
            {supportCta.label}
          </LinkButton>
        </motion.div>
      )}
    </section>
  );
}

export function WorkspaceContent() {
  const { t } = useLanguage();
  const { isAdmin, profile, session, user } = useAuth();
  const [recent, setRecent] = useState<RecentReflection | null>(null);
  const [stats, setStats] = useState<WorkspaceStats>({
    savedCount: 0,
    checkedInCount: 0,
    latestSavedAt: null,
  });
  const name =
    profile?.display_name || user?.email?.split("@")[0] || t.app.fallbackName;
  const hubStats = [
    { icon: Archive, label: t.app.savedCards, value: String(stats.savedCount) },
    {
      icon: CheckCircle2,
      label: t.app.checkedInCards,
      value: String(stats.checkedInCount),
    },
    {
      icon: CalendarClock,
      label: t.app.latestSaved,
      value: stats.latestSavedAt ? formatDate(stats.latestSavedAt) : t.app.noSavedYet,
    },
  ] as const;

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
        const reflections = Array.isArray(data.reflections)
          ? data.reflections
          : [];
        const first = reflections[0];

        if (mounted) {
          setStats({
            savedCount: reflections.length,
            checkedInCount: reflections.filter(
              (item: { follow_up_result?: string | null }) =>
                Boolean(item.follow_up_result)
            ).length,
            latestSavedAt: first?.created_at ?? null,
          });
        }

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
      <Card variant="hero" className="p-4 hover:translate-y-0 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,0.72fr)] lg:items-end">
          <div>
            <PageHeader compact eyebrow={t.nav.workspace} title={t.app.title}>
              {t.app.subtitle}
            </PageHeader>
            <p className="-mt-2 text-sm font-semibold text-[var(--brand-teal-deep)]">
              {t.app.welcome}, {name}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.76)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)]">
              <ShieldCheck
                aria-hidden="true"
                size={14}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              {t.app.privacy}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[1.25rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.58)] p-2 shadow-[var(--shadow-sm)]">
            {hubStats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="min-w-0 rounded-[1rem] bg-[rgba(255,254,248,0.72)] px-2.5 py-2"
              >
                <Icon
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.8}
                  className="mb-1 text-[var(--brand-teal-deep)]"
                />
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card
          variant="support"
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

      <section className="mt-4 sm:mt-5">
        <SectionLabel>{t.app.primaryActions}</SectionLabel>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {t.app.cards.slice(0, 2).map(([title, description, cta, href], index) => {
            const Icon = icons[index];

            return (
              <Card
                key={href}
                variant="action"
                className={[
                  "group h-full overflow-hidden p-4 sm:p-5",
                  index === 0
                    ? "border-[rgba(31,155,143,0.2)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(231,244,239,0.78))] shadow-[var(--shadow-lg)]"
                    : "border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.92)]",
                ].join(" ")}
              >
                <div className="flex min-h-[142px] flex-col sm:min-h-[156px]">
                  <IconFrame icon={Icon} tone={index === 0 ? "sage" : "gold"} />
                  <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                    {title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)] line-clamp-2">
                    {description}
                  </p>
                  <div className="mt-auto pt-4">
                    <LinkButton href={href} size="md">
                      {cta}
                    </LinkButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-4 sm:mt-5">
        <SectionLabel>{t.app.reviewSpaces}</SectionLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {t.app.cards.slice(2).map(([title, description, cta, href], index) => {
            const originalIndex = index + 2;
            const Icon = icons[originalIndex];

            return (
              <Card
                key={href}
                variant="support"
                className="h-full hover:translate-y-0"
              >
                <div className="flex items-start gap-4">
                  <IconFrame icon={Icon} size="sm" />
                  <div>
                    <h2 className="text-base font-semibold text-[var(--foreground)]">
                      {title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {description}
                    </p>
                    <LinkButton
                      href={href}
                      variant={originalIndex === 2 ? "secondary" : "ghost"}
                      size="sm"
                      className="mt-4"
                    >
                      {cta}
                    </LinkButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card variant="utility" className="hover:translate-y-0">
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
        <Card variant="utility" className="hover:translate-y-0">
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

      <section className="mt-4">
        <SectionLabel>{t.app.supportTools}</SectionLabel>
        <div className="mt-3 grid gap-3">
          <MoodCheckInCard />
          <MicroActionRow />
        </div>
      </section>
    </>
  );
}
