# ADR-004: Package boundary — single `@tokyo3rdhq/magi-design-system` package

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.x → 1.0 |

## Context

We need to decide whether `@tokyo3rdhq/magi-design-system` is one package or several. The obvious split would be:

- `@tokyo3rdhq/design-tokens` — pure CSS variables, no React
- `@tokyo3rdhq/design-system` — React components, consumes the tokens package
- `@tokyo3rdhq/icons` (future) — icon set
- `@tokyo3rdhq/theme` (future) — theme presets

The architecture review (§14 in `architecture-review-v2.md`) challenged this — when is split justified?

## Decision

**Single package.** No split in 0.x.

### Extraction criteria (for future)

A sub-package extraction is justified when **3+** of these hold simultaneously:

1. **Dependency boundary**: the extracted piece has a different dep tree (e.g., tokens have zero React deps)
2. **Consumer boundary**: the extracted piece has different consumers (e.g., a non-React consumer like a Figma plugin or Swift port)
3. **Release cadence**: tokens change less often than components (e.g., components weekly, tokens monthly)
4. **Ownership**: a different team owns the extracted piece
5. **Language boundary**: the extracted piece needs cross-language bridging

Today: **0 of 5**.

### Why single package now

- **One consumer audience**: 2 products (magi-portal, tfi), both React.
- **Co-change**: tokens and components change together (every release touches both).
- **One repo, one CI, one release process**: less overhead.
- **Token change cadence matches component change cadence**: no version skew.

## Alternatives considered

### Split into `@tokyo3rdhq/design-tokens` + `@tokyo3rdhq/design-system`

- **Pro**: tokens could be consumed by a non-React consumer (CSS-only consumer for a non-JS site).
- **Con**: we have **0 non-React consumers**. The split adds maintenance overhead (two lockfiles, two publish configs, two version compat matrices) with zero current benefit.

### Split into `@tokyo3rdhq/design-system` + `@tokyo3rdhq/icons`

- **Pro**: icons are an independent design system concern.
- **Con**: tfi uses zero icons. magi-portal has one inline SVG (GitHub logo). Building an icon system now would be premature — we'd design 30 icons and use 1.

## Consequences

- **Consumers**: `npm install @tokyo3rdhq/magi-design-system` gets everything.
- **Tree-shaking**: unused React components are not bundled (via Vite ESM tree-shaking). Unused CSS is **not** tree-shaken (single bundle). This is a known trade-off; we accept it.
- **Single CSS bundle**: `dist/styles.css` is 24 kB (gzip 4.3 kB) at 0.3.0. Acceptable.
- **Versioning**: single version applies to tokens + components together.

## References

- [Architecture review §14](architecture-review-v2.md) — extraction criteria
- [Spec §31 — Repository Architecture](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)