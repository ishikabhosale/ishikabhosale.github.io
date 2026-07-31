# Resume Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax to track progress.

**Goal:** Replace placeholder portfolio biography and experience content with the July 2026 resume, preserving the existing bilingual Astro presentation and opening a pull request against `main`.

**Architecture:** Keep resume facts in the existing typed experience and site-config data modules so the English and Japanese homepage sections share one source of truth. Update the selected project and About copy only where the resume provides concrete information, and add focused tests for the new experience entries and homepage output.

**Tech Stack:** Astro 7, TypeScript, Vitest, Playwright, Markdown content collections, GitHub Pages.

## Global Constraints

- Preserve the existing Tokyo Systems Journal visual hierarchy and server-rack hero.
- Do not invent employer names, dates, metrics, links, or certifications beyond the supplied resume.
- Keep English and Japanese routes functional; translate interface copy while preserving proper nouns and technical terms.
- Keep the PR limited to resume/content updates, tests, and the implementation plan.

---

### Task 1: Model the resume facts in site data

**Files:**

- Modify: `src/data/experience.ts`
- Modify: `src/config/site.ts`
- Test: `tests/unit/site-config.test.ts`

- [x] **Step 1: Write the failing assertions** for Recursive AI, Rakuten Symphony, Analog Devices, IIT Indore, and the updated professional summary.
- [x] **Step 2: Run the focused unit test** and confirm it fails against the placeholder data.
- [x] **Step 3: Replace placeholder data** with the resume-backed entries, dates, locations, responsibilities, education, and skills.
- [x] **Step 4: Run the focused unit test** and confirm it passes.
- [x] **Step 5: Commit** the resume data update.

### Task 2: Render the latest information across the site

**Files:**

- Modify: `src/components/home/AboutContact.astro`
- Modify: `src/content/projects/personal-portfolio.md`
- Modify: `src/content/writing/building-a-calm-3d-portfolio.md`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ja.ts`
- Test: `tests/e2e/home.spec.ts`

- [x] **Step 1: Write the failing homepage assertions** for the new current role and Rakuten experience.
- [x] **Step 2: Run the focused browser test** and confirm it fails against the placeholder copy.
- [x] **Step 3: Update the hero, About, experience, and background sections** so the latest AI, systems, distributed storage, Kubernetes, and technical-writing focus is represented without duplicating the resume verbatim.
- [x] **Step 4: Add Japanese equivalents** for all new visible interface copy.
- [x] **Step 5: Run the focused browser test** and confirm it passes in English and Japanese.
- [x] **Step 6: Commit** the rendered-content update.

### Task 3: Verify and prepare the PR

**Files:**

- Modify: `README.md` only if the content workflow needs clarification.
- Test: `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts`

- [x] **Step 1: Run formatting, unit tests, browser tests, Astro checks, build, and internal-link checks.**
- [x] **Step 2: Inspect the generated homepage and Japanese homepage for clipping or broken links.**
- [x] **Step 3: Review the diff for accidental personal-data changes outside the requested resume content.**
- [x] **Step 4: Commit any final docs/test adjustments.**
- [ ] **Step 5: Push `agent/resume-refresh` and open a draft PR targeting `main`.**
