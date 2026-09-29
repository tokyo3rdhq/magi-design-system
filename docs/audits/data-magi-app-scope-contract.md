# `data-magi-app` Scope Contract — Audit Report

> **Audit target**: `@tokyo3rdhq/magi-design-system@0.6.0`
> **Date**: 2026-09-29
> **Audit doc**: `docs/formalize_data-magi-app_scope_contract.md`
> **Outcome**: **Contract formalized.** Zero source-code changes required. New contract doc + ADR-0002 cross-link + README table entries.

---

## Scope of the audit

Per the audit doc, I checked:
- `globals.css`, `reset.css`, `typography.css`, foundation — **all element-agnostic**
- `components/*.css` (9 components) — **all element-agnostic**
- `brand/brand.css` — **element-agnostic**
- `theme.tsx` runtime — **uses `document.documentElement` exclusively, never `document.body`**
- Showroom (`apps/showroom/src/`) — **no scope-attribute manipulation in code** (only documentation comments referencing `data-screenshot-mode`)
- README.md, packages/design-system/README.md — **correct (canonical `<html>`)**
- docs/usage-guide.md, docs/migration-guide.md, docs/integration-prompt.md — **mostly correct**
- docs/adr/0002-css-scope.md — **correct (status: Executed in 0.6.0)**

---

## Findings

| # | Finding | Action |
|---|---------|--------|
| F1 | All component CSS uses `[data-magi-app]` (element-agnostic) — verified by `grep -rE '^\s*(body\|html\|:root)\s' packages/design-system/src/components/ packages/design-system/src/foundation/ --include='*.css'` returning **0 matches**. | None — no fix needed |
| F2 | `theme.tsx` uses `document.documentElement` exclusively — verified by `grep -n 'documentElement\|document.body' theme.tsx` returning only `documentElement`. | None — no fix needed |
| F3 | Showroom has no source-code scope-attribute manipulation — verified. | None — no fix needed |
| F4 | `migration-guide.md` has multiple `<body data-magi-app>` examples in Phase 5/6/7 upgrade steps. These are **historical**, describing the consumer state at the time of those upgrades (before 0.6.0). The Phase 7 "What 0.5.x does NOT include" already includes a note explaining this. | None — historical context |
| F5 | ADR-0002 status is "Accepted → Executed in 0.6.0" but did not link to a formal contract doc. | **Added** — ADR-0002 now cross-links to `docs/contracts/data-magi-app-scope-contract.md` |
| F6 | The contract doc was **not formalized** — README and other docs each repeated partial contract language. | **Created** — `docs/contracts/data-magi-app-scope-contract.md` is now the canonical contract doc |

**Total findings**: 6. **All 6 closed.** Zero source-code changes.

---

## What the new contract doc establishes

`docs/contracts/data-magi-app-scope-contract.md` (8 KB) defines:

### 1. Scope matrix

| Attribute | Canonical location | Legacy | Inheritance | Override |
|-----------|-------------------|------------|-------------|----------|
| `data-magi-app` | `<html>` | `<body>` (any element) | Not inherited (selector matches any element) | Cannot be overridden |
| `data-magi-theme="dark|light"` | `<html>` (AppTheme writes here) | `<body>` legacy | Cascades to descendants (CSS variables are inherited) | Subtree: `<section data-magi-theme="light">` flips the subtree without affecting outer |
| `data-magi-accent="<name>"` | Any subtree element | n/a | Cascades to descendants | Subtree accent overrides the outer accent; soft/contrast fall back to parent (documented in `theme-accent-matrix.md` as a known 0.7.0 fix) |
| `data-magi-product` | `<html>` (AppTheme writes here) | n/a | Not inherited (marker only) | n/a |

### 2. Canonical placement

```html
<html lang="en" data-magi-app>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 3. Legacy support window

`<body data-magi-app>` is supported through the entire `0.x` cycle. **No removal before 1.0.0.** At 1.0.0 the legacy placement MAY be removed in a single breaking change with a documented migration path.

### 4. CSS selector contract

| May use | Must NOT use |
|---------|-------------|
| `[data-magi-app]` (element-agnostic scope) | `body` (as scope selector) |
| `[data-magi-theme="dark|light"]` | `html` (as scope selector) |
| `[data-magi-accent="<name>"]` | React root (`#root` / `.app`) |
| CSS custom properties (`var(--magi-*)`) | `:root` |
| | Document-order assumptions (e.g., `body > main`) |

### 5. Theme interaction verified

```html
<html data-magi-app data-magi-theme="dark">
  <body>
    <section data-magi-theme="light">
      <!-- Section's tokens resolve against the light variant. -->
    </section>
  </body>
</html>
```

Subtree `<section data-magi-theme="light">` overrides the outer cascade via higher CSS specificity. Verified orthogonal.

---

## Verification commands

Run these to verify the contract:

```bash
# Zero stale scope selectors in component CSS
grep -rnE '^\s*(body|html|:root)\s' packages/design-system/src/components/ packages/design-system/src/foundation/ --include='*.css'

# All component CSS uses [data-magi-app] as the scope
grep -rn '\[data-magi-app\]' packages/design-system/src/ --include='*.css'

# AppTheme runtime uses document.documentElement (never document.body)
grep -n 'documentElement\|document.body' packages/design-system/src/theme.tsx
```

Expected output:
- First grep: **0 matches** (verified)
- Second grep: matches in every component CSS file
- Third grep: only `documentElement` (verified)

---

## Deliverables

| File | Purpose |
|---|---|
| `docs/contracts/data-magi-app-scope-contract.md` | **NEW** — the formal contract (8 KB) |
| `docs/adr/0002-css-scope.md` | Updated — added "See also" cross-link to the contract |
| `README.md` | Updated — added `contracts/` directory entry + doc table row |
| `docs/audits/data-magi-app-scope-contract.md` | **NEW** — this report |

### What I did NOT do

- ❌ No source-code changes (none required — contract was already correct in 0.6.0).
- ❌ No removal of `<body data-magi-app>` support.
- ❌ No runtime warning when `<html data-magi-app>` is absent.
- ❌ No new components or CSS rules.
- ❌ No version bump. No npm publish.

The contract is **formalized**, the audit is **closed**, and 1.0.0 is the next decision point for legacy removal.