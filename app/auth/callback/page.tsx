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

  const { data } = await supabaseBrowser
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data?.role && sessionData.session?.access_token) {
    await fetch("/api/account/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({
        display_name: user.email?.split("@")[0] || "InnerLeaf user",
        avatar_url: null,
        avatar_path: null,
      }),
    });

    const { data: repairedProfile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return repairedProfile?.role === "admin" ? "admin" : "user";
  }

  return data?.role === "admin" ? "admin" : "user";
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
