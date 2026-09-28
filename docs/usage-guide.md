# Usage guide — `@tokyo3rdhq/magi-design-system`

> **Audience**: developers integrating the package into a MAGI product (`magi.website`, `*.magi.website`, etc.).
> **Last verified against**: `@tokyo3rdhq/magi-design-system@0.4.2`.

This guide covers **patterns** — how to compose the primitives into real UI surfaces. For per-component API signatures, see [`packages/design-system/README.md`](../packages/design-system/README.md). For token reference, see [`tokens.md`](./tokens.md).

---

## Table of contents

1. [Setup checklist](#setup-checklist)
2. [Theming patterns](#theming-patterns)
3. [Brand identity patterns](#brand-identity-patterns)
4. [Form patterns](#form-patterns)
5. [List patterns](#list-patterns)
6. [Empty / loading / error states](#empty--loading--error-states)
7. [Navigation chrome patterns](#navigation-chrome-patterns)
8. [Accessibility patterns](#accessibility-patterns)
9. [Composition with non-design-system code](#composition-with-non-design-system-code)
10. [Anti-patterns](#anti-patterns)

---

## Setup checklist

Three steps. Do not skip.

### 1. Install

```bash
npm install @tokyo3rdhq/magi-design-system
```

### 2. Import stylesheet once, at app entry

```ts
// In your root layout / entry file:
import '@tokyo3rdhq/magi-design-system/styles.css';
```

This single import pulls in tokens + foundation + all 13 components. **Do not** import per-component CSS — the package bundles one stylesheet.

### 3. Mark `<body>`

```html
<body data-magi-app>
  <!-- app mounts here -->
</body>
```

`<body data-magi-app>` is how foundation styles scope themselves. Every component CSS rule is prefixed `body[data-magi-app] .magi-*` for specificity. Without the attribute, **no design-system styles apply** — this is intentional.

For consumers that don't control `<body>` directly (rare), set it via JavaScript before first render:

```ts
document.body.setAttribute('data-magi-app', '');
```

---

## Theming patterns

The package ships **one** theme mechanism for accent overrides: `<AppTheme>` (app-level) and `data-magi-accent` (subtree-level). The accent defines your product's brand color.

### App-level accent with `<AppTheme>`

`<AppTheme>` is **application-level**. It sets the four accent CSS variables on `<html>`, and they cascade through the entire document via standard CSS inheritance.

```tsx
import { AppTheme } from '@tokyo3rdhq/magi-design-system';

function App() {
  return (
    // accent: 'green' | 'cyan' | 'violet' | 'amber' | 'white'
    // name: optional identifier — sets data-magi-product="<name>" on <html>
    <AppTheme accent="cyan" name="token-factory">
      <Routes />
    </AppTheme>
  );
}
```

Where to mount `<AppTheme>`:

- **React apps**: as high as practical in the tree — usually wrapping the entire `<Routes />` or `<Outlet />`.
- **Astro apps** (no React islands): currently `<AppTheme>` doesn't work server-side. Set `data-magi-accent="<name>"` on `<html>` in your Astro layout instead. The CSS rules in `foundation/globals.css` apply the accent before the page renders.
- **SSR pages**: `<AppTheme>` works on hydration. The very first paint uses the default theme until `useInsertionEffect` runs on the client. For zero-FOUC SSR, set `data-magi-accent` on `<html>` in your server layout.

### Subtree accent with `data-magi-accent`

For scoped overrides — a "danger" callout, a warning surface, a CTAs bar — use the `data-magi-accent` attribute. **No React component required.**

Eight values:

| Attribute | Maps to |
| --- | --- |
| `green` `cyan` `violet` `amber` `white` | Accent presets (same as `<AppTheme accent>`) |
| `danger` | `var(--magi-error)` |
| `warning` | `var(--magi-warning)` |
| `success` | `var(--magi-success)` |

```tsx
// A delete-confirmation card with red accent
<div data-magi-accent="danger">
  <Banner variant="error">
    This will permanently delete the configuration.
  </Banner>
  <Button variant="primary">Delete</Button>
  <Button variant="secondary">Cancel</Button>
</div>

// A success toast
<Banner variant="success" data-magi-accent="success">
  Saved successfully.
</Banner>
```

The CSS rules in `foundation/globals.css` ship the mapping; you don't need to write any CSS.

### When to use which

| Scope | Use |
| --- | --- |
| Whole app, brand identity | `<AppTheme accent="cyan">` at the root |
| One section, one card, one CTA | `<div data-magi-accent="danger">` inline |
| A button inside a danger surface | rely on cascade — the accent vars already flow from the outer `data-magi-accent` |

### Common mistakes

- ❌ Writing `<div style={{ '--magi-accent': 'red' }}>` — this works but bypasses the curated palette. Use `data-magi-accent="danger"` instead.
- ❌ Wrapping your app in two `<AppTheme>` to mix two accents. CSS vars are global — only the last-mounted one wins. Use `data-magi-accent` for subtree scope.
- ❌ Trying to set typography or spacing via `<AppTheme>`. `<AppTheme>` owns accent only. Spec §10 forbids the rest.

---
## Brand identity patterns

The package ships the canonical MAGI identity: three React components (`MagiMark`, `MagiWordmark`, `MagiLockup`) over five SVG assets. The SVG files are the source of truth; the components render them inline so `fill="currentColor"` inherits from your `color` property.

Full brand guidelines (clear space, minimum size, misuse rules): [`brand.md`](./brand.md).

### Logo selection

| Component | Use |
| --- | --- |
| `<MagiLockup />` | Default — navbar brand, OG image, README hero |
| `<MagiMark />` | Small surfaces: favicon-adjacent, compact headers, avatar fallback |
| `<MagiWordmark />` | Doc headers, focused standalone contexts |

### Sizing

Semantic sizes only — pixel props are not part of the API:

```tsx
<MagiLockup size="sm" />  // 20px tall — nav / tab
<MagiLockup size="md" />  // 32px tall — default (the default)
<MagiLockup size="lg" />  // 48px tall — hero / OG
```

### Color

The logo is `currentColor` — it takes the `color` of its parent. Do not hard-code fills:

```tsx
// White on dark (inherits --magi-text-primary)
<header style={{ color: 'var(--magi-text-primary)' }}>
  <MagiLockup ariaHidden={false} alt="MAGI" />
</header>

// On a light surface, the surrounding color flips and the logo follows
<div style={{ color: 'var(--magi-text-inverse)' }}>
  <MagiLockup />
</div>
```

The MAGI logo **never uses a product accent**. Accent colors belong to CTAs and links; the brand mark stays in text color.

### Accessibility

Default is decorative (`aria-hidden="true"`). When the logo is the *only* brand identifier on the page (e.g. it is the only content in a home link):

```tsx
<a href="/" aria-label="MAGI — home">
  <MagiLockup ariaHidden={false} alt="MAGI — home" />
</a>
```

### Static (non-React) usage

For favicons, OG images, and any non-React surface, copy the canonical assets from the package:

```
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-mark.svg
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-wordmark.svg
@tokyo3rdhq/magi-design-system/dist/assets/logo/magi-lockup.svg
@tokyo3rdhq/magi-design-system/dist/assets/icons/favicon.svg
@tokyo3rdhq/magi-design-system/dist/assets/icons/app-icon.svg
```

Do not fork these files into a consumer repo. Bump the package dependency instead.

### Common mistakes

- ❌ `<img src="/logo.svg">` with a locally copied SVG — drifts from the canonical asset.
- ❌ Setting `style={{ fill: '#00c853' }}` on the component — breaks the `currentColor` contract.
- ❌ Rendering the mark below 20px without using `favicon.svg` — circles become indistinguishable.
- ❌ Rotating, stretching, or adding glow/shadow/gradient to any asset — see [`brand.md` misuse section](./brand.md#misuse-prohibitions).

---


## Form patterns

`<FormField>` wraps a single form control with a label, optional helper text, and optional error message. It auto-wires `aria-describedby` / `aria-labelledby` / `aria-invalid` on the child control via `cloneElement`.

### Single-line text input

```tsx
<FormField label="Email" helper="We'll never share this.">
  <Input type="email" placeholder="you@example.com" />
</FormField>
```

The `Input` receives an auto-generated `id`, `aria-describedby` pointing to the helper span, and `aria-labelledby` pointing to the label.

### Input with error

```tsx
<FormField label="Email" error="Must be a valid email address.">
  <Input type="email" defaultValue="not-an-email" invalid />
</FormField>
```

When `error` is set, FormField's helper text shows the error message (red color), and `aria-invalid="true"` is set on the input. Screen readers announce both the field label and the error.

### Select-like control with `<Segmented>`

```tsx
<FormField label="Cost" helper="Free only = zero-cost endpoints.">
  <Segmented
    value={cost}
    options={[
      { value: 'free', label: 'Free only' },
      { value: 'any', label: 'Any' },
    ]}
    onChange={setCost}
    accent
  />
</FormField>
```

`Segmented` is rendered as `role="radiogroup"`. FormField's `aria-describedby` points to the helper. The radiogroup itself is keyboard-navigable (Arrow / Home / End + roving tabindex per WAI-ARIA radio group pattern).

### Checkbox group (multi-select)

For multi-select, **don't use `<Segmented>`**. Use a checkbox group:

```tsx
<FormField label="Providers" helper="Pick which providers to include.">
  <Stack direction="row" gap="4">
    <Checkbox
      checked={providers.includes('nvidia')}
      onChange={(e) => toggleProvider('nvidia', e.target.checked)}
    >
      NVIDIA
    </Checkbox>
    <Checkbox
      checked={providers.includes('amd')}
      onChange={(e) => toggleProvider('amd', e.target.checked)}
    >
      AMD
    </Checkbox>
    <Checkbox
      checked={providers.includes('huggingface')}
      onChange={(e) => toggleProvider('huggingface', e.target.checked)}
    >
      Hugging Face
    </Checkbox>
  </Stack>
</FormField>
```

This is the same pattern tfi uses for provider toggles. Single-item segmented controls for multi-select confuses users — they look exclusive but aren't. **Segmented is single-select only.**

### Multi-field form layout

Use `<Stack>` for vertical rhythm between fields:

```tsx
<Container size="md">
  <Section spacing="lg">
    <Stack gap="6">
      <FormField label="Project name" required>
        <Input placeholder="e.g. Coding assistant" />
      </FormField>
      <FormField label="Description" helper="One sentence.">
        <Input placeholder="What does this project do?" />
      </FormField>
      <FormField label="Cost" helper="Free only = zero-cost endpoints." error={errors.cost}>
        <Segmented
          value={cost}
          options={[...]}
          onChange={setCost}
          accent
        />
      </FormField>
      <Banner variant="error">
        {errors.summary}
      </Banner>
      <Button variant="primary" loading={submitting}>
        Create project
      </Button>
    </Stack>
  </Section>
</Container>
```

`Stack gap="6"` = `--magi-space-6` = 24px between fields. Tighter for related fields (gap="4"), looser for distinct sections (gap="8" or `gap="12"`).

---

## List patterns

There is **no `<List>` primitive**. Compose with `<Card>` + `<Stack>` / flex grid.

### Vertical list

```tsx
<Stack gap="3">
  {items.map((item) => (
    <Card key={item.id} variant="default" padding="md">
      <span className="magi-label">{item.label}</span>
      <span className="magi-caption">{item.meta}</span>
    </Card>
  ))}
</Stack>
```

### Grid of cards

The package doesn't ship a Grid primitive. Use Tailwind grid (magi-portal) or CSS Grid directly:

```tsx
{/* Tailwind grid */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id} variant="elevated" padding="lg">
      {/* ... */}
    </Card>
  ))}
</div>

{/* CSS Grid */}
<div
  style={{
    display: 'grid',
    gap: 'var(--magi-space-6)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  }}
>
  {items.map((item) => (
    <Card key={item.id} variant="elevated" padding="lg">
      {/* ... */}
    </Card>
  ))}
</div>
```

### Interactive card grid

For clickable cards, use `variant="interactive"`:

```tsx
<Card
  variant="interactive"
  padding="lg"
  onClick={() => navigate(`/projects/${item.id}`)}
>
  <h3 className="magi-h3">{item.name}</h3>
  <p className="magi-body-sm" style={{ color: 'var(--magi-text-secondary)' }}>
    {item.description}
  </p>
</Card>
```

`interactive` adds hover (border lift + surface darken) and active (1px translate) states automatically.

---

## Empty / loading / error states

Three primitives cover these: `<Banner>` for inline notices, `<EmptyState>` for "no data" placeholders, and the loading state on `<Button>`.

### Inline notice (Banner)

Use `<Banner>` for in-content warnings, errors, success, info:

```tsx
{error && (
  <Banner variant="error">
    {error}
  </Banner>
)}

{success && (
  <Banner variant="success">
    Saved successfully. <a href="#">View changes</a>.
  </Banner>
)}
```

`role="alert"` for warning/error (assertive live region), `role="status"` for info/success (polite live region). Screen readers announce these on appearance.

### "No data" placeholder (EmptyState)

```tsx
{items.length === 0 ? (
  <EmptyState
    title="Nothing selected"
    description="Pick models on the Browse page first."
    action={
      <Button variant="primary" onClick={() => navigate('/browse')}>
        Go to Browse
      </Button>
    }
  />
) : (
  <ItemList items={items} />
)}
```

Two patterns:
- **Simple**: `<EmptyState>Body text</EmptyState>` — inline elements allowed
- **Structured**: `<EmptyState title="..." description="..." action={...} />`

### Loading

Two options:

**Loading in-place** — disable controls, swap text:

```tsx
<Button variant="primary" loading={submitting} onClick={handleSubmit}>
  {submitting ? 'Saving…' : 'Save'}
</Button>
```

`loading={true}` shows a spinner inside the button and disables interaction. The button text stays visible (for context) but the label changes if you want.

**Loading the whole page** — use `<EmptyState>` with a Spinner-style affordance:

```tsx
{loading ? (
  <EmptyState>
    <span className="magi-caption">Loading models…</span>
  </EmptyState>
) : error ? (
  <Banner variant="error">{error}</Banner>
) : items.length === 0 ? (
  <EmptyState title="No models yet" />
) : (
  <ItemList items={items} />
)}
```

This pattern covers all four states (loading / error / empty / loaded) in a single branch.

> Note: tfi asked for a `<Spinner>` primitive in earlier proposals — not in 0.4.x. Inline `<span className="magi-caption">Loading…</span>` is the current way.

---

## Navigation chrome patterns

> Note: the package doesn't ship `<Navbar>` / `<Footer>` / `<Tabs>` / `<Tooltip>` / `<Modal>`. These were intentionally deferred until 2+ products need them. Until then, build chrome with the shipped primitives + `data-magi-accent`.

### Top nav with sticky header

```tsx
// Using native HTML + design-system tokens (magi-portal approach)
<header
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 'var(--magi-z-sticky)',
    padding: 'var(--magi-space-4) var(--magi-space-8)',
    borderBottom: '1px solid var(--magi-border)',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'saturate(180%) blur(20px)',
  }}
>
  <nav
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: 'var(--magi-container-wide)',
      margin: '0 auto',
    }}
  >
    <a href="/" style={{ fontWeight: 500 }}>MAGI</a>
    <Stack direction="row" gap="6">
      <a href="/products" className="magi-caption">Products</a>
      <a href="/docs" className="magi-caption">Docs</a>
      <a href="/blog" className="magi-caption">Blog</a>
    </Stack>
    <Button variant="primary" size="sm" onClick={() => navigate('/start')}>Get started</Button>
  </nav>
</header>
```

### Card grid section

```tsx
<Section spacing="lg">
  <Container size="xl">
    <Stack gap="8">
      <div>
        <p className="magi-eyebrow">Products</p>
        <h2 className="magi-h2">Three systems. One platform.</h2>
      </div>
      <div
        style={{
          display: 'grid',
          gap: 'var(--magi-space-6)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Stack>
  </Container>
</Section>
```

---

## Accessibility patterns

The package ships keyboard / focus / ARIA wiring on every interactive primitive. You usually don't need to add ARIA manually — but here are patterns where you do.

### Focus management after navigation

When a route changes, focus moves to the new page's `<h1>`. Implement with a `useEffect`:

```tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function App() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();

  useEffect(() => {
    headingRef.current?.focus();
  }, [location.pathname]);

  return (
    <main>
      <h1 ref={headingRef} tabIndex={-1}>Page title</h1>
      {/* ... */}
    </main>
  );
}
```

`tabIndex={-1}` makes the heading programmatically focusable without adding it to the tab order.

### Skip link for nav

For long pages with nav chrome at the top:

```tsx
<a
  href="#main-content"
  style={{
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
  onFocus={(e) => {
    e.currentTarget.style.left = '0';
    e.currentTarget.style.width = 'auto';
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.padding = 'var(--magi-space-2) var(--magi-space-4)';
    e.currentTarget.style.background = 'var(--magi-accent)';
    e.currentTarget.style.color = 'var(--magi-accent-contrast)';
  }}
>
  Skip to main content
</a>

{/* later in JSX */}
<main id="main-content" tabIndex={-1}>
  {/* page content */}
</main>
```

### Loading announcement for screen readers

```tsx
const [loading, setLoading] = useState(false);

return (
  <>
    <div role="status" aria-live="polite" style={{ position: 'absolute', left: '-9999px' }}>
      {loading ? 'Loading models' : ''}
    </div>

    {/* visible UI */}
  </>
);
```

A visually hidden live region tells screen readers when async operations start/stop without visible UI change.

---

## Composition with non-design-system code

You can mix `<Button>` with a `<button>` from your existing component library — but the design system CSS will win on cascade for any matching class.

### Wrapping a custom component

If you have a custom button you can't refactor immediately:

```tsx
import { Button } from '@tokyo3rdhq/magi-design-system';

function MyOldButton({ children, ...props }) {
  // Wrap your old button inside a design-system Button so the accent flows
  // <Button variant="primary"><your-old-button>{children}</your-old-button></Button>
  // — but this is a misuse of <Button>'s semantics.
}
```

**Don't do this.** Either refactor to use `<Button>` directly, or add `data-magi-app="<name>"` to your component's root element to opt into the cascade:

```tsx
<button
  data-magi-app="my-section"
  className="my-old-button"
>
  Save
</button>
```

`data-magi-app` is treated as a marker; foundation tokens and component CSS will apply to descendants. This works for one-off hybrid areas.

### Inline styles

Inline styles can use tokens:

```tsx
<div style={{
  padding: 'var(--magi-space-4)',
  color: 'var(--magi-text-secondary)',
  borderRadius: 'var(--magi-radius-md)',
}}>
  Contents
</div>
```

This is fine. The token literal script in `scripts/check-tokens.mjs` blocks hex / rgba / hardcoded px / hardcoded ms literals in `.tsx` / `.ts` files but allows `var(--magi-*)` references.

Don't use `style={{ color: '#fff' }}` — use `style={{ color: 'var(--magi-text-primary)' }}`.

---

## Anti-patterns

These are explicitly **discouraged** by the design spec. Each link points to the rule it violates.

### ❌ Re-defining tokens locally

```tsx
// BAD — duplicates --magi-accent
const myAccent = '#00c853';
<Card style={{ borderColor: myAccent }} />

// GOOD — references the token
<Card data-magi-accent="green" />
```

Spec §29 — tokens are the source of truth.

### ❌ Inline raw color literals

```tsx
// BAD — bypasses token governance
<button style={{ background: '#ff453a' }}>Delete</button>

// GOOD — uses semantic token
<Button variant="danger">Delete</Button>
```

Caught by `scripts/check-tokens.mjs` in CI (P1.2).

### ❌ Defining a multi-segmented control

```tsx
// BAD — segmented implies exclusive choice
<Segmented value="green">
  <Segmented value="cyan">  {/* won't render correctly */}
    <Segmented value="violet" />
  </Segmented>
</Segmented>

// GOOD — use Checkbox group for multi
<FormField label="Providers">
  <Stack direction="row" gap="4">
    <Checkbox>Provider 1</Checkbox>
    <Checkbox>Provider 2</Checkbox>
  </Stack>
</FormField>
```

Spec §33 — Segmented is single-select only.

### ❌ Tailwind / Radix / MUI

```tsx
// BAD — pulls in another UI library, breaks family contract
import { Button as MuiButton } from '@mui/material';

<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  <MuiButton variant="contained">Save</MuiButton>
</Box>

// GOOD — use the design system
<Card variant="elevated" padding="lg">
  <Button variant="primary">Save</Button>
</Card>
```

Spec §4 — no Tailwind / Radix / shadcn / Chakra.

### ❌ CRT / terminal styling

```css
/* BAD — violates spec §36 */
.pixel-grid {
  background-image:
    repeating-linear-gradient(0deg, #00ff00 0, #00ff00 1px, transparent 1px, transparent 8px);
}
```

Magenta scan lines, neon green, blinking cursors — explicitly forbidden.

### ❌ `<AppTheme>` for subtree accent

```tsx
// BAD — <AppTheme> is app-level, doesn't create subtree CSS scope
<AppTheme accent="danger">
  <DangerCard />
</AppTheme>

// GOOD — use data-magi-accent for subtree
<div data-magi-accent="danger">
  <DangerCard />
</div>
```

CSS variables are global (set on `<html>`); `<AppTheme>` cannot create CSS subtree scope.

---

## See also

- [`packages/design-system/README.md`](../packages/design-system/README.md) — Full API reference
- [`docs/tokens.md`](./tokens.md) — Every CSS custom property
- [`docs/migration-guide.md`](./migration-guide.md) — Upgrading from 0.2.0 → 0.3.0 → 0.4.x
- [`docs/integration-prompt.md`](./integration-prompt.md) — AI agent prompt for new consumers
- [`docs/architecture-review-0.3.md`](./architecture-review-0.3.md) — Known issues + roadmap
- [`docs/adr/`](./adr/) — Architecture Decision Records

If something is unclear or a pattern is missing, open an issue on
https://github.com/tokyo3rdhq/magi-design-system/issues.