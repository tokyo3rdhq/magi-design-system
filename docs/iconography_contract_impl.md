# MAGI Design System — Iconography Contract

## Context

You are working on the `@tokyo3rdhq/magi-design-system` repository.

MAGI is building a family of AI-oriented products under the `magi.website` ecosystem, including:

* `magi.website`
* `models.magi.website`
* `start.magi.website` / Token Factory Initializr
* future MAGI products and subdomains

The visual direction of MAGI is:

* dark-first
* Apple-like
* minimal
* premium
* technical
* precise
* restrained
* AI-native
* developer-oriented

The design system should provide a consistent visual language across products without forcing every product into the same information architecture or interaction model.

The current design-system principle is:

> MAGI owns the visual language. Products own the product experience.

For icons, the intended strategy is:

> Use a mature icon library for generic UI semantics. Create custom MAGI icons only where they provide genuine semantic or brand value.

The preferred generic icon library is **Lucide** / `lucide-react`.

Do NOT create a complete custom icon library from scratch.

---

# 1. Goal

Introduce an explicit **Iconography Contract** into the MAGI Design System.

The contract must define:

1. the default icon source
2. generic UI icon usage
3. custom MAGI icon criteria
4. icon sizing
5. stroke characteristics
6. color behavior
7. accessibility
8. alignment
9. icon-only controls
10. text + icon usage
11. external-link indicators
12. product-owned vs design-system-owned icons
13. custom SVG source-of-truth
14. React implementation guidance
15. rules preventing icon-style drift across MAGI products

The goal is not to build many icons.

The goal is to make icon usage predictable and consistent.

---

# 2. Core Principle

Adopt the following hierarchy:

```text
MAGI Icon System
├── Generic UI Icons
│   └── Lucide / lucide-react
│
└── MAGI Semantic Icons
    ├── Brand Icons
    ├── Product Icons
    └── MAGI Concept Icons
```

### Generic UI Icons

Use Lucide for conventional interface semantics such as:

* Search
* Menu
* Close
* Chevron
* Arrow
* Plus
* Minus
* Check
* Copy
* Download
* Upload
* External Link
* Settings
* Filter
* Sort
* Edit
* Refresh
* Eye
* Eye Off
* Info
* Warning
* Error
* Help
* More
* Calendar
* Clock
* Lock
* Unlock

Do not recreate these icons.

### MAGI Semantic Icons

Custom icons may be introduced for concepts that are specific to the MAGI ecosystem, such as:

* MAGI brand mark
* Token Factory
* Model Knowledge Graph
* MAGI Agent
* MAGI Gateway
* MAGI Token
* model/provider concepts
* future MAGI-specific concepts

A custom icon should exist because the concept itself is unique or important to MAGI, not merely because another library icon looks slightly different.

---

# 3. Library Strategy

Use `lucide-react` as the default generic icon implementation.

Do NOT:

* copy all Lucide SVGs into the repository
* fork Lucide
* create wrappers for every Lucide icon
* rename generic Lucide icons into `Magi*`
* create a parallel generic icon library
* manually redraw common interface icons
* create a `@tokyo3rdhq/magi-icons` package at this stage

Prefer direct imports:

```tsx
import { Search, Settings, Copy, ExternalLink } from "lucide-react";
```

Example:

```tsx
<Search aria-hidden="true" />
```

The Design System should define **how icons are used**, rather than trying to own every generic icon asset.

---

# 4. Dependency Policy

If `lucide-react` is not currently present, add it as an appropriate dependency of the React implementation.

Determine whether it should be:

* a runtime dependency
* a peer dependency

based on the existing package architecture and library distribution model.

Do not introduce unnecessary abstraction solely for dependency management.

Document the chosen strategy.

The version should be explicitly controlled through the package manager lockfile.

Avoid unnecessary icon-library churn.

---

# 5. Icon Size Contract

Define a small, controlled size scale.

Recommended baseline:

```text
16px  — compact UI / metadata
18px  — default inline UI
20px  — standard controls
24px  — prominent controls / standalone icon
```

Do not introduce arbitrary icon sizes without a concrete product requirement.

For example:

```tsx
<Search size={18} />
```

Preferred semantic sizing should eventually be possible through CSS or design tokens rather than repeated magic numbers.

If appropriate, define icon size tokens such as:

```css
--magi-icon-size-sm: 16px;
--magi-icon-size-md: 18px;
--magi-icon-size-lg: 20px;
--magi-icon-size-xl: 24px;
```

Do not create excessive icon-specific tokens if existing spacing/size tokens already provide an equivalent mechanism.

---

# 6. Stroke Contract

MAGI icons should maintain a restrained technical appearance.

For Lucide icons:

* use the library's standard stroke-based construction
* preserve consistent stroke weight
* do not randomly override stroke width per component
* do not mix filled icons and outlined icons without semantic justification
* avoid decorative multi-weight icon compositions

If the implementation requires a MAGI-specific stroke token, define it centrally.

The contract should prefer:

```text
consistent stroke
consistent linecap
consistent linejoin
currentColor
```

rather than per-icon visual customization.

Do not use:

* gradients
* glow effects
* drop shadows
* neon outlines
* decorative filters

for ordinary UI icons.

---

# 7. Color Contract

Icons must normally use:

```css
color: currentColor;
```

Icons should inherit semantic text/icon color from their surrounding component.

Do not hard-code:

```css
color: #ffffff;
color: #000000;
```

inside reusable icon implementations.

Use the existing MAGI semantic color tokens.

Typical semantic relationships:

```text
primary foreground
secondary foreground
muted foreground
disabled foreground
accent
success
warning
danger
```

The product accent may be used for semantic emphasis where appropriate.

However:

> The MAGI logo and core brand marks must NOT be recolored using product accents.

Brand icon rules remain governed by the Brand Foundation.

---

# 8. Theme Contract

Icons must work correctly in both:

```text
Dark
Light
```

themes.

The same icon should normally be usable in both themes without changing the SVG itself.

Do not create:

```text
SearchDark.svg
SearchLight.svg
```

for generic UI icons.

Theme differences should normally be resolved through semantic color tokens.

The icon system must be tested against:

```text
Dark × Default Accent
Dark × Other Accents
Light × Default Accent
Light × Other Accents
```

where those combinations are supported by the existing design system.

---

# 9. Accessibility Contract

Icons are decorative by default.

Example:

```tsx
<Search aria-hidden="true" />
```

If an icon communicates meaning that is not otherwise available in text, it must have an accessible name.

For example, icon-only buttons must have an accessible label:

```tsx
<button aria-label="Search">
  <Search aria-hidden="true" />
</button>
```

Do NOT rely on:

```tsx
<button title="Search">
```

as the only accessibility mechanism.

For icon + text:

```tsx
<button>
  <Copy aria-hidden="true" />
  <span>Copy</span>
</button>
```

The visible text provides the accessible meaning.

For meaningful standalone graphics, provide an appropriate accessible name according to the component contract.

---

# 10. Icon-Only Controls

Icon-only controls are allowed only when the icon represents a conventional, recognizable action.

Examples:

```text
Search
Menu
Close
More
Settings
Copy
Download
Refresh
Previous
Next
Expand
Collapse
Show
Hide
```

Avoid icon-only controls for ambiguous actions.

If the meaning is not immediately recognizable, use:

```text
icon + text
```

instead.

Icon-only controls must:

* have an accessible name
* have a visible focus state
* provide adequate hit area
* support disabled/loading states where applicable
* inherit component interaction states

Do not make icon-only controls merely because they look cleaner.

---

# 11. Icon + Text

For actions and navigation, prefer icon + text when the icon is supplemental and the text improves clarity.

Examples:

```text
Copy
Download
Open Documentation ↗
View Model
Generate Config
Refresh
```

The icon should reinforce the meaning, not replace useful text.

Do not add icons merely for decoration.

Avoid:

```text
[icon] Text [icon]
```

when the second icon provides no meaningful interaction or information.

---

# 12. External Links

External destinations may use:

```text
ExternalLink
```

or the existing MAGI external-link convention.

For example:

```text
Documentation ↗
GitHub ↗
Discord ↗
```

The visual treatment should remain subtle.

Do not use large or visually dominant external-link icons.

External-link indicators should communicate navigation context rather than become decorative UI.

---

# 13. Navigation Icons

Common navigation semantics should use Lucide.

Examples:

```text
ChevronLeft
ChevronRight
ChevronUp
ChevronDown
ArrowLeft
ArrowRight
Menu
X
MoreHorizontal
```

Do not create MAGI-specific versions of these unless a genuine semantic requirement exists.

Navigation icons must maintain consistent optical size and alignment across products.

---

# 14. Custom MAGI Icon Criteria

A custom icon may be added only when at least one of the following is true:

### A. MAGI-specific semantic

The concept does not have a sufficiently precise generic representation.

Example:

```text
Token Factory
Model Knowledge Graph
MAGI Agent
```

### B. Brand recognition

The icon contributes to MAGI's recognizable visual identity.

### C. Cross-product reuse

The icon is used or expected to be used across multiple MAGI products.

Prefer icons that satisfy:

```text
semantic uniqueness
+
cross-product reuse
+
long-term stability
```

Do NOT create a custom icon simply because:

* Lucide's icon is not aesthetically perfect
* a designer wants a slightly different curve
* a single page needs a decorative symbol
* a product wants to look different from another product

---

# 15. Custom Icon Ownership

Use the following ownership model:

```text
Design System
├── MAGI Brand Icons
├── Stable MAGI Concept Icons
└── Cross-product Semantic Icons

Product
├── Product-specific concepts
├── Temporary concepts
├── One-off illustrations
└── Experimental icons
```

A product-specific icon should remain product-owned until there is evidence that it is:

1. semantically stable
2. reusable
3. relevant to multiple MAGI products

Only then should it be promoted into the Design System.

This prevents the design system from becoming a dumping ground for product-specific assets.

---

# 16. Custom SVG Contract

For custom MAGI icons:

* SVG is the source of truth
* use `currentColor` where appropriate
* avoid hard-coded presentation colors
* avoid unnecessary embedded styles
* keep geometry stable
* keep viewBox consistent
* optimize SVGs
* do not embed raster images
* do not use gradients for ordinary interface icons
* do not use filters or shadows

Recommended baseline:

```svg
<svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
```

Custom icons should be visually compatible with Lucide rather than looking like an unrelated icon family.

---

# 17. Optical Alignment

Do not assume that equal mathematical dimensions produce equal visual dimensions.

Icons must be optically aligned with:

* text
* buttons
* form controls
* navigation items
* badges
* metadata

Pay particular attention to:

```text
icon ↔ text baseline
icon ↔ button center
icon ↔ input text
icon ↔ badge text
```

Avoid compensating for optical alignment with arbitrary per-component CSS.

If recurring adjustments are required, define a system-level rule or token.

---

# 18. Icon and Typography Relationship

Icons should visually support MAGI typography.

Default relationship:

```text
icon height ≈ text line-height / visual x-height relationship
```

Do not make icons disproportionately large relative to text.

For example, an 18px icon next to normal body text is generally preferable to a 24px icon unless the component context explicitly requires a larger control.

Icons should not dominate typography in ordinary UI.

---

# 19. Icon Spacing

Use existing MAGI spacing tokens.

Do not introduce arbitrary values such as:

```css
margin-right: 7px;
margin-left: 13px;
```

Prefer semantic spacing:

```text
icon + text → small spacing
icon + control → component-defined spacing
icon + icon → compact spacing
```

The exact spacing should come from the existing spacing scale.

---

# 20. Icons in Buttons

Button icons must follow the button's size and state.

Example:

```tsx
<Button>
  <Copy aria-hidden="true" />
  Copy
</Button>
```

Do not independently style the icon to create a second visual hierarchy.

Button state should automatically affect the icon:

```text
default
hover
active
focus
disabled
loading
```

The icon should normally inherit the button's semantic color.

---

# 21. Icons in Form Controls

For inputs, selects, filters, and similar controls:

* icons should not interfere with text input
* icons must not steal focus
* decorative icons should use `aria-hidden`
* interactive icons must have their own accessible semantics
* status icons should not be the sole carrier of error/success information

For example, an error state should not rely only on a red error icon.

Provide textual or programmatically associated error information.

---

# 22. Status Icons

Status icons may communicate:

```text
success
warning
error
info
loading
```

but color must not be the sole semantic carrier.

Example:

```text
✓ Connected
⚠ Configuration incomplete
✕ Generation failed
```

The icon should reinforce the textual state.

Do not create a large collection of visually different status icons without a semantic need.

---

# 23. Product-Specific Dense UI

MAGI products such as `models.magi.website` and Token Factory Initializr may contain dense technical interfaces.

Do not simplify icons merely to make the UI resemble a marketing site.

Dense technical UI may legitimately use:

* 16px icons
* compact controls
* filter icons
* provider/model metadata icons
* copy/download actions
* expand/collapse controls
* status indicators

The icon contract should preserve consistency without reducing product-specific information density.

---

# 24. Brand Icons vs UI Icons

Keep the following distinction explicit:

```text
Brand Icon
    ↓
represents MAGI identity

UI Icon
    ↓
represents an interface action

Semantic Icon
    ↓
represents a domain concept
```

Examples:

```text
MAGI Mark          → Brand
Search             → UI
Copy               → UI
Token Factory      → Semantic
Model Graph        → Semantic
MAGI Agent         → Semantic
```

Do not mix these categories.

Brand assets must follow `docs/brand.md`.

Generic UI icons must follow this Iconography Contract.

---

# 25. Implementation Strategy

Do not immediately introduce a generic `<MagiIcon />` abstraction.

Prefer direct Lucide usage where it keeps the code clear:

```tsx
import { Search } from "lucide-react";
```

Only introduce a shared icon abstraction when there is a demonstrated need such as:

* consistent sizing
* accessibility enforcement
* analytics
* theming
* icon registry
* runtime icon selection
* custom icon interoperability

Avoid abstraction for abstraction's sake.

---

# 26. Recommended File Organization

If custom icons are added, use a structure consistent with the existing repository:

```text
packages/design-system/
└── src/
    ├── assets/
    │   └── icons/
    │       ├── favicon.svg
    │       ├── app-icon.svg
    │       └── custom/
    │           ├── magi-token-factory.svg
    │           └── magi-model-graph.svg
    │
    ├── brand/
    │   └── ...
    │
    └── ...
```

Do not create a separate icon package yet.

If React wrappers for custom icons become useful, they may live alongside the existing brand/component architecture.

---

# 27. Documentation

Add an explicit Iconography section to the Design System documentation.

Recommended location:

```text
docs/iconography.md
```

The document should include:

1. Icon strategy
2. Lucide usage
3. Size scale
4. Stroke rules
5. Color rules
6. Theme behavior
7. Accessibility
8. Icon-only controls
9. Icon + text
10. External links
11. Custom icon criteria
12. Ownership model
13. SVG rules
14. Product examples
15. Anti-patterns

Link the document from the main README and relevant Design System documentation.

---

# 28. Anti-Patterns

Explicitly document these as prohibited or discouraged:

### Do not create generic replacements

```text
MagiSearch
MagiSettings
MagiClose
MagiChevron
```

if they are merely copies of Lucide icons.

### Do not use emoji as UI icons

Avoid:

```text
🔍
⚙️
📋
✨
🚀
```

as the primary interface icon system.

Emoji rendering varies by platform and does not provide the required visual consistency.

### Do not use random icon libraries

Avoid mixing:

```text
Lucide
Heroicons
Font Awesome
Material Icons
custom SVG
```

within the same interface without a documented reason.

### Do not mix icon styles

Avoid combining:

```text
filled icons
outlined icons
duotone icons
3D icons
gradient icons
```

without explicit semantic/design justification.

### Do not decorate everything

Icons should communicate meaning.

Not every heading, card, button, or section needs an icon.

---

# 29. Validation Matrix

Validate the icon system across:

```text
Theme
├── Dark
└── Light

Accent
├── Default
└── Supported Accent Presets

Context
├── Navigation
├── Button
├── Form
├── Card
├── Table/List
├── Status
└── Dense Technical UI

State
├── Default
├── Hover
├── Active
├── Focus
├── Disabled
└── Loading

Accessibility
├── Decorative
├── Icon + Text
└── Icon Only
```

The goal is to ensure that the icon contract works across the existing Design System rather than only in a standalone icon showcase.

---

# 30. Showroom Requirements

Extend the existing showroom to include an Iconography section.

The showroom should demonstrate:

### Generic icons

```text
Search
Settings
Copy
Download
Filter
Refresh
External Link
Chevron
```

### Sizes

```text
16
18
20
24
```

### Contexts

```text
icon only
icon + text
button
navigation
metadata
status
```

### Themes

```text
Dark
Light
```

### Accessibility

Show examples of:

```text
decorative icon
icon + text
accessible icon-only button
```

### Custom MAGI icons

Only show custom icons that actually exist.

Do not create placeholder custom icons merely for the showroom.

---

# 31. Testing

Add or update tests where appropriate.

At minimum, verify:

### Accessibility

* icon-only controls have accessible names
* decorative icons are hidden from assistive technology
* icon + text does not create duplicate accessible names
* focus states remain visible

### Theme

* icons inherit semantic color
* icons work in dark mode
* icons work in light mode

### Component states

* disabled icons inherit disabled state
* loading states remain visually coherent
* hover/active/focus states do not introduce inconsistent icon colors

### Visual regression

If the repository already contains visual regression infrastructure, include representative icon cases.

Do not introduce a heavy visual-testing framework solely for this contract unless there is already a roadmap item supporting it.

---

# 32. Migration / Audit

Before implementing new infrastructure, audit the current repository.

Look for:

```text
existing icon dependencies
existing SVG icons
emoji used as UI icons
custom inline SVG
hard-coded icon colors
hard-coded icon sizes
mixed icon libraries
icon-only buttons without aria-label
duplicate generic icons
product-specific icons already implemented
```

Classify findings as:

```text
P0 — accessibility / severe consistency issue
P1 — design-system contract violation
P2 — cleanup / future improvement
INFO — acceptable existing usage
```

Do not blindly refactor every existing icon.

Prioritize issues that materially affect the system contract.

---

# 33. Guardrails

Do NOT:

* build a full custom icon library
* create dozens of new icons
* introduce `@tokyo3rdhq/magi-icons`
* replace all existing icons without evidence
* create generic `Magi*` wrappers for Lucide
* add unnecessary icon abstractions
* introduce unrelated components
* redesign the existing brand mark
* change the MAGI logo geometry
* mix product accents into the MAGI logo
* change product information architecture
* force marketing-site icon density onto developer tools

The purpose of this work is to establish a stable icon contract, not to expand the design system unnecessarily.

---

# 34. Definition of Done

The work is complete when:

* [ ] `docs/iconography.md` exists
* [ ] Lucide is explicitly documented as the generic UI icon source
* [ ] icon size rules are documented
* [ ] stroke rules are documented
* [ ] color/currentColor rules are documented
* [ ] dark/light behavior is documented
* [ ] accessibility rules are documented
* [ ] icon-only control rules are documented
* [ ] icon + text rules are documented
* [ ] external-link convention is documented
* [ ] custom MAGI icon criteria are documented
* [ ] Design System vs Product ownership is documented
* [ ] custom SVG rules are documented
* [ ] anti-patterns are documented
* [ ] showroom contains representative icon examples
* [ ] existing icon usage has been audited
* [ ] no unnecessary generic icon abstraction has been introduced
* [ ] existing Brand Foundation rules remain unchanged
* [ ] existing component contracts remain consistent with the new icon contract
* [ ] tests/build/typecheck pass

---

# 35. Final Design Principle

The final icon system should communicate the following:

> **Use familiar icons for familiar actions.**
>
> **Create MAGI icons only for concepts that belong to MAGI.**
>
> **Consistency comes from rules, not from owning every SVG.**

The resulting system should feel:

```text
quiet
precise
technical
minimal
consistent
recognizable
```

rather than:

```text
decorative
generic-AI
over-designed
icon-heavy
cyberpunk
```

Do not optimize for the number of icons.

Optimize for **semantic clarity + visual consistency + long-term maintainability**.

