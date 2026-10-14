对 `@tokyo3rdhq/magi-design-system` 建立完整的 Theme × Accent verification matrix。

## 目标

验证 Design System 的两个正交维度：

1. Color Mode

   * dark
   * light

2. Product Accent

   * green
   * cyan
   * violet
   * amber
   * white
   * 以及 data-magi-accent 支持的合法值

必须证明：

> Theme 不应该改变 Accent 的语义。
> Accent 不应该覆盖 Theme 的 background/text/border semantic tokens。

## 测试矩阵

至少覆盖：

* dark + default accent
* dark + green
* dark + cyan
* dark + violet
* dark + amber
* dark + white
* light + default accent
* light + green
* light + cyan
* light + violet
* light + amber
* light + white

同时测试：

* AppTheme theme + accent
* data-magi-theme
* data-magi-accent
* theme subtree
* accent subtree

## 检查内容

验证：

### Theme tokens

dark/light 下：

* background
* surface
* text-primary
* text-secondary
* text-tertiary
* text-inverse
* border
* border-strong
* scrollbar
* selection
* logo

### Accent tokens

确认：

* accent
* accent-hover
* accent-soft
* accent-contrast

不会错误覆盖：

* background
* surface
* text
* border

## Runtime

测试：

* AppTheme mount
* AppTheme update
* AppTheme unmount
* 多个 AppTheme 生命周期
* SSR/hydration 风险
* useInsertionEffect 行为
* CSS variable restore

特别检查是否存在：

* global state leakage
* stale CSS variables
* unmount 后变量没有恢复
* theme 切换闪烁
* subtree theme 影响外部
* subtree accent 影响外部

## Showroom

为每一个组合提供可视化页面。

不要把 showroom 当普通 Demo。

把它当作 Design System 的 contract verification surface。

## 验收

必须可以自动验证：

Theme × Accent matrix。

测试失败时应该能够明确指出：

* 哪个 token
* 哪个 theme
* 哪个 accent
* 哪个 component

发生了问题。

不要新增 component。
不要改变视觉规范。
如果发现规范本身存在歧义，先报告，不要自行改变设计。

