# ADR-003: Theme architecture — context provider + `<html>`-level CSS var setter (Light/Dark mode added in 0.6.0)

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.3.0+ |

## Context

We need to decide how `<AppTheme accent="...">` exposes per-product accent overrides. Two patterns:

- **DOM wrapper** (0.1.0 / 0.2.0): `<AppTheme>` returns `<div data-magi-product="..." style={accentVars}>`. The wrapper carries the CSS variables; children inherit.
- **Context + `<html>`-level setter** (0.3.0): `<AppTheme>` is a React context provider. On mount, sets the four accent CSS variables on `<html>` via `useEffect`.

The DOM wrapper approach broke:
- `display: grid` parents that expect direct grid-item children
- `display: flex` parents with `gap` that now has an extra node to layout
- `:first-child` / `:only-child` / `:nth-child(1)` selectors
- Portals (the wrapper changes layout tree depth)

## Decision

**`<AppTheme>` becomes a context provider + `<html>`-level CSS var setter. No DOM wrapper.**

### Behavior

```tsx
// before (0.2.0):
<AppTheme accent="cyan">
  <App />  // wrapped in <div data-magi-product="...">
</AppTheme>

// after (0.3.0):
<AppTheme accent="cyan">
  <App />  // renders as direct children, no extra DOM
</AppTheme>

// what happens internally:
// 1. React Context provides { accent: 'cyan' }
// 2. useEffect sets on <html>:
//    --magi-accent: #38bdf8
//    --magi-accent-hover: #7dd3fc
//    --magi-accent-soft: rgba(56, 189, 248, 0.08)
//    --magi-accent-contrast: #050505
// 3. data-magi-product="cyan" set on <html>
// 4. All descendants inherit via CSS cascade
```

### Scoped overrides via `data-magi-accent`

Consumers can scope accent overrides to subtrees without writing raw CSS:

```tsx
<div data-magi-accent="danger">
  <Button variant="primary">Delete</Button>
</div>
```

The `data-magi-accent` attribute maps to the matching accent preset (green / cyan / violet / amber / white) or semantic color (danger / warning / success) via CSS in `foundation/globals.css`. This is opt-in and additive.

### API removed in 0.3.0

- `tokens?: Partial<CSSProperties>` — removed. Consumers can't redefine arbitrary `--magi-*` variables through this prop. If a consumer genuinely needs a new accent, they should open an issue or extend `ACCENT_PRESETS` directly.

### Hooks added

- `useAppTheme()` — returns `{ accent: AppAccent }`. Default `{ accent: 'green' }` when used outside `<AppTheme>`.

### 0.6.0 — Light/Dark color mode added

**`<AppTheme>` gained a `theme` prop**: `'dark' | 'light'`. Default `'dark'` (canonical MAGI presentation).

```tsx
<AppTheme accent="cyan" theme="light">
  <App />
</AppTheme>
```

What happens internally on mount:
1. React Context provides `{ accent: 'cyan', theme: 'light' }` to children.
2. `useInsertionEffect` writes:
   - The four accent CSS variables on `<html>` (unchanged behavior)
   - `data-magi-theme="light"` on `<html>` (new)
3. All descendants inherit via CSS cascade.

The color mode token rules live in `tokens/colors.css`:
- `:root, [data-magi-theme="dark"]` — canonical Dark values (Dark is the SSR-safe default; `data-magi-theme="dark"` is explicit)
- `[data-magi-theme="light"]` — alternative Light values

Color mode swaps these tokens:
- `--magi-bg-base` (background)
- `--magi-bg-raised` / `--magi-surface` (surfaces)
- `--magi-text-primary` / `--magi-text-secondary` / `--magi-text-tertiary` (text)
- `--magi-border` / `--magi-border-strong`
- `--magi-scrollbar-thumb`
- `--magi-logo-color` (NEW token — bound to `--magi-text-primary` in both modes; the Logo Contrast Rule is enforced by `brand.css`)

Color mode does NOT swap:
- `--magi-accent` and family — accent is product-defined, not theme-defined. Accent and theme are orthogonal axes.

`useAppTheme()` now returns `{ accent, theme }`. Default `{ accent: 'green', theme: 'dark' }`.

### 0.6.0 — Logo Contrast Rule enforced by `brand.css`

The brand component wrapper (`.magi-mark`, `.magi-wordmark`, `.magi-lockup`) now sets `color: var(--magi-logo-color)` so the logo automatically picks the right foreground color in each theme. Previously, the logo relied on the consumer setting `color` correctly; a consumer who forgot got a black logo on a black background (the bug that motivated this refactor).

The Logo Contrast Rule is now enforced by the system, not by the consumer. See `docs/brand.md` and `docs/component-contracts.md#magimark`.

## Alternatives considered

### `<MagiProvider>` + `<MagiThemeScope>` two-API pattern

- **Pro**: clean separation of app-level config vs subtree-level scope.
- **Con**: more API surface, more components to maintain. We don't need both — `<AppTheme>` at app level + manual `<div data-magi-accent="...">` at scope level covers the same need with less surface.

### Setting accent via inline `<style>` element

- **Pro**: no FOUC concern (style is in the DOM before paint).
- **Con**: more complex to maintain (inject style tag, manage insertion order, cleanup). `useEffect` is sufficient — the first frame shows default accent, then the accent updates. Acceptable since consumers usually pick one accent for the whole app.

### Custom element (`<magi-theme accent="cyan">`)

- **Pro**: declarative, framework-agnostic.
- **Con**: Web Components is overkill for this use case. The React context approach is simpler and the only consumer right now is tfi (which is React).

## Consequences

- **Breaking change**: any consumer using the DOM wrapper's CSS layout (e.g., for `gap` on grid) needs to verify layout still works.
- **magi-portal**: doesn't use `<AppTheme>`. No change.
- **tfi**: planned to use `<AppTheme accent="cyan">`. Migration: just remove any direct DOM assumptions and verify accent still flows. The `<div data-magi-product>` they were getting for free is now on `<html>`.
- **Focus rings**: `--magi-focus-ring` reads `--magi-accent` (set on `<html>`). Theme switching now affects focus rings automatically. Bonus.
- **Performance**: `useEffect` runs once per accent change. Negligible cost.

## References

- [Spec §10 — Product Theme System](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)
- [Architecture review §6, §7](architecture-review-v2.md) — Theme context verdict