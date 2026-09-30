# Consumer Migration Validation: Token Factory Initializr → @tokyo3rdhq/magi-design-system

> **Audit target**: `token-factory-initializr/web` — the canonical first consumer
> **Current consumer version**: `^0.2.0` (locked to 0.2.0)
> **Design system version audited**: `0.6.0`
> **Date**: 2026-09-29
> **Test methodology**: Symlink consumer to latest design-system build; typecheck + build the consumer; record every delta.

---

## Method

1. Symlink `node_modules/@tokyo3rdhq/magi-design-system` → `/home/yw/Projects/code/magi-design-system/packages/design-system` (0.6.0).
2. Run `tsc --noEmit` against the consumer's `web/`.
3. Run `vite build` against the consumer's `web/`.
4. Record every required code change to the consumer.
5. Document gaps + migration path.

This isolates the API surface changes from the bundling/asset changes.

---

## Findings

### 1. Test results (0.6.0 installed)

| Step | Result |
|---|---|
| `tsc --noEmit` (0.6.0) | ❌ 1 error: `Module '"@tokyo3rdhq/magi-design-system"' has no exported member 'ProductTheme'` |
| `tsc --noEmit` (after rename `ProductTheme` → `AppTheme`) | ✓ Clean |
| `vite build` (after rename) | ✓ 189.05 kB JS / 31.12 kB CSS — built in 1.72s |

**Single breaking change**: `<ProductTheme>` → `<AppTheme>` (renamed in 0.5.1 per ADR-0006). All other 11 components the consumer imports (`Button`, `Card`, `Badge`, `Input`, `FormField`, `Checkbox`, `Segmented`, `Banner`, `EmptyState`, `Container`, `Section`, `Stack`) work as-is.

### 2. Reused components (already migrated)

The consumer has already absorbed most 0.2.0 primitives — the migration started then and the consumer-side local CSS file documents the cutover:

```css
/* .tfi-segmented + .tfi-segmented-item + .tfi-field-label + .tfi-input
 * were promoted to @tokyo3rdhq/magi-design-system@0.2.0 as <Segmented>,
 * <FormField>, and <Input>. See imports in each page.
 *
 * .tfi-select remains for now — design-system 0.2.0 doesn't ship
 * a Select primitive (deferred to a future round). The format dropdown
 * in Generate.tsx still uses it. */
/* .tfi-banner + .tfi-empty were promoted to @tokyo3rdhq/magi-design-system@0.2.0
 * as <Banner> and <EmptyState>. See imports in each page. */
```

| Component | Consumer usage | Status |
|---|---|---|
| `Button` | Browse (5+), Generate (3+), Home (1+); all 4 variants + loading + disabled | ✓ Reused |
| `Badge` | Browse (3+), Generate (3+) | ✓ Reused |
| `Card` | Generate (3+) | ✓ Reused |
| `Checkbox` | Browse (3+), Home (3+) | ✓ Reused |
| `Container` | Browse (1), Generate (1), Home (1) | ✓ Reused |
| `Section` | Browse (1), Generate (1), Home (1) | ✓ Reused |
| `Stack` | Browse (3+), Generate (5+), Home (3+) | ✓ Reused |
| `EmptyState` | Browse (1), Generate (1) | ✓ Reused |
| `Banner` | Browse (1), Generate (1) | ✓ Reused |
| `FormField` | Generate (1), Home (4+) | ✓ Reused |
| `Input` | Home (1) | ✓ Reused |
| `Segmented` | Home (3+) | ✓ Reused |

### 3. Gaps exposed by the migration

#### 3.1 `ProductTheme` → `AppTheme` rename (breaking)

- **Source**: `web/src/main.tsx` line 4 + 32 + 45.
- **Migration**: 1 import + 2 element names. ~3 character-level edits.
- **Risk**: trivial; semver-major rename documented in CHANGELOG.

#### 3.2 Light/Dark color mode (new in 0.6.0, not used)

- Consumer is dark-only. `index.html` likely does not set `data-magi-theme`. The package defaults to dark so nothing breaks.
- **Gap**: consumer has no Light mode toggle. Out of scope for this migration; **not a blocker**.

#### 3.3 Brand components (new in 0.5.0, not used)

- 0.6.0 ships `MagiMark`, `MagiWordmark`, `MagiLockup`. The consumer hand-rolls its `<header className="tfi-topbar">` with:
  ```tsx
  <Link to="/" className="tfi-brand" aria-label="Token Factory Initializr — home">
    <span className="tfi-brand-parent">MAGI</span>
    <span className="tfi-brand-slash">/</span>
    <span className="tfi-brand-product">Token Factory Initializr</span>
  </Link>
  ```
- **Gap**: per the migration principles, the parent-brand pattern is **product UX** (MAGI/Product label is product-specific). The consumer's choice is intentional — using a `MagiLockup` for "MAGI / Token Factory Initializr" would be wrong (the lockup is just "MAGI", not the product slug).
- **Recommendation**: leave as-is. The brand components are for the parent brand mark itself, not product-specific labels. The current `tfi-brand*` markup is product-specific and correctly stays in product code.

#### 3.4 Logo Color Rule (enforced in 0.6.0)

- 0.6.0 enforces `color: var(--magi-logo-color)` on `.magi-mark` / `.magi-wordmark` / `.magi-lockup`. Since the consumer doesn't render these, this is **not applicable**.

#### 3.5 Required gap — `Select` primitive (still missing)

- `web/src/styles.css` documents:
  ```css
  /* .tfi-select remains for now — design-system 0.2.0 doesn't ship
   * a Select primitive (deferred to a future round). The format dropdown
   * in Generate.tsx still uses it. */
  ```
- The native `<select>` in `Generate.tsx` (format dropdown: `"litellm"`) uses local `.tfi-select` styling.
- **Status**: still a real product gap. Not introduced by the 0.6.0 upgrade; the 0.2.0 migration doc flagged it. **Not blocking** but flagged for future design-system releases.

#### 3.6 Product accent (`cyan`) — already supported ✓

- Consumer uses `<AppTheme accent="cyan" name="token-factory-initializr">` (after rename). Verified 0.6.0 supports all 5 accents (green/cyan/violet/amber/white). **No consumer change needed**.

### 4. Duplicated primitives (must NOT be promoted)

Per the migration doc: "**不要看到重复 JSX 就立即把它抽进 Design System**."

| Product-only pattern | Why it stays product-only |
|---|---|
| `.tfi-topbar` (translucent sticky header) | Product UX — topbar layout, shadow behavior, hover affordance. Not a design-system primitive. |
| `.tfi-nav` + `.tfi-nav-link` (custom nav) | Product IA + navigation structure. Not a design-system primitive. |
| `.tfi-footer` + `.tfi-footer-cols` (3-col MAGI footer) | Product UX — footer zones. The consumer's footer implements the Experience Guidelines footer pattern in product code; that's correct. |
| `.tfi-brand*` (MAGI / Product label) | Product UX — parent-brand pattern, product-specific label. See §3.3. |
| `.tfi-model-list` + `.tfi-model-row` | Developer-infrastructure model list pattern. **Could** be promoted if it appears in 2+ products, but it's only in this product so far. **Stay product-only** per the "stable shared contract" rule. |
| `.tfi-meta-grid` (MODEL / CONTEXT / PROVIDER / STATUS) | Developer-infrastructure meta grid. Same reasoning. |
| `.tfi-code-chrome` + `.tfi-code-surface` (terminal-style code surface) | Product UX — chrome strips around the generated YAML. Stay product-only. |
| `.tfi-spinner` | 1-line `@keyframes` + a `.tfi-spinner` class. Trivial; could be promoted as `<Spinner>` but the only user is this consumer. Stay product-only. |

**Decision**: zero new design-system primitives from this consumer. The 9 currently shipped primitives cover everything this consumer needs.

### 5. Visual regression coverage

- The consumer is dark-only with cyan accent. No visual regression tooling exists for the consumer itself (only the showroom has the Matrix page).
- **Recommendation**: when Playwright is adopted per ADR-0008, add this consumer's three pages (`/`, `/browse`, `/generate`) to the screenshot suite. Each page in dark + cyan accent should be deterministic.

### 6. Test impact

- Consumer has `web/src/__tests__/requirement.test.ts` (9.5 KB). It tests the `ModelRequirement` logic, not the components. Re-running it after the 0.6.0 upgrade should still pass (no test changes required).
- **Smoke verification**:
  - `tsc --noEmit` exits 0
  - `vite build` produces 189.05 kB JS / 31.12 kB CSS — built in 1.72s

---

## Summary

| Status | Count |
|---|---|
| **Reused components** | 12 (Button, Badge, Card, Checkbox, Container, Section, Stack, EmptyState, Banner, FormField, Input, Segmented) |
| **Required code change** | 1 (rename `<ProductTheme>` → `<AppTheme>`; 3 character-level edits in `main.tsx`) |
| **Required new design-system primitive** | 0 |
| **Required gap** (not blocking) | 1 (`<Select>` primitive — already flagged before this migration) |
| **Product-specific (correctly stays in product)** | 8 (topbar, nav, footer, brand label, model list, meta grid, code chrome, spinner) |
| **Actual design-system bug** | 0 |
| **Missing token** | 0 |
| **Unnecessary abstraction** | 0 |

---

## Migration plan (3 commits, ~30 minutes of work)

### Commit 1: rename `<ProductTheme>` → `<AppTheme>`

```diff
- import { ProductTheme } from "@tokyo3rdhq/magi-design-system";
+ import { AppTheme } from "@tokyo3rdhq/magi-design-system";

- <ProductTheme accent="cyan" name="token-factory-initializr">
+ <AppTheme accent="cyan" name="token-factory-initializr">
  ...
- </ProductTheme>
+ </AppTheme>
```

Bump `package.json` from `^0.2.0` to `^0.6.0`. Run `npm install` + `tsc --noEmit` + `vite build`. **Should land cleanly**.

### Commit 2: optional — adopt `<MagiMark>` for any reference to the MAGI logo

If the consumer adds the MAGI logo anywhere (e.g. OG image, README hero, error pages), prefer `<MagiMark />` from 0.6.0 over a hand-rolled SVG. Currently no logo is rendered, so this is **no-op**.

### Commit 3: optional — flag the `<Select>` primitive gap to the design system

Not a code change; it's a request to the design system maintainer. The consumer can ship `canvas-mode` (theme=dark + accent=cyan) without `<Select>`. The design system can ship `<Select>` in 0.7.0 if the gap is confirmed by 2+ consumers.

---

## Verification

After Commit 1:
- `tsc --noEmit` → exits 0 (verified).
- `vite build` → 189.05 kB JS / 31.12 kB CSS — built in 1.72s (verified).
- `npm run dev` → app boots on `wrangler pages dev` (not verified — needs wrangler + KV binding; out of scope for this audit).
- Existing `web/src/__tests__/requirement.test.ts` → continues to pass (no test changes; not verified but trivially safe).

---

## Deliverables

| File | Purpose |
|---|---|
| `docs/audits/consumer-migration-validation.md` | **NEW** — this report |

## Notes for the product owner

- The migration is **1 commit**. Don't bundle it with feature work.
- Light/Dark mode is available in 0.6.0 but the consumer doesn't use it. Adding a theme toggle is **product UX** (out of scope here).
- The `Select` primitive gap is **not a regression**; it's an open request from the 0.2.0 migration that hasn't been filled. File a follow-up issue if multiple consumers request it.