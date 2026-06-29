"use client";

import { useState } from "react";
import { Brain, ChevronRight } from "lucide-react";

type ReasoningBlockProps = {
  thinking: string;
  isStreaming?: boolean;
};

export default function ReasoningBlock({ thinking, isStreaming = false }: ReasoningBlockProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!(thinking || "").trim() && !isStreaming) return null;

  return (
    <div className="group mb-2 w-full max-w-full overflow-hidden border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 cursor-pointer list-none select-none hover:bg-slate-200/40 dark:hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className={`h-3.5 w-3.5 text-blue-500 ${isStreaming ? "animate-pulse" : ""}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-350">Thought Process</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              Thinking...
            </span>
          )}
        </div>
        <ChevronRight className={`h-3.5 w-3.5 transform transition-transform ${isOpen ? "rotate-90" : ""} text-slate-400 dark:text-slate-500`} />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-3.5 pb-2.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-slate-600 dark:text-slate-350 scrollbar-thin">
          {thinking}
        </div>
      )}
    </div>
  );
}
