"use client";

import Link from "next/link";

interface ChatSession {
  id: string;
  title: string;
}

interface Props {
  sessions: ChatSession[];
  currentSession: string;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

export default function ChatSidebar({
  sessions,
  currentSession,
  onNewChat,
  onDeleteChat,
}: Props) {
  return (
    <div className="w-64 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
  <div
    key={session.id}
    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 ${
      currentSession === session.id
        ? "bg-blue-100"
        : ""
    }`}
  >
    <Link
      href={`/chat/${session.id}`}
      className="flex-1 truncate"
    >
      {session.title}
    </Link>

    <button
      onClick={() => onDeleteChat(session.id)}
      className="ml-2 text-red-500 hover:text-red-700"
    >
      🗑️
    </button>
  </div>
))}
      </div>
    </div>
  );
}