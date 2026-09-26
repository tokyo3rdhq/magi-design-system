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
- **No CSS Modules in the package.** We use plain CSS with BEM-style classes; see [`docs/architecture.md`](./docs/architecture.md) for the rationale.
- **Consumers must put `data-magi-app` on `<body>`**, not a child container. Body-level styles (background gradient, scrollbar, font baseline) require it.
- **Don't redefine spacing / typography / base surfaces in product themes.** ProductTheme only owns the accent tokens. Spec §10.
- **Don't reintroduce CRT / terminal styling.** Spec §36 forbids it.

## Versioning & releases

This package follows [Semantic Versioning](https://semver.org/).

- **0.x** — rapid iteration; breaking changes are allowed but should be called out clearly
- **1.0+** — breaking changes require a major bump and a migration note in `CHANGELOG.md`

Releases are cut by the maintainers when the working tree is clean and the showroom builds. The npm publish step requires a publish token (see `SECURITY.md`).

## Style
- ESM, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Two-space indent, single quotes, semicolons
- No inline styles for values that have tokens (use `var(--magi-space-*)` etc.)
- New components must include a JSDoc block with `@example`
- Run `npm run typecheck` before pushing

## Reporting issues

- **Bugs / features**: open a GitHub issue with reproduction steps
- **Security vulnerabilities**: see [`SECURITY.md`](./SECURITY.md) — do **not** open a public issue