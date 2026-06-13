"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { RequireAuth } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { Badge, Card, PageHeader, PageShell, PrimaryButton, StatusCard } from "../components/ui";

function AccountContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAdmin, profile, role, signOut, user } = useAuth();
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  async function logOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <PageShell maxWidth="max-w-2xl">
      <PageHeader compact eyebrow={t.auth.account} title={t.account.title}>
        {t.account.purpose}
      </PageHeader>

      <Card variant="elevated" className="hover:translate-y-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {user?.email || profile?.email}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.account.privacy}
            </p>
          </div>
          {isAdmin && <Badge variant="accent">{t.auth.admin}</Badge>}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              {t.account.email}
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-[var(--foreground)]">
              {user?.email || profile?.email}
            </dd>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              {t.account.role}
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
              {role}
            </dd>
          </div>
          {createdAt && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                {t.account.created}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {createdAt}
              </dd>
            </div>
          )}
        </dl>

        {isAdmin && (
          <Link
            href="/admin"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-teal-deep)] underline-offset-4 hover:underline"
          >
            <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.8} />
            {t.admin.title}
          </Link>
        )}

        <div className="mt-6">
          <PrimaryButton type="button" onClick={() => void logOut()}>
            {t.account.logout}
          </PrimaryButton>
        </div>
      </Card>

      <div className="mt-5">
        <StatusCard tone="neutral">
          <Link href="/privacy" className="font-medium text-[var(--brand-teal-deep)] underline-offset-4 hover:underline">
            {t.nav.privacy}
          </Link>
        </StatusCard>
      </div>
    </PageShell>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
