# Ishika Bhosale — personal portfolio

An Astro portfolio for systems and cloud engineering work. The site is static-first, bilingual at the interface level (English and Japanese), and publishes writing as permanent URLs.

## Local development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run check          # Astro type and template diagnostics
npm run test:unit      # Vitest unit tests
npm run test:e2e       # Playwright browser tests
npm run test:links     # Verify links in the generated dist/ directory
npm run verify         # Formatting, unit tests, build, and link checks
```

The local preview runs at `http://127.0.0.1:4321/` by default.

## Content workflow

- Add English articles to `src/content/writing/` as Markdown or MDX.
- Give each article a stable, title-based `slug`; the public URL becomes `/writing/<slug>/`.
- Add projects to `src/content/projects/` with the fields validated in `src/content.config.ts`.
- Interface labels live in `src/i18n/en.ts` and `src/i18n/ja.ts`. Authored article and project bodies are not machine-translated.
- RSS is generated at `/rss.xml`.

## Deployment

The repository includes `.github/workflows/deploy.yml` for GitHub Pages. Enable **Settings → Pages → GitHub Actions** in the repository, then push to `main`. Astro is configured for the canonical origin `https://ishikabhosale.github.io`.

## Hero asset

The interactive hero uses a locally hosted GLB with a poster fallback. Attribution is documented in [CREDITS.md](CREDITS.md). The model is intentionally isolated in one React Three Fiber island; reduced motion, save-data mode, touch-first devices, narrow viewports, missing WebGL, and load errors remain on the static poster.
