# Architecture

This document explains the implementation decisions behind `@tokyo3rdhq/magi-design-system` v0.1.0. It complements (not replaces) the original design spec at [`magi_design_system.md`](./magi_design_system.md).

## Layered model

```
:magi/design-system
│
├── Tokens                  CSS custom properties on :root
├── Foundation              Reset + globals + typography utilities
├── Layout primitives       Container / Section / Stack
├── UI components           Button / Card / Badge
└── Theme                   AppTheme (accent override)
```

All tokens are CSS custom properties; everything else consumes them via `var(--magi-*)`. This keeps tokens usable in any technology (React, plain CSS, Tailwind, Astro, Vite, Next, Cloudflare Pages) — see spec §27.

## Key decisions

### 1. Plain CSS with `.magi-` prefixed classes (not CSS Modules)

The spec allows either CSS Modules OR prefixed class names (spec §24). We chose plain CSS with `magi-` prefixes because:

- **CSS Modules in Vite library mode don't bundle into the published stylesheet.** When we imported `.module.css` files via the `src/styles/index.css` aggregator, Vite treated them as plain CSS and emitted the un-hashed selectors (`._button_10iws_37`), which didn't match the hashed class names React imported (`_button_10iws_37`).
- **CSS Modules would require two compilation paths.** One for components (CSS Modules) and one for the published bundle (plain CSS) — duplicated source.
- **Spec §24 explicitly endorses `magi-button` style prefixes** as a valid alternative.

Trade-off: consumers must avoid naming their own classes `magi-*`. We accept this; the `magi-` namespace is reserved.

### 2. Component selectors are scoped to `body[data-magi-app]`

Foundation resets `[data-magi-app] button` with specificity (0, 1, 1) — higher than a single class. To win, component selectors become `body[data-magi-app] .magi-button--primary` (specificity 0, 2, 1) and still come later in source order.

This is intentional. Removing the global button reset would let components win, but then **unintended** `magi-` collisions with host app resets could leak — defeats the purpose of scoping. Scoping the component selector instead keeps the safety.

### 3. `data-magi-app` lives on `<body>`, not on a child container

Spec §24 says "do not pollute host apps with global class names" and recommends `[data-magi-app]` scoping. The natural assumption is to put it on the app root. We document instead that it goes on `<body>`:

```html
<body data-magi-app>
  <div id="root"></div>
</body>
```

The reason is body-level styles — the dark gradient backdrop, scrollbar, font baseline, focus-visible — target `body`. Putting the attribute on a descendant makes them unreachable:

```css
/* ❌ Never matches (body has no descendants named body) */
[data-magi-app] body { background: … }

/* ✅ Matches */
body[data-magi-app] { background: … }
```

### 4. `src/index.ts` side-effect imports `styles/index.css`

Vite library mode emits only the CSS that's reachable from the JS entry. Without a side-effect import, `dist/styles.css` would be missing `:root` tokens, foundation resets, and component classes — the package would build but be unusable.

```ts
// src/index.ts
import './styles/index.css';     // ← side-effect import; emits dist/styles.css
export * from './layout/index';
export * from './components/Button/index';
// …
```

This is the only side-effect import. Components themselves do **not** import their own `.css` files — they reference class names; the consuming stylesheet supplies the rules.

### 5. Why tokens are NOT wrapped in `body[data-magi-app]`

`:root` is global. Wrapping tokens in `body[data-magi-app]` would make them invisible to any host application code that wants to read `var(--magi-accent)` from a stylesheet **outside** the React tree. Token availability must be global; only the **reset/utility rules** are scoped.

### 6. `color-mix()` for accent-tinted variants

`border-color: color-mix(in srgb, var(--magi-accent) 25%, transparent)` lets the package render accent-tinted borders without hardcoding the accent RGB. When `AppTheme accent="cyan"` flips `--magi-accent` to `#38bdf8`, every border that uses `color-mix(..., var(--magi-accent), ...)` automatically follows. No `rgba(0, 200, 83, 0.25)` literals scattered in CSS.

Browser support: `color-mix()` requires Chrome 111+, Safari 16.2+, Firefox 113+ (mid-2023). Acceptable for 2026.

### 7. `Package.json` exports map

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  }
}
```

- `.` — JS + types entry, tree-shakable
- `./styles.css` — single bundled stylesheet with tokens + foundation + components

Consumers do **exactly two things**:

```ts
import '@tokyo3rdhq/magi-design-system/styles.css';
import { Button, Card } from '@tokyo3rdhq/magi-design-system';
```

Per-component CSS exports (`./components/Button.css`) were considered and rejected: Vite would need `cssCodeSplit: true` (forbidden in lib mode with `input` containing CSS), or per-component entry points (5x build cost, unused by consumers).

### 8. Vite + `tsc -p tsconfig.build.json`

We run two build steps:

- **`vite build`** → ESM bundle (`dist/index.js`) and CSS (`dist/styles.css`)
- **`tsc -p tsconfig.build.json`** → `.d.ts` declarations and source maps

Why two tools? Vite produces a fast JS bundle but does not emit clean `.d.ts` files (it relies on `esbuild` and skips declarations). `tsc` is the canonical declaration emitter. Splitting them costs ~300ms extra and keeps the API surface typed.

### 10. File: link, not workspace protocol

The showroom uses `"@tokyo3rdhq/magi-design-system": "file:../../packages/design-system"`. npm symlinks this, so live edits in the package are picked up after `vite build --watch` rebuilds. We did not use npm workspaces (`workspaces: ["packages/*"]`) because:

- The package will be published to npm and consumed by other repos (magi-portal, token-factory-initializr). Workspaces add complexity that those consumers don't benefit from.
- Symlink behaves identically for our dev use case.

## What we explicitly did NOT build

Per spec §36 / §4:

- ❌ Navbar, Footer, Tabs, Input, CodeBlock, ProductHeader — Phase 4, only when duplication is observed
- ❌ Dark/light theme toggle — package is dark-first (spec §9)
- ❌ i18n in the package — consumers handle that
- ❌ Animation library — CSS transitions only (spec §23)
- ❌ Tailwind plugin / utility generator — spec §27 forbids Tailwind lock-in
- ❌ Storybook — a small Vite showroom covers the same need (spec §28)

## File layout

```
packages/design-system/
├── package.json
├── tsconfig.json                (TS strict, includes src/)
├── tsconfig.build.json          (extends, emits declarations)
├── vite.config.ts               (lib mode, ESM, React JSX)
├── README.md
└── src/
    ├── index.ts                 barrel; side-effect imports styles/index.css
    ├── theme.tsx                AppTheme + AppAccent presets
    ├── env.d.ts                 vite/client + CSS module type shims
    ├── styles/
    │   └── index.css            aggregator: @imports tokens, foundation, layouts, components
    ├── tokens/
    │   ├── index.css            aggregator
    │   ├── colors.css
    │   ├── typography.css
    │   ├── spacing.css
    │   ├── radius.css
    │   ├── motion.css
    │   ├── breakpoints.css
    │   └── misc.css
    ├── foundation/
    │   ├── index.css
    │   ├── reset.css
    │   ├── globals.css
    │   └── typography.css
    ├── layout/
    │   ├── Container.tsx + Container.css + index.ts
    │   ├── Section.tsx + Section.css + index.ts
    │   └── Stack.tsx + Stack.css + index.ts
    ├── components/
    │   ├── Button/   (Button.tsx, Button.css, index.ts)
    │   ├── Card/     (Card.tsx, Card.css, index.ts)
    │   └── Badge/    (Badge.tsx, Badge.css, index.ts)
    └── utils/
        └── classnames.ts        cx() helper
```

Note: there are no `.module.css` files. Earlier iterations used them; they were removed once the bundling limitation was discovered (see decision #1 above).