# ADR-005: CSS bundling — single `dist/styles.css`, no per-component CSS

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.x |

## Context

We need to decide whether to ship:

- **Single CSS bundle** (`dist/styles.css`, current 0.2.0 / 0.3.0 model)
- **Per-component CSS** (`./components/Button.css`, `./components/Card.css`, etc.)
- **Tree-shakeable CSS** (consumer imports only the CSS they use)

The architecture review (§17 in `architecture-review-v2.md`) challenged this.

## Decision

**Single `dist/styles.css` bundle. No per-component CSS exports.**

### Implementation

- `src/styles/index.css` aggregates all imports via `@import "../tokens/*.css"`, `@import "../foundation/*.css"`, etc.
- Vite library mode emits the resolved stylesheet as a single `dist/styles.css` asset
- `package.json` `exports` map: `"./styles.css"` → single bundled CSS
- Consumers do `import '@tokyo3rdhq/magi-design-system/styles.css'`

### CSS layer model (0.3.0)

Inside the bundle, CSS `@layer` directives declare cascade priority:

```css
@layer magi.reset, magi.tokens, magi.foundation, magi.layout, magi.components;
```

This ensures consumer styles (unlayered) always win over our layered rules, regardless of source order. See ADR-007.

## Alternatives considered

### Per-component CSS exports

- **Pro**: consumers who use only `<Button>` don't pay for `<Card>` styles.
- **Con**: Vite library mode rejects per-component CSS entries when `cssCodeSplit: false` (which we want for predictable output). Enabling `cssCodeSplit: true` requires switching to multiple entry points in vite.config.ts, which conflicts with the React component entry. Not worth the complexity for 24 kB total.
- **Con**: consumers would need to manage multiple imports (`./components/Button.css` + `./components/Card.css`). More cognitive load.

### Tree-shakeable CSS (e.g. CSS Modules per component)

- **Pro**: perfect dead-code elimination.
- **Con**: requires CSS Modules per component. CSS Modules in Vite library mode don't bundle into the published stylesheet (they generate per-component hashed class names that consumers can't reference). We hit this limitation in 0.1.0 and explicitly chose plain CSS for this reason.

## Consequences

- **Bundle size**: `dist/styles.css` is 24 kB at 0.3.0 (16 kB at 0.1.0 + new components). Gzip ~4 kB. Well under any reasonable budget.
- **Tree-shaking**: works at the JS level (consumers don't import unused components → unused JS dropped). CSS is fully included.
- **Future**: if bundle grows beyond 50 kB (unlikely), we revisit. Today's primitives are light.

## References

- [Architecture review §17](architecture-review-v2.md)
- [Architecture decision history (0.1.0)](architecture.md) — early rejection of CSS Modules
- [Spec §27 — Avoid Tailwind Lock-in](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md) — package must work without Tailwind