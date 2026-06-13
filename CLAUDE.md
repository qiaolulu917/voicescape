# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VoiceScape** — a voice-driven conversational scene drawing tool. Users describe scenes in natural Chinese speech; the system extracts objects and relations, generates individual AI images per object, and renders them as a layered, independently-editable canvas.

Key distinction: output is NOT a single static image — it is a collection of independent objects (`SceneObject[]`) that can each be moved, resized, recolored, or deleted individually.

## Development Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
```

This is a Next.js 14 App Router project with TypeScript and Tailwind CSS.

## Architecture

### Data Flow

```
Browser mic → Web Speech API (zh-CN)
  → POST /api/parse   → Claude claude-haiku-4-5  → SceneOperation JSON
  → POST /api/generate → Gemini 2.5 Flash Image  → white-bg image
  → POST /api/removebg → remove.bg API           → transparent PNG
  → SceneContext (React state)                   → Canvas render
```

All external API calls are proxied through Next.js API Routes — API keys never reach the browser.

### Core State: `SceneState`

Defined in `types/scene.ts`. Everything on the canvas is derived from this single JSON object:

```ts
{
  scene_summary: string,
  background_image_url: string,
  objects: SceneObject[],   // each has id, display_name, position, size, z_index, image_url
  relations: Relation[]
}
```

`SceneContext` (`context/SceneContext.tsx`) holds this state and exposes dispatch to all components.

### Canvas Rendering

The canvas is **HTML divs with CSS absolute positioning** — NOT `<canvas>` element, NOT Konva/Fabric. Each `SceneObject` maps to an absolutely-positioned `<img>` tag. `z_index` controls layering; `position.x/y` and `size.width/height` drive CSS directly.

Selected objects show a `box-shadow` highlight. Export uses `html2canvas` on the canvas div.

### Voice Flow

1. User clicks `VoiceButton` → starts `webkitSpeechRecognition` with `lang: 'zh-CN'`
2. On stop → transcript sent to `POST /api/parse` with current `SceneState` as context
3. API returns `SceneOperation` JSON (intent + target + parameters + risk_level)
4. Risk level determines next action:
   - **L1** (move, recolor single object): execute immediately
   - **L2** (delete, batch ops): show confirmation prompt in `FeedbackBar`, wait for voice "确认"/"取消"
   - **L3** (large restructure): decompose into steps, confirm each

### Object Identity

Each object has an internal UUID-style `id` (e.g., `horse_001`) and a user-visible `display_name` (e.g., `白马` or `马1`). The LLM always receives `display_name` for reference; the system tracks by `id`.

### Background Flow

Background is generated separately from objects. After initial scene creation, the system asks: `"你希望背景是什么环境？"` → user replies → `POST /api/generate` with background prompt (no remove.bg step needed for backgrounds).

### Disambiguation

When a voice command targets an ambiguous object (e.g., "把树移到右边" when tree1 and tree2 exist), the `/api/parse` response returns `intent: "clarify"` with a question. `FeedbackBar` displays it; next voice input is treated as a clarification, not a new command.

## Environment Variables

Required in `.env.local` (local) and Vercel Environment Variables (production):

```
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
REMOVEBG_API_KEY=
```

## Key Design Decisions

- **Object-first scene model**: each spoken entity becomes an independently managed `SceneObject`, enabling per-object editing without regenerating the whole scene
- **Flat illustration style enforced in prompts**: all object images use the same prompt suffix (`flat illustration style, white background, cartoon, no shadows`) to ensure visual consistency across separately-generated images
- **Web Speech API only**: requires Chrome/Edge; demo must use Chrome
- **No session persistence in MVP**: page refresh clears the scene; export to PNG is the only save mechanism
写任何代码前必须完整阅读memory-bank/@architecture.md
写任何代码前必须完整阅读 memory-bank/@design-document.md
每完成一个重大功能或里程碑后，必须更新memory-bank/@architecture.md