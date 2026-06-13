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
  const { session } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

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

  async function updateRole(userId: string, role: string) {
    if (!session?.access_token) {
      return;
    }

    setUpdatingId(userId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Role update failed");
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === userId ? { ...item, role: role as AdminUser["role"] } : item
        )
      );
      setMessage(t.admin.roleUpdated);
    } catch {
      setError(t.admin.unavailable);
    } finally {
      setUpdatingId("");
    }
  }

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
      </PageActions>

      <div className="mb-5 space-y-3">
        <StatusCard tone="neutral">{t.admin.deleteDisabled}</StatusCard>
        {message && <StatusCard tone="success">{message}</StatusCard>}
        {error && <StatusCard tone="error">{error}</StatusCard>}
      </div>

      {users.length === 0 ? (
        <StatusCard tone="neutral">{t.admin.noUsers}</StatusCard>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:translate-y-0">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr_0.7fr_1fr] lg:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.email}
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[var(--foreground)]">
                    {user.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                    {t.admin.role}
                  </p>
                  <Badge variant={user.role === "admin" ? "accent" : "outline"}>
                    {user.role}
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
                    onChange={(event) => void updateRole(user.id, event.target.value)}
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
