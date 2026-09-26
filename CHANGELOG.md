# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-09-26

### Added

- **`@tokyo3rdhq/magi-design-system` package** — first published release
- **Tokens** (`src/tokens/`)
  - `colors.css` — background, surface, text, border, accent, semantic tokens on `:root`
  - `typography.css` — Inter + mono stack, semantic scale (`display`, `h1`–`h4`, `body`, `label`, `caption`, `eyebrow`, `code`), tracking, leading
  - `spacing.css` — `--magi-space-0` … `--magi-space-40` coherent scale
  - `radius.css` — `sm` / `md` / `lg` / `xl` / `2xl` / `full`
  - `motion.css` — `duration-fast` / `normal` / `slow`, `ease-standard` / `emphasized` / `out`
  - `breakpoints.css` — `sm` / `md` / `lg` / `xl` / `2xl`
  - `misc.css` — z-index, container widths, shadows, `--magi-focus-ring`
- **Foundation** (`src/foundation/`)
  - `reset.css` — box-sizing, button/input/link normalization
  - `globals.css` — dark gradient backdrop, font baseline, scrollbar, focus-visible, reduced-motion — all scoped to `body[data-magi-app]`
  - `typography.css` — `.magi-display` / `.magi-h1`–`.magi-h4` / `.magi-body-lg` / `.magi-body` / `.magi-body-sm` / `.magi-label` / `.magi-caption` / `.magi-eyebrow` / `.magi-code` utility classes
- **Layout primitives** (`src/layout/`)
  - `<Container size="sm | md | lg | xl | wide | full" />` — centers content, constrains max-width
  - `<Section spacing="sm | md | lg | xl" surface="default | raised | elevated" fullWidth />`
  - `<Stack direction="row | column" gap="…" align="start | center | end | stretch" />`
- **UI primitives** (`src/components/`)
  - `<Button variant="primary | secondary | ghost | danger" size="sm | md | lg" loading />`
  - `<Card variant="default | elevated | interactive" padding="none | sm | md | lg" />`
  - `<Badge variant="neutral | accent | success | warning | error" dot />`
- **Product theme** (`src/theme.tsx`)
  - `<ProductTheme accent="green | cyan | violet | amber | white" name="…" tokens={{…}}>` — overrides the MAGI accent for a subtree
- **Build**
  - Vite library mode emits `dist/index.js` (ESM) + `dist/styles.css` (tokens + foundation + all components)
  - `tsc -p tsconfig.build.json` emits `.d.ts` declarations
  - `package.json` `exports` map: `"."` (JS + types) and `"./styles.css"`
- **Showroom (`apps/showroom`)** — Vite + React + TS demo app with 6 pages (Tokens, Typography, Buttons, Cards, Badges, Layout) and a live accent picker

### Notes

- Spec source: [`docs/magi_design_system.md`](./docs/magi_design_system.md). Follows §30 Phase 1 only.
- Out of scope for 0.1.0: Navbar, Footer, Tabs, Input, CodeBlock, ProductHeader (Phase 4).
- Out of scope for 0.1.0: Phase 2 (magi-portal migration) and Phase 3 (token-factory-initializr migration).

[0.1.0]: https://github.com/tokyo3rdhq/magi-design-system/releases/tag/v0.1.0