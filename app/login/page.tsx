import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import {
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../components/ui";

export default function LoginPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Account" title="Login">
        Account access is not enabled yet. This page is structured for the
        future private history experience without changing the current MVP flow.
      </PageHeader>

      <PageActions>
        <LinkButton href="/" variant="ghost">
          Home
        </LinkButton>
        <LinkButton href="/quick" variant="secondary">
          Start reflection
        </LinkButton>
      </PageActions>

      <Card variant="elevated" className="overflow-hidden">
        <div
          className="-mx-5 -mt-5 mb-5 h-1 sm:-mx-6 sm:-mt-6"
          style={{ background: "var(--brand-gradient)" }}
          aria-hidden
        />
        <div className="mb-6 flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
            aria-hidden="true"
          >
            <LockKeyhole size={20} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Private accounts are coming later
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              InnerLeaf currently works without authentication. Your reflection
              flow, history, summary, and feedback pages remain available.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <Mail
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              Email
            </span>
            <input
              className="mt-3 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[15px] text-[var(--foreground-subtle)] outline-none"
              disabled
              placeholder="Not enabled in this MVP"
              type="email"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <ShieldCheck
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="text-[var(--brand-teal-deep)]"
              />
              Password
            </span>
            <input
              className="mt-3 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[15px] text-[var(--foreground-subtle)] outline-none"
              disabled
              placeholder="Authentication is not active yet"
              type="password"
            />
          </label>
        </div>

        <div className="mt-6">
          <StatusCard tone="neutral">
            No login, account creation, or password handling has been added.
            This is a placeholder structure only.
          </StatusCard>
        </div>
      </Card>
    </PageShell>
  );
}
