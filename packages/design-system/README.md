# `@tokyo3rdhq/magi-design-system`

The shared visual foundation for the [MAGI](https://magi.website) product ecosystem. Built around brand assets, design tokens, CSS foundations, component visual contracts, and accessibility principles.

The package currently ships the **React implementation** of the MAGI Design System. The underlying design language (tokens, CSS, brand) is **framework-agnostic** and is intended to be consumed by any frontend stack — React today, Vue or HTML tomorrow. See [`docs/architecture-review-framework-agnostic.md`](../../docs/architecture-review-framework-agnostic.md) for the full boundary map.

## What's inside

| Layer | What it is | Framework-agnostic? |
|---|---|---|
| **Brand Foundation** | SVG assets (mark / wordmark / lockup / favicon / app icon) + `docs/brand.md` | ✅ Yes |
| **Design Tokens** | CSS variables for color, typography, spacing, radius, motion, breakpoints | ✅ Yes |
| **CSS Foundation** | Reset, base typography, dark backdrop, scrollbar, focus ring, reduced-motion | ✅ Yes |
| **Component Contracts** | Semantic structure, accessibility, states, token binding per component — see [`docs/component-contracts.md`](../../docs/component-contracts.md) | ✅ Yes (contract) |
| **Web/CSS Implementation** | Per-component `.css` files; CSS selectors, `@layer`, CSS variables | ✅ Yes (Web-specific) |
| **Framework Implementation** | React 18 + TypeScript components, JSX, hooks, Context | React only |

The dependency direction is always: **Brand → Tokens → CSS Foundation → Component Contracts → Web/CSS Implementation → React Implementation → Application**. CSS class names (e.g. `.magi-button--primary`) belong to the **Web/CSS Implementation** layer and may be freely refactored — they are NOT part of the Design System API.

## React compatibility

This package currently provides the React implementation.

- React 18 (peer)
- TypeScript (strict)
- Plain CSS with `magi-` prefixed classes
- CSS `@layer` cascade — consumer unlayered styles always win
- No Tailwind, no Next, no Vite, no Cloudflare coupling
- ~25 kB stylesheet (gzip ~4 kB), ~13 kB JS (gzip ~4 kB)

React 19 is supported as a peer when the consumer requires it (per ADR-0006).

## Install

```bash
npm install @tokyo3rdhq/magi-design-system
```

## Usage

```tsx
// 1. Styles — import once at the application root.
import '@tokyo3rdhq/magi-design-system/styles.css';

// 2. <body> needs data-magi-app so foundation styles can scope themselves.
<body data-magi-app>
  <div id="root"></div>
</body>

// 3. Wrap your app in <AppTheme> to optionally override the accent.
//    0.3.0+: AppTheme is a context provider + sets accent CSS
//    variables on <html>. No DOM wrapper.
import { AppTheme } from '@tokyo3rdhq/magi-design-system';

<AppTheme accent="green" name="magi-portal">
  <App />
</AppTheme>

// 4. Use brand components where you want the canonical MAGI logo.
//    0.5.0+: <MagiMark>, <MagiWordmark>, <MagiLockup>.
import { MagiLockup } from '@tokyo3rdhq/magi-design-system';

<MagiLockup size="md" />   // 32 px tall — default for navbars

// 5. 0.6.0+: opt into Light mode (canonical Dark is the SSR-safe default).
import { AppTheme } from '@tokyo3rdhq/magi-design-system';

<AppTheme accent="green" theme="light">
  <App />
</AppTheme>
```

## API

### Layout primitives

#### `<Container>` — centers and constrains max-width

```tsx
import { Container } from '@tokyo3rdhq/magi-design-system';

<Container size="xl">…</Container>
// size: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full'  (default: 'xl')
// as: 'div' | 'section' | …                            (default: 'div')
```

| Size | Max-width |
| --- | --- |
| `sm` | 640 px |
| `md` | 768 px |
| `lg` | 1024 px |
| `xl` (default) | 1200 px |
| `wide` | 1400 px |
| `full` | 100 % |

#### `<Section>` — page-level vertical rhythm

```tsx
import { Section } from '@tokyo3rdhq/magi-design-system';

<Section spacing="lg" surface="default">…</Section>
// spacing: 'sm' | 'md' | 'lg' | 'xl'              (default: 'lg')
// surface: 'default' | 'raised' | 'elevated'      (default: 'default')
// fullWidth: boolean                              (default: false)
// as: 'section' | 'div' | …
```

`spacing` maps to `--magi-space-12` / `20` / `32` / `40` (xl jumps to `40` on ≥ 768 px viewports).

#### `<Stack>` — flex primitive with semantic gap tokens

```tsx
import { Stack } from '@tokyo3rdhq/magi-design-system';

<Stack direction="column" gap="4" align="stretch">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
// direction: 'column' | 'row'                      (default: 'column')
// gap:        '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16'  (default: '4')
// align:      'start' | 'center' | 'end' | 'stretch'                              (default: 'stretch')
// wrap:       boolean  (default: true)
```

### UI primitives

#### `<Button>` — pill action element

```tsx
import { Button } from '@tokyo3rdhq/magi-design-system';

<Button variant="primary" size="md" loading={false}>Save</Button>
// variant: 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
// size:    'sm' | 'md' | 'lg'                              (default: 'md')
// loading: boolean                                          (default: false)
```

All buttons include hover, active, focus-visible, disabled, and loading states. Focus ring uses `--magi-focus-ring`.

#### `<Card>` — dark surface

```tsx
import { Card } from '@tokyo3rdhq/magi-design-system';

<Card variant="elevated" padding="md">…</Card>
// variant: 'default' | 'elevated' | 'interactive'  (default: 'default')
// padding: 'none' | 'sm' | 'md' | 'lg'             (default: 'md')
```

`interactive` adds hover (border lift + surface darken) and active (1 px lift) states.

#### `<Badge>` — compact status / metadata label

```tsx
import { Badge } from '@tokyo3rdhq/magi-design-system';

<Badge variant="accent" dot>128K context</Badge>
// variant: 'neutral' | 'accent' | 'success' | 'warning' | 'error'  (default: 'neutral')
// dot:     boolean                                                  (default: false)
```

#### `<Checkbox>` — restyled native checkbox

```tsx
import { Checkbox } from '@tokyo3rdhq/magi-design-system';

// Uncontrolled with native input attrs:
<Checkbox aria-label="Accept terms" defaultChecked />

// Controlled with label:
<Checkbox
  checked={providers.includes('nvidia')}
  onChange={(e) => toggle('nvidia', e.target.checked)}
>
  NVIDIA
</Checkbox>
```

Native `<input type="checkbox">` under the hood. `type` prop is locked to `'checkbox'` (not extensible to `'radio'` etc.) via `Omit<InputHTMLAttributes, 'type'>`.

#### `<Input>` — `<input>` wrapper

```tsx
import { Input } from '@tokyo3rdhq/magi-design-system';

<Input placeholder="e.g. Coding assistant" />
<Input type="password" placeholder="••••••••" />
<Input type="search" placeholder="Search models" />
<Input invalid defaultValue="bad value" />
// inputSize: 'sm' | 'md' | 'lg'    (default: 'md')
// invalid:   boolean               (default: false)
```

`inputSize` (not `size`) to avoid collision with the native `<input size>` HTML attribute.

#### `<FormField>` — label + control + helper / error

```tsx
import { FormField, Input } from '@tokyo3rdhq/magi-design-system';

<FormField label="Email" helper="We'll never share this.">
  <Input type="email" placeholder="you@example.com" />
</FormField>

<FormField label="Max models" error="Pick a value between 1 and 10.">
  <Segmented value="3" options={...} onChange={...} />
</FormField>
```

`<FormField>` wires `aria-describedby` to the helper/error span, `aria-labelledby` to
the label, and `aria-invalid="true"` to the child control — automatically via
`Children.only + cloneElement`. Works with any single focusable element
(`Input`, `Select`, native `<input>`, `Segmented`, etc.). For complex
multi-element layouts, no wiring is performed — the label and helper/error
still render.

#### `<Segmented>` — single-select chip group

```tsx
import { Segmented } from '@tokyo3rdhq/magi-design-system';

<Segmented
  value={contextMin}
  options={[
    { value: '128k', label: '128K+' },
    { value: '32k', label: '32K+' },
    { value: '8k', label: '8K+' },
    { value: 'any', label: 'Any' },
  ]}
  onChange={(v) => setContextMin(v as '128k' | '32k' | '8k' | 'any')}
/>

<Segmented value={cost} options={...} onChange={...} accent />
```

**Single-select only.** For multi-select (e.g. provider toggles, multi-tag pickers),
use a `<Checkbox>` group instead — a multi-item segmented control implies
exclusive selection and confuses the interaction model.

#### `<Banner>` — inline notice with left-border accent

```tsx
import { Banner } from '@tokyo3rdhq/magi-design-system';

<Banner variant="info">
  No requirements set yet. Go back to specify what you're building.
</Banner>
<Banner variant="warning">
  This action will reset all your saved configurations.
</Banner>
<Banner variant="error">
  Could not load KV catalog: {error.message}.
</Banner>
<Banner variant="success">
  Saved successfully. <a href="#">View changes</a>.
</Banner>
// variant: 'warning' | 'error' | 'success' | 'info'   (default: 'warning')
```

`role="alert"` for warning/error, `role="status"` for info/success.

#### `<EmptyState>` — centered placeholder

```tsx
import { EmptyState } from '@tokyo3rdhq/magi-design-system';

// Simple:
<EmptyState>
  No models match. Try loosening the constraints — <Link to="/">edit requirements</Link>.
</EmptyState>

// Structured:
<EmptyState
  title="Nothing selected"
  description="Pick models on the Browse page first."
  action={<Button variant="primary" onClick={goToBrowse}>Go to Browse</Button>}
/>
```

### Brand primitives (since 0.5.0)

Three React rendering components over five canonical SVG assets. The SVG files (in `dist/assets/logo/` and `dist/assets/icons/`) are the source of truth; the components inject them inline so `fill="currentColor"` propagates from the consumer's `color` property.

See [`docs/brand.md`](../../docs/brand.md) for full brand guidelines (clear space, minimum size, misuse). See [`docs/component-contracts.md`](../../docs/component-contracts.md) for the per-component contract.

#### `<MagiMark>` — three-dot triangle mark

```tsx
import { MagiMark } from '@tokyo3rdhq/magi-design-system';

<MagiMark size="md" />                       // decorative (aria-hidden="true")
<MagiMark size="md" ariaHidden={false} alt="MAGI" />  // meaningful
// size: 'sm' (20 px) | 'md' (32 px, default) | 'lg' (48 px)
// ariaHidden: boolean (default: true) — set false when the mark is the only brand identifier on the page
// alt: string — required when ariaHidden is false
// className: string — extra className for positioning
```

Use for favicon-adjacent surfaces, compact headers, avatar fallback.

#### `<MagiWordmark>` — "MAGI" wordmark in Inter Bold

```tsx
import { MagiWordmark } from '@tokyo3rdhq/magi-design-system';

<MagiWordmark size="md" />
// size: 'sm' | 'md' | 'lg'   (same semantic tiers as MagiMark)
```

Use for doc headers, focused standalone contexts.

#### `<MagiLockup>` — mark + wordmark composite

```tsx
import { MagiLockup } from '@tokyo3rdhq/magi-design-system';

<MagiLockup size="md" />                       // decorative — navbar brand, OG image, README hero
<MagiLockup size="md" ariaHidden={false} alt="MAGI — home" />
```

The default logo for most contexts.

#### Static (non-React) usage

For favicons, OG images, and any non-React surface, copy the canonical assets from the published package:

```
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-mark.svg
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-wordmark.svg
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-lockup.svg
@tokyo3rdhq/magi-design-system/dist/assets/icons/favicon.svg
@tokyo3rdhq/magi-design-system/dist/assets/icons/app-icon.svg
```

Do not fork these files into a consumer repo. Bump the package dependency instead.

The MAGI logo is **stable across product accents** — it uses `currentColor`, not `var(--magi-accent)`. Product accents belong to CTAs and links; the brand mark stays in text color.

### Theme

#### `<AppTheme>` — accent override (0.3.0+: no DOM wrapper)

```tsx
import { AppTheme } from '@tokyo3rdhq/magi-design-system';

<AppTheme accent="cyan" name="token-factory">
  <App />
</AppTheme>
// accent: 'green' | 'cyan' | 'violet' | 'amber' | 'white'   (default: 'green')
// name:   string                                              (optional product identifier)
```

`name` sets `data-magi-product="<name>"` on `<html>` (not on a wrapper div).
This is the contract for scoped application identification.

**Removed in 0.3.0**: `tokens?: Partial<CSSProperties>` prop. Consumers can no
longer redefine arbitrary `--magi-*` variables through this component. For
subtree accent overrides, use `<div data-magi-accent="<name>">` instead.

#### Subtree accent override via `data-magi-accent`

```tsx
// In any consumer JSX:
<div data-magi-accent="danger">
  <Button variant="primary">Delete</Button>
</div>

<div data-magi-accent="warning">
  <Banner variant="warning">…</Banner>
</div>
```

Maps to:
- Accent presets: `green` / `cyan` / `violet` / `amber` / `white`
- Semantic: `danger` / `warning` / `success`

The button / banner / etc. inside reads `--magi-accent` via CSS and picks up
the override automatically. The mapping is shipped as static CSS in
`foundation/globals.css`.

#### `useAppTheme()` hook

```tsx
import { useAppTheme } from '@tokyo3rdhq/magi-design-system';

function MyComponent() {
  const { accent } = useAppTheme();
  // Returns { accent: AppAccent } or { accent: 'green' } outside
  // a <AppTheme>.
}
```

#### Preset accent palettes

| Preset | `--magi-accent` | Use |
| --- | --- | --- |
| `green` (default) | `#00c853` | MAGI core |
| `cyan` | `#38bdf8` | Token Factory Initializr |
| `violet` | `#8b5cf6` | API product |
| `amber` | `#f59e0b` | Agent product |
| `white` | `#ffffff` | Monochrome MAGI |

## Typography utility classes

Apply with `className="…"` on any element. They consume the same tokens as the React components.

| Class | What |
| --- | --- |
| `.magi-display` | 72 px / semibold / -0.045em / 1.05 leading |
| `.magi-h1` | 48 px / semibold / -0.03em / 1.15 |
| `.magi-h2` | 36 px / semibold / -0.03em / 1.15 |
| `.magi-h3` | 24 px / semibold / -0.01em / 1.3 |
| `.magi-h4` | 20 px / medium / -0.01em / 1.3 |
| `.magi-body-lg` | 18 px / normal / 1.625 |
| `.magi-body` | 16 px / normal / 1.5 |
| `.magi-body-sm` | 14 px / normal / 1.5 |
| `.magi-label` | 13 px / medium / 1.3 |
| `.magi-caption` | 12 px / normal / 1.3 |
| `.magi-eyebrow` | 14 px / medium / 0.18em tracking / uppercase / accent |
| `.magi-code` | 14 px mono / surface bg / 1px border |

## Tokens

Every token is a CSS custom property on `:root`. See [`docs/tokens.md`](../../docs/tokens.md) for the complete reference.

```css
.my-thing {
  color: var(--magi-text-primary);
  background: var(--magi-surface);
  padding: var(--magi-space-4);
  border-radius: var(--magi-radius-lg);
}
```

## CSS cascade model (0.3.0+)

`styles/index.css` declares layer order:

```css
@layer magi.reset, magi.tokens, magi.foundation, magi.layout, magi.components;
```

Consumer styles (unlayered) always win over our layered rules, regardless of
import order. This is declared architecture, not accidental source-order.

## Accessibility

- All interactive elements have visible `:focus-visible` rings via `--magi-focus-ring`
- `@media (prefers-reduced-motion: reduce)` collapses all motion durations to `0.01ms`
- `<Button>`: `aria-busy` toggles with `loading`; `disabled` + `aria-disabled` covered
- `<FormField>`: auto-wires `aria-describedby` / `aria-labelledby` / `aria-invalid` on the child control (0.3.0+)
- `<Banner>`: `role="alert"` for warning/error; `role="status"` for info/success
- `<Segmented>`: `role="radiogroup"` + `role="radio"` + `aria-checked`
- Color tokens chosen to meet WCAG AA contrast on the dark background

## Architecture decisions

See [`docs/adr/`](../../docs/adr/) for the 8 ADRs documenting key decisions:
token architecture, CSS scope, theme architecture, package boundary,
CSS bundling, React peer range, accessibility, visual regression.

## Build

```bash
npm run build         # vite build (ESM) + tsc declarations
npm run typecheck     # tsc --noEmit
npm run dev           # vite build --watch (for showroom live reload)
```

Output: `dist/index.js` (ESM), `dist/index.d.ts`, `dist/styles.css` (tokens + foundation + components).

## What's NOT included

Per spec §36 / §4:

- Tailwind / Next / Vite / Cloudflare coupling
- Animation library
- i18n (consumers handle it themselves)
- Light theme (package is dark-first per spec §9)
- Navbar, Footer, Tabs, Spinner, Select, CodeBlock, ProductHeader — Phase 4+, only after duplication is observed in 2+ products

## License

[MIT](../../LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)