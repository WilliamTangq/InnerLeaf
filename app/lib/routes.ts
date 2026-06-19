export type AppRole = "user" | "tester" | "admin" | null | undefined;

const userDashboardRoutes = [
  "/dashboard",
  "/dashboard/quick",
  "/dashboard/guided",
  "/dashboard/history",
  "/dashboard/summary",
  "/dashboard/account",
];

const legacyRoutes: Record<string, string> = {
  "/quick": "/dashboard/quick",
  "/guided": "/dashboard/guided",
  "/history": "/dashboard/history",
  "/summary": "/dashboard/summary",
};

export function getDefaultRouteForRole(role: AppRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function normalizeRole(value: unknown): Exclude<AppRole, null | undefined> {
  return value === "admin" || value === "tester" ? value : "user";
}

export function resolveRoleAwareNextPath(value: string | null, role: AppRole) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return getDefaultRouteForRole(role);
  }

  if (value === "/app") {
    return getDefaultRouteForRole(role);
  }

  if (value === "/account") {
    return role === "admin" ? "/admin/account" : "/dashboard/account";
  }

  const normalized = legacyRoutes[value] ?? value;

  if (role === "admin") {
    if (normalized === "/dashboard") {
      return "/admin";
    }

    if (normalized === "/admin" || normalized.startsWith("/admin/")) {
      return normalized;
    }

    if (
      userDashboardRoutes.some(
        (path) => normalized === path || normalized.startsWith(`${path}/`)
      )
    ) {
      return normalized;
    }

    return "/admin";
  }

  if (normalized === "/admin" || normalized.startsWith("/admin/")) {
    return "/dashboard";
  }

  if (
    userDashboardRoutes.some(
      (path) => normalized === path || normalized.startsWith(`${path}/`)
    )
  ) {
    return normalized;
  }

  return "/dashboard";
}

