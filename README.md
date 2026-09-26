# MAGI Design System

Shared visual foundation for the [MAGI](https://magi.website) product family — dark-first, near-monochrome, restrained.

> **Visual consistency without forcing product-level sameness.**

This monorepo contains the package that every MAGI website consumes:

- [`@tokyo3rdhq/magi-design-system`](./packages/design-system) — the npm package: tokens, layout primitives, UI components, and a product theme mechanism
- [`@tokyo3rdhq/showroom`](./apps/showroom) — the Vite + React + TypeScript visual showcase used during development

## What is MAGI?

[MAGI](https://magi.website) is an independent AI lab operating a family of products (`magi.website`, `api.magi.website`, `chat.magi.website`, `agent.magi.website`). Every product inherits the same visual language — typography, spacing, surfaces, motion, accessibility rules — but each can override its accent color through `<ProductTheme accent="…" />`.

## Why a design system?

The full rationale is in [`docs/magi_design_system.md`](./docs/magi_design_system.md). The short version:

- One source of truth for typography, color, spacing, radius, motion — no per-product copies
- Per-product accents that respect MAGI's visual hierarchy
- Framework-friendly: tokens are CSS custom properties, components are plain React + CSS

## Status

**Phase 1 — Foundation.** Tokens, foundation, layout primitives, UI primitives (Button / Card / Badge), and product theme.

- [x] Phase 1 — tokens + foundation + layout + Button / Card / Badge + ProductTheme
- [ ] Phase 2 — migrate [`magi.website`](https://github.com/tokyo3rdhq/magi-portal) to consume `@tokyo3rdhq/magi-design-system`
- [ ] Phase 3 — migrate [`token-factory-initializr/web`](https://github.com/tokyo3rdhq/token-factory-initializr) to consume `@tokyo3rdhq/magi-design-system`
- [ ] Phase 4 — extract Navbar / Footer / Tabs / CodeBlock / Input only when duplication is observed

See [`docs/magi_design_system.md` §30](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md) for the original phase plan.

## Repo layout

```
magi-design-system/
├── packages/
│   └── design-system/        # @tokyo3rdhq/magi-design-system — published to npm
├── apps/
│   └── showroom/             # @tokyo3rdhq/showroom — local visual showcase
├── docs/
│   ├── magi_design_system.md # original design spec (lives in magi-portal too)
│   ├── architecture.md       # implementation decisions
│   ├── tokens.md             # token reference
│   └── migration-guide.md    # Phase 2 / Phase 3 consumer guide
├── LICENSE
└── README.md
```

## Quick start

Install the package in any React app:

```bash
npm install @tokyo3rdhq/magi-design-system
```

```tsx
// app entry
import '@tokyo3rdhq/magi-design-system/styles.css';

import { Container, Section, Button, Card, Badge, ProductTheme } from '@tokyo3rdhq/magi-design-system';

function App() {
  return (
    <ProductTheme accent="green">
      <Container size="xl">
        <Section spacing="lg">
          <Card variant="elevated" padding="lg">
            <Badge variant="accent">v0.1</Badge>
            <h1 className="magi-h1" style={{ marginTop: 'var(--magi-space-4)' }}>
              Hello, MAGI
            </h1>
            <Button variant="primary">Get started</Button>
          </Card>
        </Section>
      </Container>
    </ProductTheme>
  );
}
```

`<body>` must carry `data-magi-app` so the foundation styles can scope themselves:

```html
<body data-magi-app>
  <div id="root"></div>
</body>
```

## Local development

```bash
# 1. Install workspace dependencies
npm install --workspaces --include-workspace-root

# 2. Build the package once (or run in watch mode)
cd packages/design-system
npm run dev          # vite build --watch

# 3. Start the showroom
cd ../../apps/showroom
npm run dev          # vite dev server on http://127.0.0.1:5173
```

The showroom uses `file:` linking to the local package, so live edits in `packages/design-system/src/` are reflected immediately after a rebuild.

## Documentation

- [Package README](./packages/design-system/README.md) — installation, exports, API reference
- [Tokens reference](./docs/tokens.md) — every CSS custom property
- [Architecture decisions](./docs/architecture.md) — why plain CSS, why `body[data-magi-app]`, why a side-effect import
- [Migration guide](./docs/migration-guide.md) — moving `magi.website` and `token-factory-initializr/web` to this package
- [Changelog](./CHANGELOG.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)

## License

[MIT](./LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)