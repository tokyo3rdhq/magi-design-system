# Framework Agnostic Architecture Review

## @tokyo3rdhq/magi-design-system

## 0. Mission

Review and, where necessary, refactor the architecture of:

`@tokyo3rdhq/magi-design-system`

The goal is **not** to make the current package support Vue immediately.

The goal is to establish a correct architectural boundary between:

* the **MAGI Design System as a framework-agnostic design language**
* the **current React implementation**
* future framework implementations such as Vue
* the MAGI brand identity
* shared design tokens
* shared CSS foundations
* framework-specific behavior and rendering

The central architectural principle is:

> **MAGI owns the design language. Frameworks own the implementation.**

The current package may remain React-oriented for the time being, but the architecture must not accidentally define React as a requirement of the MAGI Design System itself.

---

# 1. Terminology — Establish the Correct Mental Model

Before modifying code, establish these definitions and use them consistently throughout the review.

### MAGI

`MAGI` is the product/lab brand.

It owns the overall visual language and identity.

Examples:

* logo
* wordmark
* color language
* typography
* spacing
* radius
* visual density
* interaction language
* accessibility principles
* product visual consistency

---

### MAGI Design System

The Design System is the shared design language used across the MAGI ecosystem.

It should conceptually be framework-agnostic.

It defines:

* Brand Foundation
* Design Tokens
* CSS / visual foundations
* component visual contracts
* accessibility contracts
* layout principles
* interaction principles
* responsive principles
* documentation and usage rules

It should NOT conceptually require React.

---

### `@tokyo3rdhq/magi-design-system`

This is the current npm package.

Important:

* npm namespace: `@tokyo3rdhq`
* package: `@tokyo3rdhq/magi-design-system`
* brand: `MAGI`

Do NOT rename this package to `@magi/design-system`.

Do NOT introduce a new package name merely to solve the conceptual architecture problem.

Instead, determine what portion of the current package is:

1. framework-agnostic
2. React-specific
3. potentially reusable by future Vue implementation
4. implementation detail that should remain private

The current package can remain the primary package during the 0.x phase.

---

# 2. Target Conceptual Architecture

The target architecture should conceptually become:

```text
MAGI Design System
│
├── Brand Foundation
│   ├── Logo
│   ├── Mark
│   ├── Wordmark
│   ├── Product Lockup
│   ├── Favicon / App Icon
│   └── Brand Guidelines
│
├── Design Tokens
│   ├── Color
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Border
│   ├── Shadow / Elevation
│   ├── Motion
│   ├── Z-index
│   └── State
│
├── CSS Foundation
│   ├── Reset
│   ├── Base Typography
│   ├── Accessibility Defaults
│   ├── Layout Foundations
│   ├── Component Visual Styles
│   └── Theme Variables
│
├── Component Contracts
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Form
│   ├── Dialog
│   ├── Navigation
│   └── ...
│
├── Guidelines
│   ├── Accessibility
│   ├── Responsive Design
│   ├── Layout
│   ├── Content
│   ├── Brand Usage
│   └── Component Usage
│
└── Framework Implementations
    │
    ├── React
    │   └── @tokyo3rdhq/magi-design-system
    │
    └── Vue
        └── future implementation
```

This is a **conceptual architecture first**, not a requirement to immediately create multiple npm packages.

Do not prematurely split the repository into:

```text
@magi/tokens
@magi/brand
@magi/react
@magi/vue
```

unless the repository analysis demonstrates a real dependency boundary that justifies doing so.

---

# 3. Core Architectural Rule

Use this dependency direction:

```text
Brand
   │
Tokens
   │
CSS Foundation
   │
Component Contract
   │
Framework Implementation
   │
Application
```

Never reverse this dependency direction.

For example:

```text
GOOD

React Component
      ↓
CSS Classes / CSS Variables
      ↓
MAGI Tokens


BAD

MAGI Tokens
      ↓
React Context
      ↓
Design System definition
```

React must be an implementation consumer, not the architectural foundation of the Design System.

---

# 4. Framework-Agnostic vs Framework-Specific

Inspect every major part of the current repository and classify it.

Use this classification:

### A. Framework Agnostic

Can exist without React.

Examples:

* SVG brand assets
* CSS variables
* CSS tokens
* CSS reset
* typography definitions
* spacing scale
* color definitions
* radius definitions
* CSS component styles
* accessibility visual states
* documented HTML structure
* design guidelines

---

### B. Framework-Neutral Runtime

Potentially shared between frameworks but requires JavaScript/TypeScript.

Examples:

* token transformation
* class-name generation
* variant resolution
* deterministic style utilities
* component configuration
* validation utilities

Only classify something here if it truly has zero framework dependency.

---

### C. React Implementation

Explicitly React-dependent.

Examples:

* React components
* React hooks
* React Context
* `forwardRef`
* JSX
* React event handling
* `cloneElement`
* React-specific providers
* React-specific state management

---

### D. Application-Specific

Should not be part of the Design System.

Examples:

* product-specific navigation
* product-specific pages
* product-specific workflows
* business logic
* API calls
* application state
* product-specific data models

---

# 5. Repository Reconnaissance

Before changing anything, inspect the entire repository.

Pay particular attention to:

```text
src/
tokens/
foundation/
layout/
components/
brand/
assets/
styles/
theme.tsx
index.ts
showroom/
docs/
tests/
package.json
vite.config.*
tsconfig.*
README.md
```

Also inspect:

* `package.json`
* peer dependencies
* build configuration
* CSS entry points
* export map
* TypeScript configuration
* test configuration
* showroom implementation
* existing architecture documents
* existing README
* existing design tokens
* existing `ProductTheme`
* existing `useProductTheme`
* CSS scope strategy
* `data-magi-app`
* `@layer` usage

Do not make architectural assumptions before inspecting the actual implementation.

---

# 6. Analyze the Current Package Boundary

Determine exactly what the current npm package represents.

Answer:

1. Is it currently a React component library?
2. Is it currently a Design System?
3. Is it both?
4. Which parts are genuinely framework-agnostic?
5. Which parts are React-specific?
6. Does the README make these distinctions clear?
7. Does `package.json` communicate the same distinction?
8. Does the public API expose implementation details?
9. Could a Vue application consume the shared visual foundation without importing React?
10. Could a plain HTML application consume the CSS foundation?

Do not change package naming merely because the current package is React-specific.

---

# 7. React Must Be an Implementation Layer

The current React implementation may continue to provide:

```tsx
<Button />
<Card />
<Input />
<FormField />
<Dialog />
<Stack />
<Container />
```

and:

```tsx
<ProductTheme />
useProductTheme()
```

However, these should be understood as:

```text
MAGI Design System
        ↓
React Implementation
        ↓
React Components
```

not:

```text
React
   ↓
MAGI Design System
```

Explicitly document this distinction.

---

# 8. Brand Foundation

Brand should be framework-agnostic.

The canonical source of truth should be static assets and documented rules.

Potential assets:

```text
assets/
└── brand/
    ├── magi-mark.svg
    ├── magi-wordmark.svg
    ├── magi-lockup.svg
    ├── favicon.svg
    └── app-icon.svg
```

React wrappers may exist:

```tsx
<MagiLogo />
<MagiWordmark />
<MagiBrand />
```

but they are rendering APIs over the underlying brand assets.

The SVG asset itself must not depend on React.

Do not turn Brand Foundation into a generic icon library.

Do not create a giant brand abstraction.

Do not introduce product branding abstractions unless multiple products actually need them.

---

# 9. Design Tokens

Tokens must be framework-agnostic.

Treat CSS custom properties as the primary web runtime representation.

Example:

```css
:root {
  --magi-color-bg-primary: ...;
  --magi-color-fg-primary: ...;
  --magi-color-accent: ...;

  --magi-space-1: ...;
  --magi-space-2: ...;

  --magi-radius-sm: ...;
  --magi-radius-md: ...;

  --magi-font-sans: ...;

  --magi-motion-fast: ...;
}
```

React components should consume these tokens.

Future Vue components should consume the same tokens.

A Vue application should not need to redefine:

```text
colors
spacing
typography
radius
shadows
motion
```

just because it does not use React.

---

# 10. Theme Architecture

Review the current `ProductTheme` implementation carefully.

Determine whether the current implementation:

* writes variables to `document.documentElement`
* creates global side effects
* depends on React Context
* supports nested themes
* supports SSR
* creates hydration mismatch risks
* has cleanup behavior
* duplicates token definitions
* mixes brand identity with product theme

The desired conceptual separation is:

```text
Brand
   ↓
MAGI visual identity

Theme
   ↓
runtime customization / product accent / mode

Component
   ↓
consumes semantic tokens
```

Brand and product theme must not become the same concept.

---

# 11. Theme Runtime Boundary

React Context may remain useful for React-specific behavior.

For example:

```tsx
<MagiThemeProvider>
  ...
</MagiThemeProvider>
```

is acceptable as a React implementation.

But the underlying theme representation should remain framework-neutral.

Prefer:

```text
Theme configuration
        ↓
CSS variables
        ↓
components
```

over:

```text
Theme configuration
        ↓
React Context
        ↓
React-specific styling
```

The latter creates unnecessary framework coupling.

---

# 12. CSS Foundation

The CSS layer should be treated as a first-class part of the Design System.

Review:

```text
reset
tokens
foundation
layout
components
```

and establish explicit CSS layer ordering.

For example:

```css
@layer
  magi.reset,
  magi.tokens,
  magi.foundation,
  magi.layout,
  magi.components;
```

Determine whether this is currently applied consistently.

Also inspect the existing:

```css
body[data-magi-app]
[data-magi-app]
```

scope strategy.

There must be one clear rule.

Do not leave multiple subtly different scoping mechanisms without architectural justification.

---

# 13. HTML / DOM Contract

For every reusable component, define the conceptual DOM contract independently from React.

For example:

```text
Button

DOM:
<button class="magi-button magi-button--primary">

States:
[data-state="..."]
[aria-disabled="true"]
:hover
:focus-visible
:disabled

CSS:
.magi-button { ... }
```

React then maps:

```tsx
<Button variant="primary" />
```

to that contract.

A future Vue implementation should map:

```vue
<MagiButton variant="primary" />
```

to the same visual and accessibility contract.

This avoids building separate visual systems for React and Vue.

---

# 14. Component Contracts

For every existing component, document:

* purpose
* semantic HTML
* visual states
* variants
* sizes
* accessibility behavior
* keyboard behavior
* CSS contract
* token dependencies
* framework-specific behavior

Separate:

### Design contract

from:

### React API

Example:

```text
Design contract:

Button
- primary
- secondary
- ghost
- destructive
- disabled
- loading
- focus-visible

React implementation:

<Button
  variant="primary"
  loading
/>
```

The React prop API is an implementation interface.

The component contract is part of the Design System.

---

# 15. Accessibility

Accessibility belongs to the Design System, not only the React implementation.

Review:

* semantic HTML
* keyboard navigation
* focus behavior
* focus-visible
* ARIA
* disabled states
* loading states
* error states
* form labeling
* description relationships
* dialog behavior
* screen-reader behavior

Pay particular attention to the existing `FormField` implementation.

Investigate whether:

```text
cloneElement
```

is being used to inject:

* id
* aria-describedby
* aria-invalid
* aria-labelledby

````

and whether this can overwrite consumer-provided attributes or assumes a single focusable child.

Define a more explicit FormControl contract if appropriate.

Do not solve this merely as a React implementation trick.

---

# 16. Layout Primitives

Review:

```text
Container
Section
Stack
````

and determine whether their semantics are truly framework-independent.

The design rules should describe:

```text
Container
- max width
- horizontal padding
- responsive behavior

Stack
- axis
- gap
- alignment
- wrapping

Section
- vertical rhythm
- width behavior
- responsive behavior
```

React components are one API over these rules.

Do not allow layout semantics to become React-specific.

---

# 17. Showroom

The existing showroom should become the **Design System Contract Surface**.

It should demonstrate:

```text
Brand
Tokens
Typography
Colors
Spacing
Layout
Components
States
Accessibility
Themes
Responsive behavior
```

It should answer:

> "What does MAGI Design System actually mean?"

rather than simply:

> "What React components does this npm package export?"

Where practical, showroom examples should expose the underlying DOM/CSS contract.

Future framework implementations should be able to use the same conceptual examples.

---

# 18. Vue Compatibility Analysis

Do NOT implement Vue support yet unless explicitly required.

Instead, perform a compatibility analysis.

For every current capability, classify:

```text
Works unchanged
Can be shared
Requires framework adapter
React-specific
Should be redesigned
Should be removed
```

Example:

| Capability             | Framework Agnostic? | React-specific? |
| ---------------------- | ------------------: | --------------: |
| CSS tokens             |                 Yes |              No |
| SVG brand assets       |                 Yes |              No |
| CSS reset              |                 Yes |              No |
| Typography             |                 Yes |              No |
| Button visual contract |                 Yes |              No |
| Button JSX component   |                  No |             Yes |
| React Context          |                  No |             Yes |
| React hooks            |                  No |             Yes |
| Vue SFC                |                  No |             Vue |
| HTML/CSS foundation    |                 Yes |              No |

The objective is to make a future Vue implementation **possible without redesigning MAGI's visual language**.

---

# 19. Plain HTML Compatibility

Also evaluate whether the CSS foundation could theoretically be consumed by:

```html
<button class="magi-button magi-button--primary">
  Continue
</button>
```

without React.

This does not mean a first-class HTML component package must be created.

It is an architectural test:

> If the CSS and design contracts fundamentally require React, the system is probably too framework-coupled.

---

# 20. Package Strategy

Do not prematurely split packages.

For the current 0.x stage, prefer:

```text
@magi-design-system
        │
        ├── framework-agnostic assets
        ├── tokens
        ├── CSS foundation
        ├── brand
        └── React implementation
```

inside the existing package/repository where practical.

Only introduce separate packages when an actual dependency boundary exists.

Potential future architecture:

```text
MAGI Design System

packages/
│
├── tokens
│
├── css
│
├── react
│
└── vue
```

But this is a **future option**, not a mandatory refactor.

The review must explicitly identify:

* what would justify splitting
* what would not justify splitting
* when package extraction should happen
* what migration cost would be created

---

# 21. Public API

Review:

```text
src/index.ts
```

as the canonical public API boundary.

Ensure consumers do not accidentally depend on:

```text
internal files
implementation paths
private CSS files
internal utilities
React internals
```

The public API should make the architectural boundary obvious.

For example:

```ts
// React implementation
export {
  Button,
  Card,
  Input,
  FormField,
  ...
}
```

while framework-neutral assets and styles have their own clearly defined exports where appropriate.

Do not expose every internal file.

---

# 22. README Review

Rewrite the README conceptually so that it does not imply:

> MAGI Design System = React 18 component library

Instead, explain:

```text
MAGI Design System
------------------

The shared visual foundation for the MAGI product ecosystem.

This repository currently provides the React implementation
of the MAGI Design System.

The underlying design language is framework-agnostic and is
built around shared brand assets, design tokens, CSS foundations,
component contracts, and accessibility principles.

React is the current implementation target.
Future framework implementations may consume the same foundation.
```

React compatibility should be described separately:

```text
## React compatibility

This package currently provides the React implementation.

Supported / tested React versions:
...
```

Do not describe React 18 as a requirement of the MAGI Design System itself.

It is a requirement of the current React package implementation.

---

# 23. Testing Architecture

Review whether testing currently validates only:

```text
TypeScript
Build
Import
```

Expand the conceptual testing model to:

```text
Design System
│
├── Token tests
├── CSS contract tests
├── Component behavior tests
├── Accessibility tests
├── SSR tests
├── React implementation tests
├── Visual regression tests
└── Consumer integration tests
```

The most important principle:

> Test the Design System contract, not only the React implementation.

Where possible, visual and accessibility contracts should be reusable by future framework implementations.

---

# 24. Visual Regression

Treat visual regression as part of the Design System contract.

The system exists primarily to guarantee visual consistency across MAGI products.

Therefore test:

* colors
* typography
* spacing
* radius
* component states
* dark mode
* responsive layouts
* focus states
* error states
* disabled states

The showroom should become the primary visual regression surface.

---

# 25. MAGI Ecosystem Stress Test

Evaluate the architecture against these applications:

```text
magi.website
models.magi.website
start.magi.website
future *.magi.website
```

Assume that:

```text
magi.website
```

may use one frontend framework,

while:

```text
models.magi.website
```

or:

```text
start.magi.website
```

may use another.

The visual language must remain consistent.

Ask:

> Can two applications built with React and Vue look like they belong to the same MAGI ecosystem without duplicating the Design System?

If not, identify the architectural boundary causing the problem.

---

# 26. What NOT To Do

Do NOT:

* rename `@tokyo3rdhq/magi-design-system`
* create `@magi/design-system`
* immediately create `@magi/tokens`
* immediately create `@magi/brand`
* immediately create a Vue package
* rewrite the whole component library
* introduce Tailwind solely to solve framework compatibility
* introduce Radix solely to solve framework compatibility
* introduce CSS-in-JS
* introduce a generic icon registry
* introduce a large theming framework
* create an abstraction layer for every possible framework
* duplicate React and Vue component logic prematurely
* optimize for hypothetical frameworks that MAGI does not use

Avoid architecture astronautics.

The objective is a **clean dependency boundary**, not maximum abstraction.

---

# 27. Required Deliverables

After inspecting the repository, produce:

## A. Current Architecture Diagram

Show what the repository actually looks like today.

Example:

```text
Current MAGI Design System

tokens
   ↓
CSS
   ↓
React
   ↓
components
```

but use the actual repository structure.

---

## B. Target Architecture Diagram

Show the recommended architecture:

```text
MAGI Design System
│
├── Brand Foundation
├── Tokens
├── CSS Foundation
├── Component Contracts
├── Guidelines
│
└── Framework Implementations
    ├── React
    └── Vue (future)
```

---

## C. Framework Coupling Matrix

Produce a table:

| Area          | Current | Framework Agnostic | React-specific | Action |
| ------------- | ------- | ------------------ | -------------- | ------ |
| Tokens        | ...     | ...                | ...            | ...    |
| Brand         | ...     | ...                | ...            | ...    |
| CSS           | ...     | ...                | ...            | ...    |
| Layout        | ...     | ...                | ...            | ...    |
| Components    | ...     | ...                | ...            | ...    |
| Theme         | ...     | ...                | ...            | ...    |
| Accessibility | ...     | ...                | ...            | ...    |
| Showroom      | ...     | ...                | ...            | ...    |

---

## D. Dependency Graph

Show:

```text
what depends on what
```

and identify any dependency inversion.

Especially detect:

```text
framework-agnostic layer
        ↓
React
```

which is acceptable,

versus:

```text
design tokens
        ↓
React Context
```

which should be questioned.

---

## E. README Assessment

Answer:

1. Does the current README correctly describe the package?
2. Does it accidentally imply that React is part of the Design System definition?
3. Does it correctly distinguish React implementation from Design System?
4. What sections should be rewritten?
5. What wording should be changed?

Provide concrete recommendations.

---

## F. Refactoring Plan

Separate changes into:

### Phase 0 — Documentation / Architecture

No breaking changes.

Clarify:

* terminology
* architecture
* package role
* React implementation role
* README
* docs

### Phase 1 — Boundary Cleanup

Small implementation changes:

* token boundaries
* CSS scope
* theme boundaries
* brand assets
* public exports
* component contracts

### Phase 2 — Contract Hardening

Add:

* accessibility tests
* visual regression
* SSR testing
* showroom contract
* consumer tests

### Phase 3 — Future Framework

Only when needed:

```text
Vue implementation
```

without changing the underlying MAGI design language.

---

# 28. Decision Framework

For every proposed architectural change, classify it as:

### KEEP

Already correct.

### REFACTOR

Conceptually correct but implementation boundary is wrong.

### DEFER

Useful eventually but unnecessary now.

### REMOVE

Creates unnecessary coupling or abstraction.

### FUTURE

Only required when another framework is actually introduced.

Do not refactor merely because a theoretical future architecture could be cleaner.

---

# 29. Final Architectural Principle

The final architecture should satisfy all of the following:

```text
MAGI brand is framework agnostic.

MAGI design tokens are framework agnostic.

MAGI CSS foundation is framework agnostic.

MAGI component contracts are framework agnostic.

React components are React-specific implementations.

Vue components, if introduced later, are Vue-specific implementations.

Product applications consume the Design System.

Products do not redefine the MAGI visual language.

Framework choice does not determine MAGI's visual identity.
```

The most important invariant is:

```text
              MAGI DESIGN SYSTEM
                      │
          ┌───────────┼───────────┐
          │           │           │
       React         Vue        HTML
          │           │           │
      React UI     Vue UI      CSS/DOM
          │           │           │
          └───────────┼───────────┘
                      │
              SAME MAGI LANGUAGE
```

The implementation may differ.

The design language must not.

---

# 30. Final Report

End the review with:

## Architecture Verdict

One concise paragraph describing whether the current architecture is fundamentally sound.

## 5 Things To Keep

The five most important architectural decisions that should remain.

## 5 Things To Refactor

The five most important changes required to establish the framework boundary.

## 5 Things To Defer

Changes that would be premature at the current stage.

## 5 Biggest Risks

Especially:

* React coupling
* token duplication
* CSS contract drift
* theme/brand confusion
* premature package splitting

## Recommended Target Architecture

Provide the final architecture diagram.

## Recommended Next Step

Give one concrete next implementation step.

Do not implement a large refactor unless the repository evidence demonstrates that it is necessary.

