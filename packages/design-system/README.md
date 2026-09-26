# `@tokyo3rdhq/magi-design-system`

Shared visual foundation for the [MAGI](https://magi.website) product family — dark-first, near-monochrome, restrained.

- **React 18** + **TypeScript** (strict)
- **Plain CSS** with `magi-` prefixed classes — works in any React app, no Tailwind, no Next, no Vite, no Cloudflare coupling
- **CSS custom properties** for every token — readable from any stylesheet
- **~16 kB** stylesheet (gzip ~3 kB), **~4 kB** JS (gzip ~1 kB)

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

// 3. Wrap your app in <ProductTheme> to optionally override the accent.
import { ProductTheme } from '@tokyo3rdhq/magi-design-system';

<ProductTheme accent="green">
  <App />
</ProductTheme>
```

## API

### `<Container>` — centers and constrains max-width

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

### `<Section>` — page-level vertical rhythm

```tsx
import { Section } from '@tokyo3rdhq/magi-design-system';

<Section spacing="lg" surface="default">…</Section>
// spacing: 'sm' | 'md' | 'lg' | 'xl'              (default: 'lg')
// surface: 'default' | 'raised' | 'elevated'      (default: 'default')
// fullWidth: boolean                              (default: false)
// as: 'section' | 'div' | …
```

`spacing` maps to `--magi-space-12` / `20` / `32` / `40` (xl jumps to `40` on ≥ 768 px viewports).

### `<Stack>` — flex primitive with semantic gap tokens

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

### `<Button>` — pill action element

```tsx
import { Button } from '@tokyo3rdhq/magi-design-system';

<Button variant="primary" size="md" loading={false}>Save</Button>
// variant: 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
// size:    'sm' | 'md' | 'lg'                              (default: 'md')
// loading: boolean                                          (default: false)
```

All buttons include hover, active, focus-visible, disabled, and loading states. Focus ring uses `--magi-focus-ring`.

### `<Card>` — dark surface

```tsx
import { Card } from '@tokyo3rdhq/magi-design-system';

<Card variant="elevated" padding="md">…</Card>
// variant: 'default' | 'elevated' | 'interactive'  (default: 'default')
// padding: 'none' | 'sm' | 'md' | 'lg'             (default: 'md')
```

`interactive` adds hover (border lift + surface darken) and active (1 px lift) states.

### `<Badge>` — compact status / metadata label

```tsx
import { Badge } from '@tokyo3rdhq/magi-design-system';

<Badge variant="accent" dot>128K context</Badge>
// variant: 'neutral' | 'accent' | 'success' | 'warning' | 'error'  (default: 'neutral')
// dot:     boolean                                                  (default: false)
```

### `<ProductTheme>` — accent override

```tsx
import { ProductTheme } from '@tokyo3rdhq/magi-design-system';

<ProductTheme accent="cyan" name="token-factory">
  <App />
</ProductTheme>
// accent: 'green' | 'cyan' | 'violet' | 'amber' | 'white'  (default: 'green')
// name:   string                                            (optional product identifier)
// tokens: Partial<CSSProperties>                            (optional additional overrides)
```

`<ProductTheme>` renders a `<div data-magi-product="…">` and sets the four accent tokens as inline custom properties on the wrapper. Children inherit the override automatically via CSS variable resolution.

**Allowed in `tokens`**: only overrideable tokens (accent family). Refrain from setting `--magi-space-*`, `--magi-text-primary`, or base surfaces — see spec §10.

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

## Accessibility

- All interactive elements have visible `:focus-visible` rings via `--magi-focus-ring`
- `@media (prefers-reduced-motion: reduce)` collapses all motion durations to `0.01ms`
- Buttons: `aria-busy` toggles with `loading`; `disabled` + `aria-disabled` covered
- Color tokens chosen to meet WCAG AA contrast on the dark background

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
- Navbar, Footer, Tabs, Input, CodeBlock, ProductHeader — Phase 4, only after duplication is observed in 2+ products

## License

[MIT](../../LICENSE) © 2026 [tokyo3rdhq](https://github.com/tokyo3rdhq)