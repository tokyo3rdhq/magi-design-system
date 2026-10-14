彻底审计并统一 MAGI Design System 的 `data-magi-app` scope contract。

## 当前背景

0.6.0 的设计是：

* `<html data-magi-app>` 为 canonical
* `<body data-magi-app>` 为 backward compatibility

但是 README / usage / CSS / ADR 可能仍存在旧语义。

## 任务

检查：

* globals.css
* reset.css
* typography.css
* foundation
* component CSS
* README
* usage-guide
* migration-guide
* ADR-0002
* showroom
* tests

## 明确最终 Contract

定义：

### Canonical

```html
<html data-magi-app>
```

### Legacy

```html
<body data-magi-app>
```

如果继续支持 legacy，必须明确：

* 支持到哪个版本
* 是否有 warning
* 是否会在未来移除

## CSS

确保 selector 不依赖：

* body
* html
* React root
* 特定 DOM hierarchy

除非这是明确 contract。

## Theme interaction

验证：

```html
<html data-magi-app data-magi-theme="dark">
```

以及：

```html
<html data-magi-app data-magi-theme="light">
```

## Subtree

验证：

```html
<section data-magi-theme="light">
```

不会破坏外部 theme。

## 输出

先给出 scope matrix：

| Attribute | Canonical location | Legacy | Inheritance | Override |
| --------- | ------------------ | ------ | ----------- | -------- |

然后实现。

最终 README、usage-guide、migration-guide、ADR、源码必须一致。

不要引入新架构。
不要增加 component。

