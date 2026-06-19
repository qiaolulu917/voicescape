# VoiceScape 架构说明

## 整体数据流

```
用户说话
  → Web Speech API (zh-CN) → 识别文字
  → POST /api/parse (Claude claude-haiku-4-5) → SceneOperation JSON
  → POST /api/generate (Gemini 2.5 Flash Image) → base64 图片
  → POST /api/removebg (remove.bg) → 透明 PNG base64
  → SceneContext (React 状态) → Canvas 重新渲染
```

---

## 目录结构与文件职责

```
voicescape/
├── app/
│   ├── layout.tsx          # 根布局，用 SceneProvider 包裹全应用，引入全局样式
│   ├── page.tsx            # 主页面，组装四区域布局，持有 feedbackMessage /
│   │                       # isProcessing / waitingForBackground /
│   │                       # waitingForClarification / pendingOperation 状态，
│   │                       # 含 handleVoiceResult 核心调度函数
│   ├── globals.css         # Tailwind 全局样式入口
│   └── api/
│       ├── parse/
│       │   └── route.ts    # POST /api/parse
│       │                   # 接收 { text, currentState, mode?, pendingOperation? }
│       │                   # mode: "normal" | "ask_background" | "clarify_resolve"
│       │                   # 调用 Claude claude-haiku-4-5，返回 SceneOperation JSON
│       ├── generate/
│       │   └── route.ts    # POST /api/generate
│       │                   # 接收 { type, description, attributes?, existingObjects? }
│       │                   # 调用 Gemini 2.5 Flash Image，返回 { imageBase64, mimeType }
│       │                   # background 类型时将 existingObjects 拼入 prompt
│       └── removebg/
│           └── route.ts    # POST /api/removebg
│                           # 接收 { imageBase64 }，调用 remove.bg，返回透明 PNG base64
│
├── components/
│   ├── SceneCanvas.tsx     # 主画布，div + CSS 绝对定位渲染所有对象
│   │                       # id="scene-canvas" 供 html2canvas 导出使用
│   │                       # 读 SceneContext 的 objects / background_image_url / selectedObjectId
│   ├── ObjectPanel.tsx     # 左侧面板，展示对象列表、关系列表、场景摘要
│   │                       # 点击对象卡片调用 setSelectedObjectId
│   ├── VoiceButton.tsx     # 录音按钮，管理 idle/recording 内部状态
│   │                       # processing 状态由外部 isProcessing prop 控制（父组件管理）
│   │                       # 识别完成后通过 onResult(text) 回调传文字给父组件
│   └── FeedbackBar.tsx     # 底部文字反馈区，展示系统消息、追问、确认提示
│
├── context/
│   └── SceneContext.tsx    # 唯一全局状态：SceneState + objectTypeCounters
│                           # 暴露：addObject / removeObject / updateObject /
│                           #        addRelation / removeRelation / setBackground /
│                           #        setSelectedObjectId
│                           # objectTypeCounters: Record<string, number>
│                           # 用于前端生成对象 ID（如 horse_001）
│
├── types/
│   └── scene.ts            # 所有 TypeScript 类型定义（见下方类型说明）
│
├── public/                 # 静态资源
├── .env.local              # API 密钥（不提交到 git）
└── package.json
```

---

## 核心类型（types/scene.ts）

```
SceneObject        单个场景对象（id / display_name / type / image_url /
                   position / size / z_index / attributes）

SceneState         画布完整状态（scene_summary / background_image_url /
                   objects[] / relations[]）

SceneOperation     Claude 解析结果，intent 决定操作类型：
  create           → objects_to_create: ObjectToCreate[]
  move             → target_display_name + position.relation + reference
  delete           → target_display_name / target_all_of_type + risk_level
  scale            → target_display_name + scale("larger"|"smaller")
  recolor          → target_display_name + new_color
  ask_background   → question（Claude 针对当前场景生成的追问文字）
  clarify          → clarification_question + ambiguous_targets[]
  confirm/cancel   → 无额外字段

Relation           subject_id + relation_type("positional"|"attachment") +
                   relation + object_id
                   位置关系和依附关系共存，互不覆盖
```

---

## 关键设计决策

### 对象 ID 由前端生成
Claude 只返回 `type` 和 `display_name`，前端维护 `objectTypeCounters`（如 `{ horse: 1 }`）生成 `horse_001`。避免 Claude 需要感知已有 ID 列表。

### isProcessing 状态由 page.tsx 持有
`npm run dev` 的整个管道（parse → generate → removebg）最长约 30-40 秒。VoiceButton 仅管理录音状态，processing 由父组件控制，确保整个管道期间按钮保持禁用。

### 背景追问是二次 parse 调用
首次 `create` 完成后，前端以 `mode="ask_background"` 再调用一次 `/api/parse`，Claude 结合已创建对象生成针对性追问（而非固定文案）。

### 指代消解用 pendingOperation 模式
歧义时前端存储 `pendingOperation`，用户澄清后以 `mode="clarify_resolve"` 携带 pendingOperation 再次调用 `/api/parse`，Claude 只需补全 target，不重走完整解析流程。

### Relations 共存策略
位置关系（positional）和依附关系（attachment）不互相覆盖。移动对象只追加新的 positional 关系，原有"骑着"等 attachment 关系保留。
