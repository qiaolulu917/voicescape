"use client";

import { useState } from "react";
import ObjectPanel from "@/components/ObjectPanel";
import FeedbackBar from "@/components/FeedbackBar";
import VoiceButton from "@/components/VoiceButton";
import SceneCanvas from "@/components/SceneCanvas";

export default function Home() {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  function handleVoiceResult(text: string) {
    setFeedbackMessage(`你说的是：${text}`);
  }

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
        <main className="flex-1 overflow-hidden">
          <SceneCanvas />
        </main>
      </div>

      {/* 底部区域 */}
      <footer className="shrink-0 bg-zinc-800 border-t border-zinc-700">
        <FeedbackBar message={feedbackMessage} />
        {/* 语音按钮区 */}
        <div className="flex items-center justify-center pb-4">
          <VoiceButton onResult={handleVoiceResult} isProcessing={isProcessing} />
        </div>
      </footer>
    </div>
  );
}
