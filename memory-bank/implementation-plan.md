# VoiceScape 实施计划

- **开始时间**：2026-06-13（今天）
- **截止时间**：2026-06-14 23:00
- **总可用时间**：约 36 小时
- **开发方式**：Vibecoding（AI 辅助编码）
- **PR 数量**：22 个 PR

---

## 比赛 PR 规范提醒

每个 PR 提交时必须填写：
1. **标题**：一句话说明做了什么
2. **功能描述**：这个功能的作用
3. **实现思路**：简要说明技术选型或核心逻辑
4. **测试方式**：如何验证功能正常

---

## 阶段一：项目基础搭建

> 今天完成，约 3 小时，共 3 个 PR

---

### PR 1 — 初始化 Next.js 项目

**目标：** 创建可运行的 Next.js + Tailwind CSS 项目骨架，建立 GitHub 仓库

**步骤：**
1. 在 GitHub 上创建名为 `voicescape` 的新仓库，选择 Public，勾选添加 .gitignore（Node）
2. 使用 `create-next-app` 命令初始化项目，勾选 TypeScript、Tailwind CSS、App Router，不勾选 src 目录
3. 按照 tech-stack.md 第四节的目录结构，在项目内手动创建空文件夹：`components/`、`context/`、`types/`
4. 在根目录创建 `.env.local` 文件，写入三个占位密钥（值填 `placeholder`）
5. 确认 `.gitignore` 中已包含 `.env.local`
6. 将代码推送到 GitHub main 分支
7. 在 GitHub 上将此 PR 标记为初始提交

**验证：**
- 在本地运行 `npm run dev`，浏览器打开 `localhost:3000` 看到 Next.js 默认欢迎页面，无报错
- 在 GitHub 仓库中看到所有文件已上传
- `.env.local` 不在 GitHub 上出现

---

### PR 2 — 定义 TypeScript 类型

**目标：** 在 `types/scene.ts` 中定义所有场景数据类型

**步骤：**
1. 在 `types/scene.ts` 中新建文件
2. 根据 design-document.md 第七节的 Scene State JSON 结构，定义以下类型：
   - `SceneObject`（含 id、display_name、type、image_url、position、size、z_index、attributes）
   - `ObjectPosition`（含 x、y 数字类型）
   - `ObjectSize`（含 width、height）
   - `ObjectAttributes`（含可选的 color 字符串）
   - `Relation`（含 subject_id、relation、object_id）
   - `SceneState`（含 scene_summary、background_image_url、objects 数组、relations 数组）
   - `SceneOperation`（含 intent 联合类型：create/move/delete/scale/recolor/set_background/clarify/confirm/cancel，以及可选的操作参数字段）
3. 导出所有类型
4. 创建 PR 并合并

**验证：**
- 运行 `npm run build`，确认 TypeScript 编译无报错
- 在任意组件文件中临时 import 一个类型，看 IDE 有自动补全提示（说明类型识别正确）

---

### PR 3 — 创建 Scene 全局状态

**目标：** 在 `context/SceneContext.tsx` 中实现场景状态的全局读写

**步骤：**
1. 在 `context/SceneContext.tsx` 中创建 React Context
2. 提供初始空场景状态（objects 为空数组，relations 为空数组，scene_summary 和 background_image_url 为空字符串）
3. 提供以下更新方法（先只写函数签名，不实现具体逻辑）：
   - `addObject`（传入 SceneObject，添加到 objects 数组）
   - `removeObject`（传入 id，从 objects 中移除）
   - `updateObject`（传入 id 和更新字段，合并到对应对象）
   - `addRelation` / `removeRelation`
   - `setBackground`（传入 url 和 summary）
   - `setSelectedObjectId`（记录当前选中的对象 id）
4. 在 `app/layout.tsx` 中用 SceneProvider 包裹整个应用
5. 创建 PR 并合并

**验证：**
- 运行 `npm run build`，无 TypeScript 报错
- 在任意组件中调用 `useScene()` hook，IDE 能自动补全 `addObject` 等方法名

---

## 阶段二：UI 静态框架搭建

> 今天完成，约 4 小时，共 5 个 PR

---

### PR 4 — 搭建主页面布局骨架

**目标：** 在 `app/page.tsx` 中搭建整体三区域布局（对象面板 / 画布 / 底部区域）

**步骤：**
1. 修改 `app/page.tsx`，删除默认欢迎内容
2. 用 Tailwind CSS 实现 design-document.md 第三节的布局：
   - 顶部标题栏：显示「VoiceScape」字样和「导出图片」占位按钮
   - 主体区域：左侧 25% 为对象面板占位，右侧 75% 为画布占位
   - 底部：文字反馈区占位 + 语音按钮占位
3. 各区域用不同背景色区分（用于开发期间肉眼确认布局），如面板用浅灰，画布用白色，底部用深灰
4. 创建 PR 并合并

**验证：**
- 浏览器打开 `localhost:3000`，能清晰看到四个区域（标题栏、左侧面板、主画布、底部）
- 页面在浏览器窗口缩放时布局不崩溃（不出现滚动条或区域错位）

---

### PR 5 — ObjectPanel 组件（静态展示）

**目标：** 实现左侧对象面板的静态 UI，能展示对象列表、关系列表、场景摘要

**步骤：**
1. 创建 `components/ObjectPanel.tsx`
2. 组件内部分三个区块：
   - 「对象」区块：从 SceneContext 读取 objects，每个对象渲染一个卡片（显示 display_name，预留缩略图位置）
   - 「关系」区块：从 SceneContext 读取 relations，每条关系渲染一行文字（格式：「subject骑着object」）
   - 「场景摘要」区块：显示 scene_summary 文字
3. 点击对象卡片时，调用 `setSelectedObjectId` 更新选中状态
4. 选中的对象卡片显示蓝色边框高亮
5. 场景为空时，面板显示占位文字「暂无对象，通过语音创建场景」
6. 将 ObjectPanel 放入 `app/page.tsx` 的左侧区域
7. 创建 PR 并合并

**验证：**
- 打开浏览器，左侧面板显示三个区块标题和空状态提示
- 在 SceneContext 的初始状态中临时加入一个假对象（如 `{ id: "test", display_name: "测试马" }`），刷新后面板能展示出来，移除假数据后恢复空状态

---

### PR 6 — FeedbackBar 组件

**目标：** 实现底部文字反馈区，能展示系统消息

**步骤：**
1. 创建 `components/FeedbackBar.tsx`
2. 组件接收 `message` 字符串 prop，渲染在深色背景的区域内
3. 消息文字用白色或浅色显示，字体稍大便于阅读
4. 当 message 为空时显示默认占位文字：「准备就绪，点击麦克风开始创作」
5. 在 `app/page.tsx` 中将 FeedbackBar 放入底部反馈区，先传入硬编码的测试字符串
6. 在 `app/page.tsx` 中添加 `feedbackMessage` 状态（useState），后续步骤统一从这里控制
7. 创建 PR 并合并

**验证：**
- 浏览器底部出现深色反馈区，显示占位文字
- 将 `feedbackMessage` 改为「测试消息」，浏览器刷新后显示「测试消息」

---

### PR 7 — VoiceButton 组件（语音录音功能）

**目标：** 实现语音录音按钮，能通过 Web Speech API 录音并返回识别文字

**步骤：**
1. 创建 `components/VoiceButton.tsx`
2. 组件内部实现三个状态的切换（idle / recording / processing），对应 design-document.md 第六节的视觉反馈表格
3. 录音状态下按钮变为红色脉冲动画
4. 使用 Web Speech API，设置语言为 `zh-CN`，点击开始/再次点击停止
5. 识别完成后，将识别结果文字通过 `onResult` 回调传给父组件
6. 识别期间及识别完成前显示 processing 状态
7. 在 `app/page.tsx` 中将 VoiceButton 放入底部区域，onResult 先只是更新 feedbackMessage（显示「你说的是：[识别文字]」）
8. 创建 PR 并合并

**验证：**
- 在 Chrome 浏览器中点击按钮，浏览器弹出麦克风权限请求，同意后按钮变红
- 说「你好」，再次点击停止，底部反馈区显示「你说的是：你好」
- 连续点击两次确认状态切换正常，不出现卡死情况

---

### PR 8 — SceneCanvas 组件（静态画布）

**目标：** 实现主画布区域，能以绝对定位方式渲染背景图和对象图片

**步骤：**
1. 创建 `components/SceneCanvas.tsx`
2. 画布容器使用 `position: relative`，设定固定宽高比（如 16:9）
3. 背景图层：若 `background_image_url` 不为空，则渲染 `<img>` 铺满画布底层（z-index: 0）
4. 对象图层：遍历 SceneContext 中的 objects，每个对象渲染一个绝对定位的 `<img>`，位置由 position.x/y 决定，尺寸由 size 决定，层级由 z_index 决定
5. 选中对象（selectedObjectId 对应的对象）额外添加发光边框样式
6. 给画布容器添加 id 属性（`id="scene-canvas"`），供后续 html2canvas 导出使用
7. 将 SceneCanvas 放入 `app/page.tsx` 的画布区域
8. 创建 PR 并合并

**验证：**
- 浏览器中主画布区域显示白色空白画布，有明显边界
- 在 SceneContext 初始状态中临时加入一个假对象（带有 image_url 指向任意网络图片），刷新后画布上出现该图片，移除后恢复空白

---

## 阶段三：API 路由实现

> 明天上午完成，约 3 小时，共 3 个 PR

---

### PR 9 — /api/parse 路由（Claude 解析）

**目标：** 实现语音文字 → 场景操作 JSON 的解析接口

**步骤：**
1. 创建 `app/api/parse/route.ts`
2. 接收 POST 请求，body 为 `{ text: string, currentState: SceneState, selectedObjectId?: string }`
3. 使用 `@anthropic-ai/sdk` 调用 Claude claude-haiku-4-5 模型
4. System Prompt 要告知 Claude：当前场景状态（对象列表、关系列表、选中对象），以及它需要返回的 JSON 格式（SceneOperation 结构）
5. User Prompt 就是用户说的话（text 字段）
6. 要求 Claude 必须返回纯 JSON，不含其他文字
7. 解析 Claude 返回的 JSON 字符串，以 `{ operation: SceneOperation }` 格式返回给前端
8. 添加错误处理：Claude 调用失败时返回 `{ error: "解析失败" }`
9. 创建 PR 并合并

**验证：**
- 用 Postman 或 curl 向 `localhost:3000/api/parse` 发送 POST 请求
  - body: `{ "text": "创建一匹马", "currentState": { "objects": [], "relations": [], "scene_summary": "" } }`
  - 期望返回包含 `intent: "create"` 和对象信息的 JSON
- 再发送一条 `{ "text": "把马移到房子前面", "currentState": { ... 包含马和房子 ... } }`
  - 期望返回包含 `intent: "move"` 的 JSON

---

### PR 10 — /api/generate 路由（Gemini 生图）

**目标：** 实现对象图片和背景图片的生成接口

**步骤：**
1. 创建 `app/api/generate/route.ts`
2. 接收 POST 请求，body 为 `{ type: "object" | "background", description: string, attributes?: ObjectAttributes }`
3. 使用 `@google/genai` 调用 Gemini 2.5 Flash Image 模型
4. 当 type 为 `object` 时：使用 tech-stack.md 第 2.8 节的对象生图 Prompt 模板构造 prompt，生成白底图片
5. 当 type 为 `background` 时：使用背景图 Prompt 模板，生成场景背景图
6. 将生成的图片以 base64 字符串形式返回给前端，格式为 `{ imageBase64: string, mimeType: string }`
7. 添加错误处理：生图失败时返回 `{ error: "生图失败" }`
8. 创建 PR 并合并

**验证：**
- 用 Postman 向 `localhost:3000/api/generate` 发送 POST 请求
  - body: `{ "type": "object", "description": "a horse" }`
  - 期望返回 base64 字符串，将其前缀加 `data:image/png;base64,` 后粘贴到浏览器地址栏，能看到生成的马的图片
- 用同样方式测试 background 类型，能看到生成的背景图

---

### PR 11 — /api/removebg 路由（背景去除）

**目标：** 实现对象图片背景去除接口

**步骤：**
1. 创建 `app/api/removebg/route.ts`
2. 接收 POST 请求，body 为 `{ imageBase64: string }`（来自 /api/generate 的结果）
3. 调用 remove.bg REST API，将 base64 图片发送过去
4. 返回去除背景后的透明 PNG 图片，格式同样为 `{ imageBase64: string }`
5. 添加错误处理
6. 创建 PR 并合并

**验证：**
- 先调用 /api/generate 拿到一张白底的马的图片 base64
- 将该 base64 作为 body 发送到 /api/removebg
- 期望返回新的 base64，将其粘贴到浏览器地址栏，能看到马的图片背景已变透明（棋盘格效果）

---

## 阶段四：核心功能集成

> 明天下午完成，约 6 小时，共 8 个 PR

---

### PR 12 — 场景创建流程：语音 → 解析 → 对象生成 → 渲染

**目标：** 打通第一个完整流程：说一句话，场景里出现对应对象

**步骤：**
1. 在 `app/page.tsx` 中，当 VoiceButton 的 onResult 触发后，执行以下串行流程：
   a. 更新 feedbackMessage 为「识别到：[text]，正在解析...」
   b. 调用 /api/parse，传入识别文字和当前 SceneState
   c. 若 intent 为 `create`：对每个新对象依次调用 /api/generate（type=object），再调用 /api/removebg
   d. 将返回的透明 PNG base64 转为 data URL，作为 image_url 存入新 SceneObject
   e. 为新对象分配初始位置（画布中心偏移，多个对象均匀分散）
   f. 调用 SceneContext 的 addObject 添加到状态
   g. 更新 feedbackMessage 为「已创建 N 个对象：...」
2. 若 intent 为 `ask_background`（系统追问背景），更新 feedbackMessage 为「你希望场景的背景是什么环境？」并设置一个「等待背景输入」的标志位
3. 创建 PR 并合并

**验证：**
- 打开浏览器，点击麦克风，说「创建一匹马」，等待约 10-15 秒
- 画布上出现一张马的插画图片（透明背景）
- 左侧对象面板出现「马」的条目
- 底部反馈区显示「已创建 1 个对象：马」
- 再说「创建一座房子」，画布上再出现房子图片，面板新增一条

---

### PR 13 — 背景生成流程

**目标：** 实现场景背景的生成和渲染

**步骤：**
1. 在 PR 12 的流程基础上，补充背景处理逻辑：
   - 若检测到「等待背景输入」标志位且用户说了一句话，将该句话作为背景描述
   - 调用 /api/generate（type=background），传入背景描述
   - 将返回的图片 base64 转为 data URL，调用 SceneContext 的 setBackground 更新
   - 清除「等待背景输入」标志位
   - 更新 feedbackMessage 为「背景已设置：[描述]」
2. 首次创建对象完成后，自动发送追问：「你希望场景的背景是什么环境？」
3. 创建 PR 并合并

**验证：**
- 说「创建一匹马和一座房子」，等待对象生成
- 反馈区出现追问「你希望场景的背景是什么环境？」
- 说「傍晚的草原」，等待约 10 秒
- 画布底层出现草原背景图，对象图片叠加在背景上方

---

### PR 14 — 对象选中功能

**目标：** 实现点击对象面板选中对象，画布高亮对应对象

**步骤：**
1. 确认 PR 5 中的对象面板点击已连接到 SceneContext 的 setSelectedObjectId
2. 在 SceneCanvas 组件中，对 selectedObjectId 对应的对象图片添加 CSS 高亮样式（蓝色发光边框，如 `box-shadow: 0 0 0 3px blue`）
3. 点击面板中已选中的对象，再次点击取消选中（selectedObjectId 设回 null）
4. 选中状态变更时，更新 feedbackMessage 为「已选中：[display_name]，接下来的语音命令将针对它」或「已取消选中」
5. 创建 PR 并合并

**验证：**
- 创建两个对象后，点击面板中的「马」，画布上马的图片出现蓝色边框，底部显示选中提示
- 再次点击「马」，边框消失
- 点击「房子」，房子出现边框，马的边框消失

---

### PR 15 — 对象移动功能

**目标：** 通过语音命令移动指定对象在画布上的位置

**步骤：**
1. 在 /api/parse 路由的 System Prompt 中，补充说明移动操作的返回格式（含 target、position.relation、position.reference）
2. 在前端，当解析结果 intent 为 `move` 时：
   - 根据 target_display_name 找到目标对象的 id
   - 根据 position.relation（left_of / right_of / front_of / behind / next_to）和 reference_display_name 找到参考对象
   - 根据关系规则计算新的 position.x、position.y 和 z_index（如 front_of = y 增大 + z_index 增大）
   - 调用 SceneContext 的 updateObject 更新位置
3. 若选中了对象，「它」「这个」等代词自动指向选中对象
4. 更新 feedbackMessage 为「已移动：[对象名] → [位置描述]」
5. 创建 PR 并合并

**验证：**
- 创建马和房子后，说「把马移到房子前面」
- 画布上马的位置移动到房子下方（前面=靠近视角），且 z-index 更高（覆盖房子部分）
- 说「把马移到房子左边」，马移动到房子的水平左侧

---

### PR 16 — 对象缩放功能

**目标：** 通过语音命令调整对象大小

**步骤：**
1. /api/parse 补充缩放操作的返回格式（含 target、scale：larger / smaller / specific_size）
2. 前端当 intent 为 `scale` 时：
   - 找到目标对象
   - larger：width 和 height 各乘以 1.5
   - smaller：width 和 height 各乘以 0.67
   - 调用 updateObject 更新 size
3. 缩放后边界检测：若对象超出画布范围，自动将位置拉回画布内
4. 更新 feedbackMessage 为「已缩放：[对象名] → [放大/缩小]」
5. 创建 PR 并合并

**验证：**
- 创建一匹马，说「让马变大一些」，画布上马的图片变大约 1.5 倍
- 说「让马变小一些」，图片缩小
- 选中马后说「让它变大」，马变大（代词指向选中对象）

---

### PR 17 — 对象颜色修改功能

**目标：** 通过语音命令修改对象颜色（重新生图）

**步骤：**
1. /api/parse 补充颜色修改操作的返回格式（含 target、new_color）
2. 前端当 intent 为 `recolor` 时：
   - 找到目标对象，读取其 type 和其他 attributes
   - 更新 attributes.color 为新颜色
   - 重新调用 /api/generate（使用带新颜色的 Prompt）和 /api/removebg
   - 用新图片 url 调用 updateObject
3. 等待重新生图期间，feedbackMessage 显示「正在将 [对象名] 改为 [颜色]，请稍候...」
4. 完成后 feedbackMessage 更新为「已更新：[对象名] → [颜色]」
5. 创建 PR 并合并

**验证：**
- 创建一匹马，说「把马改成白色」，等待约 10 秒
- 画布上马的图片替换为白色马的图片

---

### PR 18 — 对象删除功能（L2 风险确认）

**目标：** 通过语音删除对象，执行前需用户确认

**步骤：**
1. /api/parse 补充删除操作的返回格式（含 target 或 target_all_of_type，以及 risk_level）
2. 前端当 intent 为 `delete` 且 risk_level 为 L2 时：
   - 不立即执行删除
   - 更新 feedbackMessage 为「将删除 [对象名]，确认吗？请说"确认"或"取消"」
   - 设置「等待确认」标志位，记录待删除的对象 id
3. 用户下一次语音识别结果：
   - 若识别到「确认」：执行删除（调用 removeObject），更新 feedbackMessage「已删除：[对象名]」
   - 若识别到「取消」：清除标志位，更新 feedbackMessage「已取消删除」
4. 同时删除该对象相关的所有 relations
5. 创建 PR 并合并

**验证：**
- 创建一匹马，说「删除马」
- 反馈区显示确认提示，画布上马还在
- 说「确认」，马从画布上消失，面板中条目移除
- 重新创建马，说「删除马」，然后说「取消」，马保留不变

---

## 阶段五：收尾与交付

> 明天晚上完成，约 3 小时，共 4 个 PR

---

### PR 19 — PNG 导出功能

**目标：** 实现点击「导出图片」按钮将画布导出为 PNG 文件

**步骤：**
1. 安装 `html2canvas` 依赖（`npm install html2canvas`）
2. 在顶部标题栏的「导出图片」按钮上绑定点击事件
3. 点击后调用 html2canvas，传入 id 为 `scene-canvas` 的 DOM 元素
4. 将生成的 canvas 转为 Blob
5. 触发浏览器下载，文件名格式为 `voicescape_[scene_summary]_[日期].png`，scene_summary 为空时用「未命名场景」
6. 导出期间按钮显示「导出中...」禁用状态，完成后恢复
7. 创建 PR 并合并

**验证：**
- 创建几个对象并设置背景后，点击「导出图片」
- 浏览器弹出下载对话框，保存后打开图片，能看到完整的场景（背景 + 对象）
- 文件名包含场景描述和日期

---

### PR 20 — 指代消解处理

**目标：** 当用户语音有歧义时，系统追问并等待用户澄清

**步骤：**
1. /api/parse 补充 clarify 意图的返回格式（含 clarification_question 字符串，列出存在歧义的对象）
2. 前端当 intent 为 `clarify` 时：
   - 更新 feedbackMessage 为 clarification_question
   - 设置「等待澄清」标志位，记录原始 operation 的其他字段
3. 用户下次录音后，将澄清内容和原始 operation 一起再次发给 /api/parse 重新解析
4. 解析后正常执行操作
5. 创建 PR 并合并

**验证：**
- 创建两棵树（树1、树2），说「把树移到右边」
- 反馈区显示「场景中有 树1 和 树2，你说的是哪一棵？」
- 说「左边那棵」，对应的树移动到右边

---

### PR 21 — 部署到 Vercel

**目标：** 将项目部署到 Vercel，获得公开可访问的 URL

**步骤：**
1. 登录 Vercel 官网，连接 GitHub 账号
2. 导入 voicescape 仓库，Vercel 自动识别为 Next.js 项目
3. 在 Vercel 控制台的 Environment Variables 中填入三个真实密钥：
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_AI_API_KEY`
   - `REMOVEBG_API_KEY`
4. 点击 Deploy，等待部署完成
5. 记录 Vercel 分配的公开 URL（格式如 `voicescape-xxx.vercel.app`）
6. 创建 PR 并合并（PR 内容：添加 `vercel.json` 配置文件或仅记录部署成功）

**验证：**
- 在 Vercel URL 打开页面，页面正常加载，无 404 或 500 错误
- 在 Vercel URL 上完整测试一次：说话 → 对象生成 → 出现在画布 → 导出图片
- 换一台设备（或无痕模式）也能正常访问和使用

---

### PR 22 — 编写 README

**目标：** 完成符合比赛要求的 README.md，放在仓库根目录

**步骤：**
1. 在项目根目录创建 `README.md`
2. 包含以下内容（参考 design-document.md 和 tech-stack.md）：
   - **项目简介**：一段话说明 VoiceScape 是什么、解决什么问题
   - **功能演示**：列出已实现的 MVP 功能（对应 design-document.md 第九节功能范围）
   - **使用方式**：如何运行（clone → npm install → 填写 .env.local → npm run dev → Chrome 打开 localhost:3000）
   - **注意事项**：仅支持 Chrome / Edge 浏览器
   - **第三方依赖**：完整列出所有 npm 包和外部 API 服务（对应 tech-stack.md 第六节），并说明哪些是原创功能、哪些是第三方能力
   - **环境变量说明**：说明需要哪三个密钥，以及从哪里获取
   - **本地运行截图**（可选，放置一张 Demo 截图）
3. 将 README 提交并合并到 main 分支

**验证：**
- 在 GitHub 仓库首页打开，README 正常渲染，表格、标题、代码块无格式错误
- 按照 README 的运行指引，在一台没有任何前期操作的电脑上能顺利 clone 并运行项目

---

## 完成后：录制 Demo 视频

**不计入 PR，单独完成**

**步骤：**
1. 打开 Vercel 线上地址（在 Chrome 中）
2. 录屏工具开始录制
3. 演示以下流程（建议总时长 3~5 分钟）：
   - 说「我梦见自己骑马去朋友家」，等待对象生成
   - 回答背景追问「傍晚的草原」，等待背景生成
   - 说「把马移到房子前面」，观察移动
   - 说「把马改成白色」，等待重新生图
   - 点击「导出图片」，展示下载的 PNG
4. 导出视频并上传到指定平台

---

## 时间分配总览

| 时段 | 内容 | PR 数量 |
|------|------|---------|
| 今天下午 | 阶段一：项目基础（PR 1-3） | 3 |
| 今天傍晚 | 阶段二：UI 框架（PR 4-8） | 5 |
| 明天上午 | 阶段三：API 路由（PR 9-11） | 3 |
| 明天下午 | 阶段四：核心功能（PR 12-18） | 7 |
| 明天晚上 | 阶段五：收尾（PR 19-22）+ Demo 录制 | 4 |

---

## 风险提示

| 风险 | 缓解方案 |
|------|---------|
| Gemini 生图速度慢（每张 10~20s） | 先只创建 1 个对象测试流程，批量生成留到后期 |
| remove.bg 免费额度用完 | 测试阶段复用同一张图，正式 Demo 时才生成新图 |
| Web Speech API 识别不准 | 说话放慢、清晰，靠近麦克风；备选用文字输入框辅助测试 |
| Vercel 部署失败 | 先确保本地 `npm run build` 无报错，再推送部署 |
| 某个 PR 卡住超时 | 跳过该 PR，优先保证核心流程（创建 + 渲染 + 导出）可演示 |
