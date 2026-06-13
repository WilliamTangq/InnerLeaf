"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { EmptyState, LinkButton, LoadingCard, PageShell } from "./ui";

function loginHref(pathname: string) {
  return `/login?next=${encodeURIComponent(pathname || "/app")}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginHref(pathname));
    }
  }, [loading, pathname, router, user]);

  if (loading) {
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
  const { isAdmin, loading, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginHref(pathname));
    }
  }, [loading, pathname, router, user]);

  if (loading) {
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

  if (!isAdmin) {
    return (
      <PageShell>
        <EmptyState
          title={t.admin.accessTitle}
          description={t.admin.accessBody}
          action={<LinkButton href="/app">{t.app.title}</LinkButton>}
        />
      </PageShell>
    );
  }

  return <>{children}</>;
}
