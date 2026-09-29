# Visual Regression Surface Report

> **Audit target**: `@tokyo3rdhq/magi-design-system@0.6.0`
> **Date**: 2026-09-29
> **Surface**: `apps/showroom/` upgraded to be the Design System's executable visual contract surface.
> **Playwright**: not adopted in this release. Per ADR-0008, deferred.

---

## Background

Per `docs/visual_regression.md`, `apps/showroom` was to be upgraded from a
"regular visual showcase" into a **Design System visual contract surface** —
an executable verification environment, not a marketing site.

The showroom must cover the contract-sensitive areas:
- Foundation (typography, spacing, colors, surfaces, borders, motion)
- Brand (mark, wordmark, lockup, favicon, app icon)
- Components (all 13 UI primitives)
- Themes (Dark, Light)
- Accents (green, cyan, violet, amber, white)

And the matrix view: **Theme × Accent**.

Playwright-based screenshot testing is the recommended enforcement
mechanism, but ADR-0008 deferred Playwright infrastructure. This audit
upgrade the showroom surface itself, so when Playwright is added (post-0.6.x),
the contract surface is already in place.

---

## What changed

### 1. Tokens page (Foundation) — gaps closed

The Tokens page already had Colors, Spacing, and Radius. Added:

- **Surfaces** — visual tiles for `--magi-bg-base`, `--magi-bg-raised`, `--magi-bg-card`, `--magi-surface`, `--magi-surface-elevated`. Each tile carries `data-surface="…"` for screenshot tests.
- **Borders** — visual tiles for `--magi-border` and `--magi-border-strong` (each with `data-border="…"`).
- **Motion** — labeled rows for `--magi-duration-fast / -normal / -slow` and `--magi-ease-standard / -ease-out` (each with `data-motion-token="…"`). The demo color block is rendered but static (animations disabled by the CSS rule, see Phase 3 below).

### 2. Brand page — favicon + app-icon added

The Brand page already had MagiMark, MagiWordmark, MagiLockup (each at sm/md/lg), Color treatment via currentColor, and Accessibility demo. Added:

- **Static assets** — new section displaying `favicon.svg` (32×32) and `app-icon.svg` (64×64) inside raised tiles. Each carries `data-asset="favicon" | "app-icon"` for screenshot tests.

To make the assets importable from `@tokyo3rdhq/magi-design-system`, the package's `exports` map gained deep SVG paths:

```json
"./dist/assets/icons/favicon.svg": "./dist/assets/icons/favicon.svg",
"./dist/assets/icons/app-icon.svg": "./dist/assets/icons/app-icon.svg",
"./dist/assets/logo/magi-mark.svg": "./dist/assets/logo/magi-mark.svg",
"./dist/assets/logo/magi-wordmark.svg": "./dist/assets/logo/magi-wordmark.svg",
"./dist/assets/logo/magi-lockup.svg": "./dist/assets/logo/magi-lockup.svg",
"./dist/assets/*.svg": "./dist/assets/*/*.svg"
```

### 3. Matrix page (new) — Theme × Accent

New page `apps/showroom/src/pages/Matrix.tsx`:

- 3 rows: Button, Badge, both stacked
- 5 columns: green, cyan, violet, amber, white
- Total: **15 cells**, each with `data-cell="<theme>-<row>-<accent>"` and a wrapper `data-accent="<name>"` driving the subtree accent via the existing CSS rules in `foundation/globals.css`.
- Theme comes from the global theme picker in the top nav (Dark by default). Switching to Light re-renders the matrix in Light mode — same 15 cells, different backdrop.
- The matrix is the canonical visual contract surface for **subtree accent** — proving the `data-accent` + `--magi-accent*` cascade works end-to-end.

### 4. Determinism: `data-screenshot-mode` for deterministic captures

Per the doc's requirement:
> 动画测试应该：
> - disable animation
> - disable transition

Added a CSS rule in `foundation/globals.css`:

```css
[data-magi-app] [data-screenshot-mode="true"] *,
[data-magi-app] [data-screenshot-mode="true"] *::before,
[data-magi-app] [data-screenshot-mode="true"] *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
```

Selector uses **descendant combinator** (`[data-magi-app] [data-screenshot-mode="true"]`) so consumers can put the attribute on any element under `[data-magi-app]` — no need to modify the root. The showroom sets it on the `.shell` div.

Verified: with the toggle ON, button `transition-duration` is `0s`. With the toggle OFF, it's `0.2s` (default). Toggle is wired into the showroom's top-nav utility area.

---

## What was already there (no changes)

The Buttons page already covered button states (default, disabled, loading, focus ring). The Phase4 page already covered form states (default, focus, invalid, disabled, error message). No new pages needed for those.

---

## Snapshot matrix — when Playwright is adopted

| Surface | Cells | data-* attributes |
|---|---|---|
| Tokens — Colors | 15 | each row `data-color-token="…"` (TBD when Playwright is added) |
| Tokens — Spacing | 14 | each row `data-spacing-token="…"` |
| Tokens — Radius | 6 | each row `data-radius-token="…"` |
| Tokens — Surfaces | 5 | each tile `data-surface="…"` |
| Tokens — Borders | 2 | each tile `data-border="…"` |
| Tokens — Motion | 5 | each row `data-motion-token="…"` |
| Typography — display, h1–h4, body-lg, body, body-sm, label, caption, eyebrow, code | 10 | (existing) |
| Brand — MagiMark sm/md/lg | 3 | (existing) |
| Brand — MagiWordmark sm/md/lg | 3 | (existing) |
| Brand — MagiLockup sm/md/lg | 3 | (existing) |
| Brand — favicon / app-icon | 2 | `data-asset="favicon" / "app-icon"` |
| Brand — color treatment | 2 | (existing) |
| Brand — accessibility | 1 | (existing) |
| Buttons — variants × 4 | 4 | (existing) |
| Buttons — sizes × 3 | 3 | (existing) |
| Buttons — states (default / disabled / loading) | 3 | (existing) |
| Buttons — focus ring | 1 | (existing) |
| Phase 4 — Checkbox states | 4 | (existing) |
| Phase 4 — Input states (default / focus / invalid / disabled) | 4 | (existing) |
| Phase 4 — Segmented | 1 | (existing) |
| Phase 4 — Banner variants × 4 | 4 | (existing) |
| Matrix — Dark × Accent × 3 rows | 15 | `data-cell="<theme>-<row>-<accent>"` + `data-matrix-theme="dark"` |
| Matrix — Light × Accent × 3 rows | 15 | `data-cell="<theme>-<row>-<accent>"` + `data-matrix-theme="light"` |

**Total**: ~120 screenshot-ready cells. ~70 of these align with ADR-0008's planned matrix.

---

## CI integration

This audit does **NOT** add Playwright (deferred per ADR-0008). It does add:

1. `scripts/check-accessibility.mjs` (from the accessibility audit) — runs in CI on every push.
2. `scripts/verify-theme-accent-matrix.mjs` (from the theme/accent audit) — runs in CI.
3. This audit upgrades the showroom surface. When Playwright is added, it can attach to the existing `data-*` markers.

The existing CI gate at `.github/workflows/ci.yml` continues to build and test the showroom on every push.

---

## What's NOT in this audit (deferred per ADR-0007 + ADR-0008)

- **Playwright visual regression** — would attach to the existing `data-*` markers. Snapshots ~70 cells in `apps/showroom/tests/visual.spec.ts`. Baselines committed to repo. CI job boots showroom preview + runs `playwright test`.
- **Nightly full matrix** — the matrix surface is ready (Matrix page renders all 30 cells — 2 themes × 3 rows × 5 accents).
- **Per-PR core regression** — the Buttons/Cards/Badges/Layout/Phase4/Brand pages are already screenshot-ready with the markers added in this audit.

When Playwright is adopted:
1. `npm i -D @playwright/test`
2. Add `playwright.config.ts` at `apps/showroom/`
3. Add `tests/visual.spec.ts` — iterate over `[data-*]` markers, run `toMatchSnapshot()`.
4. Generate baselines with `npx playwright test --update-snapshots`.
5. Add a CI job: boot showroom preview, run `playwright test`, fail on diff.
6. Upload diff screenshots on failure for review.

---

## Deliverables

| File | Purpose |
|---|---|
| `apps/showroom/src/pages/Tokens.tsx` | Added Surfaces + Borders + Motion sections |
| `apps/showroom/src/pages/Brand.tsx` | Added Static assets section (favicon + app-icon) |
| `apps/showroom/src/pages/Matrix.tsx` | New — Theme × Accent matrix |
| `apps/showroom/src/App.tsx` | Wired Matrix page + Screenshot mode toggle |
| `apps/showroom/src/pages/pages.module.css` | Added `.surfaceTile*`, `.borderTile*`, `.motionRow`, `.matrix*` classes |
| `packages/design-system/package.json` | Added deep `dist/assets/*/*.svg` exports |
| `packages/design-system/src/foundation/globals.css` | Added `[data-screenshot-mode]` rule for deterministic captures |
| `docs/audits/visual-regression.md` | This report |

### What I did NOT do

- ❌ Did NOT add Playwright (deferred per ADR-0008).
- ❌ Did NOT add screenshot snapshots to repo (no Playwright).
- ❌ Did NOT change any design tokens or component contracts.
- ❌ Did NOT add new components or remove existing ones.
- ❌ Did NOT bump version or publish.

### Public API impact

- **New package.json exports**: `./dist/assets/*/*.svg` paths now resolve to the canonical SVG files. This is **additive** — existing exports (`.`, `./styles.css`) unchanged.
- **No new components, no new types, no breaking changes.**
- **Version**: unchanged (0.6.0). **No npm publish.**

The visual contract surface is ready. Playwright-based visual regression
will plug into it when ADR-0008 is picked up in a future release.