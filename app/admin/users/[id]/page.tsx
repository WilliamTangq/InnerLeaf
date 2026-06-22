"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "../../../components/avatar";
import { AdminShell } from "../../../components/admin-shell";
import { RequireAdmin } from "../../../components/route-guards";
import { useAuth } from "../../../components/auth-provider";
import { useLanguage } from "../../../components/language-provider";
import { Badge, Card, PrimaryButton, StatusCard } from "../../../components/ui";
import { adminUserEditSchema } from "../../../lib/validation";

type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  role: "user" | "tester" | "admin";
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  reflection_count: number;
  feedback_count: number;
  last_reflection_at: string | null;
  last_feedback_at: string | null;
};

const roles = ["user", "tester", "admin"] as const;

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UserDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("user");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!session?.access_token || !params.id) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/users/${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "User unavailable");
        }

        setUser(data.user);
        setDisplayName(data.user.display_name ?? "");
        setRole(data.user.role);
      } catch {
        setError(t.admin.unavailable);
      }
    }

    void loadUser();
  }, [params.id, session?.access_token, t.admin.unavailable]);

  async function saveUser() {
    if (!session?.access_token || !user) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const parsed = adminUserEditSchema.parse({
        display_name: displayName,
        role,
      });
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          display_name: parsed.display_name ?? "",
          role: parsed.role,
          avatar_url: removeAvatar ? "" : user.avatar_url ?? "",
          avatar_path: removeAvatar ? "" : user.avatar_path ?? "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setUser({
        ...user,
        display_name: parsed.display_name ?? "",
        role: parsed.role,
        avatar_url: removeAvatar ? null : user.avatar_url,
        avatar_path: removeAvatar ? null : user.avatar_path,
      });
      setRemoveAvatar(false);
      setMessage(t.admin.userUpdated);
      toast.success(t.admin.userUpdated);
    } catch {
      setError(t.admin.unavailable);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!session?.access_token || !user) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      router.push("/admin/users");
      router.refresh();
      toast.success(t.admin.deleteSuccess);
    } catch {
      setError(t.admin.deleteError);
      setSaving(false);
    }
  }

  const deleteDisabled =
    !user ||
    user.role === "admin" ||
    user.id === currentUser?.id ||
    user.email?.toLowerCase() === "admin@gmail.com";

  return (
    <AdminShell title={t.admin.userDetailTitle} purpose={t.admin.userDetailPurpose}>
      <Link
        href="/admin/users"
        className="mb-5 inline-flex text-sm font-semibold text-[var(--brand-teal-deep)] hover:underline"
      >
        {t.admin.backUsers}
      </Link>

      {error && <StatusCard tone="error">{error}</StatusCard>}
      {message && <StatusCard tone="success">{message}</StatusCard>}

      {user && (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card variant="elevated" className="hover:translate-y-0">
            <div className="flex items-start gap-4">
              <Avatar
                avatarUrl={removeAvatar ? null : user.avatar_url}
                displayName={displayName}
                email={user.email}
                isAdmin={role === "admin"}
                rounded="2xl"
                size="2xl"
              />
              <div className="min-w-0">
                <p className="break-all text-lg font-semibold text-[var(--foreground)]">
                  {user.email}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  {user.display_name || "-"}
                </p>
                <Badge variant={user.role === "admin" ? "accent" : "outline"}>
                  {t.admin.roleLabels[user.role]}
                </Badge>
                {deleteDisabled && (
                  <p className="mt-3 text-xs font-medium text-[var(--foreground-subtle)]">
                    {t.admin.protectedUserNote}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-6 grid gap-3">
              {[
                [t.admin.created, formatDate(user.created_at)],
                [t.admin.lastSignIn, formatDate(user.last_sign_in_at)],
                [t.admin.emailConfirmed, formatDate(user.email_confirmed_at)],
                [t.admin.avatarStatus, user.avatar_url ? t.admin.enabled : t.admin.no],
                [
                  t.admin.accountSafety,
                  deleteDisabled ? t.admin.protected : t.admin.manageable,
                ],
                [t.admin.reflectionCount, String(user.reflection_count)],
                [t.admin.feedbackCount, String(user.feedback_count)],
                [t.admin.lastReflection, formatDate(user.last_reflection_at)],
                [t.admin.lastFeedback, formatDate(user.last_feedback_at)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="hover:translate-y-0">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.admin.displayName}
                </span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.admin.role}
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as AdminUser["role"])}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {t.admin.roleLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
              {user.avatar_url && (
                <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--foreground-muted)]">
                  <input
                    type="checkbox"
                    checked={removeAvatar}
                    onChange={(event) => setRemoveAvatar(event.target.checked)}
                    className="h-4 w-4 accent-[var(--brand-teal)]"
                  />
                  {t.admin.removeAvatar}
                </label>
              )}
              <PrimaryButton type="button" onClick={() => void saveUser()} disabled={saving}>
                {saving ? t.feedback.sending : t.admin.saveChanges}
              </PrimaryButton>
            </div>

            <div className="mt-8 border-t border-[var(--border)] pt-5">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {t.admin.deleteUser}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {t.admin.deleteDisabled}
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setDeleteConfirmation("");
                }}
                disabled={saving || deleteDisabled}
                className="mt-4 rounded-lg border border-[rgba(155,55,55,0.18)] bg-[rgba(155,55,55,0.04)] px-4 py-2 text-sm font-semibold text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.admin.deleteUser}
              </button>
            </div>
          </Card>
        </div>
      )}

      {user && confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(20,35,28,0.2)] px-4 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label={t.admin.cancel}
            className="absolute inset-0"
            onClick={() => setConfirmDelete(false)}
          />
          <Card
            className="relative w-full max-w-lg border-[rgba(155,55,55,0.22)] hover:translate-y-0"
            variant="elevated"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(155,55,55,0.2)] bg-[rgba(155,55,55,0.08)] text-[var(--error)]">
                <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {t.admin.deleteConfirmTitle}
                  </h2>
                  <button
                    type="button"
                    aria-label={t.admin.cancel}
                    onClick={() => setConfirmDelete(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    <X aria-hidden="true" size={16} strokeWidth={1.8} />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.admin.deleteConfirmBody}
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]">
                  {user.email}
                </p>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {t.admin.deleteConfirmInput}
              </span>
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--error)] focus:ring-4 focus:ring-[rgba(155,55,55,0.12)]"
              />
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                {t.admin.cancel}
              </button>
              <button
                type="button"
                onClick={() => void deleteUser()}
                disabled={
                  saving ||
                  deleteConfirmation.trim().toLowerCase() !==
                    (user.email ?? "").toLowerCase()
                }
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? t.feedback.sending : t.admin.deleteUser}
              </button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminUserDetailPage() {
  return (
    <RequireAdmin>
      <UserDetailContent />
    </RequireAdmin>
  );
}
