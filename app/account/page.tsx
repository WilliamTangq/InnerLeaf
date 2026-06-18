"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-client";
import { AdminShell } from "../components/admin-shell";
import { Avatar } from "../components/avatar";
import { RequireAuth } from "../components/route-guards";
import { useAuth } from "../components/auth-provider";
import { useLanguage } from "../components/language-provider";
import { UserShell } from "../components/user-shell";
import {
  Badge,
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PrimaryButton,
  StatusCard,
} from "../components/ui";

const avatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxAvatarSize = 2 * 1024 * 1024;

function roleLabel(
  role: "user" | "tester" | "admin" | null,
  labels: Record<"user" | "tester" | "admin", string>
) {
  if (!role) {
    return "";
  }

  return labels[role] || role;
}

export function AccountContent({ shell = "user" }: { shell?: "user" | "admin" }) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    isAdmin,
    profile,
    profileLoading,
    refreshProfile,
    role,
    session,
    signOut,
    user,
  } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [avatarPath, setAvatarPath] = useState(profile?.avatar_path ?? null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [avatarStatus, setAvatarStatus] = useState<"idle" | "uploading" | "saved" | "error">("idle");
  const [avatarError, setAvatarError] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      router.push(`/login?next=${shell === "admin" ? "/admin/account" : "/dashboard/account"}`);
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
          avatar_path: avatarPath,
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

  async function saveAvatar(nextUrl: string | null, nextPath: string | null) {
    if (!session?.access_token) {
      router.push(`/login?next=${shell === "admin" ? "/admin/account" : "/dashboard/account"}`);
      return false;
    }

    const response = await fetch("/api/account/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        display_name: displayName,
        avatar_url: nextUrl,
        avatar_path: nextPath,
      }),
    });

    if (!response.ok) {
      throw new Error("Avatar update failed");
    }

    setAvatarUrl(nextUrl);
    setAvatarPath(nextPath);
    await refreshProfile();
    return true;
  }

  function safeFileName(name: string) {
    const extension = name.split(".").pop()?.toLowerCase() || "png";
    const base = name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    return `${Date.now()}-${base || "avatar"}.${extension}`;
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError("");

    if (!avatarTypes.has(file.type) || file.size > maxAvatarSize) {
      setAvatarError(t.account.avatarUploadError);
      setAvatarStatus("error");
      return;
    }

    if (!supabaseBrowser || !user) {
      setAvatarError(t.auth.supabaseUnavailable);
      setAvatarStatus("error");
      return;
    }

    const nextPath = `${user.id}/${safeFileName(file.name)}`;
    setAvatarStatus("uploading");

    try {
      const { error: uploadError } = await supabaseBrowser.storage
        .from("avatars")
        .upload(nextPath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabaseBrowser.storage
        .from("avatars")
        .getPublicUrl(nextPath);

      if (avatarPath) {
        await supabaseBrowser.storage.from("avatars").remove([avatarPath]);
      }

      await saveAvatar(data.publicUrl, nextPath);
      setAvatarStatus("saved");
    } catch (error) {
      console.error("Avatar upload error:", error);
      setAvatarError(t.account.avatarUploadFailed);
      setAvatarStatus("error");
    }
  }

  async function removeAvatar() {
    setAvatarError("");

    if (!supabaseBrowser) {
      setAvatarError(t.auth.supabaseUnavailable);
      setAvatarStatus("error");
      return;
    }

    setAvatarStatus("uploading");

    try {
      if (avatarPath) {
        await supabaseBrowser.storage.from("avatars").remove([avatarPath]);
      }

      await saveAvatar(null, null);
      setAvatarStatus("saved");
    } catch (error) {
      console.error("Avatar remove error:", error);
      setAvatarError(t.account.avatarUploadFailed);
      setAvatarStatus("error");
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
    if (!supabaseBrowser) {
      setPasswordError(t.auth.supabaseUnavailable);
      setPasswordStatus("error");
      return;
    }

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

  const content = (
    <>
      <PageHeader compact eyebrow={t.auth.account} title={t.account.settings}>
        {t.account.purpose}
      </PageHeader>

      {isAdmin && (
        <Card
          variant="elevated"
          className="mb-5 border-[rgba(31,155,143,0.18)] bg-[linear-gradient(135deg,rgba(255,255,248,0.98),rgba(232,246,241,0.72))] hover:translate-y-0"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="accent">{t.auth.admin}</Badge>
              <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                {t.account.adminAccount}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.account.adminAccountBody}
              </p>
            </div>
            <PageActions>
              <LinkButton href="/admin">{t.admin.overview}</LinkButton>
              <LinkButton href="/admin/users" variant="secondary">
                {t.admin.users}
              </LinkButton>
              <LinkButton href="/admin/feedback" variant="ghost">
                {t.admin.feedback}
              </LinkButton>
              <LinkButton href="/admin/system" variant="ghost">
                {t.admin.system}
              </LinkButton>
            </PageActions>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card variant="elevated" className="hover:translate-y-0">
          <form onSubmit={updateProfile} className="space-y-5">
            <div className="flex items-start gap-4">
              <Avatar
                avatarUrl={avatarUrl}
                displayName={displayName}
                email={user?.email}
                isAdmin={isAdmin}
                rounded="2xl"
                size="2xl"
              />
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {t.account.profile}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.account.privacy}
                </p>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {t.account.avatar}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-subtle)]">
                {t.account.avatarHint}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => void uploadAvatar(event)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarStatus === "uploading"}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {avatarUrl ? t.account.changePhoto : t.account.uploadPhoto}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => void removeAvatar()}
                    disabled={avatarStatus === "uploading"}
                    className="rounded-lg border border-[rgba(155,55,55,0.18)] bg-[rgba(155,55,55,0.04)] px-3 py-2 text-sm font-medium text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t.account.removePhoto}
                  </button>
                )}
              </div>
              {avatarStatus === "uploading" && (
                <p className="mt-3 text-sm text-[var(--foreground-subtle)]">
                  {t.account.uploadingPhoto}
                </p>
              )}
              {avatarStatus === "saved" && (
                <div className="mt-3">
                  <StatusCard tone="success">{t.account.avatarUpdated}</StatusCard>
                </div>
              )}
              {avatarStatus === "error" && avatarError && (
                <div className="mt-3">
                  <StatusCard tone="error">{avatarError}</StatusCard>
                </div>
              )}
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
                  {profileLoading ? t.account.roleLoading : roleLabel(role, t.admin.roleLabels)}
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
    </>
  );

  if (shell === "admin") {
    return (
      <AdminShell title={t.account.settings} purpose={t.account.adminAccountBody} maxWidth="max-w-4xl">
        {content}
      </AdminShell>
    );
  }

  return (
    <UserShell maxWidth="max-w-4xl">
      {content}
    </UserShell>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { isAdmin, loading, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/account")}`);
      return;
    }

    router.replace(isAdmin ? "/admin/account" : "/dashboard/account");
  }, [isAdmin, loading, router, user]);

  return (
    <RequireAuth>
      <StatusCard tone="neutral">{t.auth.loadingSession}</StatusCard>
    </RequireAuth>
  );
}
