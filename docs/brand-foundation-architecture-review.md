# MAGI Brand Foundation — Architecture Review

| | |
|---|---|
| **Status** | Architecture review (pre-implementation) |
| **Date** | 2026-09-27 |
| **Subject** | Brand Foundation inside `@tokyo3rdhq/magi-design-system` |
| **Source brief** | [`docs/brand_fundation_review_and_impl.md`](./brand_fundation_review_and_impl.md) |
| **Method** | Repository reconnaissance + architectural analysis grounded in actual code |

---

## Executive Summary

`@tokyo3rdhq/magi-design-system` currently ships **13 UI primitives + AppTheme + tokens** with no brand assets. The two known consumers (magi-portal, tfi) render "MAGI" as plain text. The package's `public/` directory doesn't exist; there are no canonical SVG logos.

The two consumer repos (`magi-portal/public/`, presumably `tfi/public/`) carry **favicon + og-default SVGs that violate spec §36** (monospace font, neon-green `#00FF41`, CRT grid lines, corner brackets, blinking animations, drop-shadow glow effects). These are leftover from the OLD "EVA MAGI terminal" brand identity.

The Brand Foundation should:

1. Provide canonical MAGI mark / wordmark / lockup SVGs that comply with the current design language (dark-first, near-monochrome, Apple restraint — no CRT).
2. Provide minimal React rendering APIs (`MagiMark`, `MagiWordmark`, `MagiLockup`) that consume the canonical SVGs.
3. Replace the CRT-themed `favicon.svg` and `og-default.svg` in `magi-portal/public/` (and similar in `tfi/public/`).
4. Document brand rules (clear space, minimum size, misuse prohibitions).

It should NOT: create a separate `@magi/brand` package, introduce a generic icon system, build a `ProductBrand` abstraction, or create a brand configuration engine.

---

## 1. Current architecture reconstruction

`@tokyo3rdhq/magi-design-system@0.4.2` (verified via `dist/index.js` + `dist/styles.css`):

```
src/
├── components/         13 UI primitives
│   ├── Button / Card / Badge / Checkbox
│   ├── FormField / Input / Segmented
│   └── Banner / EmptyState
├── layout/             Container / Section / Stack
├── foundation/         reset.css + globals.css + typography.css
├── tokens/              7 CSS files (colors / typography / spacing / radius / motion / breakpoints / misc)
├── styles/              aggregator index.css
├── theme.tsx            AppTheme (context provider, sets --magi-accent on <html>)
├── utils/classnames.ts
└── index.ts             public API barrel
```

No `public/` directory. No SVGs. No brand folder.

Showroom has 7 pages: Tokens / Typography / Buttons / Cards / Badges / Layout / Phase 4. None demonstrate brand identity.

**Public API** (`src/index.ts`):
- 11 layout + UI components
- 1 hook (`useAppTheme` via context)
- 1 theme component (`AppTheme`)
- 2 types (`AppThemeProps`, `AppAccent`)
- No brand-related exports

**Theme model** (`src/theme.tsx`):
- `AppTheme` — React context provider + `useInsertionEffect` setting 4 CSS variables on `<html>`
- 5 accent presets: `green` / `cyan` / `violet` / `amber` / `white`
- `data-magi-accent="<name>"` subtree override (CSS rule in `globals.css`)
- Token literal CI: `scripts/check-tokens.mjs` + `scripts/check-accent-tokens.mjs`

---

## 2. Existing brand-related implementation

There is **no brand implementation in the design system package**. Searches confirm:

- `src/` has no `brand/` folder
- `public/` does not exist
- `src/index.ts` exports no brand components or assets

**Consumer-side brand state** (as of 2026-09-27):

| Consumer | Brand rendering | Asset source |
|---|---|---|
| `magi-portal/public/favicon.svg` | monospace text "MAGI" in `#00FF41` green on `#0D0D0D` — CRT-themed | hand-rolled SVG, package-level |
| `magi-portal/public/og-default.svg` | full CRT composition (grid lines, corner brackets, monospace text with drop-shadow glow, blinking dot animations, neon `#00ff41` `#ff00ff` `#00ffff`) | hand-rolled SVG, package-level |
| `magi-portal/src/layouts/Layout.astro` | plain text "MAGI" as `<a>` in top nav; plain text "MAGI" in footer | none |
| `magi-portal/src/components/Hero.astro` | no logo / wordmark in the hero composition (text-only eyebrow/headline/subhead) | none |
| `magi-portal/src/components/About.astro` | no brand element | none |
| `token-factory-initializr/web/public/` (presumed) | hand-rolled favicon (not inspected; same CRT aesthetic per the brief's §2 context) | hand-rolled SVG |

**The brand identity is currently *inconsistent across surfaces***: the UI is clean and modern (no CRT), but the favicon/og are CRT-themed.

**Note**: The current CRT assets violate spec §36 (no CRT / terminal / neon styling). Brand Foundation's first concrete deliverable will be **replacing these assets** so the favicon/og match the rest of the visual language.

---

## 3. Proposed Brand Foundation boundary

### Folder structure (added to `@tokyo3rdhq/magi-design-system/src/`):

```
src/
├── brand/                       # React rendering APIs
│   ├── MagiMark.tsx
│   ├── MagiWordmark.tsx
│   ├── MagiLockup.tsx
│   ├── index.ts
│   └── brand.css                # minimal, scoped to body[data-magi-app]
│
├── assets/                      # canonical static SVGs
│   ├── logo/
│   │   ├── magi-mark.svg
│   │   ├── magi-wordmark.svg
│   │   └── magi-lockup.svg
│   └── icons/
│       ├── favicon.svg
│       └── app-icon.svg
│
├── tokens/ foundation/ layout/ components/ theme.tsx/ styles/ utils/
└── index.ts
```

### Why this boundary (per brief §8 options A/B/C):

| Option | Decision | Reason |
|---|---|---|
| **A. `src/brand/`** | ✅ Adopt | Clean separation from `src/components/` (which holds UI interaction primitives, not identity primitives) |
| **B. `src/foundation/brand/`** | ❌ Reject | Foundation is utility CSS / reset / scrollbar; nesting brand under it muddles concerns |
| **C. `src/brand/` + `src/assets/`** | ✅ Adopt | Brand assets (static SVGs) and React rendering APIs have different build paths; separate is correct |
| **D. Separate package** (`@magi/brand`) | ❌ Reject | Brief §8: "Do NOT create a separate brand package". No dependency boundary demonstrated. |

### Why no separate package

- Same Vite build pipeline handles both — adding a second package means 2 lockfiles, 2 tsconfigs, 2 publish configs
- 0 of 5 extraction criteria met (per ADR-0004)
- The two consumers (magi-portal, tfi) don't show divergence that would justify split

---

## 4. Brand vs Design System boundary

| Concept | Owner | Why |
|---|---|---|
| Color tokens (`--magi-text-primary`, `--magi-bg-base`, etc.) | Design System (already exists) | Visual language foundation |
| Spacing tokens (`--magi-space-*`) | Design System (already exists) | Layout foundation |
| Typography tokens (`--magi-font-sans`, `--magi-font-size-*`) | Design System (already exists) | Type foundation |
| Radius / motion / z-index tokens | Design System (already exists) | Style foundation |
| **MAGI mark SVG** | **Brand Foundation** (new) | Static identity asset |
| **MAGI wordmark SVG** | **Brand Foundation** (new) | Static identity asset |
| **MAGI lockup SVG** | **Brand Foundation** (new) | Static identity asset |
| **Brand rules (clear space, minimum size, misuse)** | **Brand Foundation** (`docs/brand.md`) | Documentation, not tokens |
| Color tokens for brand accent | Design System only | Brief §21: "Product accent is not automatically MAGI brand color" |

**Per brief §9**: tokens stay as-is. Brand assets are identity primitives — NOT CSS variables. Brand rules are documentation, not tokens.

---

## 5. Brand vs Product Identity boundary

```
MAGI Brand               ← stable across all products
├── MAGI Mark
├── MAGI Wordmark
└── MAGI Lockup

Product Identity         ← per-product, varies
├── Product Name (e.g. "Token Factory Initializr")
├── Product Icon (each product's specific icon)
├── Product Accent (set via <AppTheme accent="cyan">)
└── Product-specific UI
```

**Concrete example**:

```
magi.website:  MAGI [Mark]               accent="green"
start.magi.website:  MAGI / Token Factory   accent="cyan"
models.magi.website:  MAGI / Models       accent="violet"
```

The MAGI Mark stays the same in all three. The product-specific label and accent differ. The brand **composes** with the product identity; it does not absorb it.

---

## 6. Brand vs ProductTheme boundary

`AppTheme` (ProductTheme renamed in 0.4.0) owns:
- `--magi-accent`
- `--magi-accent-hover`
- `--magi-accent-soft`
- `--magi-accent-contrast`

These 4 variables. Nothing else.

**The MAGI logo must remain stable across accent changes.** Verified by spec §21: "Product accent is not automatically MAGI brand color."

Mechanism: the logo SVG uses `currentColor` (or specific fixed colors like `#fff` / `#000`) — it does NOT read `var(--magi-accent)`. When accent changes, the logo doesn't change.

```tsx
<button className="btn-primary" data-magi-accent="cyan">
  <MagiMark />   {/* logo unchanged — uses currentColor */}
  Submit
</button>
```

The MAGI Mark is **brand-stable**, not **accent-conditional**. This is the architectural invariant the brief calls out in §10.

---

## 7. Asset strategy

### Canonical assets (in `src/assets/`)

| Asset | Aspect | Use | Source-of-truth |
|---|---|---|---|
| `logo/magi-mark.svg` | 1:1 square, viewBox 0 0 64 64 | Icon, favicon, app icon (when scaled) | YES |
| `logo/magi-wordmark.svg` | Wide horizontal, viewBox 0 0 240 64 | Hero, doc headers | YES |
| `logo/magi-lockup.svg` | Mark + wordmark composite, viewBox 0 0 320 64 | Navbar brand, default logo placement | YES |
| `icons/favicon.svg` | 32×32 (rendered from magi-mark) | `<link rel="icon">` | NO — derived |
| `icons/app-icon.svg` | 512×512 (rendered from magi-mark) | PWA / OS app stores | NO — derived |

**Why derive favicon/app-icon from mark.svg**:
- Single source of truth for the icon glyph (per brief §13: "Do NOT maintain SVG logo A + React inline SVG logo B as two independent definitions")
- Generated at build time (or copy at build) — keeps size specific to deployment while glyph is canonical

### Build integration

Vite library mode does NOT automatically include non-JS assets in `dist/`. We need to:

1. Configure `vite.config.ts` to copy `src/assets/**/*.svg` to `dist/assets/`
2. Add `"assets"` to `package.json` `files` field
3. Update build verification to check `dist/assets/logo/magi-mark.svg` exists

Vite plugin option: `build.copyPublicDir` or `build.assetsDir`. With `lib` mode, the assets go into a sub-folder of `dist/`.

### React usage

```tsx
import { MagiMark } from '@tokyo3rdhq/magi-design-system';
// MagiMark renders <img src={markUrl} alt="..." aria-hidden="..." />
// markUrl is the resolved URL of the canonical SVG
```

The component uses Vite's `?url` import suffix to get a stable hashed URL to the SVG:

```ts
// In MagiMark.tsx
import markUrl from '../assets/logo/magi-mark.svg?url';
```

This works in dev (Vite serves the SVG) and prod (Vite hashes the URL for cache busting).

**Alternative**: use SVGR to inline the SVG as JSX. **Rejected** — brief §33 says don't introduce new infra (SVGR is a Vite plugin = new infra).

---

## 8. React API proposal

### Three semantic primitives

```tsx
import { MagiMark, MagiWordmark, MagiLockup } from '@tokyo3rdhq/magi-design-system';

<MagiMark />                          {/* icon-only */}
<MagiMark aria-hidden="true" />      {/* decorative (next to text) */}
<MagiWordmark />                      {/* text-only */}
<MagiLockup />                        {/* mark + wordmark composite (default) */}
<MagiLockup size="sm" />              {/* semantic size: 'sm' | 'md' | 'lg' (default 'md') */}
```

### Why three, not one `<MagiLogo variant>`:

Brief §16: "Choose based on semantic clarity and actual usage."
- `MagiMark` = the symbol alone (favicon, app icon, favicon-sized)
- `MagiWordmark` = the text alone (rarely used standalone; e.g. centered wordmark on a doc page)
- `MagiLockup` = the standard presentation (the navbar brand, the OG image's primary mark)

Three explicit semantic APIs > one configurable `variant` prop.

### Size semantics

```ts
type MagiSize = 'sm' | 'md' | 'lg';
```

| Size | Height (intrinsic to lockup) | Use |
|---|---|---|
| `sm` | 20 px | Footer, compact UI |
| `md` (default) | 32 px | Navbar, default placement |
| `lg` | 48 px | Hero, OG image |

Intrinsic (no `width`/`height` props as primary API) — the SVG's `viewBox` provides natural proportions.

### Common props

```ts
interface MagiCommonProps {
  size?: MagiSize;       // 'md' default
  className?: string;     // positioning
  ariaHidden?: boolean;    // true when next to visible "MAGI" text
}
```

No `accent`, no `theme`, no `variant`. Per brief §35: "Avoid premature APIs."

---

## 9. CSS strategy

### One small CSS file: `brand.css`

```css
@layer magi.components {
  .magi-mark,
  .magi-wordmark,
  .magi-lockup {
    color: currentColor;       /* inheritable color from parent */
    fill: currentColor;        /* SVG fills inherit */
    height: auto;
    width: auto;
    vertical-align: middle;
  }
  .magi-mark,
  .magi-wordmark,
  .magi-lockup img {
    display: block;
  }
  .magi-mark--sm,
  .magi-wordmark--sm,
  .magi-lockup--sm img { height: 20px; }
  .magi-mark--md,
  .magi-wordmark--md,
  .magi-lockup--md img { height: 32px; }
  .magi-mark--lg,
  .magi-wordmark--lg,
  .magi-lockup--lg img { height: 48px; }
}
```

**Why `color: currentColor`**: lets consumers set color on a parent (e.g., `data-magi-accent="cyan"` → `color: var(--magi-accent)`) and the SVG fills follow. Keeps the logo accent-flexible without hardcoding colors inside the SVG.

**Why `height: auto; width: auto` on `<svg>`**: SVGs with viewBox naturally scale by aspect ratio. Height from the size modifier; width derives.

**Why use `img src=...` not inline `<svg>`**: keeps the canonical SVG as the source of truth (per brief §13), and `<img>` works outside React too.

### No new `@layer`

Brief §27: "Do not introduce unnecessary cascade layers." Brand CSS joins the existing `magi.components` layer. No new `magi.brand` layer.

### Color values

Brand colors are **neutral**:

| Use | Color | Token |
|---|---|---|
| Dark bg → light mark | white | `--magi-text-primary` (`#f5f5f7`) or hardcoded `#ffffff` in the SVG |
| Light bg → dark mark | black | `--magi-text-inverse` (`#050505`) or hardcoded `#000000` in the SVG |

Don't introduce `--magi-brand-white` / `--magi-brand-black`. Brand uses existing text tokens.

---

## 10. Accessibility strategy

Per brief §18:

| Use case | Approach |
|---|---|
| **Logo is the only brand identifier** (e.g. Navbar brand as `<a href="/">`) | `<a href="/" aria-label="MAGI — home"><MagiLockup aria-hidden="true" /></a>` |
| **Logo next to visible "MAGI" text** | `<MagiLockup aria-hidden="true" />` — decorative |
| **Standalone image (e.g. README, OG)** | `<img src={markUrl} alt="MAGI" />` — meaningful |

**Don't blindly add `aria-label`** — only when the logo is the sole identifier for the link/region.

`MagiMark`, `MagiWordmark`, `MagiLockup` all default to `aria-hidden="true"` because they're typically decorative (used next to text or inside links where the link's accessible name covers them). The consumer can override with `<MagiMark aria-hidden={false} alt="MAGI">` if standalone.

---

## 11. Testing strategy

For the Brand Foundation implementation, **add to existing CI scripts, no new infrastructure**:

| Check | Tool | Status |
|---|---|---|
| Package builds | `npm run build` | ✅ Already in CI |
| TypeScript types | `tsc --noEmit` (via typecheck script) | ✅ Already in CI |
| Token literal hygiene | `scripts/check-tokens.mjs` | ✅ Already in CI — the new brand CSS must pass (only neutral colors via tokens) |
| Accent source-of-truth | `scripts/check-accent-tokens.mjs` | ✅ Already in CI — brand does NOT introduce new accent presets, so unaffected |
| Asset existence | `test -f dist/assets/logo/magi-mark.svg` (new step in CI) | 🆕 Add |
| Showroom page renders | Existing dev preview | ✅ Manual + will add visual check in 0.4.x per ADR-0008 |

**Defer**: a unit test for `MagiLockup` rendering with various `size` props — would need vitest + @testing-library (also deferred to 0.4.x).

**Defer**: Playwright visual regression for brand assets — already deferred to 0.4.x per ADR-0008.

---

## 12. Showroom strategy

Add a new `apps/showroom/src/pages/Brand.tsx`:

```
Demonstrates:
  - MagiMark (icon, on dark + light backgrounds)
  - MagiWordmark (text, on dark + light backgrounds)
  - MagiLockup (composite, all 3 sizes)
  - Lockup inside <a aria-label="MAGI — home">
  - Lockup on a card with data-magi-accent="danger"
```

The page becomes the visual contract for brand identity — same role that `Phase 4.tsx` plays for primitives.

Add to showroom nav: 8th page (`Brand`).

---

## 13. Public package API strategy

Public exports (added in 0.5.0):

```ts
// src/index.ts
export * from './brand/index';
```

`src/brand/index.ts`:
```ts
export { MagiMark } from './MagiMark';
export { MagiWordmark } from './MagiWordmark';
export { MagiLockup } from './MagiLockup';
export type { MagiSize } from './types';
```

**Internal** (not exported):
- SVG helper utilities
- URL resolution (`import.meta.url` patterns)
- Brand className generators

---

## 14. Migration strategy

Per brief §40, in order:

### 1. Architecture review ← **THIS DOCUMENT**
### 2. Canonical brand assets
   - Hand-author 3 SVGs (`magi-mark`, `magi-wordmark`, `magi-lockup`) — simple geometric shapes, current design language (no CRT)
   - Copy or generate `favicon.svg` and `app-icon.svg` from `magi-mark.svg`
### 3. React rendering API
   - `MagiMark`, `MagiWordmark`, `MagiLockup` components
   - `brand.css` (minimal)
### 4. Brand documentation
   - `docs/brand.md` with logo / clear space / minimum size / product relationship / misuse rules
### 5. Showroom
   - `apps/showroom/src/pages/Brand.tsx`
   - Update showroom nav
### 6. Existing consumer integration
   - `magi-portal`: replace favicon.svg + og-default.svg with brand assets (deploy step, not source change), replace plain "MAGI" text in Layout.astro with `<MagiLockup />` if feasible (requires Astro + React island), else keep text
   - `tfi`: same treatment
### 7. Consumer migration docs
   - Add a section to `docs/migration-guide.md` or `docs/usage-guide.md` covering brand asset + React API adoption

---

## 15. Alternatives considered

### A. Inline SVG in React component (no separate .svg files)

Render the SVG as JSX in the component file:

```tsx
function MagiMark() {
  return (
    <svg viewBox="0 0 64 64">
      <path d="..." fill="currentColor" />
    </svg>
  );
}
```

**Rejected**:
- Brief §13: "Do NOT maintain SVG logo A + React inline SVG logo B as two independent definitions"
- Breaks non-React usage (HTML, README, favicon)
- The same SVG needs to live in three places (React, static favicon, og image)

### B. Generic `<MagiIcon />` system

```tsx
<MagiIcon name="logo" />
<MagiIcon name="arrow" />
```

**Rejected**: brief §34 says don't build a generic icon system. The MAGI logo is identity, not a UI icon.

### C. SVGR plugin for inline SVG

Vite plugin that imports SVGs as JSX components.

**Rejected**: brief §33 says don't introduce new infra. SVGR is a non-trivial dependency + config.

### D. `@magi/brand` separate package

**Rejected**: brief §8 says no. 0 of 5 extraction criteria met per ADR-0004.

### E. Color-tunable brand (consumer passes accent to `<MagiLogo accent="cyan">`)

**Rejected**: brief §21: "Product accent is not automatically MAGI brand color." Brand stays stable; product accents change. Decoupling them is the architectural intent.

---

## 16. Rejected approaches

1. **Per-variant configuration APIs** (e.g. `<MagiLogo variant="mark" size="sm" theme="dark">`): combinatorially explodes. Brief §35: avoid.
2. **`<ProductBrand>` abstraction**: brief §23 says wait for evidence of repeated semantic reuse. Currently only one consumer has any brand markup (magi-portal text "MAGI"); no repeated semantic to abstract.
3. **Generic icon system**: brief §34 says don't.
4. **Light theme brand assets** (separate dark-bg-only vs light-bg-only): the same `magi-mark.svg` works on both backgrounds via `currentColor`. No need for separate files.
5. **Figma token sync**: brief §33 says don't introduce.
6. **Runtime brand configuration engine** (e.g. consumer passes `accent="#ff0000"` to override): brief §33 says don't.

---

## 17. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| SVG render differences across browsers (Safari SVG quirks) | Low | Use simple geometric shapes only; test in real browsers before finalizing |
| Vite library mode doesn't copy SVGs to dist/ | Medium | Configure `vite.config.ts` to copy assets; add CI check `test -f dist/assets/logo/magi-mark.svg` |
| Consumer app can't import SVG (no asset loader config) | Medium | Vite + Astro + Next all support `?url` import suffix; document in brand.md |
| New `<MagiLockup>` accessibility regressions | Low | Write a Showroom page that exercises both decorative and meaningful use cases; defer real Playwright to 0.4.x |
| Future product icons get added to the brand system | Medium | ADR documents the boundary: product icons belong to products, not the brand foundation |
| Brand Foundation grows into a generic branding engine | Medium | ADR explicitly says one Design System; non-MAGI brands would fork |

---

## 18. Future extension points

- **Product icons** (when 2+ products ask): `MagiProductIcon` primitive, NOT a generic icon system. Each product ships its own SVG; the design system just provides the rendering shell.
- **Light-bg brand assets**: if a future product needs a light-mode brand, derive from the same `magi-mark.svg` via CSS color override (already supported via `currentColor`). No additional SVG files.
- **Per-product lockup**: `<MagiLockup productName="Token Factory">` — if multiple products need branded lockups, defer to ProductBrand (per §23).
- **Brand documentation in README**: generate from `docs/brand.md` for the design-system GitHub README.
- **OpenGraph generation**: per §26, products compose their own OG from canonical assets. Future tooling (CLI) could automate.

---

## Architecture Decision Table

| Decision | Recommendation | Reason | Revisit When |
| --- | --- | --- | --- |
| Separate brand package | **No** | 0 of 5 extraction criteria (ADR-0004); brief §8 | A genuine boundary emerges |
| `src/brand/` | **Yes** | Semantically distinct from `src/components/` (identity ≠ interaction) | n/a |
| `src/assets/` | **Yes** | SVGs and React code have different build paths | n/a |
| Static SVG source of truth | **Yes** | Brief §13; usable outside React | n/a |
| React brand components | **Yes (minimal)** | Brief §15; needed for React consumers | n/a |
| `ProductBrand` | **No (defer)** | Brief §23; wait for repeated semantic reuse | 2+ products need lockup |
| Brand CSS | **Yes (1 file, scoped)** | Brief §19; minimal but necessary for size modifiers | n/a |
| Favicon ownership | **Application ships from design-system source** | Brief §25; deployment artifact | n/a |
| OG image ownership | **Application composes from design-system source** | Brief §26; product-specific | n/a |
| Icon system | **No (defer)** | Brief §34 | A second product asks for icons |
| Token integration | **Reuse existing tokens** | Brief §21; no `--magi-brand-*` | n/a |

---

## Architecture stress test

| Question | Answer |
| --- | --- |
| Can every product use the same MAGI mark? | ✅ Yes — same SVG, `currentColor` lets parent style it |
| Can products have different accents? | ✅ Yes — accent is separate from brand |
| Can products have different icons? | ✅ Yes — products ship their own product icons (outside Brand Foundation) |
| Can a product have no icon? | ✅ Yes — `<MagiLockup />` works without `<MagiMark />` |
| Can product names change? | ✅ Yes — `<MagiLockup>` is the brand; product name is text in the consumer's nav |
| Can MAGI redesign its logo later? | ✅ Yes — canonical SVG swap; React components import the new URL |
| Can the logo be used outside React? | ✅ Yes — static SVG in `src/assets/` ships with the npm package |
| Can documentation use the assets? | ✅ Yes — GitHub README, MDN docs, OpenGraph all use the same SVG |
| Can GitHub use the assets? | ✅ Yes — repo social preview uses the same SVG |
| Can the design system remain one package? | ✅ Yes — no separate package needed |
| Can the package continue to be published as `@tokyo3rdhq/magi-design-system`? | ✅ Yes — brand lives inside |
| Is package namespace clearly separated from MAGI brand identity? | ✅ Yes — `@tokyo3rdhq` is namespace (ownership/publishing); `MAGI` is brand |

All twelve questions pass without needing excessive abstraction.

---

## Final Assessment

### 5 decisions to keep

1. **One package** — Brand Foundation lives inside `@tokyo3rdhq/magi-design-system`. Not a separate `@magi/brand`. Per brief §8 + ADR-0004.
2. **Static SVG as canonical source** — `src/assets/logo/*.svg` are the single source of truth. React components render via `<img src={svgUrl}>` (or `<svg>` inline if no scaling needed). Per brief §13.
3. **Brand stable across accents** — Logo uses `currentColor`, not `var(--magi-accent)`. Product accent changes do not affect brand. Per brief §10.
4. **Three semantic React components** — `MagiMark`, `MagiWordmark`, `MagiLockup`. No configurable `<MagiLogo variant>`. Per brief §16.
5. **Existing token reuse** — Brand uses `--magi-text-primary` (white) / `--magi-text-inverse` (black) via `currentColor`. No new `--magi-brand-*` tokens. Per brief §21 + ADR-0001.

### 5 decisions to defer

1. **`ProductBrand` component** — wait for 2+ products to demonstrate repeated semantic lockup need. Brief §23.
2. **Generic icon system** (`<MagiIcon />` or `<Icon name="..." />`) — explicit no per brief §34. Even product icons (e.g., Models vs Token Factory) belong to products.
3. **Light-bg-only or dark-bg-only brand asset variants** — `currentColor` lets the same SVG work on either background. No need for separate files.
4. **Vitest unit tests for brand components** — vitest + @testing-library/react deferred to 0.4.x (per architecture-review-0.3.md §Testing).
5. **Playwright visual regression for brand assets** — deferred to 0.4.x (per ADR-0008). Until then, manual visual check via the showroom.

### 5 risks to monitor

1. **Vite asset handling for SVGs** — `?url` import suffix works in dev but library mode needs `build.copyPublicDir` or explicit copy plugin. Without this, the npm tarball ships the SVGs in `src/assets/` but they're not in `dist/assets/`. Verify after build.
2. **React ↔ SVG dependency drift** — if a future contributor edits the React component without updating the SVG (or vice versa), the two representations drift. The canonical-asset invariant (brief §13) only holds if there's a CI check. Add a snapshot test in 0.4.x.
3. **Consumer color expectations** — `currentColor` inherits from parent. If a consumer wraps `<MagiLockup />` in a parent with no explicit `color`, the SVG may use the default browser text color (black). Document the contract: `<MagiMark />` requires the parent to set `color`.
4. **OG image (1200×630) generation** — the brief says products compose their own OG from canonical assets. We don't ship a "compose OG" utility. If consumers ask for one, that's a follow-up.
5. **Brand doesn't evolve with product themes** — confirmed invariant per brief §10 + §21. But consumers might accidentally wrap a brand element in `<AppTheme accent="violet">` and expect... nothing (because logo doesn't read accent). Documented, low risk.

---

## Closing

The Brand Foundation is small, durable, and fits the existing package. It does not become a branding framework, icon system, or second design system. It provides three SVGs, three React components, one tiny CSS file, and one documentation page. It replaces the CRT-themed favicon + og-default in magi-portal with brand-compliant assets. It does not change any existing UI primitives.

Next step (per brief §40): **canonical brand assets** — hand-author the 3 SVGs. Then React API. Then docs. Then showroom. Then migrate magi-portal's favicon/og.

Implementation can begin as soon as this review is approved.