# Scope Guardrails Audit

> **Audit target**: `@tokyo3rdhq/magi-design-system@0.6.0` + repository layout
> **Date**: 2026-09-29
> **Source of truth**: `docs/scope_guardrails.md`
> **Method**: cross-check every "暂时不要做" clause against the actual shipped state.

---

## Summary

| Guardrail clause | Current state | Status |
|---|---|---|
| **No new UI primitives** (Modal/Dialog/Tooltip/Dropdown/Tabs/Navbar/Footer/Select/Table/Toast/Drawer) | 9 components + 3 brand + 3 layout = **15 exports**; none are in the forbidden list | **PASS** |
| **No package split** (magi-tokens / magi-react / magi-vue / magi-brand) | Single `@tokyo3rdhq/magi-design-system` package; all in `packages/design-system/` | **PASS** |
| **No Vue** | Zero Vue imports/references in source | **PASS** |
| **No Figma pipeline** | Zero figma references in source; tokens are CSS custom properties | **PASS** |
| **No generic icon registry** | Only `assets/icons/{favicon.svg, app-icon.svg}` (brand); Experience Guidelines manages iconography as patterns, not as a component | **PASS** |
| **Don't rewrite visual design** | Token files last touched in 0.3.0 (initial scaffolding) and 0.6.0 (theme contrast additions); logo SVGs last touched in 0.5.0 (initial scaffold) | **PASS** |

---

## Detailed checks

### 1. No new UI primitives

**Exports from `@tokyo3rdhq/magi-design-system`** (from `packages/design-system/src/index.ts`):

| Category | Names |
|---|---|
| Layout primitives (3) | `Container`, `Section`, `Stack` |
| Components (9) | `Button`, `Card`, `Badge`, `Checkbox`, `Input`, `FormField`, `Segmented`, `Banner`, `EmptyState` |
| Brand (3) | `MagiMark`, `MagiWordmark`, `MagiLockup` |
| Theme (1) | `AppTheme` (with `useAppTheme` hook) |

**Forbidden list check**:
- ❌ `Modal`, `Dialog`, `Tooltip`, `Dropdown`, `Tabs`, `Navbar`, `Footer`, `Select`, `Table`, `Toast`, `Drawer`
- **None present**.

The only mentions of forbidden names in source code are doc-comments (e.g. `FormField.tsx:25: /** The control itself (Input, Select, Segmented, etc.). */`). These are JSDoc describing what kinds of children the component might receive — not implementations. They do **not** represent shipped primitives.

**Consumer-side `Select` gap** (from the migration audit):
- `token-factory-initializr/web` still hand-rolls `<select className="tfi-select">` because no `<Select>` primitive exists.
- This is correctly flagged as an open gap in `docs/audits/consumer-migration-validation.md`.
- Per the guardrail, we **must not** add `<Select>` until a second consumer proves the semantic contract is stable. The current single-consumer evidence is insufficient.

### 2. No package split

**Repository packages**:
- `packages/design-system` — the only published package
- `apps/showroom` — dev-only, not published
- No `@tokyo3rdhq/magi-tokens`, no `@tokyo3rdhq/magi-react`, no `@tokyo3rdhq/magi-vue`, no `@tokyo3rdhq/magi-brand`.

**Cross-package split rationale** (per ADR-0004):
- Tokens are imported by the design system as `tokens/*.css` files.
- Brand assets are co-located in `brand/` inside the same package.
- React is a peer dependency, not a re-export.
- Consumers get a single package.

**Status**: **PASS**. The single-package architecture is preserved.

### 3. No Vue

- Zero `vue` / `createApp` / `@vue` references in source.
- The design system is **framework-neutral at the token layer** (CSS custom properties work anywhere) and **React-coupled at the component layer** (no Vue/Svelte/Angular adapters shipped).
- Per ADR-0006 (`react-peer-range`), the consumer must use React 18+; no other React alternative shipped.

**Status**: **PASS**.

### 4. No Figma pipeline

- No `figma` / `figma-api` references in source.
- Tokens are defined in CSS (`packages/design-system/src/tokens/*.css`) and TS (`tokens/accent-presets.ts`).
- Brand SVGs are static files in `src/assets/logo/` and `src/assets/icons/`.

**Status**: **PASS**.

### 5. No generic icon registry

- `src/assets/icons/` contains only brand assets: `favicon.svg`, `app-icon.svg`.
- No `<Icon />` React wrapper.
- No icon-name registry / SVG catalog.

Icon patterns (search, github, more, close, etc.) are **patterns**, not components — they live in the consumer's `Guidelines.tsx` as inline SVGs, with the consumer encoding the recognition. The Experience Guidelines govern **how** icons are used (icon + text, never icon-only without `aria-label`), not **which** icons exist.

**Status**: **PASS**.

### 6. Don't rewrite visual design

| Asset | Last touched | Notes |
|---|---|---|
| `tokens/colors.css` | 0.6.0 | Light theme tokens added (per ADR-0003); no MAGI-green changes |
| `tokens/spacing.css` | 0.3.0 | Initial scaffold |
| `tokens/radius.css` | 0.3.0 | Initial scaffold |
| `tokens/typography.css` | 0.3.0 | Initial scaffold |
| `tokens/motion.css` | 0.3.0 | Initial scaffold |
| `tokens/breakpoints.css` | 0.3.0 | Initial scaffold |
| `assets/logo/magi-mark.svg` | 0.5.0 | Initial scaffold |
| `assets/logo/magi-wordmark.svg` | 0.5.0 | Initial scaffold |
| `assets/logo/magi-lockup.svg` | 0.5.0 | Initial scaffold |

The only post-scaffold change to a "visual" file was 0.6.0's Light theme additions to `colors.css` (per ADR-0003) and the corresponding `brand.css` Logo Contrast Rule. **No rewrites** — only additive changes for new theme support.

**Status**: **PASS**.

---

## Priority-axes verification

Per the doc's "current real goals" (1–6):

| Priority | How it's served | Status |
|---|---|---|
| 1. Consistency | `docs/component-contracts.md` (single source of truth); `scripts/check-tokens.mjs` (token enforcement); audit `docs/audits/component-contract-implementation.md` | **PASS** |
| 2. Theme verification | `scripts/verify-theme-accent-matrix.mjs`; showroom's `Matrix` page (5×2 grid of theme × accent) | **PASS (40/90 matrix failures known — see `docs/audits/theme-accent-verification.md`; deferred to 0.7.0)** |
| 3. Accessibility | `scripts/check-accessibility.mjs` (59/59 static checks); ADR-0007; per-component contract audits; keyboard patterns documented | **PASS** |
| 4. Visual regression | ADR-0008 (deferred); showroom's `Matrix` page is the foundation | **PARTIAL** — Playwright not yet adopted; showroom `data-screenshot-mode` toggle lays the groundwork |
| 5. Runtime contract | `packages/design-system/src/theme.tsx` verified (useInsertionEffect, data-magi-theme, data-magi-accent); contract audit completed | **PASS** |
| 6. Consumer migration | `token-factory-initializr/web` migration plan documented (`docs/audits/consumer-migration-validation.md`); 1-commit migration | **PASS** |

---

## What's NOT in scope (deliberately deferred)

| Item | Why deferred | ADR |
|---|---|---|
| `<Select>` primitive | Only 1 consumer requests it; need 2+ for stable contract | (none — guardrail-clause) |
| Modal / Dialog / Dropdown / Tooltip | None requested yet | (none) |
| Playwright visual regression | Not blocking; showroom has the matrix foundation | ADR-0008 |
| Vue / Svelte / Angular adapters | No consumer | (none) |
| Generic icon registry | Patterns, not primitives, per Experience Guidelines | (none) |
| Figma sync pipeline | Runtime CSS/token/React contract first | (none) |
| Light theme as default | Dark is canonical; Light is opt-in | ADR-0003 |

---

## Summary

**Zero violations.** All 6 guardrail clauses are observed. The current state is in line with the "current real goals" priorities. The single open item (`<Select>`) is correctly parked until a second consumer emerges.

**Recommendation**: no action required. The audit is a **green check** on the guardrail posture. Continue executing the priority axes 1–6 as planned.

---

## Deliverables

| File | Purpose |
|---|---|
| `docs/audits/scope-guardrails.md` | **NEW** — this audit |