# MAGI Design System

Shared visual foundation for the [MAGI](https://magi.website) product family — dark-first, near-monochrome, restrained.

> **Visual consistency without forcing product-level sameness.**

This monorepo contains the package that every MAGI website consumes:

- [`@tokyo3rdhq/magi-design-system`](./packages/design-system) — the npm package: tokens, layout primitives, UI components, brand foundation, and a product theme mechanism. **Latest: 0.6.0**
- [`@tokyo3rdhq/showroom`](./apps/showroom) — the Vite + React + TypeScript visual showcase used during development

## What is MAGI?

[MAGI](https://magi.website) is an independent AI lab operating a family of products (`magi.website`, `api.magi.website`, `chat.magi.website`, `agent.magi.website`). Every product inherits the same visual language — typography, spacing, surfaces, motion, accessibility rules, brand — but each can override its accent color through `<AppTheme accent="…" />` or subtree-level `<div data-magi-accent="…">`.

## Status

**0.6.0 published.** 13 UI primitives (Container / Section / Stack / Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState / AppTheme) + 3 brand primitives (`<MagiMark>` / `<MagiWordmark>` / `<MagiLockup>`) + 5 canonical brand SVG assets + Component Contracts document + framework-agnostic architecture review + Experience Guidelines document + Light/Dark color mode support + Logo Contrast Rule enforced. CSS `@layer` cascade + token literal CI + accent source-of-truth CI + 8 ADRs.

Release history (chronological):

- [x] `0.1.0` — tokens + foundation + layout (Container/Section/Stack) + Button / Card / Badge + AppTheme
- [x] `0.2.0` — Checkbox / FormField / Input / Segmented / Banner / EmptyState (extracted from `token-factory-initializr`)
- [x] `0.3.0` — `@layer` cascade + `<AppTheme>` context (no DOM wrapper) + `<FormField>` aria wiring + `data-magi-accent` subtree accent + token literal CI + 8 ADRs
- [x] `0.3.1` — `<AppTheme>` useEffect cleanup (snapshot/restore) + switch to `useInsertionEffect` (no FOUC) + `<FormField>` aria-describedby / aria-labelledby merge (preserve consumer ARIA refs)
- [x] `0.4.0` — rename `<ProductTheme>` → `<AppTheme>` (the original name misleadingly claimed subtree scope; the implementation sets CSS vars on `<html>`, which is global)
- [x] `0.4.1` — token literal CI extended to `.tsx` / `.ts` files + new accent source-of-truth CI script (cross-validates `ACCENT_PRESETS` in `theme.tsx` against `data-magi-accent` rules in `globals.css`)
- [x] `0.4.2` — `<Segmented>` keyboard navigation (Arrow / Home / End + roving tabindex) per WAI-ARIA radio group pattern
- [x] `0.5.0` — **MAGI Brand Foundation** + showroom Brand page. 5 SVG assets (`magi-mark.svg` / `magi-wordmark.svg` / `magi-lockup.svg` / `favicon.svg` / `app-icon.svg`) shipped under `src/assets/`. 3 React rendering components (`<MagiMark>` / `<MagiWordmark>` / `<MagiLockup>`) inline the SVG source so `fill="currentColor"` propagates correctly across browsers. `<MagiMark>` uses Vite `?url` + `<use href>`; `<MagiWordmark>` / `<MagiLockup>` use `?raw` + `dangerouslySetInnerHTML` (needed for the embedded `<text>` glyph with the page font). Brand doc at [`docs/brand.md`](./docs/brand.md).
- [x] `0.5.1` — boundary cleanup + Component Contracts. `ACCENT_PRESETS` moved from `src/theme.tsx` to `src/tokens/accent-presets.ts` (a framework-agnostic TS module; Vue/JS consumers can import without React). README headline rewritten to distinguish the Design System from the React implementation per review §22. New [`docs/component-contracts.md`](./docs/component-contracts.md) — per-component contracts (semantic structure / accessibility / visual states / token binding). New [`docs/architecture-review-framework-agnostic.md`](./docs/architecture-review-framework-agnostic.md) — 30-section framework-agnostic architecture review establishing the 7 conceptual layers (Brand Foundation / Design Tokens / CSS Foundation / Experience Guidelines / Component Contracts / Web-CSS Implementation / Framework Implementations) and the boundary map.
- [x] `0.6.0` — **Light/Dark color mode + scope rename + Logo Contrast Rule**. `<AppTheme>` gained `theme?: 'dark' | 'light'` (default `'dark'` canonical; `'light'` is supported alternative). `data-magi-theme="light"` attribute supported on any subtree. `data-magi-app` canonical on `<html>` (was `<body>`) — `body[data-magi-app]` still works for backward compatibility (per ADR-0002 deferred rename executed). New `--magi-logo-color` semantic token bound to `--magi-text-primary` in both themes. Brand CSS now sets `color: var(--magi-logo-color)` on `.magi-mark` / `.magi-wordmark` / `.magi-lockup` so the Logo Contrast Rule is enforced by the system, not the consumer. [`docs/brand.md`](./docs/brand.md) rewritten with Color Modes + Logo Contrast Rule sections. All 13 component CSS rules rewritten to use the `[data-magi-app]` selector (element-agnostic). See [Phase 8 migration guide](./docs/migration-guide.md#phase-8--upgrade-from-05x-to-060x-lightdark-theme--scope-rename).

Consumer adoption (separate from package versioning):

- [x] `magidesign-system` repo showroom consumes `@tokyo3rdhq/magi-design-system` itself (file: link)
- [x] `magi-portal` migrated to `@tokyo3rdhq/magi-design-system@0.6.0` — brand assets adopted (favicon + og + nav lockup); Experience Guidelines applied (header utility area + footer restructure); permanent Discord invite wired. See magi-portal repo commits `682fd06` (0.5.x brand) → `1a081be` (0.6.0 + Experience Guidelines) → `6f72cd0` → `ac79cd8` → `83272be` (permanent Discord invite).
- [ ] `token-factory-initializr/web` migration in progress

Deferred to **post-0.6.x**:

- axe-playwright + visual regression (per ADR-0007 + ADR-0008)
- React 19 peer range support (per ADR-0006)
- Vue framework implementation (deferred until a Vue consumer exists)
- Light theme for individual component CSS classes (component-level Light variants) — current subtree theme swap is sufficient
- New primitives beyond the current 13 + 3 brand primitives

See [`docs/architecture-v2.md`](./docs/architecture-v2.md), [`docs/architecture-review-v2.md`](./docs/architecture-review-v2.md), [`docs/architecture-review-0.3.md`](./docs/architecture-review-0.3.md), and [`docs/architecture-review-framework-agnostic.md`](./docs/architecture-review-framework-agnostic.md) for the architecture roadmap.

## Repo layout

```
magi-design-system/
├── packages/
│   └── design-system/        # @tokyo3rdhq/magi-design-system — published to npm
├── apps/
│   └── showroom/             # @tokyo3rdhq/showroom — local visual showcase
├── docs/
│   ├── magi_design_system.md                       # original design spec (also lives in magi-portal)
│   ├── architecture.md                             # OLD (0.1.0 era) — superseded by architecture-v2.md
│   ├── architecture-v2.md                          # target architecture proposal
│   ├── architecture-review-v2.md                   # challenge of the v2 proposal
│   ├── architecture-v0.3-post-review.md            # original review brief
│   ├── architecture-review-0.3.md                  # post-0.3.0 implementation review (found 8 issues)
│   ├── architecture-review-framework-agnostic.md   # post-0.5.0 framework-agnostic review (30 sections, 6 layers)
│   ├── brand.md                                    # Brand Foundation guidelines (since 0.5.0)
│   ├── brand-foundation-architecture-review.md     # Brand Foundation pre-implementation review
│   ├── brand_fundation_review_and_impl.md          # Brand Foundation review + impl prompt (legacy)
│   ├── component-contracts.md                      # Component Contracts (since 0.5.1)
│   ├── guidelines.md                               # Experience Guidelines (since 0.6.0)
│   ├── framework_agnostic_architecture_review.md   # the review brief this repo's review responds to
│   ├── arch_evo.md                                 # original refactor brief
│   ├── tokens.md                                   # every CSS custom property (current 0.5.x)
│   ├── usage-guide.md                              # patterns and recipes for common scenarios
│   ├── migration-guide.md                          # Phase 2 / 3 / 5 / 6 / 7 consumer migrations
│   ├── integration-prompt.md                       # AI agent prompt for new xxx.magi.website consumers
│   └── adr/                                        # Architecture Decision Records (0001–0008)
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
│   └── check-accent-tokens.mjs     # CI accent source-of-truth cross-check (now reads tokens/accent-presets.ts)
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
  MagiMark, MagiWordmark, MagiLockup,
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

`<html>` must carry `data-magi-app` so the foundation styles can scope themselves (0.6.0 canonical; `<body data-magi-app>` still works for backward compatibility — the `[data-magi-app]` CSS selector matches any element with the attribute):

```html
<html data-magi-app>
  <body>
    <div id="root"></div>
  </body>
</html>
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
| [`packages/design-system/README.md`](./packages/design-system/README.md) | Full API reference for the package — design-system layer + React implementation |
| [`docs/usage-guide.md`](./docs/usage-guide.md) | **Patterns and recipes**: forms, lists, navigation chrome, theming, accessibility, brand, testing |
| [`docs/tokens.md`](./docs/tokens.md) | Every CSS custom property with values |
| [`docs/brand.md`](./docs/brand.md) | **MAGI Brand Foundation** — hierarchy, clear space, minimum sizes, backgrounds, product relationship, misuse prohibitions, Color Modes, Logo Contrast Rule |
| [`docs/component-contracts.md`](./docs/component-contracts.md) | **Component Contracts** (Layer 4) — per-component semantic structure / accessibility / visual states / token binding. NOT CSS class names. |
| [`docs/guidelines.md`](./docs/guidelines.md) | **Experience Guidelines** (Layer 3.5) — content, i18n (language names not flags), iconography decision matrix, links, nav, header/footer patterns, responsive, a11y floor, product-vs-system boundary |
| [`docs/migration-guide.md`](./docs/migration-guide.md) | Phase 2 / 3 / 5 / 6 / 7 / 8 consumer migrations (incl. brand at 0.5.0+, Light/Dark + scope rename at 0.6.0) |
| [`docs/integration-prompt.md`](./docs/integration-prompt.md) | AI agent prompt for new `xxx.magi.website` consumers |
| [`docs/architecture-v2.md`](./docs/architecture-v2.md) | Target architecture proposal (0.2.0 era — largely implemented) |
| [`docs/architecture-review-v2.md`](./docs/architecture-review-v2.md) | Challenge of v2 (proposed target architecture) |
| [`docs/architecture-review-0.3.md`](./docs/architecture-review-0.3.md) | Post-0.3.0 implementation review (found the bugs fixed in 0.3.1 / 0.4.0 / 0.4.1) |
| [`docs/architecture-review-framework-agnostic.md`](./docs/architecture-review-framework-agnostic.md) | **0.5.0 framework-agnostic review** — 30 sections, 6 conceptual layers, framework coupling matrix, dependency graph, refactoring plan |
| [`docs/brand-foundation-architecture-review.md`](./docs/brand-foundation-architecture-review.md) | Pre-implementation review of the Brand Foundation |
| [`docs/framework_agnostic_architecture_review.md`](./docs/framework_agnostic_architecture_review.md) | The original review brief that this repo's framework-agnostic review responds to |
| [`docs/adr/`](./docs/adr/) | 8 Architecture Decision Records |
| [`docs/magi_design_system.md`](./docs/magi_design_system.md) | Original design spec (also in magi-portal repo) |
| [`docs/architecture.md`](./docs/architecture.md) | Old (0.1.0) — superseded by v2 docs |
| [`docs/arch_evo.md`](./docs/arch_evo.md) | Original refactor brief |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release history (0.1.0 → 0.6.0) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Workflow + architectural rules for contributors |
| [`SECURITY.md`](./SECURITY.md) | Vulnerability disclosure |

## License

[MIT](./LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)