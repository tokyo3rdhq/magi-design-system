# Migration guide

How to migrate a MAGI website to consume `@tokyo3rdhq/magi-design-system`. Covers three consumer profiles and four version-upgrade paths:

- **Phase 2 — [`magi.website`](https://github.com/tokyo3rdhq/magi-portal)** (Astro + Tailwind static site) — landed on `@tokyo3rdhq/magi-design-system@0.6.0` (current)
- **Phase 3 — [`token-factory-initializr/web`](https://github.com/tokyo3rdhq/token-factory-initializr)** (Cloudflare Pages + React + Vite) — landed on `@tokyo3rdhq/magi-design-system@0.2.0`; uses 6 primitives
- **Phase 5 — upgrade from 0.2.0 to 0.3.0** — see "Phase 5 — Upgrade to 0.3.0" section below
- **Phase 6 — upgrade from 0.3.x to 0.4.0** — see "Phase 6 — Upgrade to 0.4.0" section below
- **Phase 7 — upgrade from 0.4.x to 0.5.x** — see "Phase 7 — Upgrade to 0.5.x" section below
- **Phase 8 — upgrade from 0.5.x to 0.6.x** — see "Phase 8 — Upgrade to 0.6.x" section below

The three paths diverge after the shared installation step.

## Shared: install + import styles

```bash
npm install @tokyo3rdhq/magi-design-system
```

In the application entry file:

```ts
import '@tokyo3rdhq/magi-design-system/styles.css';
```

Set `data-magi-app` on `<body>`. How you do this depends on the framework:

### Astro

```astro
---
// src/layouts/Layout.astro
import '@tokyo3rdhq/magi-design-system/styles.css';
---
<html lang="en">
  <body data-magi-app>
    <slot />
  </body>
</html>
```

> Note: Astro `.astro` files can import CSS directly. `data-magi-app` on `<body>` lets the dark gradient backdrop, scrollbar, and font baseline apply.

### React (Vite / Next / etc.)

```tsx
// src/main.tsx (or wherever you mount React)
import '@tokyo3rdhq/magi-design-system/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.body).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Then set the attribute:

```html
<body data-magi-app>
  <div id="root"></div>
</body>
```

If you can't edit the HTML template, set it from JS:

```ts
document.body.setAttribute('data-magi-app', '');
```

### Astro + React islands

If you later add React islands via `@astrojs/react`, mount them under `<AppTheme>` so the accent override scopes to a subtree:

```astro
---
import { AppTheme } from '@tokyo3rdhq/magi-design-system';
import MyReactComponent from './MyReactComponent';
---
<AppTheme accent="green" client:load>
  <MyReactComponent client:load />
</AppTheme>
```

> Note: Astro **server-renders** `AppTheme` only if you also add React integration. Without React, you can only consume tokens and CSS classes from the package — React components need client islands.

## Phase 2 — migrate `magi.website` (Astro + Tailwind)

magi.website is currently an Astro 4 + Tailwind CSS 3 static site. Its `tailwind.config.mjs` owns the token values via `colors.bg.*`, `colors.ink.*`, `colors.accent.*`, `colors.line.*`. The strategy: **point Tailwind at the design-system's CSS variables**, so the existing utility classes (`bg-bg-base`, `text-ink-primary`, `border-line`) keep working while sourcing from the package's `:root`.

### Step 1 — Install

```bash
cd /home/yw/Projects/code/magi-portal
npm install @tokyo3rdhq/magi-design-system
```

### Step 2 — Import styles

In `src/layouts/Layout.astro`:

```astro
---
import '@tokyo3rdhq/magi-design-system/styles.css';
import '../styles/global.css';  // your existing Tailwind imports
---
```

### Step 3 — Mark `<body>`

```astro
<body data-magi-app>
  <slot />
</body>
```

### Step 4 — Replace Tailwind tokens with CSS variable references

Update `tailwind.config.mjs`:

```js
// before
colors: {
  bg: {
    base: '#000000',
    raised: '#1d1d1f',
    card: 'rgba(255, 255, 255, 0.04)',
  },
  ink: {
    primary: '#f5f5f7',
    // ...
  },
  accent: { DEFAULT: '#00c853' /* ... */ },
  line: { DEFAULT: 'rgba(255, 255, 255, 0.08)' },
}

// after — Tailwind reads from the package's tokens
function varToken(name) {
  return `var(--magi-${name})`;
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-base':     varToken('bg-base'),
        'bg-raised':   varToken('bg-raised'),
        'bg-card':     varToken('bg-card'),
        'ink-primary': varToken('text-primary'),
        'ink-secondary': varToken('text-secondary'),
        'ink-tertiary':  varToken('text-tertiary'),
        'accent': {
          DEFAULT: varToken('accent'),
          hover:   varToken('accent-hover'),
          soft:    varToken('accent-soft'),
        },
        line: {
          DEFAULT: varToken('border'),
          strong:  varToken('border-strong'),
        },
      },
      // spacing, fontFamily, borderRadius, maxWidth can either stay in Tailwind
      // or be moved to the design system — see step 5.
    },
  },
};
```

The result: `bg-bg-base`, `text-ink-primary`, `border-line` continue to work, but the values now come from `:root` via the package. Change `--magi-accent` once and the whole site follows.

### Step 5 — Move components (optional, later)

After step 4, you can start replacing hand-rolled Astro components with the package's React components. To use React components in Astro, install the integration:

```bash
npm install @astrojs/react react react-dom
```

```js
// astro.config.mjs
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

Then:

```astro
---
import { Button, Badge } from '@tokyo3rdhq/magi-design-system';
---
<Button variant="primary" client:visible>Click me</Button>
<Badge variant="accent" client:load>v0.1</Badge>
```

> Trade-off: React islands ship React + a small hydration runtime to the client. For purely static elements, prefer keeping the existing Astro markup and just consuming the package's tokens + CSS classes (`.magi-h1`, `.btn-primary` → which already exists, but `.magi-button--primary`).

### Step 6 — Remove duplicated tokens from the host app

Once Tailwind reads from CSS variables, you can **delete** the duplicated token values from `tailwind.config.mjs` and `src/styles/global.css`. This is the moment the design system becomes the single source of truth.
### Step 6.5 — Brand identity (0.5.0+)

The package ships the canonical MAGI logo as of 0.5.0. Replace hand-rolled brand markup:

```astro
---
import { MagiLockup, MagiMark } from '@tokyo3rdhq/magi-design-system';
---
<MagiLockup size="sm" ariaHidden={false} alt="MAGI" client:load />
```

For static assets (favicon, OG image), copy from the package's dist:

```bash
cp node_modules/@tokyo3rdhq/magi-design-system/dist/assets/icons/favicon.svg public/favicon.svg
cp node_modules/@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-lockup.svg public/og-default.svg
```

Full guidelines: [`brand.md`](./brand.md).


### Step 7 — Visual regression check

Run the existing site and compare against the pre-migration build. Because the underlying values are identical (`#00c853`, `#1d1d1f`, etc.), the visual output should be byte-identical aside from the focus ring (which magi-portal doesn't currently style — adopt the design system's `.focus-visible` rule).

## Phase 3 — migrate `token-factory-initializr/web` (Cloudflare Pages + React + Vite)

This consumer is already React + Vite, so the migration is straightforward.

### Step 1 — Install

```bash
cd /home/yw/Projects/code/token-factory-initializr/web
npm install @tokyo3rdhq/magi-design-system
```

### Step 2 — Import styles

In the Vite entry file (e.g. `src/main.tsx`):

```ts
import '@tokyo3rdhq/magi-design-system/styles.css';
import './styles/your-existing.css';  // keep until you migrate per-component
```

### Step 3 — Mark `<body>`

In `index.html`:

```html
<body data-magi-app>
  <div id="root"></div>
</body>
```

### Step 4 — Wrap the app in `<AppTheme>`

The Initializr is a product of MAGI — it should default to the **cyan** accent (per spec §5 example):

```tsx
import { AppTheme } from '@tokyo3rdhq/magi-design-system';

function App() {
  return (
    <AppTheme accent="cyan" name="token-factory-initializr">
      <Routes />
    </AppTheme>
  );
}
```

### Step 5 — Replace hand-rolled components

| Existing component | Replacement |
| --- | --- |
| `<Button className="btn-primary">…</Button>` | `<Button variant="primary">…</Button>` |
| `<div className="card">…</div>` | `<Card variant="elevated">…</Card>` |
| `<span className="badge">…</span>` | `<Badge variant="accent">…</Badge>` |
| `<div className="container">…</div>` | `<Container size="xl">…</Container>` |
| `<section className="section">…</section>` | `<Section spacing="lg">…</Section>` |

Product-specific components (`ModelCard`, `ProviderTabs`, `ModelSelector`, etc.) stay in `token-factory-initializr/web/src/components/` — they should **use** the design system primitives (Button, Card, Badge, Tabs, etc.) but live in the product.

### Step 6 — Visual regression

Open the Initializr locally and verify the cyan accent flows correctly. Common issues:

- Tokens don't show: check that `data-magi-app` is on `<body>` (not on `#root`)
- Component styles don't apply: check the browser's computed `body[data-magi-app]` is matching the wrapper
- Accent override doesn't propagate: verify `<AppTheme>` wraps your routes

## Compatibility with existing i18n

Both consumers have their own i18n setups (Astro inline script + custom types in magi-portal; whatever the Initializr uses). The design system **does not provide i18n** — consumers keep their own. The package's typography utilities (`.magi-eyebrow`, `.magi-h1`, etc.) are class names; consumers keep using their own `data-i18n` translation layer.

## When to extract more shared components

Per spec §33:

> If the same visual or interaction pattern appears in **2+ MAGI products**, consider extracting it.

Current state at 0.3.0:

- 13 UI primitives (Container / Section / Stack / Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState / AppTheme) + 3 brand primitives (`MagiMark` / `MagiWordmark` / `MagiLockup`) shipped
- All have at least one consumer in `magi.website` or `token-factory-initializr`

Still deferred per ADR-0004 (`docs/adr/0004-package-boundary.md`) and §34 non-goals:

- **Navbar / Footer / ProductHeader**: tfi and magi-portal both have hand-rolled topbar / footer / brand patterns. Spec §18 / §19 calls these out as candidates, but they're product-specific enough that we're waiting for the second consumer to actually need them before extracting. If/when `api.magi.website` starts building and needs the same, extract at that point.
- **Tabs / Switch / Tooltip / Modal / Toast / CommandBar**: not yet seen in any product. Wait for a real consumer.
- **Spinner / Select / CodeBlock**: tfi 0.x draft used hand-rolled spinner but only for inline loading state; no Select; CodeBlock was an empty state in 0.2.0. None reached the threshold for extraction in 0.3.0.

Open an issue before building any of these. We do not want a 50-component library; we want the smallest set that eliminates real duplication.

## Phase 5 — Upgrade from 0.2.0 to 0.3.0

### Breaking change 1: `<AppTheme>` no longer wraps in `<div>`

**Before (0.2.0)**: `<AppTheme accent="cyan">` returned `<div data-magi-product="..." style={accentVars}>`. Children inherited via the wrapper.

**After (0.3.0)**: `<AppTheme>` is a React context provider + `useEffect` setter on `<html>`. No DOM wrapper. The four accent CSS variables are set on `document.documentElement` directly.

```tsx
// 0.2.0 (old): wrapper renders <div data-magi-product="...">
<AppTheme accent="cyan" name="token-factory">
  <App />
</AppTheme>

// 0.3.0 (new): no DOM mutation; <html> gets the accent variables
<AppTheme accent="cyan" name="token-factory">
  <App />
</AppTheme>
// Inspect: document.documentElement.style.getPropertyValue('--magi-accent')
//          → '#38bdf8' (cyan)
// Inspect: document.documentElement.dataset.magiProduct
//          → 'token-factory'
```

**What breaks for consumers**:

- **Layout**: any CSS that depended on the wrapper `<div>` (e.g. `:first-child`, `:nth-child(1)`, `display: grid` direct children) needs to be reviewed. The wrapper is gone — children are direct.
- **DOM queries**: code that did `document.querySelector('[data-magi-product]')` to find the wrapper div now finds `<html>` instead. Update selectors if you read the attribute from a specific element.
- **Portals**: portals rendered inside `<AppTheme>` no longer have the wrapper as their layout parent — they go directly to the body. This is the desired behavior.

**What does NOT break**:

- `data-magi-product="<name>"` is now on `<html>` (was on wrapper div). Consumers reading this attribute just need to query `<html>` instead of a child div.
- The four accent variables (`--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast`) are now inherited via cascade through the root document, not via the wrapper.

### Breaking change 2: `tokens?: Partial<CSSProperties>` prop removed

**Before (0.2.0)**: `<AppTheme tokens={{ '--magi-text-primary': 'red' }}>` let consumers redefine any CSS variable through the theme component.

**After (0.3.0)**: this prop is removed. Only `accent` (preset) and `name` remain.

**Migration**: if a consumer was using `tokens` for subtree accent overrides, switch to `<div data-magi-accent="<name>">`:

```tsx
// 0.2.0 (old): arbitrary variable override
<AppTheme tokens={{ '--magi-accent': 'var(--magi-error)' }}>
  <DangerCard />
</AppTheme>

// 0.3.0 (new): use the shipped data-magi-accent attribute
<div data-magi-accent="danger">
  <DangerCard />
</div>
```

The `data-magi-accent="<name>"` attribute maps to:
- Accent presets: `green` / `cyan` / `violet` / `amber` / `white`
- Semantic colors: `danger` / `warning` / `success`

If a consumer was using `tokens` for non-accent variables (e.g. typography, spacing), they should stop — the design system explicitly forbids that (spec §10). Move the override to consumer-local CSS, not via the design system.

### Breaking change 3: `<FormField>` aria wiring is now real

**Before (0.2.0)**: `<FormField>` generated IDs for the helper span and label, but never attached `aria-describedby` / `aria-labelledby` / `aria-invalid` to the child control. The JSDoc claimed automatic wiring; the code didn't deliver it.

**After (0.3.0)**: `<FormField>` uses `Children.only + cloneElement` to inject the ARIA attributes on the child control automatically.

```tsx
// Both before and after: same JSX usage
<FormField label="Email" helper="We'll never share this.">
  <Input type="email" placeholder="you@example.com" />
</FormField>

// After 0.3.0, the rendered DOM has:
// <div class="magi-field">
//   <label id=":r0:-label" class="magi-field-label">Email</label>
//   <input
//     id=":r0:"
//     aria-describedby=":r0:-helper"
//     aria-labelledby=":r0:-label"
//     aria-invalid="true"        ← only when error is present
//     ...
//   />
//   <span id=":r0:-helper" class="magi-field-helper">We'll never share this.</span>
// </div>
```

**What changes for consumers**:

- **Bug fix**: screen readers now announce the helper/error text when the child control receives focus. Before, they didn't (because `aria-describedby` was missing).
- **Newly validated attribute**: `aria-invalid="true"` is set on the child when `error` is present.
- **`label` association**: the `<label>` element gets an `id`, so click-to-focus and screen reader label work.

**What does NOT change**:

- The JSX usage is identical.
- `FormField` still requires a single child (`Children.only`). Complex multi-element children silently skip the wiring (no error), but the label and helper/error still render.

### Non-breaking: token cleanup + `@layer` + `data-magi-accent`

These are additive and don't require consumer changes:

- All `rgba()` literals in component CSS replaced with `color-mix(in srgb, var(--magi-*) N%, transparent)`. Visual output is identical.
- All `font-size: Npx` replaced with `var(--magi-font-size-*)` tokens. Visual output is identical.
- CSS `@layer` cascade adopted. Consumer unlayered styles always win — no consumer action needed.

### Verification checklist (0.2.0 → 0.3.0)

```bash
# 1. Bump the dependency
npm install @tokyo3rdhq/magi-design-system@^0.3.0

# 2. Build
npm run build           # should succeed; CSS is now ~24 kB (was ~22 kB)
npm run typecheck       # should succeed

# 3. Test in dev
npm run dev             # open the consumer app
#   - Verify accent still flows everywhere (eyebrow, primary button, focus ring)
#   - Verify the wrapper <div> is GONE (inspect body, no extra node)
#   - Verify a FormField with helper/error now announces correctly via screen reader
#   - Verify <div data-magi-accent="danger"> overrides accent for that subtree only

# 4. If using tokens?: Partial<CSSProperties> anywhere — must remove.
#    grep -r 'tokens={' src/
#    Replace with data-magi-accent="<name>" for accent overrides.
```

### What 0.3.0 does NOT include

Per ADR-0007 (`docs/adr/0007-accessibility.md`):

- Playwright a11y checks (axe-core)
- Playwright focus + reduced-motion verification
- Playwright visual regression (~70 baseline snapshots)

These are deferred to 0.4.0. Until then, manual visual verification is the regression strategy for visual changes.

## Phase 6 — Upgrade from 0.3.x to 0.4.0

`@tokyo3rdhq/magi-design-system@0.4.0` ships one breaking change: `<ProductTheme>` was renamed to `<AppTheme>`. The rename addresses the architectural mismatch flagged in `docs/architecture-review-0.3.md` §P0.1 — the component name claimed "subtree scope" but the implementation sets accent CSS variables on `<html>` (global). The new name reflects the actual behavior: **application-level** accent configuration.

For CSS subtree scope, the dedicated mechanism is `<div data-magi-accent="<name>">` (introduced in 0.3.0). `<AppTheme>` is for app-level configuration only.

### Breaking change 1: `<ProductTheme>` → `<AppTheme>`

**Renamed in 0.4.0:**

| 0.3.x | 0.4.0 |
|---|---|
| `<ProductTheme>` | `<AppTheme>` |
| `useProductTheme()` | `useAppTheme()` |
| `ProductThemeProps` (TS type) | `AppThemeProps` |
| `ProductAccent` (TS type) | `AppAccent` |

Internal types (`ProductThemeContext`, `ProductThemeContextValue`) are also renamed but were never exported.

**No behavioral change.** Same accent presets, same `accent` / `name` props, same Context behavior, same CSS variable targets. The only difference is the name.

### Migration

```diff
-import { ProductTheme, useProductTheme } from '@tokyo3rdhq/magi-design-system';
+import { AppTheme, useAppTheme } from '@tokyo3rdhq/magi-design-system';

-const accent = useProductTheme().accent;
+const accent = useAppTheme().accent;

-<ProductTheme accent="cyan" name="token-factory">
+<AppTheme accent="cyan" name="token-factory">
   <App />
-</ProductTheme>
+</AppTheme>
```

For consumers using `ProductAccent` as a type:

```diff
-const [accent, setAccent] = useState<ProductAccent>('green');
+const [accent, setAccent] = useState<AppAccent>('green');
```

### Why this rename

Per `docs/architecture-review-0.3.md` §P0.1:

> The component name is misleading. `<ProductTheme>` provides app-level accent (CSS vars on `<html>`), with a JS-only Context for children who explicitly call `useProductTheme()`. A consumer who calls `useProductTheme()` inside a nested `<ProductTheme>` gets the inner accent (correct React behavior). The CSS in that subtree also reads the inner accent (because the inner's effect overwrote `<html>`). But siblings outside the inner subtree ALSO read the inner accent (because the CSS variable is global). Context and CSS disagree.

The rename to `<AppTheme>` makes the actual scope explicit:

- **`<AppTheme>`**: app-level accent configuration. Set once at the root of your React tree. CSS variables land on `<html>`. Affects the entire document.
- **`<div data-magi-accent="...">`**: CSS subtree accent override. The shipped CSS rules in `foundation/globals.css` map this attribute to accent presets or semantic colors. Works regardless of where in the tree it's used.

For the full subtree vs app-level distinction and the nested-theme snapshot/restore behavior added in 0.3.1, see `docs/architecture-review-0.3.md` §P0.1 + §P0.2.

### What 0.4.0 does NOT include (still deferred)

Per `docs/architecture-review-0.3.md`:

- **P1.1** Accent source-of-truth single test (defer to 0.4.x patch)
- **P1.2** Extend token literal check to `.tsx`/`.ts` files (defer)
- **P1.5** Drop `src/styles` from `files` in `package.json` (defer)
- **P2** `<Segmented>` keyboard navigation (Arrow / Home / End / Space)
- **P2.1** FormField child contract formalization (JSDoc only)
- **P2.2** State token vocabulary in new ADR
- **P2.3** Cascade contract for consumers in new ADR
- **axe-playwright / Playwright visual regression** per ADR-0007

The next 0.4.x patch will land P1.1 / P1.2 / P1.5. The next minor (0.5.0) will land P2 items + axe-playwright per ADR-0002 scope rename plan.

## Phase 7 — Upgrade from 0.4.x to 0.5.x (Brand Foundation)

`@tokyo3rdhq/magi-design-system@0.5.x` ships two minor releases:

- **`0.5.0`** — adds the **MAGI Brand Foundation** (additive, no breaking changes).
- **`0.5.1`** — boundary cleanup. `ACCENT_PRESETS` moves from `src/theme.tsx` to a new framework-agnostic module `src/tokens/accent-presets.ts`. Public API is unchanged — `AppAccent` and `AccentTokens` types are still re-exported from `src/theme.tsx` for compatibility.

### Breaking change — none

`0.5.x` is fully backward-compatible with `0.4.x`. Existing imports keep working. The `<Segmented>` keyboard navigation, `<AppTheme>` (no DOM wrapper), `data-magi-accent="<name>"` subtree accent, and all 13 UI primitives remain unchanged. The 3 new brand primitives are additive.

### Additive 1 — Brand Foundation (0.5.0)

Three new React components and five canonical SVG assets. Replace hand-rolled brand markup:

```tsx
import { MagiMark, MagiWordmark, MagiLockup } from '@tokyo3rdhq/magi-design-system';

// Decorative (default — aria-hidden="true"):
<MagiLockup size="md" />

// Meaningful (when the logo is the only brand identifier on the page):
<MagiLockup size="md" ariaHidden={false} alt="MAGI — home" />
```

Sizes: `sm` (20 px tall) / `md` (32 px tall, default) / `lg` (48 px tall).

For static consumers (favicon, OG image) that don't render React, copy the canonical SVG from the published package:

```bash
cp node_modules/@tokyo3rdhq/magi-design-system/dist/assets/icons/favicon.svg public/favicon.svg
cp node_modules/@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-lockup.svg public/og-default.svg
```

Full brand guidelines (clear space, minimum size, misuse rules, product relationship): [`brand.md`](./brand.md). Component contracts for the brand components: [`component-contracts.md`](./component-contracts.md#magi-mark).

### Additive 2 — Component Contracts doc (0.5.1)

A new document at [`docs/component-contracts.md`](./component-contracts.md) defines the framework-agnostic **Contract** for every shipped component (semantic structure / accessibility / visual states / token binding). This is the Layer 4 of the framework-agnostic architecture — see [`architecture-review-framework-agnostic.md`](./architecture-review-framework-agnostic.md) for the full boundary map.

Consumers do not need to change code to adopt it. Future contributors reference it when adding new framework implementations (Vue, vanilla HTML, etc.) or auditing React parity.

### Notes

- The MAGI logo is **stable across product accents** — it uses `currentColor`, not `var(--magi-accent)`. Product accent belongs to CTAs and links; the brand mark stays in text color.
- CSS class names (`magi-button--primary`, `magi-mark--md`, etc.) remain in Layer 5 (Web/CSS Implementation) and may be freely refactored. They are not the Design System API. The contract API is the four-section definition in `component-contracts.md`.
- 0.5.x is the first release produced after the [framework-agnostic architecture review](./architecture-review-framework-agnostic.md). Future minor versions will continue to formalize the boundary map.

### What 0.5.x does NOT include (still deferred)

- `body[data-magi-app]` → `html[data-magi-app]` scope rename (per ADR-0002). Deferred to post-0.5.x — waiting for second consumer confirmation.
- React 19 peer range expansion (per ADR-0006). Deferred until a consumer requires it.
- axe-playwright / Playwright visual regression (per ADR-0007 + ADR-0008). Deferred to a future minor.
- Vue framework implementation. Deferred until a Vue consumer exists.
- New primitives beyond the current 13 + 3 brand primitives.

## Phase 8 — Upgrade from 0.5.x to 0.6.x (Light/Dark Theme + Scope Rename)

`@tokyo3rdhq/magi-design-system@0.6.0` formalizes the **Light/Dark color mode** as part of the public surface, executes the long-deferred **`body[data-magi-app]` → `html[data-magi-app]` scope rename** (per ADR-0002), and **enforces the Logo Contrast Rule** by binding the brand component wrapper to `--magi-logo-color`.

### Breaking changes — two

#### Breaking 1 — `data-magi-app` is now on `<html>` (was `<body>`)

```diff
- <body data-magi-app>
+ <html data-magi-app>
+   <body>
+     <!-- app mounts here -->
+   </body>
+ </html>
```

`body[data-magi-app]` **still works** for backward compatibility — the CSS selector is now `[data-magi-app]` (matches any element). But the canonical placement is `<html>`. Migration is recommended but not required:

- `<body data-magi-app>` keeps working. Component CSS still applies.
- `<html data-magi-app>` is canonical — better for apps that render into nested roots.

If your server-rendered layout hard-codes `<body data-magi-app>`, no change needed. Move to `<html>` at your own pace.

#### Breaking 2 — `<AppTheme>` writes `data-magi-theme="<theme>"` to `<html>`

`<AppTheme>` now writes a second attribute (`data-magi-theme`) in addition to the four accent CSS variables. **No new prop is required** — `theme` defaults to `'dark'` (canonical, same as pre-0.6.0 behavior). To opt into Light:

```tsx
<AppTheme theme="light">
  <App />
</AppTheme>
```

Without the new prop, the rendered DOM looks like `<html data-magi-app data-magi-product="…" data-magi-theme="dark">` (theme attribute is set, but to the default Dark value). Existing consumers see no behavior change.

### Additive — `<AppTheme>` accepts a `theme` prop

```tsx
<AppTheme accent="cyan" theme="light">
  <App />
</AppTheme>
// accent: 'green' | 'cyan' | 'violet' | 'amber' | 'white' (default: 'green')
// theme:  'dark' | 'light'                              (default: 'dark' — canonical)
```

### Additive — `<AppTheme>` returns `{ accent, theme }` from context

```tsx
import { useAppTheme } from '@tokyo3rdhq/magi-design-system';

function MyComponent() {
  const { accent, theme } = useAppTheme();
  // theme is 'dark' | 'light'. Default: { accent: 'green', theme: 'dark' }.
}
```

### Additive — `data-magi-theme="<theme>"` for subtree scope

Opt into Light within a Dark page (or vice versa) without React:

```html
<div data-magi-theme="light">
  <Card>…</Card>
</div>
```

### Additive — `--magi-logo-color` semantic token

The brand component wrapper (`.magi-mark`, `.magi-wordmark`, `.magi-lockup`) now sets `color: var(--magi-logo-color)`. The Logo Contrast Rule is enforced by the system, not by the consumer:

| Theme | `--magi-logo-color` | Logo appearance |
|---|---|---|
| Dark (default) | `#f5f5f7` (near-white) | White logo |
| Light | `#050505` (near-black) | Black logo |

Consumers no longer need to set `color` on the brand wrapper themselves — the system picks the right foreground for the current theme automatically.

If you previously hard-coded a logo color (e.g., `style={{ color: '#fff' }}` on a dark surface to fix visibility), remove that override — the system now handles it. Hard-coded overrides still work for overriding the system in specific contexts (e.g., placing the logo on an accent-colored CTA background).

### Migration steps

1. **Move `data-magi-app` to `<html>`** (optional but recommended):
   ```diff
   - <body data-magi-app>
   + <html data-magi-app>
   ```
     No code change beyond HTML structure. CSS selectors are now element-agnostic.

2. **Adopt the `theme` prop if you want Light** (optional):
   ```tsx
   <AppTheme accent="cyan" theme="light">…</AppTheme>
   ```
     Default Dark behavior unchanged.

3. **Remove hard-coded logo color overrides** (recommended):
   ```diff
   - <a href="/" style={{ color: '#fff' }}>
   -   <MagiLockup />
   - </a>
   + <a href="/">
   +   <MagiLockup />
   + </a>
   ```
     The system now handles foreground color automatically per theme.

4. **If you have a CSS file that uses `body[data-magi-app]` selectors**: rewrite to `[data-magi-app]`. The selector matches any element.

### Notes

- The package remains **dark-first**: the SSR-safe default is Dark. White-on-white flash before hydration is impossible.
- Accent (`--magi-accent`) is **independent** of theme: `<AppTheme accent="cyan" theme="light">` is a valid combination. Accent and theme are orthogonal axes.
- The MAGI logo geometry is unchanged — only the runtime color binding changed.
- See [`docs/brand.md`](./brand.md#color-modes) for the canonical Color Modes + Logo Contrast Rule documentation.

### What 0.6.0 does NOT include (still deferred)

- React 19 peer range expansion (per ADR-0006).
- axe-playwright / Playwright visual regression (per ADR-0007 + ADR-0008).
- Vue framework implementation.
- New primitives beyond the current 13 + 3 brand primitives.
- Light theme for individual component CSS classes (component-level Light variants) — not needed today since the entire subtree theme swap is sufficient.