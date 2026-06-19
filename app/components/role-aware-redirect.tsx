"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { LoadingCard, PageShell } from "./ui";
import { resolveRoleAwareNextPath } from "../lib/routes";

export function RoleAwareRedirect({ target }: { target?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { loading, profileLoading, role, user } = useAuth();
  const next = target || pathname || "/dashboard";

  useEffect(() => {
    if (loading || profileLoading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    router.replace(resolveRoleAwareNextPath(next, role));
  }, [loading, next, profileLoading, role, router, user]);

  return (
    <PageShell>
      <LoadingCard label={t.auth.loadingSession} />
    </PageShell>
  );
}
