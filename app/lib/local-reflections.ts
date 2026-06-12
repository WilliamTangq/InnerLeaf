"use client";

export const savedReflectionIdsKey = "innerleaf_saved_reflection_ids";

function normalizeId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  return "";
}

export function getSavedReflectionIds() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(savedReflectionIdsKey) || "[]"
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeId).filter(Boolean);
  } catch {
    return [];
  }
}

export function rememberSavedReflectionId(id: unknown) {
  const normalized = normalizeId(id);

  if (!normalized) {
    return;
  }

  const ids = getSavedReflectionIds();
  const next = [normalized, ...ids.filter((item) => item !== normalized)].slice(
    0,
    50
  );

  localStorage.setItem(savedReflectionIdsKey, JSON.stringify(next));
}
