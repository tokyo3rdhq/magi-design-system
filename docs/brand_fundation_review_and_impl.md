# MAGI Design System — Brand Foundation Architecture Review + Implementation Prompt

## 0. Role

You are a senior Design Systems Architect, Brand Systems Engineer, and Frontend Architecture Reviewer.

You are working on the existing:

```text
@tokyo3rdhq/magi-design-system
```

package and repository.

Your task is **not simply to add a Logo component**.

First reconstruct and review the existing architecture. Then design and implement a minimal, durable **Brand Foundation** that fits naturally into the existing design system.

The goal is to establish MAGI's visual identity as a reusable foundation for the MAGI product ecosystem without turning the design system into a branding framework, icon framework, or second UI system.

Do not introduce unnecessary dependencies, abstractions, package boundaries, or infrastructure.

---

# 1. Terminology — Important

Do not confuse these four concepts.

## Package Namespace

The current npm package namespace is:

```text
@tokyo3rdhq
```

This is a package ownership / publishing namespace.

It is **not** the MAGI brand hierarchy.

---

## Package

The current package is:

```text
@tokyo3rdhq/magi-design-system
```

This is the technical design-system package.

Do not rename it.

Do not assume that the package should become:

```text
@magi/design-system
```

Do not introduce package-renaming work as part of this task.

---

## Brand

The product ecosystem brand is:

```text
MAGI
```

MAGI is the visual and product identity.

---

## Design System

The design system is:

```text
@tokyo3rdhq/magi-design-system
```

It provides the shared visual language and UI primitives used by MAGI products.

The relationship is therefore:

```text
tokyo3rdhq
    │
    └── @tokyo3rdhq/magi-design-system
                │
                ├── Design Language
                ├── Brand Foundation
                ├── Tokens
                ├── Foundation
                ├── Layout
                ├── Components
                └── Theme
```

Do not introduce another package merely to represent MAGI branding.

---

# 2. Context

MAGI is an independent AI infrastructure / developer tooling ecosystem.

Current or planned products include:

```text
magi.website

models.magi.website

start.magi.website

*.magi.website
```

For example:

```text
MAGI
├── Main Website
│   └── magi.website
│
├── Models
│   └── models.magi.website
│
├── Token Factory Initializr
│   └── start.magi.website
│
└── Future Products
    └── *.magi.website
```

The shared visual direction is:

> Dark-first, premium, minimal, technical, calm, precise, modern, AI-native, developer-oriented, independent.

The design language can be summarized as:

> Apple-level restraint + AI infrastructure + developer tooling + independent lab.

This does NOT mean copying Apple.

Avoid:

* generic AI purple gradients
* glowing orbs
* cyberpunk/neon aesthetics
* excessive glassmorphism
* stock AI illustrations
* decorative visual noise
* over-designed marketing patterns

The design philosophy is:

> **MAGI owns the visual language. Products own the experience.**

Brand Foundation must reinforce this principle.

---

# 3. Primary Objective

Design and implement a minimal:

> **MAGI Brand Foundation**

inside:

```text
@tokyo3rdhq/magi-design-system
```

The Brand Foundation should establish the shared identity layer used across:

* MAGI website
* MAGI products
* product navigation
* product headers
* product footers
* documentation
* GitHub repositories
* README files
* package documentation
* favicons
* application icons
* OpenGraph/social assets
* future MAGI properties

The objective is NOT to build a full corporate identity management system.

The objective is to create the smallest architecture that allows MAGI to maintain a coherent identity across many products.

---

# 4. Core Architecture Principle

The architecture should conceptually be:

```text
MAGI Brand
    │
    ├── Brand Assets
    │
    ├── Brand Rules
    │
    └── Design System
            │
            ├── Tokens
            ├── Foundation
            ├── Layout
            ├── Components
            └── Product Systems
```

Product identity exists below the MAGI brand:

```text
MAGI
│
├── Models
│   ├── Product Name
│   ├── Product Icon
│   └── Product Accent
│
├── Token Factory
│   ├── Product Name
│   ├── Product Icon
│   └── Product Accent
│
└── Future Product
    ├── Product Name
    ├── Product Icon
    └── Product Accent
```

The Brand Foundation must preserve this hierarchy.

---

# 5. Brand Foundation Is Not Another Component Library

Do not treat:

```text
MagiLogo
MagiWordmark
MagiBrand
```

as equivalent to:

```text
Button
Card
Input
Badge
Tabs
```

UI components are interaction primitives.

Brand assets are identity primitives.

Therefore the relationship should be:

```text
Canonical Brand Asset
        ↓
Brand Rendering API
        ↓
Product UI
```

For example:

```text
magi-mark.svg
        ↓
MagiLogo
        ↓
Navbar / Header / Footer
```

The SVG/static asset remains the source of truth.

The React component is a rendering API.

---

# 6. Phase 1 — Repository Reconnaissance

Before implementing anything, inspect the actual repository.

Do not rely solely on previous architecture documents.

The repository is the source of truth.

Inspect at minimum:

```text
package.json

src/
  index.ts
  tokens/
  foundation/
  layout/
  components/
  theme.tsx
  styles/

docs/

showroom/

tests/

vite.config.*
tsconfig.*
```

Also inspect:

* current package exports
* CSS build pipeline
* token architecture
* `ProductTheme`
* `ProductHeader`
* `MagiNavbar`
* `MagiFooter`
* typography tokens
* color tokens
* CSS layer architecture
* `data-magi-app`
* existing assets
* existing icon implementation
* current documentation
* current testing infrastructure
* current showroom

Do not invent architecture that already exists.

Do not duplicate an existing asset or utility system.

---

# 7. Phase 2 — Current Architecture Reconstruction

Before making changes, document:

```text
Current package structure
Current public API
Current CSS architecture
Current token architecture
Current theme architecture
Current brand-related implementation
Current asset handling
Current testing
Current showroom
```

Explicitly identify whether any of these already exist:

```text
Logo
Wordmark
Brand
ProductBrand
ProductIcon
Favicon
App icon
Brand assets
Brand documentation
```

If something already exists, evaluate whether it should be extended rather than replaced.

---

# 8. Brand Foundation Boundary

Evaluate where Brand Foundation belongs.

Consider:

### Option A

```text
src/brand/
```

### Option B

```text
src/foundation/brand/
```

### Option C

```text
src/brand/
src/assets/
```

### Option D

A separate package:

```text
@magi/brand
```

or another package.

Strong default:

> Do NOT create a separate brand package.

There is currently no demonstrated dependency boundary that justifies one.

The likely architecture should remain inside:

```text
@tokyo3rdhq/magi-design-system
```

For example:

```text
@tokyo3rdhq/magi-design-system
│
├── brand/
├── assets/
├── tokens/
├── foundation/
├── layout/
├── components/
└── theme.tsx
```

However, inspect the repository before deciding.

The architecture review must explain the final choice.

---

# 9. Brand vs Design Tokens

Determine which concepts belong to tokens.

Potential token concepts:

```text
colors
typography
spacing
radius
elevation
motion
states
```

Potential brand assets:

```text
MAGI mark
MAGI wordmark
MAGI lockup
favicon
application icon
```

Potential brand documentation:

```text
clear space
minimum size
approved backgrounds
logo misuse
brand hierarchy
product relationship
```

Do not turn every brand rule into a CSS variable.

Do not turn every token into a brand asset.

Establish a clean boundary.

---

# 10. Brand vs Product Theme

This is a critical architectural boundary.

The existing system contains:

```text
ProductTheme
```

The Brand Foundation must not become coupled to product theme state.

Conceptually:

```text
MAGI Brand
    ↓
Product Identity
    ↓
Product Theme
```

not:

```text
ProductTheme
    ↓
MAGI Brand
```

The MAGI logo should remain stable when:

```text
accent="green"
accent="cyan"
accent="violet"
accent="amber"
accent="white"
```

changes.

Product accent is a product-level styling decision.

MAGI identity is a brand-level decision.

---

# 11. Brand vs Product Identity

Establish a clear distinction:

```text
MAGI Brand
    │
    ├── MAGI Mark
    ├── MAGI Wordmark
    └── MAGI Lockup
             │
             ▼
       Product Identity
             │
             ├── Product Name
             ├── Product Icon
             ├── Product Accent
             └── Product-specific UI
```

For example:

```text
MAGI
Token Factory
```

or another composition supported by the actual design.

Do not hard-code a visual lockup before inspecting existing product UI.

---

# 12. Brand Assets

Establish canonical static assets.

A possible structure is:

```text
src/
  assets/
    logo/
      magi-mark.svg
      magi-wordmark.svg
      magi-lockup.svg

    icons/
      favicon.svg
      app-icon.svg
```

But first inspect existing repository conventions.

Do not create duplicate asset locations.

The source assets must be usable outside React.

They should work for:

* README
* GitHub
* HTML
* favicon
* docs
* static pages
* marketing
* social preview generation

---

# 13. SVG Source of Truth

The canonical SVG should be the source of truth.

React components should render or reference the canonical asset.

Do NOT maintain:

```text
SVG logo A

React inline SVG logo B
```

as two independent definitions.

Avoid drift.

SVG assets should ideally be:

* optimized
* deterministic
* scalable
* viewBox based
* free from unnecessary metadata
* free from embedded raster images
* free from external resources
* suitable for dark backgrounds
* suitable for light backgrounds where required

Do not introduce arbitrary visual variants without a documented need.

---

# 14. Brand Variants

Determine the minimum required variants.

Possible variants:

```text
mark
wordmark
lockup
```

Possible color treatments:

```text
light
dark
monochrome
```

Do not automatically implement every combination.

The architecture review must determine which variants are actually required.

Avoid variant explosion.

---

# 15. React API

Determine the smallest public React API.

Possible APIs:

```tsx
<MagiLogo />
<MagiWordmark />
<MagiBrand />
```

Potentially:

```tsx
<ProductBrand />
```

but only if real existing consumers justify it.

Do not build a universal branding API.

For example, avoid premature APIs like:

```tsx
<Brand
  name=""
  logo=""
  icon=""
  accent=""
  theme=""
  href=""
  description=""
  variant=""
  size=""
  ...
/>
```

Prefer explicit semantic APIs.

---

# 16. `MagiLogo` Design

If `MagiLogo` is justified, define a minimal API.

Evaluate whether this is better:

```tsx
<MagiLogo variant="mark" />
```

or:

```tsx
<MagiMark />
<MagiWordmark />
<MagiBrand />
```

Choose based on semantic clarity and actual usage.

Do not create a configurable API merely for flexibility.

---

# 17. Logo Sizing

Avoid arbitrary dimensions as the primary API:

```tsx
<MagiLogo width={137} height={31} />
```

Prefer a small semantic sizing model if sizing is required:

```text
sm
md
lg
```

or:

```text
navigation
default
hero
```

Use CSS/SVG intrinsic scaling where appropriate.

The goal is consistency, not maximum configurability.

---

# 18. Accessibility

Every brand rendering API must have a clear accessibility strategy.

Evaluate:

* meaningful logo
* decorative logo
* logo inside link
* logo next to visible MAGI text
* SVG accessibility
* image `alt`
* `aria-label`
* `aria-hidden`
* accessible name
* keyboard behavior when inside interactive elements

Examples:

Meaningful image:

```html
<img alt="MAGI" />
```

Decorative image next to visible brand text:

```html
<img alt="" />
```

Logo inside a home link:

```html
<a aria-label="MAGI home">
  ...
</a>
```

Do not blindly add `aria-label` everywhere.

Document intended usage.

---

# 19. Brand CSS

Determine whether Brand Foundation actually needs:

```text
brand.css
```

If it does, keep it strictly limited to brand-level presentation.

It must not become a dumping ground for:

* navbar layout
* product layout
* buttons
* cards
* pages
* product-specific styling

Do not create a CSS file merely because every folder is expected to have one.

---

# 20. Brand and Typography

Review the existing typography system.

Strong default:

> Do not create a second typography system for the brand.

The brand guideline should describe how the existing typography tokens are used.

For example:

```text
Brand guideline
      ↓
Existing typography tokens
```

not:

```text
Brand typography tokens
      +
Design-system typography tokens
```

Avoid duplicate sources of truth.

---

# 21. Brand and Color

Review the existing color token system.

Explicitly distinguish:

```text
MAGI brand identity colors
Product accent colors
Semantic UI colors
```

Do not automatically introduce:

```text
--magi-brand-green
--magi-brand-cyan
--magi-brand-violet
```

if those are actually product accents.

The important rule is:

> Product accent is not automatically MAGI brand color.

---

# 22. Product Accent

Product accents may evolve independently.

For example:

```text
Models
    → cyan

Token Factory
    → green
```

or whatever the actual product configuration specifies.

The MAGI logo should not change merely because the product accent changes.

Brand Foundation should therefore remain stable if product themes are redesigned.

---

# 23. ProductBrand Evaluation

Evaluate whether a reusable:

```tsx
<ProductBrand />
```

is actually necessary.

Possible architecture:

```text
MagiBrand
    ↓
ProductBrand
    ↓
ProductHeader
```

But another valid architecture may be:

```text
MagiBrand
    ↓
ProductHeader
```

where each product owns the composition.

Do not implement `ProductBrand` merely because it looks architecturally elegant.

Use evidence from existing consumers.

If implemented, define its exact semantic responsibility.

It must not become:

```text
ProductPageHeader
```

or:

```text
ProductNavigation
```

Those are UI patterns/components, not brand primitives.

---

# 24. Product Identity Contract

If `ProductBrand` is justified, evaluate a minimal contract such as:

```ts
type ProductIdentity = {
  name: string;
  shortName?: string;
  icon?: ReactNode;
  accent?: ProductAccent;
};
```

Do not assume this exact API.

Determine whether product metadata should actually live in the design-system package.

Strong default:

> Product-specific business metadata should remain owned by the product application.

The design system should provide reusable rendering and visual contracts.

---

# 25. Favicon and App Icon

Explicitly distinguish:

```text
MAGI logo
MAGI mark
favicon
app icon
```

These are related but not identical artifacts.

Determine:

* which canonical assets belong to the design system
* which deployment-specific files belong to individual applications

Strong default:

```text
Design System
    ↓
Canonical source assets

Application
    ↓
Actual favicon / manifest / deployment artifacts
```

Do not force every deployment artifact into the npm package.

---

# 26. OpenGraph / Social Assets

Do not make the design system responsible for product-specific OG images.

Prefer:

```text
MAGI brand assets
        +
Product identity
        ↓
Product-specific OG image
```

The design system can provide source assets and guidelines.

Product applications should compose their own final social assets.

---

# 27. CSS Scope and `@layer`

Review the existing:

```text
data-magi-app
@layer
```

architecture.

Brand styles must obey the same CSS contract.

Do not introduce unnecessary cascade layers.

If a new layer is proposed, explain:

* why it is necessary
* what it controls
* what its ordering relationship is
* whether existing layers can already support the requirement

Do not create:

```text
magi.brand
magi.brand.logo
magi.brand.assets
magi.brand.product
```

without a real cascade requirement.

---

# 28. Public API Boundary

The package's public API must remain intentional.

Public:

```text
MagiLogo
MagiWordmark
MagiBrand
```

if approved.

Internal:

```text
SVG helpers
asset loading
private composition helpers
implementation utilities
```

Do not expose internal implementation details through the root:

```text
src/index.ts
```

unless they are intentionally part of the public API.

The root package export remains the canonical API boundary.

---

# 29. Asset Export Strategy

Evaluate whether consumers need:

```text
static assets
```

and:

```text
React components
```

Strong default:

> Support both when the existing build system allows it cleanly.

Example:

```text
Canonical SVG
    ├── used directly by applications
    └── consumed by React brand component
```

Do not maintain two independent logo implementations.

---

# 30. Design System Showroom

The existing showroom should gain a:

```text
Brand Foundation
```

section.

Demonstrate only the meaningful cases.

For example:

```text
MAGI Mark
MAGI Wordmark
MAGI Lockup
```

and:

```text
dark background
light background
navigation scale
large scale
small scale
```

If ProductBrand is implemented, demonstrate realistic product compositions.

The showroom should serve as:

> the visual contract surface of the Brand Foundation.

Do not introduce Storybook.

Do not introduce another documentation framework.

---

# 31. Testing

Add tests appropriate to the actual implementation.

At minimum evaluate:

### Unit

* renders correctly
* variants
* sizing
* accessibility attributes

### Accessibility

Use the existing accessibility testing infrastructure.

### Build

Verify:

```text
package build
CSS build
SVG assets
React imports
```

### Consumer

Verify realistic usage:

```ts
import { MagiLogo } from "@tokyo3rdhq/magi-design-system";
```

### Showroom

Verify all brand examples render.

### Visual

If existing Playwright visual infrastructure exists, add appropriate coverage.

Do not introduce a huge visual-testing framework solely for this feature.

---

# 32. Token Enforcement

Review the existing token-literal enforcement.

Brand implementation must not bypass the design-system token system with arbitrary styling.

However, distinguish legitimate SVG geometry from design token violations.

For example:

```text
SVG geometry
    ≠
design token literal
```

Do not modify token enforcement in a way that produces false positives for canonical brand assets.

---

# 33. Avoid These Anti-Patterns

Do NOT introduce:

```text
@magi/brand
@magi/assets
@magi/icons
```

unless a genuine dependency boundary is demonstrated.

Do NOT introduce:

* Storybook
* Tailwind
* Radix
* shadcn
* CSS-in-JS
* animation libraries
* Style Dictionary
* Figma token synchronization
* runtime branding registries
* CMS-driven brand configuration
* plugin systems
* generic branding engines

unless the architecture review demonstrates a concrete requirement.

---

# 34. Do Not Build a Generic Icon System

The MAGI logo is not equivalent to:

```text
Arrow
Search
Menu
Check
Close
```

Do not use this task to introduce:

```tsx
<MagiIcon />
```

or a global icon registry.

If icon architecture is missing, document it as a future architecture decision.

---

# 35. Do Not Overbuild Product Branding

Avoid:

```tsx
<ProductBrand
  product=""
  logo=""
  icon=""
  accent=""
  theme=""
  href=""
  description=""
  ...
/>
```

unless real consumers require this abstraction.

Remember:

> Product identity belongs primarily to the product.

The design system owns only the reusable visual contract.

---

# 36. Documentation

Create:

```text
docs/brand.md
```

It should document:

## Brand hierarchy

```text
MAGI
↓
Product
```

## Logo

* mark
* wordmark
* lockup
* approved variants

## Clear space

Use a simple practical rule.

Avoid unnecessary mathematical complexity.

## Minimum size

Document practical minimum sizes for:

* navigation
* normal usage
* compact usage

## Backgrounds

Document:

* dark
* light
* neutral

where applicable.

## Product relationship

Explain how:

```text
MAGI
Token Factory
```

relates to:

```text
MAGI
Models
```

and future products.

## Misuse

At minimum prohibit:

* stretching
* squashing
* rotation
* arbitrary recoloring
* arbitrary gradients
* glow effects
* inappropriate shadows
* geometry modification
* distortion
* insufficient contrast

Keep the document concise.

---

# 37. Architecture Review Document

Before implementation, create:

```text
docs/brand-foundation-architecture-review.md
```

The document must contain:

1. Current architecture reconstruction
2. Existing brand-related implementation
3. Proposed Brand Foundation boundary
4. Brand vs Design System boundary
5. Brand vs Product Identity boundary
6. Brand vs ProductTheme boundary
7. Asset strategy
8. React API proposal
9. CSS strategy
10. Accessibility strategy
11. Testing strategy
12. Showroom strategy
13. Public package API strategy
14. Migration strategy
15. Alternatives considered
16. Rejected approaches
17. Risks
18. Future extension points

---

# 38. Architecture Decision Table

Include:

| Decision                   | Recommendation | Reason | Revisit When |
| -------------------------- | -------------- | ------ | ------------ |
| Separate brand package     |                |        |              |
| `src/brand/`               |                |        |              |
| `src/assets/`              |                |        |              |
| Static SVG source of truth |                |        |              |
| React brand components     |                |        |              |
| ProductBrand               |                |        |              |
| Brand CSS                  |                |        |              |
| Favicon ownership          |                |        |              |
| OG image ownership         |                |        |              |
| Icon system                |                |        |              |
| Token integration          |                |        |              |

Do not fill this with generic best practices.

Base it on the actual repository.

---

# 39. Architecture Stress Test

Test the proposed architecture against:

```text
magi.website

models.magi.website

start.magi.website

future-product-a.magi.website

future-product-b.magi.website
```

Answer:

1. Can every product use the same MAGI mark?
2. Can products have different accents?
3. Can products have different icons?
4. Can a product have no icon?
5. Can product names change?
6. Can MAGI redesign its logo later?
7. Can the logo be used outside React?
8. Can documentation use the assets?
9. Can GitHub use the assets?
10. Can the design system remain one package?
11. Can the package continue to be published as `@tokyo3rdhq/magi-design-system`?
12. Is package namespace clearly separated from MAGI brand identity?

If any answer requires excessive abstraction, simplify the architecture.

---

# 40. Migration Strategy

Do not perform a broad refactor.

Preferred sequence:

```text
1. Architecture review
        ↓
2. Canonical brand assets
        ↓
3. React rendering API
        ↓
4. Brand documentation
        ↓
5. Showroom
        ↓
6. Existing Navbar / ProductHeader / Footer integration
        ↓
7. Consumer migration
```

Do not modify unrelated components.

Do not rename the npm package.

Do not create a new npm scope.

Do not modify ProductTheme unless the Brand Foundation genuinely depends on it.

If existing ProductTheme issues are discovered, document them separately unless they block implementation.

---

# 41. Recommended Initial Scope

Unless repository evidence strongly suggests otherwise, the initial implementation should contain:

```text
Brand Foundation
├── MAGI mark
├── MAGI wordmark
├── MAGI lockup
├── canonical SVG assets
├── minimal React rendering APIs
├── accessibility behavior
├── showroom examples
└── brand documentation
```

Potentially:

```text
ProductBrand
```

only if real existing consumers demonstrate repeated semantic reuse.

Do not build a complete brand framework.

---

# 42. Suggested Repository Structure

Only if compatible with the existing repository:

```text
@tokyo3rdhq/magi-design-system

src/
├── brand/
│   ├── MagiLogo.tsx
│   ├── MagiWordmark.tsx
│   ├── MagiBrand.tsx
│   ├── ProductBrand.tsx       # only if justified
│   └── index.ts
│
├── assets/
│   ├── logo/
│   │   ├── magi-mark.svg
│   │   ├── magi-wordmark.svg
│   │   └── magi-lockup.svg
│   │
│   └── icons/
│       ├── favicon.svg
│       └── app-icon.svg
│
├── tokens/
├── foundation/
├── layout/
├── components/
├── theme.tsx
├── styles/
└── index.ts

docs/
├── brand.md
└── brand-foundation-architecture-review.md
```

This is a proposal, not a mandatory structure.

Follow existing repository conventions where they are stronger.

---

# 43. Package API Example

If the architecture review approves the APIs, the expected consumer experience should be simple:

```tsx
import {
  MagiLogo,
  MagiWordmark,
  MagiBrand,
} from "@tokyo3rdhq/magi-design-system";
```

Do not expose internal paths as the primary API.

Avoid requiring consumers to know:

```text
src/brand/
src/assets/
src/internal/
```

The package root remains the public boundary.

---

# 44. Versioning

Brand Foundation changes are part of the design-system public contract.

Consider:

### Patch

* asset optimization without visual/API change
* documentation typo
* internal implementation fix

### Minor

* new brand component
* new supported variant
* new non-breaking asset

### Major

* removal/rename of public brand API
* breaking SVG contract
* breaking CSS contract
* removal of supported logo variant

Do not tie design-system major versions mechanically to React major versions.

Version the package according to its own public contract.

---

# 45. Final Architecture Principles

The implementation must satisfy:

## Principle 1 — MAGI is the brand

```text
MAGI
```

is the identity.

```text
@tokyo3rdhq
```

is only the package namespace.

---

## Principle 2 — One Design System

Keep the Brand Foundation inside:

```text
@tokyo3rdhq/magi-design-system
```

unless a genuine package dependency boundary emerges later.

---

## Principle 3 — Assets are canonical

Static SVG assets are the source of truth.

React components are rendering APIs.

---

## Principle 4 — Brand is stable

MAGI identity should not depend on individual product themes.

---

## Principle 5 — Products remain independent

Products can own:

* product name
* product icon
* product accent
* page composition
* interaction model

without modifying MAGI's core identity.

---

## Principle 6 — No second design system

Brand Foundation must reuse the existing:

* typography
* tokens
* spacing
* CSS architecture
* accessibility conventions
* build system

---

## Principle 7 — Small public API

Prefer a small API such as:

```text
MagiLogo
MagiWordmark
MagiBrand
```

over a universal branding engine.

---

## Principle 8 — Static assets remain first-class

Brand assets must remain usable outside React.

---

## Principle 9 — Documentation is part of the contract

Brand usage rules must be explicit.

---

## Principle 10 — Showroom is the visual contract

Brand Foundation must be visible and testable in the existing showroom.

---

## Principle 11 — Delay abstractions

Only extract:

```text
ProductBrand
generic icon system
brand configuration
separate package
```

when real usage demonstrates the need.

---

# 46. Final Review Output

At the end of the task, report:

## Architecture

* What Brand Foundation is
* What it is not
* Where it lives
* How it relates to tokens
* How it relates to ProductTheme
* How it relates to Product UI
* How it relates to the `@tokyo3rdhq` package namespace

## Public API

List the exact exported APIs.

## Assets

List canonical assets.

## Documentation

List added/modified documentation.

## Tests

List added tests.

## Showroom

List added visual contract examples.

## Migration

List migrated consumers.

## Deferred

Explicitly list what was intentionally NOT implemented.

## Risks

List remaining architectural risks.

## Final Assessment

Provide exactly:

### 5 decisions to keep

### 5 decisions to defer

### 5 risks to monitor

Do not provide a generic "looks good" conclusion.

The objective is to establish a durable MAGI Brand Foundation inside:

```text
@tokyo3rdhq/magi-design-system
```

without turning it into a separate branding framework, icon framework, or second design system.

