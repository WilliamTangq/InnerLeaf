"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { Avatar } from "../../components/avatar";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Badge,
  Card,
  StatusCard,
} from "../../components/ui";

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

function AdminUsersContent() {
  const { session, user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editRole, setEditRole] = useState<AdminUser["role"]>("user");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let mounted = true;

    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Users unavailable");
        }

        if (mounted) {
          setUsers(data.users || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setError(t.admin.unavailable);
        }
      });

    return () => {
      mounted = false;
    };
  }, [session?.access_token, t.admin.unavailable]);

  async function updateUser(
    userId: string,
    updates: Partial<
      Pick<AdminUser, "role" | "display_name" | "avatar_url" | "avatar_path">
    >
  ) {
    if (!session?.access_token) {
      return;
    }

    setUpdatingId(userId);
    setError("");
    setMessage("");

    try {
      const current = users.find((item) => item.id === userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: updates.role ?? current?.role ?? "user",
          display_name: updates.display_name ?? current?.display_name ?? "",
          avatar_url:
            "avatar_url" in updates
              ? updates.avatar_url
              : current?.avatar_url ?? "",
          avatar_path:
            "avatar_path" in updates
              ? updates.avatar_path
              : current?.avatar_path ?? "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Role update failed");
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === userId ? { ...item, ...updates } : item
        )
      );
      setMessage(t.admin.userUpdated);
    } catch {
      setError(t.admin.unavailable);
    } finally {
      setUpdatingId("");
    }
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setEditDisplayName(user.display_name ?? "");
    setEditRole(user.role);
    setRemoveAvatar(false);
    setError("");
    setMessage("");
  }

  async function saveEdit() {
    if (!editingUser) {
      return;
    }

    await updateUser(editingUser.id, {
      display_name: editDisplayName,
      role: editRole,
      avatar_url: removeAvatar ? null : editingUser.avatar_url,
      avatar_path: removeAvatar ? null : editingUser.avatar_path,
    });
    setEditingUser(null);
  }

  async function deleteUser(userId: string) {
    if (!session?.access_token || !window.confirm(t.admin.deleteConfirm)) {
      return;
    }

    setUpdatingId(userId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setUsers((current) => current.filter((item) => item.id !== userId));
      setMessage(t.admin.deleteSuccess);
    } catch {
      setError(t.admin.deleteError);
    } finally {
      setUpdatingId("");
    }
  }

  const filteredUsers = users.filter((item) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.email?.toLowerCase().includes(query) ||
      item.display_name?.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || item.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <AdminShell title={t.admin.usersTitle} purpose={t.admin.usersPurpose}>
      <div className="mb-5 space-y-3">
        <StatusCard tone="neutral">{t.admin.userManagementScope}</StatusCard>
        <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>
        {message && <StatusCard tone="success">{message}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.admin.search}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        >
          <option value="all">{t.admin.filterAll}</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {t.admin.roleLabels[role]}
            </option>
          ))}
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <StatusCard tone="neutral">{t.admin.noUsers}</StatusCard>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:translate-y-0">
              <div className="grid gap-4 lg:grid-cols-[1.45fr_0.7fr_0.85fr_0.75fr_0.75fr_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    email={user.email}
                    isAdmin={user.role === "admin"}
                    rounded="xl"
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.email}
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[var(--foreground)]">
                      {user.email || "-"}
                    </p>
                    {user.display_name && (
                      <p className="mt-1 truncate text-sm text-[var(--foreground-muted)]">
                        {user.display_name}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.role}
                  </p>
                  <Badge variant={user.role === "admin" ? "accent" : "outline"}>
                    {t.admin.roleLabels[user.role]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.created}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.activity}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {t.admin.lastSignIn}: {formatDate(user.last_sign_in_at)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {t.admin.lastReflection}: {formatDate(user.last_reflection_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.reflectionCount}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {user.reflection_count}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.feedbackCount}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {user.feedback_count}
                  </p>
                </div>
                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    disabled={updatingId === user.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    {t.admin.editUser}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteUser(user.id)}
                    disabled={
                      updatingId === user.id ||
                      user.role === "admin" ||
                      user.id === currentUser?.id ||
                      user.email?.toLowerCase() === "admin@gmail.com"
                    }
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.admin.deleteUser}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(20,35,28,0.16)] px-4 backdrop-blur-sm">
          <Card
            className="w-full max-w-lg hover:translate-y-0"
            variant="elevated"
          >
            <div className="mb-5 flex items-start gap-4">
              <Avatar
                avatarUrl={removeAvatar ? null : editingUser.avatar_url}
                displayName={editDisplayName}
                email={editingUser.email}
                isAdmin={editRole === "admin"}
                rounded="2xl"
                size="xl"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {t.admin.editUser}
                </h2>
                <p className="mt-1 break-all text-sm text-[var(--foreground-muted)]">
                  {editingUser.email}
                </p>
              </div>
              <button
                type="button"
                aria-label={t.admin.cancel}
                onClick={() => setEditingUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                <X aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.admin.displayName}
                </span>
                <input
                  value={editDisplayName}
                  onChange={(event) => setEditDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {t.admin.role}
                </span>
                <select
                  value={editRole}
                  onChange={(event) =>
                    setEditRole(event.target.value as AdminUser["role"])
                  }
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {t.admin.roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>

              {editingUser.avatar_url && (
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

              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t.admin.accountActivity}
                </p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.created}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {formatDate(editingUser.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.lastSignIn}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {formatDate(editingUser.last_sign_in_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.emailConfirmed}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {formatDate(editingUser.email_confirmed_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.lastFeedback}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {formatDate(editingUser.last_feedback_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                {t.admin.cancel}
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={updatingId === editingUser.id}
                className="rounded-lg bg-[var(--brand-teal)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-teal-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingId === editingUser.id
                  ? t.feedback.sending
                  : t.admin.saveChanges}
              </button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <AdminUsersContent />
    </RequireAdmin>
  );
}
