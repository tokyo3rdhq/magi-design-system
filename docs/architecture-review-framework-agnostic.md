# Framework-Agnostic Architecture Review — Findings

**Review target**: `@tokyo3rdhq/magi-design-system`
**Review date**: 2026-09-28
**Version reviewed**: 0.5.0 (post Brand Foundation)
**Reviewer scope**: Repo reconnaissance → architectural boundary analysis → refactoring plan → final verdict

---

## A. Current Architecture Diagram (as built)

What the repository actually looks like at 0.5.0, not what the conceptual target says.

```text
@tokyo3rdhq/magi-design-system (single npm package)
│
├── 1. Brand Foundation
│   ├── src/assets/logo/magi-mark.svg         (Framework Agnostic — §4 A.4)
│   ├── src/assets/logo/magi-wordmark.svg     (Framework Agnostic)
│   ├── src/assets/logo/magi-lockup.svg       (Framework Agnostic)
│   ├── src/assets/icons/favicon.svg          (Framework Agnostic)
│   ├── src/assets/icons/app-icon.svg         (Framework Agnostic)
│   ├── src/brand/brand.css                   (Framework Agnostic — CSS @layer magi.brand)
│   ├── src/brand/MagiMark.tsx                (React — uses `?url` import + `<use href>`)
│   ├── src/brand/MagiWordmark.tsx            (React)
│   ├── src/brand/MagiLockup.tsx              (React)
│   └── docs/brand.md                         (Framework agnostic — design language)
│
├── 2. Design Tokens
│   ├── src/tokens/colors.css                 (Framework Agnostic — `:root` CSS vars)
│   ├── src/tokens/typography.css             (Framework Agnostic)
│   ├── src/tokens/spacing.css                (Framework Agnostic)
│   ├── src/tokens/radius.css                 (Framework Agnostic)
│   ├── src/tokens/motion.css                 (Framework Agnostic)
│   ├── src/tokens/breakpoints.css            (Framework Agnostic)
│   ├── src/tokens/misc.css                   (Framework Agnostic)
│   └── src/tokens/index.css                  (framework-agnostic barrel)
│
├── 3. CSS Foundation
│   ├── src/foundation/reset.css              (Framework Agnostic)
│   ├── src/foundation/typography.css         (Framework Agnostic)
│   ├── src/foundation/globals.css            (Framework Agnostic — scoped to `body[data-magi-app]`)
│   │       ↑ defines `--magi-accent-*` mappings for `data-magi-accent="<name>"`
│   └── src/foundation/index.css              (framework-agnostic barrel)
│
├── 4. CSS Component Contracts (visual contract only)
│   ├── src/components/Button/Button.css      (Framework Agnostic)
│   ├── src/components/Card/Card.css          (Framework Agnostic)
│   ├── src/components/Badge/Badge.css        (Framework Agnostic)
│   ├── src/components/Checkbox/Checkbox.css  (Framework Agnostic)
│   ├── src/components/Input/Input.css        (Framework Agnostic)
│   ├── src/components/FormField/FormField.css (Framework Agnostic)
│   ├── src/components/Segmented/Segmented.css (Framework Agnostic)
│   ├── src/components/Banner/Banner.css      (Framework Agnostic)
│   └── src/components/EmptyState/EmptyState.css (Framework Agnostic)
│
├── 5. Layout Primitives
│   ├── src/layout/Container.{tsx,css}        (React component + agnostic CSS)
│   ├── src/layout/Section.{tsx,css}          (React component + agnostic CSS)
│   └── src/layout/Stack.{tsx,css}            (React component + agnostic CSS)
│
├── 6. React Implementation
│   ├── src/components/*/index.ts             (bare barrel)
│   ├── src/components/Button/Button.tsx       (React — forwardRef, JSX)
│   ├── src/components/Card/Card.tsx           (React)
│   ├── src/components/Badge/Badge.tsx         (React)
│   ├── src/components/Checkbox/Checkbox.tsx   (React)
│   ├── src/components/Input/Input.tsx         (React)
│   ├── src/components/FormField/FormField.tsx (React — uses cloneElement)
│   ├── src/components/Segmented/Segmented.tsx (React — useState, useRef, useEffect)
│   ├── src/components/Banner/Banner.tsx       (React)
│   ├── src/components/EmptyState/EmptyState.tsx (React)
│   ├── src/theme.tsx                          (React — createContext, useInsertionEffect)
│   ├── src/utils/classnames.ts                (Framework-Neutral — pure JS, no React)
│   └── src/index.ts                           (bare barrel — public API)
│
├── 7. Theme Runtime
│   └── src/theme.tsx                          (React — owns accent CSS var setter + Context)
│           │
│           ├─→ reads ACCENT_PRESETS (literal hex)
│           └─→ sets CSS vars on document.documentElement (global)
│
├── 8. Stylesheet Bundle
│   └── src/styles/index.css                   (framework-agnostic barrel that re-imports
│                                                tokens + foundation + every component CSS
│                                                + brand.css; declares @layer order)
│
└── 9. Public Surface
    ├── packages/design-system/dist/index.js       (React ESM only)
    ├── packages/design-system/dist/styles.css    (framework-agnostic)
    ├── packages/design-system/dist/assets/…      (framework-agnostic — SVGs)
    └── package.json exports map:
        { ".": "dist/index.js", "./styles.css": "dist/styles.css" }
```

### Repository physical layout

```text
packages/design-system/
├── src/                          ← all source code
│   ├── assets/                   ← Brand SVGs (agnostic)
│   ├── tokens/                   ← CSS variables (agnostic)
│   ├── foundation/               ← CSS reset/globals/typography (agnostic)
│   ├── components/<Name>/        ← Each component = { .tsx, css, index.ts }
│   ├── layout/                   ← Same
│   ├── theme.tsx                  ← React accent theme
│   ├── utils/classnames.ts       ← JS-only helper (agnostic)
│   ├── env.d.ts                  ← Vite SVG module declarations
│   ├── brand/                    ← Brand React components + brand.css
│   ├── styles/index.css          ← Single CSS bundle entry
│   └── index.ts                  ← JS public API
├── vite.config.ts                ← Build config (library mode + asset copy)
├── tsconfig.build.json           ← d.ts emit
└── package.json
```

---

## B. Target Architecture Diagram

Per the doc's §2 conceptual target — extended to explicitly separate **Component Contracts** (semantic/a11y/state/token contract) from **Web/CSS Implementation** (one possible Web rendering of that contract):

```text
MAGI Design System (conceptual — @tokyo3rdhq/magi-design-system)
│
├── 1. Brand Foundation                  ← already exists (assets/ + brand/)
│   ├── Logo / Mark / Wordmark / Lockup
│   ├── Favicon / App Icon
│   └── Brand Guidelines (docs/brand.md)
│
├── 2. Design Tokens                     ← already exists (tokens/) — pure CSS vars
│
├── 3. CSS Foundation                    ← already exists (foundation/)
│   ├── Reset
│   ├── Base Typography
│   ├── Accessibility Defaults (focus ring, prefers-reduced-motion)
│   ├── Layout Foundations (.magi-* utilities)
│   └── Theme Variables (accent mappings on data-magi-accent)
│
├── 3.5. Experience Guidelines           ← docs/guidelines.md (post-0.6.0)
│   ├── Principles (clarity, icons support meaning, text is semantic source,
│   │   quiet interfaces, consistency without rigidity)
│   ├── Content & Copy
│   ├── Internationalization (language names, no flags, no emoji UI)
│   ├── Iconography (icon-only vs icon+text vs text decision matrix)
│   ├── Links & External Destinations (↗ indicator)
│   ├── Navigation (3 levels, hierarchy, active state)
│   ├── Header / Footer (pattern, not mandatory component)
│   ├── Responsive behavior
│   ├── Accessibility floor
│   └── Product vs System boundary (MUST / Recommended / Context /
│       Product-owned / Do-not-use classification)
│
├── 4. Component Contracts               ← ⚠ NOT yet formally documented
│   ├── Semantic structure (DOM)
│   ├── Accessibility (ARIA, keyboard, focus)
│   ├── Visual behavior (states, motion)
│   └── Token binding (which --magi-* tokens the component reads)
│   ── This is what any framework (React, Vue, HTML) MUST implement. ──
│
├── 5. Web/CSS Implementation            ← already exists (components/<Name>/<Name>.css)
│   ├── CSS selectors (.magi-button--primary, etc.)
│   ├── @layer cascade
│   └── CSS variables
│   ── This is the CURRENT Web implementation of the Component Contract. ──
│   ── Selectors are an implementation detail; changing them must not break the contract. ──
│
├── 6. Framework Implementations         ← React today; Vue tomorrow
│   │
│   ├── React                            ← current package
│   │   ├── exports: components, AppTheme, brand React components
│   │   ├── renders the Web/CSS layer via JSX
│   │   └── consumes tokens via CSS variables (not via JS)
│   │
│   └── Vue (future, deferred)           ← only when a Vue consumer exists
│
└── 7. Product Applications              ← not part of the Design System
    ├── magi.website
    ├── models.magi.website
    └── start.magi.website
```

The boundary **physically exists**. What needs improvement: the boundary must be **labeled** and **publicly observable**, not just true in the file tree.

### Critical distinction: Contract vs CSS Implementation

The Component **Contract** is the framework-agnostic definition of what `<MagiButton>` means:

- **Semantic structure** — `<button>` element (or equivalent)
- **Accessibility** — keyboard (Space/Enter), `:focus-visible`, `:disabled`, ARIA wiring
- **Visual behavior** — primary / secondary / ghost / danger variants; size tiers; loading state
- **Token binding** — which `--magi-*` tokens it consumes for color, radius, spacing

The **Web/CSS Implementation** is one way to render that Contract — using CSS selectors like `.magi-button--primary`, CSS `@layer`, CSS variables. If a future contributor optimizes a selector (e.g. `.magi-button--primary` → `.magi-button[data-variant="primary"]`), they are NOT changing the Contract. They are changing the implementation. CSS class names are therefore **not** the Design System API; they are the implementation API.

Consequence: this review does not propose listing `.magi-button--primary` etc. as cross-framework Contract Surface items. Instead, it proposes a **Component Contract document** that defines semantic structure, accessibility, states, and token binding per component — and leaves the CSS selectors free to evolve.

---

## C. Framework Coupling Matrix

Per the doc's §4 classification applied to every area of the 0.5.0 codebase:

| Area | Current state | Framework Agnostic | React-specific | Action |
|---|---|---|---|---|
| **Tokens (CSS vars)** | `:root` only, no JS imports them | ✅ 100% | — | KEEP |
| **Brand SVGs** | Static files, no React | ✅ 100% | — | KEEP |
| **Brand CSS** | `.magi-mark--{sm,md,lg}` etc. under `@layer magi.brand` | ✅ 100% | — | KEEP |
| **Brand React components** | `<MagiMark/>` etc. use `?url` SVG imports + `<use href>` | — | React-implementation | KEEP (correct) |
| **Foundation (reset/globals/typography)** | Scoped to `body[data-magi-app]`, pure CSS | ✅ 100% | — | KEEP |
| **Component CSS (per-component `.css` files)** | One CSS file per component, uses tokens via `var()` | Web/CSS Implementation (Layer 5) — **NOT** the Contract | — | KEEP — but explicitly labeled as Web Implementation, not as cross-framework Contract Surface. See B.
| **Layout primitives (Container/Section/Stack)** | Has both `.tsx` and `.css` | CSS agnostic; TSX is React | CSS agnostic; TSX is React | KEEP — split is intentional |
| **UI components (.tsx)** | React components consuming CSS classes | — | React-implementation | KEEP |
| **`theme.tsx`** | createContext, useInsertionEffect, sets CSS vars on `<html>` | — | React runtime + sets global CSS vars | REFACTOR (minor) — see F. Phase 1 |
| **`utils/classnames.ts`** | `cx(...parts)` — pure JS | ✅ Framework-neutral runtime | — | KEEP |
| **Showroom** | Vite + React + TS demo | — | React-app | KEEP — explicitly an implementation showcase, NOT a Design System component |
| **Public API (`src/index.ts`)** | Re-exports from `./brand`, `./layout`, `./components/*`, `./theme` | Boundary is correct | The exports themselves are React | KEEP |
| **`styles/index.css` barrel** | Re-imports all layer CSS, declares `@layer` order | ✅ 100% | — | KEEP |
| **README** | Headline reads "React 18 + TypeScript", lists React-only setup examples | — | Implies React is the definition | REFACTOR — see E |
| **`vite.config.ts`** | Has `react()` plugin + `copyBrandAssets()` plugin | Build detail | React-required for component library mode | KEEP (build-only) |
| **`tsconfig.build.json`** | Emits `.d.ts` only | TS is framework-neutral, but the API surface IS React types | TS neutral; API surface React | KEEP |
| **Tests** | typecheck + build + token-literal + accent-source CI | Tests the React implementation + token contracts | — | REFACTOR — add visual/a11y/SSR coverage |
| **OG images / doc consumers** | The OG image referenced is `.png` in Layout; we ship `.svg` | Asset is agnostic; format gap is consumer-side | — | Documented as consumer concern |
| **`accents` count** | `ACCENT_PRESETS` in `theme.tsx`; `data-magi-accent` rules in `globals.css` | The hex **values** are theme-implementation; the names are agnostic | Hex values are React-side of boundary | REFACTOR — extract hex values to a framework-neutral module so a Vue theme could share them |

### Summary

| Layer 1–3 framework-agnostic (Brand + Tokens + CSS Foundation) | 11 areas |
| Layer 5 Web/CSS Implementation (per-component `.css`) | 9 areas |
| Layer 6 React-only (`.tsx` + `<AppTheme>` runtime) | 13 areas |
| Need refactor (boundary) | 3 areas (theme.tsx, README, Contract doc) |
| Need action on consumer | 1 area (OG image format) |

---

## D. Dependency Graph

What depends on what at 0.5.0:

```text
MAGI Brand SVG assets (agnostic)
        ↑
        │  raw URL / file copy
        │
   src/brand/*.tsx ─── imports `?url` for inline SVG (React)
        ↑
        │  imports
        │
   src/index.ts (React public API)
        ↑
        │  imports
        │
   src/components/<Name>/<Name>.tsx ─── imports
        │                                    │
        │                                    ├── ./<Name>.css (Web/CSS implementation, agnostic at the language level)
        │                                    └── ../utils/classnames (agnostic)
        │
        └── src/layout/*.tsx ─── imports
                                  ├── ./<Name>.css (Web/CSS implementation)
                                  └── ../utils/classnames (agnostic)


   src/theme.tsx (React runtime)
        │
        ├── creates Context (React)
        ├── uses useInsertionEffect (React)
        ├── reads ACCENT_PRESETS (literal hex — coupled to JS module)
        │
        └── writes --magi-accent-* CSS vars on document.documentElement (browser DOM)
                │
                └─→ consumed by every CSS file via var(--magi-accent)


   src/tokens/*.css
        │
        └── defines :root CSS vars (e.g. --magi-accent: #00c853)
                │
                └─→ consumed by every CSS file in the package


   src/foundation/globals.css
        │
        └── defines body[data-magi-app] + data-magi-accent="<name>" rules
                │
                └── the data-magi-accent rules MUST cross-validate against
                    theme.tsx ACCENT_PRESETS (enforced by
                    scripts/check-accent-tokens.mjs)
```

### Inversion check (per doc §3)

```text
GOOD (correct direction):
  React Component (.tsx)  ─→  CSS class  ─→  CSS variable  ─→  Token value (in :root)

BAD (inversion — should not exist):
  React Context            ─→  Token definition
  theme.tsx exports        ─→  the meaning of --magi-accent (no — it just writes the var)

INVERTED:
  ACCENT_PRESETS (theme.tsx, React file) ─→ literal hex ─→ globals.css (agnostic)
                                    ↑
                         script checks that the two stay aligned.
```

**One real inversion**: the literal hex values of accent presets live inside the React file `theme.tsx`, while the consumer-facing CSS rules live in `globals.css` (agnostic). This is **currently enforced by a CI script**, but architecturally the hex values belong to the **agnostic** layer (the CSS contract) — `theme.tsx` should *import* them, not own them.

---

## F. Refactoring Plan

### Phase 0 — Documentation / Architecture (no breaking changes)

1. **README rewrite** (see E. below) — clarify that React is an implementation target, not the definition.
2. **Add `docs/architecture-overview.md`** — short orientation doc that mirrors the conceptual target diagram in §2. Existing `docs/architecture-v2.md` is target-only; this review gives the *current* state diagram plus the *boundary map*.
3. **Mark `--magi-accent` semantic anchors in CSS comments** — `globals.css` already says so, but every `var(--magi-accent)` use in component CSS should be discoverable by `grep "var(--magi-accent)" src/components` so a future Vue consumer knows what it needs to honor.
4. **Document the `.css` files as the *visual contract* layer.** Currently the per-component CSS files mix the contract (CSS rules) and the implementation details (selectors prefixed with `body[data-magi-app]`). The selector prefix is intentional — leave it — but add a header comment to each component CSS that says: *"This file is the visual contract for `<Component>`. It is the framework-agnostic part of this component."*

### Phase 1 — Boundary Cleanup (small implementation changes, no breaking API)

1. **Extract `ACCENT_PRESETS` from `theme.tsx` into `src/tokens/accent-presets.ts`.**
   - Currently: hex values for `--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast` live in a React file.
   - Move to: `src/tokens/accent-presets.ts` (pure TS, zero React).
   - `theme.tsx` imports from there.
   - `globals.css` rules cross-check against it via the existing CI script.
   - Why: a Vue theme implementation, or even a vanilla JS design-token consumer, could read the same source of truth.
2. **Add `src/index.ts` named sub-paths for the agnostic surfaces.**
   - Current: `exports["."]` → React API; `./styles.css` → CSS bundle.
   - Add (semver-minor, additive): no `package.json` exports change needed. Just document in README that:
     - "All CSS in `dist/styles.css` is framework-agnostic."
     - "All SVG assets in `dist/assets/` are framework-agnostic."
     - "Brand usage for non-React consumers: copy `dist/assets/logo/magi-lockup.svg` into your static assets."
3. **Add `src/brand/README.md`** — explain that `<MagiMark>` etc. are *React rendering APIs*; the **canonical assets** are the `.svg` files; non-React consumers use the files directly.

### Phase 2 — Contract Hardening (testing + docs)

1. **Add showroom brand-page contract** — already exists as a page; formalize it as the **brand visual regression surface** (per doc §24).
2. **Add `data-magi-accent="<name>"` storybook** — the showroom accent picker already proves CSS works. Document it as the **theme contract test**.
3. **Document Component Contracts (NOT CSS classes)** — add `docs/component-contracts.md` that defines per-component:
   - **Semantic structure** — DOM element used (e.g. `<button>`, `<input>`)
   - **Accessibility** — keyboard interactions, ARIA attributes, focus behavior
   - **States** — `:hover`, `:focus-visible`, `:disabled`, `aria-invalid`, etc.
   - **Token binding** — which `--magi-*` CSS variables the component reads
   
   CSS class names (e.g. `.magi-button--primary`) are deliberately NOT part of the contract — they are part of the **Web/CSS Implementation** (Layer 5). Optimizing a selector (e.g. `.magi-button--primary` → `.magi-button[data-variant="primary"]`) is an implementation change, not a Contract change. The Contract doc focuses on *what behavior must be preserved*, not *how the Web renders it*.

### Phase 3 — Future Framework (DEFER)

Vue package. Do not create until a Vue consumer exists.

---

## E. README Assessment

### Question 1: Does the current README correctly describe the package?

**Partially yes, partially no.** The package-level README opens with:

> "React 18 + TypeScript (strict) — Plain CSS with `magi-` prefixed classes — works in any React app, no Tailwind, no Next, no Vite, no Cloudflare coupling"

It emphasizes React twice in the opening paragraph, which sets React as the *identity* of the package. The headline reads as "MAGI Design System = React component library."

The repo-level README is slightly better — its tagline is *"Visual consistency without forcing product-level sameness"* and it lists both products and the theme mechanism — but it still describes the package by its React implementation ("tokens, layout primitives, UI components, and a product theme mechanism") rather than by the conceptual layers (Brand Foundation, Tokens, CSS Foundation, Component Contracts).

### Question 2: Does it accidentally imply React is part of the Design System definition?

**Yes.** Phrases that imply this:

- "**React 18** + **TypeScript** (strict)" — describes React as a property of the package.
- "no Tailwind, no Next, no Vite, no Cloudflare coupling" — names what it doesn't depend on, but doesn't name what the underlying design language actually is.
- "13 primitives (Container / Section / Stack / Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState / AppTheme)" — the entire mental model is the React component list.

The visual contract (CSS classes) is what makes the design system framework-agnostic. The current README never separates the visual contract from the React implementation.

### Question 3: Does it correctly distinguish React implementation from Design System?

**No.** The README treats React and Design System as one thing. There is no section that says "you can use the CSS contract without React" — even though you *can* (the brand assets are plain files; `dist/styles.css` is plain CSS).

### Question 4: What sections should be rewritten?

**Top of `packages/design-system/README.md`** — rewrite to match the doc's §22 example structure.

### Question 5: What wording should be changed?

Concrete rewrites (top-of-file only, no scope creep):

**Current opening**:
> # `@tokyo3rdhq/magi-design-system`
> Shared visual foundation for the MAGI product family.
> - **React 18** + **TypeScript** (strict)
> - **Plain CSS** with `magi-` prefixed classes — works in any React app, no Tailwind, no Next, no Vite, no Cloudflare coupling
> - **CSS custom properties** for every token — readable from any stylesheet
> - **CSS `@layer` cascade** — consumer unlayered styles always win
> - **~24 kB** stylesheet (gzip ~4 kB), **~9 kB** JS (gzip ~3 kB)

**Proposed opening**:
> # `@tokyo3rdhq/magi-design-system`
>
> The shared visual foundation for the MAGI product ecosystem. Built around brand assets, design tokens, CSS foundations, component visual contracts, and accessibility principles.
>
> The package currently ships the **React implementation** of the Design System. The underlying design language (tokens, CSS, brand) is **framework-agnostic** and is intended to be consumed by any frontend stack (React today; Vue or HTML tomorrow).
>
> ## Stack
>
> - Brand assets (SVG): **framework-agnostic**
> - Design tokens (CSS variables): **framework-agnostic**
> - CSS foundation + component styles: **framework-agnostic**
> - React components (`<Button>`, `<AppTheme>`, etc.): **React implementation**
>
> ## React compatibility
>
> React 18 (peer dependency). React 19 is supported as a peer when the consumer requires it (per ADR-0006).
>
> ```bash
> npm install @tokyo3rdhq/magi-design-system
> ```

This is the doc's §22 structure verbatim.

---

## Decision Framework Application

For each issue found, classify per doc §28:

### KEEP

1. **Single package** — per ADR-0004. Repo analysis confirms 0 of 5 extraction criteria hold.
2. **CSS contract per-component file** — each component's `.css` file is its framework-agnostic visual contract; the `.tsx` is its React implementation. The split is correct.
3. **Brand Foundation layered the same way as everything else** — `dist/assets/` carries framework-agnostic SVGs; `src/brand/*.tsx` provides React rendering; `dist/styles.css` includes brand sizing. Consistent with §2.
4. **`data-magi-accent="<name>"` subtree override** — pure CSS, framework-agnostic. The accent mappings are token values; a Vue consumer could re-implement them from the same tokens.
5. **`@layer magi.*` cascade** — framework-agnostic by definition. Any consumer can use unlayered styles to win on cascade. This is the *primary* framework-agnostic guarantee.

### REFACTOR

1. **`ACCENT_PRESETS` lives in `theme.tsx`** — the hex values belong to the framework-agnostic layer (the CSS contract). Move to `src/tokens/accent-presets.ts`. (Phase 1)
2. **README headline equates React with the Design System** — rewrite per §22. (Phase 0)
3. **No documented CSS contract surface** — `dist/styles.css` exposes `.magi-button--primary` etc. as utility classes, but the README never lists them. Add a "CSS contract" section. (Phase 0)

### DEFER

1. **Vue package** — no Vue consumer exists. Defer until one does.
2. **Splitting `@magi/tokens` / `@magi/brand` / `@magi/react`** — per doc §2 and ADR-0004. Premature. Repo evidence (0 of 5 extraction criteria) does not justify it.
3. **Figma plugin / config layer for tokens** — same reason.

### REMOVE

Nothing to remove. The current architecture has no abstraction that creates unnecessary coupling.

### FUTURE

1. **Vue package** — only when a Vue consumer exists.
2. **Plain HTML/CSS sample** — could ship an `examples/static-html/` folder that shows how to consume only the CSS contract (no React). Useful for documentation; not urgent.

---

## Architecture Verdict

The current architecture is **fundamentally sound and already framework-agnostic in its foundation layers** — Brand SVGs, design tokens (CSS variables), CSS foundation, and per-component Web/CSS implementation files are all pure CSS / pure SVG / pure TypeScript modules with **zero React dependencies**. React appears only where it must: in the `.tsx` components and the `<AppTheme>` runtime that sets accent CSS variables. The dependency direction `Brand → Tokens → CSS Foundation → Experience Guidelines → Component Contracts → Web/CSS Implementation → React/Vue Implementation → Application` is respected.

The package is *not* pretending React is the definition of the Design System — it's just *not yet saying so loudly* in the README. The most important boundary not yet formalized is the distinction between **Component Contracts** (framework-agnostic behavior — semantic structure, a11y, states, token binding) and the **Web/CSS Implementation** that currently renders those contracts. CSS class names (`.magi-button--primary` etc.) are part of the Web Implementation layer, not the contract API; they may be freely refactored without breaking the Design System. The contract itself is not yet written down.

Three small, low-risk changes would make the boundary explicit and future-proof the package for a second framework: extract accent hex values from `theme.tsx` to a framework-neutral module (Phase 1), rewrite the README to mirror the doc's §22 structure (Phase 0), and author `docs/component-contracts.md` defining each component's Contract without listing CSS class names as part of the contract surface (Phase 2). No architectural refactor, no package split, no Vue prototype.

## 5 Things To Keep

1. **Single package** (`@tokyo3rdhq/magi-design-system`). Per the doc and ADR-0004: premature splitting creates friction without benefit.
2. **Per-component `.css` files as the Web/CSS Implementation layer** (Layer 5). The split is intentionally `.css` (Web implementation, may be re-rendered in any Web stack) + `.tsx` (React implementation). CSS class names are NOT promoted to the contract API; they remain implementation detail free to evolve.
3. **CSS variables as the token delivery mechanism** — no JS token transformation; no Frameworks layers between tokens and CSS.
4. **`data-magi-accent="<name>"` subtree override** — pure CSS, framework-agnostic, enables per-section accent without React.
5. **Brand Foundation as standalone SVG assets in `dist/assets/`** — single source of truth, usable by React (`<MagiLockup>`) and by static consumers (favicon, OG) without runtime cost.

## 5 Things To Refactor

1. **`ACCENT_PRESETS` in `theme.tsx`** → move to `src/tokens/accent-presets.ts`. Hex values belong with the tokens, not the React runtime.
2. **README headline** → rewrite per doc §22. Distinguish React implementation from Design System.
3. **No documented Component Contract surface** → add `docs/component-contracts.md` defining each component's Contract (semantic structure, accessibility, states, token binding) — explicitly *not* listing CSS class names, which belong to the Web/CSS Implementation layer. This is the most critical missing doc for future-framework support.
4. **`src/brand/README.md`** → create. Document that `<MagiMark>` etc. are React rendering APIs; the canonical assets are `.svg` files.
5. **Verify `brand.css` declares its own `@layer`** — confirmed during review: `src/brand/brand.css` opens with `@layer magi.components { … }`, so it lives in the correct layer and the cascade guarantee holds. **No action needed.** (Originally flagged as a risk; resolved by reconnaissance.)

## 5 Things To Defer

1. **Vue package** — no Vue consumer. Don't create the package until one exists.
2. **`@magi/tokens` / `@magi/brand` / `@magi/react` split** — premature. ADR-0004 confirms 0 of 5 criteria.
3. **Generic icon registry** — only the brand mark is part of the system; defer until a real icon-set consumer exists.
4. **CSS-in-JS / Tailwind / Radix** — the doc explicitly forbids these as solutions to framework compatibility.
5. **Figma plugin / token export pipeline** — premature; no team needs it.

## 5 Biggest Risks

1. **The `check-accent-tokens.mjs` CI script enforces consistency between `theme.tsx` (React) and `globals.css` (agnostic)** — if the React file gets renamed or moved, the script silently passes against stale paths. After Phase 1 refactor (moving ACCENT_PRESETS to `tokens/accent-presets.ts`), update the script's allowlist.
2. **`data-magi-app` scope ambiguity** — currently scoped to `body`, planned for `html` per ADR-0002. A Vue consumer might pick a different DOM root; the docs should specify the data attribute attaches to the **root of the consumer's render tree**, not specifically to `<body>` or `<html>`.
3. **CSS layer naming leak** — `src/styles/index.css` declares the layer order; if any consumer CSS file uses `@layer magi.components { … }` (re-declaring), it overrides our ordering. Document the rule: "consumers do not declare `@layer magi.*`".
4. **Token duplication risk** — if a Vue/HTML consumer duplicates token values in their own stylesheet, design drift begins. Document that tokens MUST be imported from `dist/styles.css` and overridden via CSS variables, not by hardcoding.
6. **Theme runtime coupling** — `<AppTheme>` sets CSS vars on `<html>`. A Vue/SSR consumer that renders the app inside a non-`<html>` root will have the global CSS vars miss the subtree. Document the contract: `<AppTheme>` writes to `document.documentElement`, which is global; subtree scope uses `data-magi-accent="<name>"`.

## Recommended Target Architecture

The physical layout maps cleanly to the conceptual layers (1–6 from §B):

```text
@tokyo3rdhq/magi-design-system (single npm package, framework-agnostic foundation)

PHYSICAL LAYOUT                                  CONCEPTUAL LAYER

src/assets/                                       ┐
├── logo/                                          │ 1. Brand Foundation
│   ├── magi-mark.svg (agnostic)                   │     (framework-agnostic)
│   ├── magi-wordmark.svg                          │
│   └── magi-lockup.svg                            │
└── icons/                                         │
    ├── favicon.svg                                │
    └── app-icon.svg                               ┘

src/tokens/                                       ┐
├── accent-presets.ts  ← MOVED here (Phase 1)     │
├── colors.css                                     │ 2. Design Tokens
├── typography.css                                 │     (framework-agnostic)
├── spacing.css                                    │
├── radius.css                                     │
├── motion.css                                     │
├── breakpoints.css                                │
├── misc.css                                       │
└── index.css                                     ┘

src/foundation/                                   ┐
├── reset.css                                      │ 3. CSS Foundation
├── globals.css  ─ accent CSS var mappings         │     (framework-agnostic)
├── typography.css                                 ┘

docs/component-contracts.md  ← NEW (Phase 2)     ┐ 4. Component Contracts
                                                   │   (framework-agnostic —
                                                   │    semantic structure,
                                                   │    a11y, states, tokens;
                                                   │    NOT CSS class names)

src/components/<Name>/                           ┐
├── <Name>.tsx  ← React implementation             │
│                                                  │ 5. Web/CSS Implementation
├── <Name>.css  ← Web implementation of Contract   │     + 6. Framework
│   (selector names are implementation detail;     │     Implementations (React)
│    they are NOT the Contract API)                │
└── index.ts                                       │
                                                   │
src/layout/                                       │
├── Container.{tsx,css}                            │
├── Section.{tsx,css}                              │
└── Stack.{tsx,css}                                ┘

src/brand/                                        ┐
├── brand.css                                      │
├── MagiMark.tsx                                  │
├── MagiWordmark.tsx                               │ 5+6. Web Impl + React
└── MagiLockup.tsx                                ┘

src/theme.tsx                                    ← 6. Framework Implementation
                                                    (React runtime; imports
                                                    accent-presets.ts and writes
                                                    CSS vars to <html>)

src/utils/classnames.ts                          ← Framework-neutral runtime
src/styles/index.css                             ← CSS barrel (@layer order)
src/index.ts                                     ← React public API

────────────────────────────────────────────────────────────
Public exports:
  "."               → React ESM (Layer 6 — components + AppTheme)
  "./styles.css"    → Framework-agnostic CSS bundle (Layers 1, 2, 3, 5)
  "./assets/*.svg"  → Framework-agnostic brand SVGs (Layer 1)
────────────────────────────────────────────────────────────
```

The Contract document (`docs/component-contracts.md`, Layer 4) is the only piece that does NOT yet have a written form. It is the document a second-framework contributor (or even a vanilla HTML consumer) reads to know what behavior the React components must preserve. CSS class names in Layer 5 files (`<Name>.css`) remain implementation detail and may be freely refactored (e.g. `.magi-button--primary` → `.magi-button[data-variant="primary"]`) without breaking the Design System contract.

## Recommended Next Step

Three changes, in priority order. Each is independent; do them as separate commits so each PR has one purpose.

### Step 1 — Boundary cleanup (code, no API change → patch version 0.5.1)

Move `ACCENT_PRESETS` from `src/theme.tsx` to `src/tokens/accent-presets.ts`, and let `theme.tsx` import it. Update `scripts/check-accent-tokens.mjs` to read from the new location. This is a 1-commit refactor that demonstrates the principle that **tokens belong to the framework-agnostic layer**, and it prepares the package for any future framework implementation without forcing one. Public API unchanged.

### Step 2 — README headline (docs only)

Rewrite the package-level README per §22 of the review doc. Distinguish the Design System (framework-agnostic) from the React implementation (current). Reuse the concrete opening prose already drafted in section E. **Important**: do not list CSS class names in the headline — describe layers.

### Step 3 — Component Contract doc (new doc)

Add `docs/component-contracts.md` (Layer 4 from §B). For each component, define:
- **Semantic structure** — DOM element used (e.g. `<button>`, `<input>`)
- **Accessibility** — keyboard interactions, ARIA attributes, focus behavior
- **States** — `:hover`, `:focus-visible`, `:disabled`, `aria-invalid`, etc.
- **Token binding** — which `--magi-*` CSS variables the component reads

This is **the most critical missing piece for future-framework support** — it is what a Vue contributor or vanilla HTML consumer reads to know what behavior must be preserved. CSS class names are deliberately NOT part of this contract; they remain in Layer 5 (Web/CSS Implementation) and may evolve freely.

**Together, these three changes are small, semver-safe at the minor level (0.5.0 → 0.5.1 is a documentation patch if Step 1's API doesn't change; or 0.6.0 if you choose to surface the moved module), and they explicitly formalize the framework-agnostic boundary without restructuring the package.**