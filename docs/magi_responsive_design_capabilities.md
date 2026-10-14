# Task: Add Responsive Design Capabilities to `@tokyo3rdhq/magi-design-system`

## 1. Context

Repository: https://github.com/tokyo3rdhq/magi-design-system

Package: `@tokyo3rdhq/magi-design-system`

Primary consumer: Token Factory Initializr (TFI), especially `models.magi.website` Browse page.

MAGI uses a dark, Apple-inspired visual language. The design system is intended to provide a consistent visual foundation for multiple MAGI products.

The current design system already contains design tokens, CSS foundations, React components, and basic layout primitives such as `Container`, `Section`, and `Stack`.

However, the TFI Browse page becomes difficult or impossible to use when the viewport narrows. Components and text become cramped, controls compete for space, and the layout does not adapt appropriately.

We need to establish responsive design as a first-class capability of the shared design system, rather than patching each consuming application independently.

## 2. Objectives

Audit and extend the existing design system to establish a consistent, accessible, mobile-first responsive design system.

The work must cover:

1. Responsive design tokens and breakpoint conventions.
2. Responsive layout primitives and CSS utilities.
3. Responsive behavior and minimum-width constraints for existing components.
4. Typography, spacing, wrapping, overflow, and touch-target behavior.
5. Responsive design documentation and usage examples.
6. Automated tests and responsive visual validation.
7. Compatibility with existing consumers and the current framework-agnostic design-system architecture.

Do not redesign the entire MAGI visual language. Preserve its existing dark theme, brand identity, accent conventions, accessibility principles, and CSS cascade architecture.

## 3. Phase 1: Audit Before Implementation

Inspect the existing repository and understand its actual architecture before making changes.

Read at least:

- `README.md`
- `docs/tokens.md`
- `docs/component-contracts.md`
- Relevant architecture decision records under `docs/adr/`
- Existing breakpoint and spacing token definitions
- Existing layout primitive implementations
- Existing component CSS and React implementations
- Existing tests, build configuration, and visual regression setup

Determine:

- Which responsive tokens already exist and their current values.
- Which components already use media queries.
- Whether responsive styles are consistent or scattered.
- Which layout components are missing.
- Whether components have fixed widths, non-wrapping flex layouts, inflexible grid columns, oversized padding, or typography that does not scale appropriately.
- Which existing consumers or public APIs could be affected.

Do not duplicate existing functionality. Extend or refine existing APIs where appropriate.

Document the audit findings and a short implementation plan before making substantial changes.

## 4. Responsive Design Principles

### 4.1 Mobile-first

Use mobile-first CSS as the default:

- Base styles must work at narrow viewport widths.
- Larger breakpoints progressively enhance the layout.
- Do not simply shrink desktop layouts until they fit.
- Reflow content, stack controls, simplify navigation, and change layout structures when necessary.
- Preserve all essential functionality on narrow screens.

### 4.2 Breakpoint tokens

Establish a small, consistent, documented breakpoint scale.

Use the following as initial candidates, but reconcile them with existing tokens before implementation:

| Token | Candidate value | Typical purpose |
|---|---:|---|
| `xs` | 480px | Small-screen refinements |
| `sm` | 640px | Compact-to-expanded layouts |
| `md` | 768px | Tablet and primary layout transition |
| `lg` | 1024px | Desktop layouts and multi-column content |
| `xl` | 1280px | Wide desktop refinement |

These values are proposals, not a requirement to add five breakpoints if the current system already has a better scale.

Requirements:

- Define a canonical source of truth.
- Use consistent names across documentation, tokens, layout primitives, and component styles.
- Explain when each breakpoint should be used.
- Avoid introducing arbitrary one-off breakpoints throughout the codebase.
- Do not assume every component must change at every breakpoint.
- Ensure responsive styles do not depend on CSS custom properties directly inside `@media` conditions, since browser media-query syntax does not generally accept `var()` there. Keep CSS breakpoint values and documented tokens synchronized through an appropriate implementation strategy.

### 4.3 Viewport responsiveness versus container responsiveness

Distinguish between:

- **Viewport-based responsiveness:** the page adapts to the browser viewport.
- **Container-based responsiveness:** a component adapts to the available width of its parent container.

Prefer container queries for reusable components whose behavior should depend on their allocated space rather than the full viewport, when this meaningfully improves reuse and is supported by the existing architecture.

Do not introduce unnecessary JavaScript resize listeners.

### 4.4 Fluid typography and spacing

Audit typography and spacing tokens.

Use `clamp()` where fluid scaling is useful, while retaining explicit minimum and maximum values.

Requirements:

- Headlines must not overwhelm narrow screens.
- Body text must remain readable.
- Buttons and controls must not become excessively narrow.
- Long labels and model identifiers must wrap, truncate, or scroll intentionally.
- Preserve readable line heights and hierarchy.
- Respect browser zoom and user font-size preferences.

Do not scale every element uniformly.

## 5. Responsive Layout Primitives

Audit the current layout primitives and implement or improve the smallest useful set.

Potential primitives include:

### Container

Ensure `Container` supports:

- Responsive horizontal gutters.
- Existing size presets and max-width behavior.
- Correct `box-sizing`.
- No accidental horizontal overflow.
- Full-width layouts when explicitly requested.

Do not break existing `size` presets or default behavior without a clear migration strategy.

### Stack

Ensure `Stack` can adapt between horizontal and vertical layouts.

Consider a backward-compatible responsive direction API if the existing API cannot express common responsive layouts.

For example, conceptually:

```tsx
<Stack direction="column" gap="4">
  ...
</Stack>
```

and, where supported by the API design:

```tsx
<Stack responsiveDirection={{ base: "column", md: "row" }}>
  ...
</Stack>
```

The exact API should follow existing component conventions. Do not introduce a complex responsive-prop framework solely to support this example.

### Grid

Provide a reusable responsive grid primitive or improve the existing implementation.

It should support common patterns such as:

- One column on narrow screens.
- Two columns on medium screens.
- Three or more columns on wider screens.
- Automatic fitting when appropriate.

Use `minmax(0, 1fr)`, `min-width: 0`, and other appropriate CSS techniques to prevent long content from forcing columns wider than their containers.

### Cluster / wrapping row

Provide a reusable pattern for controls, badges, filters, and actions that should wrap onto multiple lines.

Use flex wrapping and consistent gaps rather than allowing controls to overlap or compress indefinitely.

### Sidebar / content layout

If justified by the current design-system architecture, provide a simple responsive pattern for a sidebar plus main content:

- Side-by-side on sufficiently wide screens.
- Stacked or collapsed on narrow screens.
- No horizontal overflow.
- No unnecessary fixed widths.

Avoid introducing a large layout framework. Prefer a small set of composable primitives with clear contracts.

## 6. Responsive Component Contracts

Audit every existing component, prioritizing:

- Button
- Card
- Badge
- FormField and form controls
- Segmented controls
- Banner
- Navigation-related components, if present
- Typography utilities
- Container, Section, and Stack

For each component, establish the appropriate responsive behavior.

Requirements:

### Buttons and actions

- Support wrapping action groups.
- Prevent button labels from overlapping icons or adjacent controls.
- Preserve usable target sizes.
- Avoid forcing every button to occupy the full width on desktop.
- Allow full-width actions on narrow screens when appropriate.

### Cards

- Use responsive padding where appropriate.
- Allow content to wrap.
- Prevent long text or identifiers from expanding the card beyond its parent.
- Preserve consistent spacing and visual hierarchy.

### Form controls

- Allow labels, descriptions, errors, and controls to wrap.
- Ensure inputs can shrink to fit their container without overflowing.
- Keep controls usable at narrow widths.
- Preserve validation and accessibility behavior.

### Badges and metadata

- Allow wrapping in groups.
- Avoid compressing text until it becomes unreadable.
- Define intentional overflow behavior for long labels.

### Segmented controls

- Determine when controls should wrap, scroll, or change to another layout.
- Never allow text or segments to overlap.
- Preserve keyboard interaction and accessible selection semantics.

Do not apply one universal responsive behavior to every component. Select behavior based on component semantics and document it.

## 7. Responsive CSS and API Design

Follow existing architectural boundaries:

- Design tokens and brand language remain framework-agnostic.
- CSS foundations and layout styles remain usable outside React.
- React components remain thin implementations of documented contracts.
- Avoid coupling responsive behavior to Vite, Cloudflare, or a specific consuming application.
- Preserve the existing `magi-` CSS naming conventions and cascade layers.

Use existing CSS layers and token conventions. Avoid adding global selectors that unexpectedly change application-specific components.

Do not introduce Tailwind, a new styling library, or a CSS-in-JS dependency.

Do not create responsive variants for every possible prop combination. Prefer mobile-first CSS, composable layout primitives, and a small number of meaningful responsive APIs.

If responsive utility classes are appropriate, document their public contract and keep them consistent with the existing design system.

## 8. TFI Browse as the Validation Scenario

Use the TFI Browse page as a representative consuming application.

Repository: https://github.com/tokyo3rdhq/token-factory-initializr

Inspect the actual Browse page implementation before recommending changes.

Identify the source of its narrow-width failures, including:

- Header and navigation layout.
- Page-level container and gutters.
- Search and filter controls.
- Provider and capability filters.
- Select-all-visible and bulk actions.
- Model list or grid.
- Model cards and metadata.
- Selection indicators and action buttons.
- Long model IDs and descriptions.
- Pagination or result summaries, if present.

The design system must provide reusable capabilities that help solve these problems, but application-specific information architecture must remain in TFI.

For example, TFI may need to:

- Collapse filter controls into a filter panel.
- Stack search and bulk actions.
- Change a multi-column model layout into one column.
- Move secondary metadata to another line.
- Simplify navigation.
- Keep essential selection and generation actions accessible.

Do not force all these behaviors into generic design-system components if they are product-specific.

If the TFI repository is not available in the current environment, complete the design-system changes and document the integration recommendations without pretending to have modified or tested TFI.

## 9. Acceptance Criteria

Validate the system at representative viewport widths:

| Viewport | Expected behavior |
|---|---|
| 320px | Essential content remains usable; no accidental horizontal page overflow |
| 375px | Mobile layout is readable and controls remain usable |
| 640px | Compact layout transitions without cramped controls |
| 768px | Tablet layout behaves consistently |
| 1024px | Desktop-oriented layout becomes usable |
| 1440px | Wide layouts remain constrained and readable |

These widths are test cases, not mandatory breakpoint values.

Acceptance requirements:

1. No accidental horizontal page overflow at the tested widths.
2. Text does not overlap adjacent components.
3. Controls do not collapse into unusably narrow widths.
4. Cards and grids reflow according to available space.
5. Long model identifiers and metadata have intentional overflow behavior.
6. Form labels, descriptions, and validation messages remain readable.
7. Interactive controls remain accessible via keyboard.
8. Focus indicators remain visible.
9. Touch targets follow the existing accessibility policy and use approximately 44px minimum targets where practical.
10. Browser zoom and increased text size do not break the layout.
11. Existing desktop appearance remains substantially consistent.
12. Existing public APIs remain backward-compatible where practical.
13. Build, typecheck, tests, and visual regression checks pass.

Use automated viewport testing and screenshots if the repository's current tooling supports them. Otherwise, add an appropriate lightweight responsive validation strategy without introducing unnecessary dependencies.

Test actual layout behavior rather than only asserting that media-query strings exist.

## 10. Documentation

Update the relevant documentation:

- `docs/tokens.md`: responsive token definitions and usage.
- `docs/component-contracts.md`: responsive expectations for components.
- README: responsive layout capabilities and examples.
- Architecture decision records: only if a meaningful architectural decision warrants one.

Include:

- The canonical breakpoint scale.
- Mobile-first conventions.
- When to use viewport media queries versus container queries.
- Responsive layout examples.
- Text wrapping and overflow conventions.
- Guidance for consuming applications.
- Examples of common anti-patterns.

## 11. Compatibility and Release

The design system is shared by multiple products. Avoid unnecessary breaking changes.

Before implementation, inspect the current package version, export conventions, public component APIs, and release practices.

Requirements:

- Preserve existing props and defaults wherever possible.
- Export new public primitives through the established entry points.
- Ensure CSS is included in the existing stylesheet build.
- Add or update TypeScript declarations.
- Run all relevant build, typecheck, test, and lint commands.
- Report whether a patch, minor, or major version bump is appropriate under the repository's versioning policy.
- Do not publish a package or modify a consuming production deployment unless explicitly authorized.

## 12. Deliverables

At completion, provide:

1. Audit findings and root causes.
2. Implemented responsive tokens and layout capabilities.
3. Components and CSS updated.
4. New or changed public APIs, with usage examples.
5. Tests performed and their results.
6. Any remaining limitations.
7. A concise TFI integration plan identifying which Browse-page changes belong in the application rather than the design system.
8. Recommended package version bump.

## 13. Implementation Principles

- Inspect first; implement second.
- Prefer reusable capabilities over application-specific patches.
- Avoid unnecessary abstraction and responsive-prop complexity.
- Preserve the MAGI design language.
- Make narrow screens usable through deliberate reflow, not indiscriminate shrinking.
- Do not claim visual validation unless it was actually performed.
- Do not change unrelated functionality or business logic.
- Keep changes focused, documented, testable, and suitable for a shared npm package.
