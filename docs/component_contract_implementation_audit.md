对 `magi-design-system` 执行 Component Contract Implementation Audit。

## Source of truth

以：

`docs/component-contracts.md`

作为 semantic contract。

但不要盲目认为文档正确。

如果发现：

Documentation ≠ Implementation

必须明确报告。

## 对每个组件检查四个维度

### 1. Semantic structure

检查：

* HTML element
* role
* nesting
* children constraints

### 2. Accessibility

检查：

* keyboard
* focus
* ARIA
* labels
* disabled
* errors

### 3. Visual states

检查：

* default
* hover
* active
* focus
* disabled
* selected
* error
* loading（如果适用）

### 4. Token binding

检查组件是否：

* 使用 semantic tokens
* 避免 hard-coded color
* 避免 hard-coded spacing
* 避免 hard-coded radius

## 特别检查

### FormField

重点审计：

* Children.only
* cloneElement
* aria-describedby merge
* aria-labelledby merge
* id propagation
* error/help text association

### Segmented

重点审计：

* roving tabindex
* Arrow
* Home
* End
* selected state

### Button

重点审计：

* native button semantics
* disabled
* focus
* variants
* accent interaction

### Brand

重点审计：

* currentColor
* logo color
* aria-hidden
* accessible label
* dark/light contrast

## 输出

生成：

| Component | Contract | Implementation | Test | Status |
| --------- | -------- | -------------- | ---- | ------ |

Status 只允许：

* PASS
* IMPLEMENTATION GAP
* DOCUMENTATION GAP
* TEST GAP

不要新增组件。

对于发现的问题，优先修复 contract gap，而不是扩大 API。

