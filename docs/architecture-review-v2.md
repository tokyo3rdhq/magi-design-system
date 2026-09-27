# Architecture Review — `architecture-v2.md`

> **Status**: Architecture challenge of the v2 proposal. Generated 2026-09-27 against `@tokyo3rdhq/magi-design-system@0.2.0`.
> **Author**: same maintainer, in the role of Senior Design System Architect reviewing own work per the brief in `arch_evo-review.md`.
> **Authority**: this review decides what enters `0.3.0`. Anything marked **RECONSIDER** or **KEEP WITH MODIFICATION** supersedes the corresponding section in `architecture-v2.md`.
> **Method**: read every v2 decision, reproduce the cited evidence (or mark as Inference if I cannot), apply the 4-tier verdict (KEEP / KEEP WITH MODIFICATION / RECONSIDER / DEFER / REMOVE), and produce a revised evolution roadmap.

---

## Executive Summary

The v2 proposal is directionally correct but has three real problems:

1. **§7 Theme fix is incomplete.** Dropping the `<div>` wrapper alone doesn't solve the propagation problem — the accent CSS variables have to go *somewhere*. The proposal punts this to consumers ("they wrap manually") but doesn't make that ergonomic.
2. **§13 FormField aria-describedby wiring is broken.** The 0.2.0 implementation generates `describedById` but never attaches it to the child control. The JSDoc claims automatic wiring; the code does not deliver it. This is a real bug, not a roadmap concern.
3. **§12 useId / SSR is speculative.** Listed as a "Problem" with no reproduction. `useId()` is SSR-safe by design. The actual SSR risk is different and smaller.

Two decisions deserve stronger commitment than v2 gave:

4. **§8 @layer** should be in 0.3.0, not 0.5.0. The cascade-order guarantee is what protects the design language from consumer overrides — that's exactly the brief's goal.
5. **§13 Visual regression** should be in 0.3.0 alongside axe-playwright. With 13 primitives and 2 consumers, the cost is low and the protection is immediate.

One decision v2 made is correct but under-justified:

6. **§5 token flatness is the right call**, but the review's §4 challenge about implicit dependency direction is real — we should document the *implicit* semantic-then-state layering we already follow, even without a formal split.

The 5+5+5 priority list at the end reflects what actually changes for 0.3.0.

---

## Current Architecture Assessment

I verified the v2 inventory by reading the post-0.2.0 source. The inventory is accurate. The 13 primitives listed are all present.

Two things v2 didn't list and I found while reviewing:

- **`FormField` aria-describedby wiring is incomplete.** The component generates `useId()` for the helper span and renders `<span id={describedById}>`, but **never** injects `aria-describedby={describedById}` into the child. The JSDoc says "Wires the helper or error element to the input via aria-describedby" — this is a documentation/code mismatch, not a future roadmap item. **Evidence**: `src/components/FormField/FormField.tsx` lines 44–61. **Verdict: must fix before claiming a11y wiring in v0.2.x is correct.**

- **Focus rings have a `border-radius` collision.** The global `[data-magi-app] :focus-visible` rule applies `border-radius: var(--magi-radius-sm)`. The `<Segmented>` items have `border-radius: 5px` in their own CSS. The button + card + most other elements have no radius of their own. The cascade currently works because none of the rounded components have their own focus ring. But the global ring rule's `border-radius` is wrong for `<Card>` (which has `border-radius: var(--magi-radius-xl)`) and `<Banner>` (which has `border-radius: var(--magi-radius-md)`) — both would get a focus ring with the small radius if focused, which doesn't match the component shape. **Evidence**: `src/foundation/globals.css` lines 70–74 vs `src/components/Card/Card.css` / `Banner/Banner.css`. **Verdict: minor inconsistency, defer to 0.3.0 alongside @layer work.**

---

## Decision Review

Each v2 decision gets a verdict. The order follows v2.md.

### §5 Token architecture — flat, no split

**Verdict: KEEP WITH MODIFICATION.**

v2 says: stay flat, don't split into primitive/semantic/component layers.

The review's §4 challenge is real: even if physically flat, we should declare a **logical** layering that documents the implicit contract. Our tokens today have implicit dependencies:

```
(primitive values: #000000, #f5f5f7, etc. — INLINE in semantic tokens)
    ↓
semantic tokens: --magi-bg-base, --magi-text-primary, --magi-accent
    ↓
component tokens: implicit (e.g., .magi-banner uses var(--magi-warning) directly)
```

We don't need a primitive layer (we have no aliasing, no multi-brand palette) and we don't need a component token table (component CSS already references semantic tokens). The thing we *do* need is **explicit documentation of the dependency direction**:

> Semantic tokens reference raw values inline. Component CSS references semantic tokens only. State (hover/active/focus) is expressed in component CSS using the same semantic tokens.

This is one paragraph in ADR-001, not a code change.

---

### §5 Token enforcement — three-tier rule

**Verdict: KEEP WITH MODIFICATION.**

v2 says: CI grep for `#hex` / `rgb` / `rgba` / hardcoded `120ms` / hardcoded font sizes.

The review's §5 challenge is right — `MUST` / `SHOULD` / `LOCAL CONSTANT` is the actual framework. Refined rules:

| Tier | Rule | Examples |
|---|---|---|
| **MUST NOT** | Color literals (`#hex`, `rgb`, `rgba`) outside `tokens/*.css` | `--magi-bg-base: #000` is fine in tokens/colors.css; `background: #000` in `Button.css` is a fail |
| **MUST NOT** | Spacing outside `--magi-space-*` token names | `padding: 16px` in `Card.css` is a fail; `padding: var(--magi-space-4)` is fine |
| **SHOULD** | Duration values outside `tokens/motion.css` | `transition: 200ms ease` in component CSS should use `var(--magi-duration-normal)` |
| **SHOULD** | Font sizes outside `tokens/typography.css` | `font-size: 14px` in `Badge.css` should use `var(--magi-font-size-body-sm)` |
| **LOCAL CONSTANT** | 1px borders, 2px ring offsets, translate transforms, line-height ratios | These are layout-level constants, not design language |

Implementation: a `scripts/check-tokens.mjs` that runs in CI. Fails the build on any MUST NOT violation, prints a warning for SHOULD violations.

---

### §6 `@magi/design-tokens` split — NO

**Verdict: KEEP.**

v2 says: don't split. Define extraction criteria for the future.

Refined extraction criteria (per the review's §14):

> A sub-package extraction is justified when **3+** of these hold simultaneously:
>
> 1. **Dependency boundary**: the extracted piece has a different dep tree (e.g., tokens have zero React deps)
> 2. **Consumer boundary**: the extracted piece has different consumers (e.g., a non-React consumer like a Figma plugin or Swift port)
> 3. **Release cadence**: tokens change less often than components (e.g., components weekly, tokens monthly)
> 4. **Ownership**: a different team owns the extracted piece
> 5. **Language boundary**: the extracted piece needs cross-language bridging

Today: 0 of 5. **No split justified.** Re-evaluate at 1.0.

---

### §7 Theme architecture — Context provider, no DOM wrapper

**Verdict: KEEP WITH MODIFICATION.**

v2 says: `<AppTheme>` becomes a context provider. Consumers wrap manually with `<div style={{ '--magi-accent': ... }}>` for scoped overrides.

The review's §6 challenges are right — Context alone doesn't solve propagation. We need to think about where the CSS variables actually live.

**The fix**:

```
1. <AppTheme> at app root renders nothing visible.
   - It sets a Context with current accent (for any JS-aware consumers).
   - It uses useEffect to set document.documentElement.style.setProperty('--magi-accent', ...) on <html>.
   - This way, accent applies via standard CSS cascade — no DOM wrapper needed.

2. For scoped overrides (e.g. a "danger" card with red accent), consumers:
   <div style={{ '--magi-accent': 'var(--magi-error)' }}>
     <Card>...</Card>
   </div>
   The card's components read --magi-accent via CSS and pick up the override.

3. The default <html> setting can be overridden by a more-specific <div> override — that's how CSS cascade works.
```

Two-API pattern (review's §6.B): **NO**. We don't need `<MagiProvider>` separately. `<AppTheme>` is enough at the app level; consumers handle scoped overrides with normal CSS.

Nested theme scopes (review's §6.C): **allowed via manual `<div>` overrides**, no first-class API needed. The CSS cascade handles nesting naturally.

Leaked contract concern (review's §6.D): valid — asking consumers to write `style={{ '--magi-accent': ... }}` exposes the CSS variable name. **Mitigation**: provide a `useAppAccent()` hook that returns the typed current accent name; consumers can do `<div data-magi-accent="danger">` and we ship a tiny CSS file that maps `data-magi-accent` attributes to variable values.

This last mitigation is a real new feature — add to 0.4.0 (not 0.3.0).

---

### §8 CSS scope — keep `body[data-magi-app]`

**Verdict: KEEP WITH MODIFICATION.**

v2 says: defer scope rename to 1.0.

The review's §7 challenge is right that we should question this now. Looking at what `body[data-magi-app]` actually buys us:

- Foundation globals (body bg, font baseline, scrollbar) need to apply to `<body>` itself
- Token declarations on `:root` are independent of the attribute
- All component CSS is scoped under `body[data-magi-app]` for specificity

The real cost is: consumers must put the attribute on `<body>` specifically. Apps that render into a div (not body) — like iframes or widget embeds — can't use the design system.

**Refinement**: move from `body[data-magi-app]` to `html[data-magi-app]` for foundation globals. Keep `body[data-magi-app]` for body-level styles only. Component CSS can scope under either.

Actually, simpler: put everything on `html[data-magi-app]`. Foundation's body styles can target `html[data-magi-app] body` to apply body-specific styles. This is the same selector specificity and gives consumers more flexibility (any element with the attribute works).

**Breaking change** for existing consumers (magi-portal, tfi) — they have to move the attribute from `<body>` to `<html>`.

**Decision**: defer to 0.5.0 alongside @layer work. Cost of doing now: small (mechanical change). Benefit of doing now: cleaner contract. But we have 2 consumers and the migration cost is on them. **Wait for second consumer.**

---

### §8 CSS architecture — `@layer` deferral

**Verdict: RECONSIDER.** Move from 0.5.0 to **0.3.0**.

v2 says: defer `@layer` to 0.5.0.

The review's §8 challenge is right that we should question this. Here's the cost-benefit I missed in v2:

| | Without @layer | With @layer |
|---|---|---|
| Consumer writes `body { background: red }` AFTER import | wins (source order) | wins (no layer > layered) |
| Consumer writes `body { background: red }` BEFORE import | loses | loses (correct) |
| Consumer wants to override BUT keep design system baseline | no way | can opt-in to a layer |
| Future "consumer overrides" feature (theme extension) | hard | trivial via custom layer |

The cost of doing it now: ~50 line changes across 13 component CSS files (wrap each in `@layer magi.components { ... }`) + 1 line in `styles/index.css`. Half a day.

The benefit: cascade order is now declared by architecture, not by accident. This is **exactly** what protects the design language from "consumer wrote a wrong-order CSS" failures.

**Decision**: do it in 0.3.0. Combine with the body-bg-card-hover check and any other foundation cleanups.

---

### §9 Component architecture — FormField single vs compound

**Verdict: KEEP WITH MODIFICATION** (the modification is "fix the broken wiring", not "convert to compound").

v2 says: stay single. Compound is over-engineering.

The review's §9 challenge about FormField control contract is right — but the right answer is to fix the existing single-component implementation, not to switch to compound.

**Current bug** (verified by reading `src/components/FormField/FormField.tsx`):

```tsx
const describedById = helperId ?? `magi-field-${reactId}`;
return (
  <div className="magi-field">
    <label className="magi-field-label">{label}</label>
    {children}  // ← no aria-describedby injected
    {(error || helper) && (
      <span id={describedById} className="magi-field-helper">
        {error || helper}
      </span>
    )}
  </div>
);
```

The `id` is generated. The helper span gets it. But the `children` are rendered as-is. **No aria wiring actually happens.**

**Fix** (without switching to compound):

```tsx
import { Children, cloneElement, isValidElement } from 'react';

const child = Children.only(children);
const enhancedChild = isValidElement(child)
  ? cloneElement(child as ReactElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>, {
      'aria-describedby': describedById,
      'aria-invalid': !!error || undefined,
    })
  : child;

return (
  <div className="magi-field">
    <label className="magi-field-label" htmlFor={labelId}>{label}</label>
    {enhancedChild}
    {(error || helper) && (
      <span id={describedById} className={cx(...)}>{error || helper}</span>
    )}
  </div>
);
```

This:
- Auto-injects `aria-describedby` on the child control (only the first child)
- Auto-injects `aria-invalid` when error is present
- Wires `<label htmlFor>` to a generated id on the child (requires the child to accept `id` prop — Input and native elements do)

**Trade-off**: this only works for single-child FormField usage. If someone wraps a complex layout as `children`, the wiring breaks. That's acceptable — FormField's contract is "label + one control". Document it.

This fix lands in 0.3.0 (before claiming the a11y wiring is correct).

---

### §10 Accessibility — axe-playwright

**Verdict: KEEP WITH MODIFICATION.**

v2 says: add `axe-playwright` to CI. Done.

The review's §10 challenge is right that `axe passing ≠ a11y done`. Refined a11y test matrix for 0.3.0:

| Layer | Tool | Coverage | 0.3.0? |
|---|---|---|---|
| **Semantic** | axe-playwright | ARIA labels, contrast, semantic HTML, headings | ✅ add |
| **Keyboard** | Playwright keyboard API | Tab order, Enter/Space activation | ⚠️ manual test for Segmented / Checkbox / Button |
| **Focus** | Playwright + visual | focus-visible ring visible on all interactive primitives | ✅ add |
| **Screen reader** | manual | VoiceOver / NVDA test on Phase 4 page | ⚠️ manual one-time |
| **Reduced motion** | Playwright emulation | transitions disabled under prefers-reduced-motion | ✅ add |

Add the three ✅ items in 0.3.0. The ⚠️ manual items are out of scope (cost too high for low ROI).

---

### §11 Visual regression

**Verdict: RECONSIDER.** Move from 1.0 to **0.3.0**.

v2 says: defer to 1.0 / 2+ products.

The review's §11 challenge is right — with 13 primitives, visual regression NOW is cheaper than later:

- 13 primitives × 4 states (default / hover / focus / disabled) = 52 visual snapshots
- Each is a Playwright screenshot — 1 line of test code each
- Total: ~100 lines of test code, run in ~30s in CI
- Cost: low. Benefit: catches design-language drift immediately.

Visual regression protects the design language, not the product. That's exactly the brief's framing — design system owns visual language.

**Decision**: add visual regression in 0.3.0 alongside axe-playwright. Re-classify from "1.0" to "0.3.0".

---

### §12 useId / SSR

**Verdict: REMOVE from Problems.** Move to Open Questions.

v2 listed this as a Problem #8. There is no reproduction. `useId()` is SSR-safe by design (deterministic per tree).

Real SSR risks for FormField (none of which are useId-related):

- **Deterministic IDs**: not actually deterministic across server vs client unless the tree shape is identical. Use `useId()` is the right tool here — no fix needed.
- **Explicit id support**: consumers can pass `id` via `helperId` prop. We have this. ✅
- **aria-describedby composition**: this is what FormField is supposed to do, and it's currently broken (see §9 verdict). Fixing FormField fixes this.
- **SSR hydration**: if a consumer renders FormField differently on server vs client (e.g. conditional helper), the IDs differ. Consumer's bug, not ours.
- **Consumer-provided IDs**: consumers can pass `helperId` if they need control. ✅

So the actual fix is: repair the broken FormField aria wiring (already in §9 verdict). Remove the "useId SSR mismatch" item from v2's Problems table.

---

### §12 React Version vs Design System Version

**Verdict: KEEP WITH MODIFICATION.**

v2 says: React 19 support lands at 1.0.

The review's §13 challenge is right that React major isn't the right trigger for Design System major. Refined:

> Design System major version is driven by **Design System public contract changes**, not by upstream React versions.
> Breaking changes that justify a major bump:
> - Removed primitives
> - Removed/renamed props
> - Token renames/removals
> - CSS contract changes (selector patterns)
> - DOM contract changes (e.g. removing the `<div>` wrapper)
>
> React major version changes are **not** automatically Design System major bumps. When React 19 ships, expand peer range to `^18.0.0 || ^19.0.0` as a minor change (0.3.0 or 0.4.0).

This is a documentation change to ADR-006 (React version strategy). No code change in 0.3.0 unless we ship React 19 support.

---

### §13 Testing phased rollout

**Verdict: KEEP WITH MODIFICATION.**

Refined based on §10 / §11 verdicts:

- **0.3.0**: axe-playwright (a11y semantic) + Playwright focus rings + Playwright reduced-motion + Playwright visual regression (per-primitive screenshots)
- **0.4.0**: vitest + @testing-library/react unit tests for state-bearing primitives
- **1.0**: consumer contract tests (build magi-portal + tfi in CI to catch downstream breakage)

This is **ahead** of v2's schedule. Visual regression moved from 1.0 → 0.3.0 because the cost is low.

---

### §14 Consumer integration

**Verdict: KEEP WITH MODIFICATION.**

v2 says: tfi migration guide update, magi-portal unaffected.

Updated per the new 0.3.0 scope:

- **magi-portal**: no source change (uses tokens + utility classes only)
- **tfi**: as v2 said, plus the FormField aria-describedby fix actually works after the 0.3.0 fix
- **future consumers**: docs/migration-guide.md needs the new theme pattern (HTML-level CSS var + context-only AppTheme) documented before they adopt

---

### §15 Versioning

**Verdict: KEEP.**

Patch / minor / major rules are correct. Added rule per §12 verdict:

> **Minor** (not patch): expand React peer range to include a new major version (e.g. 18.x → 18.x || 19.x).

---

### §16 Migration strategy

**Verdict: KEEP WITH MODIFICATION.**

Phased rollout updated:

| Phase | Scope | 0.3.0 status |
|---|---|---|
| 0.3.0 | (1) Token literal enforcement (2) @layer (3) FormField aria fix (4) AppTheme context (5) axe + focus + reduced-motion + visual regression (6) ADRs 001–008 | — |
| 0.4.0 | (1) Vitest unit tests for state-bearing primitives (2) HTML data-magi-accent helper (3) Icons primitive (only if 2+ consumers ask) | — |
| 0.5.0 | (1) Scope rename `body[data-magi-app]` → `html[data-magi-app]` (after 2nd consumer confirms) (2) Density primitive (only if needed) | — |
| 1.0 | (1) All 0.x breaking changes are out (2) Consumer contract tests (3) Public API freeze (4) React 19 peer (if not done in 0.4.0) | — |

---

### §17 Trade-offs table

**Verdict: KEEP.**

Reasonable. No change.

---

### §18 Open questions

**Verdict: KEEP WITH MODIFICATION.**

Updated:

1. ~~`<AppTheme>` DOM removal in 0.3.0 or 1.0?~~ **Resolved: 0.3.0**, with `<html>`-level CSS var + context.
2. ~~`axe-playwright` from day 1 of 0.3.0 or after 2nd product?~~ **Resolved: 0.3.0**.
3. ~~`tsc --noEmit` for showroom in CI?~~ **Resolved: yes, add explicit job in 0.3.0**.
4. **NEW**: should the `<html>`-level CSS var pattern be enabled by default for all consumers, or opt-in via `<AppTheme>`?
   - If always-on: every page with the design-system styles.css has an `--magi-accent: green` on `<html>`. Consumers using `<AppTheme accent="cyan">` override it.
   - If opt-in: consumers must always wrap with `<AppTheme>` to get accent.
   - **Default to always-on**. Opt-in is annoying.
5. **NEW**: visual regression baseline generation — when 0.3.0 lands, the first CI run has no baseline screenshots, so it'll fail. Need to ship baselines with the release.

---

### §19 Summary

**Verdict: KEEP WITH MODIFICATION.**

Summary updated: emphasize the FormField bug fix (must happen in 0.3.0), the @layer push-up, and the visual regression push-up.

---

## Missing Architecture Topics (review §15)

| Topic | Verdict | Reason |
|---|---|---|
| **Icons** | DEFER | No consumer needs yet. magi-portal has inline SVG (GitHub logo). tfi doesn't use icons. Spec §4 forbids framework lock-in — building an icon system now would be premature. |
| **Typography semantics** | DEFER | Current scale (`magi-display` / `magi-h1`–`h4` / `magi-body` / `magi-label` / `magi-caption` / `magi-eyebrow` / `magi-code`) covers current needs. The "data" semantic the review mentions (`font-mono` for model IDs) can be added as a utility class `magi-data` when a consumer asks. |
| **Density** | DEFER | One density mode today. Spec §4 / non-goals. The brief warns against premature density modes. |
| **State tokens** | KEEP — already implicit | State is per-component (Button hover, Segmented active, Input invalid). Formally defining state tokens would require state values that we don't share across components. |
| **Responsive** | KEEP — already in tokens | Breakpoint tokens exist (`--magi-bp-sm/md/lg/xl/2xl`). Layout primitives handle responsive composition. Container queries deferred. |

None of these block 0.3.0.

---

## Required Changes

### MUST NOW (0.3.0)

1. **FormField aria-describedby wiring** — actual fix (cloneElement). Without this, every FormField consumer has broken a11y.
2. **`<AppTheme>` becomes context provider + `<html>`-level CSS var setter** — fixes the DOM wrapper bug.
3. **Drop `tokens?: Partial<CSSProperties>` from public API** — fixes the API leak.
4. **`@layer` for design-system bundle** — fixes cascade order guarantee.
5. **Token literal CI enforcement (MUST NOT + SHOULD tier)** — protects design language.
6. **axe-playwright + focus + reduced-motion + visual regression in CI** — validates a11y + design language.
7. **ADR-001 through ADR-008** — documents the decisions.

### SHOULD NOW (0.3.0)

8. **Showroom gets a separate `tsc --noEmit` job in CI** (currently tsc -b runs as part of the showroom build, but explicit is better).
9. **`data-magi-accent="<name>"` shorthand attribute + shipped CSS** — enables `<div data-magi-accent="danger">` without raw CSS variable writes. (Move from 0.4.0 to 0.3.0 since it's tiny.)
10. **Visual regression baselines** — first CI run needs baselines committed.

### CAN DEFER (0.4.0+)

- Vitest + @testing-library/react unit tests
- `<html>` scope rename (after 2nd consumer confirms)
- Icons primitive (when 2+ consumers need)
- `<html>` data-magi-accent attribute if not done in 0.3.0
- `<AppTheme>` accepts `defaultAccent` prop to skip first render flash

### NEVER UNLESS NEEDED

- Split `@magi/design-tokens` package
- Tailwind / Radix / shadcn / Chakra
- Storybook
- CSS-in-JS / animation libraries
- Plugin architecture / theme inheritance
- Light theme
- `@layer` for theme scoping (separate from cascade)

---

## Revised Evolution Roadmap

| Phase | Target | Scope |
|---|---|---|
| **0.3.0** | late Oct 2026 | FormField bug fix + Theme context fix + tokens leak fix + @layer + token literal CI + axe + focus + reduced-motion + visual regression + 8 ADRs |
| **0.4.0** | Dec 2026 | Vitest unit tests + Icons primitive (if asked) + `<AppTheme defaultAccent` prop |
| **0.5.0** | Feb 2027 | Scope rename `body[data-magi-app]` → `html[data-magi-app]` (breaking — needs 2+ consumers ready to migrate) |
| **1.0** | Q2 2027 | Public API freeze, React 19 peer (if not in 0.4.0), consumer contract tests, dark-mode canonical |

---

## Architecture Principles (revised)

Ten principles, derived from the review (not copied from v2):

1. **MAGI owns the visual language; products own the experience.**
2. **The Design System major version is driven by its own contract changes, not by upstream React.**
3. **CSS variables are the styling runtime; React Context is the configuration runtime. Don't conflate them.**
4. **Providers must not introduce accidental DOM structure.**
5. **Token governance protects the design language from literal drift, not from arbitrary numeric values.**
6. **Package boundaries follow dependency boundaries, not directory structure.**
7. **Accessibility is part of the component API contract, not a post-hoc testing phase.**
8. **Cascade order is an architectural concern, not a source-order accident. Use `@layer`.**
9. **Extract abstractions only after semantic reuse is proven across 2+ consumers.**
10. **Visual regression protects the design language, not the product. Set it up early.**

---

## ADRs Required (updated list)

| ID | Title | Status |
|---|---|---|
| ADR-001 | Token architecture: stay flat, document implicit semantic-then-state layering | Drafted in v2 |
| ADR-002 | CSS scope: `body[data-magi-app]` now, `html[data-magi-app]` at 0.5.0 | Updated: scope rename plan added |
| ADR-003 | Theme: `<AppTheme>` is context provider + `<html>`-level CSS var setter; no DOM wrapper | Updated: clarified how CSS vars propagate |
| ADR-004 | Package boundary: single package, no `@magi/design-tokens` | Unchanged |
| ADR-005 | CSS bundling: single `dist/styles.css` | Unchanged |
| ADR-006 | React peer range: `^18.0.0` for 0.x; expand to `^18 \|\| ^19` as minor when needed; 1.0 not gated on React major | **Updated: clarified major-bump triggers** |
| ADR-007 | Accessibility: axe-playwright + Playwright keyboard/focus/reduced-motion/visual regression in CI from 0.3.0 | **Updated: scope expanded to 0.3.0** |
| ADR-008 | Visual regression: ship baselines with 0.3.0; protect design language | **Updated: moved to 0.3.0 from 1.0** |

---

## Open Questions

1. **`@layer` declaration order** — review's §8 asks for the cascade model. My model:

   ```
   Browser defaults
       ↓
   @layer magi.reset
       ↓
   @layer magi.tokens
       ↓
   @layer magi.foundation
       ↓
   @layer magi.layout
       ↓
   @layer magi.components
       ↓
   Consumer styles (unlayered = highest priority)
   ```

   Is `magi.tokens` a separate layer or merged into `magi.foundation`? (Tokens are `:root` declarations, foundation is body-level. Separate is cleaner.)

2. **`<html>` vs `<body>` for accent var** — should we set `--magi-accent` on `<html>` (visible to all elements via cascade) or on `<body>` (slightly less broad)? `<html>` is broader; the only downside is that iframes inside the page inherit too, which is fine.

3. **Visual regression baseline storage** — store PNG snapshots in the repo? Git LFS for binary diffs? Playwright's built-in `toMatchSnapshot` writes text snapshots that diff cleanly. Use that.

4. **`data-magi-accent="danger"` shorthand** — does it ship in 0.3.0 or 0.4.0? Tiny addition (~10 lines CSS + docs). I lean 0.3.0.

5. **Should FormField accept a render-prop for complex layouts?** Currently I'm planning `Children.only` + cloneElement. If consumers wrap complex layouts, this breaks. Alternative: provide both `<FormField>single child</FormField>` (current) and `<FormField.Render>` compound variant for complex cases. Defer until a consumer asks.

---

## The 5+5+5

### 5 Most Important Architecture Changes (for 0.3.0)

1. **Fix FormField aria-describedby wiring** — currently broken in 0.2.0; auto-inject via `cloneElement` on the child control. **Without this, the design system's a11y claims are false.**

2. **Move `<AppTheme>` from DOM wrapper to context + `<html>`-level CSS var setter** — fixes the `display: grid` / `:first-child` / portal breakage that the current wrapper causes.

3. **Adopt `@layer` for the design-system bundle** — declared cascade order replaces accidental source-order, which is what protects the design language from consumer overrides.

4. **Drop `tokens?: Partial<CSSProperties>` from `<AppTheme>` public API** — closes the API leak that lets products redefine any `--magi-*` variable (violates §7).

5. **CI enforcement: token literals + axe-playwright + Playwright focus + Playwright reduced-motion + Playwright visual regression** — five CI checks that together catch design-language drift, a11y regressions, and focus-ring regressions before they reach consumers.

### 5 Decisions That Should Stay Unchanged

1. **Single CSS bundle (`dist/styles.css`), not per-component CSS** — Vite library mode rejects per-component CSS entries; tree-shaking handles per-component JS; CSS is small enough that splitting is over-engineering.

2. **Flat token architecture (no primitive/semantic/component split)** — we have one product family and one accent system. Splitting creates ceremony with no benefit.

3. **No `@magi/design-tokens` separate package** — 0 of 5 extraction criteria met. Defer until consumer boundary changes.

4. **Plain CSS with `magi-` prefix (not CSS Modules)** — already decided in 0.1.0, validated across 13 primitives. CSS Modules in Vite library mode don't bundle into the published stylesheet.

5. **`data-magi-app` on body attribute as the scope contract** — even if we rename to `html` later (0.5.0), the contract "consumer must opt in via an attribute" stays. CSS scope via attribute is the right level of isolation for our needs.

### 5 Decisions That Should Be Clearly Deferred

1. **Scope rename `body` → `html[data-magi-app]`** — wait for a second consumer to confirm this is what they want.

2. **`<AppTheme>` adds a `<MagiProvider>` + `<MagiThemeScope>` two-API pattern** — review's §6.B / §6.C challenge. We don't need it now; one API (`<AppTheme>`) is enough at the app level. Defer until a product genuinely needs nested scopes.

3. **Light theme** — spec §9 says dark-first is canonical. No product asks for light. Defer until asked.

4. **Density primitive (comfortable / compact / dense)** — no product asks. tfi's model table is dense but not "dense mode" dense. Defer.

5. **`<Tooltip>` / `<Switch>` / `<Tabs>` / `<Modal>` / `<Toast>` / `<CommandBar>`** — pattern candidates. None have a real second consumer. Wait per spec §33.

---

## Closing

This review makes 3 substantive changes to v2:

- **FormField bug fix** (must do)
- **@layer in 0.3.0, not 0.5.0** (reschedule)
- **Visual regression in 0.3.0, not 1.0** (reschedule)

It also rejects one speculative concern (useId/SSR — no reproduction).

The rest of v2 stands. The 0.3.0 scope is now larger than v2 proposed but each item is low-cost and high-signal.

Ready for implementation per §17 of `arch_evo-review.md` once this review is approved.