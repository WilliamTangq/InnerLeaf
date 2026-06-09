"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  Brain,
  CheckCircle2,
  HelpCircle,
  Leaf,
  MessageCircle,
  PencilLine,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { BrandLogo } from "./components/brand-logo";
import {
  Badge,
  Card,
  LinkButton,
  PageShell,
  SectionLabel,
} from "./components/ui";
import { useLanguage } from "./components/language-provider";

const problemIcons = [Zap, MessageCircle, Route, TrendingUp] as const;
const stepIcons = [PencilLine, Sparkles, Archive, TrendingUp] as const;
const trustIcons = [ShieldCheck, CheckCircle2, Scale, Leaf, Brain] as const;

function MarketingSection({
  eyebrow,
  title,
  children,
  id,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={[
        "scroll-mt-28 border-t border-[var(--border)] pt-12 sm:pt-14",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.8rem] sm:leading-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

function HeroBackground() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      return;
    }

    // Optional local asset: add commercially usable footage at public/hero-bg.mp4.
    // Do not hardcode external video URLs here.
    fetch("/hero-bg.mp4", { method: "HEAD" })
      .then((response) => setShowVideo(response.ok))
      .catch(() => setShowVideo(false));
  }, []);

  if (!showVideo) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "var(--brand-gradient-soft)" }}
      />
    );
  }

  return (
    <>
      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[rgba(255,252,246,0.72)]" />
    </>
  );
}

function ProductMockup({ detailed = false }: { detailed?: boolean }) {
  const { t } = useLanguage();
  const sections = [
    [t.reflectionCard.emotionalValidation, t.home.previewValidation],
    [t.reflectionCard.trigger, t.home.previewTrigger],
    [t.reflectionCard.facts, t.home.previewFacts],
    [t.reflectionCard.interpretation, t.home.previewInterpretation],
    [t.reflectionCard.thoughtPattern, t.home.previewPattern],
    [t.reflectionCard.nextQuestion, t.home.previewQuestion],
    [t.reflectionCard.nextStep, t.home.previewStep],
  ] as const;

  const visibleSections = detailed ? sections : sections.slice(1);

  return (
    <Card
      variant="elevated"
      className="relative overflow-hidden border-[rgba(31,155,143,0.15)]"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-60"
        style={{ background: "var(--brand-gradient-soft)" }}
      />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <SectionLabel>{t.home.previewEyebrow}</SectionLabel>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              {t.home.previewTitle}
            </p>
          </div>
          <Badge variant="accent">~3 min</Badge>
        </div>

        <div className="grid gap-3">
          {visibleSections.map(([label, text], index) => {
            const isStep = label === t.reflectionCard.nextStep;
            return (
              <div
                key={label}
                className={[
                  "rounded-[var(--radius-lg)] border p-3.5",
                  isStep
                    ? "border-[rgba(31,155,143,0.22)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/70 text-[var(--brand-teal-deep)]"
                  >
                    {index === 0 ? (
                      <Zap size={14} strokeWidth={1.8} />
                    ) : index === 1 ? (
                      <Scale size={14} strokeWidth={1.8} />
                    ) : index === 2 ? (
                      <Route size={14} strokeWidth={1.8} />
                    ) : index === 3 ? (
                      <Brain size={14} strokeWidth={1.8} />
                    ) : index === 4 ? (
                      <HelpCircle size={14} strokeWidth={1.8} />
                    ) : (
                      <CheckCircle2 size={14} strokeWidth={1.8} />
                    )}
                  </span>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {label}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function HeroVisual() {
  const { t } = useLanguage();

  return (
    <div className="relative rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.16)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] sm:p-5 lg:order-2">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--foreground-muted)]">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
          <MessageCircle aria-hidden="true" size={14} strokeWidth={1.8} />
          {t.home.heroStructured}
        </div>
        “{t.home.heroMessy}”
      </div>
      <div className="my-3 flex justify-center text-[var(--brand-teal-deep)]">
        <ArrowRight aria-hidden="true" size={22} strokeWidth={1.8} />
      </div>
      <ProductMockup />
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-6xl">
      <section className="relative overflow-hidden rounded-[calc(var(--radius-xl)+8px)] border border-[rgba(31,155,143,0.14)] px-5 py-8 shadow-[var(--shadow-lg)] sm:px-8 sm:py-12">
        <HeroBackground />
        <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14">
          <div className="max-w-xl">
            <BrandLogo
              size="hero"
              href={null}
              showWordmark={false}
              className="mb-6"
            />
            <Badge variant="accent">{t.home.badge}</Badge>
            <h1 className="mt-4 text-[2.15rem] font-semibold tracking-tight text-[var(--foreground)] sm:mt-5 sm:text-[3.1rem] sm:leading-[1.06]">
              {t.home.headline}
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--foreground-muted)] sm:text-lg sm:leading-8">
              {t.home.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href="/quick" size="lg" className="w-full sm:w-auto">
                {t.common.startReflection}
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
            <p className="mt-4 text-sm text-[var(--foreground-subtle)]">
              {t.home.safety}
            </p>
          </div>

          <HeroVisual />
        </div>
      </section>

      <MarketingSection
        eyebrow={t.home.problemEyebrow}
        title={t.home.problemTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.problemCards.map((item, index) => {
            const Icon = problemIcons[index];
            return (
              <Card key={item} className="h-full hover:translate-y-0">
                <Icon
                  aria-hidden="true"
                  size={20}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <h3 className="mt-4 text-sm font-semibold leading-6 text-[var(--foreground)]">
                  {item}
                </h3>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection
        id="product"
        eyebrow={t.home.previewEyebrow}
        title={t.home.artifactTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 max-w-3xl">
          <ProductMockup detailed />
        </div>
      </MarketingSection>

      <MarketingSection
        id="how-it-works"
        eyebrow={t.home.howEyebrow}
        title={t.home.howTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.steps.map(([title, description], index) => {
            const Icon = stepIcons[index];
            return (
              <Card key={title} className="h-full hover:translate-y-0">
                <div className="flex items-center justify-between gap-3">
                  <Icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.8}
                    className="text-[var(--brand-teal-deep)]"
                  />
                  <span className="text-xs font-medium text-[var(--foreground-subtle)]">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                  {description}
                </p>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow={t.home.whyEyebrow}
        title={t.home.whyTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.differences.map(([title, description]) => (
            <Card key={title} className="hover:translate-y-0">
              <h3 className="font-semibold text-[var(--foreground)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow={t.home.useCasesEyebrow}
        title={t.home.useCasesTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.useCases.map((item) => (
            <Card key={item} className="p-4 sm:p-5">
              <p className="text-sm font-medium leading-6 text-[var(--foreground)]">
                {item}
              </p>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow={t.home.trustEyebrow}
        title={t.home.trustTitle}
        className="mt-16 sm:mt-20"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {t.home.trustCards.map((item, index) => {
            const Icon = trustIcons[index];
            return (
              <Card key={item} variant="muted" className="p-4 sm:p-5">
                <Icon
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className="text-[var(--brand-teal-deep)]"
                />
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">
                  {item}
                </p>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <section className="mt-16 rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.18)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:mt-20 sm:p-8">
        <SectionLabel>{t.home.testingEyebrow}</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.8rem]">
          {t.home.testingTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--foreground-muted)]">
          {t.home.testingCopy}
        </p>
        <div className="mt-6">
          <LinkButton href="/test" size="lg">
            {t.home.testingCta}
          </LinkButton>
        </div>
      </section>

      <section className="mb-16 mt-16 overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(31,155,143,0.18)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:mb-20 sm:mt-20 sm:p-8">
        <SectionLabel>{t.common.reflect}</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.8rem]">
          {t.home.finalTitle}
        </h2>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton href="/quick" size="lg" className="w-full sm:w-auto">
            {t.common.startQuick}
          </LinkButton>
          <LinkButton href="/guided" variant="secondary" size="lg">
            {t.common.tryGuided}
          </LinkButton>
        </div>
      </section>
    </PageShell>
  );
}
