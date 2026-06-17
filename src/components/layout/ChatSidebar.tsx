"use client";

/**
 * ChatSidebar
 *
 * Left panel for the /chat layout. Shows session list, new chat button,
 * and nav links. Matches the existing blue navbar theme.
 *
 * Place at: src/components/layout/ChatSidebar.tsx
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatSession } from "@/types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  isLoading: boolean;
  activeSessionId: string | null;
  onNewChat: () => void;
  isCreating: boolean;
}

export default function ChatSidebar({
  sessions,
  isLoading,
  activeSessionId,
  onNewChat,
  isCreating,
}: ChatSidebarProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredSessions = sessions.filter((s) =>
    (s.title ?? "Untitled").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* New Chat button */}
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={onNewChat}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5
                     rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm
                     font-medium transition-colors disabled:opacity-60"
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isCreating ? "Creating…" : "New Chat"}
        </button>
      </div>

      {/* Search input */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5
                        focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-gray-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400
                       outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {search ? "Results" : "Recent"}
        </span>
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {isLoading ? (
          <SessionSkeletons />
        ) : filteredSessions.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400 text-center">
            {search ? `No chats matching "${search}"` : "No chats yet"}
          </p>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                onClick={() => router.push(`/chat/${session.id}`)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg
                            text-sm transition-colors truncate
                            ${
                              isActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
              >
                {/* Chat icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-blue-500" : "text-gray-400"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="truncate">{session.title ?? "Untitled"}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Footer nav links */}
      <div className="border-t border-gray-100 p-2 space-y-0.5">
        {[
          { label: "Documents", href: "/documents", icon: DocumentIcon },
          { label: "Todos", href: "/todos", icon: CheckIcon },
        ].map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800
                       transition-colors"
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ── Skeletons ─────────────────────────────────────────── */
function SessionSkeletons() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-9 mx-1 rounded-lg bg-gray-100 animate-pulse"
          style={{ opacity: 1 - i * 0.2 }}
        />
      ))}
    </>
  );
}

/* ── Icons ─────────────────────────────────────────────── */
function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}