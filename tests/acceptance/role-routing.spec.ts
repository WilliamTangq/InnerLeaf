import { expect, test } from "@playwright/test";

test("admin login lands on admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@gmail.com");
  await page.getByLabel("Password").fill("123456");
  await page.getByRole("button", { name: "Log in" }).click();

  await page.waitForURL("**/admin", { timeout: 30000 });
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Your reflection workspace")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Feedback inbox", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "System", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Account", exact: true })).toBeVisible();
});

test("logged out admin route redirects to login with next", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
});
