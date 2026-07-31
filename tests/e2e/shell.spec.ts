import { expect, test } from "@playwright/test";

test("renders accessible navigation and persistent controls", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "日本語" })).toHaveAttribute(
    "href",
    "/ja/",
  );
  await expect(
    page.getByRole("button", { name: "Switch theme" }),
  ).toBeVisible();
});

test("persists a selected theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch theme" }).click();
  const selectedTheme = await page.locator("html").getAttribute("data-theme");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    selectedTheme ?? "light",
  );
});
