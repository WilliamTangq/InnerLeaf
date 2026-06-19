"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth-provider";
import { LoadingCard, PageShell } from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { getDefaultRouteForRole } from "../lib/routes";

export default function LegacyAppPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loading, profileLoading, role, user } = useAuth();

  useEffect(() => {
    if (loading || profileLoading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/app")}`);
      return;
    }

    router.replace(getDefaultRouteForRole(role));
  }, [loading, profileLoading, role, router, user]);

  return (
    <PageShell>
      <LoadingCard label={t.auth.loadingSession} />
    </PageShell>
  );
}
