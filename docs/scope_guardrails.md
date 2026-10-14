在本阶段维护 `magi-design-system` 时，严格遵守以下 scope guardrails。

## 暂时不要做

### 不新增大量 UI primitives

暂时不要新增：

* Modal
* Dialog
* Tooltip
* Dropdown
* Tabs
* Navbar
* Footer
* Select
* Table
* Toast
* Drawer

除非真实 MAGI consumer 已经证明存在稳定且重复的 semantic contract。

### 不拆 package

不要创建：

* @tokyo3rdhq/magi-tokens
* @tokyo3rdhq/magi-react
* @tokyo3rdhq/magi-vue
* @tokyo3rdhq/magi-brand

当前单 package architecture 保持。

### 不实现 Vue

除非出现真实 Vue consumer。

### 不引入 Figma pipeline

当前优先解决 runtime CSS/token/React contract。

### 不建立 generic icon registry

Iconography 先由 Experience Guidelines 管理。

### 不重写视觉设计

不要因为实现问题重新定义：

* colors
* typography
* spacing
* logo
* accent philosophy

如果视觉规范存在问题：

先报告，再修改。

## 当前真正目标

从：

"设计系统文档"

变成：

"可测试、可发布、被真实产品消费的 Design System"

核心优先级：

1. consistency
2. theme verification
3. accessibility
4. visual regression
5. runtime contract
6. consumer migration

而不是：

component count。

