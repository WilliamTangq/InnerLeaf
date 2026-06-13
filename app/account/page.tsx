"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-client";
import { RequireAuth } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import {
  Badge,
  Card,
  PageHeader,
  PageShell,
  PrimaryButton,
  StatusCard,
} from "../components/ui";

function initials(name?: string | null, email?: string | null) {
  const value = name || email?.split("@")[0] || "InnerLeaf";
  return value
    .split(/\s|[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleLabel(
  role: "user" | "tester" | "admin",
  labels: Record<"user" | "tester" | "admin", string>
) {
  return labels[role] || role;
}

function AccountContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAdmin, profile, refreshProfile, role, session, signOut, user } =
    useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token) {
      router.push("/login?next=/account");
      return;
    }

    setProfileStatus("saving");

    try {
      const response = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      await refreshProfile();
      setProfileStatus("saved");
    } catch {
      setProfileStatus("error");
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError(t.auth.passwordsMismatch);
      setPasswordStatus("error");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t.auth.passwordLength);
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("saving");
    const { error } = await supabaseBrowser.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      setPasswordStatus("error");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus("saved");
  }

  async function logOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader compact eyebrow={t.auth.account} title={t.account.settings}>
        {t.account.purpose}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card variant="elevated" className="hover:translate-y-0">
          <form onSubmit={updateProfile} className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent-soft)] text-lg font-semibold text-[var(--brand-teal-deep)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(displayName, user?.email)
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {t.account.profile}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.account.privacy}
                </p>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {t.account.displayName}
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t.account.displayNamePlaceholder}
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {t.account.avatarUrl}
              </span>
              <input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder={t.account.avatarPlaceholder}
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
              />
            </label>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {t.account.email}
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-[var(--foreground)]">
                  {user?.email || profile?.email}
                </dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                  {t.account.role}
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                  {roleLabel(role, t.admin.roleLabels)}
                  {isAdmin && <Badge variant="accent">{t.auth.admin}</Badge>}
                </dd>
              </div>
              {createdAt && (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.account.created}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {createdAt}
                  </dd>
                </div>
              )}
            </dl>

            {profileStatus === "saved" && (
              <StatusCard tone="success">{t.account.profileUpdated}</StatusCard>
            )}
            {profileStatus === "error" && (
              <StatusCard tone="error">{t.account.profileError}</StatusCard>
            )}
            <PrimaryButton type="submit" disabled={profileStatus === "saving"}>
              {profileStatus === "saving" ? t.feedback.sending : t.account.updateProfile}
            </PrimaryButton>
          </form>
        </Card>

        <div className="space-y-5">
          <Card className="hover:translate-y-0">
            <form onSubmit={updatePassword} className="space-y-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {t.account.password}
              </h2>
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.account.newPassword}
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.account.confirmNewPassword}
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                />
              </label>
              {passwordStatus === "saved" && (
                <StatusCard tone="success">{t.account.passwordUpdated}</StatusCard>
              )}
              {passwordStatus === "error" && passwordError && (
                <StatusCard tone="error">{passwordError}</StatusCard>
              )}
              <PrimaryButton type="submit" disabled={passwordStatus === "saving"}>
                {passwordStatus === "saving" ? t.feedback.sending : t.account.updatePassword}
              </PrimaryButton>
            </form>
          </Card>

          <Card className="hover:translate-y-0">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.account.logout}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.app.privacy}
            </p>
            <PrimaryButton type="button" onClick={() => void logOut()} className="mt-4">
              {t.account.logout}
            </PrimaryButton>
          </Card>
        </div>
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
