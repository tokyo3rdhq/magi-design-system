# Architecture v2 — `@tokyo3rdhq/magi-design-system`

> **Status**: Architecture proposal (pre-implementation). Generated per `docs/arch_evo.md` §0–§36 on 2026-09-27, against package version **0.2.0** (Phase 4 just shipped).
> **Author**: maintainer of `@tokyo3rdhq/magi-design-system`
> **Authority**: this document is the design contract for the next major refactor (target 1.0). All proposed changes must trace back to one of the 16 sections below.

---

## 1. Goals

The next architectural cycle has four concrete goals:

1. **Fix two real bugs** — `<AppTheme>` adds an extra `<div>` that breaks flex/grid parents; `tokens?: Partial<CSSProperties>` is a public API leak that violates §7.
2. **Establish automated enforcement** — token literals (`#fff`, `rgba(...)`, raw `px`) cannot survive in component CSS. Today nothing stops a contributor from typing `#fff`.
3. **Make accessibility non-decorative** — every primitive must ship with keyboard / focus / ARIA wiring verified, not just "looks fine in Chrome".
4. **Document decisions as ADRs** — every non-obvious choice (token scope, CSS layer strategy, theme DOM strategy, React peer range) becomes an ADR the next maintainer can read.

## 2. Non-goals (per arch_evo.md §34)

This refactor explicitly does not do any of the following. Each is recorded so the next maintainer doesn't re-litigate:

- ❌ Introduce Tailwind / Radix / shadcn / Chakra
- ❌ Introduce Storybook (the Vite showroom is the test surface)
- ❌ Introduce CSS-in-JS or animation libraries
- ❌ Split into `@magi/design-tokens` as a separate package — see §6 below
- ❌ Implement i18n, business components, or MAGI product pages
- ❌ Add a "plugin system" or other over-abstracted escape hatches
- ❌ Mechanical `@layer` rewrite of every component CSS

If a future maintainer wants any of these, they should write a new proposal document — this one forbids them.

---

## 3. Current architecture

### Inventory (post-0.2.0)

```
@magi/design-system@0.2.0
├── tokens/              # 7 CSS files, all on :root
│   ├── colors.css       # 22 tokens
│   ├── typography.css   # font stacks + scale + tracking + leading
│   ├── spacing.css      # 0–40 scale
│   ├── radius.css       # sm/md/lg/xl/2xl/full
│   ├── motion.css       # 3 durations + 3 easings
│   ├── breakpoints.css  # sm/md/lg/xl/2xl
│   └── misc.css         # z-index, container widths, shadows, focus ring
├── foundation/          # scoped to body[data-magi-app]
│   ├── reset.css        # box-sizing, button/input reset
│   ├── globals.css      # body bg, font, scrollbar, selection, focus-visible
│   └── typography.css   # .magi-display, .magi-h1..h4, .magi-body-*, .magi-eyebrow, .magi-code
├── layout/              # Container, Section, Stack — all CSS-modules-equivalent
├── components/          # 13 primitives — all `body[data-magi-app] .magi-*`
│   ├── Button           # 4 variants × 3 sizes + loading
│   ├── Card             # 3 variants × 4 paddings
│   ├── Badge            # 5 variants + dot
│   ├── Checkbox         # 0.2.0
│   ├── FormField        # 0.2.0
│   ├── Input            # 0.2.0
│   ├── Segmented        # 0.2.0
│   ├── Banner           # 0.2.0
│   └── EmptyState       # 0.2.0
├── theme.tsx            # AppTheme component
├── utils/classnames.ts  # cx() helper
└── styles/index.css     # aggregator @imports everything
```

### Build & package

- **Vite** library mode emits ESM (`dist/index.js`) + CSS bundle (`dist/styles.css`)
- **tsc** emits `.d.ts` declarations
- **Single CSS bundle** (~22 kB at 0.2.0)
- **package exports**:
  ```json
  "." → JS + types
  "./styles.css" → single bundled CSS
  ```
- **sideEffects**: `["**/*.css"]` (declaration-only; CSS is imported for its side effect)
- **peerDependencies**: `react ^18.0.0`, `react-dom ^18.0.0`

### Scope strategy

Every component CSS rule is prefixed with `body[data-magi-app]`. This is documented as a hard requirement on consumers: the `<body>` element must carry the attribute.

### Theme

`<AppTheme accent="green">` renders a `<div data-magi-product="...">` wrapper that sets 4 inline custom properties (`--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast`). Optional `tokens?: Partial<CSSProperties>` exposes arbitrary CSS variables to consumers.

### CI

GitHub Actions: `typecheck` + `build` for `packages/design-system` and `apps/showroom`. No tests, no visual regression, no a11y checks.

### Tests

Zero. The showroom is the manual test surface.

### Showroom

Vite + React 18 + TS. 7 pages: Tokens / Typography / Buttons / Cards / Badges / Layout / Phase 4.

---

## 4. Problems

These are concrete, not abstract. Each is reproducible today.

| # | Problem | Where | Evidence |
|---|---|---|---|
| 1 | `<AppTheme>` wraps children in a `<div>` | `src/theme.tsx` | Adds an extra DOM node that breaks `display: grid` parents and breaks inside `display: flex` containers that expect direct children |
| 2 | `tokens?: Partial<CSSProperties>` exposed as public API | `src/theme.tsx` | A consumer can pass `tokens={{ '--magi-text-primary': 'red' }}` and break the design system contract (arch_evo.md §7) |
| 3 | No token literal enforcement | CI | A new contributor can write `#fff` in component CSS; nothing catches it until design review |
| 4 | No accessibility verification | CI | The 0.2.0 FormField aria-describedby wiring was added without any test confirming it's actually announced by a screen reader |
| 5 | Zero ADRs | `docs/` | 8 architectural decisions (token arch, CSS scope, theme DOM, package boundary, CSS bundling, React peer range, a11y strategy, visual regression) are implicit in code, not documented |
| 6 | `<div data-magi-app>` vs `<body data-magi-app>` | arch_evo.md §9 | Two consumer reports of confusion about where the attribute goes (astro.md 2026-09-23, tfi integration 2026-09-27). Needs explicit contract |
| 7 | `body[data-magi-app] .magi-*` cascade order | arch_evo.md §8 | When a consumer wants to override a primitive, the override must come AFTER `dist/styles.css` is imported. There's no `@layer` guarantee — this is the kind of thing that breaks silently in 6 months |
| 8 | `useId()` SSR mismatch risk | `FormField.tsx` | `useId()` works in SSR but generates different IDs server vs client. If a consumer does SSR + hydration without care, the helper-id linkage can mismatch |

**Not problems** (already correct, kept for the next maintainer):

- Single CSS bundle vs per-component — keep single. Per-component requires `cssCodeSplit: true` which Vite library mode rejects. Not worth the complexity.
- Side-effects: `["**/*.css"]` is correct.
- React 18 peer range — fine for now. Bump to React 19 in 1.0 once MAGI products are on 19.
- Token naming — semantic, not primitive-only. Don't mechanically split into primitive/semantic/component layers; the brief explicitly forbids this.

---

## 5. Token architecture

**Current state**: flat. 7 CSS files, all `:root` declarations, mixed "primitive" (e.g. `--magi-radius-md: 10px`) and "semantic" (e.g. `--magi-bg-base: #000000`).

**Target**: **stay flat**. Do not introduce primitive / semantic / component layers. Reasons:

- We have one product family. The "primitive → semantic → component" split exists to support multiple themes / brand swaps / dark + light modes. We have dark-only, single-accent.
- Each semantic token IS already a primitive value with a name. `--magi-radius-md: 10px` is both "primitive (10px)" and "semantic (medium radius)". Splitting them is ceremony.
- The 0.2.0 work already validated that flat tokens work for 13 primitives across 1 product + a partial integration of tfi.

**What changes**:

- Add a CI check that fails if any of these literals appear in `src/**/*.css`:
  - Hex colors: `#[0-9a-fA-F]{3,8}` (except inside `tokens/colors.css` itself)
  - RGB/RGBA literals: `rgb\(`, `rgba\(`
  - Hardcoded duration values (`120ms`, `200ms`, etc.) outside `tokens/motion.css`
  - Hardcoded font sizes outside `tokens/typography.css`
- Allow: `1px` borders, `2px` ring offsets — these are layout-level constants, not tokens.

**Effort**: 1 GitHub Actions step that greps for `[^a-z]#[0-9a-fA-F]{3,8}` and `rgb`/`rgba` outside allowlisted files.

**Phase**: **0.3.0**.

---

## 6. `@magi/design-tokens` — do we split?

**Decision: NO.** Keep tokens inside the design-system package.

Reasons:

- We have one consumer (tfi) and one target stack (React). Splitting into a separate package is the kind of premature abstraction the brief explicitly warns against.
- Token change cadence is **the same** as design-system change cadence (every release). Splitting would force synchronized versioning without any actual benefit.
- The token CSS file is 7 files / ~3 kB. Not worth its own package.

When would splitting become justified?

- Two products in two different languages consuming tokens (e.g. one React, one SwiftUI)
- Third-party designs want to consume MAGI tokens without the React components
- Design ops team needs to publish tokens to Figma via Style Dictionary

None of these are true today.

**Recorded as ADR-001** (see §11).

---

## 7. Theme architecture

This is the most important section. Three concrete changes:

### 7.1 `<AppTheme>` should NOT render a wrapping `<div>`

**Problem**: Currently `<AppTheme>` returns `<div data-magi-product="...">{children}</div>`. This extra `<div>` breaks:
- `display: grid` parents that expect direct grid-item children
- `display: flex` parents with `gap` that now has an extra node to layout
- Any layout using `:first-child`, `:only-child`, `:nth-child(1)` selectors
- Portals and absolute-positioned children (the wrapper changes layout tree depth)

**Fix**: Use React Context instead. `<AppTheme>` becomes a pure context provider. The accent tokens become available via `useAppTheme()` hook, applied by individual primitives or by a CSS class on a user-supplied wrapper.

```tsx
// before:
<AppTheme accent="cyan">
  <App />
</AppTheme>

// after — no wrapper:
<AppTheme accent="cyan">
  <App />
</AppTheme>
// renders <AppThemeContext.Provider> + children directly. No DOM mutation.
```

For consumers that want to scope tokens to a subtree (e.g. a card with a different accent than the page), they wrap manually:

```tsx
<div data-magi-product="token-factory" style={{ '--magi-accent': 'var(--accent-cyan)' }}>
  <Card />
</div>
```

This is the same pattern as today but **opt-in**, not forced.

**Effort**: 1 component refactor + context implementation + updates to all primitives that read `--magi-accent` (which is currently all of them — they read via CSS var, not JS, so the change is transparent).

### 7.2 Drop `tokens?: Partial<CSSProperties>` from public API

**Problem**: This prop lets consumers write any CSS variable they want into the design-system scope, including non-accent tokens. It's a backdoor that violates §7 ("Product cannot casually customize MAGI typography / spacing / etc.").

**Fix**: Remove the `tokens` prop entirely. The only customization path is `accent` (preset) or the manual `[data-magi-product="..."] { --magi-accent: ... }` CSS variable override.

If a consumer genuinely needs a new accent not in the 5 presets, they can extend `ACCENT_PRESETS` via a fork or open an issue. This is correct friction.

**Effort**: 5 lines removed + 5 lines of JSDoc updated.

### 7.3 Restrict `AppAccent` to a smaller set or open it up?

Keep the 5 presets (`green / cyan / violet / amber / white`). They cover current MAGI products and remain readable. Adding more is a non-trivial decision (each needs a contrast-checked `--magi-accent-contrast` value).

**Effort**: zero (already done).

---

## 8. CSS architecture

### 8.1 Adopt `@layer` for guaranteed cascade order

**Problem**: Today, primitive component styles use `var(--magi-*)` references but with no cascade guarantee. A consumer who imports `@magi/design-system/styles.css` first then defines their own CSS for `body { background: red }` will see their styles applied **on top of** the design-system's body styles — but only because of CSS source order, not because of layer semantics. This is fragile.

**Fix**: Adopt `@layer` for the design-system bundle:

```css
@layer magi.reset, magi.tokens, magi.foundation, magi.layout, magi.components;
```

A consumer's styles will always win over the design-system unless they explicitly opt into a layer.

**Effort**: 1 line in `src/styles/index.css` + 1 line in each component CSS to declare its layer. ~50 line changes total. **Phase 0.3.0**.

### 8.2 Scope strategy — `body[data-magi-app]` vs `data-magi`

Keep `body[data-magi-app]`. Reasons:
- The brief §9 suggests `data-magi` (without `-app`) as application-level scope. We considered it.
- `body[data-magi-app]` is specific to "the application that adopts the MAGI design system". It signals intent. Consumers who forget to set it get visible feedback (no styles applied), not silent failure.
- The cost of fixing this is breaking change for all current consumers (magi-portal, tfi) plus documentation churn.

If we wanted to change, the moment would be 1.0. Defer.

**Recorded as ADR-002**.

### 8.3 Do not split per-component CSS

Today: single `dist/styles.css` (22 kB). Per-component CSS exports were considered in 0.1.0 (see `architecture.md` §1.7) and rejected: Vite library mode rejects per-component CSS entries when `cssCodeSplit: false`.

**Decision**: keep single bundle. Tree-shaking at the JS level handles per-component dead-code; CSS is small enough that per-component splitting would be over-engineering.

---

## 9. Component architecture

### 9.1 Categorization

Current flat layout. Brief §15 suggests:

```
Foundation     → tokens + reset + globals + typography (already exists)
Layout         → Container / Section / Stack (already exists)
Primitives     → Button / Card / Badge / Checkbox / FormField / Input / Segmented / Banner / EmptyState (already exists)
Patterns       → not yet
```

Don't add a `Patterns/` directory yet — we have no patterns to put in it. Patterns emerge when 2+ products need the same composition (Navbar, Footer). §16 of brief: "Pattern 必须基于真实产品重复，而不是想象中的未来需求".

### 9.2 FormField — single component vs compound

Current API (0.2.0):

```tsx
<FormField label="..." helper="..." error="...">
  <Input ... />
</FormField>
```

Brief §13 asks: single component OR compound component?

**Decision: stay single.** Reasons:
- tfi confirmed the single-component API works for 5+ field types (Input, Select, Segmented, etc.)
- Compound API (`<FormField.Label />` etc.) requires React Context and adds 3 components for 1 use case
- FormField already handles `aria-describedby` via `useId()` — single component is enough

If a future consumer needs compound (e.g. "I want a custom error icon next to the label"), that's the moment to revisit. Not now.

### 9.3 New components to consider (not yet)

The brief lists candidates but says "Pattern 必须基于真实产品重复":

- `Switch` — no second consumer asking for one
- `Tabs` — no second consumer
- `Tooltip` — used in magi-portal but only once
- `Modal` / `Dialog` — none yet
- `Toast` — none yet
- `CommandBar` — magi-portal has none; tfi has none

**None added in 0.3.0.** Wait for second consumer to ask.

---

## 10. Accessibility architecture

### 10.1 Audit existing primitives

Per brief §12, audit each component for:

- keyboard navigation (Tab order, Enter / Space activation)
- focus-visible ring (`var(--magi-focus-ring)` is defined; verify it's applied)
- ARIA roles (`role="radio"`, `role="alert"`, etc.)
- label / description association (FormField uses `aria-describedby`; verify it works)
- disabled / loading / invalid / busy states

Already verified in 0.2.0:
- `<Segmented>` uses `role="radiogroup"` + `role="radio"` + `aria-checked`
- `<Banner>` uses `role="alert"` for warning/error + `role="status"` for info/success
- `<FormField>` wires `aria-describedby` via `useId()`
- `<Checkbox>` is a native `<input type="checkbox">` (full a11y for free)

Gaps to address:
- Verify focus rings on every interactive primitive (Button / Checkbox / FormField's input / Segmented items / Segmented group)
- Add `axe-playwright` to CI for automatic a11y checks on the showroom

### 10.2 CI integration

Add a job that runs the showroom in headless Chrome, visits each Phase 4 page, runs `axe-core` on each. Fails the build on any violation.

**Effort**: ~30 lines GitHub Actions + Playwright setup.

---

## 11. ADR (Architecture Decision Records)

This refactor introduces 8 ADRs (per brief §28). Each is a short file in `docs/adr/`:

| ID | Title | Status |
|---|---|---|
| ADR-001 | Token architecture stays flat, no `@magi/design-tokens` package | Decided in this proposal |
| ADR-002 | CSS scope is `body[data-magi-app]`, not `data-magi` | Decided in this proposal |
| ADR-003 | Theme `<AppTheme>` is a context provider, not a DOM wrapper | Decided in this proposal |
| ADR-004 | Package boundary: single package, no per-component CSS exports | Decided in this proposal |
| ADR-005 | CSS bundling: single `dist/styles.css` | Decided in this proposal |
| ADR-006 | React peer range: 18.x for 0.x, 19.x for 1.0 | Decided in this proposal |
| ADR-007 | Accessibility strategy: showroom + axe-playwright in CI | Decided in this proposal |
| ADR-008 | Visual regression: defer until 2+ products use the package | Decided in this proposal |

Each ADR file: `docs/adr/0001-token-architecture.md`, etc. ~50 lines each.

---

## 12. Build / package architecture

### 12.1 ESM only

Stay ESM-only. CJS would require dual builds (Vite library mode supports it via `formats: ['es', 'cjs']` but doubles maintenance).

### 12.2 `sideEffects: ["**/*.css"]`

Correct. Keep.

### 12.3 CSS-side-effect declaration

Current: `import './styles/index.css';` in `src/index.ts` so Vite picks it up. Works. No change.

### 12.4 `package.json` exports

Current:
```json
"." → JS + types
"./styles.css" → single bundled CSS
```

**Proposed 0.3.0 addition**: `"./theme"` → re-exports `AppTheme` only, allowing `import { AppTheme } from '@tokyo3rdhq/magi-design-system/theme'`. Tiny convenience, zero risk.

Deferred: `"./tokens.css"` etc. — not needed unless consumers explicitly want to load tokens without components (none yet).

### 12.5 React peer range

Current: `^18.0.0`. Stay until 1.0. Bump to `^18.0.0 || ^19.0.0` at 1.0.

---

## 13. Testing architecture

### 13.1 Current gap

CI runs `typecheck` + `build` only. Zero tests. The 0.2.0 FormField aria wiring was added without automated verification.

### 13.2 Phased rollout

**Phase 0.3.0**:
- Add `axe-playwright` to CI; run on showroom `Phase 4` page. Fails on a11y violations.
- This proves the a11y wiring works without writing custom tests.

**Phase 0.4.0** (later):
- Add unit tests for state-bearing components (Segmented / FormField / EmptyState) using `vitest` + `@testing-library/react`. ~10 tests total.

**Phase 1.0**:
- Visual regression via Playwright screenshots. Only justified once 2+ products use the package.

---

## 14. Consumer integration

Today: 2 consumers (magi-portal, tfi). Both integrated 0.1.0. tfi is mid-migration to 0.2.0.

After 0.3.0 lands:
- Update `docs/migration-guide.md` to document the `<AppTheme>` breaking change (no more wrapping `<div>`)
- Update the showroom to demonstrate the new pattern
- Magi-portal needs no change (it doesn't use `<AppTheme>`)
- tfi may use `<AppTheme accent="cyan">` — they should verify layout doesn't break

---

## 15. Versioning

Per brief §32:

### Patch (0.2.x → 0.2.y)
- Bug fixes
- Token value corrections
- Internal refactors without API change

### Minor (0.x → 0.x+1)
- New primitives
- New optional props on existing primitives
- New tokens (additive)
- New variants (e.g. new `<Button>` size)

### Major (0.x → 1.0, or 1.x → 1.y)
- Removed primitives
- Removed props
- Renamed props
- Renamed tokens
- CSS contract change (selectors / class names)
- `<AppTheme>` DOM removal (this lands in 1.0, NOT 0.3.0 — see §16)

---

## 16. Migration strategy (phased)

### Phase 0.3.0 (next release — target: late Oct 2026)

Concrete scope, low risk:

1. **CI: token literal enforcement** — fail build if `#hex` / `rgb` / `rgba` / hardcoded `120ms` appears in component CSS.
2. **CI: typecheck + build cache via per-package lockfiles** — already done in commit `7433dbf`.
3. **CI: `axe-playwright` job** on showroom's Phase 4 page.
4. **Theme fix: drop `tokens` prop** (breaking for anyone using it; no current consumer does).
5. **Theme fix: drop DOM wrapper** — `<AppTheme>` becomes a context provider. **Breaking**: any consumer relying on the wrapper div for layout (magi-portal doesn't use `<AppTheme>`, tfi's draft uses it; this would be the 0.3.0 → tfi migration trigger).
6. **ADRs 001–008**.
7. **Bump to 0.3.0**.

**Trade-off**: Theme changes ARE breaking. We're at 0.2.0 so this is acceptable per semver. But the tfi team needs a heads-up.

### Phase 0.4.0 (target: ~Dec 2026)

- Unit tests for state-bearing primitives (vitest + @testing-library/react)
- ADR: dark theme is canonical; no light theme in roadmap
- Add `<Tooltip>` if a second product asks
- Possibly `<Select>` if needed by tfi's actual usage

### Phase 0.5.0 (target: ~Feb 2027)

- `@layer` cascade for guaranteed override order
- Component CSS rewritten into layers
- This is the "big CSS refactor" — defer until 2+ products exist

### Phase 1.0 (target: ~Q2 2027)

- Drop `data-magi-app` → `data-magi` scope rename (if we ever do)
- React 19 peer range support
- Visual regression with Playwright
- Light theme? (only if explicitly required)

### Explicitly NOT scheduled

- `@magi/design-tokens` separate package
- Tailwind / Radix / shadcn / Chakra
- Storybook
- CSS-in-JS
- Animation libraries
- Plugin system / theme inheritance

---

## 17. Trade-offs (summary)

| Choice | Cost | Benefit |
|---|---|---|
| Theme becomes context provider | Breaks `<AppTheme>` API; needs 1.0 (or 0.3.0 with deprecation) | No DOM pollution; layout-safe |
| Drop `tokens` prop | Anyone passing `tokens={{ '--magi-...' }}` breaks | Enforces §7 — product can't casually redefine MAGI core tokens |
| Token literal enforcement | Slight CI overhead; new contributor friction | Catches accidents at PR time, not design review time |
| `axe-playwright` in CI | +30 lines GH Actions; playwright setup | Validates 0.2.0's aria wiring is actually working |
| Stay flat tokens | None | Avoids premature ceremony |
| No split into `@magi/design-tokens` | None today | Two-package world becomes justified when 2+ stacks consume |
| `@layer` deferred to 0.5.0 | None | Avoids CSS blast radius when only 1 product uses design system |

---

## 18. Open questions for the next maintainer

Things I'd want feedback on before 0.3.0 ships:

1. Is the `<AppTheme>` DOM removal in 0.3.0 acceptable, or should it be 1.0?
2. Do we want `axe-playwright` in CI from day 1 of 0.3.0, or only after the second product lands?
3. Should we add `tsc --noEmit` for the showroom as part of CI? (currently it runs but the CI yaml doesn't show it as a separate job)

---

## 19. Summary

The next architectural cycle:

- **0.3.0** fixes two real bugs (theme DOM wrapper + tokens leak), adds CI enforcement (token literals + axe a11y), writes 8 ADRs. Low risk, high signal.
- **0.4.0** adds unit tests. **0.5.0** does the `@layer` refactor. **1.0** does scope rename + React 19 peer.
- We **do not** split packages, **do not** introduce Tailwind/Radix/Storybook, **do not** add Patterns, **do not** rewrite CSS mechanically.

Everything proposed here traces back to a concrete problem (§4) or a brief requirement (§0–§36). Nothing is decorative.