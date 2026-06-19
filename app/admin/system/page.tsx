"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../../components/admin-shell";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import { Card, PrimaryButton, StatusCard } from "../../components/ui";

type SystemStatus = {
  supabaseConfigured: boolean;
  geminiConfigured: boolean;
};

type SiteSettings = {
  app_name: string;
  tagline: string;
  logo_url: string;
};

function SystemContent() {
  const { role, session } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    app_name: "InnerLeaf",
    tagline: "Reflect with clarity",
    logo_url: "/logo.png",
  });
  const [error, setError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

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

        const settingsResponse = await fetch("/api/admin/site-settings", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const settingsData = await settingsResponse.json();

        if (settingsResponse.ok) {
          setSiteSettings({
            app_name: settingsData.app_name || "InnerLeaf",
            tagline: settingsData.tagline || "Reflect with clarity",
            logo_url: settingsData.logo_url || "/logo.png",
          });
        }
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadSystem();
  }, [session?.access_token, t.admin.unavailable]);

  async function saveSiteSettings() {
    if (!session?.access_token) {
      return;
    }

    setSettingsSaving(true);
    setSettingsMessage("");
    setSettingsError("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Site settings failed");
      }

      setSiteSettings({
        app_name: data.app_name || "InnerLeaf",
        tagline: data.tagline || "Reflect with clarity",
        logo_url: data.logo_url || "/logo.png",
      });
      setSettingsMessage(t.admin.siteSettingsSaved);
    } catch {
      setSettingsError(t.admin.siteSettingsUnavailable);
    } finally {
      setSettingsSaving(false);
    }
  }

  const items = [
    [t.admin.appName, "InnerLeaf"],
    [t.admin.environment, process.env.NODE_ENV || "development"],
    [t.admin.appVersion, "MVP"],
    [t.admin.authMode, "Email/password"],
    [t.admin.googleLogin, t.admin.disabled],
    [t.admin.reflectionAccess, t.admin.loginRequired],
    [t.admin.demoMode, t.admin.staticDemoData],
    [t.admin.historyPrivacy, t.admin.userSpecificHistory],
    [t.admin.summaryPrivacy, t.admin.userSpecificHistory],
    [t.admin.adminApisProtected, t.admin.yes],
    [t.admin.availableRoles, "user, tester, admin"],
    [t.admin.avatarUpload, t.admin.enabled],
    [t.admin.storageBucket, "avatars"],
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
      "/dashboard, /dashboard/quick, /dashboard/guided, /dashboard/history, /dashboard/summary, /dashboard/account, /admin",
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

      <Card className="mt-5 hover:translate-y-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.admin.siteSettings}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
              {t.admin.siteSettingsPurpose}
            </p>
          </div>
          <span className="rounded-full border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-teal-deep)]">
            {t.admin.superHost}
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t.admin.appDisplayName}
            </span>
            <input
              value={siteSettings.app_name}
              onChange={(event) =>
                setSiteSettings((current) => ({
                  ...current,
                  app_name: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t.admin.appTagline}
            </span>
            <input
              value={siteSettings.tagline}
              onChange={(event) =>
                setSiteSettings((current) => ({
                  ...current,
                  tagline: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t.admin.logoUrl}
            </span>
            <input
              value={siteSettings.logo_url}
              onChange={(event) =>
                setSiteSettings((current) => ({
                  ...current,
                  logo_url: event.target.value,
                }))
              }
              placeholder="/logo.png"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
            <p className="mt-2 text-xs leading-5 text-[var(--foreground-subtle)]">
              {t.admin.siteSettingsNote}
            </p>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PrimaryButton
            type="button"
            onClick={() => void saveSiteSettings()}
            disabled={settingsSaving}
          >
            {settingsSaving ? t.reflectionCard.saving : t.admin.saveSiteSettings}
          </PrimaryButton>
          {settingsMessage && (
            <span className="text-sm font-medium text-[var(--brand-teal-deep)]">
              {settingsMessage}
            </span>
          )}
          {settingsError && (
            <span className="text-sm font-medium text-[var(--error)]">
              {settingsError}
            </span>
          )}
        </div>
      </Card>

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
