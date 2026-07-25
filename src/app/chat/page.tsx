"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessions, useCreateSession } from "@/hooks/useChat";

export default function ChatPage() {
  const router = useRouter();
  const { data: sessions, isLoading } = useSessions();
  const { mutate: createSession, isPending } = useCreateSession();

  useEffect(() => {
    if (!isLoading && !isPending) {
      // If there are existing sessions, redirect to the first one
      if (sessions && sessions.length > 0) {
        router.push("/chat/default");
      } else {
        // Otherwise create a new session
        createSession(undefined, {
          onSuccess: () => {
            router.push("/chat/default");
          },
        });
      }
    }
  }, [sessions, isLoading, isPending, createSession, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cixio-blue mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading chat...</p>
      </div>
    </div>
  );
}
