# ADR-001: Token architecture — stay flat, document dependency direction

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.x → 1.0 |

## Context

We need to decide whether `@magi/design-system`'s token layer is structured (primitive / semantic / component), or flat (single semantic layer), or implicit-hierarchy (semantic with explicit dependency rules).

Three positions:
- **Flat**: All tokens are semantic. No primitive / component distinction.
- **Structured**: Primitive → Semantic → Component layers, each with its own table.
- **Implicit hierarchy**: Single physical layer, but with documented "semantic references raw values inline, component CSS references semantic tokens".

## Decision

**Flat, with implicit hierarchy.**

### Token organization

Single CSS file bundle per category (colors / typography / spacing / radius / motion / breakpoints / misc). All declarations on `:root`. No physical split between primitive / semantic / component.

### Dependency direction (implicit)

- **Semantic tokens** reference raw values inline. Example: `--magi-accent: #00c853` (no aliasing).
- **Component CSS** references semantic tokens via `var(--magi-*)`. No component reaches into raw values.
- **State values** (hover / focus / disabled) are expressed inside component CSS using the same semantic tokens (e.g., `color-mix(in srgb, var(--magi-accent) 25%, transparent)`).
- **Product overrides** happen via `<AppTheme>` setting inline custom properties on `<html>`.

This is enforced by `scripts/check-tokens.mjs` in CI.

### What this is NOT

- Not primitive / semantic / component split (we don't have aliasing, no multi-brand palette, no light theme)
- Not aliasing across tokens (no `--magi-color-green-500: #00c853` indirection layer)
- Not "primitive values come from a separate package" (no `@magi/design-tokens` split)

## Alternatives considered

### Structured (3 layers)

- **Pro**: matches industry patterns (Material Design tokens, Style Dictionary). Cleaner contract.
- **Con**: We have one product family, one accent system, one theme. Splitting creates ceremony with zero benefit. We'd have ~80 tokens across 3 layers where ~30 in one layer is enough.

### Implicit hierarchy with aliasing

- **Pro**: aliasing lets us theme-system swap (dark/light mode swap by changing `--magi-bg-base` to a different value).
- **Con**: We don't ship light theme. Spec §9 says dark-first is canonical. Adding aliasing for a feature we don't ship is over-engineering.

## Consequences

- **Token count stays small**: 0.2.0 has ~50 semantic tokens. Adding structure would balloon to ~120 (40 primitive + 50 semantic + 30 component). Avoid.
- **New primitives are easy**: add a semantic token to the right file, reference it in component CSS, done.
- **Future light theme**: if asked, we'd add primitive + semantic layers at that point. The cost of refactoring ~50 tokens is bounded.
- **Token literal CI enforcement**: `scripts/check-tokens.mjs` ensures no component CSS introduces raw hex / rgb literals — the dependency direction is verified mechanically.

## References

- [Spec §5 — Accent colors](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)
- [Spec §29 — Tokens as source of truth](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)
- [Architecture review §5](architecture-review-v2.md) — "KEEP WITH MODIFICATION" verdict on flat tokens