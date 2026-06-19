"use client";

interface FeedbackBarProps {
  message?: string;
}

export default function FeedbackBar({ message }: FeedbackBarProps) {
  return (
    <div className="px-6 py-3 min-h-[56px] flex items-center">
      <p className="text-sm text-zinc-300 leading-relaxed">
        {message || "准备就绪，点击麦克风开始创作"}
      </p>
    </div>
  );
}
