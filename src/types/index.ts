// Shared TypeScript types used across the frontend

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role?: string;
  is_admin: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  thinking_enabled?: boolean;
  sources?: { filename: string; text: string }[];
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  processed: boolean;
  created_at: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface NotificationJob {
  job_id: string;
  channel: string;
  total: number;
  sent: number;
  failed: number;
  retrying: number;
  completed: boolean;
}

// Chat API types
export type SendMessageRequest = {
  content: string;
  use_rag: boolean;
  thinking_mode: boolean;
};

// The three possible shapes of an SSE data event from the spec
export type SourceEvent = { sources: { filename: string; text: string }[] };
export type ThinkingEvent = { thinking: string };
export type DeltaEvent = { delta: string };
export type StreamEvent = SourceEvent | ThinkingEvent | DeltaEvent;
