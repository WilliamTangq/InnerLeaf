import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    heading: "Pause. Reflect. Respond.",
  },
  { path: "/feedback", heading: "Share feedback" },
  { path: "/test", heading: "Test InnerLeaf" },
  { path: "/demo", heading: "Try a 60-second reflection" },
  { path: "/about", heading: "About InnerLeaf" },
  { path: "/privacy", heading: "Privacy & Safety Principles" },
  { path: "/faq", heading: "FAQ" },
  { path: "/students", heading: "InnerLeaf for international students" },
  { path: "/pricing", heading: "Public beta pricing" },
  { path: "/login", heading: "Log in to InnerLeaf" },
  { path: "/register", heading: "Create your InnerLeaf account" },
  { path: "/reset-password", heading: "Reset your password" },
] as const;

const protectedRoutes = [
  "/dashboard",
  "/dashboard/quick",
  "/dashboard/guided",
  "/dashboard/history",
  "/dashboard/summary",
  "/dashboard/account",
  "/admin",
  "/admin/account",
  "/admin/users",
  "/admin/feedback",
  "/admin/system",
  "/admin/metrics",
] as const;

const compatibilityRoutes = {
  "/app": "/app",
  "/quick": "/dashboard/quick",
  "/guided": "/dashboard/guided",
  "/history": "/dashboard/history",
  "/summary": "/dashboard/summary",
  "/account": "/account",
} as const;

for (const route of routes) {
  test(`${route.path} renders the primary experience`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole("heading", { name: route.heading, exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("InnerLeaf", { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText("Follow InnerLeaf").first()).toBeVisible();
  });
}

for (const path of protectedRoutes) {
  test(`${path} requires auth or reports missing auth setup`, async ({ page }) => {
    await page.goto(path);

    const loginHeading = page.getByRole("heading", {
      name: "Log in to InnerLeaf",
      exact: true,
    });
    const setupHeading = page.getByRole("heading", {
      name: "Authentication is not configured in this environment.",
      exact: true,
    });

    await expect(loginHeading.or(setupHeading)).toBeVisible();

    if (await loginHeading.isVisible()) {
      await expect(page).toHaveURL(
        new RegExp(`/login\\?next=${encodeURIComponent(path)}`)
      );
    }
  });
}

for (const [path, next] of Object.entries(compatibilityRoutes)) {
  test(`${path} redirects through the new dashboard architecture`, async ({ page }) => {
    await page.goto(path);

    const loginHeading = page.getByRole("heading", {
      name: "Log in to InnerLeaf",
      exact: true,
    });
    const setupHeading = page.getByRole("heading", {
      name: "Authentication is not configured in this environment.",
      exact: true,
    });

    await expect(loginHeading.or(setupHeading)).toBeVisible();

    if (await loginHeading.isVisible()) {
      await expect(page).toHaveURL(
        new RegExp(`/login\\?next=${encodeURIComponent(next)}`)
      );
    }
  });
}

test("home links to demo and private reflection", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Start private reflection" }).first()
  ).toHaveAttribute("href", "/register");
  await expect(
    page.getByRole("link", { name: "Try a fictional demo" }).first()
  ).toHaveAttribute("href", "/demo");
});
