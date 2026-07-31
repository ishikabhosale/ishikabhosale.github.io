import { expect, test } from "@playwright/test";

test("publishes Japanese interface routes with equivalent content URLs", async ({
  page,
}) => {
  await page.goto("/ja/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ishika Bhosale",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "English" }),
  ).toHaveAttribute("href", "/");
  await expect(
    page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "日本語" }),
  ).toHaveAttribute("href", "/ja/");

  await page.goto("/ja/writing/building-a-calm-3d-portfolio-with-astro/");
  await expect(
    page.getByRole("button", { name: "リンクをコピー" }),
  ).toBeVisible();
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
    "href",
    "https://ishikabhosale.github.io/ja/writing/building-a-calm-3d-portfolio-with-astro/",
  );
});
