export type RenderMode = "interactive" | "poster";

export interface RenderPolicyInput {
  reducedMotion: boolean;
  saveData: boolean;
  pointer: "coarse" | "fine" | "none";
  viewportWidth: number;
  webgl: boolean;
}

const MIN_INTERACTIVE_WIDTH = 760;

export function getRenderPolicy(input: RenderPolicyInput): RenderMode {
  if (
    input.reducedMotion ||
    input.saveData ||
    input.pointer !== "fine" ||
    input.viewportWidth < MIN_INTERACTIVE_WIDTH ||
    !input.webgl
  ) {
    return "poster";
  }

  return "interactive";
}
