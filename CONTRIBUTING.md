# Contributing

Thanks for your interest in the MAGI Design System. This is a small, high-leverage package — every change ships to multiple MAGI products.

## Scope

In scope:

- Fixing bugs in the package, foundation, components, or build pipeline
- Adding **shared** tokens / primitives that are duplicated across MAGI products
- Improving accessibility, performance, or DX of existing components
- Documentation improvements

Out of scope (consider opening an issue first):

- Product-specific components (`ModelCard`, `ProviderTabs`, etc.) — these belong in the consuming product
- Brand/visual overhauls that would break the "subordinate product accent" rule (spec §5)
- New dependencies unless there's a clear win
- Tailwind, MUI, Radix, Chakra — the package deliberately avoids these (spec §4)

The rule of thumb from spec §33:

> If the same visual or interaction pattern appears in **2+ MAGI products**, consider extracting it. If it exists only because one product has a unique domain problem, keep it in that product.

## Local setup

```bash
# 1. Install workspace dependencies (creates file: link from showroom to package)
npm install --workspaces --include-workspace-root

# 2. Build the package once, or watch mode
cd packages/design-system
npm run dev

# 3. Start the showroom
cd ../../apps/showroom
npm run dev
```

Live edits in `packages/design-system/src/` rebuild via `vite --watch`; the showroom picks up changes after rebuild (Vite watches `node_modules/@tokyo3rdhq/magi-design-system` through the symlink).

## Workflow

1. **Open an issue** describing the problem or proposal. Skip this for trivial fixes (typos, build tweaks).
2. **Branch from `main`**: `git checkout -b fix/<short-slug>` or `feat/<short-slug>`
3. **Make the change** in `packages/design-system/`. Add or update the showroom page that demonstrates it.
4. **Verify**:
   ```bash
   cd packages/design-system
   npm run typecheck    # tsc --noEmit
   npm run build        # vite build + tsc declarations
   cd ../apps/showroom
   npm run build        # tsc -b + vite build
   npm run dev          # open http://127.0.0.1:5173, visually confirm
   ```
5. **Commit** with a Conventional Commits-style message (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
6. **Open a PR** referencing the issue.

## Architectural rules

These are non-negotiable and enforce the design spec:

- **Tokens are CSS custom properties** (`var(--magi-*)`). Components reference them — never hardcode values.
- **Component classes are prefixed `magi-`** (`magi-button`, `magi-card`, etc.) and additionally scoped to `body[data-magi-app]` in the CSS file. The latter is required to win specificity against the foundation reset.
- **No CSS Modules in the package.** We use plain CSS with BEM-style classes; see [`docs/architecture-v2.md`](./docs/architecture-v2.md) for the rationale.
- **Consumers must put `data-magi-app` on `<body>`**, not a child container. Body-level styles (background gradient, scrollbar, font baseline) require it. Per ADR-0002, this will move to `<html>` at 0.5.0; until then, `<body>` is the contract.
- **Don't redefine spacing / typography / base surfaces in product themes.** AppTheme only owns the accent tokens. Spec §10.
- **Don't reintroduce CRT / terminal styling.** Spec §36 forbids it.
- **Token literals must be tokens.** `scripts/check-tokens.mjs` enforces this in CI. Color literals (`#hex`, `rgb()`, `rgba()`), hardcoded px font sizes, and hardcoded ms durations are not allowed in component CSS / TSX / TS (with allowlist for `theme.tsx` and `foundation/globals.css`). Use `var(--magi-*)` references or `color-mix(in srgb, var(--magi-*) N%, transparent)`.
- **Accent values must match across JS and CSS.** `scripts/check-accent-tokens.mjs` cross-validates `ACCENT_PRESETS` in `theme.tsx` against `data-magi-accent` rules in `foundation/globals.css`. If you change one, update the other.

## Versioning & releases

This package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Per ADR-0006:

- **Patch** (0.x.y → 0.x.y+1): bug fixes, internal implementation, token value corrections
- **Minor** (0.x → 0.x+1): new primitives, new optional props, new tokens (additive), React peer range expansion
- **Major** (0.x → 1.0 or 1.x → 1.y): removed primitives / props, renamed props / tokens, CSS contract changes, DOM contract changes

Releases are cut by the maintainers when the working tree is clean and the showroom builds. The npm publish step requires a publish token (see `SECURITY.md`). Current latest: see [`CHANGELOG.md`](./CHANGELOG.md) and [`README.md`](./README.md#status).

## Style
- ESM, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Two-space indent, single quotes, semicolons
- No inline styles for values that have tokens (use `var(--magi-space-*)` etc.)
- New components must include a JSDoc block with `@example`
- Run `npm run typecheck` before pushing

## Reporting issues

- **Bugs / features**: open a GitHub issue with reproduction steps
- **Security vulnerabilities**: see [`SECURITY.md`](./SECURITY.md) — do **not** open a public issue