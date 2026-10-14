将 `@tokyo3rdhq/magi-design-system` 应用于真实 MAGI consumer，而不是继续在 Design System 内部抽象。

## 优先级

第一目标：

`token-factory-initializr/web`

因为它本身已经是 Design System components 的重要来源。

## Migration 原则

不要为了迁移而修改产品 UX。

产品负责：

* IA
* navigation
* product workflow
* business terminology
* product-specific components

MAGI Design System 负责：

* visual language
* tokens
* typography
* spacing
* surface
* brand
* common semantic primitives
* accessibility baseline

## Migration 步骤

### 1. Install

使用：

`@tokyo3rdhq/magi-design-system`

### 2. Foundation

替换：

* colors
* typography
* spacing
* reset
* surface

### 3. Brand

使用：

* MagiMark
* MagiWordmark
* MagiLockup

### 4. Components

优先迁移已经存在的：

* Button
* Card
* Badge
* Input
* FormField
* Checkbox
* Segmented
* Banner
* EmptyState

### 5. Theme

验证：

* Dark
* Light

### 6. Product accent

如果产品需要 accent，只覆盖：

accent tokens。

禁止 consumer 自己重新定义 MAGI semantic colors。

## Migration report

记录：

* reused component
* duplicated component
* required gap
* product-specific component
* actual design-system bug
* missing token
* unnecessary abstraction

特别注意：

不要看到重复 JSX 就立即把它抽进 Design System。

只有 semantic contract 真正稳定共享时才抽取。

## 最终目标

通过真实 consumer 暴露 Design System 的问题。

不要为了证明 Design System 完整而在 Design System 内部制造更多 Demo。

