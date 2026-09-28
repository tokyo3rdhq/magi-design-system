# Component Contracts

> **Layer 4** of the [framework-agnostic architecture](./architecture-review-framework-agnostic.md): the framework-agnostic definition of what each MAGI component **means** — semantic structure, accessibility, states, and token binding.
>
> **CSS class names are NOT part of the contract.** They belong to the Web/CSS Implementation layer (Layer 5). Optimizing a selector (e.g. `.magi-button--primary` → `.magi-button[data-variant="primary"]`) is an implementation change, not a contract change.

Each contract has four sections:

1. **Semantic structure** — what DOM element(s) the component renders
2. **Accessibility** — keyboard interactions, ARIA attributes, focus behavior
3. **Visual states** — states the component must visually express
4. **Token binding** — which `--magi-*` CSS variables the component must read

---

## Table of contents

- Layout primitives: [Container](#container) · [Section](#section) · [Stack](#stack)
- UI primitives: [Button](#button) · [Card](#card) · [Badge](#badge)
- Form primitives: [Input](#input) · [FormField](#formfield) · [Checkbox](#checkbox) · [Segmented](#segmented)
- Feedback: [Banner](#banner) · [EmptyState](#emptystate)
- Brand: [MagiMark](#magimark) · [MagiWordmark](#magiwordmark) · [MagiLockup](#magilockup)
- Theme: [AppTheme](#apptheme) · [useAppTheme](#useapptheme) · [data-magi-accent](#data-magi-accent-subtree) · [data-magi-theme](#data-magi-theme-subtree)

---

## Layout primitives

### Container

**Semantic structure**

- Single block container (`<div>` by default; `as` prop allows `<section>`, `<article>`, `<main>`, `<header>`, `<footer>`, `<aside>`).
- Renders no extra wrapper divs around its children.
- Children rendered as direct descendants.

**Accessibility**

- No implicit role. Consumers may set `role` on the rendered element when needed.
- No interactive elements inside Container; consumers compose them.

**Visual states**

- None. Container is purely structural.

**Token binding**

- `max-width` (per size token): `--magi-container-{sm|md|lg|xl|wide|full}`
- Horizontal centering: `margin-inline: auto`
- Horizontal padding (consumed by children, not by Container itself)

---

### Section

**Semantic structure**

- Block-level container. Default `<section>` element; `as` prop allows `<div>`, `<article>`, `<main>`, etc.
- Renders no extra wrapper divs.

**Accessibility**

- If `as="section"` (default), consumers may add an accessible name via `aria-labelledby` or `aria-label`.
- If `as` is non-semantic, consumer must handle landmark semantics.

**Visual states**

- None. Section is purely structural.

**Token binding**

- Vertical spacing (per spacing tier): `--magi-space-{12|20|32|40}`
- Surface tone: `--magi-bg-base` (default), `--magi-bg-raised`, `--magi-bg-elevated`

---

### Stack

**Semantic structure**

- Single flex container. Default `<div>`; `as` prop allows other block elements.
- Children rendered as direct flex items.

**Accessibility**

- No implicit role. Consumers may wrap groups of related controls (e.g. radio group) in a Stack and set `role="radiogroup"` on it.

**Visual states**

- None.

**Token binding**

- `gap` (per gap tier): `--magi-space-{0|1|2|3|4|5|6|8|10|12|16}`
- Flexbox properties: `display: flex`, `flex-direction`, `align-items`

---

## UI primitives

### Button

**Semantic structure**

- Native `<button>` element. Not a `<div>` or `<a>`.
- Default `type="button"` (does **not** submit forms unless the consumer overrides).

**Accessibility**

- Keyboard: `Space` and `Enter` activate (native button behavior).
- `:focus-visible` ring (uses `--magi-focus-ring`).
- `aria-busy="true"` when `loading={true}`.
- `disabled` attribute set when `disabled || loading`. (Consumers do not need to add `aria-disabled`; the native `disabled` attribute is the source of truth.)
- Consumers may pass `aria-label` to override the visible text.

**Visual states**

- `:hover` — surface tone shift (per variant).
- `:active` — subtle press feedback.
- `:focus-visible` — focus ring.
- `:disabled` — reduced opacity + cursor: not-allowed.
- `loading` — spinner icon + `disabled` + `aria-busy`.

**Token binding**

- Color: `--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast`, `--magi-text-primary`, `--magi-text-inverse`
- Radius: `--magi-radius-full` (pill)
- Spacing: `--magi-space-{2|3|6}`, `--magi-font-size-{label|body|body-sm}`, `--magi-leading-{tight|normal}`
- Motion: `--magi-duration-fast`, `--magi-ease-standard`
- Focus: `--magi-focus-ring`

---

### Card

**Semantic structure**

- Single block container. Default `<div>`; `as` prop allows `<article>`, `<section>`, etc.
- No wrapper inside Card; the consumer's children are direct descendants.

**Accessibility**

- No implicit role. Consumers must set `role` on the rendered element when grouping related content.
- For clickable cards, the consumer must compose with `<a>` / `<button>` and provide an accessible name. `<Card variant="interactive">` does NOT make the card focusable or keyboard-activatable by itself.

**Visual states**

- Default — surface tone.
- `elevated` — slightly raised surface tone + border.
- `interactive` — `:hover` (border lift + surface darken), `:active` (1 px lift).

**Token binding**

- Surface: `--magi-bg-card`, `--magi-border`, `--magi-border-strong`
- Radius: `--magi-radius-{md|lg|xl}`
- Spacing: `--magi-space-{4|6|8|10}` (per `padding` tier)
- Motion (interactive only): `--magi-duration-fast`, `--magi-ease-standard`

---

### Badge

**Semantic structure**

- Single inline-level element. Default `<span>`.
- No internal structure beyond children + optional dot indicator.

**Accessibility**

- No implicit role. Screen-reader meaning comes from the text content of the Badge.
- If the Badge is purely decorative (e.g. next to a status that already has a label), consumers should set `aria-hidden="true"` on the Badge.
- For status semantics (success / warning / error / info), prefer `<Banner>` or a text label, not `<Badge>` alone.

**Visual states**

- Default — neutral / accent / semantic tone based on variant.
- `dot` — leading dot indicator in the semantic tone.

**Token binding**

- Color (per variant): `--magi-accent`, `--magi-success`, `--magi-warning`, `--magi-error`, `--magi-text-secondary`
- Background: `color-mix(in srgb, var(--magi-*) N%, transparent)` for soft tones
- Radius: `--magi-radius-full`
- Typography: `--magi-font-size-label`, `--magi-font-weight-medium`

---

## Form primitives

### Input

**Semantic structure**

- Wraps a native `<input>` element. The consumer's `type` prop is forwarded.
- A label MUST be supplied via `<FormField label="...">` or an external `<label htmlFor="...">`.

**Accessibility**

- Keyboard: native input behavior (Tab to focus, native typing).
- `:focus-visible` ring.
- `aria-invalid="true"` when `invalid={true}` (consumer should also surface the error via `<FormField error="...">` for screen-reader text).

**Visual states**

- Default — `--magi-bg-base` background, `--magi-border` border.
- `:hover` — subtle border lift.
- `:focus` — `--magi-focus-ring`.
- `:disabled` — reduced opacity + cursor: not-allowed.
- `invalid` — `--magi-error` border.

**Token binding**

- Color: `--magi-bg-base`, `--magi-border`, `--magi-border-strong`, `--magi-text-primary`, `--magi-placeholder`, `--magi-error`
- Radius: `--magi-radius-md`
- Spacing: `--magi-space-{2|3}`, `--magi-font-size-{body|body-sm|label}`
- Focus: `--magi-focus-ring`

---

### FormField

**Semantic structure**

- Container `<div>` wrapping the `<label>`, the child control, and (optional) a helper/error `<span>`.
- Renders exactly one label + one control + zero or one helper/error element.
- The label's `<input>` references the control's `id`; the helper/error's `<span>` `id` is referenced by the control's `aria-describedby`.

**Accessibility**

- `<label htmlFor="<control-id>">` wires the label to the child control.
- `aria-describedby="<helper-id>"` is wired to the child control (only when helper or error is present).
- `aria-invalid="true"` is set on the child control when `error` is present.
- **Consumer-supplied ARIA attributes are merged, not overwritten.** If the consumer passes `aria-describedby="external-help"`, the result is `"external-help <generated-helper-id>"`.
- The child MUST be a single focusable element. If `children` is not a single React element, the ARIA wiring is skipped (label + helper still render).

**Visual states**

- `error` — helper text styled in `--magi-error` color + child control gets `invalid` border tone.
- `helper` (no error) — neutral helper text.
- Neither — no helper element rendered.

**Token binding**

- Color: `--magi-text-primary` (label), `--magi-text-tertiary` (helper), `--magi-error` (error)
- Typography: `--magi-font-size-label`, `--magi-font-size-body-sm`
- Spacing: `--magi-space-{1|2}` between label / control / helper

---

### Checkbox

**Semantic structure**

- Wraps a native `<input type="checkbox">`. The native input receives all focus / checked visuals.
- A `<label>` wraps the visible label + native input for click target expansion.

**Accessibility**

- Keyboard: `Space` toggles checked / unchecked (native input behavior).
- `:focus-visible` ring on the native input.
- `checked` is reflected by the native input's `checked` attribute / property.
- The native input MUST be the source of truth for the checkbox state. Custom indicators (the visible tick) are decoration; screen readers ignore them.

**Visual states**

- Unchecked — empty.
- `:hover` (unchecked) — border lift.
- Checked — filled with `--magi-accent`.
- `:focus-visible` — focus ring on the native input.
- `:disabled` — reduced opacity.

**Token binding**

- Color: `--magi-accent`, `--magi-bg-base`, `--magi-border`, `--magi-text-primary`
- Focus: `--magi-focus-ring`
- Radius: `--magi-radius-sm`

---

### Segmented

**Semantic structure**

- Container with `role="radiogroup"`. Each option is `role="radio"`.
- Aria-labelled: the consumer must provide an accessible name via `<FormField label="...">` or an external label.

**Accessibility**

- Keyboard (full WAI-ARIA radio group pattern):
  - `ArrowRight` / `ArrowDown` — select + focus next enabled option (wraps)
  - `ArrowLeft` / `ArrowUp` — select + focus previous enabled option (wraps)
  - `Home` — select + focus first enabled option
  - `End` — select + focus last enabled option
  - `Tab` — moves into / out of the group as a single tab stop (only the selected option has `tabIndex={0}`)
- Disabled options are skipped during navigation.
- The selected option has `aria-checked="true"`; others have `aria-checked="false"`.

**Visual states**

- Unselected — `--magi-bg-base` background.
- `:hover` (unselected) — subtle background shift.
- Selected — `--magi-accent-soft` background + `--magi-text-primary` text.
- `:focus-visible` — focus ring on the focused option.
- `:disabled` (option level) — reduced opacity + cursor: not-allowed.

**Token binding**

- Color: `--magi-accent`, `--magi-accent-soft`, `--magi-bg-base`, `--magi-border`, `--magi-text-primary`, `--magi-text-secondary`
- Radius: `--magi-radius-md` (the chip), `--magi-radius-full` (the group container)
- Spacing: `--magi-space-{1|2}`, `--magi-font-size-{label|body-sm}`
- Focus: `--magi-focus-ring`

**Single-select only.** Multi-select is NOT a contract feature. Consumers wanting multi-select MUST use a `<Checkbox>` group instead. A multi-item segmented control would conflict with the `role="radiogroup"` contract.

---

### Banner

**Semantic structure**

- Single block container with left-border accent. Default `<div>`.
- `role="alert"` for warning / error variants; `role="status"` for info / success variants.

**Accessibility**

- The `role` is part of the contract — never override it from outside. Consumers who need different semantics should use a different element.
- The visible text is the accessible name.
- Consumers can pass links (`<a>`) inside; their accessible name is the link text.

**Visual states**

- `info` / `success` — neutral-toned left border + soft background.
- `warning` / `error` — semantic-toned left border + soft background.

**Token binding**

- Color: `--magi-text-primary`, `--magi-text-secondary`, `--magi-success`, `--magi-warning`, `--magi-error`, plus their `color-mix(... N%, transparent)` soft variants.
- Spacing: `--magi-space-{4|6}`, `--magi-font-size-body-sm`

---

### EmptyState

**Semantic structure**

- Single centered block container. Default `<div>`.
- May contain inline children (simple form) or `title` + `description` + `action` props (structured form).

**Accessibility**

- No implicit role. The text content is the screen-reader text.
- `action` slot should be a focusable / keyboard-activatable one (Button, link).

**Visual states**

- None.

**Token binding**

- Color: `--magi-text-primary`, `--magi-text-secondary`, `--magi-text-tertiary`
- Typography: `--magi-font-size-{body|body-sm|label}`
- Spacing: `--magi-space-{4|6|8}`

---

## Brand

### MagiMark

**Semantic structure**

- Inline `<svg>` element. The three-dot mark (equilateral triangle).
- `aria-hidden="true"` by default. Decorative.
- When `ariaHidden={false}`, the consumer must set `alt="MAGI"` or equivalent accessible name.

**Accessibility**

- When decorative, screen readers skip it.
- When meaningful, the consumer is responsible for the accessible name.

**Visual states**

- Size variants only: `sm` (20 px tall), `md` (32 px tall, default), `lg` (48 px tall).

**Token binding**

- `fill="currentColor"` — inherits the consumer's `color` property.
- Logo is **stable across product accents**: do NOT bind to `--magi-accent`.

---

### MagiWordmark

**Semantic structure**

- Inline `<svg>` element. The "MAGI" wordmark in Inter Bold.
- `aria-hidden="true"` by default.

**Accessibility**

- Same as MagiMark.

**Visual states**

- Size variants: `sm` (20 px tall), `md` (32 px tall, default), `lg` (48 px tall).

**Token binding**

- `fill="currentColor"`. The wordmark uses the page's Inter font; the SVG `<text>` references `font-family="Inter, -apple-system, ..."`.
- Logo is **stable across product accents**: do NOT bind to `--magi-accent`.

---

### MagiLockup

**Semantic structure**

- Inline `<svg>` element. The mark + wordmark composite.
- `aria-hidden="true"` by default.

**Accessibility**

- Same as MagiMark.

**Visual states**

- Size variants: `sm` (20 px tall), `md` (32 px tall, default), `lg` (48 px tall).

**Token binding**

- `fill="currentColor"`. Same font handling as MagiWordmark.
- Logo is **stable across product accents**.

---

## Theme

### AppTheme

**Semantic structure**

- React context provider. Does NOT render a DOM wrapper (no `<div>`).
- On mount, sets the four accent CSS variables (`--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast`) on `document.documentElement` (i.e. `<html>`).
- On mount (0.6.0+), also writes `data-magi-theme="<theme>"` to `<html>`, which selects the Light or Dark semantic token block in `tokens/colors.css`.
- If `name` is provided, sets `data-magi-product="<name>"` on `<html>`.

**Accessibility**

- No direct accessibility role; AppTheme is invisible. It only affects how descendant components render their existing contracts.
- Nested `<AppTheme>` instances snapshot the previous accent values + theme on mount and restore them on unmount, so children unmounting leaves the outer theme intact.

**Visual states**

- `accent` prop — `green` (default), `cyan`, `violet`, `amber`, `white`. Mapped via `src/tokens/accent-presets.ts`.
- `theme` prop (0.6.0+) — `'dark'` (default, canonical) | `'light'`. Mapped via the `:root, [data-magi-theme="dark"]` and `[data-magi-theme="light"]` blocks in `src/tokens/colors.css`.

**Token binding**

- Reads: `ACCENT_PRESETS` from `src/tokens/accent-presets.ts` (framework-agnostic source of truth).
- Writes: `--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`, `--magi-accent-contrast` on `<html>`.
- Writes: `data-magi-theme="dark" | "light"` on `<html>` (new in 0.6.0).
- Sets: `data-magi-product` attribute on `<html>` (when `name` is provided).

**SSR**: `useInsertionEffect` does not run on the server. SSR pages render with the default theme (Dark) during the first paint; `<html>` is hydrated with the chosen accent + theme on the client. For zero-FOUC SSR, set both `data-magi-accent="<name>"` and `data-magi-theme="<theme>"` on `<html>` in the server-side layout — the CSS rules in `colors.css` and `globals.css` pick them up before paint.

---

### useAppTheme

**Contract**

- Returns `{ accent: AppAccent, theme: AppThemeName }` for JS-aware consumers (theme added in 0.6.0).
- Default value: `{ accent: 'green', theme: 'dark' }` when used outside an `<AppTheme>`.
- The hook itself is **React-specific**; the contract is the returned shape. A non-React consumer reads the same information by inspecting the `--magi-accent` CSS variable and `data-magi-theme` attribute via the DOM.

---

### `data-magi-accent` subtree

**Contract**

- HTML attribute. Set on any element. Maps to a CSS rule in `foundation/globals.css` that overrides the four accent CSS variables for that subtree.
- Eight values: `green`, `cyan`, `violet`, `amber`, `white`, `danger`, `warning`, `success`. The first five are accent presets; the last three are semantic overrides (`--magi-error`, `--magi-warning`, `--magi-success`).
- The mapping is **pure CSS** — no JavaScript runtime is required to honor the attribute.
- This is the **preferred** way to scope accent overrides. `<AppTheme>` is app-level (writes to `<html>`); `data-magi-accent` is subtree-level (writes to the local element).

**Accessibility**

- No direct ARIA semantics. Screen readers ignore it.

**Visual states**

- One per value: see `<AppTheme>` contract for the five accent presets; semantic overrides change to the corresponding `--magi-error` / `--magi-warning` / `--magi-success` palette.

**Token binding**

- Reads: the same `--magi-accent-*` variables as components.
- Writes: the same `--magi-accent-*` variables, scoped to the subtree via CSS specificity (the `data-magi-accent` selector wins over the `body[data-magi-app]` selector).

---

### `data-magi-theme` subtree

**Contract**

- HTML attribute. Set on any element. Maps to a CSS rule in `tokens/colors.css` that overrides the semantic color tokens for that subtree.
- Two values:
  - `'dark'` — canonical MAGI presentation (default). Same values as the `:root` selector (no attribute = dark).
  - `'light'` — supported alternative presentation. Inverts the surface / text / border tokens; keeps accent independent.
- The mapping is **pure CSS** — no JavaScript runtime is required to honor the attribute.
- This is the **preferred** way to scope a subtree to Light theme (e.g., a card that flips to Light within a Dark page). `<AppTheme theme="light">` is the app-level equivalent.
- Canonical placement: `<html data-magi-theme="dark">` (or no attribute for default) at the root of the document.

**Accessibility**

- No direct ARIA semantics. Screen readers ignore it. Color-mode switches are **purely visual** — components must continue to function (keyboard, screen reader, high-contrast) regardless of theme.

**Visual states**

- One per value:
  - `'dark'` — `--magi-bg-base` = `#000`, `--magi-text-primary` = `#f5f5f7`, `--magi-logo-color` = `#f5f5f7`.
  - `'light'` — `--magi-bg-base` = `#fff`, `--magi-text-primary` = `#050505`, `--magi-logo-color` = `#050505`.
- Accent (`--magi-accent` and family) is **independent** of the color mode. `<AppTheme accent="cyan" theme="light">` is a valid combination.

**Token binding**

- Reads: the color-mode-dependent semantic tokens (`--magi-bg-*`, `--magi-text-*`, `--magi-border*`, `--magi-scrollbar-thumb*`, `--magi-logo-color`).
- Writes: same tokens, scoped to the subtree via CSS specificity (the `[data-magi-theme]` selector wins over the `:root` selector).

**SSR**: set `<html data-magi-theme="light">` in the server-rendered layout to avoid FOUC. The CSS rule in `colors.css` applies before the page paints.

## Versioning the contracts

- **Minor (0.x.0)**: a contract is added (a new component ships with its contract documented here) or extended (a new variant, a new state).
- **Patch (0.5.x)**: a contract is **clarified** in prose (the behavior did not change).
- **Major (1.0.0 breaking)**: a contract is **changed** — a state is renamed, an accessibility behavior changes, a token is removed.

Optimizing a CSS selector in the Web/CSS Implementation (Layer 5) is **never a contract change**, even if the class name moves.

---

## How to add a new component

1. Add the React `.tsx` implementation in `src/components/<Name>/<Name>.tsx`.
2. Add the Web/CSS Implementation in `src/components/<Name>/<Name>.css` under `@layer magi.components`.
3. Add the Contract here in this document — fill the four sections.
4. Export the React component from `src/components/<Name>/index.ts` and re-export from `src/index.ts`.
5. Update `docs/usage-guide.md` with usage examples.
6. Add a showroom page at `apps/showroom/src/pages/<Name>.tsx`.