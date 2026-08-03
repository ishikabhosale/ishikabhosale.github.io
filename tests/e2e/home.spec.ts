import { expect, test } from "@playwright/test";

test("presents the approved portfolio hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ishika Bhosale",
  );
  await expect(
    page.getByText("AI & Systems Engineer", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Recursive AI · Tokyo", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Rakuten Symphony · Tokyo", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#experience")).toBeVisible();
  await expect(page.locator("#writing")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
});
