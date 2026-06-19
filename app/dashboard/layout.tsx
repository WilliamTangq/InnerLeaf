"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../components/auth-provider";
import { RequireAuth } from "../components/route-guards";
import { UserShell } from "../components/user-shell";
import { LoadingCard } from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { resolveRoleAwareNextPath } from "../lib/routes";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isAdmin, loading, profileLoading } = useAuth();

  useEffect(() => {
    if (!loading && !profileLoading && isAdmin) {
      router.replace(resolveRoleAwareNextPath(pathname, "admin"));
    }
  }, [isAdmin, loading, pathname, profileLoading, router]);

  if (loading || profileLoading || isAdmin) {
    return (
      <div className="page-glow min-h-screen px-5 py-10 text-[var(--foreground)] sm:px-8">
        <LoadingCard label={t.auth.loadingSession} />
      </div>
    );
  }

  return (
    <RequireAuth>
      <UserShell>{children}</UserShell>
    </RequireAuth>
  );
}
