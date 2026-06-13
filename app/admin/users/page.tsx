"use client";

import { useEffect, useState } from "react";
import { RequireAdmin } from "../../components/route-guards";
import { useAuth } from "../../components/auth-provider";
import { useLanguage } from "../../components/language-provider";
import {
  Badge,
  Card,
  LinkButton,
  PageActions,
  PageHeader,
  PageShell,
  StatusCard,
} from "../../components/ui";

type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "tester" | "admin";
  created_at: string | null;
  reflection_count: number;
  feedback_count: number;
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
    updates: Partial<Pick<AdminUser, "role" | "display_name" | "avatar_url">>
  ) {
    if (!session?.access_token) {
      return;
    }

    setUpdatingId(userId);
    setError("");
    setMessage("");

    try {
      const current = users.find((item) => item.id === userId);
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          role: updates.role ?? current?.role ?? "user",
          display_name: updates.display_name ?? current?.display_name ?? "",
          avatar_url: updates.avatar_url ?? current?.avatar_url ?? "",
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

  async function deleteUser(userId: string) {
    if (!session?.access_token || !window.confirm(t.admin.deleteConfirm)) {
      return;
    }

    setUpdatingId(userId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
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
    <PageShell maxWidth="max-w-6xl">
      <PageHeader compact eyebrow={t.admin.title} title={t.admin.usersTitle}>
        {t.admin.usersPurpose}
      </PageHeader>

      <PageActions>
        <LinkButton href="/admin">{t.admin.overview}</LinkButton>
        <LinkButton href="/admin/feedback" variant="secondary">
          {t.admin.feedback}
        </LinkButton>
        <LinkButton href="/admin/system" variant="ghost">
          {t.admin.system}
        </LinkButton>
      </PageActions>

      <div className="mb-5 space-y-3">
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
              <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_0.7fr_0.7fr_0.7fr_1fr] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--brand-teal-deep)]">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (user.display_name || user.email || "IL").slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.email}
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[var(--foreground)]">
                    {user.email || "-"}
                  </p>
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.displayName}
                  </span>
                  <input
                    value={user.display_name ?? ""}
                    onChange={(event) =>
                      setUsers((current) =>
                        current.map((item) =>
                          item.id === user.id
                            ? { ...item, display_name: event.target.value }
                            : item
                        )
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                  />
                </label>
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
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.changeRole}
                  </span>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      void updateUser(user.id, {
                        role: event.target.value as AdminUser["role"],
                      })
                    }
                    disabled={updatingId === user.id}
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2 lg:col-span-6">
                  <button
                    type="button"
                    onClick={() =>
                      void updateUser(user.id, {
                        display_name: user.display_name,
                        avatar_url: user.avatar_url,
                      })
                    }
                    disabled={updatingId === user.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    {t.admin.updateUser}
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
    </PageShell>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <AdminUsersContent />
    </RequireAdmin>
  );
}
