"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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
import { Badge, LinkButton, PageShell, SectionLabel } from "./components/ui";
import { useLanguage } from "./components/language-provider";
import { getDefaultRouteForRole } from "./lib/routes";

const howIcons = [PencilLine, Sparkles, FileText] as const;
const pathIcons = [PencilLine, Route, FileText, Brain, MessageCircle] as const;
const comparisonIcons = [Feather, MessageCircle, ShieldCheck] as const;
const patternIcons = [FileText, MessageCircle, Brain] as const;
const trustIcons = [ShieldCheck, FileText, Leaf] as const;
const transformationIcons = [MessageCircle, FileText, CheckCircle2] as const;

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
        className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_78%_8%,rgba(217,179,74,0.20),transparent_34%),radial-gradient(circle_at_8%_78%,rgba(31,155,143,0.18),transparent_42%)] blur-3xl"
      />
      <Surface className="relative overflow-hidden p-4 shadow-[var(--shadow-xl)] sm:p-5 lg:p-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(31,155,143,0.22),transparent)]" />
        <div className="rounded-[1.7rem] border border-[rgba(35,70,55,0.085)] bg-[rgba(255,255,255,0.62)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              <MessageCircle aria-hidden="true" size={15} strokeWidth={1.8} />
              {t.home.heroStructured}
            </div>
            <span className="rounded-full border border-[rgba(35,70,55,0.08)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--foreground-subtle)]">
              {t.common.exampleReflection}
            </span>
          </div>
          <p className="mt-4 text-xl font-medium leading-8 tracking-tight text-[var(--foreground)] sm:text-2xl sm:leading-9">
            “{t.home.heroMessy}”
          </p>
        </div>

        <div className="my-4 flex justify-center text-[var(--brand-teal-deep)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] shadow-[0_10px_28px_rgba(31,155,143,0.12)]">
            <ArrowRight aria-hidden="true" size={21} strokeWidth={1.8} />
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[var(--shadow-md)] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                {t.home.previewTitle}
              </p>
              <p className="mt-1 max-w-sm text-sm font-semibold leading-6 text-[var(--foreground)]">
                {t.home.doesTitle}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-teal-deep)]">
              <Clock3 aria-hidden="true" size={13} strokeWidth={1.8} />
              ~3 min
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {cardRows.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.15rem] border border-[rgba(35,70,55,0.075)] bg-[rgba(246,242,233,0.58)] p-3.5 shadow-[var(--shadow-sm)]"
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

          <div className="mt-3 rounded-[1.35rem] border border-[rgba(31,155,143,0.2)] bg-[linear-gradient(135deg,rgba(230,245,239,0.94),rgba(255,248,226,0.62))] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-deep)]">
              <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.8} />
              {t.reflectionCard.nextStep}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.home.previewStep}
            </p>
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

function ProductTransformation() {
  const { t } = useLanguage();
  const items = [
    [t.home.transformationMessy, t.home.heroMessy],
    [t.home.transformationCard, t.home.doesTitle],
    [t.home.transformationStep, t.home.previewStep],
  ] as const;

  return (
    <section className="mt-12 sm:mt-16">
      <Surface className="overflow-hidden p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionLabel>{t.home.transformationEyebrow}</SectionLabel>
            <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.4rem] sm:leading-tight">
              {t.home.transformationTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-[var(--foreground-muted)]">
              {t.home.transformationCopy}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {items.map(([title, body], index) => {
              const Icon = transformationIcons[index];
              return (
                <div
                  key={title}
                  className="relative rounded-[1.65rem] border border-[rgba(35,70,55,0.085)] bg-[rgba(255,255,255,0.62)] p-4 shadow-[var(--shadow-soft)]"
                >
                  {index < items.length - 1 && (
                    <ArrowRight
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.8}
                      className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-[var(--foreground-subtle)] md:block"
                    />
                  )}
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Surface>
    </section>
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
    : t.common.createAccount;

  return (
    <PageShell maxWidth="max-w-[1200px]">
      <section className="relative overflow-hidden rounded-[3.25rem] border border-[rgba(35,70,55,0.085)] bg-[linear-gradient(140deg,rgba(255,254,248,0.99),rgba(237,248,244,0.68)_55%,rgba(255,249,229,0.5))] px-5 py-8 shadow-[var(--shadow-xl)] sm:px-8 sm:py-12 lg:px-11">
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

        <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <BrandLogo
              size="lg"
              href={null}
              showWordmark={false}
              className="mb-5"
            />
            <Badge variant="accent">{t.home.badge}</Badge>
            <h1 className="mt-5 max-w-[720px] text-[2.65rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[4.85rem] sm:leading-[0.94]">
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
                  className="rounded-full border border-[rgba(35,70,55,0.10)] bg-[rgba(255,254,248,0.68)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] backdrop-blur"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <TransformationMockup />
        </div>
      </section>

      <ProductTransformation />

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

      <section id="product" className="mt-16 scroll-mt-24 sm:mt-20">
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

      <section id="why-innerleaf" className="mt-16 scroll-mt-24 sm:mt-20">
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

      <section className="mt-16 sm:mt-20">
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

      <section className="mt-16 sm:mt-20">
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

      <section className="mx-auto mb-12 mt-16 max-w-5xl rounded-[2.35rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(135deg,rgba(255,255,248,0.92),rgba(232,246,241,0.66))] p-6 shadow-[0_24px_88px_rgba(26,34,32,0.09)] backdrop-blur-xl sm:mb-16 sm:mt-20 sm:p-8">
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
