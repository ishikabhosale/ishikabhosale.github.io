---
title: "Bilingual Systems Portfolio"
summary: "A static Astro portfolio with permanent writing URLs, a bilingual interface, and one progressively enhanced server-rack scene."
slug: "personal-portfolio"
technologies:
  - "Astro"
  - "TypeScript"
  - "React Three Fiber"
  - "GitHub Pages"
featured: true
order: 1
repositoryUrl: "https://github.com/ishikabhosale/ishikabhosale.github.io"
demoUrl: "https://ishikabhosale.github.io"
year: 2026
---

## Problem

Personal engineering sites often force a choice between a memorable visual experience and a fast, readable body of work. The goal was to keep one distinctive interactive element without making navigation or writing depend on animation.

## Approach

The site uses a journal-led layout with a warm near-black palette, restrained indigo accents, and English/Japanese interface routes. Projects and articles live in typed content collections so each entry can become a permanent page.

## Architecture

Astro generates static HTML for GitHub Pages. A single React Three Fiber island owns the server-rack model, while a local poster image covers reduced-motion, touch-first, data-saving, and WebGL failure states. Locale dictionaries translate interface labels without altering authored Markdown.

## Outcome

The repository contains one maintainable publishing system for project pages, technical writing, RSS, and social metadata. The interactive hero remains isolated from the routes people need to read and share.
