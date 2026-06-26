
// Shared TypeScript types used across the frontend

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
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

// ---------------------------
// Todo types
// ---------------------------

export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  priority: TodoPriority;
  reminder_at: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TodoPriority;
  reminder_at?: string | null;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TodoPriority;
  reminder_at?: string | null;
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

