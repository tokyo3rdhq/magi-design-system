# Migration guide

How to migrate a MAGI website to consume `@magi/design-system`. Covers both known consumers:

- **Phase 2 — [`magi.website`](https://github.com/tokyo3rdhq/magi-portal)** (Astro + Tailwind static site)
- **Phase 3 — [`token-factory-initializr/web`](https://github.com/tokyo3rdhq/token-factory-initializr)** (Cloudflare Pages + React + Vite)

The two consumers have different starting stacks, so the migration paths diverge after the shared installation step.

## Shared: install + import styles

```bash
npm install @magi/design-system
```

In the application entry file:

```ts
import '@magi/design-system/styles.css';
```

Set `data-magi-app` on `<body>`. How you do this depends on the framework:

### Astro

```astro
---
// src/layouts/Layout.astro
import '@magi/design-system/styles.css';
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
import '@magi/design-system/styles.css';
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

If you later add React islands via `@astrojs/react`, mount them under `<ProductTheme>` so the accent override scopes to a subtree:

```astro
---
import { ProductTheme } from '@magi/design-system';
import MyReactComponent from './MyReactComponent';
---
<ProductTheme accent="green" client:load>
  <MyReactComponent client:load />
</ProductTheme>
```

> Note: Astro **server-renders** `ProductTheme` only if you also add React integration. Without React, you can only consume tokens and CSS classes from the package — React components need client islands.

## Phase 2 — migrate `magi.website` (Astro + Tailwind)

magi.website is currently an Astro 4 + Tailwind CSS 3 static site. Its `tailwind.config.mjs` owns the token values via `colors.bg.*`, `colors.ink.*`, `colors.accent.*`, `colors.line.*`. The strategy: **point Tailwind at the design-system's CSS variables**, so the existing utility classes (`bg-bg-base`, `text-ink-primary`, `border-line`) keep working while sourcing from the package's `:root`.

### Step 1 — Install

```bash
cd /home/yw/Projects/code/magi-portal
npm install @magi/design-system
```

### Step 2 — Import styles

In `src/layouts/Layout.astro`:

```astro
---
import '@magi/design-system/styles.css';
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
import { Button, Badge } from '@magi/design-system';
---
<Button variant="primary" client:visible>Click me</Button>
<Badge variant="accent" client:load>v0.1</Badge>
```

> Trade-off: React islands ship React + a small hydration runtime to the client. For purely static elements, prefer keeping the existing Astro markup and just consuming the package's tokens + CSS classes (`.magi-h1`, `.btn-primary` → which already exists, but `.magi-button--primary`).

### Step 6 — Remove duplicated tokens from the host app

Once Tailwind reads from CSS variables, you can **delete** the duplicated token values from `tailwind.config.mjs` and `src/styles/global.css`. This is the moment the design system becomes the single source of truth.

### Step 7 — Visual regression check

Run the existing site and compare against the pre-migration build. Because the underlying values are identical (`#00c853`, `#1d1d1f`, etc.), the visual output should be byte-identical aside from the focus ring (which magi-portal doesn't currently style — adopt the design system's `.focus-visible` rule).

## Phase 3 — migrate `token-factory-initializr/web` (Cloudflare Pages + React + Vite)

This consumer is already React + Vite, so the migration is straightforward.

### Step 1 — Install

```bash
cd /home/yw/Projects/code/token-factory-initializr/web
npm install @magi/design-system
```

### Step 2 — Import styles

In the Vite entry file (e.g. `src/main.tsx`):

```ts
import '@magi/design-system/styles.css';
import './styles/your-existing.css';  // keep until you migrate per-component
```

### Step 3 — Mark `<body>`

In `index.html`:

```html
<body data-magi-app>
  <div id="root"></div>
</body>
```

### Step 4 — Wrap the app in `<ProductTheme>`

The Initializr is a product of MAGI — it should default to the **cyan** accent (per spec §5 example):

```tsx
import { ProductTheme } from '@magi/design-system';

function App() {
  return (
    <ProductTheme accent="cyan" name="token-factory-initializr">
      <Routes />
    </ProductTheme>
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
- Accent override doesn't propagate: verify `<ProductTheme>` wraps your routes

## Compatibility with existing i18n

Both consumers have their own i18n setups (Astro inline script + custom types in magi-portal; whatever the Initializr uses). The design system **does not provide i18n** — consumers keep their own. The package's typography utilities (`.magi-eyebrow`, `.magi-h1`, etc.) are class names; consumers keep using their own `data-i18n` translation layer.

## When to extract more shared components

Per spec §33:

> If the same visual or interaction pattern appears in **2+ MAGI products**, consider extracting it.

Once both Phase 2 and Phase 3 are landed, audit for duplication:

- Top navigation (MAGI brand + product name + links + accent CTA) — likely a shared `<MagiNavbar>`
- Footer (links + copyright) — likely a shared `<MagiFooter>`
- Product header (MAGI / Product Name hierarchy) — `<ProductHeader>`
- Code snippets with copy button — `<CodeBlock>`
- Tabs (used in many product UIs) — `<Tabs>`

Open an issue before building any of these. We do not want a 50-component library; we want the smallest set that eliminates real duplication.