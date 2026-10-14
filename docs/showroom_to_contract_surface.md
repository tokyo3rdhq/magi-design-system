重新定位 `apps/showroom`。

它不是普通组件 Demo，而是：

> MAGI Design System 的可执行 Contract Surface。

## 页面结构

建立：

```text
/brand
/foundation
/tokens
/theme
/components
/accessibility
/states
```

## 每个 component 必须展示

* semantic example
* all variants
* states
* keyboard behavior
* accessibility information
* token relationship

## Theme

每个组件必须能够：

* Dark
* Light

切换。

## Accent

至少支持：

* green
* cyan
* violet
* amber
* white

## Debug information

开发模式允许显示：

* component name
* variant
* theme
* accent
* relevant CSS token

生产 build 不需要显示。

## 目标

Showroom 应该能够回答：

1. 这个组件怎么用？
2. 它有哪些 state？
3. Dark/Light 下是否正确？
4. Accessibility 是否正确？
5. 哪些 token 驱动它？
6. visual regression 是否覆盖？

不要增加新的组件 API。

