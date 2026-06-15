"use client";

/**
 * Chat session page — /chat/[sessionId]
 *
 * Shows the message history for the session and a streaming input.
 *
 * TODO:
 *  1. Fetch message history via GET /api/v1/chat/sessions/{sessionId}/messages
 *  2. On send:
 *     a. Optimistically add user message to state
 *     b. Open EventSource to POST /api/v1/chat/sessions/{sessionId}/messages
 *     c. Append tokens to a streaming assistant message bubble
 *     d. On [DONE], finalise the message
 *  3. Render user messages on the right, assistant messages on the left
 *  4. Render Markdown in assistant messages (react-markdown + rehype-highlight)
 */
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { useAuthStore } from "@/store/authStore";

interface Props {
  params: { sessionId: string };
}

export default function ChatSessionPage({ params }: Props) {
  const { sessionId } = params;
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
      api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`).then((r) => r.data),
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

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // SSE streaming
    // The POST request to initiate the stream should go through our secure api instance
    // However, EventSource doesn't easily support custom headers for the initial POST.
    // A common pattern is to use a standard fetch/axios POST to *initiate* the stream,
    // and then connect EventSource. The backend should handle this.
    // For now, we'll use EventSource directly as the README suggests, but with the token from Zustand.
    // Note: EventSource doesn't support custom headers, so we'll pass the token as a query param.
    // This requires a backend change to accept the token from a query parameter.
    // A more secure alternative is to use fetch streaming instead of EventSource.
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
        // Commit the full assistant message
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
      // Handle error, maybe show a message to the user
      console.error("EventSource failed.");
      setStreamingContent(null);
      setIsSending(false);
      source.close();
    };
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {streamingContent !== null && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl px-4 py-2 bg-gray-100 text-gray-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {streamingContent || "▋"}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2 items-end">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              id="rag"
              checked={useRag}
              onChange={(e) => setUseRag(e.target.checked)}
            />
            <label htmlFor="rag">Use uploaded documents (RAG)</label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything..."
            rows={2}
            className="border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 h-10"
        >
          Send
        </button>
      </div>
    </div>
  );
}
