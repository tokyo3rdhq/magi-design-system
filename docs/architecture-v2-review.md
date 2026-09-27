# MAGI Design System — Architecture v2 Review

你现在不是一个“实现任务执行者”，而是一名 **Senior Design System Architect + Frontend Infrastructure Engineer**。

请基于当前仓库以及：

`docs/architecture-v2.md`

对 MAGI Design System 当前的 Architecture v2 proposal 做一次 **Architecture Review / Architecture Challenge**。

你的目标不是直接实现代码，也不是重新设计一个新的 Design System，而是：

> 判断 Architecture v2 是否形成了一个能够支撑 `magi.website`、`models.magi.website`、`start.magi.website` 以及未来更多 `*.magi.website` 产品的长期架构基础。

重点关注：

* Architecture Boundary
* Design Token Architecture
* Theme Architecture
* CSS Architecture
* Component Architecture
* Accessibility Architecture
* Testing Strategy
* Package Boundary
* API Stability
* Multi-product Evolution
* 0.x → 1.0 演进路径

---

# 1. Review Principles

请遵循以下原则：

### 1.1 不要为了“先进”而复杂化

不要因为业界存在某种模式，就强行引入：

* Tailwind
* Radix
* shadcn
* Storybook
* CSS-in-JS
* Style Dictionary
* Monorepo package explosion
* Plugin architecture
* Compound component everywhere
* Primitive / Semantic / Component token 的过度拆分

Architecture 应该由 MAGI 的实际需求驱动。

---

### 1.2 不要因为“现在只有两个 consumer”而过度简化

反过来也不要因为：

> “目前只有 magi-portal 和 TFI 两个 consumer”

就把未来一定会出现的架构边界全部推迟到 1.0。

需要识别：

> 哪些问题现在不需要解决？

以及：

> 哪些问题虽然现在规模很小，但必须现在定义正确的方向？

这是本次 Review 最重要的判断之一。

---

# 2. First: Reconstruct the Current Architecture

首先阅读整个仓库，而不仅仅是 `architecture-v2.md`。

至少检查：

* package.json
* tsconfig
* vite.config
* src/index.ts
* tokens/*
* foundation/*
* layout/*
* components/*
* theme.tsx
* styles/*
* existing tests
* CI workflow
* consumer integration

建立当前架构模型：

```text
Consumers
    ↓
@magi/design-system
    ↓
React Components
    ↓
CSS Architecture
    ↓
Design Tokens
    ↓
Browser
```

然后指出 architecture-v2 对当前实际代码做了哪些改变，以及哪些只是 proposal 尚未落地。

---

# 3. Architecture Decision Review

逐条 Review `architecture-v2.md` 中的 Architecture Decisions。

对于每一个重要 decision，回答：

1. 当前问题是什么？
2. v2 proposal 如何解决？
3. 这个方案为什么成立？
4. 它解决了什么问题？
5. 它引入了什么新的约束？
6. 如果未来 consumer 从 2 个增长到 5～10 个，会发生什么？
7. 如果未来 MAGI 出现 light theme / multiple accent / density / product-specific theme，会发生什么？
8. 是否需要现在修改？
9. 如果不修改，未来迁移成本是什么？

最终将 decision 分成：

```text
KEEP
KEEP WITH MODIFICATION
RECONSIDER
DEFER
REMOVE
```

不要简单给分数。

---

# 4. Critical Review #1 — Token Architecture

当前 proposal 倾向于：

> 保持 flat token architecture，不物理拆分 primitive / semantic / component token。

请重点挑战这个决定。

不要简单讨论：

> “flat token 好不好”。

而应该讨论：

> Token 是否需要明确的 dependency direction？

例如：

```text
Core / Primitive
        ↓
Semantic
        ↓
Component
        ↓
State
```

即使最终所有 token 仍然位于同一个 package，也需要判断是否应该建立这样的逻辑层级。

例如：

```css
--magi-color-white
--magi-color-neutral-900

--magi-text-primary
--magi-text-secondary

--magi-button-bg
--magi-button-bg-hover
```

Review：

* 是否需要 taxonomy？
* 是否需要 dependency rules？
* semantic token 是否应该引用 primitive token？
* component token 是否应该直接引用 primitive token？
* state token 应该在哪里？
* 是否需要禁止 component → primitive 的直接依赖？
* token rename 对 consumer 的影响是什么？
* token enforcement 是否只应该检查 literal？
* 是否应该检查 token dependency graph？

特别回答：

> “Flat physical structure”和“flat conceptual architecture”是否是同一件事？

---

# 5. Critical Review #2 — Token Governance

当前方案使用 CI grep 检查：

* hex
* rgb
* rgba
* hardcoded duration
* hardcoded font size

请评估这种机制是否足够。

建立三类规则：

```text
MUST use token
SHOULD use token
LOCAL CONSTANT allowed
```

分析以下场景：

```css
border: 1px solid ...
outline-offset: 2px
transform: translate(...)
max-width: 720px
line-height: 1.4
letter-spacing: ...
```

哪些应该是 token？

哪些不应该？

不要追求：

> “所有数字都必须 token 化。”

目标应该是：

> 防止设计语言被散落到组件实现中。

请提出更合理的 token governance 规则。

---

# 6. Critical Review #3 — Theme Architecture

Architecture v2 proposes changing ProductTheme from:

```tsx
<ProductTheme>
    <div>
        ...
    </div>
</ProductTheme>
```

to Context-only:

```tsx
<ProductTheme>
    ...
</ProductTheme>
```

这是本次 review 最重要的部分之一。

重点回答：

> React Context 和 CSS Custom Properties 到底分别承担什么职责？

请明确区分：

```text
React Context
    ↓
JS runtime configuration / theme metadata

CSS Custom Properties
    ↓
CSS runtime / inheritance / cascade
```

分析以下问题：

### A. Context-only 是否真的解决 theme propagation？

如果：

```tsx
<ProductTheme accent="green">
    <Button />
</ProductTheme>
```

那么：

```css
--magi-product-accent
```

究竟在哪里设置？

### B. 是否需要两个 abstraction？

例如：

```tsx
<MagiProvider />

<MagiThemeScope accent="green">
    ...
</MagiThemeScope>
```

其中：

* `MagiProvider`：application-level configuration
* `MagiThemeScope`：真正创建 CSS inheritance boundary

### C. 是否应该允许 nested theme scope？

例如：

```text
Application
└── MAGI Theme
    ├── Product A
    │   └── green
    └── Product B
        └── cyan
```

如果不允许，需要明确说明为什么。

### D. 手动要求 consumer：

```tsx
<div
  data-magi-product
  style={{
    '--magi-product-accent': ...
  }}
>
```

是否意味着 Design System 正在把自己的内部 CSS contract 泄漏给 consumer？

请给出最终建议。

---

# 7. Critical Review #4 — CSS Scope

当前架构使用：

```css
body[data-magi-app] ...
```

Architecture v2 暂时保留这一设计，并计划未来再考虑 scope rename。

请挑战这个决定。

比较至少：

```css
body[data-magi-app]
```

```css
[data-magi-app]
```

```css
[data-magi]
```

```css
.magi-root
```

以及：

```css
@layer magi.*
```

分别解决什么问题。

特别注意：

> CSS Scope 和 CSS Cascade Order 是两个不同的问题。

分析：

```text
scope
≠
cascade
≠
isolation
```

回答：

* `@layer` 能解决什么？
* `@layer` 不能解决什么？
* `body[data-magi-app]` 是否真的需要？
* 是否会让 Design System 与 host application 的 DOM 结构产生耦合？
* 是否影响 embedded usage？
* 是否影响未来 micro-frontend / iframe / widget / portal？
* 如果 1.0 前一定要迁移 scope，现在是不是更好的时间？

最终给出 recommendation。

---

# 8. Critical Review #5 — @layer

Architecture v2 将：

```css
@layer magi.reset,
       magi.tokens,
       magi.foundation,
       magi.layout,
       magi.components;
```

推迟到 0.5。

请判断：

> 这是合理的 roadmap，还是应该现在就确定？

重点分析：

* `@layer` 对 existing CSS 的影响
* consumer CSS 与 design-system CSS 的 cascade relationship
* third-party CSS
* application overrides
* reset / foundation / components 的顺序
* future theme styles
* whether introducing @layer later creates migration cost

不要只说“建议使用 @layer”。

请给出完整 cascade model：

```text
Browser defaults
    ↓
MAGI reset
    ↓
MAGI tokens
    ↓
MAGI foundation
    ↓
MAGI layout
    ↓
MAGI components
    ↓
Product styles
    ↓
Consumer overrides
```

如果这个模型不合理，请重新设计。

---

# 9. Critical Review #6 — Component Architecture

当前结构：

```text
Foundation
    ↓
Layout
    ↓
Primitives
    ↓
Patterns
```

Architecture v2 暂时不建立 Patterns。

请评估这个策略。

特别关注：

* Button
* Input
* Checkbox
* FormField
* Segmented
* Banner
* EmptyState
* Card
* Badge

回答：

### FormField

当前为什么应该保持为一个 component？

是否需要定义 control contract？

例如：

```tsx
<FormField>
    <Input />
</FormField>
```

未来：

```tsx
<FormField>
    <Select />
</FormField>

<FormField>
    <Textarea />
</FormField>

<FormField>
    <Segmented />
</FormField>
```

是否需要统一：

```text
id
label
description
error
required
disabled
aria-describedby
aria-invalid
```

如果需要，现在是否应该定义 contract？

### Patterns

什么时候应该从：

```text
composition
```

升级为：

```text
Pattern
```

请定义客观标准，而不是：

> “以后重复了再抽。”

---

# 10. Critical Review #7 — Accessibility

Architecture v2 引入：

```text
axe-playwright
```

这是正确方向，但请不要把：

> axe passing

等同于：

> accessibility complete

建立以下模型：

```text
Static / Automated
    ↓
Semantic correctness
    ↓
Keyboard interaction
    ↓
Focus behavior
    ↓
Screen reader behavior
    ↓
Visual accessibility
```

逐个分析：

* Button
* Checkbox
* FormField
* Segmented
* Banner
* Input

至少回答：

```text
axe 可以发现什么？
axe 无法发现什么？
unit test 应该测试什么？
Playwright 应该测试什么？
```

并提出最低可行的 accessibility test matrix。

---

# 11. Critical Review #8 — Visual Regression

Architecture v2 将 visual regression 推迟到：

> 1.0 / 2+ products

请挑战这个 roadmap。

分析：

如果现在只有 13 个 primitives：

```text
Button
Card
Badge
Input
Checkbox
...
```

那么现在建立：

```text
Vite showroom
+
Playwright screenshot
```

是否反而成本最低？

尤其考虑：

```text
default
hover
active
focus
disabled
loading
selected
invalid
dark
accent variants
responsive
```

请回答：

> Visual regression 是为了“产品测试”，还是为了“保护 Design Language”？

如果是后者，是否应该更早建立？

给出推荐方案，但不要引入 Storybook，除非你认为确实必要。

---

# 12. Critical Review #9 — useId / SSR

请仔细检查 architecture-v2 中关于：

```text
useId()
SSR mismatch
```

的判断。

不要接受文档中的结论作为事实。

检查当前代码真正的：

```text
id
aria-describedby
SSR
hydration
```

使用方式。

如果没有真实 reproduction：

> 不要把 useId() 本身定义为 SSR mismatch risk。

请重新定义真正应该测试的问题：

```text
deterministic IDs
explicit id support
aria-describedby composition
SSR hydration
consumer-provided IDs
```

---

# 13. Critical Review #10 — React Version vs Design System Version

当前 roadmap 将：

```text
React 19
```

与：

```text
1.0
```

存在一定关联。

请挑战这种做法。

明确讨论：

> Design System major version 到底应该代表什么？

应该主要由：

```text
React major
```

还是：

```text
Design System public API
CSS contract
DOM contract
Token contract
Accessibility contract
```

决定？

特别分析：

```text
React 18 → 19
```

是否必然意味着：

```text
@magi/design-system 0.x → 1.0
```

给出版本策略。

---

# 14. Critical Review #11 — Package Boundary

当前 proposal 不建立：

```text
@magi/design-tokens
```

这可能是合理的。

但请不要简单说：

> “现在不需要。”

请定义未来什么时候需要拆包。

例如：

```text
@magi/design-system
@magi/design-tokens
@magi/icons
@magi/theme
```

什么情况下才值得拆？

建立明确的 extraction criteria：

```text
dependency boundary
consumer boundary
runtime boundary
language boundary
tooling boundary
ownership boundary
release cadence boundary
```

核心原则：

> Package boundary should follow dependency boundary, not directory structure.

---

# 15. Critical Review #12 — Missing Architecture Topics

检查 Architecture v2 是否遗漏以下问题：

## Icons

需要明确：

* icon source
* SVG strategy
* size system
* stroke/fill semantics
* accessibility
* icon button
* product-specific icons

---

## Typography

不仅考虑：

```text
body
heading
code
```

还要考虑 MAGI 产品的：

```text
model ID
provider
API endpoint
token
code
JSON
configuration
metadata
metrics
status
```

是否需要：

```text
display
body
label
caption
code
data
```

这样的 typography semantics？

---

## Density

MAGI 未来很可能存在：

```text
model lists
provider lists
configuration tables
API data
logs
metadata
```

因此评估：

```text
comfortable
compact
dense
```

是否应该成为 Design System architecture 的概念。

---

## State Tokens

检查是否需要正式定义：

```text
default
hover
active
focus
disabled
selected
checked
invalid
loading
success
warning
error
```

以及这些状态与 token 的关系。

---

## Responsive Architecture

不仅需要 breakpoint token。

需要定义：

```text
container behavior
layout collapse
navigation behavior
table overflow
density changes
typography scaling
touch target
```

---

# 16. Architecture Evolution Model

最终不要只给：

> “这些地方建议修改。”

请建立一个：

```text
0.3
 ↓
0.4
 ↓
0.5
 ↓
1.0
 ↓
1.x
```

Architecture Evolution Model。

每一个阶段说明：

### MUST NOW

现在不解决会造成结构性技术债的问题。

### SHOULD NOW

现在定义方向比较便宜，但可以暂缓实现的问题。

### CAN DEFER

现在明确不需要解决。

### NEVER UNLESS NEEDED

除非出现真实需求，否则不要引入。

---

# 17. Final Architecture Principles

基于 review，最终提出一组 MAGI Design System Architecture Principles。

目标控制在 8～12 条。

例如：

```text
1. Design System owns visual language, products own product experience.

2. Public contracts matter more than internal reuse.

3. CSS variables are the styling runtime; React Context is the configuration runtime.

4. Providers must not introduce accidental DOM structure.

5. Token governance protects design language, not arbitrary numeric values.

6. Package boundaries follow dependency boundaries.

7. Accessibility is part of the component API, not a testing phase.

8. Visual regression protects the design language.

9. Extract abstractions only after semantic reuse is proven.

10. Do not solve hypothetical scale with premature infrastructure.
```

不要照抄这些原则。

根据实际 review 结果重新组织。

---

# 18. Final Deliverable

最终输出一份：

```text
docs/architecture-review-v2.md
```

结构建议：

```text
# Architecture Review

## Executive Summary

## Current Architecture Assessment

## Decision Review

### Token Architecture
### Token Governance
### Theme Architecture
### CSS Scope
### CSS Cascade
### Component Architecture
### Accessibility
### Visual Regression
### SSR
### React Versioning
### Package Boundary

## Missing Architecture Topics

### Icons
### Typography
### Density
### State
### Responsive

## Required Changes

### MUST NOW
### SHOULD NOW
### CAN DEFER
### NEVER UNLESS NEEDED

## Revised Architecture Model

## Revised Evolution Roadmap

## Architecture Principles

## Open Questions

## ADRs Required
```

---

# 19. Important Review Rules

最后遵守以下规则：

### Rule 1

不要因为某个方案是当前 maintainer 提出的，就默认它正确。

### Rule 2

也不要为了显得“架构先进”而否定简单设计。

### Rule 3

每一个建议必须回答：

```text
What problem does it solve?
What complexity does it introduce?
Why now?
What happens if we don't do it?
```

### Rule 4

区分：

```text
architecture decision
implementation detail
roadmap decision
```

不要把三者混为一谈。

### Rule 5

如果某个问题没有足够证据，不要假设。

明确写：

```text
Evidence
Inference
Open Question
```

### Rule 6

不要直接修改代码。

第一阶段只完成 Architecture Review。

### Rule 7

不要引入新的 framework / library，除非能够证明现有技术无法合理解决问题。

---

# 20. 最终目标

这次 Review 的最终目标不是让 MAGI Design System “更复杂”。

而是回答一个核心问题：

> 如果今天的 `@magi/design-system@0.2.x` 是 MAGI Design System 的起点，那么我们应该在哪些地方改变架构，才能让它自然演进到一个稳定的 `1.0`，同时避免为了未来可能存在的需求过度设计？

最终请优先给出：

```text
5 个最重要的架构修改
5 个最应该保持不变的决定
5 个可以明确推迟的问题
```

并解释每一项背后的原因。

不要给 overall score，不要简单评价“好/坏”，而要给出能够指导下一阶段实现的 Architecture Decision。

