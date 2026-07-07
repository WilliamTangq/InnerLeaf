"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Feather,
  FileText,
  Leaf,
  MessageCircle,
  PencilLine,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "./components/brand-logo";
import { useAuth } from "./components/auth-provider";
import { Badge, LinkButton, MiniBar, PageShell, SectionLabel } from "./components/ui";
import { useLanguage } from "./components/language-provider";
import { trackEvent } from "./lib/analytics";
import { getDefaultRouteForRole } from "./lib/routes";

const howIcons = [PencilLine, Sparkles, FileText] as const;
const pathIcons = [PencilLine, Route, Sparkles, CheckCircle2, FileText, Brain] as const;
const comparisonIcons = [Feather, MessageCircle, Brain, Clock3, ShieldCheck] as const;
const patternIcons = [FileText, MessageCircle, Brain] as const;
const trustIcons = [ShieldCheck, FileText, Leaf] as const;
const transformationIcons = [PencilLine, Sparkles, Clock3] as const;

function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[2.2rem] border border-[rgba(35,70,55,0.085)] bg-[rgba(255,254,248,0.80)] shadow-[var(--shadow-lg)] backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function TransformationMockup() {
  const { language, t } = useLanguage();
  const prompt2Copy =
    language === "zh"
      ? {
          source: "情绪来源",
          demon: "情绪名字",
          facts: "事实",
          imagination: "想象",
          need: "未满足的需要",
          sourceValue: "等待回复时，不确定感变强。",
          demonValue: "读心式担心",
          factsValue: "对方比预期更晚回复。",
          imaginationValue: "这可能说明我不被在意。",
          needValue: "更清楚的回应和安全感。",
          unit: "示例信号",
        }
      : {
          source: "Emotional Source",
          demon: "Name the Demon",
          facts: "Facts",
          imagination: "Imagination",
          need: "Unmet Need",
          sourceValue: "Uncertainty grew while waiting for a reply.",
          demonValue: "Mind-reading worry",
          factsValue: "The message was answered later than expected.",
          imaginationValue: "This may mean I am being ignored.",
          needValue: "A clearer response and emotional steadiness.",
          unit: "example signal",
        };
  const cardRows = [
    [prompt2Copy.source, prompt2Copy.sourceValue],
    [prompt2Copy.demon, prompt2Copy.demonValue],
    [prompt2Copy.facts, prompt2Copy.factsValue],
    [prompt2Copy.imagination, prompt2Copy.imaginationValue],
    [prompt2Copy.need, prompt2Copy.needValue],
  ] as const;

  return (
    <div className="relative lg:pl-3 xl:pl-6">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_80%_10%,rgba(217,179,74,0.18),transparent_33%),radial-gradient(circle_at_10%_82%,rgba(31,155,143,0.16),transparent_44%)] blur-3xl"
      />
      <Surface className="relative overflow-hidden rounded-[2.45rem] p-3.5 shadow-[0_26px_90px_rgba(38,56,48,0.14)] sm:p-4 lg:p-5">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(31,155,143,0.24),transparent)]" />
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(217,179,74,0.78)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(31,155,143,0.42)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(35,70,55,0.16)]" />
          </div>
          <span className="rounded-full border border-[rgba(35,70,55,0.08)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            {t.common.exampleReflection}
          </span>
        </div>

        <div className="rounded-[2rem] border border-[rgba(35,70,55,0.085)] bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(247,244,236,0.56))] p-3.5 shadow-[var(--shadow-soft)] sm:p-4">
          <div className="rounded-[1.45rem] border border-[rgba(35,70,55,0.075)] bg-[rgba(255,254,248,0.86)] p-4 shadow-[0_14px_38px_rgba(38,56,48,0.08)]">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              <MessageCircle aria-hidden="true" size={14} strokeWidth={1.8} />
              {t.home.transformationMessy}
            </div>
            <p className="mt-3 text-base font-medium leading-7 tracking-tight text-[var(--foreground)] sm:text-lg">
              “{t.home.heroMessy}”
            </p>
          </div>

          <div className="relative my-3 flex justify-center text-[var(--brand-teal-deep)]">
            <div
              aria-hidden="true"
              className="absolute top-1/2 h-px w-36 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(31,155,143,0.28),transparent)]"
            />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(31,155,143,0.18)] bg-[rgba(230,245,239,0.92)] shadow-[0_10px_28px_rgba(31,155,143,0.12)]">
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_18px_48px_rgba(38,56,48,0.10)] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  {t.home.previewTitle}
                </p>
                <p className="mt-1 max-w-sm text-base font-semibold leading-6 text-[var(--foreground)]">
                  {t.home.doesTitle}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                <Clock3 aria-hidden="true" size={13} strokeWidth={1.8} />
                ~3 min
              </span>
            </div>

            <div className="mb-3 rounded-[1.2rem] border border-[rgba(31,155,143,0.14)] bg-[rgba(230,245,239,0.46)] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                {t.reflectionCard.emotionalValidation}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.home.previewValidation}
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {cardRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.05rem] border border-[rgba(35,70,55,0.07)] bg-[rgba(246,242,233,0.48)] p-3 shadow-[var(--shadow-sm)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    {label}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[1.3rem] border border-[rgba(31,155,143,0.20)] bg-[linear-gradient(135deg,rgba(230,245,239,0.94),rgba(255,248,226,0.62))] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
                {t.reflectionCard.nextStep}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.home.previewStep}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-[var(--foreground-subtle)]">
          <FileText aria-hidden="true" size={14} strokeWidth={1.8} />
          <p>
            {t.home.heroStructured}
          </p>
        </div>
      </Surface>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.25rem] sm:leading-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ProductTransformation() {
  const { language, t } = useLanguage();
  const prompt2Copy =
    language === "zh"
      ? {
          structureLabel: "反思结构",
          rows: [
            ["情绪来源", "等待回复时，不确定感变强。"],
            ["情绪名字", "读心式担心"],
            ["事实", "对方比预期更晚回复。"],
            ["想象", "这可能说明我不被在意。"],
          ],
          rankedUnit: "次",
        }
      : {
          structureLabel: "Reflection structure",
          rows: [
            ["Emotional Source", "Uncertainty grew while waiting for a reply."],
            ["Name the Demon", "Mind-reading worry"],
            ["Facts", "The message was answered later than expected."],
            ["Imagination", "This may mean I am being ignored."],
          ],
          rankedUnit: "times",
        };

  return (
    <section className="mx-auto max-w-[1240px] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[42rem] text-center">
        <SectionLabel>{t.home.transformationEyebrow}</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.15rem] sm:leading-tight">
          {t.home.transformationTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-[15px] sm:leading-7">
          {t.home.transformationCopy}
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-5 xl:gap-6">
        {t.home.storySteps.map(([title, body, , , footer], index) => {
          const Icon = transformationIcons[index];
          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
              className={[
                "group relative flex min-h-[300px] flex-col overflow-hidden rounded-[1.65rem] border bg-[rgba(255,254,248,0.80)] p-5 shadow-[var(--shadow-md)] backdrop-blur-xl transition duration-300 lg:min-h-[318px]",
                "hover:-translate-y-0.5 hover:shadow-[0_22px_68px_rgba(38,56,48,0.11)]",
                index === 1
                  ? "border-[rgba(31,155,143,0.16)] shadow-[0_28px_86px_rgba(31,80,70,0.13)]"
                  : "border-[rgba(35,70,55,0.085)]",
              ].join(" ")}
            >
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl",
                  index === 0 && "bg-[rgba(31,155,143,0.08)]",
                  index === 1 && "bg-[rgba(217,179,74,0.12)]",
                  index === 2 && "bg-[rgba(31,155,143,0.09)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {index < t.home.storySteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute -right-7 top-[42%] hidden h-px w-14 bg-[linear-gradient(90deg,rgba(31,155,143,0.28),transparent)] lg:block"
                />
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)]">
                  <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                </span>
                <span className="rounded-full border border-[rgba(35,70,55,0.08)] bg-[rgba(255,254,248,0.74)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </h3>
              <p className="mt-2 max-w-[92%] text-sm leading-5 text-[var(--foreground-muted)]">
                {body}
              </p>

              <div className="mt-4 rounded-[1.35rem] border border-[rgba(35,70,55,0.08)] bg-[rgba(255,255,255,0.60)] p-4 shadow-[var(--shadow-sm)]">
                {index === 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgba(31,155,143,0.42)]" />
                      {t.home.storyFreeWrite}
                    </div>
                    <p className="min-h-[3.9rem] rounded-[1.15rem] bg-[rgba(246,242,233,0.58)] p-3.5 text-sm leading-5 text-[var(--foreground-subtle)]">
                      “{t.home.storyInput}”
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.home.storyHelperChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[rgba(35,70,55,0.07)] bg-[rgba(255,254,248,0.70)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground-muted)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {index === 1 && (
                  <div>
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                      {prompt2Copy.structureLabel}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {prompt2Copy.rows.map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[1rem] border border-[rgba(35,70,55,0.06)] bg-[rgba(246,242,233,0.54)] p-3"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
                            {label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-[1rem] border border-[rgba(31,155,143,0.16)] bg-[linear-gradient(135deg,rgba(230,245,239,0.74),rgba(255,248,226,0.44))] p-3">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                        <CheckCircle2 aria-hidden="true" size={13} strokeWidth={1.8} />
                        {t.reflectionCard.nextStep}
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--foreground-muted)]">
                        {t.home.previewStep}
                      </p>
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div>
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
                      {t.home.storyPatternSummary}
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                      {t.home.storyRepeatedLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.home.storyRepeatedTriggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="rounded-full border border-[rgba(35,70,55,0.07)] bg-[rgba(255,254,248,0.78)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground-muted)]"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {t.home.storyRepeatedTriggers.map((trigger, barIndex) => (
                        <MiniBar
                          key={trigger}
                          label={trigger}
                          value={[3, 2, 1][barIndex] ?? 1}
                          max={3}
                          unitLabel={prompt2Copy.rankedUnit}
                        />
                      ))}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(31,155,143,0.14)] bg-[rgba(230,245,239,0.72)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                      <CheckCircle2 aria-hidden="true" size={13} strokeWidth={1.8} />
                      {t.home.storyCheckInBadge}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4">
                <span className="rounded-full bg-[rgba(230,245,239,0.62)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                  {footer}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default function Home() {
  const { language, t } = useLanguage();
  const { role, user } = useAuth();
  const workspaceHref = user ? getDefaultRouteForRole(role) : "/register";
  const isAdmin = role === "admin";
  const primaryCtaHref = user ? workspaceHref : "/demo";
  const primaryCtaLabel =
    language === "zh" ? "开始 60 秒反思" : "Start a 60-second reflection";
  const privateReflectionLabel = user
    ? isAdmin
      ? t.app.openAdmin
      : t.common.goWorkspace
    : t.common.startPrivateReflection;
  const trackingContext = useMemo(
    () => ({
      locale: language,
      authenticated_state: Boolean(user),
      role_bucket: role ?? "logged_out",
    }),
    [language, role, user]
  );

  useEffect(() => {
    trackEvent("landing_page_viewed", trackingContext);
  }, [trackingContext]);

  return (
    <PageShell maxWidth="max-w-[1320px]">
      <div className="h-px overflow-hidden text-[1px] leading-none text-transparent">
        <h1>Turn emotional overload into clear reflection.</h1>
        <Link href="/register">Create account</Link>
        <Link href="/demo">View demo</Link>
      </div>
      <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(35,70,55,0.085)] bg-[linear-gradient(140deg,rgba(255,254,248,0.99),rgba(238,248,244,0.60)_58%,rgba(255,249,229,0.38))] px-5 py-7 shadow-[var(--shadow-lg)] sm:rounded-[2.65rem] sm:px-8 sm:py-9 lg:px-11 lg:py-11 xl:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.55),transparent_42%),radial-gradient(circle_at_55%_0%,rgba(255,255,255,0.55),transparent_28%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-28 top-4 h-72 w-72 rounded-full bg-[rgba(217,179,74,0.15)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-[rgba(31,155,143,0.11)] blur-3xl"
        />

        <div className="relative grid gap-9 lg:grid-cols-12 lg:items-center xl:gap-11">
          <div className="max-w-[34rem] lg:col-span-5">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--foreground-muted)]">
              <BrandLogo size="sm" href={null} showWordmark={false} />
              <span>InnerLeaf</span>
            </div>
            <div className="mt-4">
              <Badge variant="accent">{t.home.badge}</Badge>
            </div>
            <h1 className="mt-5 max-w-[500px] text-[2.2rem] font-semibold leading-[1.06] tracking-tight text-[var(--foreground)] sm:text-[2.75rem] sm:leading-[1.04] lg:text-[2.95rem] xl:text-[3.08rem]">
              {t.home.headline}
            </h1>
            <p className="mt-4 max-w-[30rem] text-[15px] leading-7 text-[var(--foreground-muted)] sm:text-base sm:leading-7">
              {t.home.subtitle}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <LinkButton
                href={primaryCtaHref}
                size="lg"
                className="w-full px-5 py-2.5 sm:w-auto"
                onClick={() =>
                  trackEvent("hero_create_account_clicked", trackingContext)
                }
              >
                {primaryCtaLabel}
              </LinkButton>
              <LinkButton
                href="/demo"
                variant="secondary"
                size="lg"
                className="w-full px-5 py-2.5 sm:w-auto"
                onClick={() =>
                  trackEvent("hero_view_demo_clicked", trackingContext)
                }
              >
                {t.common.viewDemo}
              </LinkButton>
            </div>
            <p className="mt-3 max-w-[29rem] text-xs leading-5 text-[var(--foreground-subtle)]">
              {t.home.ctaHint}
            </p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm sm:flex-row sm:items-center sm:gap-3">
              <Link
                href="/test"
                onClick={() =>
                  trackEvent("hero_help_test_clicked", trackingContext)
                }
                className="font-medium text-[var(--brand-teal-deep)] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-ring)]"
              >
                {t.common.helpTest}
              </Link>
              <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
              <Link
                href={user ? workspaceHref : "/login"}
                className="font-medium text-[var(--foreground-muted)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-ring)]"
              >
                {user ? privateReflectionLabel : t.auth.loginLink}
              </Link>
            </div>
            <p className="mt-5 max-w-[31rem] text-sm leading-6 text-[var(--foreground-subtle)]">
              {t.home.safety}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.home.heroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[rgba(35,70,55,0.10)] bg-[rgba(255,254,248,0.68)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] backdrop-blur"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <TransformationMockup />
          </div>
        </div>
      </section>

      <ProductTransformation />

      <section id="how-it-works" className="mt-14 scroll-mt-24 sm:mt-[4.5rem] lg:mt-20">
        <SectionHeading eyebrow={t.home.howEyebrow} title={t.home.howTitle}>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
            {t.home.howIntro}
          </p>
        </SectionHeading>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {t.home.howCards.map(([title, body], index) => {
            const Icon = howIcons[index];
            return (
              <Surface key={title} className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                    <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                      0{index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {body}
                    </p>
                  </div>
                </div>
              </Surface>
            );
          })}
        </div>
      </section>

      <section id="product" className="mt-14 scroll-mt-24 sm:mt-[4.5rem] lg:mt-20">
        <SectionHeading
          eyebrow={t.home.pathEyebrow}
          title={t.home.pathTitle}
        >
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
            {t.home.pathIntro}
          </p>
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_0.95fr_0.95fr_0.95fr]">
          {t.home.pathCards.map(([title, body], index) => {
            const Icon = pathIcons[index];
            return (
              <Surface
                key={title}
                className={[
                  "p-5",
                  index < 2 ? "lg:min-h-[250px]" : "lg:min-h-[220px]",
                ].join(" ")}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {body}
                </p>
              </Surface>
            );
          })}
        </div>
      </section>

      <section id="why-innerleaf" className="mt-14 scroll-mt-24 sm:mt-[4.5rem] lg:mt-20">
        <Surface className="overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionLabel>{t.home.whyEyebrow}</SectionLabel>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.45rem] sm:leading-tight">
                {t.home.whyTitle}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-[var(--foreground-muted)]">
                {t.home.differenceNote}
              </p>
            </div>
            <div className="grid gap-3">
              {t.home.differences.map(([title, body], index) => {
                const Icon = comparisonIcons[index];
                return (
                  <div
                    key={title}
                    className="flex gap-4 rounded-[1.5rem] border border-[rgba(35,70,55,0.09)] bg-[rgba(247,246,243,0.58)] p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[var(--brand-teal-deep)] shadow-[var(--shadow-sm)]">
                      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                        {body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Surface>
      </section>

      <section className="mt-14 sm:mt-[4.5rem] lg:mt-20">
        <Surface className="overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <SectionLabel>{t.home.patternEyebrow}</SectionLabel>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.25rem] sm:leading-tight">
                {t.home.patternTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--foreground-muted)]">
                {t.home.patternCopy}
              </p>
            </div>
            <div className="grid gap-3">
              {t.home.patternCards.map(([title, body], index) => {
                const Icon = patternIcons[index];
                return (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-[rgba(35,70,55,0.10)] bg-[rgba(247,246,243,0.68)] p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                        {body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Surface>
      </section>

      <section className="mt-14 sm:mt-[4.5rem] lg:mt-20">
        <Surface className="overflow-hidden border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,255,248,0.82),rgba(232,246,241,0.56))] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionLabel>{t.home.trustEyebrow}</SectionLabel>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.25rem] sm:leading-tight">
                {t.home.trustTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
                {t.home.trustCopy}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {t.home.trustCards.map((item, index) => {
                const Icon = trustIcons[index];
                return (
                  <div
                    key={item}
                    className="rounded-2xl border border-[rgba(35,70,55,0.10)] bg-[rgba(247,246,243,0.68)] p-4 text-sm font-medium leading-6 text-[var(--foreground-muted)]"
                  >
                    <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    </span>
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </Surface>
      </section>

      <section className="mx-auto mb-12 mt-14 max-w-5xl rounded-[2rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(135deg,rgba(255,255,248,0.92),rgba(232,246,241,0.66))] p-5 shadow-[0_24px_88px_rgba(26,34,32,0.09)] backdrop-blur-xl sm:mb-16 sm:mt-20 sm:rounded-[2.35rem] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <SectionLabel>{t.home.testingEyebrow}</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.25rem] sm:leading-tight">
              {t.home.testingTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
              {t.home.testingCopy}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/marketplace" size="lg">
              {t.home.marketplaceCta}
            </LinkButton>
            <LinkButton href="/test" variant="secondary" size="lg">
              {t.home.testingCta}
            </LinkButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
