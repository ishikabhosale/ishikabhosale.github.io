export const education = {
  period: "2018 – 2022",
  degree: "B.Tech. Electrical Engineering",
  institution: "Indian Institute of Technology Indore (IIT Indore)",
} as const;

export const resumeProject = {
  title: "Load Testing Solution",
  context: "Backend Project · Hackathon @Dozee",
  description:
    "Built a load-testing and API-testing application around Predator APIs with Flask, React, and PostgreSQL; logged-in users could run requests and review their history.",
  technologies: ["Flask", "React", "PostgreSQL", "API testing"],
} as const;

export const skillGroups = [
  {
    id: "languages",
    label: "Programming languages",
    skills: ["C", "C++", "Rust", "Python", "SQL", "Go", "JavaScript"],
  },
  {
    id: "tools",
    label: "Frameworks, tools & libraries",
    skills: [
      "Database management",
      "GDB",
      "perf",
      "git",
      "XML",
      "Yugabyte",
      "ReactJS",
    ],
  },
  {
    id: "systems",
    label: "Systems & infrastructure",
    skills: [
      "Linux",
      "Systems programming",
      "Linux kernel",
      "Shell scripting",
      "Unix command line",
      "Network protocols",
      "Kubernetes",
      "Docker",
      "Data structures & algorithms",
    ],
  },
] as const;

export const certifications = [
  "Certified Kubernetes Administrator (CKA)",
] as const;
