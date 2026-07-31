import { expect, test } from "@playwright/test";

test.describe("server rack hero fallback", () => {
  test("hydrates the rack canvas on a desktop pointer device", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await expect(
      page.locator("[data-rack-hero][data-rack-mode='interactive']"),
    ).toBeVisible();
    await expect(page.locator(".server-rack-canvas canvas")).toBeVisible();
  });

  test("keeps a poster when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.locator("[data-rack-hero][data-rack-mode='poster']"),
    ).toBeVisible();
    await expect(page.locator(".server-rack-poster")).toBeVisible();
    await expect(page.locator(".server-rack-interactive")).toBeHidden();
  });
});
