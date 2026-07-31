import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no obvious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("homepage remains within the viewport on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("social metadata points to the generated card", async ({ page }) => {
  await page.goto("/writing/building-a-calm-3d-portfolio-with-astro/");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://ishikabhosale.github.io/social-card.png",
  );
});
