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
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { useAuthStore } from "@/store/authStore";
import ChatSidebar from "@/components/chat-sidebar";

interface Props {
  params: { sessionId: string };
}

export default function ChatSessionPage({ params }: Props) {
  const { sessionId } = params;
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [useRag, setUseRag] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  type ChatSession = {
  id: string;
  title: string;
};

const [sessions, setSessions] = useState<ChatSession[]>([]);
const currentSession = sessionId;
  

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

    if (messages.length === 0) {
      try {
        await api.patch(
          `/chat/sessions/${sessionId}`,
          {
            title: content
              .replace(/[?.!]/g, "")
              .slice(0, 40),
          }
        );

        fetchSessions();
      } catch (err) {
        console.error("Failed to update chat title", err);
      }
    }
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

    fetchSessions();

    setStreamingContent(null);
    setIsSending(false);

    try {
      const response = await fetch(
        `${api.defaults.baseURL}/chat/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content,
            use_rag: useRag,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") {
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
            const parsed = JSON.parse(data);

            if (parsed.delta) {
              fullContent += parsed.delta;
              setStreamingContent(fullContent);
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStreamingContent(null);
      setIsSending(false);
    }
  };

  const fetchSessions = async () => {
  const response = await api.get("/chat/sessions");
  setSessions(response.data);
};

  useEffect(() => {
  fetchSessions();
}, []);

  const createNewChat = async () => {
  const response = await api.post("/chat/sessions", {
    title: "New Chat",
  });

  router.push(`/chat/${response.data.id}`);
};

const deleteChat = async (sessionId: string) => {
  try {
    await api.delete(`/chat/sessions/${sessionId}`);

    const updated = sessions.filter(
      (s) => s.id !== sessionId
    );

    setSessions(updated);

    if (currentSession === sessionId) {
      if (updated.length > 0) {
        router.push(`/chat/${updated[0].id}`);
      } else {
        router.push("/chat");
      }
    }
  } catch (err) {
    console.error(err);
  }
};
    
  return (
  <div className="flex h-screen">
    <ChatSidebar
  sessions={sessions}
  currentSession={currentSession ?? ""}
  onNewChat={createNewChat}
  onDeleteChat={deleteChat}
/>
    <div className="flex flex-col flex-1 max-w-3xl mx-auto">
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
  </div>
  );
}
