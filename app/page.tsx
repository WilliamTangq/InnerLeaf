"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
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
import { Badge, LinkButton, PageShell, SectionLabel } from "./components/ui";
import { useLanguage } from "./components/language-provider";
import { getDefaultRouteForRole } from "./lib/routes";

const howIcons = [PencilLine, Sparkles, FileText] as const;
const pathIcons = [PencilLine, Route, FileText, Brain, MessageCircle] as const;
const comparisonIcons = [Feather, MessageCircle, ShieldCheck] as const;
const patternIcons = [FileText, MessageCircle, Brain] as const;
const trustIcons = [ShieldCheck, FileText, Leaf] as const;

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
        "rounded-[1.75rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,248,0.72)] shadow-[0_24px_80px_rgba(26,34,32,0.075)] backdrop-blur-xl",
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
  const { t } = useLanguage();
  const cardRows = [
    [t.reflectionCard.trigger, t.home.previewTrigger],
    [t.reflectionCard.facts, t.home.previewFacts],
    [t.reflectionCard.interpretation, t.home.previewInterpretation],
    [t.reflectionCard.thoughtPattern, t.home.previewPattern],
  ] as const;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_78%_8%,rgba(228,184,74,0.26),transparent_34%),radial-gradient(circle_at_8%_78%,rgba(31,155,143,0.20),transparent_40%)] blur-3xl"
      />
      <Surface className="relative overflow-hidden p-4 sm:p-5 lg:p-6">
        <div className="absolute right-6 top-6 hidden rounded-full border border-[rgba(31,155,143,0.18)] bg-white/55 px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)] lg:block">
          {t.home.previewTitle}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.82fr_auto_1.18fr] lg:items-center">
          <div className="rounded-[1.5rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,255,0.62)] p-4 shadow-[0_10px_40px_rgba(26,34,32,0.05)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
              <MessageCircle aria-hidden="true" size={15} strokeWidth={1.8} />
              {t.home.heroStructured}
            </div>
            <p className="text-xl font-medium leading-8 tracking-tight text-[var(--foreground)] sm:text-2xl sm:leading-9">
              “{t.home.heroMessy}”
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.home.problemCards.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[rgba(35,70,55,0.10)] bg-[rgba(247,246,243,0.74)] px-3 py-1 text-xs text-[var(--foreground-subtle)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center text-[var(--brand-teal-deep)] lg:px-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] shadow-[0_10px_30px_rgba(31,155,143,0.14)] lg:h-14 lg:w-14">
              <ArrowRight aria-hidden="true" size={22} strokeWidth={1.8} />
            </div>
          </div>

          <div className="rounded-[1.85rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_16px_50px_rgba(26,34,32,0.08)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  {t.home.previewTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  {t.home.doesTitle}
                </p>
              </div>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
                ~3 min
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cardRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.1rem] border border-[rgba(35,70,55,0.08)] bg-[rgba(247,246,243,0.68)] p-3.5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[1.25rem] border border-[rgba(31,155,143,0.18)] bg-[linear-gradient(135deg,rgba(230,245,243,0.94),rgba(255,248,226,0.66))] p-4">
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

export default function Home() {
  const { t } = useLanguage();
  const { role, user } = useAuth();
  const workspaceHref = user ? getDefaultRouteForRole(role) : "/register";
  const isAdmin = role === "admin";
  const primaryHref = user ? workspaceHref : "/register";
  const primaryLabel = user
    ? isAdmin
      ? t.app.openAdmin
      : t.common.goWorkspace
    : t.common.getStarted;

  return (
    <PageShell maxWidth="max-w-[1200px]">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(140deg,rgba(255,255,248,0.96),rgba(232,246,241,0.62)_52%,rgba(255,247,221,0.45))] px-5 py-8 shadow-[0_34px_110px_rgba(26,34,32,0.11)] sm:px-8 sm:py-12 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-4 h-72 w-72 rounded-full bg-[rgba(228,184,74,0.18)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-[rgba(31,155,143,0.13)] blur-3xl"
        />

        <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <BrandLogo
              size="lg"
              href={null}
              showWordmark={false}
              className="mb-5"
            />
            <Badge variant="accent">{t.home.badge}</Badge>
            <h1 className="mt-5 max-w-[720px] text-[2.6rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[4.75rem] sm:leading-[0.96]">
              {t.home.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-muted)] sm:text-lg sm:leading-8">
              {t.home.subtitle}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={primaryHref} size="lg" className="w-full sm:w-auto">
                {primaryLabel}
              </LinkButton>
              <LinkButton
                href="/demo"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {t.common.viewDemo}
              </LinkButton>
            </div>
            <p className="mt-3 max-w-lg text-xs leading-5 text-[var(--foreground-subtle)]">
              {t.home.ctaHint}
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
              <Link
                href="/test"
                className="font-medium text-[var(--brand-teal-deep)] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-ring)]"
              >
                {t.common.helpTest}
              </Link>
              <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
              <Link
                href={user ? workspaceHref : "/login"}
                className="font-medium text-[var(--foreground-muted)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-ring)]"
              >
                {user ? primaryLabel : t.auth.loginLink}
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--foreground-subtle)]">
              {t.home.safety}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.home.heroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,248,0.64)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <TransformationMockup />
        </div>
      </section>

      <section id="how-it-works" className="mt-16 scroll-mt-24 sm:mt-20">
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
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                  <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
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

      <section id="product" className="mt-16 scroll-mt-24 sm:mt-20">
        <SectionHeading
          eyebrow={t.home.pathEyebrow}
          title={t.home.pathTitle}
        >
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
            {t.home.pathIntro}
          </p>
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {t.home.pathCards.map(([title, body], index) => {
            const Icon = pathIcons[index];
            return (
              <Surface key={title} className="p-5">
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

      <section id="why-innerleaf" className="mt-16 scroll-mt-24 sm:mt-20">
        <SectionHeading eyebrow={t.home.whyEyebrow} title={t.home.whyTitle}>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
            {t.home.differenceNote}
          </p>
        </SectionHeading>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {t.home.differences.map(([title, body], index) => {
            const Icon = comparisonIcons[index];
            return (
              <Surface key={title} className="p-5 sm:p-6">
                <Icon
                  aria-hidden="true"
                  size={21}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
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

      <section className="mt-16 sm:mt-20">
        <Surface className="overflow-hidden p-6 sm:p-8">
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

      <section className="mt-16 sm:mt-20">
        <Surface className="overflow-hidden p-6 sm:p-8">
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

      <section className="mx-auto mb-12 mt-16 max-w-5xl rounded-[2rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(135deg,rgba(255,255,248,0.88),rgba(232,246,241,0.62))] p-6 shadow-[0_22px_80px_rgba(26,34,32,0.09)] backdrop-blur-xl sm:mb-16 sm:mt-20 sm:p-8">
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
            <LinkButton href="/test" size="lg">
              {t.home.testingCta}
            </LinkButton>
            <LinkButton href="/feedback" variant="secondary" size="lg">
              {t.nav.feedback}
            </LinkButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
