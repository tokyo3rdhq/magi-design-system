# MAGI Experience Guidelines

> **Layer** of the [framework-agnostic architecture](./architecture-review-framework-agnostic.md): Experience Guidelines sit between [CSS Foundation](./architecture-review-framework-agnostic.md) and [Component Contracts](./component-contracts.md). They define **how MAGI products should communicate and organize common user-facing experiences** — not what each product contains.
>
> **Guiding principle**: *MAGI owns the visual and experience language. Products own the product experience.*

---

## Table of contents

1. [Principles](#principles)
2. [Content & Copy](#content--copy)
3. [Internationalization](#internationalization)
4. [Iconography](#iconography)
5. [Links & External Destinations](#links--external-destinations)
6. [Navigation](#navigation)
7. [Header](#header)
8. [Footer](#footer)
9. [Responsive Behavior](#responsive-behavior)
10. [Accessibility](#accessibility)
11. [Product vs System Boundaries](#product-vs-system-boundaries)
12. [Examples](#examples)
13. [Exceptions](#exceptions)

---

## Principles

Five core principles govern every MAGI experience decision. They apply across all products and all surfaces (Dark / Light, mobile / desktop, React / non-React).

### 1. Clarity over decoration

Prefer explicit, understandable communication over decorative UI. A control that needs an explanatory tooltip to be understood is a control that needs to be redesigned, not annotated.

### 2. Icons support meaning; they do not replace it

Use icons as recognition aids where appropriate. Do not rely on unfamiliar icons as the sole carrier of important meaning. When a destination is ambiguous without text (e.g. "GitHub"), the icon is decoration; the text carries the meaning.

### 3. Text is the semantic source

Conceptual hierarchy:

```
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

Do not reverse this. An icon never carries more semantic weight than the text that accompanies it.

### 4. Quiet, precise interfaces

MAGI prefers:

- restrained visual expression
- clear hierarchy
- minimal decoration
- predictable interaction
- explicit semantics
- low visual noise

If a UI decision feels decorative, it is probably wrong for MAGI.

### 5. Consistency without rigidity

The same MAGI principles should appear across products. However, **products retain control** over their own information architecture, navigation depth, content hierarchy, product-specific actions, and product-specific destinations. The guidelines define the *language*, not the *page*.

---

## Content & Copy

Lightweight content principles. Do not create a large editorial style guide — only what is needed to keep products coherent.

### Labels

Prefer concise, action-oriented, unambiguous labels:

```
Documentation    (not "Explore")
Generate Config  (not "Generate")
Copy URL         (not "Copy")
View Models      (not "More")
```

Avoid vague fillers: `Explore`, `Continue`, `Go`, `More`, `Learn`. If a more precise label exists, use it.

### Action CTAs

Use verb-first, present-tense phrasing. State the outcome:

```
✓ "Generate Configuration"
✓ "Open in GitHub"
✗ "Click here"
✗ "Get started"
```

### Capitalization

- **Sentence case for product UI** (English): "View documentation", "Switch theme", "Open menu".
- **Sentence case for navigation labels and buttons**.
- **Title Case only for proper nouns** (product names, feature names, section headers that are themselves proper nouns): "Token Factory", "CodeBlock", "API Reference".

### Terminology consistency

Use one term per concept, across the product, across products:

- One of `model` / `Model` / `model ID` — pick one, document it.
- One of `config` / `configuration` / `setup` — pick one.
- One of `provider` / `vendor` / `source` — pick one.

When a product needs a domain-specific term, the product owns the term. But within the product, never alternate.

### Error messages

Three parts, in order:

1. **What happened** (one sentence, plain language, no jargon)
2. **Why** (the cause — only if the user can act on it)
3. **What to do** (the action, or a link)

```
✓ "Couldn't save your changes — your network is offline. Try again."
✗ "Save failed (E_NETWORK_OFFLINE)."
✗ "Something went wrong."
```

Never expose internal error codes to users. Log codes are for logs.

### Empty states

Three parts:

1. **What is empty** (what the user is looking at)
2. **Why it's empty** (or acknowledge it's the expected state)
3. **What they can do** (the primary action, or a clear "nothing to do yet")

```
✓ "No models match your filters. Try loosening the context window."
✓ "Nothing to compare yet. Add a model to get started."
```

---

## Internationalization

The MAGI experience language is **locale-aware** — not country-aware.

### Language representation

Prefer **language names** over flags. Default canonical set:

```
English
简体中文
日本語
Español
```

Use the **endonym** (the name a native speaker recognizes) in their native script. `中文` not `Chinese`. `日本語` not `Japanese`. `Español` not `Spanish`.

Sort the list according to the user's current locale's conventions (locale-aware alphabetical ordering, not by language code).

### Do not use country flags

Do not use:

```
🇺🇸 English
🇨🇳 中文
🇯🇵 日本語
```

Flags represent countries, not languages. A Spanish user from Mexico and a Spanish user from Spain share a language preference; flagging them differently is wrong.

If a product needs to disambiguate regional variants (e.g. `zh-CN` vs `zh-TW`), use the BCP-47 language tag explicitly in metadata (`<html lang="zh-CN">`, `<span lang="zh-CN">简体中文 (中国大陆)</span>`), not in flags.

### Emoji

**MAGI UI does not use emoji as the default semantic icon system.** Avoid patterns such as:

```
🌐 Language
💬 Discord
⭐ GitHub
📖 Docs
```

Emoji can appear in:

- user-generated content
- documentation examples and inline code samples
- marketing / editorial surfaces where editorial voice is intentional

But emoji do not become MAGI UI primitives.

### Language selector pattern

Two acceptable forms:

**Compact** (recommended for utility areas):

```
English ▾
```

**List** (recommended for footer / settings):

```
English
简体中文
日本語
Español
```

The selector should:

- clearly communicate its purpose
- be keyboard accessible (Tab + Enter, arrow keys to navigate the list)
- expose a visible focus state
- preserve the current page / context where possible (no full reload)
- work on mobile without taking over the screen (full-screen picker is acceptable on mobile; dropdown is acceptable on desktop)

### Language metadata

Always set `<html lang="...">` at the root. Update it when the user switches languages. For mixed-script content, set inline `lang="..."` on the element carrying the foreign-language text:

```html
<html lang="zh-CN">
  <body>
    <p>本页介绍 <span lang="en">the Color Modes</span> 章节。</p>
  </body>
</html>
```

Localization is not just translating visible strings. Different languages have different lengths, different reading directions, different conventions for numbers / dates / plural forms. Build components with these in mind, not as an afterthought.

---

## Iconography

Icons are a recognition aid. Text is the semantic source. Use the right combination.

### When icon-only is appropriate

Icon-only is acceptable for **highly conventional actions** where the icon has the same meaning as the text would (so a screen reader can convey it via `aria-label`):

| Action | Icon-only acceptable? |
|---|---|
| Search | ✅ Yes |
| Menu / Open menu | ✅ Yes |
| Close / Dismiss | ✅ Yes |
| More (horizontal `⋯`) | ✅ Yes |
| Back / Forward | ✅ Yes |
| Theme toggle (sun / moon) | ✅ Yes |
| Expand / Collapse | ✅ Yes |

### When icon-only is NOT the default

Icon-only is **not the default** for destinations or domain concepts that the user has not memorized:

| Destination | Default representation |
|---|---|
| GitHub | **Text** (or Icon + Text when context is unambiguous) |
| Discord | **Text** |
| Documentation / Docs | **Text** |
| Models | **Text** |
| API | **Text** |
| Status | **Text** |
| Community | **Text** |
| Pricing | **Text** |
| About | **Text** |
| Settings | **Text** |
| Account / Profile / User | **Text** |

The reason: a user who has never seen your product does not recognize your `★` from your `◆` from your `Github Mark`. Text does not need to be learned.

### Decision matrix

| Context | Default |
|---|---|
| Main navigation | Text |
| Primary CTA | Text |
| Search input | Text input; icon affordance optional |
| Menu toggle | Icon-only acceptable |
| Close button | Icon-only acceptable |
| GitHub link | Text (Icon + Text when space allows) |
| Discord link | Text |
| Documentation link | Text |
| External destination | Text + external indicator |
| Language selector | Text |
| Legal links (Privacy / Terms) | Text |
| Social destinations | Text (Icon + Text where space allows) |

When you break a row, document why. The matrix is normative; exceptions need a written reason.

### Icon construction

MAGI icons are produced as **canonical SVG assets** (one file per icon, single source of truth, served to both React consumers and static consumers).

- `fill="currentColor"` so the icon inherits the consumer's text color
- `viewBox` proportional (1:1 for marks, 4:3 for wordmarks, etc.)
- Semantic sizes only — `sm` (20px) / `md` (32px) / `lg` (48px) — pixel props are not part of the API
- No embedded text in icons (use a `Mark` + `Wordmark` composite lockup instead)

### External-link indicators

When the destination leaves the current site, communicate it. Acceptable indicators: an `↗` glyph (upper-right arrow) or an `external-link` icon. Either is sufficient — do not stack both unless there is a specific reason.

```
✓ "Documentation ↗"
✓ "[GitHub icon] GitHub ↗"
✗ "[GitHub icon] GitHub [external icon] ↗"
```

The text is the source of truth. The indicator is reinforcement, not a substitute.

---

## Links & External Destinations

External destinations should be understandable **before activation**, not just after.

### External destinations

Recognizable destinations should default to **recognition + explicit destination**:

```
✓ "GitHub"
✓ "[GitHub icon] GitHub"
✓ "Documentation ↗"

✗ "[GitHub icon]"       (unlabeled, ambiguous)
✗ "[GitHub icon] [external icon] ↗"   (redundant indicators)
```

If the surrounding context makes the destination unambiguous (e.g. a "Source code" card with a single link), an icon-only link with `aria-label="Source code on GitHub"` is acceptable.

### New-tab behavior

- External destinations MAY open in a new tab (`target="_blank"`) when leaving the product would interrupt the user's flow.
- Internal navigation NEVER opens in a new tab.
- When opening in a new tab, add `rel="noopener noreferrer"` for security and privacy.
- Never auto-open a new tab without an explicit user action (no popups, no surprise tabs).

### Accessibility for links

- Every link has an accessible name (visible text, `aria-label`, or `aria-labelledby`).
- A link that opens in a new tab announces the new-tab behavior either via `aria-label="Documentation (opens in new tab)"` or a visually-hidden text fragment.
- The visible text and the accessible name agree. If they must differ, the accessible name *extends* the visible text rather than replacing it.

---

## Navigation

### Principles

- **Three levels deep, max.** Four if absolutely necessary. More than that → restructure your IA, not your menu.
- **Order by user intent, not by org chart.** The most-used destination is leftmost (or first in vertical).
- **Group by task, not by surface.** "Products" / "Resources" / "Community" are task groups; "Engineering" and "Marketing" are org groups. Prefer task.
- **Each nav item earns its place.** If a user can find the destination faster by typing its name in a search, the nav item is taking up space without helping.

### Active state

The current page's nav item must visibly indicate its state. Acceptable indicators:

- a subtle accent color on the text
- a thin underline (1px, accent color, `var(--magi-radius-full`) at the bottom
- a small left-border accent (vertical nav)

Pick **one** indicator. Two indicators on the same item reads as decoration, not state.

### Hierarchy

When the same text appears in two nav levels (e.g., "Docs" in main nav and a "Docs" section in footer), the deeper occurrence is a more specific destination. Style the deeper one as **primary** within its context, not as a duplicate of the shallower one.

---

## Header

The Header is a **pattern**, not a mandatory component. The package does not ship a `<Header>` primitive.

### Header zones (optional, in left-to-right order)

```
┌─────────────────────────────────────────────────────────┐
│ MAGI       Products   Docs   ...          Utility Area │
└─────────────────────────────────────────────────────────┘
```

| Zone | Content | Generally MAGI-owned? |
|---|---|---|
| Brand | Logo lockup linking home | Yes |
| Navigation | Primary destination list | Product-owned |
| Utility Area | Language / theme / external / session | Mixed (see §11) |
| Product navigation | Product-specific tabs | Product-owned |

### Brand placement

The brand (MAGI logo) is **always leftmost**, links to the product's home, and remains visible across all viewports.

### Responsive Header

On mobile, primary navigation collapses (typically behind a Menu toggle). The utility area should never collapse entirely — at minimum, language and theme controls remain visible.

### Sticky / fixed Header

A sticky Header is acceptable, but **only if**:

- the backdrop has enough contrast to remain readable over scrolling content (the design system provides `backdrop-blur-xl bg-black/60 border-b border-line` as a reference)
- the sticky region is short (≤ 64px tall)
- it does not obscure the "fat footer" / sticky bottom controls (pick one sticky end)

### Header in this showroom (canonical reference)

```
[MAGI logo]   [Tokens] [Typography] [Buttons] [Cards] [Badges] [Layout] [Phase 4] [Brand]   [Theme ▾] [Accent ▾]
```

Brand left; primary nav center-spread; utility area right with theme + accent pickers.

---

## Footer

The Footer is also a pattern, not a mandatory component. The package does not ship a `<Footer>` primitive.

### Optional Footer zones

| Zone | Example content | Generally MAGI-owned? |
|---|---|---|
| Brand | Logo lockup + tagline | Yes (brand only) |
| Products | Product links | Product-owned |
| Resources | Docs / API / Status / Blog | Product-owned |
| Community | GitHub / Discord / etc. | Product-owned |
| Legal | Privacy / Terms / Cookies | Yes (must exist) |
| Language | Language selector | Yes (placement) |
| Copyright | © 2026 [entity] | Yes |

### Conceptual layout

```
MAGI

Products           Resources            Community
Models             Documentation        GitHub
Token Factory      API                  Discord

─────────────────────────────────────────────────────────

© 2026 MAGI        English    Privacy    Terms
```

This is an **example**, not a mandatory layout. Document the principles:

- clear visual hierarchy (brand → primary groups → utility row)
- groups collapse to a column on mobile
- external links carry the `↗` indicator
- legal links live at the bottom, separated by a divider
- copyright + language + legal form the "fat footer" base row

### Footer in this showroom (canonical reference)

```
© 2026 tokyo3rdhq    Tokens / Typography / Buttons / …    GitHub
```

Compact single-row reference footer in `pages.module.css` bottom styles.

---

## Responsive Behavior

Do not simply shrink desktop layouts. Define principles for breakpoint behavior.

### Desktop (≥ 1024px)

- **Icon + Text** preferred for utility controls
- Multi-column Footer groups
- Full-width Header with brand + nav + utility all visible

### Narrow desktop / tablet (640–1023px)

- **Text** alone acceptable for utility controls
- Selective collapse: hide secondary groups in Footer; primary groups remain

### Mobile (< 640px)

- **Icon-only** acceptable for strongly conventional actions (Search, Menu, Close, Back)
- Header navigation collapses to a Menu toggle
- Footer groups stack into a single column
- Do not collapse **semantic labels** purely because the screen is narrower

```
✓ "GitHub"     (desktop)
✗ "[icon]"     (because mobile is narrower — different audience, same destination)
```

Prefer **deliberate responsive prioritization** over arbitrary hiding. A link that exists on desktop should exist on mobile, even if its visual presentation changes.

### Container widths

The design system ships six container tiers. Use them:

| Container | Max-width | Use |
|---|---|---|
| `sm` | 640px | Settings, narrow forms |
| `md` | 768px | Login, single-column forms |
| `lg` | 1024px | Marketing pages with content |
| `xl` (default) | 1200px | Standard product pages |
| `wide` | 1400px | Data-dense product pages |
| `full` | 100% | Full-bleed surfaces |

Don't reinvent these. Don't use `100%` when `xl` would do.

---

## Accessibility

Accessibility is part of the experience, not an implementation afterthought.

### Mandatory checklist

Every shipped component and every shipped page must satisfy:

- [ ] Keyboard navigation works for every interactive element (Tab order matches visual order)
- [ ] `:focus-visible` is visible on every focusable element
- [ ] Every interactive element has an accessible name (visible text, `aria-label`, or `aria-labelledby`)
- [ ] Icon-only controls have `aria-label`
- [ ] Headings form a logical hierarchy (`h1` → `h2` → `h3`); never skip levels
- [ ] Color is not the only carrier of meaning
- [ ] Touch targets are ≥ 44px × 44px on mobile
- [ ] `<html lang="...">` reflects the current language
- [ ] External links that open in new tabs announce the new-tab behavior
- [ ] `prefers-reduced-motion: reduce` disables transitions

### Icon-only controls

If a control is icon-only, the icon is decoration. The control needs:

```html
<button aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>
```

The `aria-label` is the only thing a screen reader will announce. Make it match what the user sees ("Search", not "magnifying glass" — the icon does the recognition, the label does the semantics).

Do not use placeholder text or tooltip-only labeling as the sole accessible name.

### Visual minimalism must not reduce semantic clarity

A page with zero text labels because everything is icon-only is not "minimal" — it's inaccessible. The minimal version that preserves accessibility is the right minimum.

---

## Product vs System Boundaries

The single most important section of this document. Read it before adding any "system" requirement.

### MAGI defines (system-owned)

- The visual language (Dark / Light / accent / typography / spacing / radius)
- The brand assets and Logo Contrast Rule
- The Experience Principles (this document)
- The iconography rules (when icon-only vs text vs both)
- The internationalization rules (language names, no flags, no emoji UI)
- The accessibility floor (what every component must satisfy)
- The legal-link column convention (Privacy / Terms must exist in the Footer)
- The brand placement (logo leftmost in Header)

### Products decide (product-owned)

- Information architecture (what destinations exist in the nav)
- Navigation depth (how deep the menu goes)
- Content hierarchy (what's most prominent on each page)
- Product-specific actions (button labels, form fields)
- Product-specific destinations (which GitHub org? which Discord? which docs URL?)
- Footer column structure (the brand only requires that the columns exist, not how many)
- Whether to include a language selector (MAGI provides the pattern; the product decides whether to ship it)
- Page template / layout (no universal page template)

### Decision framework

For every proposed guideline, classify it:

| Classification | Meaning |
|---|---|
| **MUST** | All products follow this. No exceptions. |
| **Recommended MAGI default** | Default; products may deviate with documented reason. |
| **Context-dependent** | Decision belongs to the product; the guideline provides the decision framework. |
| **Product-owned** | System explicitly does not decide. |
| **Do not use** | System-level prohibition. All products must not do this. |

Examples:

| Proposal | Classification | Reason |
|---|---|---|
| Country flags for language selection | **Do not use** | Flags are wrong; we say so everywhere. |
| Language names | **Recommended MAGI default** | Use them, unless your product has a specific reason. |
| Icon-only Search | **Recommended MAGI default** | Convention is strong; text rarely improves it. |
| Icon-only GitHub | **Context-dependent** | Depends on the page's nav density. |
| GitHub link | **Product-owned** | The org URL is your call. |
| Exact Footer columns | **Product-owned** | The brand only requires that some structure exists. |
| Sentence case in English UI | **MUST** | All product UI must follow. |

---

## Examples

Each section above has rules; the examples below show how the rules combine into the patterns you'll actually ship.

### Language selector in a utility area (compact)

```
[Theme ▾] [English ▾]
```

The "Theme" picker and the "Language" picker follow the same pattern: a button with a chevron `▾` indicator; the chevron is decoration (icon) and the text is the label.

### Language selector in a Footer (list)

```
© 2026 tokyo3rdhq          Privacy      Terms
                           English ▾
```

A single inline list, no dropdown chrome. The user changes language, the page re-renders, the rest of the Footer stays in place.

### External destination with `↗` indicator

```html
<a href="https://github.com/tokyo3rdhq" target="_blank" rel="noopener noreferrer">
  GitHub
  <span aria-hidden="true">↗</span>
  <span class="visually-hidden"> (opens in new tab)</span>
</a>
```

The `↗` is visible to sighted users. The "(opens in new tab)" is visible only to screen readers. The accessible name is "GitHub (opens in new tab)".

### Icon + Text for a community destination

```jsx
<a href="https://github.com/tokyo3rdhq">
  <GitHubIcon aria-hidden="true" />
  GitHub
</a>
```

The icon is decorative (`aria-hidden="true"`). The text is the accessible name. The link says "GitHub" to a screen reader.

### Footer column collapse on mobile

```
Desktop                    Mobile

Products  Resources  ...   Products   ▾
Models    Docs              Resources  ▾
                              Community  ▾
                              ...
                              © 2026 tokyo3rdhq    Privacy    Terms
```

On desktop, three columns visible. On mobile, each group becomes a disclosure widget with a chevron. Legal links remain always-visible at the bottom.

---

## Exceptions

Every guideline can be overridden with a written reason.

When you break a guideline:

1. **Document why** in the place where the exception lives (a code comment, a doc note, an ADR).
2. **Verify accessibility still holds** — most rules have an a11y rationale; exceptions should not regress accessibility.
3. **Don't make it a precedent.** Exceptions are per-product, not for the whole family.

Examples of valid exceptions:

- "We use a `<select>` instead of a custom list for the language selector because the form already lives in a native `<form>` context, and the browser-native a11y wins."
- "Our Footer omits the Legal column because we're a CLI tool — `LICENSE` lives in the repo, not the UI."

Examples of invalid exceptions:

- "We use flags because they look cool." — prohibited; the rule is "do not use".
- "GitHub is icon-only because the brand is famous." — overridable for that one control IF the surrounding context makes it unambiguous AND you've added `aria-label`; document both.

---

## See also

- [Architecture Review — Framework-Agnostic](./architecture-review-framework-agnostic.md) — where Experience Guidelines sit in the conceptual layers
- [Brand Foundation](./brand.md) — Logo Contrast Rule + Color Modes
- [Component Contracts](./component-contracts.md) — semantic contracts that implement these guidelines
- [Design Tokens](./tokens.md) — the token primitives referenced by the guidelines
- [Migration Guide](./migration-guide.md) — adopting the guidelines in a new product