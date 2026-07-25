"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  sessionId: string;
  content: string;
  useRag: boolean;
  thinkingMode: boolean;
  onDone: (
    finalAnswer: string,
    thinkingText: string,
    sources: { filename: string; text: string }[]
  ) => void | Promise<void>;
};

export default function StreamingMessage({ sessionId, content, useRag, thinkingMode, onDone }: Props) {
  const [sources, setSources] = useState<{ filename: string; text: string }[]>([]);
  const [thinking, setThinking] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");

  const accumulatedAnswerRef = useRef("");
  const accumulatedThinkingRef = useRef("");
  const accumulatedSourcesRef = useRef<{ filename: string; text: string }[]>([]);

  // ── Guards against React 18 Strict Mode double-firing ──
  const hasStartedRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const onDoneRef = useRef(onDone);

  // Keep onDone ref fresh without triggering the main effect
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Strict Mode guard: only fire the POST once per component lifetime
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const controller = new AbortController();
    controllerRef.current = controller;
    let cancelled = false;

    async function run() {
      let token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = `${apiUrl}/api/v1/chat/sessions/${sessionId}/messages`;
      const body = JSON.stringify({ content, use_rag: useRag, thinking_mode: thinkingMode });

      let res: Response | undefined;

      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body,
          signal: controller.signal,
        });

        // Handle 401 with token refresh
        if (res.status === 401) {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            try {
              const refreshRes = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });
              if (refreshRes.ok) {
                const data = await refreshRes.json();
                token = data.access_token;
                localStorage.setItem("access_token", token!);
                // Retry with new token
                res = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body,
                  signal: controller.signal,
                });
              }
            } catch {
              // refresh failed, fall through
            }
          }
        }

        if (!res || !res.ok || !res.body) {
          console.error("Chat stream request failed:", res?.status);
          return;
        }

        // ── Read the SSE stream ──
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          if (cancelled) break;
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            const raw = part.slice(6).trim();
            if (raw === "[DONE]") return;

            try {
              const parsed = JSON.parse(raw);
              if (!cancelled) {
                if ("sources" in parsed) {
                  setSources(parsed.sources);
                  accumulatedSourcesRef.current = parsed.sources;
                } else if ("status" in parsed) {
                  setStatus(parsed.status);
                } else if ("thinking" in parsed) {
                  setThinking((prev) => prev + parsed.thinking);
                  accumulatedThinkingRef.current += parsed.thinking;
                } else if ("delta" in parsed) {
                  setAnswer((prev) => prev + parsed.delta);
                  accumulatedAnswerRef.current += parsed.delta;
                }
              }
            } catch {
              // ignore malformed JSON chunks
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Component unmounted, expected
          return;
        }
        console.error("Stream error:", err);
      } finally {
        if (!cancelled) {
          await onDoneRef.current(
            accumulatedAnswerRef.current,
            accumulatedThinkingRef.current,
            accumulatedSourcesRef.current
          );
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: runs once per component mount. Props are captured in closure via hasStartedRef guard.

  const isWaiting = !answer && !thinking;

  return (
    <div className="max-w-[80%]">
      <style>{`
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .typing-dot {
          animation: typing-bounce 0.8s infinite ease-in-out;
        }
      `}</style>

      {/* Sources box */}
      {sources.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2 text-xs">
          <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">📎 Sources</p>
          <div className="flex flex-wrap gap-1">
            {sources.map((s, i) => (
              <span key={i} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 text-blue-700 dark:text-blue-300">
                {s.filename}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning box — only visible when thinking tokens arrive */}
      {thinking && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-2 text-xs italic text-amber-800 dark:text-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold not-italic">💡 Reasoning</span>
            {!answer && (
              <div className="flex items-center space-x-1 h-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full typing-dot" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1 h-1 bg-amber-500 rounded-full typing-dot" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1 h-1 bg-amber-500 rounded-full typing-dot" style={{ animationDelay: "300ms" }}></div>
              </div>
            )}
          </div>
          {thinking}
        </div>
      )}

      {/* The answer bubble (or waiting indicator) */}
      {(answer || isWaiting) && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none min-w-[140px]">
          {isWaiting ? (
            <div className="flex items-center gap-2 py-1 text-gray-500 dark:text-gray-400">
              <span className="text-xs font-medium animate-pulse">
                {status || (useRag ? "Searching knowledge" : thinkingMode ? "Thinking" : "Typing")}
              </span>
              <div className="flex items-center space-x-1 h-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children }) {
                  const isBlock = /language-(\w+)/.test(className || "");
                  return isBlock ? <pre>{children}</pre> : <code>{children}</code>;
                },
              }}
            >
              {answer}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}