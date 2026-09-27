# MAGI Design System 0.3 — Post-Implementation Architecture Review

你现在是一名 Senior Design System Architect + Frontend Infrastructure Engineer。

请对当前仓库：

`https://github.com/tokyo3rdhq/magi-design-system`

进行一次 **0.3.0 Post-Implementation Architecture Review**。

当前版本已经完成 Architecture v2 的第一轮落地。

不要重新设计整个 Design System。

你的任务是：

> 对照 `docs/architecture-v2.md` 中的设计目标，检查 0.3.0 的真实实现是否真正实现了这些架构目标，并找出当前实现中可能在 0.4.x / 1.0 形成技术债的问题。

---

# 1. Review Scope

必须同时 review：

```text
Architecture
Implementation
Public API
CSS Architecture
Theme Architecture
Token Architecture
Component Contracts
Accessibility
Testing
Build / Packaging
CI
Showroom
Documentation
```

不要只 review React component。

---

# 2. First Step — Reconstruct the Actual 0.3 Architecture

阅读：

```text
docs/architecture-v2.md
docs/architecture.md
docs/tokens.md
README.md

packages/design-system/
apps/showroom/
.github/workflows/
```

重点检查：

```text
src/index.ts
theme.tsx
tokens/*
foundation/*
layout/*
components/*
styles/*
package.json
vite.config.ts
tsconfig*
scripts/*
CI
showroom
```

建立实际 architecture graph：

```text
Consumer
    ↓
Public API
    ↓
React Components
    ↓
Theme / Context
    ↓
CSS
    ↓
CSS Layers
    ↓
Design Tokens
    ↓
Browser
```

然后指出：

```text
Architecture v2 proposal
        ↓
0.3 implementation
        ↓
Actual behavior
```

三者是否一致。

---

# 3. Critical Review — ProductTheme

这是本次 review 的最高优先级。

当前 `ProductTheme` 已经从 DOM wrapper 改成 Context provider。

但是请仔细分析：

```tsx
<ProductTheme accent="cyan">
    <App />
</ProductTheme>
```

是否真的形成了 subtree theme。

检查当前实现是否实际上：

```text
React Context
    ↓
subtree scoped

CSS variables
    ↓
document.documentElement
    ↓
global
```

如果是，明确指出这种：

```text
React scope ≠ CSS scope
```

的架构问题。

---

## 3.1 Nested Theme

测试/推演：

```tsx
<ProductTheme accent="green">
    <App>
        <ProductTheme accent="cyan">
            <SpecialArea />
        </ProductTheme>
    </App>
</ProductTheme>
```

分析：

* Context 是否正确？
* CSS variables 是否正确？
* outer theme 是否被 inner theme 修改？
* inner theme unmount 后是否恢复？
* 是否存在 race condition？
* 是否存在 stale global state？

---

## 3.2 Lifecycle

检查：

```text
mount
update accent
update name
unmount
remount
nested mount
nested unmount
```

是否存在：

```text
global side-effect leak
missing cleanup
state restoration bug
```

如果存在，请给出具体 reproduction。

---

# 4. Theme First-Paint / SSR Review

检查：

```ts
useEffect(...)
```

是否导致：

```text
first render
    ↓
default green
    ↓
effect
    ↓
cyan
```

分析：

* CSR first paint
* SSR
* hydration
* React StrictMode
* route transitions
* accent changes

不要简单地把问题称为：

> “useEffect 不好。”

而要回答：

> Design System theme state 应该由什么机制驱动？

比较：

```text
React Context
CSS custom properties
DOM data attribute
inline style
useLayoutEffect
useInsertionEffect
SSR bootstrap
consumer-controlled root attribute
```

选择最符合 MAGI architecture 的方案。

---

# 5. Theme Source of Truth

检查所有 accent definitions。

寻找是否存在：

```text
theme.tsx
globals.css
tokens/*
showroom
```

中的重复定义。

例如：

```text
green
cyan
violet
amber
white
danger
warning
success
```

回答：

> 谁才应该是 accent 的 source of truth？

要求设计：

```text
single source of truth
```

但不要为了实现这一点而立即引入：

* Style Dictionary
* token package
* code generation framework

除非有真实必要。

分析最小实现。

---

# 6. Token Governance Review

当前 CI 已经存在 token literal check。

不要只判断：

> “有 grep，所以 OK。”

检查：

```text
CSS literals
TS literals
JS literals
inline style
theme definitions
showroom styles
```

是否存在 governance blind spots。

建立：

```text
MUST token
SHOULD token
LOCAL CONSTANT allowed
```

规则。

尤其检查：

```text
color
font-size
duration
easing
spacing
radius
z-index
breakpoint
component dimensions
```

不要要求所有数字 token 化。

目标：

> Protect design language, not eliminate every literal.

---

# 7. CSS @layer Review

0.3 已经引入：

```css
@layer magi.reset,
       magi.tokens,
       magi.foundation,
       magi.layout,
       magi.components;
```

检查真实构建产物。

不要只看 source code。

确认：

```text
dist/styles.css
```

中真正的 cascade order。

检查：

```text
@import
@layer
nested @layer
component CSS
foundation CSS
tokens CSS
```

是否形成预期关系。

---

## 7.1 Define Cascade Contract

建立明确的 cascade model：

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

如果实际行为不同，指出差异。

---

## 7.2 Consumer Override Policy

明确：

Consumer 是否可以覆盖：

```text
component CSS
component state
spacing
typography
tokens
global foundation
```

分别定义：

```text
allowed
discouraged
unsupported
```

不要让 `@layer` 只是一个技术实现，而要成为明确的 CSS contract。

---

# 8. Scope Architecture Review

当前使用：

```css
[data-magi-app]
body[data-magi-app]
```

检查：

```text
scope semantics
DOM coupling
embedded usage
micro-frontend
portal
widget
multiple roots
future multi-product page
```

回答：

> `data-magi-app` 到底代表什么？

选择：

```text
document-level opt-in
```

还是：

```text
application root
```

还是其他模型。

不要因为迁移成本就自动延期。

如果现在修改成本低，应明确指出。

---

# 9. FormField Contract Review

重点检查 `FormField`。

当前模型：

```tsx
<FormField>
    <Input />
</FormField>
```

内部通过：

```text
cloneElement
```

注入：

```text
id
aria-describedby
aria-invalid
aria-labelledby
```

请评估这种 API 是否可以长期支持：

```text
Input
Textarea
Select
Segmented
Checkbox
RadioGroup
Combobox
DatePicker
custom control
```

建立：

```text
FormControl Contract
```

明确：

```text
focus target
id
aria-labelledby
aria-describedby
aria-invalid
disabled
required
error
description
```

不要立即创建 compound component。

首先判断 contract 是否已经需要存在。

---

# 10. FormField ARIA Integrity

重点寻找：

```text
existing aria-describedby
existing aria-labelledby
existing id
consumer supplied attributes
```

是否会被 FormField 覆盖。

例如：

```tsx
<Input aria-describedby="existing-help" />
```

经过 FormField 后是否仍然正确：

```text
existing-help + generated-help
```

而不是：

```text
generated-help
```

同样检查：

```text
aria-labelledby
aria-invalid
id
```

---

# 11. Component API Review

逐个 review：

```text
Button
Card
Badge
Checkbox
Input
FormField
Segmented
Banner
EmptyState
Container
Section
Stack
```

对每个组件检查：

```text
semantic HTML
DOM contract
prop contract
class contract
state contract
controlled/uncontrolled behavior
ref forwarding
keyboard behavior
focus behavior
disabled behavior
loading behavior
ARIA
CSS dependency
token dependency
```

重点识别：

> 当前实现只是“能用”，但是否已经形成了稳定的 Design System contract？

---

# 12. Public API Review

检查：

```text
src/index.ts
exports
types
internal modules
package exports
```

建立：

```text
Public API
Internal API
Implementation Detail
```

规则。

特别关注：

```text
ProductTheme
useProductTheme
ProductAccent
theme utilities
token definitions
classnames utilities
component internals
```

回答：

> 什么东西可以被 consumer import？

以及：

> 什么东西必须保持 internal？

`src/index.ts` 应成为唯一 package public API boundary。

---

# 13. Package / Build Review

检查：

```text
package.json
exports
files
main
module
types
sideEffects
peerDependencies
Vite
Rollup
dist
sourcemaps
CSS
```

验证：

```text
npm pack
```

之后真正发布的 package 是否只包含必要内容。

检查：

```text
unused files
source leakage
unintended exports
CSS duplication
React duplication
package size
```

不要只检查 repository build。

检查：

> 一个真实 consumer `npm install` 后到底拿到了什么。

---

# 14. Showroom Architecture

当前已经有：

```text
apps/showroom
```

请不要把它只当 demo。

判断它是否应该成为：

> Design System Contract Surface

建议建立：

```text
Component
    ├── Default
    ├── Variants
    ├── States
    ├── Keyboard
    ├── Accessibility
    ├── Responsive
    ├── Theme
    └── Edge cases
```

例如 Button：

```text
primary
secondary
ghost
danger

sm
md
lg

default
hover
active
focus
disabled
loading

long label
icon
icon + text
```

评估是否可以让 showroom 成为：

```text
visual regression input
a11y regression input
interaction regression input
```

而不是引入 Storybook。

---

# 15. Testing Architecture

当前 CI 已经验证：

```text
token check
typecheck
build
dist
showroom build
```

分析缺失：

```text
unit tests
interaction tests
a11y tests
SSR tests
hydration tests
visual regression
package consumer test
```

建立最小测试金字塔：

```text
                 Visual
              /           \
        Interaction       A11y
          /                  \
       Unit                Contract
             \             /
                Build
```

明确：

```text
Vitest
React Testing Library
Playwright
axe
```

分别解决什么问题。

不要为了 coverage 而测试 implementation details。

---

# 16. Accessibility Review

至少检查：

```text
Button
Input
Checkbox
FormField
Segmented
Banner
EmptyState
```

建立：

```text
Automated
Keyboard
Focus
Semantic
ARIA
Screen-reader relevant
```

测试矩阵。

特别注意：

> axe passing ≠ accessible component.

---

# 17. Design Token Architecture

不要现在强制拆：

```text
@magi/design-tokens
```

但建立 logical taxonomy：

```text
primitive
semantic
component
state
```

即使 physical files 仍然 flat。

分析：

```text
Who can depend on whom?
```

例如：

```text
primitive
   ↓
semantic
   ↓
component
   ↓
state
```

如果认为当前 MAGI 不需要这些层级，也必须解释原因。

---

# 18. Missing Design-System Contracts

检查当前 architecture 是否已经需要正式定义：

### Typography

```text
display
heading
body
label
caption
code
data
model-id
metadata
```

### Density

```text
comfortable
compact
dense
```

### State

```text
default
hover
active
focus
selected
disabled
loading
invalid
success
warning
error
```

### Responsive

```text
container
collapse
overflow
mobile navigation
table/data density
touch target
```

### Icons

```text
source
size
stroke
fill
semantic meaning
icon button
accessibility
```

不要自动实现。

先判断：

```text
MUST NOW
SHOULD DEFINE
CAN DEFER
```

---

# 19. Documentation Consistency

检查：

```text
README
architecture.md
architecture-v2.md
tokens.md
migration-guide.md
package README
comments
code
```

是否存在：

```text
documentation says X
implementation does Y
```

这种 divergence。

特别检查：

```text
ProductTheme
@layer
data-magi-app
token enforcement
public API
SSR
```

---

# 20. Architecture Debt Classification

最终不要简单输出：

```text
good
bad
```

而是：

```text
P0 — architectural correctness / real bug

P1 — should fix before more consumers

P2 — should define before 1.0

P3 — future evolution

DEFER — explicitly do not solve now
```

每个问题必须包含：

```text
Problem
Evidence
Why it matters
Current behavior
Failure scenario
Recommendation
Implementation scope
Migration impact
Priority
```

---

# 21. Most Important Final Question

最后回答：

> 如果 MAGI Design System 现在从 0.3.0 开始继续增加到 10 个 MAGI products，这套架构最可能在哪里先崩？

不要回答：

> “可能需要更多 components。”

而要从 architecture boundary 出发寻找：

```text
Theme
CSS scope
Token governance
Component contracts
Public API
Testing
Package boundary
```

中最可能产生结构性问题的位置。

---

# 22. Final Deliverable

生成：

```text
docs/architecture-review-0.3.md
```

结构：

```text
# MAGI Design System 0.3 Architecture Review

## Executive Summary

## Architecture v2 vs 0.3 Implementation

## P0 — Critical Issues

## P1 — Important Issues

## P2 — Architecture Decisions

## P3 — Future Evolution

## Theme Architecture

## CSS Architecture

## Token Architecture

## Component Contracts

## Accessibility

## Testing Architecture

## Package Architecture

## Showroom Architecture

## Documentation Consistency

## Recommended 0.4 Roadmap

### MUST FIX
### SHOULD FIX
### SHOULD DEFINE
### DEFER

## Revised Architecture Principles

## Open Questions
```

最后额外输出：

```text
Top 5 issues to fix before 0.4
Top 5 issues to define before 1.0
Top 5 things NOT to change
```

---

# Review Rules

1. 不要因为 Architecture v2 已经写下某个 decision 就默认它正确。

2. 不要为了“架构先进”而增加 framework 或 package。

3. 不要把 implementation preference 当成 architecture requirement。

4. 每一个 architecture recommendation 必须回答：

```text
What problem?
Why now?
What complexity?
What if we don't?
```

5. 优先寻找真实 failure mode，而不是假设未来需求。

6. 不要只看 source code；检查真实 build artifact。

7. 不要只看 component demo；检查 consumer contract。

8. 不要把 accessibility / visual / testing 当作 release checklist，而应该判断它们是否已经成为 architecture contract。

9. 对没有证据的问题明确标记：

```text
Observed
Inferred
Open Question
```

10. 本阶段优先完成 review，不要直接大规模重构。

目标不是把 MAGI Design System 做成一个“大而全”的企业 Design System，而是让它保持：

```text
small
coherent
predictable
themeable
accessible
testable
evolvable
```

同时避免：

```text
premature abstraction
global side effects
duplicated source of truth
leaky public APIs
implicit component contracts
```

