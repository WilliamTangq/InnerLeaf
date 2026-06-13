import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    heading: "Turn emotional overload into clear reflection.",
  },
  { path: "/feedback", heading: "Share feedback" },
  { path: "/test", heading: "Test InnerLeaf" },
  { path: "/demo", heading: "InnerLeaf Demo Flow" },
  { path: "/about", heading: "About InnerLeaf" },
  { path: "/privacy", heading: "Privacy & Safety Principles" },
  { path: "/faq", heading: "FAQ" },
  { path: "/login", heading: "Log in to InnerLeaf" },
  { path: "/register", heading: "Create your InnerLeaf account" },
  { path: "/reset-password", heading: "Reset your password" },
] as const;

const protectedRoutes = [
  "/app",
  "/quick",
  "/guided",
  "/history",
  "/summary",
  "/account",
  "/admin",
  "/admin/users",
  "/admin/feedback",
  "/admin/system",
] as const;

for (const route of routes) {
  test(`${route.path} renders the primary experience`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole("heading", { name: route.heading, exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("InnerLeaf", { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText("Follow InnerLeaf")).toBeVisible();
  });
}

for (const path of protectedRoutes) {
  test(`${path} redirects logged-out visitors to login`, async ({ page }) => {
    await page.goto(path);

    await expect(
      page.getByRole("heading", { name: "Log in to InnerLeaf", exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`));
  });
}

test("home links to account creation and demo", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Create account" }).first()
  ).toHaveAttribute("href", "/register");
  await expect(
    page.getByRole("link", { name: "View demo" }).first()
  ).toHaveAttribute("href", "/demo");
});
