"use client";

/**
 * /chat/[sessionId] — Active chat session page
 *
 * Layout: ChatSidebar (left) | Chat area (right)
 * Preserves all existing logic: RAG toggle, SSE with token, markdown rendering.
 *
 * Place at: src/app/chat/[sessionId]/page.tsx
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChatMessage, ChatSession } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { useAuthStore } from "@/store/authStore";
import ChatSidebar from "@/components/layout/ChatSidebar";

export default function ChatSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  // ── Sidebar data ──────────────────────────────────────────
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () =>
      api.get<ChatSession[]>("/chat/sessions").then((r) => r.data),
  });

  const createSession = useMutation({
    mutationFn: () =>
      api.post<ChatSession>("/chat/sessions", { title: "New Chat" }),
    onSuccess: (res) => router.push(`/chat/${res.data.id}`),
  });

  // ── Chat state (your existing logic, unchanged) ───────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [useRag, setUseRag] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: history } = useQuery({
    queryKey: ["messages", sessionId],
    queryFn: () =>
      api
        .get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)
        .then((r) => r.data),
  });

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput("");
    setIsSending(true);
    setStreamingContent("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const streamUrl = new URL(
      `chat/sessions/${sessionId}/messages/stream`,
      `${api.defaults.baseURL}/`
    );
    streamUrl.searchParams.set("token", accessToken ?? "");
    streamUrl.searchParams.set("use_rag", String(useRag));
    streamUrl.searchParams.set("content", content);

    const source = new EventSource(streamUrl.toString());
    let fullContent = "";

    source.onmessage = (event) => {
      if (event.data === "[DONE]") {
        source.close();
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          session_id: sessionId,
          role: "assistant",
          content: fullContent,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent(null);
        setIsSending(false);
        return;
      }
      try {
        const { delta } = JSON.parse(event.data);
        fullContent += delta;
        setStreamingContent(fullContent);
      } catch {
        // ignore parse errors
      }
    };

    source.onerror = () => {
      console.error("EventSource failed.");
      setStreamingContent(null);
      setIsSending(false);
      source.close();
    };
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#f0f2f8]">

      {/* ── Left sidebar ──────────────────────────────────── */}
      <ChatSidebar
        sessions={sessions ?? []}
        isLoading={sessionsLoading}
        activeSessionId={sessionId}
        onNewChat={() => createSession.mutate()}
        isCreating={createSession.isPending}
      />

      {/* ── Right: chat area ──────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && streamingContent === null && (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Send a message to begin
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="prose prose-sm max-w-none prose-p:my-1"
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Streaming bubble */}
          {streamingContent !== null && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-gray-100 text-gray-900">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  className="prose prose-sm max-w-none prose-p:my-1"
                >
                  {streamingContent || "▋"}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          {/* RAG toggle */}
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <input
              type="checkbox"
              id="rag"
              checked={useRag}
              onChange={(e) => setUseRag(e.target.checked)}
              className="accent-blue-600"
            />
            <label htmlFor="rag" className="cursor-pointer select-none">
              Use uploaded documents (RAG)
            </label>
          </div>

          {/* Textarea + send */}
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                          focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything…"
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800
                         placeholder-gray-400 outline-none leading-relaxed max-h-40"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                         bg-blue-600 hover:bg-blue-700 text-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
              aria-label="Send"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}