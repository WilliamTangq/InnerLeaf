"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  UsersRound,
  X,
} from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { Avatar } from "../../components/avatar";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import { Card, SectionLabel, StatusCard } from "../../components/ui";

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
const protectedAdminEmail = "admin@gmail.com";

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

function isProtectedUser(user: AdminUser, currentUserId?: string) {
  return (
    user.role === "admin" ||
    user.id === currentUserId ||
    user.email?.toLowerCase() === protectedAdminEmail
  );
}

function RoleBadge({
  role,
  labels,
}: {
  role: AdminUser["role"];
  labels: Record<AdminUser["role"], string>;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        role === "admin"
          ? "border-[rgba(55,112,99,0.24)] bg-[rgba(84,164,148,0.14)] text-[var(--brand-teal-deep)]"
          : role === "tester"
            ? "border-[rgba(177,154,70,0.28)] bg-[rgba(217,194,92,0.16)] text-[rgb(113,91,28)]"
            : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)]",
      ].join(" ")}
    >
      {labels[role]}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
}) {
  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {value}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(55,112,99,0.16)] bg-[rgba(84,164,148,0.12)] text-[var(--brand-teal-deep)]">
          <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
        </span>
      </div>
    </Card>
  );
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
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
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

  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.email?.toLowerCase().includes(query) ||
          item.display_name?.toLowerCase().includes(query);
        const matchesRole = roleFilter === "all" || item.role === roleFilter;

        return matchesSearch && matchesRole;
      }),
    [roleFilter, search, users]
  );

  const metrics = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((item) => item.role === "admin").length,
      testers: users.filter((item) => item.role === "tester").length,
      members: users.filter((item) => item.role === "user").length,
    }),
    [users]
  );

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

  function openDelete(user: AdminUser) {
    setDeleteTarget(user);
    setDeleteConfirmation("");
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

  async function deleteUser() {
    if (!session?.access_token || !deleteTarget) {
      return;
    }

    setUpdatingId(deleteTarget.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setUsers((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setMessage(t.admin.deleteSuccess);
    } catch {
      setError(t.admin.deleteError);
    } finally {
      setUpdatingId("");
    }
  }

  function renderActions(user: AdminUser, compact = false) {
    const protectedUser = isProtectedUser(user, currentUser?.id);

    return (
      <div
        className={[
          "flex flex-wrap gap-2",
          compact ? "justify-start" : "justify-end",
        ].join(" ")}
      >
        <Link
          href={`/admin/users/${user.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
        >
          <Eye aria-hidden="true" size={15} strokeWidth={1.8} />
          {t.admin.viewUser}
        </Link>
        <button
          type="button"
          onClick={() => openEdit(user)}
          disabled={updatingId === user.id}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil aria-hidden="true" size={15} strokeWidth={1.8} />
          {t.admin.editUser}
        </button>
        <button
          type="button"
          onClick={() => openDelete(user)}
          disabled={updatingId === user.id || protectedUser}
          title={protectedUser ? t.admin.protectedUserNote : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(155,55,55,0.18)] bg-[rgba(155,55,55,0.035)] px-3 py-2 text-sm font-semibold text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
          {t.admin.deleteUser}
        </button>
      </div>
    );
  }

  return (
    <AdminShell title={t.admin.usersTitle} purpose={t.admin.usersPurpose}>
      <div className="mb-5 space-y-3">
        <StatusCard tone="neutral">{t.admin.userManagementScope}</StatusCard>
        <StatusCard tone="neutral">{t.admin.privateNote}</StatusCard>
        {message && <StatusCard tone="success">{message}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label={t.admin.totalUsers} value={metrics.total} />
        <MetricCard icon={ShieldCheck} label={t.admin.totalAdmins} value={metrics.admins} />
        <MetricCard icon={UserRoundCog} label={t.admin.totalTesters} value={metrics.testers} />
        <MetricCard icon={UsersRound} label={t.admin.standardUsers} value={metrics.members} />
      </div>

      <Card className="mb-5 hover:translate-y-0">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">{t.admin.searchUsers}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]"
              size={18}
              strokeWidth={1.8}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.admin.searchUsers}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.admin.filterRole}</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            >
              <option value="all">{t.admin.filterAllRoles}</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {t.admin.roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card className="hover:translate-y-0">
          <div className="mx-auto max-w-md py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(55,112,99,0.16)] bg-[rgba(84,164,148,0.12)] text-[var(--brand-teal-deep)]">
              <UsersRound aria-hidden="true" size={22} strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
              {t.admin.noUsersTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {t.admin.noUsersBody}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] lg:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--surface-muted)]">
                <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                  <th className="px-5 py-4">{t.admin.account}</th>
                  <th className="px-5 py-4">{t.admin.role}</th>
                  <th className="px-5 py-4">{t.admin.activity}</th>
                  <th className="px-5 py-4">{t.admin.accountData}</th>
                  <th className="px-5 py-4 text-right">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[rgba(84,164,148,0.045)]"
                  >
                    <td className="px-5 py-4">
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
                          <p className="break-all text-sm font-semibold text-[var(--foreground)]">
                            {user.email || "-"}
                          </p>
                          <p className="mt-1 truncate text-sm text-[var(--foreground-muted)]">
                            {user.display_name || t.admin.noDisplayName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} labels={t.admin.roleLabels} />
                      {isProtectedUser(user, currentUser?.id) && (
                        <p className="mt-2 text-xs font-medium text-[var(--foreground-subtle)]">
                          {t.admin.protected}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {t.admin.created}: {formatDate(user.created_at)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {t.admin.lastSignIn}: {formatDate(user.last_sign_in_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {user.reflection_count} {t.admin.reflectionsShort}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {user.feedback_count} {t.admin.feedbackShort}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {renderActions(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:translate-y-0">
                <div className="flex items-start gap-3">
                  <Avatar
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    email={user.email}
                    isAdmin={user.role === "admin"}
                    rounded="xl"
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-semibold text-[var(--foreground)]">
                      {user.email || "-"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {user.display_name || t.admin.noDisplayName}
                    </p>
                    <div className="mt-3">
                      <RoleBadge role={user.role} labels={t.admin.roleLabels} />
                    </div>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.lastSignIn}
                    </dt>
                    <dd className="mt-1 text-[var(--foreground-muted)]">
                      {formatDate(user.last_sign_in_at)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {t.admin.reflectionCount}
                    </dt>
                    <dd className="mt-1 font-semibold text-[var(--foreground)]">
                      {user.reflection_count}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">{renderActions(user, true)}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(20,35,28,0.18)] px-4 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label={t.admin.cancel}
            className="absolute inset-0"
            onClick={() => setEditingUser(null)}
          />
          <Card
            className="relative max-h-[calc(100vh-32px)] w-full max-w-lg overflow-y-auto hover:translate-y-0"
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
                <SectionLabel>{t.admin.accountManagement}</SectionLabel>
                <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
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

      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(20,35,28,0.2)] px-4 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label={t.admin.cancel}
            className="absolute inset-0"
            onClick={() => setDeleteTarget(null)}
          />
          <Card
            className="relative w-full max-w-lg border-[rgba(155,55,55,0.22)] hover:translate-y-0"
            variant="elevated"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(155,55,55,0.2)] bg-[rgba(155,55,55,0.08)] text-[var(--error)]">
                <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {t.admin.deleteConfirmTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {t.admin.deleteConfirmBody}
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]">
                  {deleteTarget.email}
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
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                {t.admin.cancel}
              </button>
              <button
                type="button"
                onClick={() => void deleteUser()}
                disabled={
                  updatingId === deleteTarget.id ||
                  deleteConfirmation.trim().toLowerCase() !==
                    (deleteTarget.email ?? "").toLowerCase()
                }
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingId === deleteTarget.id
                  ? t.feedback.sending
                  : t.admin.deleteUser}
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
