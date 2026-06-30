"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSessions, useMessages, useCreateSession, useDeleteSession } from "@/hooks/useChat";
import api from "@/lib/api";
import ChatInput from "@/components/chat/ChatInput";
import AIMessage from "@/components/chat/AIMessage";
import ReactMarkdown from "react-markdown";
import ReasoningBlock from "@/components/chat/ReasoningBlock";
import { MessageSquare, Trash2, Plus, ChevronRight, Info, BookOpen, X } from "lucide-react";

type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  thinking_enabled?: boolean;
  sources?: {
    filename?: string;
    text?: string;
    score?: number;
    match_type?: string;
    is_meta?: boolean;
    use_hyde?: boolean;
    hyde_succeeded?: boolean;
    hyde_document?: string | null;
    retrieval_mode?: string;
    use_reranker?: boolean;
    reranker_succeeded?: boolean;
  }[];
  created_at?: string;
};

export default function ChatSessionPage() {
  const queryClient = useQueryClient();
  const createSession = useCreateSession();
  const deleteSessionMutation = useDeleteSession();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isAsking, setIsAsking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDrawerSources, setActiveDrawerSources] = useState<any[] | null>(null);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteSessionMutation.mutate(id, {
        onSuccess: () => {
          if (activeSessionId === id) {
            const remaining = sessions?.filter((s) => s.id !== id) ?? [];
            if (remaining.length > 0) {
              setActiveSessionId(remaining[0].id);
            } else {
              setActiveSessionId("");
              setLocalMessages([]);
            }
          }
        }
      });
    }
  };

  // Local messages state — we manage this directly like the RAG project
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSessionIdRef = useRef<string>("");

  // Pick the latest session on load
  const latestSessionId = sessions?.[0]?.id ?? "";
  useEffect(() => {
    if (latestSessionId && !isAsking) {
      setActiveSessionId(latestSessionId);
    }
  }, [latestSessionId, isAsking]);

  // Load messages from DB when session changes
  const { data: dbMessages, isLoading: messagesLoading } = useMessages(activeSessionId || null);

  // Sync DB messages into local state when not actively streaming, avoiding stale overwrite wipeouts
  useEffect(() => {
    if (dbMessages && !isAsking) {
      const sessionChanged = activeSessionId !== lastSessionIdRef.current;
      if (sessionChanged) {
        setLocalMessages(dbMessages as ChatMessage[]);
        lastSessionIdRef.current = activeSessionId;
      } else {
        // Only sync if the DB messages has caught up or has more messages
        if (dbMessages.length >= localMessages.length) {
          setLocalMessages(dbMessages as ChatMessage[]);
        }
      }
    }
  }, [dbMessages, isAsking, activeSessionId, localMessages.length]);

  // Fetch all documents for selection
  const { data: allDocuments } = useQuery<any[]>({
    queryKey: ["all-documents"],
    queryFn: async () => {
      const res = await api.get("/documents");
      return res.data;
    },
  });

  // Filter documents to show those belonging to the current session or global ones (session_id is null)
  const sessionDocuments = allDocuments?.filter(
    (doc) => doc.processed && (doc.session_id === activeSessionId || doc.session_id === null)
  ) ?? [];

  const isLoading = sessionsLoading || messagesLoading;

  // Auto-scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [localMessages]);

  // Stop generation
  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsAsking(false);
    }
  }

  // ── Send message and stream response inline (RAG project pattern) ──
  async function handleSend(
    text: string,
    useRag: boolean,
    thinkingMode: boolean,
    webSearch: boolean = false,
    useHyde: boolean = false,
    retrievalMode: string = "semantic",
    useReranker: boolean = false,
    ragChunkLimit: number = 4,
    documentIds: string[] | null = null
  ) {
    const currentQuestion = text.trim();
    if (!currentQuestion || isAsking) return;

    let currentId = activeSessionId;
    if (!currentId) {
      try {
        const newSession = await createSession.mutateAsync();
        currentId = newSession.id;
        lastSessionIdRef.current = currentId; // Prevent sync wipeout on first message
        setActiveSessionId(currentId);
      } catch (err) {
        console.error("Failed to create session", err);
        return;
      }
    }

    setIsAsking(true);

    // Append user message and empty assistant placeholder immediately
    const tempAssistantId = `asst-${Date.now()}`;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        session_id: currentId,
        role: "user",
        content: currentQuestion,
        created_at: new Date().toISOString(),
      },
      {
        id: tempAssistantId,
        session_id: currentId,
        role: "assistant",
        content: "",
        thinking: "",
        thinking_enabled: thinkingMode,
        sources: [],
        created_at: new Date().toISOString(),
      },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = `${apiUrl}/api/v1/chat/sessions/${currentId}/messages`;

      let res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content: currentQuestion,
          use_rag: useRag,
          thinking_mode: thinkingMode,
          web_search: webSearch,
          use_hyde: useHyde,
          retrieval_mode: retrievalMode,
          use_reranker: useReranker,
          rag_chunk_limit: ragChunkLimit,
          document_ids: documentIds,
        }),
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
              res = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  content: currentQuestion,
                  use_rag: useRag,
                  thinking_mode: thinkingMode,
                  web_search: webSearch,
                  use_hyde: useHyde,
                  retrieval_mode: retrievalMode,
                  use_reranker: useReranker,
                  rag_chunk_limit: ragChunkLimit,
                  document_ids: documentIds,
                }),
                signal: controller.signal,
              });
            }
          } catch {
            // refresh failed
          }
        }
      }

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      // ── Read the SSE stream inline ──
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantAnswer = "";
      let assistantThinking = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const raw = part.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const parsed = JSON.parse(raw);
            console.log("🔍 Stream parsed chunk:", parsed);
            if ("sources" in parsed) {
              setLocalMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id === tempAssistantId) {
                    const combinedSources = [...(parsed.sources || [])];
                    if (parsed.search_metadata) {
                      combinedSources.push({ ...parsed.search_metadata, is_meta: true });
                    }
                    return { ...msg, sources: combinedSources };
                  }
                  return msg;
                })
              );
            } else if ("thinking" in parsed) {
              console.log("💡 Received thinking token:", parsed.thinking);
              assistantThinking += parsed.thinking;
              setLocalMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempAssistantId ? { ...msg, thinking: assistantThinking } : msg
                )
              );
            } else if ("delta" in parsed) {
              assistantAnswer += parsed.delta;
              setLocalMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempAssistantId ? { ...msg, content: assistantAnswer } : msg
                )
              );
            }
          } catch (e) {
            console.error("❌ Stream parse error:", e, "on raw data:", raw);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId
              ? { ...msg, content: msg.content || "Generation stopped." }
              : msg
          )
        );
      } else {
        console.error("Stream error:", err);
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId
              ? {
                  ...msg,
                  content:
                    "Sorry, I encountered a communication error. Please check if the backend and Ollama are running.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsAsking(false);
      abortControllerRef.current = null;
      // Refresh from DB to get proper IDs
      queryClient.invalidateQueries({ queryKey: ["chat-messages", currentId] });
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    }
  }

  const currentSession = sessions?.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left Sidebar: Conversational History */}
      <div
        className={`flex h-full flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4 py-4 bg-gray-50 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase font-sans">
              CixioHub Chat
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Conversational AI Hub</p>
          </div>
        </div>

        {/* Start New Session action */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={async () => {
              try {
                const newSession = await createSession.mutateAsync();
                setActiveSessionId(newSession.id);
              } catch (err) {
                console.error("Failed to create session", err);
              }
            }}
            disabled={createSession.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2.5 text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* Dynamic Conversational History Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {!sessions || sessions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-xs text-gray-400">
              No conversations active.
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!isAsking) {
                      setActiveSessionId(s.id);
                    }
                  }}
                  className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-all duration-150 ${
                    isActive
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
                    <span className="truncate text-sm">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    disabled={deleteSessionMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-0.5 rounded transition-opacity duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronRight className={`h-5 w-5 transform transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentSession?.title ?? "Conversation"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {currentSession?.created_at && new Date(currentSession.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {isLoading && !isAsking && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Loading messages…</p>
            </div>
          )}

          {!isLoading && localMessages.length === 0 && !isAsking && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <p className="text-base mb-2">✨ Start a new conversation</p>
              <p className="text-sm text-gray-500">Type a message below to begin</p>
            </div>
          )}

          {/* Messages */}
          {localMessages.map((m, index) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white font-bold">AI</span>
                </div>
              )}

              <div className="flex flex-col gap-1 max-w-[80%]">
                {m.role === "assistant" ? (
                  <>
                    {/* Citations references */}
                    {m.sources && m.sources.filter(s => !s.is_meta).length > 0 && (
                      <button
                        onClick={() => setActiveDrawerSources(m.sources || null)}
                        className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 bg-purple-500/10 dark:bg-purple-500/5 border border-purple-500/20 dark:border-purple-800/30 px-2.5 py-1 rounded-full cursor-pointer hover:bg-purple-500/20 transition-all mb-2 w-fit select-none"
                      >
                        <Info className="h-3 w-3" />
                        Grounded in {m.sources.filter(s => !s.is_meta).length} document sources · Click to inspect
                      </button>
                    )}

                    {/* Thinking / Reasoning Process */}
                    {(m.thinking_enabled || !!m.thinking) && (
                      <ReasoningBlock
                        thinking={m.thinking || ""}
                        isStreaming={isAsking && !m.content && index === localMessages.length - 1}
                      />
                    )}

                    {/* Answer or typing indicator */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none min-w-[140px]">
                      {m.content ? (
                        <AIMessage content={m.content} />
                      ) : (
                        <div className="flex items-center gap-2 py-1 text-gray-500 dark:text-gray-400">
                          <span className="text-xs font-medium">Typing</span>
                          <div className="flex items-center space-x-1 h-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-purple-600 text-white rounded-xl rounded-tr-sm px-4 py-3 text-sm break-words">
                    {m.content}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white font-bold">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSend}
          onStop={stopGeneration}
          disabled={isAsking}
          activeSessionId={activeSessionId}
          documents={sessionDocuments}
        />
      </div>

      {/* Citations inspect sliding drawer */}
      {activeDrawerSources && (
        <section className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl bg-white dark:bg-[#171717] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Retrieved Citations</h3>
              </div>
              <button
                onClick={() => setActiveDrawerSources(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of matched vector chunks */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
              {/* Search Strategy Metadata Card */}
              {(() => {
                const meta = activeDrawerSources.find((s: any) => s.is_meta);
                const actualChunks = activeDrawerSources.filter((s: any) => !s.is_meta);
                return (
                  <>
                    {meta && (
                      <div className="mb-6 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/10 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-purple-100/60 dark:border-purple-900/30 pb-2">
                          <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-400 uppercase tracking-wider">
                            Search Strategy & Logic
                          </h4>
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                            Mode: {meta.retrieval_mode ? meta.retrieval_mode.toUpperCase() : "SEMANTIC"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold">HyDE Status</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.use_hyde ? (meta.hyde_succeeded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500') : 'bg-gray-300 dark:bg-gray-600'}`} />
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                {meta.use_hyde 
                                  ? (meta.hyde_succeeded ? 'Active' : 'Fail (Fallback)') 
                                  : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold">Retrieval Method</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.retrieval_mode === 'hybrid' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                {meta.retrieval_mode === 'hybrid' ? 'Hybrid (RRF)' : 'Semantic Only'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold">Reranker Status</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.use_reranker ? (meta.reranker_succeeded ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500') : 'bg-gray-300 dark:bg-gray-600'}`} />
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                {meta.use_reranker 
                                  ? (meta.reranker_succeeded ? 'Active' : 'Fail (Fallback)') 
                                  : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {meta.use_hyde && meta.hyde_succeeded && meta.hyde_document && (
                          <div className="mt-2 pt-2 border-t border-purple-100/60 dark:border-purple-900/30">
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold mb-1">Generated Hypothetical Passage (HyDE)</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-900/50 p-2.5 rounded-lg border border-purple-100/40 dark:border-purple-900/20 font-mono select-text whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                              "{meta.hyde_document}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {actualChunks.map((source: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-4 hover:border-purple-500/30 transition-all duration-200 text-left"
                      >
                        {/* Metadata */}
                        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 bg-purple-50/10 px-2 py-0.5 rounded font-mono font-medium">
                            Chunk {idx + 1} {source.score ? `· Match ${(source.score * 100).toFixed(1)}%` : ""}
                          </span>
                          {source.match_type && (
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold capitalize ${
                              source.match_type === 'hybrid'
                                ? 'text-purple-600 dark:text-purple-400 bg-purple-50/10'
                                : source.match_type === 'keyword'
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            }`}>
                              Match: {source.match_type}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate max-w-[200px]">
                            File: {source.filename || "Unknown"}{" "}
                            {source.page_number ? `· Page ${source.page_number}` : ""}
                          </span>
                        </div>

                        {/* Extract Text */}
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#212121] p-3 rounded-lg border border-gray-200 dark:border-gray-800 font-mono select-text whitespace-pre-wrap max-h-56 overflow-y-auto">
                          {source.text}
                        </p>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}