# Theme × Accent Verification Matrix Report

> **Audit target**: `@tokyo3rdhq/magi-design-system@0.6.0`
> **Date**: 2026-09-29
> **Harness**: `scripts/verify-theme-accent-matrix.mjs` (committed)
> **Status**: **2 of 3 orthogonal claims pass. 1 known bug detected.** No source-code changes required; the bug is a CSS-rule asymmetry documented below.

---

## Scope

Verifies the two orthogonal CSS dimensions of the design system:

- **Theme**: Dark (canonical) / Light (supported alternative)
- **Accent**: Green / Cyan / Violet / Amber / White (5 product accents), plus Danger / Warning / Success (3 semantic overrides)

Three runtime mechanisms:
- **`<AppTheme accent="…" theme="…">`** — application-level
- **`data-magi-theme="…"`** — HTML attribute (any subtree)
- **`data-magi-accent="…"`** — HTML attribute (any subtree)

**Matrix size**: 2 themes × 5 app accents × 9 subtree accents = **90 cells**. Each cell verifies:
- 17 theme tokens (bg, surface, text, border, scrollbar, selection, logo)
- 4 accent tokens (accent, accent-hover, accent-soft, accent-contrast)

= **1890 token assertions** per run.

---

## Summary

| Orthogonality claim | Result |
|---|---|
| 1. **Theme tokens do not leak across accent** (same theme, varying accent → identical theme tokens) | **✓ Pass — 0 failures** |
| 2. **Accent tokens do not leak across theme** (same accent, varying theme → identical accent tokens) | **✓ Pass — 0 failures** |
| 3. **Subtree accent (`data-magi-accent`) matches AppTheme accent** (`<AppTheme accent="cyan">` ≡ `<div data-magi-accent="cyan">`) | **✗ 50 divergences — known bug, see below** |

### Failure breakdown

| Check | Failures |
|---|---|
| THEME-TOKEN LEAK | **0** |
| THEME-AFFECTS-ACCENT | **0** |
| ACCENT SOURCE-OF-TRUTH DIVERGENCE | **50** (40 distinct cells × 1–2 tokens per cell) |
| **Total** | **40 of 90 cells fail** |

---

## The finding

**The CSS rules `[data-magi-accent="<name>"]` in `foundation/globals.css` only set `--magi-accent` and `--magi-accent-hover`.** They do NOT set `--magi-accent-soft` and `--magi-accent-contrast`.

Source of truth:
- `src/tokens/accent-presets.ts` — each of the 5 accents (green/cyan/violet/amber/white) defines all 4 tokens (accent, -hover, -soft, -contrast).
- `src/theme.tsx` AppTheme runtime — writes all 4 tokens on `<html>`.
- `src/foundation/globals.css` — defines only `--magi-accent` and `--magi-accent-hover` for each `[data-magi-accent="<name>"]` rule.

**Impact**: when a subtree uses `<div data-magi-accent="cyan">`, the `--magi-accent-soft` and `--magi-accent-contrast` values are inherited from the parent AppTheme context (typically green). Components that depend on `--magi-accent-soft` (e.g. `<Badge>`) or `--magi-accent-contrast` (e.g. `<Button>`) will render with the parent accent's soft/contrast, not the subtree accent's.

**Concrete failure example** (from the matrix):
```
Cell: theme=dark, appAccent=green, subtreeAccent=cyan
  ACCENT SOURCE-OF-TRUTH DIVERGENCE:
    data-magi-accent="cyan" sets --magi-accent-soft=rgba(0, 200, 83, 0.08)
    AppTheme accent="cyan"    sets --magi-accent-soft=rgba(56, 189, 248, 0.08)
```

The subtree claims to be cyan, but the Badge rendered inside would display the green soft background.

---

## Where the fix goes

Per the user's "如果发现规范本身存在歧义，先报告，不要自行改变设计" instruction in `docs/theme_accent_verification.md`, the harness **does not modify source code**. The fix is a design decision that belongs to a future release (post-0.6.x):

### Option A — Complete the CSS rules in `globals.css` (recommended)

Extend each `[data-magi-accent="<name>"]` rule to set all 4 tokens:

```css
[data-magi-app] [data-magi-accent="cyan"] {
  --magi-accent: #38bdf8;
  --magi-accent-hover: #7dd3fc;
  --magi-accent-soft: rgba(56, 189, 248, 0.08);
  --magi-accent-contrast: #050505;
}
```

Eight rules × 4 tokens = **32 lines of CSS** added. Matches the AppTheme runtime's contract exactly.

**Pros**: zero source-code changes. The CSS rule becomes the equivalent of a stripped-down AppTheme.

**Cons**: the hex values duplicate what's in `tokens/accent-presets.ts`. Need to keep them in sync — enforced by `scripts/check-accent-tokens.mjs` (which already cross-validates them, but currently only for `--magi-accent` and `--magi-accent-hover`; would need extension).

### Option B — Document the asymmetry as expected behavior

Add to `docs/brand.md` and `docs/component-contracts.md`:

> When using `data-magi-accent="<name>"` for a subtree accent override, `--magi-accent` and `--magi-accent-hover` are redefined; `--magi-accent-soft` and `--magi-accent-contrast` are inherited from the parent AppTheme. Consumers who need full subtree accent (including soft/contrast) must use `<AppTheme>` nesting instead.

**Pros**: no code change. Documents the current contract accurately.

**Cons**: reduces subtree-accent ergonomics — most consumers will need to nest AppTheme.

### Option C — Reject the verification harness for this check

If the asymmetry is intentional, retire Check 3 from the harness (or change it to verify only `--magi-accent` / `--magi-accent-hover`). Mark the test as **documented-by-design**.

---

## Recommended action

**Option A + Option B combined.** Extend the CSS rules in 0.7.0 (small, mechanical change with strong test coverage from this harness). Until then, document the asymmetry in 0.6.1.

This decision was deferred to a future release per the user's no-architecture-changes rule for the current audit.

---

## Harness contract

- `scripts/verify-theme-accent-matrix.mjs` reads three source files:
  - `packages/design-system/src/tokens/colors.css`
  - `packages/design-system/src/foundation/globals.css`
  - `packages/design-system/src/tokens/accent-presets.ts`
- Synthesizes CSS scopes for each combination via a static cascade resolver.
- No browser required.
- CI integration: added to `.github/workflows/ci.yml` after the existing `check-accent-tokens.mjs` step.
- Exit code 0 = pass, 1 = fail.

### Running locally

```bash
node scripts/verify-theme-accent-matrix.mjs
```

---

## What's NOT verified

- **Visual rendering** — the harness checks CSS cascade math; actual rendering may differ due to font fallback, subpixel rounding, OS color profile.
- **Runtime behavior of `<AppTheme>`** — the harness simulates the AppTheme runtime via static CSS emulation. The actual `useInsertionEffect` writes to `document.documentElement` and restores on unmount. Snapshot/restore logic is not exercised.
- **Nested `<AppTheme>`** — the source-of-truth check simulates the boundary between AppTheme (app-level) and data-magi-accent (subtree). Nested AppThemes (multiple AppTheme providers) are not in the matrix.
- **`<header>` / `<footer>` / components** — the matrix verifies *tokens*. Component CSS is tested via `apps/showroom`'s visual contract surface, not this harness.
- **`data-magi-app` selector** — every rule in the harness assumes `[data-magi-app]` is on the root element. The matrix doesn't verify the cascading interactions when the attribute is on a different element (per the 0.6.0 change).
- **The 3 semantic overrides** (`danger` / `warning` / `success`) — these reference semantic colors (`--magi-error` / `--magi-warning` / `--magi-success`), which are theme-independent. Check 3 only verifies the 5 product accents.

---

## How to extend the matrix

To add a new dimension (e.g. a 3rd theme, a 6th accent), edit `scripts/verify-theme-accent-matrix.mjs`:

1. Extend the corresponding array constant (`THEMES`, `APP_ACCENTS`, `SUBTREE_ACCENTS`).
2. If a new token is added, extend `THEME_TOKENS` or `ACCENT_TOKENS`.
3. Re-run and verify the cell count math is consistent: `cases.length === THEMES.length × APP_ACCENTS.length × SUBTREE_ACCENTS.length`.

For example: adding a 3rd theme (`'high-contrast'`) increases the matrix from 90 to 135 cells.

To add a new check, append to the `for (const c of cases)` loop:
```js
// CHECK 4: ...
if (/* condition */) {
  errors.push('...');
}
```

The harness runs at full matrix size in < 200ms.

---

## Audit deliverables

| File | Purpose |
|---|---|
| `scripts/verify-theme-accent-matrix.mjs` | The harness (committed). 320 lines. Runs in < 200ms. |
| `docs/audits/theme-accent-matrix.md` | This report. |
| `.github/workflows/ci.yml` | Updated — added the harness to CI. |

### Updated

- `scripts/verify-theme-accent-matrix.mjs` (created)
- `docs/audits/theme-accent-matrix.md` (created)
- `.github/workflows/ci.yml` (added step)

**No source-code changes.** **No version bump.** **No npm publish.**

The harness is a **release-gate** that will pass cleanly once Option A lands in 0.7.0. Until then, CI surfaces this report every run so the divergence stays visible.