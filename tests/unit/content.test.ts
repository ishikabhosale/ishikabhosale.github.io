import { describe, expect, it } from "vitest";
import { estimateReadingMinutes, sortByDate } from "../../src/lib/content";

describe("content helpers", () => {
  it("never reports less than one reading minute", () => {
    expect(estimateReadingMinutes("short post")).toBe(1);
  });

  it("rounds reading time up at 220 words per minute", () => {
    expect(estimateReadingMinutes(Array.from({ length: 221 }, () => "word").join(" "))).toBe(2);
  });

  it("sorts newest entries first without mutating the input", () => {
    const entries = [
      { publishedAt: new Date("2026-07-01") },
      { publishedAt: new Date("2026-07-31") },
    ];
    const sorted = sortByDate(entries);

    expect(sorted[0].publishedAt.toISOString()).toContain("2026-07-31");
    expect(entries[0].publishedAt.toISOString()).toContain("2026-07-01");
  });
});
