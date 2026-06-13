"use client";

import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../../components/ui";

function SystemContent() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const items = [
    [t.admin.appName, "InnerLeaf"],
    [t.admin.environment, process.env.NODE_ENV || "development"],
    [t.admin.appVersion, "MVP"],
    [t.admin.authMode, "Email/password"],
    [t.admin.googleLogin, t.admin.disabled],
    [t.admin.reflectionAccess, t.admin.loginRequired],
    [t.admin.demoMode, t.admin.staticDemoData],
    [t.admin.privacyMode, t.admin.userSpecificHistory],
    [t.admin.availableRoles, "user, tester, admin"],
    [t.admin.publicPages, "/, /about, /privacy, /faq, /demo, /test, /feedback"],
    [t.admin.protectedRoutes, "/app, /quick, /guided, /history, /summary, /account"],
    [t.admin.currentRole, role ? t.admin.roleLabels[role] : t.account.roleLoading],
  ] as const;

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader compact eyebrow={t.admin.title} title={t.admin.systemTitle}>
        {t.admin.systemPurpose}
      </PageHeader>

      <PageActions>
        <LinkButton href="/admin">{t.admin.overview}</LinkButton>
        <LinkButton href="/admin/users" variant="secondary">
          {t.admin.users}
        </LinkButton>
        <LinkButton href="/admin/feedback" variant="ghost">
          {t.admin.feedback}
        </LinkButton>
      </PageActions>

      <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>

      <div className="mt-5 grid gap-3">
        {items.map(([label, value]) => (
          <Card key={label} className="hover:translate-y-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {label}
              </p>
              <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                {value}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export default function AdminSystemPage() {
  return (
    <RequireAdmin>
      <SystemContent />
    </RequireAdmin>
  );
}
