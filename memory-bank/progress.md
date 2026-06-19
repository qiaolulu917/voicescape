# VoiceScape 开发进度

## PR 1 — 初始化 Next.js 项目 ✅
**日期：** 2026-06-19
**状态：** 已合并到 main

**完成内容：**
- 使用 create-next-app 初始化 Next.js 16.2.9（App Router + TypeScript + Tailwind CSS + ESLint）
- 创建空目录：`components/`、`context/`、`types/`
- 创建 `.env.local`（三个占位密钥），已加入 .gitignore
- 修正 package.json name 为 `voicescape`

**注意事项：**
- 项目目录名含大写字母（VoiceSpace），create-next-app 无法直接初始化，采用临时目录生成后迁移文件的方式
- 实际安装的是 Next.js 16（最新），而非文档中提到的 14，App Router API 保持兼容

---

## PR 2 — 定义 TypeScript 类型 ✅
**日期：** 2026-06-19
**状态：** 已合并到 main

**完成内容：**
- 在 `types/scene.ts` 中定义全部类型：
  - `ObjectPosition`、`ObjectSize`、`ObjectAttributes`
  - `SceneObject`、`SceneState`、`Relation`、`ObjectToCreate`
  - `SceneOperation`：discriminated union，按 intent 字段区分 10 种操作
- `Relation` 含 `relation_type: "positional" | "attachment"` 字段，支持位置关系和依附关系共存

---

## 待完成

- PR 3：创建 Scene 全局状态（context/SceneContext.tsx）
- PR 4-8：UI 静态框架搭建
- PR 9-11：API 路由实现
- PR 12-18：核心功能集成
- PR 19-22：收尾与交付
