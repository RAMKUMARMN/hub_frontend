// types.ts
// All TypeScript types for the Tasks module.
// Import these in any component that works with tasks.

export type Priority = "high" | "medium" | "low";
export type Status = "todo" | "in_progress" | "done";

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
};

export type TaskFormData = Omit<Task, "id" | "createdAt">;
