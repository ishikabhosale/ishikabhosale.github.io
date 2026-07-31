import { describe, expect, it } from "vitest";
import { getRenderPolicy } from "../../src/components/three/render-policy";

describe("getRenderPolicy", () => {
  it("keeps a static poster for reduced motion and data saving", () => {
    expect(
      getRenderPolicy({
        reducedMotion: true,
        saveData: false,
        pointer: "fine",
        viewportWidth: 1440,
        webgl: true,
      }),
    ).toBe("poster");

    expect(
      getRenderPolicy({
        reducedMotion: false,
        saveData: true,
        pointer: "fine",
        viewportWidth: 1440,
        webgl: true,
      }),
    ).toBe("poster");
  });

  it("renders only on capable desktop-like pointers", () => {
    expect(
      getRenderPolicy({
        reducedMotion: false,
        saveData: false,
        pointer: "fine",
        viewportWidth: 1200,
        webgl: true,
      }),
    ).toBe("interactive");

    expect(
      getRenderPolicy({
        reducedMotion: false,
        saveData: false,
        pointer: "coarse",
        viewportWidth: 1200,
        webgl: true,
      }),
    ).toBe("poster");
  });

  it("falls back for narrow viewports or missing WebGL", () => {
    expect(
      getRenderPolicy({
        reducedMotion: false,
        saveData: false,
        pointer: "fine",
        viewportWidth: 759,
        webgl: true,
      }),
    ).toBe("poster");

    expect(
      getRenderPolicy({
        reducedMotion: false,
        saveData: false,
        pointer: "fine",
        viewportWidth: 1200,
        webgl: false,
      }),
    ).toBe("poster");
  });
});
