# `@tokyo3rdhq/showroom`

Local visual showcase for `@tokyo3rdhq/magi-design-system`. Used during package development to confirm every token, primitive, and component renders correctly. **Not published.**

## What it is

- Vite + React 18 + TypeScript app
- Seven pages: **Tokens**, **Typography**, **Buttons**, **Cards**, **Badges**, **Layout**, **Phase 4**
- Sticky top nav with live accent picker (`green` / `cyan` / `violet` / `amber` / `white`)
- file: linked to `../../packages/design-system` (symlink-installed by npm)
- Picks up accent changes live via `data-magi-accent` subtree overrides on the Phase 4 page

## Run it

```bash
# 1. Make sure the package is built (or running in watch mode)
cd ../../packages/design-system
npm run dev   # vite build --watch — emits dist/{index.js, styles.css}

# 2. In a separate shell
cd ../../apps/showroom
npm install   # only needed once; symlink is set up by the workspace install
npm run dev    # http://127.0.0.1:5173
```

The showroom has its own top-level CSS modules (`App.module.css`, `pages.module.css`) for app-shell styling — those are **not** part of the design system and are not exported.

## Pages

| Page | Demonstrates |
| --- | --- |
| **Tokens** | Every color, spacing, radius token via swatches and bars |
| **Typography** | The full scale: display, h1–h4, body, label, caption, eyebrow, code |
| **Buttons** | Variants (primary / secondary / ghost / danger), sizes (sm / md / lg), states (default / disabled / loading / focus) |
| **Cards** | Variants (default / elevated / interactive), padding (none / sm / md / lg) |
| **Badges** | Variants (neutral / accent / success / warning / error), dot modifier, in-context usage |
| **Layout** | Container sizes, Section spacing × surface, Stack (vertical + horizontal) |
| **Phase 4** | All 6 primitives from 0.2.0 (Checkbox / FormField / Input / Segmented / Banner / EmptyState) with live state, including the providers-as-checkbox-group pattern |

## When to update the showroom

- A new primitive ships → add a page or section
- A new token is added → add it to the Tokens swatch grid
- A variant is renamed → update the page that demonstrates it
- Visual regressions appear → use the showroom to bisect
- A primitive's API changes (e.g. prop rename) → update the consuming page

The showroom should never import anything outside the design system and React. If a page needs new app-shell styling, prefer using existing design system primitives.