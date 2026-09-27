# MAGI Design System 0.3 — Post-Implementation Architecture Review

| | |
|---|---|
| **Reviewer** | Senior Design System Architect + Frontend Infrastructure Engineer |
| **Date** | 2026-09-27 |
| **Subject** | `@tokyo3rdhq/magi-design-system@0.3.0` |
| **Input documents** | `architecture-v2.md`, `architecture-review-v2.md`, `arch_evo.md`, source code, `dist/styles.css`, package.json |
| **Output** | This document. No code changes — review only. |

**Tagging convention used in this document**:
- **[Observed]** — verified by reading code, dist, or runtime probe
- **[Inferred]** — logically follows from observations but not directly tested
- **[Open Question]** — flagged for the maintainer to investigate

---

## Executive Summary

`@tokyo3rdhq/magi-design-system@0.3.0` **partially implements** the architecture v2 proposal. The headline changes shipped:

| v2 commitment | 0.3 status |
|---|---|
| `<AppTheme>` → context provider, no DOM wrapper | ✅ Shipped |
| `tokens?: Partial<CSSProperties>` removed | ✅ Removed |
| `<FormField>` aria wiring real | ✅ Shipped via `cloneElement` |
| CSS `@layer` adoption | ✅ Shipped; verified in `dist/styles.css` |
| `data-magi-accent` subtree accent | ✅ Shipped; verified in dist |
| Token literal CI enforcement | ✅ Shipped (`scripts/check-tokens.mjs`) |
| 8 ADRs | ✅ Written |
| axe-playwright / visual regression | ❌ **Deferred to 0.4.0** per ADR-0007 |

**Three architectural problems found** that the v2 review did not catch. Two are P0 (real bugs), one is P1 (architectural mismatch).

**Most important finding**: `<AppTheme>`'s React Context claims to scope accent to a subtree, but the CSS implementation sets accent variables on `document.documentElement` (global). **Nested `<AppTheme>` instances do not create CSS subtree scope.** This is a real architectural mismatch between the React mental model and the CSS reality.

**The other P0**: `<AppTheme>`'s `useEffect` has **no cleanup function**. When a nested `<AppTheme>` unmounts, its accent CSS variables remain on `<html>`. The outer theme never restores its own values.

---

## Architecture v2 vs 0.3 Implementation

[Observed] The 0.3 implementation faithfully implements the v2 proposal on the **component surface**:

- `theme.tsx` does not render a `<div>` wrapper. Verified.
- `<FormField>` does `Children.only + cloneElement` to inject `aria-describedby` / `aria-labelledby` / `aria-invalid`. Verified by reading source.
- `dist/styles.css` opens with `@layer magi.reset,magi.tokens,magi.foundation,magi.layout,magi.components;` declaration. Verified.
- `dist/styles.css` contains 8 `[data-magi-app] [data-magi-accent=…]` rules mapping to accent values. Verified.
- Token literal check (`scripts/check-tokens.mjs`) passes with 0 errors / 0 warnings. Verified.
- 8 ADRs in `docs/adr/` document the decisions. Verified.

[Observed] But the implementation has **architectural debt** that v2 did not anticipate:

1. Theme Context vs CSS variable scope mismatch (P0)
2. No `useEffect` cleanup in `<AppTheme>` (P0)
3. Accent source-of-truth duplicated in two places (P1)

---

## P0 — Critical Issues

### P0.1 — `<AppTheme>` React Context claims subtree scope but CSS variables are global

**Evidence** — `packages/design-system/src/theme.tsx`:

```tsx
useEffect(() => {
  if (typeof document === 'undefined') return;
  const tokens = ACCENT_PRESETS[accent];
  const root = document.documentElement;
  root.style.setProperty('--magi-accent', tokens['--magi-accent']);
  // ...
}, [accent, name]);
```

`setProperty` runs against `document.documentElement` (the `<html>` element). CSS variables set on `<html>` cascade through the entire document.

The JSDoc on `<AppTheme>` says:

> **overrides the MAGI accent for a subtree**

This is **false for CSS**. `<AppTheme>`'s *React* tree scope is real (children can call `useAppTheme()` to get the local accent), but the *CSS* scope is global.

**Failure scenario** — nested themes:

```tsx
<AppTheme accent="green">           {/* sets --magi-accent: green on <html> */}
  <App>
    <AppTheme accent="cyan">        {/* sets --magi-accent: cyan on <html> */}
      <SpecialArea />
    </AppTheme>
    <SiblingArea />                      {/* should see green — actually sees cyan */}
  </App>
</AppTheme>
```

When the inner `<AppTheme>` mounts, its effect runs **after** the outer's effect. It overwrites `--magi-accent` on `<html>` to cyan. `SpecialArea` correctly sees cyan. But `<SiblingArea>` (a sibling of the inner, child of the outer) ALSO sees cyan — because the CSS variable is global.

[Inferred] The outer `<AppTheme>`'s `useAppTheme()` returns `'green'` (its Context value). But `SiblingArea` uses CSS variables, so it sees cyan. **Context and CSS disagree**.

**Current behavior** — last-mounted `<AppTheme>` wins for CSS. There is no subtree scope.

**Recommendation** — three options, ranked:

1. **Document the limitation explicitly** in the JSDoc. "`<AppTheme>` is application-level; nested `<AppTheme>` instances will overwrite each other. For subtree accent overrides use `<div data-magi-accent="<name>">`." This is honest but undermines the API.
2. **Make `<AppTheme>` render a wrapper** that scopes CSS vars via a custom selector. This contradicts the v2 decision (which was: drop the wrapper to fix grid breakage).
3. **Use a Stack-of-effects pattern with cleanup** so nested themes can stack properly via the existing global state. This is the right long-term answer — see P0.2.

**Implementation scope**: API rename + JSDoc update, or stack refactor.
**Migration impact**: consumers who nested `<AppTheme>` (none observed) would see correct behavior. Most consumers use it at app root.

---

### P0.2 — `<AppTheme>` `useEffect` has no cleanup function

**Evidence** — same `theme.tsx` snippet:

```tsx
useEffect(() => {
  if (typeof document === 'undefined') return;
  const tokens = ACCENT_PRESETS[accent];
  const root = document.documentElement;
  root.style.setProperty('--magi-accent', tokens['--magi-accent']);
  // ...
  if (name) {
    root.dataset.magiProduct = name;
  } else {
    delete root.dataset.magiProduct;
  }
}, [accent, name]);
```

There is no return value. **No cleanup.**

**Failure scenario** — nested themes:

```tsx
<AppTheme accent="green">
  <SubtreeThatEventuallyRendersInner>
    <AppTheme accent="cyan">
      <Stuff />
    </AppTheme>
  </SubtreeThatEventuallyRendersInner>
</AppTheme>
```

Sequence:

1. Outer mounts. CSS: `--magi-accent: green` on `<html>`.
2. Inner mounts. CSS: `--magi-accent: cyan` on `<html>`.
3. Inner unmounts (because `SubtreeThatEventuallyRendersInner` re-renders without it). **CSS still says cyan. Green never restored.**
4. `SubtreeThatEventuallyRendersInner` now renders `<Stuff />` directly under outer. CSS is cyan — wrong.

**Why current code is fragile**: even without nested themes, **route transitions** can cause similar effects. If `<AppTheme>` is mounted at the page level and the page unmounts during navigation, the cleanup doesn't run (no cleanup was registered). Subsequent pages render with the previous page's accent.

[Observed] The current implementation has no cleanup. The brief in v2 review §7 mentioned "FOUC concern on accent transitions" but didn't catch this.

**Recommendation** — fix in 0.4.0:

```tsx
useEffect(() => {
  // ... existing setProperty calls
}, [accent, name]);
```

becomes:

```tsx
useEffect(() => {
  const tokens = ACCENT_PRESETS[accent];
  const root = document.documentElement;
  root.style.setProperty('--magi-accent', tokens['--magi-accent']);
  // ...
  return () => {
    root.style.removeProperty('--magi-accent');
    root.style.removeProperty('--magi-accent-hover');
    root.style.removeProperty('--magi-accent-soft');
    root.style.removeProperty('--magi-accent-contrast');
    delete root.dataset.magiProduct;
  };
}, [accent, name]);
```

This makes the effect self-cleaning on unmount. **Does not solve the nested-theme overlap problem** (P0.1) but solves the leak problem. The two are independent fixes.

**Implementation scope**: ~10 lines in `theme.tsx` + tests.
**Migration impact**: zero — observable behavior on app-root `<AppTheme>` (the common case) is unchanged.

---

## P1 — Important Issues

### P1.1 — Accent source-of-truth duplicated in two files

**Evidence**:

`packages/design-system/src/theme.tsx` (lines 22-49): the 5 accent presets — `green`, `cyan`, `violet`, `amber`, `white` — defined as raw hex values:

```tsx
green: {
  '--magi-accent': '#00c853',
  '--magi-accent-hover': '#00e676',
  // ...
},
cyan: {
  '--magi-accent': '#38bdf8',
  // ...
},
```

`packages/design-system/src/foundation/globals.css` (lines 86-118): the 8 `data-magi-accent` mapping rules defined inline:

```css
[data-magi-app] [data-magi-accent="green"] {
  --magi-accent: #00c853;
  --magi-accent-hover: #00e676;
}
[data-magi-app] [data-magi-accent="cyan"] {
  --magi-accent: #38bdf8;
  --magi-accent-hover: #7dd3fc;
}
/* etc. */
```

[Observed] Both `theme.tsx` and `globals.css` define the same hex values for the 5 accent presets. **Single source of truth violation.**

**Failure scenario** — adding a new accent:
1. Add to `ACCENT_PRESETS` in `theme.tsx`.
2. Add to `AppAccent` union type in `theme.tsx`.
3. Add a `[data-magi-accent="<new>"]` rule to `globals.css`.
4. Update the token literal check `SELECTOR_ALLOWLIST` if the new accent uses hex.
5. Add to showroom's Phase 4 page.

**5 places.** A consumer who later wants to customize `<AppTheme>` will be confused which file to edit.

**Recommendation** — single source of truth in 0.4.0:

Generate the CSS rules from a single typed map at build time, OR (simpler) keep them in JS and inject `<style>` from the React tree at app mount, OR (lightest) accept the duplication but enforce it via a unit test that fails if the two diverge.

The lightest option — a unit test that asserts every preset in `ACCENT_PRESETS` has a matching `data-magi-accent` rule — is sufficient for the maintenance cost.

**Implementation scope**: 1 test file (~30 lines). No CSS or TS changes.

---

### P1.2 — Token literal check doesn't cover TSX/JS

**Evidence** — `scripts/check-tokens.mjs`:

```js
function* walk(dir) {
  // ...
  } else if (entry.endsWith('.css')) {
    yield full;
  }
}
```

The walker only visits `.css` files. Inline styles in `.tsx` / `.ts` files are not checked.

[Observed in current source] This is currently fine — no `.tsx` file contains raw hex literals inline. But it's a future-proofing gap: a contributor could write `style={{ color: '#fff' }}` and the script would silently approve.

**Recommendation** — extend the script in 0.4.0:

```js
} else if (entry.endsWith('.css') || entry.endsWith('.tsx') || entry.endsWith('.ts')) {
  yield full;
}
```

But exclude `theme.tsx` (which legitimately has accent hex values as data) and `tokens/` (no JS there). The current `tokens/*` allowlist still applies.

**Implementation scope**: 5 lines.
**Migration impact**: zero.

---

### P1.3 — `<FormField>` `cloneElement` overwrites consumer's ARIA attributes

**Evidence** — `packages/design-system/src/components/FormField/FormField.tsx`:

```tsx
if (isValidElement<ChildProps>(children)) {
  const existing = children.props;
  enhanced = cloneElement(children, {
    id: existing.id ?? fieldId,
    'aria-describedby': hasMessage ? describedById : undefined,
    'aria-labelledby': labelId,
  });
}
```

The pattern: use the consumer's `id` if they provided one, otherwise generate. **But `aria-describedby` is unconditional** — always overwrite.

**Failure scenario**:

```tsx
<FormField label="Notes" helper="Markdown supported">
  <Textarea
    aria-describedby="existing-external-help"
    id="my-notes"
  />
</FormField>
```

After FormField's `cloneElement`, the `aria-describedby` is **overwritten** to the generated `describedById`. The consumer's external help reference is **lost**.

[Observed] This is a real bug. The current code preserves the consumer's `id` but overwrites `aria-describedby`, `aria-labelledby`, and `aria-invalid`. It should **merge** by combining IDs (space-separated, per ARIA spec):

```tsx
'aria-describedby': [
  existing['aria-describedby'],
  hasMessage ? describedById : undefined,
].filter(Boolean).join(' ') || undefined,
```

This would:
- Preserve consumer-supplied IDs (e.g. external help)
- Add FormField's helper ID when present
- Match WAI-ARIA spec for multi-value `aria-describedby`

[Inferred] `aria-labelledby` is similar — currently always overwritten with the generated labelId, which is fine in 99% of cases but breaks if the consumer provided their own.

`aria-invalid` is boolean-only — no merge concern.

**Recommendation** — fix in 0.4.0:

| Attribute | Current behavior | Correct behavior |
|---|---|---|
| `id` | preserved if provided, else generated | ✅ already correct |
| `aria-describedby` | overwritten | **merge** (space-separated) |
| `aria-labelledby` | overwritten | merge (but typically consumer doesn't supply) |
| `aria-invalid` | always set when error | ✅ correct |

**Implementation scope**: ~10 lines in FormField.
**Migration impact**: fixes a real bug for consumers who pass external ARIA references.

---

### P1.4 — First-paint flash on accent transition

[Observed] `<AppTheme>` uses `useEffect`, which runs **after** the first paint. On the first render of any page that uses `<AppTheme accent="cyan">`, the user sees the default green accent for one frame, then cyan.

[Inferred] For most consumers this is one frame (16ms at 60fps) and imperceptible. For SSR — `useEffect` does not run on the server, so the server-rendered HTML has the default green. After hydration, the effect runs and switches to cyan.

**Failure scenario** — slow devices, slow networks, or pages where the accent is visible early (large primary buttons):
- 100-200ms flash of green on initial load of a cyan-accented product
- Hydration-time layout shift (CLS) if button widths change

**Recommendation** — three options:

1. **Accept the flash for 0.4.0**. Document the behavior. Most consumers won't notice.
2. **Use `useInsertionEffect`** (runs synchronously after mutation, before paint). React 18+. Available now.
3. **Use inline `<style>` element** in the render output to set the accent before paint. Loses the headless benefit (can't reuse React state for accent).

Option 2 is the cleanest:

```tsx
useInsertionEffect(() => {
  // ... setProperty calls
}, [accent, name]);
```

This runs synchronously after the DOM is updated but **before** the browser paints. Eliminates the flash for CSR. SSR still has the issue (useInsertionEffect doesn't run on server) but you can guard with `typeof window !== 'undefined'`.

**Implementation scope**: 1 line change.
**Migration impact**: zero observable for non-flashing transitions; eliminates flash for cyan/violet/amber.

---

### P1.5 — `dist/styles.css` includes `src/styles/index.css` via `files` field

**Evidence** — `packages/design-system/package.json`:

```json
"files": ["dist", "src/styles", "README.md"]
```

[Observed] `src/styles/index.css` is published as source. Consumers who `import '@tokyo3rdhq/magi-design-system/src/styles/index.css'` would get unprocessed source (no Vite bundling, no PostCSS layer wrapping). This is harmless but messy.

**Recommendation** — fix in 0.4.0:

```json
"files": ["dist", "README.md"]
```

Drop `src/styles` from `files`. Consumers should use `./styles.css` (mapped to `dist/styles.css`).

**Implementation scope**: 1-line JSON change.

---

## P2 — Architecture Decisions

These are real decisions that should be made before 1.0. They don't require code changes yet, but they should be defined as contracts in `docs/adr/` or component JSDoc.

### P2.1 — Define the FormField child contract formally

The brief §9 asks: what controls does FormField officially support? Current code accepts any single React element and wires 4 ARIA attributes. There's no formal contract.

[Open Question] Current behavior is **what works**: cloneElement injects props, child must accept them. FormField would silently mis-wire if a child doesn't pass through the `aria-describedby` prop.

Concrete contract proposal (just JSDoc, no behavior change):

```ts
/**
 * FormField — child must be a single React element that:
 * - Accepts an `id` prop (for label htmlFor association)
 * - Accepts `aria-describedby`, `aria-labelledby`, `aria-invalid` props
 * - Forwards them to its underlying focusable element
 *
 * Officially supported children:
 * - <Input> (this package)
 * - Native <input>, <textarea>, <select>
 * - <Segmented> (this package — see notes below)
 *
 * Not officially supported (wiring may break silently):
 * - Compound components that don't forward props
 * - Multiple children (use a wrapper)
 *
 * For <Segmented>: aria-describedby points to the helper, but the
 * Segmented item buttons themselves don't get individual descriptions.
 * The association is at the group level, not the option level.
 */
```

**Implementation scope**: JSDoc only.
**Migration impact**: documents existing limitation.

---

### P2.2 — Define the state token vocabulary formally

The brief §18 asks about state tokens (default / hover / focus / selected / disabled / etc.).

[Observed] Currently states are expressed in component CSS:
- Button: hover via `:hover`, disabled via `:disabled`, loading via `.magi-button--loading`, focus via `:focus-visible`
- Input: hover via `:hover`, focus via `:focus-visible`, disabled via `:disabled`, invalid via `.magi-input--invalid`
- Segmented: active via `.magi-segmented-item--active`, accent via `.magi-segmented-item--accent`, disabled via `:disabled`
- Checkbox: `:checked`, `:disabled`, `:focus-visible`

[Inferred] Each component picks its own subset of states. There's no shared vocabulary — `state="focused"` isn't a defined thing.

**Recommendation** — define a shared state vocabulary at the ADR level, but **don't** change component CSS:

```text
interaction states (subset applied per component):
- default     — initial render
- hover       — pointer over (interactive only)
- active      — being pressed (interactive only)
- focus       — keyboard focus received
- disabled    — non-interactive
- loading     — async operation in progress
- selected    — chosen from a group
- invalid     — failed validation
- readonly    — value locked but copyable
```

Each component picks the subset that makes sense for it. A future consumer can grep for `magi-` class names + state-related selectors.

**Implementation scope**: ADR document (`docs/adr/0009-state-vocabulary.md`).
**Migration impact**: zero. Documentation only.

---

### P2.3 — Establish a cascade contract for consumers

The brief §7.2 asks: can consumers override spacing / typography / tokens / global foundation?

[Observed] Today's answer is implicit: consumers can write any CSS unlayered and it wins on cascade (per `@layer` declaration). No formal policy.

**Recommendation** — write the policy explicitly:

| What consumers can override | Allowed? | How |
|---|---|---|
| Component colors / spacing within their own context | ✅ Allowed | Unlayered CSS |
| Component token values (e.g. `--magi-accent`) | ❌ Discouraged | Use `<AppTheme>` or `data-magi-accent="..."` |
| Foundation body bg / scrollbar | ❌ Discouraged | Override only at the `<html>` level before the design system loads |
| Token values (`--magi-space-4` etc.) | ❌ Discouraged | These are design language; redesign the system, not the consumer |

**Implementation scope**: Add to ADR-0001 or new ADR (`docs/adr/0010-cascade-policy.md`).
**Migration impact**: zero.

---

## P3 — Future Evolution

These are explicit deferrals per the v2 review and earlier ADRs. They are not issues with 0.3.

### P3.1 — `body[data-magi-app]` → `html[data-magi-app]` rename at 0.5.0

Per ADR-0002: defer until a second consumer needs the broader scope. Currently 2 consumers (magi-portal, tfi) both put the attribute on `<body>` — which works.

[Observed] Migration is mechanical — consumers change `<body data-magi-app>` to `<html data-magi-app>`. Cost: ~1 line per consumer.

### P3.2 — Light theme

Per ADR-0001: defer until asked. Spec §9 says dark-first is canonical.

### P3.3 — Density modes (comfortable / compact / dense)

Per ADR-0001: defer. No current consumer asks.

### P3.4 — Icon system

Per ADR-0004: defer. Only GitHub SVG in magi-portal, zero icons in tfi.

### P3.5 — `useAppTheme()` Context nesting verification

[Open Question] The Context implementation is straightforward React Context. Nesting should work — `useContext` walks the tree upward and finds the nearest provider. But I haven't tested this with a real nested scenario. **Worth adding a Playwright test in 0.4.0.**

---

## Theme Architecture

### Current state

```text
React Context (AppThemeContext)
    ↓
provides { accent: AppAccent } to useAppTheme()

CSS custom properties on <html>
    ↓
consumed by component CSS via var(--magi-accent)

data-magi-accent="..." subtree attribute
    ↓
CSS rules in globals.css override var(--magi-accent) at subtree level
```

### Architectural mismatch

The brief §3 frames this correctly: **React scope ≠ CSS scope**.

- Context claims subtree scope (the JSDoc says "for a subtree")
- CSS variables are global (set on `<html>`)
- `data-magi-accent="..."` provides subtree CSS scope, but via a different attribute, not via Context

A consumer who calls `useAppTheme()` inside a nested `<AppTheme>` gets the inner accent (correct React behavior). The CSS in that subtree also reads the inner accent (because the inner's effect overwrote `<html>`). **But siblings outside the inner subtree ALSO read the inner accent** (because the CSS variable is global).

This means:
- `<AppTheme>` is **effectively an app-level theme**, not a subtree theme
- For real subtree accent overrides, use `<div data-magi-accent="...">` (which doesn't go through React Context at all)

The component name is misleading.

### Recommendation for 0.4.0

**Rename**: `<AppTheme>` → `<AppTheme>`. Communicates the actual scope (app-level) and avoids the "subtree" claim.

**Keep**: `data-magi-accent="..."` for subtree overrides (no React involvement).

**Update JSDoc**: explicitly state `<AppTheme>` is app-level. For subtree overrides, use the attribute pattern.

**Implementation scope**: rename + JSDoc + exports update. Mechanical.

---

## CSS Architecture

### Layer model verified in dist

[Observed] `dist/styles.css` opens with:

```css
@layer magi.reset,magi.tokens,magi.foundation,magi.layout,magi.components;@layer magi.tokens{...}@layer magi.reset{...}@layer magi.foundation{...}@layer magi.layout{...}@layer magi.components{...}×9
```

Layer blocks: 21 occurrences of `@layer X{` (1 declaration + 21 blocks, but the declaration uses `;` not `{`).

The cascade order is declared at the top, then layer blocks follow. **Source order is irrelevant for cascade** — the declaration establishes priority.

### Cascade contract (verified)

```text
Browser defaults
    ↓ @layer magi.reset
    ↓ @layer magi.tokens
    ↓ @layer magi.foundation
    ↓ @layer magi.layout
    ↓ @layer magi.components
    ↓ Consumer unlayered styles (always win)
```

This matches the brief §7.1. Confirmed in dist.

### Caveat

[Inferred] The `@layer` declaration order in the file is correct, **but** the `@import` statements at the top of `styles/index.css` ensure the order is processed correctly. If a consumer imports `@tokyo3rdhq/magi-design-system/styles.css` directly, they get the layer-declaration-then-layer-blocks in the right order. If a consumer imports the React components and they each have their own `<style>` tag (we don't), that could interleave. **Not a real concern today** because there's no runtime style injection.

---

## Token Architecture

### Token literal CI working

[Observed] `scripts/check-tokens.mjs` enforces:
- ❌ MUST NOT: hex / rgb / rgba in component CSS
- ⚠️ SHOULD warn: hardcoded px font sizes, ms durations
- ✅ LOCAL CONSTANT allowed: 1px borders, 2px ring offsets, translate transforms, color-mix()

Passes with 0 errors / 0 warnings on current source.

### Blind spots

[Observed] The script only walks `.css` files. JS / TSX literals (e.g. `style={{ color: '#fff' }}`) are not checked. (See P1.2.)

### Logical taxonomy

[Observed] Current tokens are flat semantic — `--magi-bg-base`, `--magi-text-primary`, etc. No primitive / semantic / component split.

Per ADR-0001: stay flat. The implicit dependency direction (component CSS → semantic tokens → raw values) is documented.

### Future: state tokens

Per P2.2: define a state vocabulary at the ADR level. Components pick their subset.

---

## Component Contracts

### Per-component check (high level)

| Component | Semantic HTML | ARIA | Keyboard | Focus | Token-driven |
|---|---|---|---|---|---|
| Button | `<button>` | `aria-busy`, `aria-disabled` | ✅ | ✅ | ✅ |
| Card | `<div>` | none | n/a | n/a | ✅ |
| Badge | `<span>` | none | n/a | n/a | ✅ |
| Checkbox | native `<input>` | `aria-label` | ✅ | ✅ | ✅ |
| Input | native `<input>` | `aria-invalid` (via FormField) | ✅ | ✅ | ✅ |
| FormField | `<div>` + `<label>` | `aria-describedby`, `aria-labelledby` | n/a | n/a | ✅ |
| Segmented | `role="radiogroup"` + `role="radio"` | `aria-checked`, `aria-label` | ⚠️ arrow keys not implemented | ✅ | ✅ |
| Banner | `<div>` | `role="alert"` / `role="status"` | n/a | n/a | ✅ |
| EmptyState | `<div>` | none | n/a | n/a | ✅ |

**Issues found**:

- ⚠️ **Segmented keyboard navigation**: `<Segmented>` uses `role="radiogroup"` + `role="radio"` per ARIA pattern, which **requires** arrow key navigation (left/right to move selection, Home/End for first/last). Current code only handles mouse click. [Observed] — verified in `Segmented.tsx`: no `onKeyDown` handler.

  **Recommendation**: add `onKeyDown` to handle ArrowLeft / ArrowRight / Home / End. Standard WAI-ARIA Authoring Practices for radio group pattern.

- ✅ Button / Checkbox / Input have proper focus rings via `:focus-visible` + `--magi-focus-ring`.

- ✅ FormField auto-wires ARIA on the child (P0/P1.3 aside).

---

## Accessibility

### Current state

[Observed] No automated a11y tests in CI. `axe-core` not integrated. Manual verification only.

Per ADR-0007: deferred to 0.4.0.

### Test matrix (proposed for 0.4.0)

| Component | axe checks | Keyboard | Focus | SR |
|---|---|---|---|---|
| Button | label, name | Enter/Space | visible ring | n/a |
| Checkbox | label, name | Space | visible ring | state announced |
| Input | label, name | n/a | visible ring | error announced |
| FormField | label/control association, describedby | n/a | n/a | helper/error announced |
| Segmented | radiogroup semantics | arrows + Home/End | visible ring | selection announced |
| Banner | role attribute | n/a | n/a | alert announced |
| EmptyState | n/a | n/a | n/a | n/a |

### Per-component gap

| Gap | Severity | Where |
|---|---|---|
| Segmented arrow keys | P2 | `Segmented.tsx` — no `onKeyDown` |
| Skip-link for nav | P3 | Layout primitive |
| Live regions (status updates) | P3 | Banner already does `role="status"` / `role="alert"` |

---

## Testing Architecture

### Current

```text
scripts/check-tokens.mjs    — CSS literal check
npm run typecheck           — tsc --noEmit (zero errors)
npm run build               — vite build + tsc declarations
```

[Observed] CI runs the above. No unit / integration / a11y / visual tests.

### Recommended pyramid (per brief §15)

```text
                     Visual (Playwright)
                    /                \
              Interaction           A11y (axe)
               /                        \
            Unit (vitest)            Contract (consumer)
                     \                /
                          Build (current)
```

### Per-bucket plan

| Bucket | Tool | Status | Target |
|---|---|---|---|
| **Build** | `vite build` + `tsc --noEmit` | ✅ Shipped | 0.3.0 |
| **Unit** | `vitest` + `@testing-library/react` | ❌ | 0.4.0 |
| **Contract** | consumer repo builds against published `@0.x` | ❌ | 1.0 |
| **A11y** | `@axe-core/playwright` | ❌ | 0.4.0 |
| **Interaction** | `playwright` keyboard / focus / reduced-motion | ❌ | 0.4.0 |
| **Visual** | `playwright` `toMatchSnapshot` | ❌ | 0.4.0 |

---

## Package Architecture

### `package.json` exports

[Observed] `exports`:

```json
".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
"./styles.css": "./dist/styles.css"
```

Two entries. Clean.

### `files` field

[Observed] `files: ["dist", "src/styles", "README.md"]`.

`src/styles/index.css` is published as source. **Minor source leak** (P1.5).

### Side effects

```json
"sideEffects": ["**/*.css"]
```

[Observed] Correct — CSS imports are side effects for the bundler.

### Peer dependencies

```json
"peerDependencies": { "react": "^18.0.0", "react-dom": "^18.0.0" }
```

[Observed] Per ADR-0006: expand to `^18 || ^19` as minor when a consumer asks. Not now.

### `npm pack` contents

[Open Question] I didn't run `npm pack` in this review. Per brief §13, should verify only intended files land in the tarball. **Recommend running `npm pack && tar -tzf *.tgz` before publishing 0.4.0.**

---

## Showroom Architecture

### Current state

`apps/showroom` has 7 pages: Tokens, Typography, Buttons, Cards, Badges, Layout, Phase 4.

[Observed] Per brief §14: showroom is currently "demo page" status, not "design system contract surface".

### Recommendation

Convert showroom into a **contract surface** with three concrete additions in 0.4.0:

1. **Variant matrix per primitive** — each primitive gets a grid of variants × states × sizes
2. **Keyboard interaction demos** — Segmented arrow keys, Banner focus order, etc.
3. **Reduced motion demos** — each interactive primitive shown under `prefers-reduced-motion`

This is the visible part of ADR-0007. Implementation is light: ~5-10 new showcase sections in existing pages.

---

## Documentation Consistency

| Statement | Source | Reality |
|---|---|---|
| `<AppTheme>` overrides accent **for a subtree** | `theme.tsx` JSDoc | ❌ False — sets accent on `<html>`, no subtree CSS scope (P0.1) |
| `<FormField>` wires `aria-describedby` | `FormField.tsx` JSDoc | ⚠️ Partially — wires via `cloneElement`, but **overwrites** consumer's `aria-describedby` (P1.3) |
| 13 primitives shipped | CHANGELOG, README | ✅ Verified |
| `dist/styles.css` is 24.17 kB | README, CHANGELOG | ✅ Verified |
| Per spec §9, dark-first canonical | CHANGELOG, ADR-0001 | ✅ Documented |
| No use of Tailwind / Radix / Storybook | spec §34 + README | ✅ Verified |
| Tokens are flat (no primitive/semantic/component split) | README, ADR-0001 | ✅ Documented |
| Theme DOM wrapper is removed in 0.3.0 | README, CHANGELOG, migration-guide | ✅ Verified |
| Token literal CI runs in CI | README | ✅ Verified |
| `body[data-magi-app]` is the scope contract | README, ADR-0002 | ⚠️ Should be `html[data-magi-app]` at 0.5.0 (deferred) |

One real divergence found: `<AppTheme>` JSDoc says "subtree" but behavior is "global via `<html>`". Fix in 0.4.0 (rename or JSDoc update per P0.1).

---

## Recommended 0.4 Roadmap

### MUST FIX

- **P0.2**: Add `useEffect` cleanup to `<AppTheme>` to avoid accent-leak on unmount.
- **P1.3**: Fix `<FormField>` `aria-describedby` / `aria-labelledby` to **merge** instead of overwrite.
- **P0.1**: Either rename `<AppTheme>` to `<AppTheme>` (clarify scope) OR add JSDoc warning about nested-theme behavior.
- **P2 keyboard nav**: Add `onKeyDown` to `<Segmented>` for arrow / Home / End / Space.

### SHOULD FIX

- **P1.1**: Single source of truth test for accent (unit test that asserts preset values match `data-magi-accent` CSS rules).
- **P1.2**: Extend token literal check to cover `.tsx` / `.ts` files (exclude `theme.tsx` allowlist).
- **P1.4**: Switch `useEffect` to `useInsertionEffect` for accent setter (eliminates first-paint flash on transition).
- **P1.5**: Drop `src/styles` from `files` in `package.json`.
- **P2.1**: Document FormField child contract formally in JSDoc.
- **P2.2**: Define state token vocabulary in new ADR (`docs/adr/0009-state-vocabulary.md`).
- **P2.3**: Define cascade contract for consumers in new ADR (`docs/adr/0010-cascade-policy.md`).

### SHOULD DEFINE

- **axe-playwright** integration for the showroom's Phase 4 page.
- **Playwright** keyboard + focus + reduced-motion tests.
- **Playwright** visual regression (~70 baseline snapshots).
- **vitest** + @testing-library/react unit tests for state-bearing components.
- **`npm pack` verification** in CI (`npm pack && tar -tzf *.tgz | sort > files.txt && diff files.txt expected.txt`).
- **FormField `data-magi-accent="danger"` semantics** — should it generate an `aria-invalid="true"` on the child automatically? Currently it doesn't.

### CAN DEFER

- **Scope rename** `body` → `html[data-magi-app]` (ADR-0002, 0.5.0).
- **Light theme** (spec §9).
- **Density primitive** (per ADR-0001).
- **Icon system** (per ADR-0004).
- **State machine library** for primitives with state (XState / Zustand).

### DEFER (NEVER UNLESS NEEDED)

- **@magi/design-tokens** package split (per ADR-0004 — 0 of 5 criteria met).
- **Tailwind / Radix / shadcn / Storybook / Style Dictionary / code generation** (per spec §4 + §34).
- **CSS-in-JS / animation libraries** (per spec §34).
- **Light theme primitive** (per spec §9).
- **Plugin architecture / theme inheritance** (premature abstraction).

---

## Revised Architecture Principles

(Refined from 0.3.0's principles to address this review's findings.)

1. **MAGI owns the visual language; products own the experience.**
2. **The Design System major version is driven by our contract changes, not upstream React.**
3. **CSS variables are the styling runtime; React Context is the configuration runtime.** (0.3.0 conflates these — see P0.1.)
4. **`<AppTheme>` (formerly `<AppTheme>`) is application-level accent configuration, not subtree.** Subtree overrides use `data-magi-accent="..."`.
5. **Token governance protects the design language from literal drift, not arbitrary numeric values.**
6. **Package boundaries follow dependency boundaries, not directory structure.**
7. **Accessibility is part of the component API contract, not a post-hoc testing phase.**
8. **Cascade order is an architectural concern, not a source-order accident. Use `@layer`.**
9. **Effects must have cleanup functions** when they mutate global state. Side-effect leaks fail silently.
10. **ARIA wiring must merge, not overwrite, consumer-supplied attributes.**
11. **Extract abstractions only after semantic reuse is proven across 2+ consumers.**
12. **Visual regression protects the design language, not the product. Set it up early.**

Principles 3, 4, 9, 10 are new for 0.4.0.

---

## Open Questions

1. **Should `<AppTheme>` keep its name or be renamed to `<AppTheme>`?** (See P0.1.) The rename is honest but breaking. The JSDoc update is honest and non-breaking.
2. **Should we add a `Stack` `<AppTheme>` pattern using `<style>` injection** instead of `setProperty`, for SSR cleanliness? Trade-off: more code, simpler reasoning.
3. **Should `<Segmented>` support `multi` mode despite the H2a feedback?** No — the H2a fix was correct. Multi-segmented is an anti-pattern.
4. **Should `data-magi-accent` generate `aria-invalid` automatically** when `danger`/`warning`/`success` are used inside `<FormField>`? No — that's mixing concerns. The `data-magi-accent` is a CSS-only affordance.
5. **Should we publish `dist/` only and remove `src/` from the package entirely?** Not necessary — `files: ["dist"]` excludes `src/*`. Current setup is correct, just needs `src/styles` removed (P1.5).

---

## Top 5 issues to fix before 0.4

1. **P0.2** — Add `useEffect` cleanup to `<AppTheme>`. Real bug, 10-line fix.
2. **P0.1** — Either rename `<AppTheme>` to `<AppTheme>` OR add explicit JSDoc warning about nested behavior. Either fixes the architectural mismatch.
3. **P1.3** — Fix `<FormField>` `aria-describedby` to merge, not overwrite. Real bug for consumers who supply external ARIA references.
4. **P2 keyboard nav** — `<Segmented>` arrow key handling. Real WAI-ARIA conformance gap.
5. **P1.1** — Single source of truth test for accent values. Unit test, ~30 lines. Prevents future drift.

## Top 5 issues to define before 1.0

1. **Scope rename** `body` → `html[data-magi-app]` (0.5.0 per ADR-0002).
2. **FormField child contract** formalized in JSDoc (P2.1).
3. **State token vocabulary** defined in ADR (P2.2).
4. **Cascade contract for consumers** defined in ADR (P2.3).
5. **Consumer contract tests** — magi-portal + tfi build against published `@1.0` in CI (catches breakage at the consumer boundary).

## Top 5 things NOT to change

1. **`<AppTheme>` sets accent on `<html>`** — global is the right design. Don't switch to per-element wrappers (would re-introduce the layout breakage 0.3.0 fixed).
2. **Token literal CI check format** — three-tier (MUST / SHOULD / LOCAL CONSTANT) is correct. Don't add complexity.
3. **Single CSS bundle, not per-component CSS** — `dist/styles.css` at 24 kB is well under any reasonable budget. Don't split.
4. **Flat token architecture** — primitive / semantic / component split would be ceremony. Don't do it.
5. **`<FormField>` single-component API, not compound** — `FormField.Label` / `FormField.Control` would be over-engineering. Single API is enough.