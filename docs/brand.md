# MAGI Brand Foundation

> Single source of truth for MAGI visual identity. No CRT, no neon, no terminal aesthetic — Apple restraint with geometric precision.

---

## Brand Hierarchy

| Asset | Use Case | File |
|-------|----------|------|
| **Mark** | Favicon, app icon, small lockups, avatar fallback | `src/assets/logo/magi-mark.svg` |
| **Wordmark** | Doc headers, focused standalone contexts | `src/assets/logo/magi-wordmark.svg` |
| **Lockup** | Default logo: navbar brand, OG image, README hero | `src/assets/logo/magi-lockup.svg` |
| **Favicon** | Browser tab (32×32) | `src/assets/icons/favicon.svg` |
| **App Icon** | PWA / desktop install (512×512) | `src/assets/icons/app-icon.svg` |

All assets are canonical SVGs. React components (`MagiMark`, `MagiWordmark`, `MagiLockup`) are rendering APIs — they inject the same SVG source via `?raw`, never re-defining geometry.

---

## Color Modes

MAGI supports **two UI color modes**. The color mode changes the visual surface, text, borders, and component states. It does **not** change the MAGI brand identity (logo geometry, accent family, typography).

| Mode | Status | Purpose |
|------|--------|---------|
| **Dark** | Canonical MAGI presentation | Default. Use this unless the product has a specific reason to invert. |
| **Light** | Supported alternative presentation | Opt-in via `<html data-magi-theme="light">` or `<AppTheme theme="light">`. |

### Dark mode (canonical)

| Surface | Value |
|---|---|
| **Background** (`--magi-bg-base`) | `#000000` |
| **Raised** (`--magi-bg-raised`) | `#1d1d1f` |
| **Surface** (`--magi-surface`) | `#0a0a0a` |
| **Primary text** (`--magi-text-primary`) | `#f5f5f7` (near-white) |
| **Border** (`--magi-border`) | `rgba(255, 255, 255, 0.08)` |
| **Logo** (`--magi-logo-color`) | `#f5f5f7` (follows primary text) |

### Light mode (supported alternative)

| Surface | Value |
|---|---|
| **Background** (`--magi-bg-base`) | `#ffffff` |
| **Raised** (`--magi-bg-raised`) | `#f5f5f7` |
| **Surface** (`--magi-surface`) | `#ffffff` |
| **Primary text** (`--magi-text-primary`) | `#050505` (near-black) |
| **Border** (`--magi-border`) | `rgba(0, 0, 0, 0.08)` |
| **Logo** (`--magi-logo-color`) | `#050505` (follows primary text) |

### Accent (theme-independent)

| Surface | Value |
|---|---|
| **Default** (`--magi-accent`) | `#00c853` (MAGI green) |
| **Hover** (`--magi-accent-hover`) | `#00e676` |
| **Soft** (`--magi-accent-soft`) | `rgba(0, 200, 83, 0.08)` |
| **Contrast** (`--magi-accent-contrast`) | `#050505` |

Product accents are **independent of the color mode** — accent and theme are orthogonal axes. `<AppTheme accent="cyan" theme="light">` is a valid combination.

### How to switch color mode

**Default** — no attribute, no prop: Dark applies (SSR-safe default; consumer never sees an unstyled flash).

**Via React** — `<AppTheme theme="light">` sets `data-magi-theme="light"` on `<html>` at mount via `useInsertionEffect`.

**Via plain HTML** (no React, or SSR without hydration):
```html
<html data-magi-app data-magi-theme="light">
  …
</html>
```

**For subtree scope** (e.g., a card that flips theme within a page):
```html
<div data-magi-theme="light">
  <Card>…</Card>
</div>
```

---

## Logo Contrast Rule

MAGI logos use `currentColor`. The brand component wrapper sets `color: var(--magi-logo-color)` so the logo inherits the semantic foreground of the current theme automatically.

| Rule | Statement |
|---|---|
| **Logo follows semantic foreground** | The logo's color is bound to `--magi-logo-color`, which equals `--magi-text-primary` in both Dark and Light modes. |
| **Never hard-code dark on dark** | Don't set a dark logo asset (or `color: black`) on a dark surface. The system will choose near-white automatically. |
| **Never hard-code light on light** | Don't set a light logo asset (or `color: white`) on a light surface. The system will choose near-black automatically. |
| **Never use product accent** | The MAGI logo never uses `--magi-accent`. Accent is for CTAs, links, focus rings, status — not the logo. |
| **Override per-instance** | A consumer may still override `color` on a wrapper or ancestor element when the logo sits on a special surface (e.g., a colored banner). `currentColor` propagates as expected. |

This rule is enforced by `src/brand/brand.css` (Layer 5 — Web/CSS Implementation). The contract is documented in `docs/component-contracts.md#magimark` (Layer 4 — framework-agnostic).

---

## Logo Surface Rules

The logo automatically picks the right color based on the surrounding theme:

```
Dark surface
  → logo = near-white (#f5f5f7)

Light surface
  → logo = near-black (#050505)

Accent surface (e.g., green CTA background)
  → logo = accent-contrast (#050505)
  (because accent surfaces are dark, even in Light mode)
```

A logo **never** uses product accent colors.

---

## Logo Construction

### Mark (`magi-mark.svg`)

- **ViewBox**: `0 0 64 64` (1:1 square)
- **Geometry**: Three filled circles (`r=6`) forming an equilateral triangle:
  - Top: `cx=32, cy=14`
  - Bottom-left: `cx=14, cy=48`
  - Bottom-right: `cx=50, cy=48`
- **Symbolism**: Three cores — Melchior / Balthasar / Caspar
- **Fill**: `currentColor` — inherits the semantic foreground of the current theme via `var(--magi-logo-color)`
- **No text, no animation, no decoration**

### Wordmark (`magi-wordmark.svg`)

- **ViewBox**: `0 0 200 56` (~3.57:1 wide)
- **Typography**: Inter Bold, 48px, tracking `-2.16` (`-0.045em`)
- **Font stack**: `Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif`
- **Fill**: `currentColor` (theme-driven)

### Lockup (`magi-lockup.svg`)

- **ViewBox**: `0 0 280 64`
- **Composition**: Mark (64×64) + 16px gap + Wordmark (200×56, vertically centered)
- **Fill**: `currentColor` (theme-driven)

---

## Clear Space

```
Minimum clear space = Mark height (the 64-unit square)
```

```
┌─────────────────────────────────────────────────────┐
│  = Mark height = 64 units (1:1)                     │
│                                                     │
│   ┌──────┐    ┌────────────────────────────────┐   │
│   │ Mark │ 16 │         Wordmark               │   │
│   │  ●   │────│   M A G I                      │   │
│   │ ● ●  │    │                                │   │
│   └──────┘    └────────────────────────────────┘   │
│                                                     │
│  Clear space boundary extends one mark-height     │
│  in all directions from the lockup bounding box.  │
└─────────────────────────────────────────────────────┘
```

**Rule**: No text, UI elements, or graphics may enter the clear space zone. In practice, use `var(--magi-space-8)` (32px) minimum padding around lockup in navbars/headers.

---

## Minimum Size

| Context | Size | Usage |
|---------|------|-------|
| **Nav / Tab** | 20px (`--sm`) | Favicon, navbar brand, compact headers |
| **Default** | 32px (`--md`) | Standard UI, cards, sections |
| **Hero / OG** | 48px (`--lg`) | Landing hero, README, social preview |

Do not render mark smaller than 16px (circles become indistinguishable dots). Below 20px, use favicon asset directly.

---

## Product Relationship

MAGI is the **parent brand**. Products carry their own accent color:

```
MAGI (parent)
├── Token Factory   — accent: #00c853 (green) — `<AppTheme accent="green">`
├── Models          — accent: #8b5cf6 (violet) — `<AppTheme accent="violet">` (planned)
└── Future products — each gets its own accent
```

**The MAGI logo never uses product accent.** It uses `currentColor` (semantic foreground color of the current theme). Product accent is applied to CTAs, links, focus rings — not the logo.

The five available accent presets (`green`, `cyan`, `violet`, `amber`, `white`) are defined in [`packages/design-system/src/tokens/accent-presets.ts`](../packages/design-system/src/tokens/accent-presets.ts). See [`docs/tokens.md`](./tokens.md) for the full token list, [`docs/component-contracts.md`](./component-contracts.md) for the brand component contracts.

---

## React API

```tsx
import { MagiMark, MagiWordmark, MagiLockup } from '@tokyo3rdhq/magi-design-system';

// Semantic sizes: 'sm' (20px) | 'md' (32px) | 'lg' (48px)
<MagiMark size="md" />
<MagiWordmark size="lg" />
<MagiLockup size="md" ariaHidden={false} alt="MAGI — home" />

// Color follows the current theme automatically:
//   Dark  → near-white logo
//   Light → near-black logo
//   (override per-instance with a `color` style if needed)
```

**Accessibility**:
- Default `aria-hidden="true"` (decorative)
- Set `ariaHidden={false}` + `alt="..."` when logo is the only brand identifier

---

## Misuse Prohibitions

| Prohibited | Reason |
|------------|--------|
| Stretching / squashing aspect ratio | Breaks geometric harmony |
| Rotation or reflection | Identity must be consistent |
| Recoloring via `fill="..."` on the asset | Breaks the `currentColor` contract |
| Gradients, glows, drop shadows on the mark | Apple restraint — no decoration |
| Outline / stroke variants | Mark is solid filled circles only |
| Locking up with non-MAGI wordmarks | Brand confusion |
| Using mark as a bullet / list marker | Semantic misuse |
| Placing on insufficient contrast backgrounds | Fails WCAG AA |
| Hard-coding logo color (e.g. `color: #fff` on a dark surface) | Breaks the theme-driven contrast contract — use the theme's `--magi-logo-color` instead |
| Using product accent on the logo | Accent is for CTAs / links / focus / status, not identity |

**Enforcement**: All assets are versioned in `@tokyo3rdhq/magi-design-system`. Consumers import — they do not copy/modify. The `brand.css` layer applies the Logo Contrast Rule automatically; consumer `style={{ color: … }}` overrides per-instance.

---

## File References

| File | Description |
|------|-------------|
| `packages/design-system/src/assets/logo/magi-mark.svg` | Mark glyph |
| `packages/design-system/src/assets/logo/magi-wordmark.svg` | Wordmark glyph |
| `packages/design-system/src/assets/logo/magi-lockup.svg` | Composite lockup |
| `packages/design-system/src/assets/icons/favicon.svg` | Browser favicon (32×32) |
| `packages/design-system/src/assets/icons/app-icon.svg` | PWA icon (512×512) |
| `packages/design-system/src/brand/MagiMark.tsx` | React component |
| `packages/design-system/src/brand/MagiWordmark.tsx` | React component |
| `packages/design-system/src/brand/MagiLockup.tsx` | React component |
| `packages/design-system/src/brand/brand.css` | Theme-driven color binding (`--magi-logo-color`) + size modifiers |
| `packages/design-system/src/tokens/colors.css` | Dark + Light semantic tokens (`--magi-bg-*`, `--magi-text-*`, `--magi-border*`, `--magi-logo-color`) |

---

## Versioning

Brand assets are part of `@tokyo3rdhq/magi-design-system` package version. Breaking changes to SVG geometry = major version. New color modes or new accent presets = minor. Patch = bug fixes only.

The 0.6.0 release formalized the Light/Dark Theme contract: color modes are now part of the package's surface. The MAGI logo geometry is unchanged.