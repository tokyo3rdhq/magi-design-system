# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] — 2026-09-27

### Added

- **`<Segmented>` keyboard navigation** — full WAI-ARIA radio group
  pattern (per Authoring Practices Guide):
  - `ArrowRight` / `ArrowDown`: select + focus next enabled option (wraps)
  - `ArrowLeft` / `ArrowUp`: select + focus previous enabled option (wraps)
  - `Home`: select + focus first enabled option
  - `End`: select + focus last enabled option
  - Disabled options are skipped during navigation
- **`<Segmented>` roving tabindex** — only the currently-selected option
  has `tabIndex={0}`. Other options have `tabIndex={-1}` and are reachable
  only via the arrow / Home / End keys above. Pressing Tab moves into
  the selected option; subsequent Tabs leave the group. Pressing arrow
  keys navigates within the group.

  Per architecture-review-0.3.md §P2 — was the last P2 item. Closes the
  WAI-ARIA conformance gap flagged in the review.

## [0.4.1] — 2026-09-27

### Added

- **`scripts/check-accent-tokens.mjs`** — CI check that cross-validates
  `ACCENT_PRESETS` in `theme.tsx` against the `data-magi-accent="<name>"`
  rules in `foundation/globals.css`. If a contributor adds or changes an
  accent preset in one file but forgets the other, the check fails
  with the exact hex mismatch.

### Changed

- **`scripts/check-tokens.mjs`** now also scans `.tsx` and `.ts` files
  for hex / rgb / rgba literals (was `.css` only). Catches the case
  where a contributor adds `style={{ color: '#fff' }}` inline instead
  of using a token. `theme.tsx` (the accent preset source of truth)
  and `foundation/globals.css` (the accent preset CSS rules) are
  allowlisted — their hex values are legitimate.

### Fixed

- **Bug in the version 0.4.0 release**: `scripts/check-accent-tokens.mjs`
  was wired to the CI workflow but had a bug that made it always pass —
  the comparison loop iterated over `['--magi-accent', ...]` while the
  parsed entries stored keys without the `--` prefix. The script now
  compares `magi-accent` / `magi-accent-hover` directly. Verified by
  injecting a deliberate mismatch (`#7dd3fc` → `#7dd3ff`) — script now
  fails as expected.

## [0.4.0] — 2026-09-27

### Changed (breaking)

- **`<ProductTheme>` → `<AppTheme>` rename.** The component name claimed
  "subtree scope" but the implementation sets accent CSS variables on
  `<html>` (global). The new name reflects the actual behavior:
  application-level accent configuration. CSS subtree scope is the job of
  `<div data-magi-accent="...">`, not this component.

  Migration:
  - `<ProductTheme>` → `<AppTheme>` (component name)
  - `useProductTheme()` → `useAppTheme()` (hook name)
  - `ProductThemeProps` → `AppThemeProps` (props type)
  - `ProductThemeContext` / `ProductThemeContextValue` → `AppThemeContext` / `AppThemeContextValue` (internal types, not exported)
  - `ProductAccent` → `AppAccent` (the accent type)

  No behavioral change. Same accent presets, same `accent` / `name`
  props, same Context behavior, same CSS variable targets.

### Removed

- **`<ProductTheme>` is no longer exported.** TypeScript consumers will
  get a clear "is not exported" error. The JSDoc on `<AppTheme>` calls
  out the rename explicitly.

## [0.3.1] — 2026-09-27

### Fixed

- **`<AppTheme>` useEffect had no cleanup** — accent CSS variables
  set on `<html>` were never restored on unmount or accent change.
  This caused accent leaks: a nested `<AppTheme>` unmounting left
  its parent's accent set, and a route transition from a themed page
  to an unthemed one kept the previous theme. **Now snapshots the
  previous values on mount and restores them on cleanup.** Nested
  themes work correctly: outer mounts (snapshots default), inner mounts
  (snapshots outer, sets its own), inner unmounts (restores outer),
  outer unmounts (restores default).

- **`<AppTheme>` used `useEffect`** — ran **after** first paint,
  causing a 1-frame flash of the default accent on every accent
  transition. **Switched to `useInsertionEffect`** — runs synchronously
  after DOM mutations, before paint. The accent is applied to the first
  paint, not the second. (Note: for SSR pages, the initial paint is
  still default until hydration. Consumers wanting zero FOUC on SSR
  should set `data-magi-accent="<name>"` on `<html>` in their
  server-side layout — the CSS rule in `foundation/globals.css` picks
  it up before paint.)

- **`<FormField>` `cloneElement` overwrote consumer's
  `aria-describedby` and `aria-labelledby`.** If a consumer passed
  `aria-describedby="external-help"` to the child control, FormField
  silently replaced it with its own helper ID — the external help text
  became unreachable for screen readers. **Now merges IDs space-separated**
  per WAI-ARIA spec. Consumer-supplied IDs come first; FormField's
  helper/error IDs are appended. Consumer's `aria-invalid` is preserved
  unless FormField has an `error` (in which case `aria-invalid="true"`
  wins).

[0.3.1]: https://github.com/tokyo3rdhq/magi-design-system/releases/tag/v0.3.1

## [0.3.0] — 2026-09-27

### Added

- **CSS `@layer` cascade model.** `styles/index.css` declares layer order:
  `@layer magi.reset, magi.tokens, magi.foundation, magi.layout, magi.components;`.
  Each CSS file wraps its content in the appropriate layer. Consumer unlayered
  styles always win on the cascade, regardless of import order — declared
  architecture replaces accidental source-order. See `docs/adr/0005-css-bundling.md`.

- **`data-magi-accent="<name>"` subtree accent override.** Maps to:
  - Accent presets: `green` / `cyan` / `violet` / `amber` / `white`
  - Semantic: `danger` / `warning` / `success`

  Opt-in, additive. Allows scoped accent changes without writing raw CSS:

  ```tsx
  <div data-magi-accent="danger">
    <Button variant="primary">Delete</Button>
  </div>
  ```

- **`useAppTheme()` hook.** Returns `{ accent: AppAccent }` for JS-aware
  consumers. Default `{ accent: 'green' }` outside `<AppTheme>`.

- **`scripts/check-tokens.mjs`.** CI token literal enforcement. Fails the build
  on `hex` / `rgb()` / `rgba()` literals in component CSS. Warns on hardcoded
  `px` font sizes and `ms` durations outside `tokens/`.

- **CI updates.** Token literal check runs in the `package` job before
  typecheck. Showroom gets an explicit `tsc --noEmit` job.

- **8 ADRs in `docs/adr/`.** Architecture decisions recorded:
  - 0001 — token architecture (flat, implicit hierarchy)
  - 0002 — CSS scope (`body[data-magi-app]` now, `html[data-magi-app]` at 0.5.0)
  - 0003 — theme architecture (context + `<html>`-level CSS var setter)
  - 0004 — package boundary (single package; extraction criteria documented)
  - 0005 — CSS bundling (single `dist/styles.css`)
  - 0006 — React peer range (18 for 0.x; expand as minor when 19 needed)
  - 0007 — accessibility (axe / Playwright deferred to 0.4.0)
  - 0008 — visual regression (Playwright screenshots deferred to 0.4.0)

- **Documentation.**
  - `docs/architecture-v2.md` — target architecture proposal.
  - `docs/architecture-review-v2.md` — Architecture challenge of the v2 proposal.
  - `docs/arch_evo.md` — original brief.
  - `docs/integration-prompt.md` — updated to reference `tokyo3rdhq/magi-design-system`.

### Changed (breaking)

- **`<AppTheme>` no longer wraps in a `<div>`.** Now a React context
  provider + `useEffect` that sets the four accent CSS variables
  (`--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`,
  `--magi-accent-contrast`) on `document.documentElement`. The wrapper
  `<div data-magi-product>` is gone.

  **Why**: the wrapper broke `display: grid` parents (extra node),
  `:first-child` / `:nth-child(1)` selectors, and absolute-positioned children.
  See `docs/adr/0003-theme-architecture.md`.

  **Migration**: consumers that depended on the wrapper div for layout must
  verify their layout. `data-magi-product="<name>"` is now on `<html>`, not on
  the wrapper div.

- **`<FormField>` aria wiring is now real.** 0.2.0 generated IDs but never
  attached them. 0.3.0 uses `Children.only + cloneElement` to inject
  `aria-describedby` / `aria-labelledby` / `aria-invalid` on the child control.

  **Behavior**: `aria-describedby` matches the helper/error span's `id`;
  `aria-invalid="true"` is set on the child when `error` is present.
  The label's `<label>` element gets the matching `id` so screen readers
  announce the label on focus.

### Removed (breaking)

- **`tokens?: Partial<CSSProperties>` prop on `<AppTheme>`.** Closed the
  public API leak that let consumers redefine arbitrary `--magi-*` variables.
  For subtree accent overrides, use `<div data-magi-accent="<name>">` instead.

### Token cleanup (alongside the breaking changes)

All `rgba()` literals in component CSS replaced with
`color-mix(in srgb, var(--magi-*) N%, transparent)`. All `font-size: Npx`
replaced with `var(--magi-font-size-*)` tokens. The `body[data-magi-app]`
gradient and scrollbar now reference tokens via `color-mix`.

| File | Change |
|---|---|
| `Badge/Badge.css` | neutral/success/warning/error → `color-mix()` |
| `Button/Button.css` | secondary/ghost hover → `color-mix()` |
| `Input/Input.css` | size variants → `--magi-font-size-*` |
| `Segmented/Segmented.css` | item + size variants → `--magi-font-size-*` |
| `Banner/Banner.css` | `font-size: 13px` → `--magi-font-size-label` |
| `EmptyState/EmptyState.css` | `font-size: 14px` → `--magi-font-size-body-sm` |
| `foundation/globals.css` | body bg gradient + scrollbar → `color-mix()` |

### Verified

- `npm run build` → `dist/styles.css` 24.17 kB / `dist/index.js` 8.52 kB (gzip 4.34 / 2.53)
- `npm run typecheck` → clean
- `node scripts/check-tokens.mjs` → 0 errors, 0 warnings
- Manual preview at `127.0.0.1:4174` → Phase 4 page renders; accent switching flows correctly to descendants
- `<FormField>` aria wiring verified via browser probe: `aria-describedby` matches helper span ID; `aria-invalid` set on error fields

### Deferred to 0.4.0

Per `docs/adr/0007-accessibility.md`:

- Playwright a11y (`@axe-core/playwright`) — semantic ARIA verification on the showroom
- Playwright focus + reduced-motion verification
- Playwright visual regression (~70 baseline snapshots via `toMatchSnapshot`)

These need significant new infrastructure (~150 MB chromium binary, baseline
commits, CI job). 0.3.0 is **architecture** changes; 0.4.0 will be
**testing infrastructure** changes.

[0.3.0]: https://github.com/tokyo3rdhq/magi-design-system/releases/tag/v0.3.0

## [0.2.0] — 2026-09-26

### Added

Six new primitives extracted from `token-factory-initializr`'s production usage:

- `<Checkbox>` — restyled native checkbox with focus ring + dot label support
- `<Input>` — `<input>` wrapper with `sm` / `md` / `lg` sizes + `invalid` state
- `<FormField>` — label + control + optional `helper` / `error`
- `<Segmented>` — single-select chip group (**single-select only**; multi-select via `<Checkbox>` group)
- `<Banner>` — inline notice with 4 variants: `warning` / `error` / `success` / `info`
- `<EmptyState>` — centered placeholder, simple or structured (`title` + `description` + `action`)

Showroom: new **Phase 4** page demonstrating all 6 primitives with live state.

### Changed

- `<Input>` props: `size` → `inputSize` (avoid collision with native `<input size>` HTML attribute).
- `<Segmented>` JSDoc explicitly forbids `multi` prop — multi-select must use a `<Checkbox>` group.

### Notes

- Per spec §33, primitives extracted only after a real consumer
  (`token-factory-initializr`) shipped hand-rolled implementations. Not
  speculative.
- Out of scope: Spinner, Select, CodeBlock (no consumer in tfi).
- Out of scope: Navbar, Footer, ProductHeader (deferred per spec §18 / §19).
- Verified: `npm run build` → 22.13 kB styles / 7.68 kB JS.

[0.2.0]: https://github.com/tokyo3rdhq/magi-design-system/releases/tag/v0.2.0

## [0.1.0] — 2026-09-26

### Added

- **`@tokyo3rdhq/magi-design-system` package** — first published release
- **Tokens** (`src/tokens/`)
  - `colors.css` — background, surface, text, border, accent, semantic tokens on `:root`
  - `typography.css` — Inter + mono stack, semantic scale (`display`, `h1`–`h4`, `body`, `label`, `caption`, `eyebrow`, `code`), tracking, leading
  - `spacing.css` — `--magi-space-0` … `--magi-space-40` coherent scale
  - `radius.css` — `sm` / `md` / `lg` / `xl` / `2xl` / `full`
  - `motion.css` — `duration-fast` / `normal` / `slow`, `ease-standard` / `emphasized` / `out`
  - `breakpoints.css` — `sm` / `md` / `lg` / `xl` / `2xl`
  - `misc.css` — z-index, container widths, shadows, `--magi-focus-ring`
- **Foundation** (`src/foundation/`)
  - `reset.css` — box-sizing, button/input/link normalization
  - `globals.css` — dark gradient backdrop, font baseline, scrollbar, focus-visible, reduced-motion — all scoped to `body[data-magi-app]`
  - `typography.css` — `.magi-display` / `.magi-h1`–`.magi-h4` / `.magi-body-lg` / `.magi-body` / `.magi-body-sm` / `.magi-label` / `.magi-caption` / `.magi-eyebrow` / `.magi-code` utility classes
- **Layout primitives** (`src/layout/`)
  - `<Container size="sm | md | lg | xl | wide | full" />` — centers content, constrains max-width
  - `<Section spacing="sm | md | lg | xl" surface="default | raised | elevated" fullWidth />`
  - `<Stack direction="row | column" gap="…" align="start | center | end | stretch" />`
- **UI primitives** (`src/components/`)
  - `<Button variant="primary | secondary | ghost | danger" size="sm | md | lg" loading />`
  - `<Card variant="default | elevated | interactive" padding="none | sm | md | lg" />`
  - `<Badge variant="neutral | accent | success | warning | error" dot />`
- **Product theme** (`src/theme.tsx`)
  - `<AppTheme accent="green | cyan | violet | amber | white" name="…" tokens={{…}}>` — overrides the MAGI accent for a subtree
- **Build**
  - Vite library mode emits `dist/index.js` (ESM) + `dist/styles.css` (tokens + foundation + all components)
  - `tsc -p tsconfig.build.json` emits `.d.ts` declarations
  - `package.json` `exports` map: `"."` (JS + types) and `"./styles.css"`
- **Showroom (`apps/showroom`)** — Vite + React + TS demo app with 6 pages (Tokens, Typography, Buttons, Cards, Badges, Layout) and a live accent picker

### Notes

- Spec source: [`docs/magi_design_system.md`](./docs/magi_design_system.md). Follows §30 Phase 1 only.
- Out of scope for 0.1.0: Navbar, Footer, Tabs, Input, CodeBlock, ProductHeader (Phase 4).
- Out of scope for 0.1.0: Phase 2 (magi-portal migration) and Phase 3 (token-factory-initializr migration).

[0.1.0]: https://github.com/tokyo3rdhq/magi-design-system/releases/tag/v0.1.0