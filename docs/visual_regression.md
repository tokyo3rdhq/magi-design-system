将 `apps/showroom` 从普通 visual showcase 升级为 MAGI Design System 的 Visual Regression Surface。

## 目标

Showroom 不只是展示组件。

它应该成为：

> Design System visual contract 的可执行验证环境。

## 页面组织

建立：

### Foundation

* typography
* spacing
* colors
* surfaces
* borders
* motion

### Brand

* MagiMark
* MagiWordmark
* MagiLockup
* favicon
* app icon

### Components

所有当前 13 个 UI primitives。

### Themes

* Dark
* Light

### Accent

* green
* cyan
* violet
* amber
* white

## Visual matrix

至少建立：

Dark × components

Light × components

以及代表性的：

Dark × Accent

Light × Accent

## Regression

使用 Playwright screenshot testing。

重点检测：

* spacing
* typography
* color
* border
* radius
* button states
* form states
* focus state
* logo contrast
* theme switching

## 要求

不要追求像素级无脑锁死所有页面。

应该只对 Design System contract-sensitive areas 做 screenshot assertion。

动态内容必须 deterministic。

动画测试应该：

* disable animation
* disable transition

## CI

Pull Request：

运行核心 visual regression。

Nightly / release：

运行完整 matrix。

失败时：

* 上传 screenshot
* 上传 diff
* 明确 component
* 明确 theme
* 明确 viewport

不要新增 component。
不要改变设计规范。
如果 screenshot 暴露设计规范问题，先报告问题，再决定是否修改 token。

