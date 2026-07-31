import { describe, expect, it } from "vitest";
import { experience } from "../../src/data/experience";
import {
  certifications,
  education,
  resumeProject,
  skillGroups,
} from "../../src/data/resume";

describe("resume data", () => {
  it("records the latest roles in reverse chronological order", () => {
    expect(experience.map((entry) => entry.organization)).toEqual([
      "Recursive AI",
      "Rakuten Symphony",
      "Analog Devices India",
    ]);
    expect(experience[0].period).toBe("April 2026 – Present");
    expect(experience[0].highlights[0]).toContain("12.7%");
    expect(experience[0].highlights[0]).toContain("68.3%");
  });

  it("includes education, the Dozee project, and resume skill groups", () => {
    expect(education.institution).toContain(
      "Indian Institute of Technology Indore",
    );
    expect(resumeProject.title).toBe("Load Testing Solution");
    expect(skillGroups.map((group) => group.label)).toEqual([
      "Programming languages",
      "Frameworks, tools & libraries",
      "Systems & infrastructure",
    ]);
    expect(certifications).toContain(
      "Certified Kubernetes Administrator (CKA)",
    );
  });
});
