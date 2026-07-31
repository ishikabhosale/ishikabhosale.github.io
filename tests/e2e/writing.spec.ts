import { expect, test } from "@playwright/test";

test("publishes a permanent article URL with metadata and copy link", async ({
  page,
}) => {
  await page.goto("/writing/building-a-calm-3d-portfolio-with-astro/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Building a Calm 3D Portfolio with Astro",
  );
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
    "href",
    "https://ishikabhosale.github.io/writing/building-a-calm-3d-portfolio-with-astro/",
  );
});
