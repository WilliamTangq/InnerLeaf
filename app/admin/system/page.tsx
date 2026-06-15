"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../../components/admin-shell";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import { Card, StatusCard } from "../../components/ui";

type SystemStatus = {
  supabaseConfigured: boolean;
  geminiConfigured: boolean;
};

function SystemContent() {
  const { role, session } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSystem() {
      if (!session?.access_token) {
        return;
      }

      try {
        const response = await fetch("/api/admin/system", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "System unavailable");
        }

        setStatus(data);
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadSystem();
  }, [session?.access_token, t.admin.unavailable]);

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
    [t.admin.avatarUpload, t.admin.enabled],
    [t.admin.feedbackEnabled, t.admin.enabled],
    [
      t.admin.supabaseConfigured,
      status ? (status.supabaseConfigured ? t.admin.yes : t.admin.no) : "-",
    ],
    [
      t.admin.geminiConfigured,
      status ? (status.geminiConfigured ? t.admin.yes : t.admin.no) : "-",
    ],
    [t.admin.publicPages, "/, /about, /privacy, /faq, /demo, /test, /feedback"],
    [
      t.admin.protectedRoutes,
      "/app, /quick, /guided, /history, /summary, /account",
    ],
    [t.admin.currentRole, role ? t.admin.roleLabels[role] : t.account.roleLoading],
  ] as const;

  return (
    <AdminShell
      title={t.admin.systemTitle}
      purpose={t.admin.systemPurpose}
      maxWidth="max-w-4xl"
    >
      {error && <StatusCard tone="error">{error}</StatusCard>}
      <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>
      <StatusCard tone="neutral">{t.admin.turnstileTodo}</StatusCard>

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
    </AdminShell>
  );
}

export default function AdminSystemPage() {
  return (
    <RequireAdmin>
      <SystemContent />
    </RequireAdmin>
  );
}
