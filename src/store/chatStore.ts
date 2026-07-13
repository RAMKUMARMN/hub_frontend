import { create } from "zustand";
import { ChatSession, ChatMessage } from "@/types";

type ChatStore = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSession: (id: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendToLastMessage: (text: string) => void;
  addMessage: (msg: ChatMessage) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  // Used while streaming — appends text to whatever the last (AI) message is
  appendToLastMessage: (text) =>
    set((state) => {
      const updated = [...state.messages];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: last.content + text };
      }
      return { messages: updated };
    }),
}));
