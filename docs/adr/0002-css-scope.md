# ADR-002: CSS scope — `body[data-magi-app]`, defer `html[]` rename to 0.5.0

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.x |

## Context

We need to decide how CSS selectors scope themselves to the consuming application. Three patterns:

- **`body[data-magi-app]`**: foundation styles target `<body>` specifically (current).
- **`[data-magi-app]`**: any element with the attribute works.
- **`[data-magi]`**: same as above but rebranded.
- **`@layer magi.*`**: layer-based, no scope attribute.

The architecture review (§7 in `architecture-review-v2.md`) challenged this. Specifically: consumers must put the attribute on `<body>` specifically, which breaks apps that render into a div (iframes, widgets, micro-frontends).

## Decision

**Keep `body[data-magi-app]` for now. Plan rename to `html[data-magi-app]` at 0.5.0.**

### Rationale

- **0.3.0 cost** is small (mechanical change in components + consumers). But we have **2 consumers** (magi-portal, tfi) and the migration cost is on them. Not worth forcing them to migrate in 0.3.0.
- **0.5.0 timeline** gives us time for:
  - Second product to start building (validates the contract)
  - A real case for why `body` doesn't work (e.g., a micro-frontend consumer, an embed)
- **`html[data-magi-app]` is more flexible** because:
  - Any element with the attribute (including `<html>`) scopes the styles
  - Foundation body styles can target `html[data-magi-app] body` (same specificity, broader applicability)

### `body[data-magi-app]` semantics today

Every component CSS rule in `@tokyo3rdhq/magi-design-system` is prefixed `body[data-magi-app]`. This ensures:
- High enough specificity to win over consumer styles via cascade order
- Clear "consumer must opt in via attribute on body" contract

The `@layer magi.*` adoption (ADR-007) makes the cascade order declared, not accidental. Combined, `body[data-magi-app] .magi-*` inside `@layer magi.components` is robust against consumer overrides.

## Alternatives considered

### `[data-magi-app]` on any element

- **Pro**: more flexible (works for non-body consumers)
- **Con**: foundation body styles (background gradient, font baseline) need body-level application. Can't apply to `<div>`.

### Renaming to `data-magi` (without `app`)

- **Pro**: cleaner brand
- **Con**: breaking change, no semantic benefit

### Going all-in on `@scope` CSS

- **Pro**: native CSS scoping, no attribute needed
- **Con**: browser support is recent (Chrome 118+, Safari 17+, Firefox 128+). Most MAGI products need broader support.

## Consequences

- **0.3.0**: keep `body[data-magi-app]`. Document the "attribute must be on body" contract clearly.
- **0.5.0**: Brand Foundation shipped. CSS scope unchanged — `body[data-magi-app]` remains. Scope rename deferred.
- **0.5.1**: Component Contracts doc added (`docs/component-contracts.md`). CSS scope still `body[data-magi-app]`.
- **Post-0.5.x**: rename to `html[data-magi-app]`. Foundation's body styles move from `body[data-magi-app]` to `html[data-magi-app] body`. Component CSS can stay `body[data-magi-app]` since both `html` and `body` carry the attribute. Waiting for a second consumer to confirm the broader applicability before forcing a migration.
- **Migration for consumers (when the rename lands)**: change `<body data-magi-app>` to `<html data-magi-app>`. Add `<body>` (no attribute) inside.

## References

- [Spec §24 — CSS Architecture](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)
- [Architecture review §7](architecture-review-v2.md) — "KEEP WITH MODIFICATION" verdict on scope