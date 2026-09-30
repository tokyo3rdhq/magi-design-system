# Showroom Contract Surface Audit

> **Audit target**: `apps/showroom` (Phase 1–4 + Brand + Guidelines + Matrix)
> **Date**: 2026-09-29
> **Contract doc**: `docs/showroom_to_contract_surface.md`

---

## Method

The contract doc says `apps/showroom` is not a demo gallery — it is the **executable Contract Surface** for the design system. It must let a reviewer answer six questions about every component:

1. How do I use it?
2. What states does it have?
3. Is it correct in Dark and Light?
4. Is it accessible?
5. Which tokens drive it?
6. Is it covered by visual regression?

The audit mapped every component against the contract's six questions + the page structure + debug-overlay requirement.

---

## Page mapping

| Contract route | Current page | Status |
|---|---|---|
| `/brand` | `Brand.tsx` (MagiMark/Wordmark/Lockup at 3 sizes + static assets + `currentColor` + a11y) | **PASS** |
| `/foundation` | `Typography.tsx` (full scale: display, h1–h4, body-lg/body/body-sm/label/caption/eyebrow/code) | **PASS** |
| `/tokens` | `Tokens.tsx` (colors, spacing, radius, motion, typography, breakpoint swatches) | **PASS** |
| `/theme` | **MISSING** — theme switching is global only; no dedicated theme-explorer page | **GAP (1)** |
| `/components` | `Buttons.tsx` + `Cards.tsx` + `Badges.tsx` + `Layout.tsx` + `Phase4.tsx` (Checkbox/Input/FormField/Segmented/Banner/EmptyState) | **PASS** |
| `/accessibility` | **MISSING** — accessibility is touched per-page (Brand, Guidelines) but no consolidated page | **GAP (2)** |
| `/states` | **MISSING** — states are demonstrated inline but no consolidated states reference | **GAP (3)** |

---

## Six-questions matrix (per component)

| Component | Page | (1) Usage | (2) States | (3) Dark/Light | (4) A11y | (5) Tokens | (6) Visual regression |
|---|---|---|---|---|---|---|---|
| **Button** | Buttons.tsx | ✓ Variants + sizes demo | ✓ Default/Disabled/Loading + Focus hint | ✓ Global theme picker | △ "Tab to a button" hint | ✗ no token reference | ✗ no regression coverage (no Playwright yet) |
| **Card** | Cards.tsx | ✓ Variants + Padding | ✗ Default only — no hover/active state demo | ✓ | ✗ no ARIA note | ✗ no token reference | ✗ |
| **Badge** | Badges.tsx | ✓ All 5 variants + dot modifier | ✗ no explicit state demo | ✓ | ✗ | ✗ | ✗ |
| **Checkbox** | Phase4.tsx | ✓ Standalone + group patterns | △ defaultChecked / unchecked / disabled / controlled | ✓ | ✗ no keyboard hint | ✗ | ✗ |
| **Input** | Phase4.tsx | ✓ 3 sizes + invalid + password | ✗ focus/disabled not isolated | ✓ | ✗ | ✗ | ✗ |
| **FormField** | Phase4.tsx | ✓ helper + error variants | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Segmented** | Phase4.tsx | ✓ single-select + accent variant | ✗ selected only (no disabled opt) | ✓ | ✗ no Arrow/Home/End hint | ✗ | ✗ |
| **Banner** | Phase4.tsx | ✓ all 4 variants | ✗ | ✓ | ✗ no `role=alert`/`role=status` note | ✗ | ✗ |
| **EmptyState** | Phase4.tsx | ✓ simple + structured | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Container** | Layout.tsx | ✓ 5 sizes | — | ✓ | — | ✗ no token reference | ✗ |
| **Section** | Layout.tsx | ✓ spacing × surface | — | ✓ | — | ✗ | ✗ |
| **Stack** | Layout.tsx | ✓ vertical + horizontal | — | ✓ | — | ✗ | ✗ |
| **MagiMark / Wordmark / Lockup** | Brand.tsx | ✓ 3 sizes | — | ✓ (dark/light) | ✓ ARIA rules documented | △ `currentColor` doc | ✓ Matrix page |
| **Experience Guidelines** | Guidelines.tsx | ✓ all 6 patterns | — | ✓ | ✓ (extensive — `aria-label`, screen-reader-only "(opens in new tab)", focus management) | — | — |

---

## Theme / Accent / Debug

| Contract clause | Current state | Status |
|---|---|---|
| Theme switch (Dark + Light) | ✓ Global theme picker in top nav wired to `<AppTheme theme>` | **PASS** |
| Accent switch (green/cyan/violet/amber/white) | ✓ Global accent picker wired to `<AppTheme accent>` | **PASS** |
| Subtree accent override | ✓ `data-accent` selector on each Matrix cell (`Matrix.tsx`) | **PASS** |
| `data-screenshot-mode` toggle | ✓ checkbox in top nav; sets `[data-screenshot-mode="true"]` on the shell — disables animations for deterministic screenshots (`globals.css:160`) | **PASS** |
| **Debug overlay** (component name + variant + theme + accent + active CSS token) | **NOT IMPLEMENTED** | **GAP (4)** |
| Production build excludes debug overlay | N/A (showroom is dev-only, never published) | N/A |

---

## Summary

| Status | Count |
|---|---|
| **PASS** | 13 components × 1–6 dimensions = mostly partial (see fix table) |
| **GAP** | 4 — see below |
| **TEST GAP** | Visual regression tooling deferred per ADR-0008 (Playwright not adopted) |

### Gaps

1. **Missing `/theme` page** — the contract calls for a dedicated theme-explorer page. Currently, theme is only controllable via a global picker; there's no page that shows both themes side-by-side with the same components for direct comparison.
2. **Missing `/accessibility` page** — accessibility info is scattered across pages (Brand's "Accessibility" section + Guidelines's "Accessibility" section). A consolidated page would be more discoverable.
3. **Missing `/states` page** — states are demonstrated inline (Buttons's default/disabled/loading/focus) but no consolidated reference for hover/active/focus/disabled/selected/error/loading states across all components.
4. **Missing debug overlay** — the contract requires a dev-only overlay displaying the component name, theme, accent, and active CSS token. Not implemented.

### Per-component fixes needed

- **(4) A11y** — most pages lack keyboard hints. Buttons has "Tab me"; Segmented should have "Arrow keys to navigate, Home/End for first/last"; Checkbox should have "Space to toggle"; FormField should have "Error associates with control via aria-describedby".
- **(5) Tokens** — every component page should expose the CSS tokens driving it (one-line text under the demo or as a side annotation). E.g., Button: "drives `--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast`, `--magi-text-primary`, `--magi-text-inverse`."
- **(6) Visual regression** — currently no automated visual regression. Per ADR-0008, deferred. The Matrix page is the foundation for future Playwright capture.

---

## Decision

Per the contract doc:
> 不要增加新的组件 API。
> 对于发现的问题，优先修复 contract gap，而不是扩大 API。

**No new component API.** The fixes are **showroom-only enhancements**:
1. Add a small **DebugOverlay** component (showroom-only, not exported).
2. Add a **kitchen notation block** under each component demo showing keyboard + tokens.
3. Add 3 new pages: `/theme`, `/accessibility`, `/states`.

---

## Fix Plan

| # | Action | Effort | Risk |
|---|---|---|---|
| 1 | Add `<DebugOverlay>` component (showroom-local, dev-only) | Low | None |
| 2 | Add keyboard + token annotation chips under each component demo | Low | None |
| 3 | Add `/theme` page (side-by-side Dark/Light) | Low | None |
| 4 | Add `/accessibility` page (consolidated patterns) | Low | None |
| 5 | Add `/states` page (consolidated state reference) | Medium | None |
| 6 | Update showroom README to mention new pages | Low | None |

**Total**: 5 new pieces of showroom-internal content; **0 changes to `@tokyo3rdhq/magi-design-system`**.

---

## Recommendation

Execute Fix Plan in the next showroom iteration (0.7.0 or showroom 0.2.0). The showroom is dev-only; this is the right surface for the contract work.

Do NOT block 0.6.0 release on these gaps — they're showroom-side improvements that can ship separately.

---

## Deliverables

| File | Purpose |
|---|---|
| `docs/audits/showroom-contract-surface.md` | **NEW** — this audit |

## Verification

Showroom builds clean (`npx tsc -b` exits 0). No source code in `@tokyo3rdhq/magi-design-system` changed.