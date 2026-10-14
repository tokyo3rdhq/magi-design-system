为 `magi-design-system` 建立 Accessibility Quality Gate。

## 背景

当前 Design System 已经定义 Component Contracts，其中 Accessibility 是正式 contract。

因此现在需要将 accessibility 从：

Documentation

升级为：

Automated Verification

## 覆盖组件

至少检查：

* Button
* Card
* Badge
* Checkbox
* Input
* FormField
* Segmented
* Banner
* EmptyState
* Container
* Section
* Stack
* MagiMark
* MagiWordmark
* MagiLockup
* AppTheme

## 必须验证

### Keyboard

检查：

* Tab
* Shift+Tab
* Enter
* Space
* Arrow keys
* Home
* End
* Escape（如果适用）

### Focus

检查：

* focusable
* visible focus
* focus order
* disabled state
* roving tabindex

### ARIA

检查：

* role
* aria-label
* aria-labelledby
* aria-describedby
* aria-invalid
* aria-disabled
* aria-checked
* aria-selected

重点验证 FormField 的：

* aria-describedby merge
* aria-labelledby merge

不能覆盖 consumer-provided ARIA references。

### Semantic HTML

检查是否错误使用：

* div 替代 button
* div 替代 input
* clickable non-interactive elements

### Color

至少检查：

* Dark theme
* Light theme
* primary text
* secondary text
* disabled text
* borders
* focus indicators

### Brand

验证 decorative logo 默认：

aria-hidden="true"

meaningful logo：

必须支持 accessible name。

## CI

推荐：

* Playwright
* axe-playwright / axe-core

测试应该运行在：

* Dark
* Light

至少一遍。

## 验收

PR 如果引入新的 accessibility violation，应失败。

不要为了通过测试简单关闭规则。

如果规则与 MAGI Design System 的 Component Contract 冲突，先报告冲突。

