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
  Scale,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "./components/brand-logo";
import { useAuth } from "./components/auth-provider";
import { Badge, LinkButton, PageShell, SectionLabel } from "./components/ui";
import { useLanguage } from "./components/language-provider";
import { getDefaultRouteForRole } from "./lib/routes";

const productIcons = [Scale, Brain, Feather] as const;
const flowIcons = [PencilLine, Sparkles, FileText, Route] as const;

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
  const primaryHref = user ? getDefaultRouteForRole(role) : "/register";
  const primaryLabel = user ? t.common.goWorkspace : t.common.createAccount;

  return (
    <PageShell maxWidth="max-w-[1200px]">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(140deg,rgba(255,255,248,0.92),rgba(232,246,241,0.55)_54%,rgba(255,247,221,0.42))] px-5 py-9 shadow-[0_30px_100px_rgba(26,34,32,0.10)] sm:px-8 sm:py-12 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-4 h-72 w-72 rounded-full bg-[rgba(228,184,74,0.18)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-[rgba(31,155,143,0.13)] blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <BrandLogo
            size="lg"
            href={null}
            showWordmark={false}
            className="mb-5 justify-center"
          />
          <Badge variant="accent">{t.home.badge}</Badge>
          <h1 className="mx-auto mt-5 max-w-[820px] text-[2.45rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[4.75rem] sm:leading-[0.98]">
            {t.home.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-muted)] sm:text-lg sm:leading-8">
            {t.home.subtitle}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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
          <Link
            href={user ? getDefaultRouteForRole(role) : "/login"}
            className="mt-4 inline-flex text-sm font-medium text-[var(--brand-teal-deep)] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-ring)]"
          >
            {user ? t.common.goWorkspace : t.auth.loginLink}
          </Link>
          <p className="mt-4 text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.home.safety}
          </p>
        </div>

        <div className="relative mt-10 lg:mt-12">
          <TransformationMockup />
        </div>
      </section>

      <section className="mt-20 sm:mt-24">
        <SectionHeading eyebrow={t.home.doesEyebrow} title={t.home.doesTitle} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.home.doesCards.map((item, index) => {
            const Icon = productIcons[index];
            return (
              <Surface key={item} className="p-5 sm:p-6">
                <Icon
                  aria-hidden="true"
                  size={21}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <p className="mt-5 text-base font-medium leading-7 text-[var(--foreground)]">
                  {item}
                </p>
              </Surface>
            );
          })}
        </div>
      </section>

      <section className="mt-20 sm:mt-24">
        <SectionHeading eyebrow={t.home.whyEyebrow} title={t.home.whyTitle}>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
            {t.home.differenceNote}
          </p>
        </SectionHeading>
        <div className="mx-auto mt-7 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.differences.map(([title]) => (
            <div
              key={title}
              className="rounded-full border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,248,0.68)] px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] backdrop-blur-xl"
            >
              {title}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 sm:mt-24">
        <SectionHeading eyebrow={t.home.howEyebrow} title={t.home.howTitle} />
        <Surface className="mx-auto mt-8 max-w-5xl p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            {t.home.steps.map(([title], index) => {
              const Icon = flowIcons[index];
              return (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-[1.25rem] bg-[rgba(247,246,243,0.68)] p-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  </span>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {title}
                  </p>
                </div>
              );
            })}
          </div>
        </Surface>
      </section>

      <section className="mx-auto mb-12 mt-20 max-w-4xl rounded-[2rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,255,248,0.78)] p-6 text-center shadow-[0_22px_80px_rgba(26,34,32,0.09)] backdrop-blur-xl sm:mb-16 sm:mt-24 sm:p-9">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
          <Leaf aria-hidden="true" size={22} strokeWidth={1.8} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.4rem]">
          {t.home.finalTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--foreground-muted)]">
          {t.home.finalSubtitle}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton
            href={user ? getDefaultRouteForRole(role) : "/register"}
            size="lg"
            className="w-full sm:w-auto"
          >
            {user
              ? role === "admin"
                ? t.app.openAdmin
                : t.nav.workspace
              : t.common.createAccount}
          </LinkButton>
          <LinkButton
            href={user ? getDefaultRouteForRole(role) : "/login"}
            variant="secondary"
            size="lg"
          >
            {user
              ? role === "admin"
                ? t.app.openAdmin
                : t.nav.workspace
              : t.nav.login}
          </LinkButton>
        </div>
      </section>
    </PageShell>
  );
}
