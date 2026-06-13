"use client";

import type { StructuredReflectionResult } from "../components/reflection-result";
import type { Language } from "./i18n";

export const pendingReflectionKey = "innerleaf_pending_reflection";

export type PendingReflection = {
  input: string;
  result: string;
  structured: StructuredReflectionResult;
  mode: "quick" | "guided";
  language: Language;
};

export function storePendingReflection(reflection: PendingReflection) {
  window.sessionStorage.setItem(pendingReflectionKey, JSON.stringify(reflection));
}

export function consumePendingReflection(mode: "quick" | "guided") {
  const raw = window.sessionStorage.getItem(pendingReflectionKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingReflection;

    if (parsed.mode !== mode || !parsed.result) {
      return null;
    }

    window.sessionStorage.removeItem(pendingReflectionKey);
    return parsed;
  } catch {
    window.sessionStorage.removeItem(pendingReflectionKey);
    return null;
  }
}
