# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Documentation site for [Pixel Agents](https://github.com/pablodelucca/pixel-agents), a VS Code extension that visualizes AI agents as pixel art characters in an office. Built with VitePress 2 (alpha).

## Commands

```bash
npm run docs:dev       # Start dev server with hot reload
npm run docs:build     # Build static site to docs/.vitepress/dist
npm run docs:preview   # Preview the built site locally
```

## Structure

- `docs/` — All content lives here
  - `index.md` — Home page (VitePress frontmatter layout)
  - `guide/*.md` — Documentation pages
  - `.vitepress/config.ts` — Site config: nav, sidebar, search, social links, footer
  - `.vitepress/dist/` — Build output (gitignored)
  - `.vitepress/cache/` — Dev cache (gitignored)

## Sidebar & Navigation

The sidebar is manually defined in `docs/.vitepress/config.ts`. When adding or renaming a page, update both the markdown file and the sidebar config.

## Theme & Styling

Custom theme lives in `docs/.vitepress/theme/`:
- `index.ts` — Extends VitePress default theme with a custom layout and CSS
- `custom.css` — All style overrides: pixel font, colors, sizing
- `CustomLayout.vue` — Adds pixel characters image to the nav bar

Key design decisions:
- **Font**: "Sonic Advanced 2" (`public/fonts/SonicAdvanced2.ttf`) used for headings, nav, sidebar titles, hero, and feature cards. Body text stays as default (Inter) for readability.
- **Colors**: Dark mode background and borders match the Pixel Agents VS Code extension (`--pixel-bg: #1e1e2e` palette). Accent color is purple.
- **Pixel art**: Characters sprite (`public/characters.png`) rendered at native 160x36px with `image-rendering: pixelated` for crisp 1:1 pixels.
