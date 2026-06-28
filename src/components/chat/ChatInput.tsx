"use client";

import { useState, useRef, useEffect } from "react";
import { Database, Zap, Brain, Paperclip, Loader2, Globe, Sparkles, Shuffle, ArrowDownUp, SlidersHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

type Props = {
  onSend: (
    text: string,
    useRag: boolean,
    thinkingMode: boolean,
    webSearch: boolean,
    useHyde: boolean,
    retrievalMode: string,
    useReranker: boolean,
    ragChunkLimit: number,
    documentIds: string[] | null
  ) => void;
  disabled: boolean;
  activeSessionId?: string;
  documents: any[];
};

export default function ChatInput({ onSend, disabled, activeSessionId, documents }: Props) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [useRag, setUseRag] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [useHyde, setUseHyde] = useState(false);
  const [useHybrid, setUseHybrid] = useState(false);
  const [useReranker, setUseReranker] = useState(false);
  const [ragChunkLimit, setRagChunkLimit] = useState(4);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const docSelectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside to close RAG settings and Targeted Documents overlays
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (docSelectorRef.current && !docSelectorRef.current.contains(event.target as Node)) {
        setShowDocSelector(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSend() {
    if (!text.trim() || disabled) return;
    const retrievalMode = useHybrid ? "hybrid" : "semantic";
    const documentIdsToSend = selectedDocIds.length > 0 ? selectedDocIds : null;
    onSend(text, useRag, thinkingMode, webSearch, useHyde, retrievalMode, useReranker, ragChunkLimit, documentIdsToSend);
    setText("");
  }

  async function handleFileUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !activeSessionId) return;

    const form = new FormData();
    form.append("file", file);

    setIsUploading(true);
    setUploadStatus(`Uploading and indexing "${file.name}"...`);

    try {
      const res = await api.post(`/documents/upload?session_id=${activeSessionId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 202 || res.status === 200) {
        setUploadStatus(`📁 Document "${file.name}" successfully uploaded! Ingesting vectors in background...`);
        queryClient.invalidateQueries({ queryKey: ["all-documents"] });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`❌ Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus(""), 5000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="p-3 border-t border-cixio-light dark:border-slate-800 bg-white dark:bg-slate-900 relative">
      {uploadStatus && (
        <div className="text-[10px] text-purple-600 dark:text-purple-400 mb-1.5 px-1 font-semibold animate-pulse">
          {uploadStatus}
        </div>
      )}

      {/* Main control row */}
      <div className="flex gap-2 mb-2 select-none items-center">
        {/* RAG / LLM Mode Toggle */}
        <button
          type="button"
          onClick={() => setUseRag((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 shadow-sm transition-all cursor-pointer text-[11px] font-semibold font-sans ${
            useRag
              ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-900/40"
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
          }`}
        >
          {useRag ? (
            <Database className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-slate-500" />
          )}
          <span>{useRag ? "📚 RAG Mode" : "💬 Direct LLM"}</span>
        </button>

        {/* Deep Reasoning Toggle */}
        <button
          type="button"
          onClick={() => setThinkingMode((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 shadow-sm transition-all cursor-pointer text-[11px] font-semibold font-sans ${
            thinkingMode
              ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/40"
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
          }`}
        >
          <Brain className={`h-3.5 w-3.5 ${thinkingMode ? "text-blue-500 animate-pulse" : "text-slate-500"}`} />
          <span>{thinkingMode ? "🧠 Thinking: ON" : "⚡ Thinking: OFF"}</span>
        </button>

        {/* Web Search Toggle (always visible) */}
        <button
          type="button"
          onClick={() => setWebSearch((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 shadow-sm transition-all cursor-pointer text-[11px] font-semibold font-sans ${
            webSearch
              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40"
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
          }`}
          title="Toggle internet search integration"
        >
          <Globe className={`h-3.5 w-3.5 ${webSearch ? "text-emerald-500 animate-pulse" : "text-slate-500"}`} />
          <span>{webSearch ? "🌐 Web: ON" : "🌐 Web: OFF"}</span>
        </button>

        {/* Advanced RAG Settings Dropdown Trigger */}
        {useRag && (
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 shadow-sm transition-all cursor-pointer text-[11px] font-semibold font-sans ${
                showSettings
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title="Configure advanced RAG search options"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>RAG Options</span>
            </button>

            {showSettings && (
              <div className="absolute bottom-full left-0 mb-2 z-10 w-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl flex flex-col gap-2.5 animate-fadeIn">
                <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                  Advanced RAG Options
                </div>

                {/* HyDE Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5" title="Hypothetical Document Embeddings">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" /> HyDE Search
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseHyde((v) => !v)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                      useHyde ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        useHyde ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Hybrid Mode Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5" title="Keyword + Semantic Search">
                    <Shuffle className="h-3.5 w-3.5 text-slate-400" /> Hybrid Mode
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseHybrid((v) => !v)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                      useHybrid ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        useHybrid ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Reranker Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5" title="Cross-encode results for relevance">
                    <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" /> Reranker
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseReranker((v) => !v)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                      useReranker ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        useReranker ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Chunks Limit Selector */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-0.5">
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5" title="Number of context chunks to send to the LLM">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" /> Context Chunks
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRagChunkLimit((v) => Math.max(1, v - 1))}
                      className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold w-4 text-center">{ragChunkLimit}</span>
                    <button
                      type="button"
                      onClick={() => setRagChunkLimit((v) => Math.min(10, v + 1))}
                      className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Targeted Documents Dropdown Trigger (visible in RAG mode) */}
        {useRag && (
          <div ref={docSelectorRef} className="relative">
            <button
              type="button"
              onClick={() => setShowDocSelector((v) => !v)}
              className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 shadow-sm transition-all cursor-pointer text-[11px] font-semibold font-sans relative ${
                showDocSelector
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title="Select targeted documents to search"
            >
              <span>
                {selectedDocIds.length === 0
                  ? "🔍 All Documents"
                  : `🎯 ${selectedDocIds.length} Selected`}
              </span>
              <span className="text-[9px] text-slate-400 font-bold transition-transform">
                {showDocSelector ? "▲" : "▼"}
              </span>
            </button>

            {showDocSelector && (
              <div className="absolute bottom-full left-0 mb-2 z-10 w-56 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-2.5 shadow-xl flex flex-col gap-2 animate-fadeIn">
                <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                  Targeted Documents
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin select-none">
                  {documents && documents.length > 0 ? (
                    documents.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <label
                          key={doc.id}
                          className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedDocIds((prev) =>
                                prev.includes(doc.id) ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                              );
                            }}
                            className="w-3.5 h-3.5 accent-purple-600 rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate" title={doc.filename}>
                            {doc.filename}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 italic py-2 text-center">
                      No documents uploaded yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 items-end">
        {/* Upload Document Button (placed to the left of the chat bar) */}
        {useRag && activeSessionId && (
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isUploading || disabled}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl w-9 h-9 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              title="Attach Document"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : (
                <Paperclip className="h-4 w-4 text-slate-500 hover:rotate-12 transition-transform" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            />
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={disabled}
          placeholder="Ask your smart hub anything..."
          rows={1}
          className="flex-1 border border-cixio-light dark:border-slate-700 rounded-xl px-3 py-2 text-sm resize-none bg-cixio-bg/20 dark:bg-slate-950 focus:border-cixio-blue focus:ring-1 focus:ring-cixio-blue text-cixio-dark dark:text-slate-100 outline-none transition-all"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-4 py-2 bg-cixio-blue hover:bg-cixio-hover disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-medium rounded-xl transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
}