"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useLanguage } from "./language-provider";
import { type AnalyticsEventName, trackEvent } from "../lib/analytics";

export function AnalyticsPageView({
  event,
  properties,
}: {
  event: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null | undefined>;
}) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { role, user } = useAuth();

  useEffect(() => {
    trackEvent(event, {
      pathname,
      locale: language,
      authenticated_state: Boolean(user),
      role_bucket: role ?? "logged_out",
      ...properties,
    });
  }, [event, language, pathname, properties, role, user]);

  return null;
}
