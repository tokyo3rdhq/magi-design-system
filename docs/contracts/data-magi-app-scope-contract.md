# `data-magi-app` Scope Contract

> **Status**: formalized as the canonical contract in 0.6.0. Replaces the deferred ADR-0002 with explicit legacy window.
> **Date**: 2026-09-29
> **Version**: 0.6.0

---

## TL;DR

The Design System uses **`data-magi-app`** as the scope-attribute contract. The attribute:

- **Canonical location**: `<html data-magi-app>` (the root element of the consumer's render tree).
- **Legacy location**: `<body data-magi-app>` — supported through 0.x, **no removal scheduled before 1.0.0**.

The CSS uses `[data-magi-app]` as the scope selector (element-agnostic). The React runtime (`<AppTheme>`) writes accent variables + `data-magi-theme` + `data-magi-product` to `document.documentElement`. Neither runtime nor CSS depends on the consumer's choice of root vs. `<body>`.

---

## Scope matrix

| Attribute | Canonical location | Legacy | Inheritance | Override |
|-----------|-------------------|------------|-------------|----------|
| `data-magi-app` | `<html>` | `<body>` (any element) | Not inherited (selectors match any element with the attribute) | Cannot be overridden; once set, it IS the scope |
| `data-magi-theme="dark"` | `<html>` (written by `<AppTheme>`) | `<body>` (legacy placement, AppTheme still writes to `<html>`) | Cascades to descendants (CSS variables are inherited) | Subtree: `<section data-magi-theme="light">` flips the subtree to Light without affecting the outer theme — verified orthogonal to the outer cascade |
| `data-magi-accent="<name>"` | Any subtree element (subtree-level only) | n/a | Cascades to descendants (CSS variables are inherited) | Subtree accent overrides the outer accent; soft/contrast fall back to parent (documented in [`theme-accent-matrix.md`](../audits/theme-accent-matrix.md) as a known 0.7.0 fix) |
| `data-magi-product` | `<html>` (written by `<AppTheme>` only) | n/a | Not inherited (used as a marker, not a CSS hook) | n/a |

---

## Canonical placement

```html
<!doctype html>
<html lang="en" data-magi-app>
  <body>
    <div id="root"></div>
  </body>
</html>
```

`<AppTheme>` writes its data attributes to `document.documentElement`, so the attribute MUST be on `<html>` for the runtime to reach it via `document.documentElement`. A consumer that puts `data-magi-app` only on `<body>` still gets **styles applied** (CSS matches any element), but the AppTheme runtime variables (`--magi-accent`, etc.) won't reach `<html>`-scoped CSS — they'll only reach descendants of `<body>`.

---

## Legacy support policy

`<body data-magi-app>` is **legacy but supported**:

- The CSS selector `[data-magi-app]` matches any element. CSS works.
- The `<AppTheme>` React runtime writes to `document.documentElement`, which has `data-magi-app` only if the consumer put it there. **If `<body data-magi-app>` is the only place, AppTheme's accent + theme variables are written to `<html>` anyway** (because the runtime uses `document.documentElement` directly), but the variables cascade to descendants via standard CSS inheritance — they reach `<body>` and all of its children.
- For consumers on `<body data-magi-app>`: the styles still apply. AppTheme's theme toggle still works. The only minor difference: when a component CSS rule says `[data-magi-app] .magi-button`, the selector still matches because the attribute is on an ancestor of `.magi-button`. **No runtime breakage.**

### Window

`<body data-magi-app>` will continue to work through the `0.x` cycle. **No removal before 1.0.0.** At 1.0.0 (when the Design System stabilizes), the legacy placement MAY be removed in a single breaking change with a documented migration path.

### Warning policy

Currently **no runtime warning** for `<body data-magi-app>`. The contract is permissive (any element matches).

A future enhancement MAY add a development-only warning when `<AppTheme>` mounts and `<html data-magi-app>` is absent. Not implemented in 0.6.0.

---

## CSS selector contract

Per the design system rule: **selectors must not depend on the DOM hierarchy beyond what is explicitly contracted.**

### What selectors MAY use

- `[data-magi-app]` — element-agnostic scope.
- `[data-magi-theme="dark|light"]` — element-agnostic, applies to any element.
- `[data-magi-accent="<name>"]` — element-agnostic subtree accent.
- CSS custom properties (`var(--magi-*)`) — inherited via cascade.

### What selectors MUST NOT use

- `body` (as a scope selector). The CSS may not target `<body>` specifically. The reset and foundation use `[data-magi-app]` instead.
- `html` (as a scope selector). Same rule.
- React root (`#root` or `.app`). The CSS may not assume a specific mount point.
- `:root` — may conflict with consumer styles in case of nested designs.
- Document-order assumptions (e.g., `body > main`).

### Verified

A grep across `packages/design-system/src/` confirms no `body`, `html`, or `:root` selectors in component CSS:

```
$ grep -rn "body\|html\|:root" packages/design-system/src/components/ packages/design-system/src/foundation/
# Only comments and font-family values
```

---

## Theme interaction

The runtime `<AppTheme theme="dark">` writes `data-magi-theme="dark"` to `<html>`. A subtree override `<section data-magi-theme="light">` flips the subtree to Light without affecting the outer theme — verified orthogonal to the outer cascade:

```html
<!-- Page is dark. Section is light. -->
<html data-magi-app data-magi-theme="dark">
  <body>
    <section data-magi-theme="light">
      <!-- Section's tokens resolve against the light variant. -->
    </section>
  </body>
</html>
```

The cascade semantics:
- `[data-magi-theme="dark"]` rules apply to elements that match the selector or are descendants. The subtree `<section data-magi-theme="light">` overrides `[data-magi-theme="dark"]` for its descendants via higher specificity.
- Outer theme tokens (`--magi-bg-base` etc.) are inherited from the cascade. Subtree theme re-resolves these for descendants.

---

## What changed in this audit

This contract document is **formalizing** the existing 0.6.0 contract — no source code changes. Pre-existing inconsistencies (all in docs/*) were:

1. `docs/migration-guide.md` showed `<body data-magi-app>` examples in Phase 5 (0.2.0 → 0.3.0) and Phase 6 (0.3.x → 0.4.0) upgrade steps. **These are historical**, describing the consumer state at the time of the upgrade. Already marked via a note added in Phase 7's commit.

2. `README.md` — correct (canonical `<html>`).
3. `packages/design-system/README.md` — correct.
4. `docs/usage-guide.md` — correct (canonical `<html>`).
5. `docs/integration-prompt.md` — correct (canonical `<html>`).
6. `docs/adr/0002-css-scope.md` — correct (canonical `<html>`, legacy supported).
7. `apps/showroom/` — no source-code scope references.

No source-code fixes were required.

---

## How to verify

```bash
# Confirm no body/html/:root scope selectors in component CSS:
grep -rnE '^\s*(body|html|:root)\s' packages/design-system/src/components/ packages/design-system/src/foundation/ --include='*.css'

# Confirm -magi-app uses element-agnostic selector:
grep -rn '\[data-magi-app\]' packages/design-system/src/ --include='*.css'

# Confirm AppTheme runtime uses document.documentElement:
grep -n 'documentElement\|document.body' packages/design-system/src/theme.tsx
```

All three should show: zero stale matches in the first grep, `[data-magi-app]` in every component, `documentElement` in theme.tsx, **no `document.body` references**.

---

## When to revisit

- **At 1.0.0**: decide whether to remove `<body data-magi-app>` support.
- **If React 19 / Server Components land**: re-evaluate the runtime's `useInsertionEffect` strategy. SSR may want a different scope target.
- **If the scope grows**: a future `<MagiApp>` wrapper component may own the `<html>` attribute itself, removing the consumer's responsibility.