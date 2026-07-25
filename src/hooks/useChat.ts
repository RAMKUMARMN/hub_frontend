import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types";

const LOCAL_SESSIONS_KEY = "cixio_chat_sessions";
const BACKEND_AVAILABLE_KEY = "cixio_chat_backend_available";

function loadLocalSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function saveLocalSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
}

function createLocalSession(): ChatSession {
  const now = new Date();
  const timestamp = now.toISOString();
  return {
    id: `local-${now.getTime()}`,
    title: `Local chat ${now.toLocaleDateString()}`,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function loadLocalMessages(sessionId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`cixio_chat_messages:${sessionId}`);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(sessionId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`cixio_chat_messages:${sessionId}`, JSON.stringify(messages));
}

function createLocalMessage(sessionId: string, role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `local-msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    session_id: sessionId,
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

// GET /chat/sessions — real endpoint, empty array until sessions exist
export function useSessions() {
  return useQuery<ChatSession[]>({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      try {
        const res = await api.get("/chat/sessions");
        return res.data;
      } catch (err) {
        console.warn("Backend /chat/sessions failed, falling back to local sessions:", err);
        return loadLocalSessions();
      }
    },
  });
}

// POST /chat/sessions — creates a real session, fallback to local storage
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post("/chat/sessions", {});
        return res.data as ChatSession;
      } catch (err) {
        console.warn("Backend POST /chat/sessions failed, falling back to local session:", err);
        const session = createLocalSession();
        const sessions = loadLocalSessions();
        const nextSessions = [...sessions, session];
        saveLocalSessions(nextSessions);
        return session;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
}

// GET /chat/sessions/{id}/messages — message history for a session
export function useMessages(sessionId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      try {
        const res = await api.get(`/chat/sessions/${sessionId}/messages`);
        return res.data;
      } catch (err) {
        console.warn(`Backend GET /chat/sessions/${sessionId}/messages failed, falling back to local messages:`, err);
        return loadLocalMessages(sessionId);
      }
    },
    enabled: !!sessionId, // don't run until a session is actually selected
  });
}

// DELETE /chat/sessions/{id}
export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/chat/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
}