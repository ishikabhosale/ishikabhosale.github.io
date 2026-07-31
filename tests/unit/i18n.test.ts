import { describe, expect, it } from "vitest";
import {
  getDictionary,
  localeFromPath,
  localizedPath,
} from "../../src/i18n/config";

describe("interface localization", () => {
  it("detects the Japanese route prefix", () => {
    expect(localeFromPath("/ja/writing/example/")).toBe("ja");
    expect(localeFromPath("/writing/example/")).toBe("en");
  });

  it("switches equivalent paths without duplicating prefixes", () => {
    expect(localizedPath("/writing/example/", "ja")).toBe(
      "/ja/writing/example/",
    );
    expect(localizedPath("/ja/writing/example/", "en")).toBe(
      "/writing/example/",
    );
  });

  it("keeps dictionary keys in parity", () => {
    expect(Object.keys(getDictionary("en")).sort()).toEqual(
      Object.keys(getDictionary("ja")).sort(),
    );
  });
});
