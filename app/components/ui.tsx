"use client";

import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { BrandLogo } from "./brand-logo";
import { NavLinks } from "./nav-links";
import { useLanguage } from "./language-provider";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[var(--background-elevated)]/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <BrandLogo size="md" />
        <NavLinks />
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background-elevated)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex flex-col gap-4">
          <BrandLogo size="sm" href={null} showWordmark />
          <p className="max-w-sm text-sm leading-6 text-[var(--foreground-subtle)]">
            {t.common.footer}
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-[var(--foreground-muted)] sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--foreground-subtle)]">
              {t.common.follow}
            </span>
            <a
              className="underline-offset-4 transition duration-200 hover:text-[var(--foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
              href="https://www.linkedin.com/company/innerleaf"
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <span aria-hidden="true" className="text-[var(--border-strong)]">
              ·
            </span>
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
      </div>
    </footer>
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
      <main className={cx("mx-auto w-full flex-1 px-5 py-10 sm:px-8", maxWidth)}>
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
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2rem] sm:leading-tight">
        {title}
      </h1>
      {children && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
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
    <div
      className={cx("mb-8 flex flex-wrap items-center gap-3", className)}
    >
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
    <div
      className={cx(
        "rounded-[var(--radius-xl)] border p-5 sm:p-6",
        variant === "default" &&
          "border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] transition duration-200",
        variant === "muted" &&
          "border-[var(--border)] bg-[var(--surface-muted)]",
        variant === "elevated" &&
          "border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-lg)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        className
      )}
    >
      {children}
    </div>
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
      className={cx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "neutral" &&
          "bg-[var(--surface-muted)] text-[var(--foreground-muted)]",
        variant === "accent" &&
          "border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]",
        variant === "outline" &&
          "border border-[var(--border)] text-[var(--foreground-muted)]"
      )}
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
    <button
      className={cx(
        "btn-brand inline-flex items-center justify-center rounded-lg font-medium transition duration-200 active:translate-y-px disabled:cursor-not-allowed",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-[15px]",
        className
      )}
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
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition duration-200 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
        className,
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-[15px]",
        variant === "primary" && "btn-brand text-white",
        variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
        variant === "ghost" &&
          "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      )}
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
          "mt-3 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-[15px] leading-7 text-[var(--foreground)] outline-none transition duration-200 placeholder:text-[var(--foreground-subtle)]",
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
        "rounded-[var(--radius-lg)] border px-4 py-3 text-sm leading-6",
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
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="brand-panel text-center sm:text-left">
      <div className="mx-auto mb-5 sm:mx-0">
        <BrandLogo size="lg" href={null} showWordmark={false} />
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
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
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
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
