# MAGI Design System — Architecture Evolution & Implementation Refactoring

你现在负责维护：

`https://github.com/tokyo3rdhq/magi-design-system`

这是 MAGI product family 的共享 Design System。

当前仓库已经具备第一版基础架构，包括：

* design tokens
* foundation / reset / typography
* layout primitives
* Button / Card / Badge 等基础组件
* ProductTheme
* Vite library build
* TypeScript declarations
* CSS bundled output
* Vite showroom
* architecture / token / migration 文档

当前 README 将项目定位为：

> Shared visual foundation for the MAGI product family — dark-first, near-monochrome, restrained.

当前核心架构大致是：

```text
@magi-design-system
│
├── Tokens
├── Foundation
├── Layout primitives
├── UI components
└── Theme
```

当前 package 通过：

```ts
import '@tokyo3rdhq/magi-design-system/styles.css'
```

加载统一 stylesheet，并通过 React components 提供 UI API。

---

# 0. 任务性质

这不是一次普通的组件开发任务。

不要直接从现有代码出发：

```text
“哪里不好 → 修改哪里”
```

而应该采用：

```text
Current Architecture
        ↓
Architecture Review
        ↓
Target Architecture
        ↓
Migration Gap Analysis
        ↓
Implementation Refactoring
        ↓
Validation
```

也就是说：

> **先设计新的 MAGI Design System 架构，再从新架构的视角审视现有实现，最后进行迁移。**

不要因为当前实现已经存在，就为了兼容旧代码而保留明显不合理的架构。

允许进行结构性重构。

但是：

> 不要为了“架构漂亮”而无意义重写所有组件。

必须区分：

1. Architecture changes
2. API changes
3. Implementation changes
4. Documentation changes
5. Testing / validation changes

---

# 1. MAGI Design System 的长期定位

请先理解这个项目真正要解决的问题。

MAGI 不是一个普通的网站，而是一个产品族：

```text
MAGI
│
├── magi.website
├── models.magi.website
├── start.magi.website
├── api.magi.website
├── chat.magi.website
├── agent.magi.website
└── future MAGI products
```

这些产品应该：

> 共享 MAGI 的 visual language，但不应该被强制设计成完全相同的产品。

因此 Design System 的核心原则是：

```text
MAGI owns the visual language.
Products own the experience.
```

Design System 应该负责：

* visual language
* design tokens
* semantic tokens
* typography
* spacing
* surfaces
* borders
* radii
* motion principles
* accessibility primitives
* interaction conventions
* reusable UI primitives
* reusable layout primitives
* reusable patterns when duplication is proven

Design System 不应该负责：

* 产品业务逻辑
* 产品信息架构
* 产品-specific workflows
* 产品-specific domain models
* 产品-specific API logic
* 产品-specific page layouts
* 为了“未来可能复用”而提前抽取的组件

---

# 2. 第一阶段：不要修改代码，先进行 Architecture Audit

首先完整阅读：

```text
README.md
CONTRIBUTING.md
CHANGELOG.md

docs/
  architecture.md
  magi_design_system.md
  tokens.md
  migration-guide.md

packages/design-system/
apps/showroom/
.github/
```

同时检查：

* package.json
* tsconfig
* vite.config
* CSS architecture
* token definitions
* theme implementation
* component implementations
* exports
* build output
* CI
* tests
* showroom

不要只看 README。

需要真正理解当前代码的实际行为。

---

# 3. 输出一份 Current Architecture Map

在修改代码之前，建立当前架构图。

例如：

```text
Current MAGI Design System

tokens
   ↓
foundation
   ↓
layout
   ↓
components
   ↓
theme
   ↓
bundled CSS
   ↓
React consumers
```

然后明确：

### Token layer

当前有哪些 token？

例如：

```text
color
typography
spacing
radius
motion
breakpoints
misc
```

### Foundation

当前负责什么？

### Layout

当前有哪些 primitives？

### Components

当前有哪些组件？

### Theme

当前如何实现？

### CSS

当前的：

* selector strategy
* scope strategy
* reset strategy
* cascade strategy
* CSS bundle strategy

### Build

当前：

```text
Vite
+
tsc
```

各自负责什么？

### Package

当前 exports 是什么？

### Consumer

当前预计哪些产品会消费它？

---

# 4. Architecture Review：重点检查以下问题

必须逐项分析，不要笼统地说“可以优化”。

---

## 4.1 Token Architecture

重新评估当前 token 是否只是：

```text
visual values
```

还是已经形成：

```text
Primitive Tokens
        ↓
Semantic Tokens
        ↓
Component Tokens
```

目标架构优先考虑：

```text
@magi/design-tokens

Primitive
│
├── colors
├── spacing
├── typography
├── radius
├── motion
└── breakpoints

        ↓

Semantic
│
├── background
├── surface
├── foreground
├── border
├── action
├── status
└── focus

        ↓

Component
│
├── button
├── input
├── card
├── badge
└── ...
```

分析当前 token 是否存在以下问题：

* primitive 和 semantic 混合
* component token 缺失
* component CSS 直接使用硬编码颜色
* component CSS 直接使用硬编码 spacing
* token naming 不一致
* token 语义不清晰
* token 层级无法支持未来 theme
* product accent 与 semantic token 耦合

不要为了形式上的三层而机械拆分。

只有真正有语义价值的 token 才应该存在。

---

# 5. 判断是否应该拆出 `@magi/design-tokens`

认真评估以下架构：

```text
@magi/design-tokens
        │
        ├── CSS variables
        ├── token definitions
        └── token types / metadata
                 │
                 ↓
@magi/design-system
        │
        ├── foundation
        ├── layout
        ├── components
        └── React implementation
```

目标是：

> MAGI visual language 不应该从属于 React。

也就是说：

```text
MAGI Design Language
        ↓
Technology-neutral token layer
        ↓
React Design System
```

如果当前阶段拆 package 会造成过度工程化，请明确说明理由。

不要为了“理论上跨框架”而过度设计。

但必须评估未来：

```text
React
Astro
plain HTML/CSS
Web Components
other MAGI frontend stacks
```

对 token layer 的需求。

---

# 6. Theme Architecture 重新设计

重点审查当前：

```tsx
<ProductTheme accent="green">
  ...
</ProductTheme>
```

的设计。

需要回答：

### Theme 是否应该产生额外 DOM？

如果：

```tsx
<ProductTheme>
  <App />
</ProductTheme>
```

最终生成：

```html
<div>
  <App />
</div>
```

是否会影响：

* layout
* stacking context
* height
* flex/grid
* portals
* selectors
* accessibility
* SSR

如果有问题，设计更合理的 Theme API。

---

## Theme 的目标

Theme 应该表达：

```text
MAGI base visual system
        +
controlled product-level customization
```

例如：

```tsx
<MagiThemeProvider accent="cyan">
```

而不是允许：

```tsx
<ProductTheme
  tokens={{
    margin: ...
    background: ...
    fontSize: ...
  }}
/>
```

不要暴露过多 CSS implementation details。

尤其重新审视：

```ts
Partial<CSSProperties>
```

是否是合理的 public API。

优先设计 typed semantic theme API。

---

# 7. Product Theme 的边界

必须保持：

```text
Product can customize:
    accent
    product-specific semantic emphasis

Product cannot casually customize:
    MAGI typography
    MAGI spacing
    MAGI radius
    MAGI base surfaces
    MAGI interaction conventions
```

否则：

```text
MAGI Design System
```

最终会退化成：

```text
generic configurable UI framework
```

这不是目标。

---

# 8. CSS Architecture 重新评估

当前实现使用：

```css
.magi-button
.magi-card
...
```

以及：

```css
body[data-magi-app] .magi-*
```

需要重新评估：

* global CSS namespace
* scope boundary
* selector specificity
* foundation reset
* component selector specificity
* CSS cascade
* CSS layer
* host application interference
* CSS Modules
* Shadow DOM
* `@scope`
* `@layer`

不要因为“CSS Modules 在当前 Vite library mode 有问题”就直接假设当前方案永远正确。

---

# 9. 推荐重点研究的 CSS architecture

评估是否应该逐步形成：

```css
@layer magi.reset;
@layer magi.tokens;
@layer magi.foundation;
@layer magi.layout;
@layer magi.components;
```

并评估：

```html
<div data-magi>
```

作为 application-level scope。

重点回答：

> Design System 应该污染整个 `<body>`，还是应该拥有一个明确的 application boundary？

---

# 10. 不要机械追求 CSS isolation

不要为了“完全隔离”而引入非常复杂的方案。

MAGI 是自己的 product family。

如果所有产品都由 MAGI 控制：

```text
magi.website
models.magi.website
start.magi.website
...
```

那么：

```text
magi-*
```

作为保留 namespace 是可以接受的。

但必须把这个决定变成明确的 architecture decision，而不是历史遗留。

---

# 11. Foundation Architecture

重新检查：

```text
reset
globals
typography
focus
scrollbar
body background
body font
selection
```

明确：

### 哪些属于 Design System？

例如：

```text
button reset
input reset
focus ring
box sizing
font rendering
typography baseline
```

### 哪些不应该由 Design System 强制？

例如：

```text
整个网站 body height
某个产品 page background
某个产品 layout
某个 router behavior
```

目标：

> Design System 应该提供 MAGI foundation，但不能夺取产品 root layout 的控制权。

---

# 12. Accessibility 必须作为 Architecture Concern

不要把 accessibility 当成“组件实现细节”。

Design System 应该提供统一的：

```text
focus
keyboard navigation
label association
description association
error association
disabled
loading
invalid
selected
expanded
pressed
busy
```

审查所有已有组件。

尤其重点检查：

```text
Button
Input
FormField
Badge
Card
```

---

# 13. FormField 重点重构

检查当前是否真正建立：

```html
<label for="...">
<input id="...">

<input aria-describedby="...">
<div id="...">
```

以及：

```html
aria-invalid
```

错误状态。

不要要求 consumer 自己手工维护这些关联，如果 Design System 可以自动完成。

考虑 API：

```tsx
<FormField
  label="Email"
  description="..."
  error="..."
>
  <Input />
</FormField>
```

或者 compound component：

```tsx
<FormField>
  <FormField.Label />
  <FormField.Control />
  <FormField.Description />
  <FormField.Error />
</FormField>
```

选择一种，并解释为什么。

---

# 14. Component API Architecture

不要只检查视觉。

检查每个 component 的：

```text
props
variants
sizes
states
slots
composition
polymorphism
ref forwarding
HTML semantics
accessibility
```

尤其判断是否需要：

```ts
as
asChild
slot
children
render
```

不要盲目引入 Radix 风格 API。

目标是：

> API 简单、可预测、符合 MAGI 自己的使用场景。

---

# 15. Component Categories 重新定义

建立明确分类：

```text
Foundation
│
├── Typography
├── Focus
└── Theme

Layout
│
├── Container
├── Stack
├── Grid
├── Section
├── Center
└── Cluster

Primitives
│
├── Button
├── Badge
├── Card
├── Input
├── Checkbox
├── Switch
└── ...

Patterns
│
├── ProductHeader
├── CommandBar
├── EmptyState
└── ...
```

但是：

> Pattern 必须基于真实产品重复，而不是想象中的未来需求。

---

# 16. 严格建立 Product Component Boundary

例如 Token Factory 可能有：

```text
ModelSelector
ProviderSelector
ModelConfigEditor
GeneratedConfig
ModelCapabilityBadge
```

这些默认应该属于：

```text
token-factory-initializr
```

而不是：

```text
@magi/design-system
```

只有当多个产品真实共享时，才进入 Design System。

建立判断标准：

```text
Is it visually reusable?
        ↓
Not enough.

Is the interaction reusable?
        ↓
Still not enough.

Is the abstraction stable across products?
        ↓
Yes → consider extraction
No  → keep product-local
```

---

# 17. Build Architecture

重新评估：

```text
Vite library mode
+
tsc declaration emit
+
single styles.css
```

是否仍然是最佳方案。

分析：

* ESM
* CJS 是否需要
* type declarations
* source maps
* CSS output
* tree shaking
* sideEffects
* package exports
* CSS code splitting
* per-component CSS
* source distribution
* package size

不要为了“tree-shaking”做无意义优化。

重点考虑：

> MAGI products 是否真的需要按 component 拆 CSS？

如果不需要，保持单一 CSS bundle 反而更简单。

---

# 18. Package API Architecture

重新设计 public exports。

当前：

```ts
import {
  Button,
  Card,
  Badge
} from '@tokyo3rdhq/magi-design-system'
```

需要确保：

```text
public API
≠
internal implementation
```

不要把：

```text
internal helpers
internal types
internal CSS
internal token implementation
```

意外暴露。

明确：

```text
Public API
Internal API
Build-only files
```

---

# 19. Package Export Strategy

评估：

```json
{
  "exports": {
    ".": "...",
    "./styles.css": "..."
  }
}
```

是否足够。

可能需要：

```text
./tokens.css
./reset.css
./theme
```

但不要为了“可能有用”而全部 export。

原则：

> Export only stable contracts.

---

# 20. Testing Architecture

当前 CI 能证明：

```text
build succeeds
```

远远不够。

目标测试体系：

```text
                 Design System
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Unit          A11y           Visual
        │              │              │
     API/state     semantics       screenshot
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 Consumer tests
```

至少考虑：

### Unit

```text
variants
states
props
class generation
```

### Accessibility

使用：

```text
axe
Playwright
testing-library
```

验证：

```text
label
aria
keyboard
focus
```

### Visual Regression

Showroom + Playwright screenshot。

不要为了测试而引入 Storybook。

现有 Vite showroom 可以继续存在。

---

# 21. Showroom 的定位重新定义

Showroom 不应该只是：

```text
demo page
```

而应该成为：

```text
Design System development environment
```

包括：

```text
Components
States
Variants
Responsive behavior
Dark surfaces
Keyboard interaction
Accessibility
Visual regression fixtures
```

例如：

```text
Button
├── default
├── hover
├── focus
├── active
├── disabled
├── loading
└── danger

Input
├── default
├── focus
├── invalid
├── disabled
└── readonly
```

---

# 22. Consumer Contract Testing

真正重要的是：

```text
magi-design-system
       ↓
magi.website
       ↓
models.magi.website
       ↓
start.magi.website
```

因此考虑建立：

```text
Design System PR
        ↓
Build package
        ↓
Build showroom
        ↓
Build representative consumers
```

至少验证：

```text
magi.website
token-factory-initializr
```

不会因为 Design System API / CSS / token 变化而 silently break。

---

# 23. Token Validation

建立自动检查：

禁止 component CSS 中随意出现：

```css
#000
#fff
rgba(...)
px
```

对于：

* color
* spacing
* radius
* typography

优先要求使用 token。

但允许合理的 component-local constants。

不要做机械 lint。

例如：

```css
width: 1px;
```

不能简单视为错误。

---

# 24. Contrast Validation

自动验证：

```text
foreground/background
button
accent
accent-contrast
danger
success
warning
focus
disabled
```

确保符合合理 accessibility contrast requirements。

尤其 ProductTheme accent 不能只测试默认 accent。

至少测试：

```text
green
blue
cyan
purple
orange
```

以及未来所有正式 product accents。

---

# 25. Motion Architecture

当前只使用 CSS transitions。

不要因为“未来 animation”而引入动画框架。

但是应该统一定义：

```text
duration
easing
reduced-motion
```

例如：

```css
@media (prefers-reduced-motion: reduce) {
  ...
}
```

Design System 必须保证：

> reduced motion 是系统级能力，而不是每个产品自己实现。

---

# 26. Responsive Architecture

重新审视：

```text
breakpoints
container
spacing
typography
```

不要只定义：

```text
mobile
tablet
desktop
```

而应该基于实际 MAGI products 判断。

尤其考虑：

```text
desktop dashboard
mobile website
model tables
config editor
dense developer UI
```

Layout primitives 应该优先支持：

```text
responsive composition
```

而不是大量 component-specific media queries。

---

# 27. Documentation Architecture

重新整理：

```text
README
Architecture
Design principles
Tokens
Components
Migration guide
Contributing
Changelog
```

避免出现：

```text
implementation ≠ docs
version ≠ docs
roadmap ≠ actual state
```

Architecture 文档必须回答：

```text
Why?
What?
Boundary?
Trade-off?
```

而不是只描述：

```text
where files are
```

---

# 28. ADR

对于重大架构决策建立 ADR。

至少记录：

```text
ADR-001 Token architecture
ADR-002 CSS isolation
ADR-003 Theme architecture
ADR-004 Package boundary
ADR-005 CSS bundling
ADR-006 React dependency strategy
ADR-007 Accessibility strategy
ADR-008 Visual regression strategy
```

每个 ADR 至少包含：

```text
Context
Decision
Alternatives
Trade-offs
Consequences
```

---

# 29. React Version Strategy

重新考虑：

```json
"peerDependencies": {
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

明确：

* 是否需要 React 18
* 是否支持 React 19
* 是否应该使用更宽松 peer range
* 是否存在 React duplicate risk
* 是否需要测试多个 React versions

不要仅仅为了支持更多版本而扩大范围。

应该基于 MAGI consumers 的实际 runtime 做决定。

---

# 30. Design System 不应该过度绑定 Vite

Vite 可以继续作为：

```text
build tool
showroom tool
```

但架构上不要让：

```text
Design System
```

等价于：

```text
Vite project
```

Token 和 CSS 应该保持 technology-neutral。

React component implementation 可以依赖 React。

---

# 31. Repository Architecture

当前结构类似：

```text
packages/design-system
apps/showroom
docs
```

重新判断：

```text
monorepo
```

是否真的需要。

如果继续使用：

```text
package + showroom
```

明确它的角色：

```text
design-system package
+
local development/showcase application
```

而不是为了 monorepo 而 monorepo。

同时评估 npm workspace、pnpm workspace、file dependency 的长期 DX。

---

# 32. Versioning Strategy

Design System 是基础设施。

因此必须定义：

### Patch

```text
bug fix
internal implementation
visual bug
```

### Minor

```text
new component
new optional API
new token
```

### Major

```text
breaking component API
token rename/removal
CSS contract change
theme API change
```

尤其：

> Token rename/removal 本质上就是 breaking change。

不能只把 React API 当作 breaking change。

---

# 33. Migration Strategy

不要一次性把所有代码全部重写。

设计：

```text
Phase 0
Architecture proposal

Phase 1
Token architecture

Phase 2
Theme / foundation

Phase 3
CSS architecture

Phase 4
Component migration

Phase 5
Testing

Phase 6
Consumer migration

Phase 7
Cleanup
```

每个阶段都应该：

```text
build
typecheck
test
showroom
```

保持可运行。

---

# 34. 非目标

这次架构演进不要做：

```text
❌ 不为了“现代”引入 Tailwind
❌ 不引入 Radix 只是为了组件数量
❌ 不引入 Storybook 只是因为 Design System 常用 Storybook
❌ 不引入 CSS-in-JS
❌ 不引入 animation framework
❌ 不实现 i18n
❌ 不实现业务组件
❌ 不实现 MAGI 产品页面
❌ 不为了未来可能需求设计复杂 plugin system
❌ 不过度抽象
```

尤其不要把 MAGI Design System 变成：

> “另一个 shadcn / MUI / Chakra”。

MAGI Design System 应该是：

> **MAGI visual language implementation。**

---

# 35. Target Architecture Proposal

在完成 audit 后，提出一个你认为合理的 target architecture。

优先考虑类似：

```text
MAGI Design Language
│
├── @magi/design-tokens
│   │
│   ├── primitives
│   ├── semantics
│   └── component tokens
│
└── @magi/design-system
    │
    ├── foundation
    │
    ├── theme
    │
    ├── layout
    │
    ├── primitives
    │
    ├── components
    │
    └── patterns
```

但这只是一个候选方向。

**不要机械照抄。**

如果分析后认为拆成两个 package 在当前阶段没有价值，可以保留一个 package，但必须说明为什么。

---

# 36. Architecture Decision 的最终输出

在修改代码前，生成：

```text
docs/architecture-v2.md
```

内容至少包括：

```text
1. Goals
2. Non-goals
3. Current architecture
4. Problems
5. Target architecture
6. Token architecture
7. Theme architecture
8. CSS architecture
9. Component architecture
10. Accessibility architecture
11. Build/package architecture
12. Testing architecture
13. Consumer integration
14. Versioning
15. Migration strategy
16. Trade-off
```

