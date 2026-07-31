import { describe, expect, it } from "vitest";
import { projectPath, writingPath } from "../../src/lib/urls";

describe("content URLs", () => {
  it("creates stable English and Japanese writing URLs", () => {
    expect(writingPath("building-a-calm-3d-portfolio-with-astro", "en")).toBe(
      "/writing/building-a-calm-3d-portfolio-with-astro/",
    );
    expect(writingPath("building-a-calm-3d-portfolio-with-astro", "ja")).toBe(
      "/ja/writing/building-a-calm-3d-portfolio-with-astro/",
    );
  });

  it("creates stable project URLs", () => {
    expect(projectPath("personal-portfolio", "en")).toBe(
      "/work/personal-portfolio/",
    );
    expect(projectPath("personal-portfolio", "ja")).toBe(
      "/ja/work/personal-portfolio/",
    );
  });
});
