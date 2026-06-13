# VoiceScape 技术栈文档

## 一、整体架构

VoiceScape 采用**纯前端 + API 调用**的架构，无独立后端服务。
Next.js 的 API Routes 作为中间层，代理所有第三方 API 调用（隐藏密钥，密钥不暴露给浏览器）。

```
浏览器（React 前端）
    ↓ 语音录音
Web Speech API（浏览器内置，免费）
    ↓ 识别文字
Next.js API Route /api/parse
    ↓ 结构化解析
Claude claude-haiku-4-5（Anthropic API）
    ↓ 返回操作 JSON
Next.js API Route /api/generate
    ↓ 生成对象图片
Gemini 2.5 Flash Image（Google AI API）→ remove.bg（去背景）
    ↓ 返回透明 PNG
React 前端 → 更新 Scene State → 渲染画布
```

---

## 二、各层技术选型

### 2.1 前端框架：Next.js 14 + React

**选型理由：**
- API Routes 功能在同一项目中处理后端逻辑，无需单独部署服务器
- API 密钥保存在服务端环境变量，不暴露给浏览器
- 一键部署到 Vercel（免费套餐），推送代码即自动更新线上版本
- React 生态最丰富，AI 辅助编码（vibecoding）支持最好

> 不选 Vue/Svelte：React 社区资源和 AI 代码生成支持更成熟。

---

### 2.2 UI 样式：Tailwind CSS

**选型理由：**
- 直接在 JSX 标签上写样式类名，无需编写单独 CSS 文件
- 内置响应式、颜色、间距系统，快速搭建美观 UI
- AI 辅助编码对 Tailwind 生成质量极高

---

### 2.3 状态管理：React useState + Context

**选型理由：**
- Scene State（场景 JSON）用 React Context 全局共享给所有组件
- 无需引入 Redux、Zustand 等额外库，降低复杂度
- 对于本项目的数据量完全够用

Scene State 数据结构参见 [design-document.md](./design-document.md) 第七节。

---

### 2.4 画布渲染：HTML div + CSS 绝对定位

**选型理由：**
- 画布本质是「一堆图片按位置叠加」，用 `div` 绝对定位即可实现
- 比 Konva.js / Fabric.js 等 Canvas 库简单 10 倍
- `z-index` 控制层叠关系，`CSS transform` 控制位置和大小
- 高亮选中效果用 `box-shadow` 即可实现

> 不选 `<canvas>` 元素：操作图片时原生 Canvas API 繁琐，DOM 方案更直观易维护。

---

### 2.5 画布导出：html2canvas

**选型理由：**
- 将指定 DOM 元素截图为 PNG，3 行代码实现导出
- 免费开源，`npm install` 直接使用

```js
import html2canvas from 'html2canvas';
const canvas = await html2canvas(document.getElementById('scene-canvas'));
canvas.toBlob(blob => saveAs(blob, 'voicescape.png'));
```

---

### 2.6 语音输入：Web Speech API（浏览器内置）

**选型理由：**
- 浏览器内置，无需任何 API 密钥，完全免费
- Chrome 浏览器下中文（zh-CN）识别准确率良好
- 支持点击开始/停止的交互模式

```js
const recognition = new webkitSpeechRecognition();
recognition.lang = 'zh-CN';
recognition.onresult = (e) => console.log(e.results[0][0].transcript);
recognition.start(); // 点击时开始
recognition.stop();  // 再次点击时停止
```

> **注意：** 仅支持 Chrome / Edge 浏览器，演示时请使用 Chrome。
>
> **备选方案：** 若识别质量不满足需求，可切换为 OpenAI Whisper API（$0.006/分钟）。

---

### 2.7 LLM 解析：Claude claude-haiku-4-5（Anthropic API）

**选型理由：**
- 响应速度最快（< 1 秒），适合交互式实时体验
- 价格最便宜（$0.25 / 百万输入 token）
- 中文理解能力强
- 结构化 JSON 输出稳定，对解析场景操作至关重要

**用途：** 将用户语音文字转换为场景操作 JSON，例：

```
输入：「把马移到房子前面」

输出：
{
  "intent": "move",
  "target_display_name": "马",
  "position": {
    "relation": "front_of",
    "reference_display_name": "房屋"
  },
  "risk_level": "L1"
}
```

---

### 2.8 AI 生图：Gemini 2.5 Flash Image（Google AI API）

**选型理由：**
- 原生支持图像生成，模型能力强，风格可控
- 通过 Google AI Studio 获取 API Key（有免费额度）
- 与 Claude 组合使用，分别发挥各自优势（Claude 擅长文字解析，Gemini 擅长图像生成）

**SDK：** `@google/genai`

**统一对象生图 Prompt 模板：**
```
A flat illustration of [对象名称], [属性描述],
flat illustration style, cartoon, white background,
simple shapes, children book style, no shadows
```

**背景图 Prompt 模板（铺满画布，无需去背景）：**
```
A flat illustration landscape of [场景描述],
wide panoramic view, flat illustration style,
soft colors, children book style
```

---

### 2.9 背景去除：remove.bg API

**选型理由：**
- 专业背景去除服务，精度高，边缘干净
- 免费套餐每月 50 张，够比赛使用
- 一个 HTTP 请求即可调用

> 流程：Gemini 生成白底对象图 → remove.bg 去除白色背景 → 得到透明 PNG → 贴到画布。
> 背景图不需要调用此服务。

---

### 2.10 部署：Vercel（免费套餐）

**选型理由：**
- 与 GitHub 直接集成：推送代码自动触发重新部署
- 免费套餐完整支持 Next.js 全部功能（包括 API Routes）
- 环境变量在 Vercel 控制台配置，密钥安全不泄露
- 每次 PR 合并后线上版本立即更新，评委随时可访问演示

---

## 三、环境变量清单

项目根目录创建 `.env.local` 文件（**禁止提交到 Git**，已加入 .gitignore）：

```
ANTHROPIC_API_KEY=your_claude_api_key
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key
REMOVEBG_API_KEY=your_removebg_api_key
```

Vercel 部署时，在 Vercel 控制台的 Environment Variables 中填写相同的三个变量。

---

## 四、项目目录结构

```
voicescape/
├── app/
│   ├── page.tsx                  # 主页面（布局组装）
│   ├── layout.tsx                # 根布局
│   └── api/
│       ├── parse/route.ts        # POST：调用 Claude 解析语音文字 → 操作 JSON
│       ├── generate/route.ts     # POST：调用 Gemini 2.5 Flash Image 生成图片
│       └── removebg/route.ts     # POST：调用 remove.bg 去除背景
├── components/
│   ├── SceneCanvas.tsx           # 主画布（div 绝对定位渲染所有对象）
│   ├── ObjectPanel.tsx           # 左侧对象面板（列表 + 点击选中）
│   ├── VoiceButton.tsx           # 录音按钮（状态：待机/录音中/处理中）
│   └── FeedbackBar.tsx           # 底部文字反馈区
├── context/
│   └── SceneContext.tsx          # Scene State 全局状态 + dispatch
├── types/
│   └── scene.ts                  # TypeScript 类型定义（SceneObject, Relation 等）
├── public/
├── .env.local                    # 密钥（不提交）
├── .gitignore                    # 包含 .env.local
└── package.json
```

---

## 五、费用估算（比赛期间）

| 服务 | 估算用量 | 费用 |
|------|---------|------|
| Claude claude-haiku-4-5 | ~500 次调用 | ~$0.50 |
| Gemini 2.5 Flash Image | ~100 张图片 | 视 Google AI 免费额度而定 |
| remove.bg | ≤50 次（免费额度） | $0 |
| Web Speech API | 无限次 | $0 |
| Vercel 部署 | 免费套餐 | $0 |
| **合计** | | **~$0.50 起** |

---

## 六、第三方依赖汇总（README 中需列明）

| 依赖 | 类型 | 用途 |
|------|------|------|
| `next` 14.x | npm 包 | 前端框架 + API Routes |
| `react` 18.x | npm 包 | UI 组件 |
| `tailwindcss` 3.x | npm 包 | 样式 |
| `html2canvas` 1.x | npm 包 | 画布导出为 PNG |
| `@anthropic-ai/sdk` | npm 包 | Claude API 客户端（LLM 解析） |
| `@google/genai` | npm 包 | Gemini 2.5 Flash Image API 客户端（AI 生图） |
| Web Speech API | 浏览器内置 | 语音转文字（免费） |
| remove.bg API | REST 服务 | 图片背景去除 |
| Vercel | 部署平台 | 托管 + 自动部署 |
