"use client";

import { Pause, Play, RotateCcw, Sparkles, Waves } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  IconFrame,
  LinkButton,
  PageActions,
  PageHeader,
  PrimaryButton,
} from "../../components/ui";
import { useLanguage } from "../../components/language-provider";
import { trackEvent } from "../../lib/analytics";

const cycle = [
  { key: "breatheIn", durationMs: 4000, scale: 1.22 },
  { key: "hold", durationMs: 2000, scale: 1.22 },
  { key: "breatheOut", durationMs: 6000, scale: 0.84 },
] as const;

const calmActionKey = "innerleaf:calm-actions-count";

type PhaseKey = (typeof cycle)[number]["key"];

function phaseFromElapsed(elapsedMs: number): (typeof cycle)[number] {
  const cycleLength = cycle.reduce((sum, item) => sum + item.durationMs, 0);
  const position = elapsedMs % cycleLength;
  let cursor = 0;

  for (const phase of cycle) {
    cursor += phase.durationMs;
    if (position < cursor) {
      return phase;
    }
  }

  return cycle[0];
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function incrementCalmActions() {
  try {
    const current = Number(window.localStorage.getItem(calmActionKey) ?? "0");
    window.localStorage.setItem(calmActionKey, String(current + 1));
  } catch {
    // Local progress is optional and should never affect the breathing flow.
  }
}

function BreathingCircle({
  active,
  elapsedMs,
  phase,
  phaseLabel,
}: {
  active: boolean;
  elapsedMs: number;
  phase: ReturnType<typeof phaseFromElapsed>;
  phaseLabel: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const scale = prefersReducedMotion ? 1 : active ? phase.scale : 1;

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[290px] items-center justify-center sm:max-w-[340px]">
      <div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(31,155,143,0.16),transparent_68%)]"
        aria-hidden="true"
      />
      <motion.div
        aria-hidden="true"
        className="absolute h-[72%] w-[72%] rounded-full border border-[rgba(31,155,143,0.2)] bg-[linear-gradient(145deg,rgba(231,244,239,0.95),rgba(255,248,226,0.56))] shadow-[0_34px_90px_rgba(17,111,104,0.16)]"
        animate={{ scale }}
        transition={{
          duration: prefersReducedMotion ? 0 : phase.durationMs / 1000,
          ease: "easeInOut",
        }}
      />
      <motion.div
        key={`${phase.key}-${Math.floor(elapsedMs / 1000)}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 flex h-[54%] w-[54%] flex-col items-center justify-center rounded-full border border-[rgba(255,255,255,0.75)] bg-[rgba(255,254,248,0.78)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.86),var(--shadow-soft)] backdrop-blur-sm"
      >
        <Waves
          aria-hidden="true"
          size={22}
          strokeWidth={1.7}
          className="mb-2 text-[var(--brand-teal-deep)]"
        />
        <p
          aria-live="polite"
          className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          {phaseLabel}
        </p>
      </motion.div>
    </div>
  );
}

export default function CalmPage() {
  const { language, t } = useLanguage();
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const phase = useMemo(() => phaseFromElapsed(elapsedMs), [elapsedMs]);
  const progress = Math.max(0, Math.min(100, ((duration - remaining) / duration) * 100));
  const phaseLabel = t.calm[phase.key as PhaseKey];

  useEffect(() => {
    trackEvent("calm_page_viewed", {
      locale: language,
      duration,
    });
  }, [duration, language]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const startedAt = Date.now();
    const startRemaining = remaining;
    const startElapsedMs = elapsedMs;
    let hasCompleted = false;

    const intervalId = window.setInterval(() => {
      const passedMs = Date.now() - startedAt;
      const nextRemaining = Math.max(
        0,
        startRemaining - Math.floor(passedMs / 1000)
      );

      setRemaining(nextRemaining);
      setElapsedMs(startElapsedMs + passedMs);

      if (nextRemaining <= 0 && !hasCompleted) {
        hasCompleted = true;
        window.clearInterval(intervalId);
        setActive(false);
        setCompleted(true);
        incrementCalmActions();
        trackEvent("breathing_completed", {
          locale: language,
          duration,
          completed: true,
        });
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [active, duration, elapsedMs, language, remaining]);

  function chooseDuration(nextDuration: number) {
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setElapsedMs(0);
    setCompleted(false);
    setActive(false);
  }

  function startBreathing() {
    if (remaining <= 0) {
      setRemaining(duration);
      setElapsedMs(0);
      setCompleted(false);
    }

    setActive(true);
    trackEvent("breathing_started", {
      locale: language,
      duration,
    });
  }

  function resetBreathing() {
    setActive(false);
    setCompleted(false);
    setRemaining(duration);
    setElapsedMs(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="mx-auto max-w-4xl"
    >
      <PageHeader compact eyebrow={t.calm.eyebrow} title={t.calm.title}>
        {t.calm.purpose}
      </PageHeader>

      <Card
        variant="elevated"
        className="relative overflow-hidden border-[rgba(31,155,143,0.15)] bg-[linear-gradient(145deg,rgba(255,254,248,0.97),rgba(232,246,241,0.72),rgba(255,248,226,0.42))] p-5 shadow-[0_28px_90px_rgba(20,35,28,0.08)] hover:translate-y-0 sm:p-7"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(217,179,74,0.18),transparent_68%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(31,155,143,0.13),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <BreathingCircle
              active={active}
              elapsedMs={elapsedMs}
              phase={phase}
              phaseLabel={phaseLabel}
            />
          </div>

          <div className="order-1 space-y-5 lg:order-2">
            <div className="flex items-center gap-3">
              <IconFrame icon={Sparkles} tone="gold" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  {t.calm.duration}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  {t.calm.supportiveNote}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-[1.15rem] border border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.62)] p-1.5">
              {[
                [60, t.calm.oneMinute],
                [180, t.calm.threeMinutes],
              ].map(([value, label]) => {
                const selected = duration === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => chooseDuration(Number(value))}
                    className={[
                      "rounded-[0.95rem] px-3 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                      selected
                        ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--foreground-muted)] hover:bg-[rgba(255,254,248,0.72)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.2rem] border border-[rgba(31,155,143,0.12)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tabular-nums text-[var(--foreground)]">
                    {formatRemaining(remaining)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--foreground-subtle)]">
                    {remaining} {t.calm.secondsLeft}
                  </p>
                </div>
                {completed && (
                  <p className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
                    {t.calm.complete}
                  </p>
                )}
              </div>
              <span className="mt-4 block h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),rgba(217,179,74,0.72))] transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {active ? (
                <PrimaryButton
                  type="button"
                  onClick={() => setActive(false)}
                  className="w-full gap-2 sm:w-auto"
                >
                  <Pause aria-hidden="true" size={16} strokeWidth={1.8} />
                  {t.calm.pause}
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  type="button"
                  onClick={startBreathing}
                  className="w-full gap-2 sm:w-auto"
                >
                  <Play aria-hidden="true" size={16} strokeWidth={1.8} />
                  {remaining === duration ? t.calm.start : t.calm.resume}
                </PrimaryButton>
              )}
              <button
                type="button"
                onClick={resetBreathing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(40,80,60,0.12)] bg-[rgba(255,254,248,0.78)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)] sm:w-auto"
              >
                <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
                {t.calm.reset}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="muted" className="mt-4 hover:translate-y-0">
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">
          {t.calm.safetyNote}
        </p>
      </Card>

      <PageActions className="mt-5">
        <LinkButton href="/dashboard/quick">{t.calm.reflectAfter}</LinkButton>
        <LinkButton href="/dashboard" variant="secondary">
          {t.calm.backDashboard}
        </LinkButton>
      </PageActions>
    </motion.div>
  );
}
