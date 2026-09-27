# Tokens reference

All tokens are CSS custom properties declared on `:root` in [`packages/design-system/src/tokens/index.css`](../packages/design-system/src/tokens/index.css). Consumers read them via `var(--token-name)`.

> **Note**: Product themes override a small, controlled subset (accent family). Spec §10 forbids redefining spacing / typography / base surfaces in product themes.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `--magi-bg-base` | `#000000` | Page background |
| `--magi-bg-raised` | `#1d1d1f` | Top of fixed gradient backdrop |
| `--magi-bg-card` | `rgba(255, 255, 255, 0.04)` | Card surface |
| `--magi-bg-card-hover` | `rgba(255, 255, 255, 0.06)` | Card hover state |
| `--magi-surface` | `#0a0a0a` | Panels, code blocks, modal backdrop |
| `--magi-surface-elevated` | `#171717` | Modal / dropdown |
| `--magi-text-primary` | `#f5f5f7` | Default text |
| `--magi-text-secondary` | `#86868b` | Supporting copy |
| `--magi-text-tertiary` | `#6e6e73` | Captions, metadata |
| `--magi-text-inverse` | `#050505` | Text on light/accent backgrounds |
| `--magi-border` | `rgba(255, 255, 255, 0.08)` | Default 1px border |
| `--magi-border-strong` | `rgba(255, 255, 255, 0.14)` | Hover / focus border |
| `--magi-accent` | `#00c853` | **MAGI green. Override in product themes.** |
| `--magi-accent-hover` | `#00e676` | Accent hover state |
| `--magi-accent-soft` | `rgba(0, 200, 83, 0.08)` | Accent fill (badges, focused nav) |
| `--magi-accent-contrast` | `#050505` | Text on accent background |
| `--magi-success` | `#30d158` | Success semantic |
| `--magi-warning` | `#ff9f0a` | Warning semantic |
| `--magi-error` | `#ff453a` | Error / danger semantic |
| `--magi-selection-bg` | `rgba(0, 200, 83, 0.3)` | Text selection background |
| `--magi-selection-fg` | `#f5f5f7` | Text selection foreground |
| `--magi-scrollbar-thumb` | `rgba(255, 255, 255, 0.18)` | WebKit scrollbar thumb |
| `--magi-scrollbar-thumb-hover` | `rgba(255, 255, 255, 0.32)` | WebKit scrollbar thumb hover |

## Typography

### Font stacks

```css
--magi-font-sans: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display",
                  "Helvetica Neue", "PingFang SC", "Hiragino Sans GB",
                  Arial, system-ui, sans-serif;

--magi-font-mono: "SFMono-Regular", "Cascadia Code", "Roboto Mono",
                  Menlo, Consolas, monospace;
```

### Sizes

| Token | Value | Use |
| --- | --- | --- |
| `--magi-font-size-display` | `4.5rem` (72px) | Hero headline |
| `--magi-font-size-h1` | `3rem` (48px) | Page title |
| `--magi-font-size-h2` | `2.25rem` (36px) | Section title |
| `--magi-font-size-h3` | `1.5rem` (24px) | Card / block title |
| `--magi-font-size-h4` | `1.25rem` (20px) | Sub-title |
| `--magi-font-size-body-lg` | `1.125rem` (18px) | Lead paragraph |
| `--magi-font-size-body` | `1rem` (16px) | Default paragraph |
| `--magi-font-size-body-sm` | `0.875rem` (14px) | Supporting copy |
| `--magi-font-size-label` | `0.8125rem` (13px) | Form label |
| `--magi-font-size-caption` | `0.75rem` (12px) | Caption / metadata |
| `--magi-font-size-code` | `0.875rem` (14px) | Inline code |

### Weights

| Token | Value |
| --- | --- |
| `--magi-font-weight-light` | `300` |
| `--magi-font-weight-normal` | `400` |
| `--magi-font-weight-medium` | `500` |
| `--magi-font-weight-semibold` | `600` |
| `--magi-font-weight-bold` | `700` |

### Tracking

| Token | Value | Use |
| --- | --- | --- |
| `--magi-tracking-tightest` | `-0.045em` | Display headlines |
| `--magi-tracking-tighter` | `-0.03em` | Headings |
| `--magi-tracking-tight` | `-0.01em` | Sub-headings |
| `--magi-tracking-normal` | `0` | Body |
| `--magi-tracking-wide` | `0.05em` | (reserved) |
| `--magi-tracking-widest` | `0.18em` | Eyebrow / kicker labels |

### Leading

| Token | Value | Use |
| --- | --- | --- |
| `--magi-leading-display` | `1.05` | Display headline |
| `--magi-leading-tight` | `1.15` | Headings |
| `--magi-leading-snug` | `1.3` | Body small, code |
| `--magi-leading-normal` | `1.5` | Body |
| `--magi-leading-relaxed` | `1.625` | Body large |

## Spacing

Coherent scale — use only these values, never arbitrary pixels.

| Token | Value | Common use |
| --- | --- | --- |
| `--magi-space-0` | `0` | Reset |
| `--magi-space-1` | `4px` | Tight gaps |
| `--magi-space-2` | `8px` | Inline gaps |
| `--magi-space-3` | `12px` | Button padding (sm/md) |
| `--magi-space-4` | `16px` | Default gap |
| `--magi-space-5` | `20px` | — |
| `--magi-space-6` | `24px` | Card padding (md) |
| `--magi-space-8` | `32px` | Section padding (sm) |
| `--magi-space-10` | `40px` | — |
| `--magi-space-12` | `48px` | Section padding (md) |
| `--magi-space-16` | `64px` | Section padding (lg) |
| `--magi-space-20` | `80px` | — |
| `--magi-space-24` | `96px` | Section padding (xl, mobile) |
| `--magi-space-32` | `128px` | Section padding (lg, mobile) |
| `--magi-space-40` | `160px` | Section padding (xl, desktop) |

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--magi-radius-sm` | `6px` | Badges, inline code |
| `--magi-radius-md` | `10px` | Inputs, secondary surfaces |
| `--magi-radius-lg` | `14px` | — |
| `--magi-radius-xl` | `20px` | Default card |
| `--magi-radius-2xl` | `28px` | Modal, large panels |
| `--magi-radius-full` | `999px` | Buttons, badges (pill) |

## Motion

| Token | Value |
| --- | --- |
| `--magi-duration-fast` | `120ms` |
| `--magi-duration-normal` | `200ms` |
| `--magi-duration-slow` | `320ms` |
| `--magi-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--magi-ease-emphasized` | `cubic-bezier(0.3, 0, 0, 1)` |
| `--magi-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |

All motion durations collapse to `0.01ms` when `@media (prefers-reduced-motion: reduce)` matches (set in `motion.css`).

## Breakpoints

| Token | Value |
| --- | --- |
| `--magi-bp-sm` | `640px` |
| `--magi-bp-md` | `768px` |
| `--magi-bp-lg` | `1024px` |
| `--magi-bp-xl` | `1280px` |
| `--magi-bp-2xl` | `1536px` |

Use as `@media (min-width: 768px)` directly, or read the variable in CSS:

```css
@media (min-width: 768px) { /* ... */ }
```

## Misc

### Z-index

```css
--magi-z-base: 0
--magi-z-raised: 10
--magi-z-dropdown: 100
--magi-z-sticky: 200
--magi-z-overlay: 300
--magi-z-modal: 400
--magi-z-toast: 500
```

### Container widths

```css
--magi-container-sm: 640px
--magi-container-md: 768px
--magi-container-lg: 1024px
--magi-container-xl: 1200px
--magi-container-wide: 1400px
```

### Shadows

```css
--magi-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4)
--magi-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5)
--magi-shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.6)
```

### Focus ring

```css
--magi-focus-ring: 0 0 0 2px var(--magi-bg-base), 0 0 0 4px var(--magi-accent)
```

Applied via the `:focus-visible` rule on `[data-magi-app]` descendants. Use this token if you build custom focus indicators on top of the design system.

## Overriding tokens in product themes

`<AppTheme accent="cyan">` flips the accent family only:

```ts
// Effective after AppTheme accent="cyan":
--magi-accent: #38bdf8
--magi-accent-hover: #7dd3fc
--magi-accent-soft: rgba(56, 189, 248, 0.08)
--magi-accent-contrast: #050505
```

All other tokens remain at the default values. If you need to override a different token (e.g. a brand-specific `--magi-text-primary` for an enterprise product), pass it via the `tokens` prop:

```tsx
<AppTheme accent="cyan" tokens={{ '--magi-text-primary': '#0a0a0a' }}>
  <App />
</AppTheme>
```

This is an **escape hatch** — overusing it defeats the purpose of the design system. Spec §10 explicitly forbids arbitrary redefinitions of spacing / typography / base surfaces.