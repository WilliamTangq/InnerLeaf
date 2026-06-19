"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCard, PageShell } from "../../components/ui";
import { useLanguage } from "../../components/language-provider";
import { supabaseBrowser } from "../../lib/supabase-client";
import { normalizeRole, resolveRoleAwareNextPath } from "../../lib/routes";

async function currentRole() {
  if (!supabaseBrowser) {
    return "user";
  }

  const { data: sessionData } = await supabaseBrowser.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return "user";
  }

  const response = await fetch("/api/account/profile", {
    headers: {
      Authorization: `Bearer ${sessionData.session?.access_token}`,
    },
  });

  if (!response.ok) {
    return "user";
  }

  const data = (await response.json()) as {
    profile?: { role?: string | null };
  };

  if (
    data.profile?.role === "admin" ||
    data.profile?.role === "tester" ||
    data.profile?.role === "user"
  ) {
    return data.profile.role;
  }

  return "user";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    async function finishAuth() {
      if (!supabaseBrowser) {
        router.replace("/login");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        await supabaseBrowser.auth.exchangeCodeForSession(code);
      }

      const role = normalizeRole(await currentRole());
      const next = window.localStorage.getItem("innerleaf_auth_next");
      window.localStorage.removeItem("innerleaf_auth_next");
      router.replace(resolveRoleAwareNextPath(next, role));
    }

    void finishAuth();
  }, [router]);

  return (
    <PageShell>
      <LoadingCard label={t.feedback.sending} />
    </PageShell>
  );
}
