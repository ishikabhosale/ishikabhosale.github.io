export const experience = [
  {
    id: "recursiveAi",
    period: "April 2026 – Present",
    title: "Software Engineer (Mid-Level)",
    organization: "Recursive AI",
    location: "Tokyo",
    detail:
      "Building production AI and document-processing systems with Python, FastAPI, embeddings, and RAG.",
    highlights: [
      "Increased benchmarked output correctness from 12.7% to 68.3% through production-data analysis, domain-keyword enrichment, and disambiguation workflows.",
      "Built OCR, embedding-model, PostgreSQL/pgvector, and RAG pipelines that turn complex documents into customer-service scripts and operational workflows.",
      "Developed Terraform-managed cloud infrastructure and enterprise MCP/plugin tooling while owning delivery across codebases and handovers.",
    ],
    skills: ["Python", "FastAPI", "RAG", "PostgreSQL/pgvector", "Terraform"],
  },
  {
    id: "rakutenSymphony",
    period: "Dec. 2022 – March 2026",
    title: "Software Engineer II (C, Rust)",
    organization: "Rakuten Symphony",
    location: "Tokyo",
    detail:
      "Developed Rakuten Object Store from inception as a core contributor to its concurrent, distributed C architecture.",
    highlights: [
      "Promoted to Software Development Engineer II in June 2025 after significant contributions to Rakuten Object Store.",
      "Re-architected stripe-buffer handling for GET operations with a producer/consumer window, reducing peak download memory consumption by 95%.",
      "Owned active-active, site-level replication features including configuration, bucket seeding, and statistics; delivered 20+ object and bucket features.",
      "Debugged production performance, OS, Kubernetes, and networking issues with GDB, perf, journalctl, and dmesg; earned the CKA certification.",
    ],
    skills: ["C", "Rust", "Unix internals", "Kubernetes", "Docker", "GDB/perf"],
  },
  {
    id: "analogDevices",
    period: "May 2021 – Nov. 2021",
    title: "Medical Algorithm Intern (B.Tech. Project)",
    organization: "Analog Devices India",
    location: "Bengaluru, India",
    detail:
      "Worked on signal-processing algorithms and validation models for medical biosignals.",
    highlights: [
      "Implemented and tested a 3-D peak-finding algorithm with a Python smooth Wigner–Ville function.",
      "Created a MATLAB validation model for ideal biosignals and incorporated noise, drift, and artifact non-idealities.",
    ],
    skills: ["Python", "MATLAB", "Signal processing"],
  },
] as const;
