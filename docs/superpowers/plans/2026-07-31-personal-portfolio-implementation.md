# Personal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (<code>- [ ]</code>) syntax for tracking.

**Goal:** Build Ishika Bhosale’s bilingual-interface Astro portfolio, matching the approved Tokyo Systems Journal visual direction and publishing permanent project and article URLs through GitHub Pages.

**Architecture:** Astro renders the entire site statically from typed content collections and locale dictionaries. A single React Three Fiber island progressively enhances the hero with the server-rack model; every route remains readable and navigable without client JavaScript.

**Tech Stack:** Node 22.12+, npm 9.6.5+, Astro 7.1.6, TypeScript 6.0.3, React 19.2.8, Three.js 0.185.1, React Three Fiber 9.6.1, Vitest 4.1.10, Playwright 1.62.1, Axe 4.12.1.

## Global Constraints

- The repository publishes to <code>https://ishikabhosale.github.io</code> from GitHub Actions.
- Match <code>docs/superpowers/specs/assets/portfolio-homepage-option-3.png</code>; do not introduce a new visual direction.
- Use a warm near-black canvas, ivory type, deep indigo accents, tiny green server lights, squared geometry, and restrained monospace metadata.
- The server rack is the only 3D object and the only substantial interactive bundle.
- Do not add particles, cursor replacement, social counters, visitor presence, chat, glassmorphism, gradient blobs, or dramatic scroll effects.
- English and Japanese translate interface labels only. Article and project bodies remain as authored.
- Article URLs use <code>/writing/&lt;slug&gt;/</code> without dates and expose canonical social metadata.
- The site must remain readable, navigable, and shareable when JavaScript, WebGL, or motion is unavailable.
- Store the selected server-rack asset locally and credit its author under CC BY 4.0.
- Use test-driven development, small commits, and explicit verification after every task.

---

## Planned File Structure

<code>src/config/site.ts</code> owns public site metadata and social links.

<code>src/i18n/config.ts</code> owns locale types, dictionaries, and localized-path helpers.

<code>src/content.config.ts</code> owns writing and project schemas; Markdown files under <code>src/content/</code> own authored content.

<code>src/layouts/BaseLayout.astro</code> owns document metadata, theme bootstrap, skip link, header, and footer.

<code>src/layouts/ArticleLayout.astro</code> owns article metadata, prose structure, table of contents, sharing, and adjacent navigation.

<code>src/components/home/</code> owns homepage-only static sections.

<code>src/components/three/</code> owns the progressive 3D policy and scene. No other component imports Three.js.

<code>src/pages/</code> owns English routes; <code>src/pages/ja/</code> owns Japanese-interface shells.

<code>tests/unit/</code> covers pure configuration, locale, content, URL, and 3D-policy logic.

<code>tests/e2e/</code> covers the rendered site, accessibility, fallbacks, routing, metadata, and responsive behavior.

---

### Task 1: Establish the Astro Foundation and Quality Gates

**Files:**
- Create: <code>package.json</code>
- Create: <code>astro.config.mjs</code>
- Create: <code>tsconfig.json</code>
- Create: <code>vitest.config.ts</code>
- Create: <code>playwright.config.ts</code>
- Create: <code>.prettierrc.json</code>
- Create: <code>src/config/site.ts</code>
- Create: <code>src/styles/global.css</code>
- Create: <code>src/layouts/BaseLayout.astro</code>
- Create: <code>src/pages/index.astro</code>
- Test: <code>tests/unit/site-config.test.ts</code>

**Interfaces:**
- Produces: <code>SITE</code>, a readonly object containing <code>name</code>, <code>title</code>, <code>description</code>, <code>url</code>, <code>email</code>, and social URLs.
- Produces: the commands <code>npm run dev</code>, <code>npm run check</code>, <code>npm run build</code>, <code>npm run test:unit</code>, and <code>npm run test:e2e</code>.

- [ ] **Step 1: Create the dependency and tool configuration**

Use this package manifest:

~~~json
{
  "name": "ishikabhosale.github.io",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ASTRO_TELEMETRY_DISABLED=1 astro dev",
    "check": "ASTRO_TELEMETRY_DISABLED=1 astro check",
    "build": "npm run check && ASTRO_TELEMETRY_DISABLED=1 astro build",
    "preview": "ASTRO_TELEMETRY_DISABLED=1 astro preview",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "@astrojs/react": "6.0.2",
    "@astrojs/rss": "4.0.19",
    "@astrojs/sitemap": "3.7.3",
    "@react-three/drei": "10.7.7",
    "@react-three/fiber": "9.6.1",
    "astro": "7.1.6",
    "@lucide/astro": "1.28.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "three": "0.185.1"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "@axe-core/playwright": "4.12.1",
    "@gltf-transform/cli": "4.4.2",
    "@playwright/test": "1.62.1",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "@types/three": "0.185.1",
    "happy-dom": "20.11.1",
    "prettier": "3.9.6",
    "prettier-plugin-astro": "0.14.1",
    "sharp": "0.35.3",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  },
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=9.6.5"
  }
}
~~~

Configure Astro for static output, React, sitemap generation, and <code>site: "https://ishikabhosale.github.io"</code>. Configure Vitest with the <code>happy-dom</code> environment and Playwright with <code>baseURL: "http://127.0.0.1:4321"</code> plus a web server command of <code>npm run dev -- --host 127.0.0.1</code>.

- [ ] **Step 2: Install and lock dependencies**

Run: <code>npm install</code>

Expected: <code>package-lock.json</code> is created and npm reports no resolution errors.

- [ ] **Step 3: Write the failing site-config test**

~~~ts
import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config/site";

describe("SITE", () => {
  it("uses the canonical GitHub Pages origin", () => {
    expect(SITE.url).toBe("https://ishikabhosale.github.io");
    expect(SITE.name).toBe("Ishika Bhosale");
    expect(SITE.description).toContain("systems");
  });
});
~~~

- [ ] **Step 4: Run the test and verify the red state**

Run: <code>npm run test:unit -- tests/unit/site-config.test.ts</code>

Expected: FAIL because <code>src/config/site.ts</code> does not exist.

- [ ] **Step 5: Implement the site config and minimal static route**

Create <code>SITE</code> as a readonly object with the approved name, title “Systems & Cloud Engineer”, a systems-focused description, canonical URL, <code>email: null</code>, and the public GitHub/LinkedIn URLs. Treat email as <code>string | null</code> and omit the email control while it is null; the public contact actions use GitHub and LinkedIn until Ishika explicitly supplies an address. Build a minimal <code>BaseLayout.astro</code> that accepts <code>title</code>, <code>description</code>, and <code>canonicalPath</code>, imports <code>global.css</code>, and renders a skip link plus <code>&lt;slot /&gt;</code>.

Use CSS custom properties for the approved colors:

~~~css
:root {
  --color-canvas: #0b0c10;
  --color-surface: #11131a;
  --color-text: #f1eee7;
  --color-muted: #a6a4ad;
  --color-line: #2a2d36;
  --color-accent: #8587e8;
  --color-status: #8ee36b;
  --content-width: 90rem;
}
~~~

- [ ] **Step 6: Verify the foundation**

Run: <code>npm run test:unit -- tests/unit/site-config.test.ts</code>

Expected: PASS.

Run: <code>npm run build</code>

Expected: PASS and <code>dist/index.html</code> exists.

- [ ] **Step 7: Commit**

~~~bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .prettierrc.json src tests/unit/site-config.test.ts
git commit -m "build: establish Astro portfolio foundation"
~~~

### Task 2: Add Typed English/Japanese Interface Localization

**Files:**
- Create: <code>src/i18n/config.ts</code>
- Create: <code>src/i18n/en.ts</code>
- Create: <code>src/i18n/ja.ts</code>
- Test: <code>tests/unit/i18n.test.ts</code>

**Interfaces:**
- Produces: <code>type Locale = "en" | "ja"</code>.
- Produces: <code>getDictionary(locale: Locale): Dictionary</code>.
- Produces: <code>localeFromPath(pathname: string): Locale</code>.
- Produces: <code>localizedPath(pathname: string, locale: Locale): string</code>.

- [ ] **Step 1: Write the failing localization tests**

~~~ts
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
~~~

- [ ] **Step 2: Run the localization tests**

Run: <code>npm run test:unit -- tests/unit/i18n.test.ts</code>

Expected: FAIL because the i18n modules do not exist.

- [ ] **Step 3: Implement locale helpers and dictionaries**

Define a flat dictionary with keys for navigation, hero actions, section headings, article metadata, copy-link status, theme controls, menu controls, 404 content, and footer labels. Use these approved Japanese labels:

~~~ts
export const ja = {
  "nav.work": "主な実績",
  "nav.experience": "経歴",
  "nav.writing": "記事",
  "nav.about": "プロフィール",
  "hero.eyebrow": "こんにちは、",
  "hero.role": "システム・クラウドエンジニア",
  "hero.work": "主な実績を見る",
  "hero.article": "最新の記事",
  "writing.heading": "技術記事",
  "writing.browse": "すべての記事",
  "article.copy": "リンクをコピー",
  "article.copied": "コピーしました",
  "theme.label": "テーマを切り替える",
  "menu.open": "メニューを開く",
  "menu.close": "メニューを閉じる",
  "footer.rss": "RSS",
  "notFound.title": "ページが見つかりません",
  "notFound.home": "ホームへ戻る",
} as const;
~~~

Give <code>en</code> the identical key set. Implement path normalization by removing one leading <code>/ja</code> before applying the target locale.

- [ ] **Step 4: Verify locale behavior**

Run: <code>npm run test:unit -- tests/unit/i18n.test.ts</code>

Expected: PASS.

Run: <code>npm run check</code>

Expected: PASS with dictionary parity enforced by TypeScript.

- [ ] **Step 5: Commit**

~~~bash
git add src/i18n tests/unit/i18n.test.ts
git commit -m "feat: add English and Japanese interface dictionaries"
~~~

### Task 3: Define Typed Writing and Project Content

**Files:**
- Create: <code>src/content.config.ts</code>
- Create: <code>src/content/writing/building-a-calm-3d-portfolio.md</code>
- Create: <code>src/content/projects/personal-portfolio.md</code>
- Create: <code>src/lib/content.ts</code>
- Test: <code>tests/unit/content.test.ts</code>

**Interfaces:**
- Produces collections named <code>writing</code> and <code>projects</code>.
- Produces <code>getPublishedWriting()</code>, <code>getFeaturedProjects()</code>, and <code>estimateReadingMinutes(body: string)</code>.

- [ ] **Step 1: Write failing pure-content tests**

~~~ts
import { describe, expect, it } from "vitest";
import { estimateReadingMinutes, sortByDate } from "../../src/lib/content";

describe("content helpers", () => {
  it("never reports less than one reading minute", () => {
    expect(estimateReadingMinutes("short post")).toBe(1);
  });

  it("sorts newest entries first", () => {
    const sorted = sortByDate([
      { publishedAt: new Date("2026-07-01") },
      { publishedAt: new Date("2026-07-31") },
    ]);
    expect(sorted[0].publishedAt.toISOString()).toContain("2026-07-31");
  });
});
~~~

- [ ] **Step 2: Run the content tests**

Run: <code>npm run test:unit -- tests/unit/content.test.ts</code>

Expected: FAIL because <code>src/lib/content.ts</code> does not exist.

- [ ] **Step 3: Implement schemas and helpers**

Use Astro’s glob loaders. The writing schema requires <code>title</code>, <code>description</code>, <code>publishedAt</code>, <code>slug</code>, <code>language</code>, <code>topic</code>, and <code>draft</code>. The projects schema requires <code>title</code>, <code>summary</code>, <code>slug</code>, <code>technologies</code>, <code>featured</code>, and <code>order</code>. Match every optional field in the approved specification.

Implement reading time at 220 words per minute and date sorting without mutating the input array.

- [ ] **Step 4: Add honest representative content**

Create one public article titled “Building a Calm 3D Portfolio with Astro” describing the decisions documented in the approved spec. Create one project entry for this portfolio itself, with technologies Astro, TypeScript, React Three Fiber, and GitHub Pages. Do not invent employment outcomes or performance numbers.

Use this article frontmatter:

~~~yaml
---
title: "Building a Calm 3D Portfolio with Astro"
description: "How I balanced a focused engineering portfolio with one restrained interactive 3D element."
publishedAt: 2026-07-31
slug: "building-a-calm-3d-portfolio-with-astro"
language: "en"
topic: "Web Engineering"
draft: false
featured: true
---
~~~

- [ ] **Step 5: Verify schemas and build-time collection loading**

Run: <code>npm run test:unit -- tests/unit/content.test.ts</code>

Expected: PASS.

Run: <code>npm run build</code>

Expected: PASS and no content-schema warnings.

- [ ] **Step 6: Commit**

~~~bash
git add src/content.config.ts src/content src/lib/content.ts tests/unit/content.test.ts
git commit -m "feat: add typed portfolio content collections"
~~~

### Task 4: Build the Shared Shell, Theme, and Language Controls

**Files:**
- Create: <code>src/components/SiteHeader.astro</code>
- Create: <code>src/components/SiteFooter.astro</code>
- Create: <code>src/components/LanguageSwitch.astro</code>
- Create: <code>src/components/ThemeSwitch.astro</code>
- Create: <code>src/scripts/theme.ts</code>
- Modify: <code>src/layouts/BaseLayout.astro</code>
- Modify: <code>src/styles/global.css</code>
- Test: <code>tests/e2e/shell.spec.ts</code>

**Interfaces:**
- <code>BaseLayout</code> consumes <code>locale</code>, <code>title</code>, <code>description</code>, <code>canonicalPath</code>, <code>image</code>, and <code>article</code>.
- <code>SiteHeader</code> consumes <code>locale</code> and <code>pathname</code>.
- Theme state uses the <code>data-theme</code> attribute and the local-storage key <code>portfolio-theme</code>.
- Locale choice uses the local-storage key <code>portfolio-locale</code>.

- [ ] **Step 1: Write the failing rendered-shell test**

~~~ts
import { expect, test } from "@playwright/test";

test("renders accessible navigation and persistent controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeVisible();
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.getByRole("link", { name: "日本語" })).toHaveAttribute(
    "href",
    "/ja/",
  );
  await expect(
    page.getByRole("button", { name: "Switch theme" }),
  ).toBeVisible();
});
~~~

- [ ] **Step 2: Run the shell test**

Run: <code>npm run test:e2e -- tests/e2e/shell.spec.ts</code>

Expected: FAIL because navigation and controls are absent.

- [ ] **Step 3: Implement the shared shell**

Build the desktop header shown in Option 3 and a mobile disclosure menu. Use semantic links, a real button for the menu, and Lucide Astro icons for menu, theme, GitHub, LinkedIn, and RSS affordances. Render an email affordance only when <code>SITE.email</code> is non-null.

Place a short inline theme bootstrap in <code>&lt;head&gt;</code> so the stored theme or system preference applies before paint. The interactive button must update <code>data-theme</code>, local storage, and its accessible pressed state.

Generate canonical, Open Graph, and Twitter metadata from <code>SITE.url</code> and <code>canonicalPath</code>. Give the page a single <code>&lt;main id="main-content"&gt;</code>.

- [ ] **Step 4: Verify shell behavior**

Run: <code>npm run test:e2e -- tests/e2e/shell.spec.ts</code>

Expected: PASS.

Run: <code>npm run check</code>

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/components src/layouts/BaseLayout.astro src/scripts/theme.ts src/styles/global.css tests/e2e/shell.spec.ts
git commit -m "feat: build accessible portfolio shell"
~~~

### Task 5: Implement the Option 3 Homepage Composition

**Files:**
- Create: <code>src/components/home/Hero.astro</code>
- Create: <code>src/components/home/SelectedWork.astro</code>
- Create: <code>src/components/home/ExperienceTimeline.astro</code>
- Create: <code>src/components/home/JournalPreview.astro</code>
- Create: <code>src/components/home/AboutContact.astro</code>
- Create: <code>src/data/experience.ts</code>
- Modify: <code>src/pages/index.astro</code>
- Create: <code>src/pages/ja/index.astro</code>
- Modify: <code>src/styles/global.css</code>
- Test: <code>tests/e2e/home.spec.ts</code>

**Interfaces:**
- Homepage components consume <code>locale: Locale</code> and typed content entries.
- <code>Hero</code> exposes a named <code>model</code> slot for the progressive rack.
- Section IDs are <code>work</code>, <code>experience</code>, <code>writing</code>, and <code>about</code>.

- [ ] **Step 1: Write the failing homepage hierarchy test**

~~~ts
import { expect, test } from "@playwright/test";

test("presents the approved portfolio hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ishika Bhosale",
  );
  await expect(page.getByText("Systems & Cloud Engineer")).toBeVisible();
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#experience")).toBeVisible();
  await expect(page.locator("#writing")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
});
~~~

- [ ] **Step 2: Run the homepage test**

Run: <code>npm run test:e2e -- tests/e2e/home.spec.ts</code>

Expected: FAIL because the homepage sections do not exist.

- [ ] **Step 3: Implement the static composition**

Match the approved image’s proportions at a 1536×1024 reference viewport:

- header height near 88px;
- hero uses a two-column grid with copy on the left and model stage on the right;
- name uses a responsive clamp and remains at most three lines;
- the first journal row receives the strongest hierarchy;
- thin horizontal rules separate article rows;
- no major section is wrapped in a generic rounded card.

Render one real project and article from Task 3, plus explicit “More work coming soon” space only when fewer than three published entries exist. Keep the experience module conservative and fact-based; use IIT Indore and Tokyo only if supported by public profile data, without inventing job titles or dates.

- [ ] **Step 4: Implement responsive behavior**

At widths below 900px, stack hero copy above the model slot. At widths below 680px, keep the name readable, hide the model interaction caption, render the rack poster at a smaller fixed aspect ratio, and convert journal rows to a single-column reading order.

- [ ] **Step 5: Verify homepage structure and responsiveness**

Run: <code>npm run test:e2e -- tests/e2e/home.spec.ts</code>

Expected: PASS.

Run: <code>npm run build</code>

Expected: PASS.

- [ ] **Step 6: Commit**

~~~bash
git add src/components/home src/data/experience.ts src/pages/index.astro src/pages/ja/index.astro src/styles/global.css tests/e2e/home.spec.ts
git commit -m "feat: implement Tokyo Systems Journal homepage"
~~~

### Task 6: Add the Progressive Server-Rack Hero

**Files:**
- Create: <code>public/models/server-rack.glb</code>
- Create: <code>public/images/server-rack-poster.webp</code>
- Create: <code>CREDITS.md</code>
- Create: <code>src/components/three/ServerRackHero.astro</code>
- Create: <code>src/components/three/ServerRackScene.tsx</code>
- Create: <code>src/components/three/render-policy.ts</code>
- Create: <code>scripts/capture-model-poster.mjs</code>
- Modify: <code>src/components/home/Hero.astro</code>
- Modify: <code>src/components/SiteFooter.astro</code>
- Test: <code>tests/unit/render-policy.test.ts</code>
- Test: <code>tests/e2e/model-fallback.spec.ts</code>

**Interfaces:**
- Produces <code>shouldEnhanceModel(input: ModelPolicyInput): boolean</code>.
- <code>ModelPolicyInput</code> contains <code>reducedMotion</code>, <code>saveData</code>, <code>coarsePointer</code>, <code>narrowViewport</code>, and <code>webglAvailable</code>.
- The Astro wrapper always renders the poster; the React island marks itself ready with <code>data-model-ready="true"</code>.

- [ ] **Step 1: Write the failing render-policy tests**

~~~ts
import { describe, expect, it } from "vitest";
import { shouldEnhanceModel } from "../../src/components/three/render-policy";

const capable = {
  reducedMotion: false,
  saveData: false,
  coarsePointer: false,
  narrowViewport: false,
  webglAvailable: true,
};

describe("shouldEnhanceModel", () => {
  it("enhances only a capable desktop environment", () => {
    expect(shouldEnhanceModel(capable)).toBe(true);
    expect(shouldEnhanceModel({ ...capable, reducedMotion: true })).toBe(false);
    expect(shouldEnhanceModel({ ...capable, saveData: true })).toBe(false);
    expect(shouldEnhanceModel({ ...capable, webglAvailable: false })).toBe(false);
  });
});
~~~

- [ ] **Step 2: Run the policy tests**

Run: <code>npm run test:unit -- tests/unit/render-policy.test.ts</code>

Expected: FAIL because the render-policy module does not exist.

- [ ] **Step 3: Implement the pure enhancement policy**

Return true only when every capability matches <code>capable</code>. Keep detection outside the pure function so it can be tested deterministically.

- [ ] **Step 4: Acquire and optimize the licensed asset**

Use the Sketchfab “Download 3D Model” control on [(Low Poly) Server Rack](https://sketchfab.com/3d-models/low-poly-server-rack-07fd533bdc274fe29a0e9a9ebe48e5b3), select glTF, and save the downloaded archive outside the repository. Verify the included license names Thestupidkid1432 and CC BY 4.0.

Extract the source into <code>/private/tmp/ishika-server-rack/</code>. Rename the archive's primary glTF scene file to <code>/private/tmp/ishika-server-rack/source.gltf</code>, keeping its sibling <code>.bin</code> and texture files beside it, then run:

~~~bash
npx gltf-transform optimize /private/tmp/ishika-server-rack/source.gltf public/models/server-rack.glb --compress draco --texture-compress webp
~~~

If the archive's primary scene is already a GLB, rename it to <code>/private/tmp/ishika-server-rack/source.glb</code> and use that exact path in the same command. Do not commit the downloaded archive or extracted source files.

Create <code>CREDITS.md</code> with model name, author, source URL, license name, and license URL. Add a concise footer link labeled “3D model credit”.

- [ ] **Step 5: Implement the scene and progressive wrapper**

Load the GLB with Drei’s <code>useGLTF</code>. Use one perspective camera, ambient fill, indigo rim light, and green emissive materials already present in the model. Clamp pointer-derived rotation to ±0.06 radians and ease toward the target on each frame. Do not attach navigation or click actions to the canvas.

The wrapper must:

1. render the poster as an ordinary image;
2. evaluate policy after hydration;
3. mount the canvas only when policy returns true;
4. remove the canvas and reveal the poster if model loading throws;
5. mark the canvas decorative with an empty accessible name.

- [ ] **Step 6: Capture the real poster**

After the scene renders locally, add <code>scripts/capture-model-poster.mjs</code>. It launches Chromium, opens <code>http://127.0.0.1:4321/</code> at 900×720, waits for <code>[data-model-ready="true"]</code>, screenshots <code>[data-model-stage]</code> to <code>/private/tmp/ishika-server-rack-poster.png</code>, converts it with <code>sharp(...).webp({ quality: 82 })</code>, and writes <code>public/images/server-rack-poster.webp</code>. Run the dev server in one terminal and <code>node scripts/capture-model-poster.mjs</code> in another. The poster must be a render of the licensed rack, not generated substitute art.

- [ ] **Step 7: Write and run the reduced-motion fallback test**

~~~ts
import { expect, test } from "@playwright/test";

test("keeps the poster and skips WebGL for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByAltText("Low-poly server rack")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
~~~

Run: <code>npm run test:unit -- tests/unit/render-policy.test.ts</code>

Expected: PASS.

Run: <code>npm run test:e2e -- tests/e2e/model-fallback.spec.ts</code>

Expected: PASS.

- [ ] **Step 8: Commit**

~~~bash
git add public/models/server-rack.glb public/images/server-rack-poster.webp CREDITS.md scripts/capture-model-poster.mjs src/components/three src/components/home/Hero.astro src/components/SiteFooter.astro tests
git commit -m "feat: add restrained progressive server-rack hero"
~~~

### Task 7: Build Permanent Writing URLs, Article Layout, and RSS

**Files:**
- Create: <code>src/layouts/ArticleLayout.astro</code>
- Create: <code>src/components/CopyLink.astro</code>
- Create: <code>src/pages/writing/index.astro</code>
- Create: <code>src/pages/writing/[slug].astro</code>
- Create: <code>src/pages/rss.xml.ts</code>
- Create: <code>src/lib/urls.ts</code>
- Test: <code>tests/unit/urls.test.ts</code>
- Test: <code>tests/e2e/writing.spec.ts</code>

**Interfaces:**
- Produces <code>canonicalUrl(pathname: string): string</code>.
- Produces <code>writingPath(slug: string): string</code>.
- Article pages receive a collection entry plus rendered <code>Content</code> and headings.

- [ ] **Step 1: Write failing URL tests**

~~~ts
import { describe, expect, it } from "vitest";
import { canonicalUrl, writingPath } from "../../src/lib/urls";

describe("shareable writing URLs", () => {
  it("uses clean title-based slugs", () => {
    expect(writingPath("building-a-calm-3d-portfolio-with-astro")).toBe(
      "/writing/building-a-calm-3d-portfolio-with-astro/",
    );
  });

  it("creates an absolute canonical URL", () => {
    expect(canonicalUrl("/writing/example/")).toBe(
      "https://ishikabhosale.github.io/writing/example/",
    );
  });
});
~~~

- [ ] **Step 2: Run the URL tests**

Run: <code>npm run test:unit -- tests/unit/urls.test.ts</code>

Expected: FAIL because <code>src/lib/urls.ts</code> does not exist.

- [ ] **Step 3: Implement writing routes and metadata**

Generate article paths from published collection entries. Use <code>ArticleLayout</code> for title, description, topic, authored language, dates, reading time, optional table of contents, prose content, copy-link control, and previous/next navigation.

The copy-link button copies the canonical English article URL. When Clipboard API is missing, select a temporary readonly URL input and execute the browser copy command. Announce “Link copied” through an <code>aria-live="polite"</code> region.

- [ ] **Step 4: Generate RSS**

Use <code>@astrojs/rss</code> and include only non-draft articles. Each item receives title, description, publication date, and absolute canonical link.

- [ ] **Step 5: Write the rendered writing test**

~~~ts
import { expect, test } from "@playwright/test";

test("publishes a permanent article URL and social metadata", async ({ page }) => {
  const path = "/writing/building-a-calm-3d-portfolio-with-astro/";
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(path));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Building a Calm 3D Portfolio",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ishikabhosale.github.io" + path,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Calm 3D Portfolio/,
  );
});
~~~

- [ ] **Step 6: Verify writing and RSS**

Run: <code>npm run test:unit -- tests/unit/urls.test.ts</code>

Expected: PASS.

Run: <code>npm run test:e2e -- tests/e2e/writing.spec.ts</code>

Expected: PASS.

Run: <code>npm run build</code>

Expected: PASS and <code>dist/rss.xml</code> exists.

- [ ] **Step 7: Commit**

~~~bash
git add src/layouts/ArticleLayout.astro src/components/CopyLink.astro src/pages/writing src/pages/rss.xml.ts src/lib/urls.ts tests
git commit -m "feat: publish shareable technical writing"
~~~

### Task 8: Add Project Pages and Complete Japanese Interface Routes

**Files:**
- Create: <code>src/layouts/ProjectLayout.astro</code>
- Create: <code>src/pages/work/[slug].astro</code>
- Create: <code>src/pages/ja/writing/index.astro</code>
- Create: <code>src/pages/ja/writing/[slug].astro</code>
- Create: <code>src/pages/ja/work/[slug].astro</code>
- Modify: <code>src/components/home/SelectedWork.astro</code>
- Modify: <code>src/components/LanguageSwitch.astro</code>
- Test: <code>tests/e2e/localized-routes.spec.ts</code>

**Interfaces:**
- Project layout consumes a project collection entry and rendered body.
- Japanese shells reuse the same authored entries and receive <code>locale="ja"</code>.
- Each Japanese duplicate declares the primary English content URL as canonical.

- [ ] **Step 1: Write the failing localized-route test**

~~~ts
import { expect, test } from "@playwright/test";

test("switches interface language without translating authored content", async ({
  page,
}) => {
  await page.goto("/ja/writing/building-a-calm-3d-portfolio-with-astro/");
  await expect(page.getByRole("navigation")).toContainText("記事");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Building a Calm 3D Portfolio",
  );
  await expect(page.locator('html[lang="ja"]')).toHaveCount(1);
});
~~~

- [ ] **Step 2: Run the localized-route test**

Run: <code>npm run test:e2e -- tests/e2e/localized-routes.spec.ts</code>

Expected: FAIL because the Japanese writing and project routes do not exist.

- [ ] **Step 3: Implement project and localized routes**

Generate English and Japanese shell routes at build time. Pass <code>locale</code> into shared layouts rather than copying markup. The language control must calculate its destination through <code>localizedPath()</code> and persist the selected locale after navigation.

Use the same authored Markdown on both shells. Set <code>lang</code> on the article content wrapper to the entry’s <code>language</code>, even when the surrounding document interface is Japanese.

- [ ] **Step 4: Verify routes and canonical behavior**

Run: <code>npm run test:e2e -- tests/e2e/localized-routes.spec.ts</code>

Expected: PASS.

Run: <code>npm run build</code>

Expected: PASS with English and Japanese output trees.

- [ ] **Step 5: Commit**

~~~bash
git add src/layouts/ProjectLayout.astro src/pages/work src/pages/ja src/components tests/e2e/localized-routes.spec.ts
git commit -m "feat: add project pages and Japanese interface routes"
~~~

### Task 9: Finish SEO, Accessibility, 404, and GitHub Pages Deployment

**Files:**
- Create: <code>src/pages/404.astro</code>
- Create: <code>public/robots.txt</code>
- Create: <code>public/social-card.png</code>
- Create: <code>.github/workflows/deploy.yml</code>
- Create: <code>tests/e2e/accessibility.spec.ts</code>
- Create: <code>tests/e2e/responsive.spec.ts</code>
- Create: <code>tests/e2e/metadata.spec.ts</code>
- Create: <code>scripts/check-internal-links.mjs</code>
- Create: <code>scripts/create-social-card.mjs</code>
- Modify: <code>package.json</code>
- Modify: <code>README.md</code>

**Interfaces:**
- Adds <code>npm run check:links</code> and <code>npm run verify</code>.
- Deployment consumes <code>dist/</code> and publishes through the <code>github-pages</code> environment.

- [ ] **Step 1: Write the failing accessibility and metadata tests**

~~~ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("404 offers a route home", async ({ page }) => {
  await page.goto("/404/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Page not found",
  );
  await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute(
    "href",
    "/",
  );
});
~~~

Run: <code>npm run test:e2e -- tests/e2e/accessibility.spec.ts</code>

Expected: FAIL until the final page semantics and 404 route exist.

- [ ] **Step 2: Implement final public assets and 404**

Create <code>scripts/create-social-card.mjs</code> with <code>sharp</code>: resize <code>public/images/server-rack-poster.webp</code> to fit inside the right 540×540 region of a 1200×630 <code>#0b0c10</code> canvas, composite it with an SVG text layer containing “Ishika Bhosale”, “Systems & Cloud Engineer”, a short systems-focused line, and an indigo <code>#8587e8</code> rule, then write <code>public/social-card.png</code>. Run <code>node scripts/create-social-card.mjs</code> and inspect the result at 1200×630. Do not use a generic template image. Add a minimal <code>robots.txt</code> containing <code>User-agent: *</code>, <code>Allow: /</code>, and <code>Sitemap: https://ishikabhosale.github.io/sitemap-index.xml</code>.

Implement English 404 output that detects a remembered Japanese interface preference and offers both home destinations without automatic redirect.

- [ ] **Step 3: Add internal-link validation**

Write <code>scripts/check-internal-links.mjs</code> using <code>node:fs/promises</code> and <code>node:path</code>. Recursively collect <code>dist/**/*.html</code>; extract each double- or single-quoted <code>href</code>; ignore fragments, external origins, <code>mailto:</code>, and <code>tel:</code>; remove query strings and fragments; map <code>/path/</code> to <code>dist/path/index.html</code> and <code>/asset.ext</code> to <code>dist/asset.ext</code>; collect missing targets; print each source/target pair to stderr; and set <code>process.exitCode = 1</code> when any are absent. Add:

~~~json
{
  "scripts": {
    "check:links": "node scripts/check-internal-links.mjs",
    "verify": "npm run format:check && npm run test:unit && npm run build && npm run check:links && npm run test:e2e"
  }
}
~~~

Merge these keys into the existing scripts object; do not replace the earlier commands.

- [ ] **Step 4: Add GitHub Pages deployment**

Create a workflow triggered by pushes to <code>main</code> and manual dispatch. Use Node 22, <code>npm ci</code>, <code>npm run build</code>, <code>actions/configure-pages</code>, <code>actions/upload-pages-artifact</code>, and <code>actions/deploy-pages</code>. Grant only <code>contents: read</code>, <code>pages: write</code>, and <code>id-token: write</code>. Set the deployment environment to <code>github-pages</code>.

- [ ] **Step 5: Complete browser verification**

Add tests at 1536×1024, 768×1024, and 390×844. Verify:

- no horizontal overflow;
- heading and model stage do not overlap;
- mobile menu is keyboard operable;
- reduced motion keeps the poster;
- English/Japanese links remain on equivalent pages;
- canonical and Open Graph URLs are absolute;
- copy-link announces success;
- light and dark themes preserve visible focus.

Run: <code>npm run verify</code>

Expected: every command passes.

- [ ] **Step 6: Perform visual QA against the approved target**

Capture the homepage at 1536×1024. Compare that capture and <code>docs/superpowers/specs/assets/portfolio-homepage-option-3.png</code> together. Fix visible differences in layout proportions, type scale, rack size and position, indigo lighting, header spacing, rule lines, and journal hierarchy. Repeat the paired comparison until no material mismatch remains.

- [ ] **Step 7: Document authoring and deployment**

Update <code>README.md</code> with:

- Node requirement and install commands;
- local development and verification commands;
- exact writing/project frontmatter fields;
- how to add a Markdown article and obtain its URL;
- English/Japanese interface behavior;
- server-rack license location;
- GitHub Pages settings: Source must be GitHub Actions.

- [ ] **Step 8: Final commit**

~~~bash
git add .github public src/pages/404.astro scripts package.json package-lock.json README.md tests
git commit -m "feat: complete accessible GitHub Pages portfolio"
~~~

## Final Verification Checklist

- [ ] <code>git status --short</code> contains no unintended changes.
- [ ] <code>npm run verify</code> passes from a clean install.
- [ ] The homepage visually matches the approved Option 3 reference.
- [ ] The server-rack GLB and poster are local, optimized, and credited.
- [ ] JavaScript-disabled and reduced-motion states preserve content and navigation.
- [ ] English and Japanese interface routes are complete and dictionary keys match.
- [ ] The representative article has a permanent canonical URL and valid social metadata.
- [ ] RSS, sitemap, robots, 404, internal links, and GitHub Pages workflow are present.
- [ ] The branch contains frequent task-level commits and is ready for review before push.
