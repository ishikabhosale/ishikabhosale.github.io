---
title: "Building a Calm 3D Portfolio with Astro"
description: "How I balanced a focused engineering portfolio with one restrained interactive 3D element."
publishedAt: 2026-07-31
slug: "building-a-calm-3d-portfolio-with-astro"
language: "en"
topic: "Web Engineering"
draft: false
featured: true
repositoryUrl: "https://github.com/ishikabhosale/ishikabhosale.github.io"
---

A portfolio should make the work easier to understand. It should not make the visitor fight the interface. That became the central constraint for this site: keep the character of an interactive engineering portfolio, but give every effect a clear job.

## Start with the reading experience

The journal, project summaries, and experience notes are ordinary static HTML. Astro builds them ahead of time, so they remain fast, searchable, and readable even when JavaScript is unavailable.

The visual system follows the same principle. A warm near-black canvas, ivory type, thin rules, and restrained indigo accents create hierarchy without filling the page with generic cards. Small monospace labels carry technical metadata while the main text stays comfortable to read.

## Isolate the expensive part

The server rack is the only 3D object on the site. React Three Fiber lives in one client island around that model; the rest of the page ships as static Astro components.

Before the island loads, the hero shows a real poster render of the rack. Reduced-motion preferences, data-saving mode, touch-first devices, narrow screens, missing WebGL, and model-load errors all keep that poster in place. The interactive state is an enhancement, never a requirement.

## Give articles permanent addresses

Each article receives a title-based URL such as `/writing/building-a-calm-3d-portfolio-with-astro/`. Dates appear in the article metadata, not in the path, so sharing an older post does not create a brittle link.

Canonical metadata, Open Graph tags, RSS, and a copy-link control all point to the same address. That makes a Markdown file useful beyond the portfolio homepage: it can be sent directly, bookmarked, or read through a feed reader.

## Translate the interface, preserve the voice

English and Japanese routes share one set of authored project and article bodies. Navigation, controls, headings, and status messages switch languages, while the original writing stays intact and carries its own language metadata.

This keeps the first version maintainable and honest. A full translation can be added article by article later without pretending machine-translated technical writing is the same as an authored edition.

## Keep the system replaceable

Content schemas make the required fields explicit, while profile and experience data live in small typed modules. The initial public information can be replaced with resume-derived copy without rebuilding the layouts.

The result is intentionally quiet: one memorable object, a strong writing surface, and a static architecture that respects the reader.
