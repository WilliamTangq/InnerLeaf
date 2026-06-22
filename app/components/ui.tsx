"use client";

import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  MouseEventHandler,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { BrandLogo } from "./brand-logo";
import { NavLinks } from "./nav-links";
import { useLanguage } from "./language-provider";
import { useAuth } from "./auth-provider";
import {
  badgeVariants,
  buttonVariants,
  ShadButton,
  ShadCard,
} from "./ui/primitives";
import { cn } from "../lib/utils";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type VisualIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export function IconFrame({
  icon: Icon,
  tone = "sage",
  size = "md",
}: {
  icon: VisualIcon;
  tone?: "sage" | "gold" | "neutral";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center border shadow-[var(--shadow-sm)]",
        size === "sm" && "h-8 w-8 rounded-xl",
        size === "md" && "h-10 w-10 rounded-2xl",
        size === "lg" && "h-12 w-12 rounded-[1.15rem]",
        tone === "sage" &&
          "border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]",
        tone === "gold" &&
          "border-[rgba(177,154,70,0.22)] bg-[rgba(245,231,189,0.48)] text-[rgb(128,100,31)]",
        tone === "neutral" &&
          "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)]"
      )}
    >
      <Icon
        aria-hidden="true"
        size={size === "sm" ? 15 : size === "lg" ? 21 : 18}
        strokeWidth={1.8}
      />
    </span>
  );
}

export function MiniBar({
  label,
  value,
  max,
  detail,
}: {
  label: string;
  value: number;
  max: number;
  detail?: string;
}) {
  const width = max > 0 ? Math.max(8, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.72)] px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-[var(--foreground)]">
          {label}
        </span>
        <span className="shrink-0 text-xs font-semibold text-[var(--foreground-subtle)]">
          {detail ?? value}
        </span>
      </div>
      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),rgba(217,179,74,0.72))]"
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}

export function MiniSparkline({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  const width = 180;
  const height = 54;
  const safeValues = values.length > 1 ? values : [0, values[0] ?? 0];
  const max = Math.max(...safeValues, 1);
  const points = safeValues
    .map((value, index) => {
      const x = (index / (safeValues.length - 1)) * width;
      const y = height - (value / max) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(31,155,143,0.12)] bg-[linear-gradient(135deg,rgba(231,244,239,0.58),rgba(255,254,248,0.84))] px-3 py-2"
      aria-label={label}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-14 w-full"
        role="img"
        aria-label={label}
      >
        <polyline
          points={points}
          fill="none"
          stroke="rgba(17,111,104,0.72)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={`0,${height - 4} ${width},${height - 4}`}
          fill="none"
          stroke="rgba(40,80,60,0.10)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function TopNav() {
  return (
    <header className="topbar-surface sticky top-0 z-[1200]">
      <div className="mx-auto flex min-h-[74px] w-full max-w-[1240px] items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-8">
        <BrandLogo size="md" />
        <NavLinks />
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const { isAdmin, user } = useAuth();
  const productLinks = [
    [t.nav.demo, "/demo"],
    [t.nav.test, "/test"],
    [
      user ? (isAdmin ? t.admin.overview : t.nav.workspace) : t.nav.login,
      user ? (isAdmin ? "/admin" : "/dashboard") : "/login",
    ],
  ] as const;
  const companyLinks = [
    [t.nav.about, "/about"],
    [t.nav.faq, "/faq"],
    [t.nav.privacy, "/privacy"],
    [t.nav.feedback, "/feedback"],
  ] as const;

  return (
    <footer className="mt-auto border-t border-[rgba(40,80,60,0.08)] bg-[rgba(255,253,248,0.76)] backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr]">
        <div className="flex flex-col gap-4">
          <BrandLogo size="sm" href={null} showWordmark />
          <p className="max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">
            {t.footerSections.description}
          </p>
          <p className="max-w-sm text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.common.footer}
          </p>
        </div>
        <FooterColumn title={t.footerSections.product} links={productLinks} />
        <FooterColumn title={t.footerSections.company} links={companyLinks} />
        <div className="flex flex-col gap-3 text-sm text-[var(--foreground-muted)]">
          <p className="font-medium text-[var(--foreground)]">
            {t.common.follow}
          </p>
          <a
            className="underline-offset-4 transition duration-200 hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            href="https://www.linkedin.com/company/innerleaf"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <a
            className="underline-offset-4 transition duration-200 hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
            href="https://www.instagram.com/innerleaf.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-[var(--foreground-muted)]">
      <p className="font-medium text-[var(--foreground)]">{title}</p>
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className="underline-offset-4 transition duration-200 hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export function PageShell({
  children,
  maxWidth = "max-w-3xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="page-glow flex min-h-screen flex-col text-[var(--foreground)]">
      <TopNav />
      <main className={cx("mx-auto w-full flex-1 px-5 py-8 sm:px-8 sm:py-11", maxWidth)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "mb-6" : "mb-8"}>
      {eyebrow && (
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          {eyebrow}
        </p>
      )}
      <h1 className="max-w-3xl text-[1.85rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.05rem] sm:leading-tight">
        {title}
      </h1>
      {children && (
        <p className="mt-2.5 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
          {children}
        </p>
      )}
    </section>
  );
}

export function PageActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-5 flex flex-wrap items-center gap-2.5", className)}>
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "elevated";
}) {
  return (
    <ShadCard variant={variant} className={className}>
      {children}
    </ShadCard>
  );
}

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "accent" | "outline";
}) {
  return (
    <span
      className={badgeVariants({ variant })}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  className,
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ShadButton
      className={className}
      size={size}
      variant="primary"
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </Link>
  );
}

export function TextareaField({
  label,
  helper,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>
      {helper && (
        <span className="mt-1 block text-sm leading-6 text-[var(--foreground-subtle)]">
          {helper}
        </span>
      )}
      <textarea
        className={cx(
          "mt-3 w-full resize-none rounded-[calc(var(--radius-lg)+4px)] border border-[var(--border)] bg-[rgba(255,254,248,0.92)] p-4 text-[15px] leading-7 text-[var(--foreground)] shadow-[var(--shadow-sm)] outline-none transition duration-200 placeholder:text-[var(--foreground-subtle)]",
          "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]",
          className
        )}
        {...props}
      />
    </label>
  );
}

export function RadioGroupField({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-sm transition duration-200",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function StatusCard({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "error" | "success";
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-lg)] border px-3.5 py-2.5 text-sm leading-6 shadow-[var(--shadow-sm)]",
        tone === "neutral" &&
          "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)]",
        tone === "warning" &&
          "border-[var(--border)] bg-[var(--warning-bg)] text-[var(--warning)]",
        tone === "error" &&
          "border-[var(--border)] bg-[var(--error-bg)] text-[var(--error)]",
        tone === "success" &&
          "border-[var(--border)] bg-[var(--success-bg)] text-[var(--success)]"
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: VisualIcon;
}) {
  return (
    <Card className="brand-panel relative overflow-hidden text-center hover:translate-y-0 sm:text-left">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(217,179,74,0.16),transparent_64%)]"
        aria-hidden="true"
      />
      <div className="mx-auto mb-4 sm:mx-0">
        {icon ? (
          <IconFrame icon={icon} size="lg" tone="sage" />
        ) : (
          <BrandLogo size="lg" href={null} showWordmark={false} />
        )}
      </div>
      <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function StatChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,254,248,0.82)] shadow-[var(--shadow-sm)]">
      <div className="h-0.5" style={{ background: "var(--brand-gradient)" }} />
      <div className="px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--brand-teal)]"
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </div>
  );
}

export function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="mt-8 overflow-hidden hover:translate-y-0" variant="elevated">
      <LoadingSpinner label={label} />
      <div className="mt-6 grid gap-3" aria-hidden="true">
        <div className="h-4 w-44 rounded-full bg-[var(--surface-muted)]" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-20 rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-20 rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        </div>
        <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--accent-soft)]" />
      </div>
    </Card>
  );
}

export function SectionLabel({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p
      id={id}
      className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--foreground-subtle)]"
    >
      {children}
    </p>
  );
}
