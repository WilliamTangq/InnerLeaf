"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCard, PageShell } from "../../components/ui";
import { useLanguage } from "../../components/language-provider";
import { supabaseBrowser } from "../../lib/supabase-client";

const userNextPaths = [
  "/dashboard",
  "/dashboard/quick",
  "/dashboard/guided",
  "/dashboard/history",
  "/dashboard/summary",
  "/dashboard/account",
];

function normalizeNextPath(value: string | null, isAdmin: boolean) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  const legacyPaths: Record<string, string> = {
    "/app": "/dashboard",
    "/quick": "/dashboard/quick",
    "/guided": "/dashboard/guided",
    "/history": "/dashboard/history",
    "/summary": "/dashboard/summary",
    "/account": isAdmin ? "/admin/account" : "/dashboard/account",
  };
  const normalized = legacyPaths[value] ?? value;

  if (
    userNextPaths.some(
      (path) => normalized === path || normalized.startsWith(`${path}/`)
    )
  ) {
    return normalized;
  }

  if (isAdmin && (normalized === "/admin" || normalized.startsWith("/admin/"))) {
    return normalized;
  }

  return null;
}

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

      const role = await currentRole();
      const isAdmin = role === "admin";
      const next = window.localStorage.getItem("innerleaf_auth_next");
      window.localStorage.removeItem("innerleaf_auth_next");
      router.replace(normalizeNextPath(next, isAdmin) ?? (isAdmin ? "/admin" : "/dashboard"));
    }

    void finishAuth();
  }, [router]);

  return (
    <PageShell>
      <LoadingCard label={t.feedback.sending} />
    </PageShell>
  );
}
