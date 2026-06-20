import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;
const userEmail = process.env.TEST_USER_EMAIL;
const userPassword = process.env.TEST_USER_PASSWORD;

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

function skipWithMessage(condition: boolean, message: string) {
  if (condition) {
    console.info(`[role-routing] ${message}`);
    test.skip(true, message);
  }
}

test("admin login lands on admin dashboard", async ({ page }) => {
  skipWithMessage(
    !adminEmail || !adminPassword,
    "Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD to live-verify admin routing."
  );

  await login(page, adminEmail!, adminPassword!);

  await page.waitForURL("**/admin", { timeout: 30000 });
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Your reflection workspace")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Feedback inbox", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "System", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Account", exact: true })).toBeVisible();
});

test("normal user login lands on user dashboard and cannot access admin", async ({ page }) => {
  skipWithMessage(
    !userEmail || !userPassword,
    "Set TEST_USER_EMAIL and TEST_USER_PASSWORD after manually creating user@test.com with role user."
  );

  await login(page, userEmail!, userPassword!);

  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Your reflection workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Admin", exact: true })).toHaveCount(0);

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin access required" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Users", exact: true })).toHaveCount(0);
});

test("logged out admin route redirects to login with next", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
});
