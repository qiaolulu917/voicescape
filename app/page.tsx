"use client";

import ObjectPanel from "@/components/ObjectPanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-100">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200 shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">VoiceScape</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
          导出图片
        </button>
      </header>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧对象面板 25% */}
        <aside className="w-1/4 bg-zinc-50 border-r border-zinc-200 overflow-y-auto shrink-0">
          <ObjectPanel />
        </aside>

        {/* 右侧画布 75% */}
        <main className="flex-1 bg-white overflow-hidden flex items-center justify-center">
          <p className="text-sm text-zinc-300">画布占位</p>
        </main>
      </div>

      {/* 底部区域 */}
      <footer className="shrink-0 bg-zinc-800 border-t border-zinc-700">
        {/* 文字反馈区 */}
        <div className="px-6 py-3 min-h-[56px] flex items-center">
          <p className="text-sm text-zinc-300">准备就绪，点击麦克风开始创作</p>
        </div>
        {/* 语音按钮区 */}
        <div className="flex items-center justify-center pb-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-full text-sm font-medium transition-colors">
            🎤 点击说话
          </button>
        </div>
      </footer>
    </div>
  );
}
