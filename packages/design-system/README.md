# @magi/design-system

Shared visual foundation for the MAGI product family — dark-first, near-monochrome, restrained.

> **Visual consistency without forcing product-level sameness.**

## Stack

- React 18 + TypeScript (strict)
- CSS Modules + CSS custom properties for tokens
- No Tailwind, no Next, no Vite, no Cloudflare coupling — works in any React app

## Install

```bash
npm install @magi/design-system
```

## Usage

```tsx
// 1. Load styles once at the application root.
import '@magi/design-system/styles.css';

// 2. Mark the host container to scope the foundation styles.
function App() {
  return (
    <div data-magi-app>
      <Container size="xl">
        <Section spacing="lg">
          <Stack gap="4">
            <h1 className="magi-display">Hello, MAGI</h1>
            <Button variant="primary">Get started</Button>
            <Card variant="elevated">
              <Badge variant="accent">v0.1</Badge>
            </Card>
          </Stack>
        </Section>
      </Container>
    </div>
  );
}
```

## Product themes

Override the accent without touching typography, spacing, or surfaces:

```tsx
<ProductTheme accent="cyan" name="token-factory">
  <App />
</ProductTheme>
```

## Tokens

All tokens are CSS custom properties on `:root` — read them directly in your styles:

```css
.my-thing {
  color: var(--magi-text-primary);
  background: var(--magi-surface);
  padding: var(--magi-space-4);
  border-radius: var(--magi-radius-lg);
}
```

| Group | Examples |
|---|---|
| Colors | `--magi-bg-base`, `--magi-text-primary`, `--magi-accent`, `--magi-border` |
| Typography | `--magi-font-sans`, `--magi-font-size-display`, `--magi-tracking-tightest` |
| Spacing | `--magi-space-1` … `--magi-space-40` |
| Radius | `--magi-radius-sm` / `md` / `lg` / `xl` / `2xl` / `full` |
| Motion | `--magi-duration-fast/normal/slow`, `--magi-ease-standard` |
| Layout | `--magi-container-xl` (1200px), `--magi-bp-md` (768px) |

## Components (Phase 1)

- **Layout**: `Container`, `Section`, `Stack`
- **UI**: `Button`, `Card`, `Badge`
- **Theme**: `ProductTheme`

## Build

```bash
npm run build         # vite build (ESM) + tsc declarations
npm run typecheck     # tsc --noEmit
npm run dev           # vite watch mode
```

## Roadmap

- Phase 2: migrate `magi.website` to consume the package
- Phase 3: migrate `token-factory-initializr/web`
- Phase 4: extract shared components only when duplication is observed (Nav, Footer, CodeBlock, Tabs, Input)

## License

MIT