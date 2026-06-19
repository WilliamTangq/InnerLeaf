"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { EmptyState, LinkButton, LoadingCard, PageShell } from "./ui";

function loginHref(pathname: string) {
  return `/login?next=${encodeURIComponent(pathname || "/dashboard")}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUnavailable, loading, profileLoading, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authUnavailable && !loading && !profileLoading && !user) {
      router.replace(loginHref(pathname));
    }
  }, [authUnavailable, loading, pathname, profileLoading, router, user]);

  if (authUnavailable) {
    return (
      <PageShell>
        <EmptyState
          title={t.auth.authUnavailableTitle}
          description={t.auth.authUnavailableBody}
          action={<LinkButton href="/">{t.nav.home}</LinkButton>}
        />
      </PageShell>
    );
  }

  if (loading || profileLoading) {
    return (
      <PageShell>
        <LoadingCard label={t.auth.loadingSession} />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          title={t.auth.continueTitle}
          description={t.auth.continueBody}
          action={<LinkButton href={loginHref(pathname)}>{t.nav.login}</LinkButton>}
        />
      </PageShell>
    );
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUnavailable, isAdmin, loading, profileLoading, role, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authUnavailable && !loading && !profileLoading && !user) {
      router.replace(loginHref(pathname));
    }
  }, [authUnavailable, loading, pathname, profileLoading, router, user]);

  if (authUnavailable) {
    return (
      <PageShell>
        <EmptyState
          title={t.auth.authUnavailableTitle}
          description={t.auth.authUnavailableBody}
          action={<LinkButton href="/">{t.nav.home}</LinkButton>}
        />
      </PageShell>
    );
  }

  if (loading || profileLoading) {
    return (
      <PageShell>
        <LoadingCard label={t.auth.loadingSession} />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          title={t.auth.continueTitle}
          description={t.auth.continueBody}
          action={<LinkButton href={loginHref(pathname)}>{t.nav.login}</LinkButton>}
        />
      </PageShell>
    );
  }

  if (!isAdmin || role !== "admin") {
    return (
      <PageShell>
        <EmptyState
          title={t.admin.accessTitle}
          description={t.admin.accessBody}
          action={<LinkButton href="/dashboard">{t.app.title}</LinkButton>}
        />
      </PageShell>
    );
  }

  return <>{children}</>;
}
