你现在负责维护仓库：

https://github.com/tokyo3rdhq/magi-design-system

目标：对当前仓库执行一次完整的 **0.6.0 Consistency Audit**。

## 背景

当前项目已经进入 0.6.0，README 声明已经支持：

* Light / Dark color mode
* `<AppTheme theme="dark|light">`
* `data-magi-theme="light|dark"`
* `data-magi-app`
* `--magi-logo-color`
* Logo Contrast Rule
* `data-magi-accent`
* 13 个 UI primitives
* 3 个 Brand primitives

不要重新设计这些架构。

本任务不是新增功能，而是确认：

> Source Code = Public API = Documentation = Tests = Release Metadata

## 审计范围

检查：

* packages/design-system/package.json
* packages/design-system/src/**
* packages/design-system/README.md
* README.md
* CHANGELOG.md
* docs/**
* docs/adr/**
* apps/showroom/**
* scripts/**
* CI / GitHub Actions

## 重点检查

### 1. Version consistency

确认所有地方对当前版本的描述一致：

* package.json
* README
* CHANGELOG
* docs
* npm metadata
* showroom dependency

不要仅仅搜索 "0.6.0"，还要检查是否存在过期的 0.5.x / 0.2.x API 描述。

### 2. Theme API consistency

确认以下 API 是否完全一致：

* AppTheme
* theme="dark"
* theme="light"
* data-magi-theme="dark"
* data-magi-theme="light"

检查 TypeScript 类型、runtime behavior、CSS selector、README 示例、usage guide、ADR。

### 3. Brand API consistency

确认：

* MagiMark
* MagiWordmark
* MagiLockup
* --magi-logo-color
* currentColor
* Logo Contrast Rule

在源码、文档、showroom 中保持一致。

### 4. CSS scope consistency

确认：

* data-magi-app
* data-magi-accent
* data-magi-theme

三者的 scope、继承关系、优先级是否一致。

### 5. Public API consistency

检查 src/index.ts 的所有 export：

* 是否有文档没有描述的 public API
* 是否有文档描述但没有 export 的 API
* 是否存在旧 API 名称残留

### 6. Deprecated / obsolete documentation

识别：

* 已经过时的 architecture 文档
* 仍然描述旧 API 的文档
* 仍然使用旧 scope / naming 的文档
* 仍然描述 0.5.x 行为的文档

不要直接删除历史 ADR。

历史文档应该保留，但必须明确标记：

* Historical
* Superseded
* Current

## 输出要求

先不要修改代码。

先输出：

1. inconsistency matrix
2. 每个问题的文件位置
3. 当前事实
4. 文档声明
5. 应该采用哪个作为 source of truth
6. 修复建议
7. 是否属于 breaking change

最后给出一个最小修复计划。

只有在完成审计后，才开始修改。

## 验收标准

最终必须做到：

* npm package version 与文档一致
* public API 与文档一致
* Theme API 与 CSS 一致
* Brand API 与 CSS 一致
* data-magi-app contract 一致
* data-magi-theme contract 一致
* data-magi-accent contract 一致
* CHANGELOG 与实际代码一致
* 没有把历史文档误当成 current specification
* build / typecheck / tests 全部通过

不要新增 UI component。
不要引入 Vue。
不要拆 package。
不要修改 MAGI 的视觉设计。
不要重新设计 Theme architecture。

