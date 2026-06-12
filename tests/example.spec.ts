import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    heading: "Turn emotional overload into clear reflection.",
  },
  { path: "/quick", heading: "Quick Reflection" },
  { path: "/guided", heading: "Guided Reflection" },
  { path: "/history", heading: "Reflection History" },
  { path: "/summary", heading: "Your recent patterns" },
  { path: "/feedback", heading: "Share feedback" },
  { path: "/test", heading: "Test InnerLeaf" },
  { path: "/demo", heading: "InnerLeaf Demo Flow" },
  { path: "/about", heading: "About InnerLeaf" },
  { path: "/privacy", heading: "Privacy & Safety Principles" },
  { path: "/faq", heading: "FAQ" },
  { path: "/login", heading: "Login" },
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

test("home links to the main reflection flows", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Start reflection" }).first()
  ).toHaveAttribute("href", "/quick");
  await expect(
    page.getByRole("link", { name: "View demo" }).first()
  ).toHaveAttribute("href", "/demo");
});

test("quick reflection disables submit until the user writes", async ({ page }) => {
  await page.goto("/quick");

  const button = page.getByRole("button", { name: "Break down this reaction" });
  await expect(button).toBeDisabled();

  await page
    .getByLabel("What happened?")
    .fill("I felt ignored when a friend did not reply.");
  await expect(button).toBeEnabled();
});
