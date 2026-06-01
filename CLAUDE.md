# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Documentation site for [Pixel Agents](https://github.com/pixel-agents-hq/pixel-agents), a VS Code extension that visualizes AI agents as pixel art characters in an office. Built with Docusaurus 3.

## Commands

```bash
pnpm start       # Start dev server with hot reload
pnpm run build   # Build static site to build/
pnpm run serve   # Preview the built site locally
pnpm run clear   # Clear Docusaurus cache
```

## Structure

- `docs/` — Markdown content, nested by section
  - `introduction/` — what-is-pixel-agents, getting-started, features
  - `using-the-office/` — layout-editor
  - `assets/` — overview, characters, furniture, walls, floors
  - `advanced/` — how-it-works, troubleshooting
  - `community/` — contributing, roadmap
- `src/` — React components and custom theme
  - `pages/index.tsx` — Home page shell, composes Hero + Features components
  - `components/Hero.tsx` — Hero section with characters image, title, CTA buttons
  - `components/Features.tsx` — Feature card grid
  - `components/*.module.css` — CSS modules co-located with components
  - `css/custom.css` — Infima variable overrides, pixel font, dark mode palette
  - `css/fonts/` — Custom pixel font
- `static/img/` — Images (favicon, characters sprite, office preview)
- `docusaurus.config.ts` — Main site config: nav, theme, footer, deployment
- `sidebars.ts` — Auto-generated from folder structure
- `build/` — Build output (gitignored)

## Sidebar & Navigation

The sidebar is auto-generated from the `docs/` folder structure. Ordering is controlled by:
- `_category_.json` in each folder (sets label and position)
- `sidebar_position` frontmatter in each doc

When adding a new page, place it in the right folder and set its `sidebar_position`.

## Theme & Styling

Uses CSS modules for component styles and Infima variable overrides for global theming:
- `css/custom.css` — Infima CSS variable overrides (colors, fonts), dark mode palette, Docusaurus component selectors
- `components/*.module.css` — CSS modules co-located with their React components

Key design decisions:
- **Font**: "Sonic Advanced 2" (`src/css/fonts/SonicAdvanced2.ttf`) used for headings, nav, sidebar titles, hero, and feature cards via `--pixel-font` CSS variable. Body text stays as default for readability.
- **Colors**: Dark mode background and borders match the Pixel Agents VS Code extension (`#16162a` palette). Accent color is purple.
- **Pixel art**: Characters sprite (`static/img/characters.png`) rendered at 2x (320x72px) with `image-rendering: pixelated` for crisp pixels.
