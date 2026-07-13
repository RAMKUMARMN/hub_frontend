"use client";

import { useRouter } from "next/navigation";
import { useCreateSession } from "@/hooks/useChat";

export default function NewChatButton() {
  const router = useRouter();
  const createSession = useCreateSession();

  async function handleClick() {
    try {
      await createSession.mutateAsync();
      router.push("/chat/default");
    } catch (err) {
      alert("Couldn't create a session — check that the backend is running on port 8000");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={createSession.isPending}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
    >
      {createSession.isPending ? "Creating…" : "+ New chat"}
    </button>
  );
}