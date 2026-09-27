# MAGI Design System

Shared visual foundation for the [MAGI](https://magi.website) product family — dark-first, near-monochrome, restrained.

> **Visual consistency without forcing product-level sameness.**

This monorepo contains the package that every MAGI website consumes:

- [`@tokyo3rdhq/magi-design-system`](./packages/design-system) — the npm package: tokens, layout primitives, UI components, and a product theme mechanism. **Latest: 0.4.2**
- [`@tokyo3rdhq/showroom`](./apps/showroom) — the Vite + React + TypeScript visual showcase used during development

## What is MAGI?

[MAGI](https://magi.website) is an independent AI lab operating a family of products (`magi.website`, `api.magi.website`, `chat.magi.website`, `agent.magi.website`). Every product inherits the same visual language — typography, spacing, surfaces, motion, accessibility rules — but each can override its accent color through `<AppTheme accent="…" />` or subtree-level `<div data-magi-accent="…">`.

## Status

**0.4.2 published.** 13 primitives (Container / Section / Stack / Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState / AppTheme) + CSS `@layer` cascade + token literal CI enforcement + accent source-of-truth CI + 8 ADRs.

Release history (chronological):

- [x] `0.1.0` — tokens + foundation + layout (Container/Section/Stack) + Button / Card / Badge + AppTheme
- [x] `0.2.0` — Checkbox / FormField / Input / Segmented / Banner / EmptyState (extracted from `token-factory-initializr`)
- [x] `0.3.0` — `@layer` cascade + `<AppTheme>` context (no DOM wrapper) + `<FormField>` aria wiring + `data-magi-accent` subtree accent + token literal CI + 8 ADRs
- [x] `0.3.1` — `<AppTheme>` useEffect cleanup (snapshot/restore) + switch to `useInsertionEffect` (no FOUC) + `<FormField>` aria-describedby / aria-labelledby merge (preserve consumer ARIA refs)
- [x] `0.4.0` — rename `<ProductTheme>` → `<AppTheme>` (the original name misleadingly claimed subtree scope; the implementation sets CSS vars on `<html>`, which is global)
- [x] `0.4.1` — token literal CI extended to `.tsx` / `.ts` files + new accent source-of-truth CI script (cross-validates `ACCENT_PRESETS` in `theme.tsx` against `data-magi-accent` rules in `globals.css`)
- [x] `0.4.2` — `<Segmented>` keyboard navigation (Arrow / Home / End + roving tabindex) per WAI-ARIA radio group pattern

Consumer adoption (separate from package versioning):

- [x] `magidesign-system` repo showroom consumes `@tokyo3rdhq/magi-design-system` itself (file: link)
- [x] `magi-portal` migrated to `@tokyo3rdhq/magi-design-system@0.2.0` (commit `ae63ef7` in magi-portal repo)
- [ ] `token-factory-initializr/web` migration in progress

Deferred to **0.5.0**:

- `body[data-magi-app]` → `html[data-magi-app]` scope rename (per ADR-0002)
- axe-playwright + visual regression (per ADR-0007)
- React 19 peer range support (per ADR-0006)
- FormField child contract / state token vocab / cascade policy (P2.1/P2.2/P2.3)

See [`docs/architecture-v2.md`](./docs/architecture-v2.md), [`docs/architecture-review-v2.md`](./docs/architecture-review-v2.md), and [`docs/architecture-review-0.3.md`](./docs/architecture-review-0.3.md) for the architecture roadmap.

## Repo layout

```
magi-design-system/
├── packages/
│   └── design-system/        # @tokyo3rdhq/magi-design-system — published to npm
├── apps/
│   └── showroom/             # @tokyo3rdhq/showroom — local visual showcase
├── docs/
│   ├── magi_design_system.md        # original design spec (also lives in magi-portal)
│   ├── architecture.md              # OLD (0.1.0 era) — superseded by architecture-v2.md
│   ├── architecture-v2.md           # target architecture proposal
│   ├── architecture-review-v2.md    # challenge of the v2 proposal
│   ├── architecture-v0.3-post-review.md  # original review brief
│   ├── architecture-review-0.3.md   # post-0.3.0 implementation review (found 8 issues)
│   ├── arch_evo.md                  # original refactor brief
│   ├── tokens.md                    # every CSS custom property (current 0.4.x)
│   ├── usage-guide.md               # patterns and recipes for common scenarios
│   ├── migration-guide.md           # Phase 2 / 3 / 5 / 6 consumer migrations
│   ├── integration-prompt.md        # AI agent prompt for new xxx.magi.website consumers
│   └── adr/                         # Architecture Decision Records (0001–0008)
│       ├── 0001-token-architecture.md
│       ├── 0002-css-scope.md
│       ├── 0003-theme-architecture.md
│       ├── 0004-package-boundary.md
│       ├── 0005-css-bundling.md
│       ├── 0006-react-peer-range.md
│       ├── 0007-accessibility.md
│       └── 0008-visual-regression.md
├── scripts/
│   ├── check-tokens.mjs            # CI token literal enforcement (MUST NOT / SHOULD)
│   └── check-accent-tokens.mjs     # CI accent source-of-truth cross-check
├── LICENSE
└── README.md
```

## Quick start

Install the package in any React app:

```bash
npm install @tokyo3rdhq/magi-design-system
```

```tsx
// app entry — load styles once
import '@tokyo3rdhq/magi-design-system/styles.css';

import {
  Container, Section, Stack,
  Button, Card, Badge,
  Checkbox, FormField, Input, Segmented, Banner, EmptyState,
  AppTheme,
} from '@tokyo3rdhq/magi-design-system';

function App() {
  return (
    // <AppTheme> sets accent CSS variables on <html> via useInsertionEffect.
    // No DOM wrapper. accent is restored on unmount (0.3.1+).
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

**For subtree accent overrides** (e.g. a "danger" callout), use the `data-magi-accent` attribute — no React wrapper needed:

```tsx
<div data-magi-accent="danger">
  <Button variant="primary">Delete</Button>
</div>
```

See [`docs/usage-guide.md`](./docs/usage-guide.md) for full patterns.

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

| Doc | Purpose |
| --- | --- |
| [`packages/design-system/README.md`](./packages/design-system/README.md) | Full API reference for all 13 primitives |
| [`docs/usage-guide.md`](./docs/usage-guide.md) | **Patterns and recipes**: forms, lists, navigation chrome, theming, accessibility, testing |
| [`docs/tokens.md`](./docs/tokens.md) | Every CSS custom property with values |
| [`docs/migration-guide.md`](./docs/migration-guide.md) | Phase 2 / 3 / 5 / 6 consumer migrations |
| [`docs/integration-prompt.md`](./docs/integration-prompt.md) | AI agent prompt for new `xxx.magi.website` consumers |
| [`docs/architecture-v2.md`](./docs/architecture-v2.md) | Target architecture proposal |
| [`docs/architecture-review-v2.md`](./docs/architecture-review-v2.md) | Challenge of v2 (proposed target architecture) |
| [`docs/architecture-review-0.3.md`](./docs/architecture-review-0.3.md) | Post-0.3.0 implementation review (found the bugs fixed in 0.3.1 / 0.4.0 / 0.4.1) |
| [`docs/adr/`](./docs/adr/) | 8 Architecture Decision Records |
| [`docs/magi_design_system.md`](./docs/magi_design_system.md) | Original design spec (also in magi-portal repo) |
| [`docs/architecture.md`](./docs/architecture.md) | Old (0.1.0) — superseded by v2 docs |
| [`docs/arch_evo.md`](./docs/arch_evo.md) | Original refactor brief |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release history (0.1.0 → 0.4.2) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Workflow + architectural rules for contributors |
| [`SECURITY.md`](./SECURITY.md) | Vulnerability disclosure |

## License

[MIT](./LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)