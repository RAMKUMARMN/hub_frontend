"use client";

/**
 * Chat page — /chat
 *
 * Redirects to the most recent session, or shows a "Start a new chat" prompt.
 *
 * TODO:
 *  1. Fetch list of sessions via GET /api/v1/chat/sessions
 *  2. If sessions exist, redirect to /chat/[most-recent-session-id]
 *  3. Otherwise render a centered "Start chatting" button that POSTs /chat/sessions
 */


/**
 * /chat — Chat index page
 *
 * Renders the sidebar + empty state shell.
 * Auto-redirects to the most recent session if one exists.
 *
 * Place at: src/app/chat/page.tsx
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChatSession } from "@/types";
import ChatSidebar from "@/components/layout/ChatSidebar";

export default function ChatIndexPage() {
  const router = useRouter();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () =>
      api.get<ChatSession[]>("/chat/sessions").then((r) => r.data),
  });

  const createSession = useMutation({
    mutationFn: () =>
      api.post<ChatSession>("/chat/sessions", { title: "New Chat" }),
    onSuccess: (res) => router.push(`/chat/${res.data.id}`),
  });

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      router.replace(`/chat/${sessions[0].id}`);
    }
  }, [sessions, router]);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#f0f2f8]">
      {/* Left sidebar — session list */}
      <ChatSidebar
        sessions={sessions ?? []}
        isLoading={isLoading}
        activeSessionId={null}
        onNewChat={() => createSession.mutate()}
        isCreating={createSession.isPending}
      />

      {/* Main area — empty state */}
      <main className="flex flex-1 items-center justify-center bg-[#f0f2f8]">
        <div className="text-center max-w-sm px-6">
          {/* Chat bubble icon */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Start a conversation
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Ask anything — sessions are saved in the sidebar.
          </p>

          <button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                       bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                       transition-colors disabled:opacity-60"
          >
            {createSession.isPending ? (
              "Creating…"
            ) : (
              <>
                New Chat
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}