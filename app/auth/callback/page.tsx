"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCard, PageShell } from "../../components/ui";
import { useLanguage } from "../../components/language-provider";
import { supabaseBrowser } from "../../lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    async function finishAuth() {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        await supabaseBrowser.auth.exchangeCodeForSession(code);
      }

      const next = window.localStorage.getItem("innerleaf_auth_next") || "/quick";
      window.localStorage.removeItem("innerleaf_auth_next");
      router.replace(next.startsWith("/") ? next : "/quick");
    }

    void finishAuth();
  }, [router]);

  return (
    <PageShell>
      <LoadingCard label={t.feedback.sending} />
    </PageShell>
  );
}
