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

## Logo Construction

### Mark (magi-mark.svg)
- **ViewBox**: `0 0 64 64` (1:1 square)
- **Geometry**: Three filled circles (`r=6`) forming an equilateral triangle:
  - Top: `cx=32, cy=14`
  - Bottom-left: `cx=14, cy=48`
  - Bottom-right: `cx=50, cy=48`
- **Symbolism**: Three cores — Melchior / Balthasar / Caspar
- **Fill**: `currentColor` — inherits consumer's text color
- **No text, no animation, no decoration**

### Wordmark (magi-wordmark.svg)
- **ViewBox**: `0 0 200 56` (~3.57:1 wide)
- **Typography**: Inter Bold, 48px, tracking `-2.16` (`-0.045em`)
- **Font stack**: `Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif`
- **Fill**: `currentColor`

### Lockup (magi-lockup.svg)
- **ViewBox**: `0 0 280 64`
- **Composition**: Mark (64×64) + 16px gap + Wordmark (200×56, vertically centered)
- **Fill**: `currentColor` (both glyphs share single fill)

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

## Backgrounds

| Background | Token | Logo Color Behavior |
|------------|-------|---------------------|
| **Dark** (default) | `--magi-bg-base` `#000` → `--magi-bg-raised` `#1d1d1f` | `currentColor` = `--magi-text-primary` `#f5f5f7` (near-white) |
| **Surface** | `--magi-surface` `#0a0a0a` | Same as dark |
| **Light** | `#ffffff` | `currentColor` = `--magi-text-inverse` `#050505` (near-black) |
| **Accent** | `--magi-accent` `#00c853` | `currentColor` = `--magi-accent-contrast` `#050505` |

**Consumer controls color** by setting `color` on the component or its ancestor. The SVG uses `fill="currentColor"` — it has no opinion on what color that is.

---

## Product Relationship

MAGI is the **parent brand**. Products carry their own accent color:

```
MAGI (parent)
├── Token Factory   — accent: #00c853 (green) — `<AppTheme accent="green">`
├── Models          — accent: #8b5cf6 (violet) — `<AppTheme accent="violet">` (planned)
└── Future products — each gets its own accent
```

**The MAGI logo never uses product accent.** It uses `currentColor` (text color). Product accent is applied to CTAs, links, focus rings — not the logo.

The five available accent presets (`green`, `cyan`, `violet`, `amber`, `white`) are defined in [`packages/design-system/src/tokens/accent-presets.ts`](../packages/design-system/src/tokens/accent-presets.ts). See [`docs/tokens.md`](./tokens.md) for the full token list, [`docs/component-contracts.md`](./component-contracts.md) for the brand component contracts.

---

## React API

```tsx
import { MagiMark, MagiWordmark, MagiLockup } from '@tokyo3rdhq/magi-design-system';

// Semantic sizes: 'sm' (20px) | 'md' (32px) | 'lg' (48px)
<MagiMark size="md" />
<MagiWordmark size="lg" />
<MagiLockup size="md" ariaHidden={false} alt="MAGI — home" />

// Color controlled via CSS:
<div style={{ color: '#f5f5f7' }}>
  <MagiLockup />  {/* white on dark */}
</div>
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
| Recoloring via `fill="..."` on the asset | Breaks `currentColor` contract |
| Gradients, glows, drop shadows on the mark | Apple restraint — no decoration |
| Outline / stroke variants | Mark is solid filled circles only |
| Locking up with non-MAGI wordmarks | Brand confusion |
| Using mark as a bullet / list marker | Semantic misuse |
| Placing on insufficient contrast backgrounds | Fails WCAG AA |

**Enforcement**: All assets are versioned in `@tokyo3rdhq/magi-design-system`. Consumers import — they do not copy/modify.

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
| `packages/design-system/src/brand/brand.css` | Size modifiers |

---

## Versioning

Brand assets are part of `@tokyo3rdhq/magi-design-system` package version. Breaking changes to SVG geometry = major version. New size modifiers or React props = minor. Patch = bug fixes only.