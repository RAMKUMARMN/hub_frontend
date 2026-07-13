"use client";
// taskStore.ts
// A simple in-memory task store with localStorage persistence.
// This replaces a real API for now — swap out the functions below
// with fetch() calls when your FastAPI backend is ready.

import { Task, TaskFormData } from "./types";

const SEED_TASKS: Task[] = [
  {
    id: "1",
    title: "Review Q3 architecture document",
    description: "Read through the SmartHub 2.0 architecture PDF and leave comments.",
    priority: "high",
    status: "todo",
    dueDate: "2026-06-15",
    tags: ["docs", "review"],
    subtasks: [
      { id: "1a", title: "Read section 1 — Auth", done: true },
      { id: "1b", title: "Read section 2 — AI", done: false },
      { id: "1c", title: "Leave inline comments", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Build dashboard widgets",
    description: "Implement all 9 dashboard components in Next.js.",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-06-14",
    tags: ["frontend", "next.js"],
    subtasks: [
      { id: "2a", title: "StatsBar", done: true },
      { id: "2b", title: "TasksWidget", done: true },
      { id: "2c", title: "FocusTimer", done: true },
      { id: "2d", title: "AI Chat widget", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Set up Tailwind CSS config",
    description: "Configure tailwind.config.ts with custom colours and fonts.",
    priority: "medium",
    status: "done",
    dueDate: "2026-06-10",
    tags: ["setup"],
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Write API integration tests",
    description: "Cover /api/tasks, /api/notes, and /api/ai/chat endpoints.",
    priority: "low",
    status: "todo",
    dueDate: "2026-06-20",
    tags: ["testing", "backend"],
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "smarthub_tasks";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return SEED_TASKS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : SEED_TASKS;
  } catch {
    return SEED_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(tasks: Task[], data: TaskFormData): Task[] {
  const newTask: Task = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  return [newTask, ...tasks];
}

export function updateTask(tasks: Task[], id: string, data: Partial<Task>): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}

export function toggleSubtask(tasks: Task[], taskId: string, subtaskId: string): Task[] {
  return tasks.map((t) => {
    if (t.id !== taskId) return t;
    return {
      ...t,
      subtasks: t.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, done: !s.done } : s
      ),
    };
  });
}
