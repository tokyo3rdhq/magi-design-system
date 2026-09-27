# MAGI Design System

Shared visual foundation for the [MAGI](https://magi.website) product family — dark-first, near-monochrome, restrained.

> **Visual consistency without forcing product-level sameness.**

This monorepo contains the package that every MAGI website consumes:

- [`@tokyo3rdhq/magi-design-system`](./packages/design-system) — the npm package: tokens, layout primitives, UI components, and a product theme mechanism. **Latest: 0.3.0**
- [`@tokyo3rdhq/showroom`](./apps/showroom) — the Vite + React + TypeScript visual showcase used during development

## What is MAGI?

[MAGI](https://magi.website) is an independent AI lab operating a family of products (`magi.website`, `api.magi.website`, `chat.magi.website`, `agent.magi.website`). Every product inherits the same visual language — typography, spacing, surfaces, motion, accessibility rules — but each can override its accent color through `<AppTheme accent="…" />` or subtree-level `<div data-magi-accent="…">`.

## Status

**0.3.0 published.** 13 primitives (Container / Section / Stack / Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState / AppTheme) + CSS `@layer` cascade + token literal CI enforcement + 8 ADRs.

- [x] Phase 1 — `0.1.0` — tokens + foundation + layout + Button / Card / Badge + AppTheme
- [x] Phase 2 — `0.2.0` — Checkbox / FormField / Input / Segmented / Banner / EmptyState (extracted from `token-factory-initializr`)
- [x] Phase 3 — `0.3.0` — `@layer` cascade + `<AppTheme>` context (no DOM wrapper) + `<FormField>` aria wiring + `data-magi-accent` subtree accent + token literal CI + 8 ADRs
- [x] **Phase 4** — `magidesign-system` repo migrated to use `@tokyo3rdhq/magi-design-system` itself (this repo's showroom consumes the local package)
- [x] **Phase 5** — `magidesign-system` repo `magi-portal` migrated to use `@tokyo3rdhq/magi-design-system` 0.2.0 (commit `ae63ef7`)
- [ ] **Phase 6** — `token-factory-initializr/web` migration to use `@tokyo3rdhq/magi-design-system` 0.3.0 (in progress)
- [ ] **Phase 7** — extract Navbar / Footer / Tabs / Spinner / Select / CodeBlock only when duplication is observed in 2+ products
- [ ] **Phase 8** — Playwright a11y / focus / reduced-motion / visual regression (deferred from 0.3.0 per ADR-0007)
- [ ] **Phase 9** — 1.0 — public API freeze, scope rename `body` → `html[data-magi-app]` (per ADR-0002), React 19 peer range (per ADR-0006)

See [`docs/architecture-v2.md`](./docs/architecture-v2.md) and [`docs/architecture-review-v2.md`](./docs/architecture-review-v2.md) for the architecture roadmap.

## Repo layout

```
magi-design-system/
├── packages/
│   └── design-system/        # @tokyo3rdhq/magi-design-system — published to npm
├── apps/
│   └── showroom/             # @tokyo3rdhq/showroom — local visual showcase
├── docs/
│   ├── magi_design_system.md # original design spec (lives in magi-portal too)
│   ├── architecture.md       # OLD — superseded by architecture-v2.md; kept for history
│   ├── architecture-v2.md    # target architecture proposal
│   ├── architecture-review-v2.md # challenge of the v2 proposal
│   ├── arch_evo.md           # original refactor brief
│   ├── tokens.md             # every CSS custom property
│   ├── migration-guide.md    # Phase 2 / Phase 3 / Phase 5 consumer guide
│   ├── integration-prompt.md # AI agent prompt for new consumers
│   └── adr/                  # Architecture Decision Records (0001–0008)
├── scripts/
│   └── check-tokens.mjs      # CI token literal enforcement
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

import {
  Container, Section, Stack,
  Button, Card, Badge,
  Checkbox, FormField, Input, Segmented, Banner, EmptyState,
  AppTheme,
} from '@tokyo3rdhq/magi-design-system';

function App() {
  return (
    <AppTheme accent="green" name="magi-portal">
      <Container size="xl">
        <Section spacing="lg">
          <Stack gap="6">
            <FormField label="Project" helper="What you're building.">
              <Input placeholder="e.g. Coding assistant" />
            </FormField>
            <Banner variant="info">
              No requirements set yet. <a href="/start">Go back</a>.
            </Banner>
          </Stack>
        </Section>
      </Container>
    </AppTheme>
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
npm install          # only first time
npm run dev          # vite dev server on http://127.0.0.1:5173
```

The showroom uses `file:` linking to the local package, so live edits in
`packages/design-system/src/` are reflected immediately after a rebuild.

## Documentation

- [Package README](./packages/design-system/README.md) — installation, exports, full API reference (13 primitives)
- [Tokens reference](./docs/tokens.md) — every CSS custom property
- [Architecture v2](./docs/architecture-v2.md) — target architecture proposal
- [Architecture review v2](./docs/architecture-review-v2.md) — challenge of v2
- [Architecture decisions (ADRs)](./docs/adr/) — 8 ADRs covering token, CSS scope, theme, package boundary, bundling, peer range, accessibility, visual regression
- [Migration guide](./docs/migration-guide.md) — moving consumers (magi-portal / token-factory-initializr) to this package
- [Integration prompt](./docs/integration-prompt.md) — AI agent prompt for new `xxx.magi.website` consumers
- [Original spec (magi-portal)](./docs/magi_design_system.md) — the brief that started the design system
- [Changelog](./CHANGELOG.md) — release history (0.1.0 / 0.2.0 / 0.3.0)
- [Contributing](./CONTRIBUTING.md) — workflow + architectural rules
- [Security](./SECURITY.md) — vulnerability disclosure

## License

[MIT](./LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)