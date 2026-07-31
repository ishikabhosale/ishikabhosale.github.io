import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config/site";

describe("SITE", () => {
  it("uses the canonical GitHub Pages origin", () => {
    expect(SITE.url).toBe("https://ishikabhosale.github.io");
    expect(SITE.name).toBe("Ishika Bhosale");
    expect(SITE.description).toContain("systems");
  });

  it("does not publish an unconfirmed email address", () => {
    expect(SITE.email).toBeNull();
  });
});
