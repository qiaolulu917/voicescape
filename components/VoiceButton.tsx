"use client";

import { useState, useRef } from "react";

interface VoiceButtonProps {
  onResult: (text: string) => void;
  isProcessing: boolean;
}

export default function VoiceButton({ onResult, isProcessing }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  function startRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("请使用 Chrome 或 Edge 浏览器以使用语音功能");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  function handleClick() {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  if (isProcessing) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-6 py-3 bg-zinc-500 text-white rounded-full text-sm font-medium cursor-not-allowed"
      >
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        处理中...
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors animate-pulse"
      >
        🔴 录音中... 再次点击停止
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-full text-sm font-medium transition-colors"
    >
      🎤 点击说话
    </button>
  );
}
