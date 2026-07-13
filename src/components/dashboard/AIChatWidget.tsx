"use client";
// AIChatWidget.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIChatWidget() {
  const router = useRouter();
  const [input, setInput] = useState("");

  function handleSubmit() {
    if (!input.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(input)}`);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">AI Assistant</h2>
        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
          Online
        </span>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {["Summarise my notes", "What's due today?", "Draft an email"].map(
          (suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
            >
              {suggestion}
            </button>
          )
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask anything…"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="bg-purple-600 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-40 hover:bg-purple-700 transition-colors"
        >
          →
        </button>
      </div>

      <a
        href="/chat"
        className="block mt-3 text-xs text-purple-600 hover:underline text-center"
      >
        Open full chat →
      </a>
    </div>
  );
}