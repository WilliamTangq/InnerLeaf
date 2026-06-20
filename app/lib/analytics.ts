"use client";

import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEventName =
  | "landing_page_viewed"
  | "hero_create_account_clicked"
  | "hero_view_demo_clicked"
  | "hero_help_test_clicked"
  | "header_dashboard_clicked"
  | "header_login_clicked"
  | "header_get_started_clicked"
  | "demo_viewed"
  | "test_page_viewed"
  | "feedback_page_viewed"
  | "pricing_viewed"
  | "register_started"
  | "register_completed"
  | "login_started"
  | "login_completed"
  | "logout_clicked"
  | "quick_reflection_started"
  | "guided_reflection_started"
  | "reflection_generated"
  | "reflection_saved"
  | "history_viewed"
  | "reflection_detail_opened"
  | "summary_viewed"
  | "check_in_opened"
  | "check_in_completed"
  | "feedback_prompt_clicked"
  | "feedback_submitted";

type SafeAnalyticsValue = string | number | boolean | null | undefined;
type SafeAnalyticsProperties = Record<string, SafeAnalyticsValue>;

const blockedPropertyPattern =
  /(email|password|token|secret|input|output|text|content|note|ai_result|user_input|reflection_text|reflection_output|check_in)/i;

function sanitizeProperties(properties?: SafeAnalyticsProperties) {
  const safe: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(properties ?? {})) {
    if (blockedPropertyPattern.test(key)) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      safe[key] = value.slice(0, 120);
      continue;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safe[key] = value;
    }
  }

  return safe;
}

export function trackEvent(
  name: AnalyticsEventName,
  properties?: SafeAnalyticsProperties
) {
  if (typeof window === "undefined") {
    return;
  }

  const safeProperties = sanitizeProperties({
    pathname: window.location.pathname,
    ...properties,
  });

  try {
    vercelTrack(name, safeProperties);
  } catch {
    // Analytics must never affect the product experience.
  }
}
