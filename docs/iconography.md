# Iconography Contract

> Source-of-truth doc for how icons are used across the MAGI product family.
> Binding for `@tokyo3rdhq/magi-design-system` and all consumers.

This document is normative. Deviating from it is a contract violation that
should be flagged in code review and reported in a follow-up issue.

---

## 1. Strategy

```text
MAGI Icon System
├── Generic UI Icons
│   └── Lucide / lucide-react
│
└── MAGI Semantic Icons
    ├── Brand Icons       (logo, mark, wordmark, lockup)
    ├── Product Icons     (Token Factory, Model Graph, MAGI Agent, etc.)
    └── Concept Icons     (MAGI Gateway, MAGI Token, etc.)
```

**Generic UI icons come from Lucide.** Do not hand-port Lucide icons into
SVG; do not create `MagiSearch` wrappers. Direct import from
`lucide-react` is the canonical path:

```tsx
import { Search, Settings, Copy, ExternalLink } from 'lucide-react';

<button aria-label="Search">
  <Search aria-hidden="true" />
</button>
```

**MAGI semantic icons are custom** and live in this package's `src/assets/icons/`
or `src/brand/` directories. Custom icons exist only when the concept is
specific to the MAGI ecosystem and Lucide has no equivalent.

---

## 2. Why Lucide

* Mature, actively maintained icon family (1,500+ icons).
* Stroke-based construction matches the MAGI visual language
  (dark-first, restrained, technical, precise).
* Single import path — `lucide-react` — works in any React + Vite/CRA/Next app.
* Tree-shakable; only the icons you import are bundled.
* Permissive license (ISC ≈ MIT).

We do **not** fork Lucide, copy its SVGs into this repo, or build a parallel
generic icon library. The Design System defines *how* icons are used,
not *which* generic icons exist.

---

## 3. Dependency model

`lucide-react` is a **peer dependency** of `@tokyo3rdhq/magi-design-system`,
not a runtime dependency.

```jsonc
// packages/design-system/package.json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

Why peer (not runtime):

* The Design System does **not** ship icon implementations. Components
  don't import icons. Consumers import Lucide directly.
* Bundling Lucide would force every consumer to use whatever version
  we vendored, causing duplicate-React-style version conflicts.
* Same model as `react`/`react-dom`: peer.

Consumers add Lucide as a direct dependency:

```jsonc
// apps/showroom/package.json
{
  "dependencies": {
    "@tokyo3rdhq/magi-design-system": "file:../../packages/design-system",
    "lucide-react": "^0.460.0"
  }
}
```

The lockfile pins the exact version. Avoid unnecessary icon-library churn.

---

## 4. Size scale

Icons follow a 4-tier size scale. Default is **18px** for inline UI;
compact UI uses 16px; prominent controls use 20–24px.

| Token          | Size | Use case                                  |
| -------------- | ---- | ---------------------------------------- |
| `--magi-icon-size-sm` | 16px | Compact UI / metadata / dense technical |
| `--magi-icon-size-md` | 18px | **Default inline UI**                    |
| `--magi-icon-size-lg` | 20px | Standard controls (button leading icon)  |
| `--magi-icon-size-xl` | 24px | Prominent controls / standalone icons   |

Do not introduce arbitrary icon sizes without a concrete product
requirement. If a new size is genuinely needed, propose it as a token
addition with rationale.

Token names are kept aligned with the existing `--magi-*-size-*`
family so future CSS utilities can reference them.

---

## 5. Stroke contract

Lucide ships stroke-based icons by default. Preserve their conventions:

* **stroke-width: `2`** (Lucide default; do not override per-component)
* **stroke-linecap: `round`**
* **stroke-linejoin: `round`**
* **fill: `none`** for outline icons; **`fill: currentColor`** for solid icons

Do not:

* Randomly override `stroke-width` per component (creates a mixed-weight family)
* Mix filled and outlined icons within the same control without semantic justification
* Add gradients, glows, drop-shadows, or decorative filters to ordinary UI icons
* Use neon outlines or "AI-style" decorative icon compositions

If a MAGI-specific stroke token is needed (e.g., a heavier brand icon), define it
centrally here and reference it everywhere that stroke is overridden.

---

## 6. Color contract

Icons inherit color from the surrounding component via `currentColor`:

```css
color: currentColor;
```

The icon must **not** hard-code a color:

```css
/* WRONG */
fill: #ffffff;
fill: #000000;
color: #f5f5f7;
```

Semantic color mapping (use MAGI tokens, not raw values):

```text
primary foreground      → --magi-text-primary
secondary foreground    → --magi-text-secondary
muted foreground        → --magi-text-tertiary
disabled foreground     → --magi-text-tertiary + opacity 0.5
accent                  → --magi-accent
success / warning / error → --magi-success / --magi-warning / --magi-error
```

**Brand exception**: The MAGI logo and core brand marks (`MagiMark`,
`MagiWordmark`, `MagiLockup`) follow the **Brand Foundation**, not this
contract. They are bound to `--magi-logo-color` (which equals
`--magi-text-primary` in both themes today but is independently overridable
per Logo Color Rule). Brand assets must **never** be recolored with a
product accent.

---

## 7. Theme contract

Icons must work in **both Dark and Light** themes without changing the SVG.

* Theme differences are resolved through semantic color tokens
  (`--magi-text-*`, `--magi-bg-*`).
* Do not ship separate `SearchDark.svg` / `SearchLight.svg`.
* An icon used today MUST be a correct icon in both themes.

The icon contract is validated against:

```text
Dark × Default Accent (green)
Dark × Other Accents (cyan, violet, amber, white)
Light × Default Accent
Light × Other Accents
```

---

## 8. Accessibility contract

Icons are **decorative by default**. The accessible name comes from the
surrounding text or `aria-label`:

```tsx
{/* Decorative — used next to text */}
<button>
  <Search aria-hidden="true" />
  <span>Search</span>
</button>

{/* Icon-only — must have aria-label */}
<button aria-label="Search">
  <Search aria-hidden="true" />
</button>
```

Rules:

* Icons **must** set `aria-hidden="true"` when decorative.
* Icon-only buttons **must** have an `aria-label` (or `aria-labelledby`).
* Do NOT rely on `title` attribute as the only accessibility mechanism.
* For icon + text, the visible text provides the accessible meaning —
  do not duplicate with `aria-label`.
* Status icons (success/warning/error) must reinforce a textual state
  (`✓ Connected`, `⚠ Configuration incomplete`, `✕ Generation failed`).
  Color must never be the sole semantic carrier.

---

## 9. Icon-only controls

Icon-only controls are allowed only when the icon represents a **conventional,
recognizable action** from the canonical list:

```text
Search · Menu · Close · X · Chevron · Arrow · More · Settings ·
Copy · Download · Upload · Refresh · Eye · Eye Off · Expand · Collapse ·
Show · Hide · Previous · Next
```

Avoid icon-only controls for ambiguous actions. If the meaning is not
immediately recognizable, use **icon + text** instead.

Requirements for any icon-only control:

* `aria-label` (or `aria-labelledby`) — required
* Visible `:focus-visible` ring (uses `--magi-focus-ring`)
* Adequate hit area (≥ 44 × 44 px on touch surfaces)
* Disabled / loading states inherit component interaction states
* No random per-component CSS — use the existing button/icon utilities

---

## 10. Icon + text

For actions and navigation, prefer **icon + text** when the icon is
supplemental and the text improves clarity:

```text
Copy          [icon + label]
Download      [icon + label]
Open Docs ↗   [icon + label + external-link marker]
View Model    [icon + label]
```

The icon should reinforce the meaning, not act as decoration.

Avoid:

```text
[icon] Text [icon]    ← second icon provides no information
[icon-only when ambiguous]
```

External destinations use the `↗` glyph after the label, optionally
preceded by an `<ExternalLink>` icon. Keep the treatment subtle.

---

## 11. Custom MAGI icon criteria

A custom icon may be added only when at least one of these is true:

* **A. MAGI-specific semantic** — the concept has no sufficiently precise
  generic representation (e.g., Token Factory, Model Knowledge Graph,
  MAGI Agent).
* **B. Brand recognition** — the icon contributes to MAGI's visual identity.
* **C. Cross-product reuse** — used or expected to be used across multiple
  MAGI products.

Prefer icons that satisfy **semantic uniqueness + cross-product reuse +
long-term stability**.

Do NOT create a custom icon merely because the Lucide icon is not
aesthetically perfect, because a single page wants decoration, or because
a product wants to look different from another.

---

## 12. Ownership model

```text
Design System
├── MAGI Brand Icons
├── Stable MAGI Concept Icons (cross-product)
└── Reusable Semantic Icons

Product
├── Product-specific concepts
├── Temporary concepts
├── One-off illustrations
└── Experimental icons
```

A product-specific icon stays product-owned until there is evidence it is:

1. semantically stable across releases
2. reusable across at least 2 products
3. relevant to MAGI as a long-term concept

Only then promote it into the Design System. This prevents the DS from
becoming a dumping ground for product-specific assets.

---

## 13. Custom SVG rules

When you do ship a custom MAGI icon:

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
>
  <path d="..." stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

Rules:

* `viewBox="0 0 24 24"` (matches Lucide's coordinate space)
* `stroke="currentColor"` for outline; `fill="currentColor"` for solid
* No hard-coded colors
* No embedded raster images
* No gradients, filters, or shadows
* Optimize the SVG (run through svgo or equivalent)
* Visually compatible with Lucide's style — don't introduce a foreign
  icon family
* Geometry stable across releases (changing icon shape = breaking change)

Place custom icons in:

```text
packages/design-system/src/assets/icons/
├── favicon.svg         (brand — see Brand Foundation)
├── app-icon.svg         (brand — see Brand Foundation)
└── custom/
    ├── magi-token-factory.svg
    └── magi-model-graph.svg
```

If a custom icon needs a React wrapper, it lives next to the existing
brand components (`src/brand/MagiLockup.tsx` is the template).

Do not create a separate icon package at this stage.

---

## 14. Optical alignment

Equal mathematical dimensions do not produce equal visual dimensions.
Icons must be optically aligned with:

* Text (icon ↔ baseline)
* Button centers (icon ↔ button center)
* Input text (icon ↔ input text)
* Badge / metadata text

Avoid compensating with arbitrary per-component CSS. If recurring
adjustments are needed, define a system-level rule (e.g., `--magi-icon-align-text:
-0.05em;` for icons sitting next to body text).

---

## 15. Icons in components

* **Button**: icons follow the button's size and state. The icon inherits
  the button's semantic color (default / hover / active / focus /
  disabled / loading). Do not independently style the icon to create a
  second visual hierarchy.

* **Form controls**: decorative icons use `aria-hidden`. Interactive icons
  (clear button, password reveal) must have their own accessible semantics.
  Status icons must not be the sole carrier of error/success information —
  pair with text.

* **Status**: success / warning / error / info / loading icons reinforce
  a textual state. Color must never be the sole semantic carrier.

* **Dense technical UI** (e.g., `models.magi.website`, Token Factory):
  16px icons are acceptable. Do not simplify icons merely to mimic
  a marketing site. Information density matters in product UIs.

---

## 16. Anti-patterns (explicitly prohibited)

### ❌ Don't create generic replacements

```text
MagiSearch · MagiSettings · MagiClose · MagiChevron
```

If they are merely copies of Lucide icons. Import Lucide directly.

### ❌ Don't use emoji as UI icons

Avoid `🔍 ⚙️ 📋 ✨ 🚀`. Emoji rendering varies by platform and doesn't
provide the required visual consistency.

### ❌ Don't mix icon libraries

Avoid mixing Lucide + Heroicons + Font Awesome + Material Icons + custom
SVG within the same interface without a documented reason.

### ❌ Don't mix icon styles

Avoid combining filled + outlined + duotone + 3D + gradient icons in
the same UI without explicit semantic justification.

### ❌ Don't decorate everything

Not every heading, card, button, or section needs an icon. Icons must
communicate meaning.

### ❌ Don't add unnecessary abstractions

Do not build a `<MagiIcon name="search" />` wrapper around Lucide. Just
import `Search` from `lucide-react`. Abstraction must earn its place
(see Implementation Strategy §25).

---

## 17. Validation matrix

The icon contract must be validated across:

```text
Theme × Accent × Context × State × Accessibility

Theme:    Dark, Light
Accent:   Default, Other (cyan, violet, amber, white)
Context:  Navigation, Button, Form, Card, Table/List, Status, Dense Technical
State:    Default, Hover, Active, Focus, Disabled, Loading
A11y:     Decorative, Icon + Text, Icon Only
```

This validation is performed via the existing showroom + scripts.
Each new icon added to the DS MUST be demonstrated in the showroom
across at least the (Theme × Context × A11y) intersection before merge.

---

## 18. Showroom requirements

The showroom MUST include an **Iconography** page demonstrating:

### Generic icons (Lucide)

```text
Search · Settings · Copy · Download · Filter · Refresh ·
External Link · Chevron · More · X · Menu
```

### Sizes

```text
16 · 18 · 20 · 24
```

### Contexts

```text
icon only · icon + text · button · navigation · metadata · status
```

### Themes

```text
Dark · Light  (the global theme picker already covers it)
```

### Accents

```text
Default (green) + 4 other accents via the accent picker
```

### Accessibility examples

```text
decorative icon (aria-hidden)
icon + text (visible text is accessible name)
accessible icon-only button (aria-label)
```

### Custom MAGI icons

Show only icons that **actually exist** in the package. Do not create
placeholder icons merely for the showroom.

---

## 19. Implementation guidance

Prefer direct Lucide imports:

```tsx
import { Search } from 'lucide-react';
```

Only introduce a shared icon abstraction (`<MagiIcon />`, sizing helpers,
analytics hooks) when there is a demonstrated need such as:

* Consistent sizing enforcement (e.g., token-driven size override)
* Accessibility enforcement (auto `aria-hidden` on decorative contexts)
* Analytics / icon-usage tracking
* Theming via DS semantic tokens
* Runtime icon selection
* Custom icon interoperability

Avoid abstraction for abstraction's sake. Most consumers never need it.

For custom MAGI icons, follow the React component template used by
`MagiMark` / `MagiWordmark` / `MagiLockup` — inline `<svg>` with
`currentColor`, prop-driven `size`, and `aria-hidden` by default.

---

## 20. Acceptance checklist

The icon contract is complete when:

- [ ] This document exists at `docs/iconography.md`
- [ ] `lucide-react` is added as a peer dependency of the design system
- [ ] Consumers install `lucide-react` directly (showroom does)
- [ ] The showroom has an Iconography page with Lucide examples
- [ ] Hand-ported Lucide icons in the showroom are replaced with real imports
- [ ] `npm run build` + `npm run typecheck` + the 4 static gates pass
- [ ] No emoji is used as a UI icon
- [ ] No `Magi*` Lucide wrappers exist
- [ ] No random icon libraries are mixed in
- [ ] Brand assets remain governed by `docs/brand.md`
- [ ] Component contracts in `docs/component-contracts.md` are consistent
      with this icon contract (icons-in-buttons, icons-in-form-controls, etc.)
- [ ] Anti-patterns are documented and reviewable

---

## 21. Final principle

> **Use familiar icons for familiar actions.**
>
> **Create MAGI icons only for concepts that belong to MAGI.**
>
> **Consistency comes from rules, not from owning every SVG.**

The resulting system should feel quiet, precise, technical, minimal,
consistent, and recognizable — not decorative, generic-AI, over-designed,
or icon-heavy.