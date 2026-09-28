# Experience Guidelines Architecture & Design Review — @tokyo3rdhq/magi-design-system

## 0. Mission

You are reviewing and extending the experience architecture of:

`@tokyo3rdhq/magi-design-system`

The goal is to establish a formal **MAGI Experience Guidelines** layer that defines how MAGI products communicate, organize information, use icons, handle internationalization, expose external destinations, and construct common experience patterns.

This is NOT a request to build a generic UX framework.

This is NOT a request to create a large collection of Header/Footer/Page components.

The goal is to define the **experience language of the MAGI ecosystem** so that products such as:

* `magi.website`
* `models.magi.website`
* `start.magi.website`
* future MAGI products

can have different product experiences while still feeling like they belong to the same MAGI ecosystem.

The guiding principle is:

> **MAGI owns the visual and experience language. Products own the product experience.**

---

# 1. Context

The current MAGI Design System already contains several conceptual layers:

```text
MAGI Design System
│
├── 1. Brand Foundation
│   ├── Logo
│   ├── Mark
│   ├── Wordmark
│   ├── Lockup
│   └── Brand usage
│
├── 2. Design Tokens
│   ├── Color
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Motion
│   ├── Breakpoints
│   └── Theme
│
├── 3. CSS Foundation
│
├── 4. Component Contracts
│   ├── Button
│   ├── Card
│   ├── Input
│   ├── FormField
│   └── ...
│
├── 5. Framework Implementations
│   └── React
│
└── 6. Product Applications
```

Add a new conceptual layer:

```text
Experience Guidelines
```

The resulting architecture should be understood as:

```text
MAGI Design System
│
├── Brand Foundation
│
├── Design Tokens
│
├── CSS Foundation
│
├── Experience Guidelines
│
├── Component Contracts
│
├── Framework Implementations
│
└── Product Applications
```

Experience Guidelines should sit conceptually between the foundational design language and concrete component implementations.

---

# 2. What Experience Guidelines Means

Define Experience Guidelines as:

> A set of principles and reusable interaction/content patterns that describe how MAGI products should communicate and organize common user-facing experiences.

It should answer questions such as:

* How should a language selector be presented?
* Should languages use country flags?
* When should an icon be accompanied by text?
* When is icon-only acceptable?
* Should emoji be used as UI primitives?
* How should GitHub and Discord links appear?
* How should external links be communicated?
* What belongs in a Header utility area?
* What belongs in a Footer?
* How should navigation hierarchy be expressed?
* How should accessibility influence icon-only controls?
* How should these patterns behave responsively?
* Which rules are global MAGI principles and which are product-specific decisions?

It should NOT prescribe:

* every product's navigation structure
* every product's exact Footer columns
* every product's exact Header links
* a fixed number of navigation items
* mandatory GitHub/Discord links
* product-specific information architecture
* product-specific copy
* a universal page template

---

# 3. Core Boundary

Establish and document this distinction:

```text
MAGI Experience Guidelines
        │
        │ defines
        ▼
How common experiences should be expressed
        │
        ▼
Product Information Architecture
        │
        │ decides
        ▼
What the specific product actually contains
```

For example:

MAGI may define:

> External community destinations should normally be represented using recognizable icon + explicit text.

But MAGI should NOT define:

> Every MAGI product must contain GitHub and Discord.

Similarly:

MAGI may define:

> A language selector should use language names rather than country flags.

But MAGI should NOT define:

> Every MAGI product must support English and Simplified Chinese.

---

# 4. Experience Principles

Establish a concise set of principles.

At minimum evaluate and document the following.

## 4.1 Clarity over decoration

Prefer explicit, understandable communication over decorative UI.

## 4.2 Icons support meaning; they do not automatically replace it

Use icons as recognition aids where appropriate.

Do not rely on unfamiliar icons as the sole carrier of important meaning.

## 4.3 Text is the semantic source

Use the following conceptual hierarchy:

```text
Icon
  ↓
visual recognition

Text
  ↓
semantic meaning

Link / control
  ↓
interaction
```

Do not reverse this relationship unnecessarily.

## 4.4 Quiet, precise interfaces

MAGI should prefer:

* restrained visual expression
* clear hierarchy
* minimal decoration
* predictable interaction
* explicit semantics
* low visual noise

Avoid turning every interaction into an icon-heavy or highly ornamental UI.

## 4.5 Consistency without rigidity

The same MAGI principles should appear across products.

However, products should retain control over:

* information architecture
* navigation depth
* content hierarchy
* product-specific actions
* product-specific destinations

---

# 5. Internationalization Guidelines

Define a formal MAGI i18n experience guideline.

## 5.1 Language representation

Evaluate and document the preferred representation of languages.

Default principle:

```text
English
简体中文
日本語
Español
```

Prefer language names over country flags.

Do NOT use:

```text
🇺🇸 English
🇨🇳 中文
🇯🇵 日本語
```

as the default language-selection representation.

Reason:

> Countries and languages are not equivalent concepts.

Do not use country codes as a substitute for language names unless there is a specific technical/product requirement.

---

## 5.2 Emoji

Define the role of emoji explicitly.

MAGI UI should NOT use emoji as the default semantic icon system.

Avoid patterns such as:

```text
🌐 Language
💬 Discord
⭐ GitHub
📖 Docs
```

Emoji may appear in:

* user-generated content
* documentation examples
* marketing/editorial content where appropriate

But they should not become MAGI UI primitives.

---

## 5.3 Language selector

Define recommended patterns.

For example:

```text
English    简体中文
```

or:

```text
English ▾
```

or a compact equivalent where space is constrained.

Document when each pattern is appropriate.

A language selector should:

* clearly communicate its purpose
* be keyboard accessible
* have a visible focus state
* expose correct language metadata
* preserve the current page/context where possible
* work on mobile layouts

---

## 5.4 Language metadata

Document accessibility and semantic requirements such as:

```html
<html lang="en">
```

and language-specific text metadata where appropriate:

```html
<span lang="zh-CN">简体中文</span>
```

Do not treat localization as merely translating visible strings.

---

# 6. Iconography Guidelines

Define when MAGI uses:

* icon-only
* text-only
* icon + text
* icon + text + external-link indicator

Create a decision framework.

For example:

```text
Does the icon have a universally recognizable meaning?
        │
        ├── Yes → icon-only may be appropriate
        │
        └── No
             ↓
        use explicit text
```

Document examples.

### Icon-only is generally appropriate for highly conventional actions:

```text
Search
Menu
Close
More
Back
Forward
```

### Icon-only is generally NOT the default for:

```text
GitHub
Discord
Community
Documentation
Models
API
Status
```

These should generally use explicit text, optionally supported by an icon.

---

# 7. Text + Icon Decision Matrix

Create a formal table similar to:

| Context              | Default                        |
| -------------------- | ------------------------------ |
| Main navigation      | Text                           |
| Primary CTA          | Text                           |
| Search               | Icon-only may be appropriate   |
| Menu                 | Icon-only may be appropriate   |
| Close                | Icon-only may be appropriate   |
| GitHub               | Icon + Text                    |
| Discord              | Icon + Text                    |
| Documentation        | Text or Icon + Text            |
| Community            | Text or Icon + Text            |
| External destination | Text + external indicator      |
| Language selector    | Text                           |
| Legal links          | Text                           |
| Social destinations  | Icon + Text where space allows |

Do not blindly apply these examples.

Explain the underlying rule so products can make justified exceptions.

---

# 8. External Links

Define how MAGI should represent destinations outside the current product/site.

Recommended principle:

> External destinations should be understandable before activation.

Consider patterns such as:

```text
GitHub ↗
Discord ↗
Documentation ↗
Status ↗
```

or:

```text
[GitHub icon] GitHub ↗
```

Do not automatically add multiple redundant indicators.

For example, avoid unnecessarily heavy combinations such as:

```text
[GitHub icon] GitHub [external icon] ↗
```

unless there is a clear reason.

Define:

* when an external-link indicator is needed
* when a recognizable brand icon is useful
* when text is mandatory
* accessibility requirements
* hover/focus behavior
* new-tab behavior if applicable

---

# 9. GitHub / Discord / Community Destinations

Define a specific MAGI guideline for developer/community destinations.

MAGI products may link to:

* GitHub
* Discord
* Documentation
* API reference
* Status
* Community
* Blog
* other external destinations

Default principle:

```text
Recognition + explicit destination
```

Therefore:

```text
GitHub
Discord
Documentation
```

or:

```text
[GitHub icon] GitHub
[Discord icon] Discord
[Docs icon] Documentation
```

should generally be preferred over:

```text
[GitHub icon]
[Discord icon]
[Docs icon]
```

unless the surrounding context makes the destination unambiguous.

---

# 10. Header Guidelines

Define the MAGI Header as a pattern, not a mandatory component.

Conceptually:

```text
┌─────────────────────────────────────────────────────────┐
│ MAGI       Products   Docs   ...          Utility Area │
└─────────────────────────────────────────────────────────┘
```

Define potential Header zones:

```text
Brand
Navigation
Product navigation
Utility actions
External/community destinations
Language selector
Account/session controls
```

Explain which are:

* generally reusable
* optional
* product-specific

Do not require every MAGI product to have the same Header.

---

# 11. Header Utility Area

Define guidelines for the right-side utility area.

Potential contents:

```text
Search
Theme
Language
GitHub
Documentation
Account
Menu
```

Establish hierarchy.

Avoid turning the utility area into an icon dump.

For example, do not encourage:

```text
[⌕] [🌐] [GitHub] [Discord] [Theme] [User] [...]
```

without considering hierarchy.

Prefer grouping and prioritization:

```text
Documentation   GitHub   EN   Theme
```

or contextually appropriate subsets.

The principle is:

> Utility controls should remain discoverable without becoming visual noise.

---

# 12. Footer Guidelines

Define the Footer as an optional common pattern.

MAGI Footer should support:

* brand identity
* product/resource navigation
* community links
* external destinations
* legal links
* language selection where appropriate
* copyright / ownership information

A conceptual Footer may look like:

```text
MAGI

Products          Resources          Community
Models            Documentation      GitHub
Token Factory     API                Discord
                  Status             ...

────────────────────────────────────────────

© 2026 MAGI       English   Privacy   Terms
```

But this is an example, NOT a mandatory MAGI layout.

Document the principles behind the structure:

* hierarchy
* grouping
* scannability
* responsive collapse
* external-link semantics
* accessibility

---

# 13. Responsive Experience

Experience Guidelines must consider responsive behavior.

Do not simply shrink desktop layouts.

Define principles for:

### Desktop

Potentially:

```text
Icon + Text
```

### Narrow desktop/tablet

Potentially:

```text
Text
```

or selectively collapsed groups.

### Mobile

Potentially:

```text
Icon-only
```

for strongly conventional actions.

But do NOT remove semantic labels merely because screen width is smaller.

For example:

```text
GitHub
```

should not automatically become:

```text
[GitHub icon]
```

just because the screen is narrower.

Prefer deliberate responsive prioritization over arbitrary hiding.

---

# 14. Accessibility

Treat accessibility as part of Experience Guidelines, not as an implementation afterthought.

At minimum define:

* keyboard navigation
* focus visibility
* accessible names
* icon-only control labeling
* language metadata
* external-link communication
* link semantics
* heading hierarchy
* navigation landmarks
* reduced motion
* sufficient contrast
* touch target considerations

Important principle:

> Visual minimalism must not reduce semantic clarity or accessibility.

For icon-only controls:

```html
<button aria-label="Search">
```

must remain semantically understandable.

Do not use placeholder text or tooltip-only labeling as the sole accessible name.

---

# 15. Content & Copy Guidelines

Experience Guidelines should also define a lightweight MAGI content language.

Evaluate and document:

* concise labels
* action-oriented CTA wording
* capitalization
* terminology consistency
* technical terminology
* error messages
* empty states
* navigation labels
* external destination labels

Prefer:

```text
Documentation
Generate Config
Copy Configuration
View Models
```

over vague labels such as:

```text
Explore
Continue
Go
More
```

when a more precise label is available.

Do not create a large editorial style guide unless the repository actually needs one.

---

# 16. Brand vs Product Language

Define the relationship between:

```text
MAGI Brand Language
```

and:

```text
Product Language
```

MAGI should provide:

* tone principles
* visual restraint
* terminology consistency
* interaction principles
* naming conventions where appropriate

Products may still define:

* domain-specific terminology
* product-specific copy
* workflow-specific instructions
* product-specific onboarding

Do not force every product to sound identical.

The goal is:

> Recognizable MAGI family, not cloned products.

---

# 17. Patterns vs Components

Do NOT turn every guideline into a React component.

For example:

```text
LanguageSelector
Footer
Header
ExternalLink
SocialLink
```

may eventually become reusable components, but that decision must follow actual repeated semantic contracts.

First define:

```text
Experience Pattern
```

Then determine whether repeated implementation justifies:

```text
Component Contract
```

Do not create speculative components merely because a pattern exists in the documentation.

---

# 18. Framework-Agnostic Requirement

Experience Guidelines must remain framework-agnostic.

Do not define guidelines in terms of:

```text
React props
React Context
JSX
Vue components
```

Instead define:

```text
semantic structure
interaction
content
accessibility
visual behavior
responsive behavior
```

Framework implementations may later implement those contracts.

---

# 19. Relationship with Existing Brand Foundation

Do not duplicate Brand Foundation rules.

Brand Foundation should own:

```text
Logo
Mark
Wordmark
Lockup
Brand colors
Brand usage
Logo contrast
Brand assets
```

Experience Guidelines should consume those principles and define:

```text
How those assets appear in product experiences.
```

For example:

Brand Foundation:

> MAGI logo uses `currentColor` and should maintain sufficient contrast.

Experience Guidelines:

> On dark product surfaces, the logo should resolve to the appropriate light semantic foreground; on light surfaces, it should resolve to the appropriate dark semantic foreground.

Do not create competing brand rules.

---

# 20. Relationship with Design Tokens

Experience Guidelines may reference semantic tokens but should not redefine them.

For example:

```text
Experience Guideline
    ↓
Use semantic foreground color
    ↓
Design Token
    ↓
--magi-text-primary
```

Do not hard-code colors inside guidelines unless the value itself is a formal brand rule.

---

# 21. Relationship with Component Contracts

Establish this distinction:

```text
Experience Guideline
    ↓
When and why something should be used
```

versus:

```text
Component Contract
    ↓
How the reusable UI primitive behaves
```

Example:

```text
Experience Guideline:
External destinations should be explicit.

Component Contract:
Link component supports an external-link indicator.
```

Do not collapse these concepts.

---

# 22. Repository Reconnaissance

Before making changes, inspect the repository.

At minimum inspect:

```text
README.md
docs/
src/brand/
src/tokens/
src/components/
src/layout/
src/styles/
src/theme.tsx
src/index.ts
showroom/
package.json
```

Look for existing conventions related to:

* navigation
* external links
* icons
* typography
* language
* footer/header
* accessibility
* theme
* dark/light mode
* responsive behavior

Do not invent rules that already exist elsewhere in the repository.

Identify contradictions between current implementation and proposed Experience Guidelines.

---

# 23. Required Documentation Structure

Prefer starting with:

```text
docs/guidelines.md
```

rather than immediately creating many small documents.

Recommended structure:

```text
docs/guidelines.md

# MAGI Experience Guidelines

## Principles

## Content & Copy

## Internationalization

## Iconography

## Links & External Destinations

## Navigation

## Header

## Footer

## Responsive Behavior

## Accessibility

## Product vs System Boundaries

## Examples

## Exceptions
```

Only split this into multiple files if the content becomes sufficiently large or independently maintained.

---

# 24. Showroom Requirements

Extend the showroom only where useful.

The showroom should demonstrate Experience Guidelines visually.

At minimum consider examples for:

```text
Language selector
Icon + Text
Icon-only
External links
Header utility area
Footer
Dark mode
Light mode
Responsive behavior
```

The showroom should act as a visual contract surface.

Avoid turning it into a complete product website.

---

# 25. Decision Framework

For every proposed guideline, classify it as one of:

```text
MUST
Recommended MAGI default
Context-dependent
Product-owned
Do not use
```

Example:

```text
Country flags for language selection
→ Do not use

Language names
→ Recommended MAGI default

Icon-only Search
→ Recommended MAGI default

Icon-only GitHub
→ Context-dependent

GitHub link
→ Product-owned

Exact Footer columns
→ Product-owned
```

This prevents Experience Guidelines from becoming an overly rigid product template.

---

# 26. Anti-Patterns

Explicitly document anti-patterns such as:

### Language

```text
🇺🇸 English
🇨🇳 中文
```

### Emoji UI

```text
🌐 Language
💬 Discord
📖 Docs
```

### Ambiguous icon-only navigation

```text
[?]   [?]   [?]
```

without accessible or visible meaning.

### Icon dumping

```text
[Search] [GitHub] [Discord] [Theme] [Language] [User] [...]
```

without hierarchy.

### Redundant external indicators

```text
[GitHub icon] GitHub [external icon] ↗
```

when one clear representation is sufficient.

### Product cloning

Making every MAGI product use exactly the same:

* Header
* Footer
* navigation
* information architecture

---

# 27. No Premature Abstractions

Do NOT introduce:

```text
@magi/guidelines
@magi/content
@magi/i18n
@magi/navigation
@magi/footer
```

Do NOT split the npm package.

Do NOT create a separate package merely because Experience Guidelines now exist.

The current package remains:

```text
@tokyo3rdhq/magi-design-system
```

Experience Guidelines are primarily a design-system documentation/contract layer.

Only introduce reusable implementation primitives when actual product reuse demonstrates a stable semantic contract.

---

# 28. Deliverables

Produce the following.

## A. Current-state analysis

Explain:

* what experience rules already exist
* where they currently live
* which are implicit
* which are contradictory
* which are missing

## B. Experience Architecture

Produce:

```text
MAGI Design System
├── Brand Foundation
├── Design Tokens
├── CSS Foundation
├── Experience Guidelines
├── Component Contracts
├── Framework Implementations
└── Product Applications
```

Explain the responsibility of each layer.

## C. Experience Principles

Define the core MAGI experience principles.

## D. Internationalization Guidelines

Define:

* language naming
* language selector
* flags
* emoji
* accessibility
* responsive behavior

## E. Iconography Guidelines

Define:

* icon-only
* text-only
* icon + text
* external-link indicators
* recognizable vs ambiguous icons

## F. Header Guidelines

Define:

* brand
* navigation
* utility area
* external links
* language selector
* responsive behavior

## G. Footer Guidelines

Define:

* brand
* resource navigation
* community
* external destinations
* legal
* language
* responsive behavior

## H. External Link Guidelines

Define:

* GitHub
* Discord
* Docs
* Status
* Community
* external destinations
* accessibility

## I. Content Guidelines

Define lightweight rules for:

* labels
* CTA text
* terminology
* capitalization
* errors
* empty states

## J. Accessibility Guidelines

Define the required semantic and interaction behavior.

## K. Product Boundary

Explicitly document:

```text
MAGI-owned
vs
Product-owned
```

## L. Implementation Recommendations

Identify which guidelines require:

```text
documentation only
```

versus:

```text
existing component changes
```

versus:

```text
new component contracts
```

Do not implement speculative abstractions.

---

# 29. Final Evaluation Criteria

The resulting Experience Guidelines should satisfy:

### Consistency

Different MAGI products should feel like members of the same ecosystem.

### Flexibility

Products should retain control over their own IA and workflows.

### Clarity

Users should understand what controls and links mean.

### Accessibility

Minimalism must not compromise semantic accessibility.

### Framework Agnosticism

Guidelines must not depend on React.

### Dark-first MAGI Identity

The experience language must remain compatible with MAGI's dark-first visual identity while supporting the formal Light/Dark theme system.

### Low Visual Noise

Avoid excessive icons, decorative emoji, redundant indicators, and overloaded utility areas.

### Explicit Semantics

Prefer meaningful text when an icon alone is ambiguous.

### No Premature Engineering

Do not turn every guideline into a component or package.

---

# 30. Final Question

After reviewing the repository, answer:

> **What should MAGI standardize at the Experience Guidelines level, and what should remain intentionally owned by individual products?**

The final recommendation should optimize for:

```text
MAGI consistency
        +
product autonomy
        +
semantic clarity
        +
accessibility
        +
implementation simplicity
```

Do not optimize for the maximum number of rules or components.

The objective is a **small, coherent, durable MAGI Experience Language**, not a giant enterprise UX framework.

