# Accessibility Quality Gate Report

> **Audit target**: `@tokyo3rdhq/magi-design-system@0.6.0`
> **Date**: 2026-09-29
> **Harness**: `scripts/check-accessibility.mjs` (committed)
> **Status**: **All 59 contract assertions pass.** No source-code changes required.

---

## Background

Per `docs/accessibility_gate.md`, the design system's Component Contracts
doc (`docs/component-contracts.md`) defines accessibility behavior per
component. This audit upgrades accessibility from **documentation** to
**automated verification** — a static gate that catches contract drift
before it ships.

---

## Approach: Static a11y gate

The design system intentionally has **zero runtime test dependencies**
(no jsdom, no Playwright, no axe-core). Per ADR-0007 + ADR-0008,
Playwright + axe-playwright infrastructure is deferred to a future
release. This gate follows the existing pattern
(`check-tokens.mjs`, `check-accent-tokens.mjs`, `verify-theme-accent-matrix.mjs`):
**Node.js + source parsing, no test framework**.

### What this gate verifies

The Component Contracts doc specifies accessibility behavior per
component (keyboard navigation, ARIA, semantic structure, etc.). This
script encodes those contract clauses as regex assertions matched
against each component's `.tsx` source. **It catches contract drift** —
e.g., if someone removes `aria-busy` from Button or breaks the
`aria-describedby` merge in FormField.

### What this gate does NOT verify

- **Runtime DOM behavior** — would need Playwright/jsdom to render components and inspect the resulting DOM
- **Color contrast ratios** — would need axe-core
- **Keyboard interactions** — would need Playwright `keyboard.press()` simulation
- **Screen reader announcements** — manual verification

For runtime a11y, follow ADR-0007 + ADR-0008 — deferred to a future
release with proper infrastructure.

---

## Coverage

The gate covers **16 components** with **59 assertions** across:

| Dimension | Assertions |
|---|---|
| **Keyboard interactions** | Tab, Shift+Tab, Enter, Space, Arrow keys, Home, End, Escape (where applicable) |
| **Focus management** | focusable, focus-visible, focus order, disabled state, roving tabindex |
| **ARIA** | role, aria-label, aria-labelledby, aria-describedby, aria-invalid, aria-busy |
| **Semantic HTML** | no div-as-button, no div-as-input |
| **Component contracts** | FormField merge, Segmented radio pattern, Banner role |
| **Brand** | decorative default + meaningful fallback |
| **Theme runtime** | AppTheme: useInsertionEffect, no DOM wrapper, data-magi-theme |

### Components verified

| Component | Assertions | Status |
|---|---|---|
| Button | 5 | ✓ pass |
| Card | 3 | ✓ pass |
| Badge | 4 | ✓ pass |
| Checkbox | 4 | ✓ pass |
| Input | 3 | ✓ pass |
| FormField | 7 | ✓ pass |
| Segmented | 9 | ✓ pass |
| Banner | 4 | ✓ pass |
| EmptyState | 2 | ✓ pass |
| Container | 3 | ✓ pass |
| Section | 1 | ✓ pass |
| Stack | 3 | ✓ pass |
| MagiMark | 2 | ✓ pass |
| MagiWordmark | 2 | ✓ pass |
| MagiLockup | 2 | ✓ pass |
| AppTheme | 5 | ✓ pass |

---

## Implementation highlights

### The "g flag" trap

`.test()` with the `g` flag is **stateful** in JavaScript — `lastIndex`
advances after each successful match, and wraps at the end of the
string. Using `g` on regexes that test "does this string contain X"
produces **wrong results across multiple calls**. This gate uses **at
most the `m` flag** (multiline `^`/`$` anchoring). No `g` flag, ever.

### Negative assertions

The gate supports "must NOT contain X" assertions via `negative: true`.
The regex matches the thing that should NOT be present. The gate
passes when the regex does NOT match:

```js
const matches = regex.test(src);
const passed = assertion.negative ? !matches : matches;
```

Used for:
- Card must NOT render `<button>` (consumer composes it)
- Badge must NOT set `role="alert"` / `"status"` / `"img"`
- Layout primitives must NOT set `role="region"` / `"main"` / `"radiogroup"` / `"group"`
- AppTheme must NOT return a `<div>` JSX wrapper

### Layout primitives and the `as` prop

Container / Section / Stack support a polymorphic `as` prop that defaults
to `<div>`, `<section>`, `<div>` respectively. The source uses
`<Component>` (dynamic, capitalized) rather than a literal element.
The gate's regex accounts for this:

```js
// Match the default element + the as-prop pattern:
regex: /as\s*\?\?\s*['"]div['"]\s*\)\s*as\s+ElementType/,
```

This matches `as ?? 'div' ) as ElementType` — the polymorphic element
fallback line.

### Source-level evidence

For each assertion, the regex pattern is shown in the failure report.
The gate reports the file, the contract reference, and the expected
vs actual outcome — so a failure maps directly to the contract clause
that needs to be honored.

---

## How to run

```bash
node scripts/check-accessibility.mjs
```

Exit code:
- `0` = all assertions pass
- `1` = any violation

Output format:

```
MAGI Accessibility Quality Gate
────────────────────────────────────────────────────────────
16 components verified
59 assertions evaluated

✓ All assertions pass
```

On failure:

```
✗ 3 of 59 assertions FAILED

Failures by component:
  • FormField: 1 failure
  • Segmented: 1 failure

FAILURES:

FormField
  contract: aria-describedby merge + aria-labelledby merge. ...
  assertion: aria-describedby is MERGED with consumer-supplied id
  file: components/FormField/FormField.tsx
  expected: MATCH regex /mergeIds\(existing\[["']aria-describedby["']\]\)/
  actual: NOT MATCH
```

---

## How to add a new assertion

Add a new entry to `ASSERTIONS` in `scripts/check-accessibility.mjs`:

```js
{
  component: 'MyComponent',
  file: 'components/MyComponent/MyComponent.tsx',
  contract: 'What the Component Contracts Accessibility section says',
  assertions: [
    { name: 'short description', regex: /<pattern>/ },
    { name: 'must NOT contain X', regex: /X/, negative: true },
  ],
},
```

Rules:
- Don't use `g` flag — `.test()` is stateful with `g`.
- Use `m` flag for multiline `^`/`$` anchoring.
- Negative assertions: regex should match the thing that should NOT be present.
- Use raw string literal regexes; the script reads `regex.source` to build a fresh RegExp per assertion.

---

## CI integration

Added a step to `.github/workflows/ci.yml` immediately after
`verify-theme-accent-matrix.mjs`:

```yaml
- name: Accessibility quality gate (static contract compliance)
  run: node scripts/check-accessibility.mjs
```

The CI gate runs on every push and PR.

---

## What's NOT in this gate (deliberately)

Per the audit doc's instruction: "如果规则与 MAGI Design System 的 Component Contract 冲突，先报告冲突" (if a rule conflicts with the Component Contract, report the conflict first).

- **Axe-core WCAG checks** — deferred per ADR-0007. The gate today verifies source-pattern contracts only.
- **Runtime keyboard navigation** — needs Playwright. `Segmented`'s Arrow/Home/End handler is verified to *exist* in source (via `keydown` regex) but not to *work* at runtime.
- **Color contrast** — needs axe-core. The gate cannot verify that `--magi-text-primary` on `--magi-bg-base` meets WCAG AA contrast.
- **Screen reader announcements** — manual verification only.
- **Visual regression** — ADR-0008 (Playwright screenshots) deferred.

When axe-core + Playwright infrastructure is added (post-0.6.x), this
gate can be supplemented with a **runtime** gate that imports each
component into a test page, runs axe-core on the rendered DOM, and
exercises keyboard navigation. The two gates are complementary — the
static gate catches contract drift cheaply; the runtime gate catches
DOM-level WCAG violations.

---

## Audit deliverables

| File | Purpose |
|---|---|
| `scripts/check-accessibility.mjs` | The gate — 18 KB, ~500 lines, runs in < 200ms |
| `docs/audits/accessibility-gate.md` | This report |
| `.github/workflows/ci.yml` | Updated — added gate step |

### Updated

- `scripts/check-accessibility.mjs` (created)
- `docs/audits/accessibility-gate.md` (created)
- `.github/workflows/ci.yml` (added step)

### Result

**59 of 59 contract assertions pass.** Zero source-code changes.
Version unchanged (0.6.0). No npm publish.

The gate runs in CI on every push. If a future PR removes
`aria-busy` from Button or breaks the `aria-describedby` merge in
FormField, the gate will fail with a precise contract reference.