"use client";

import { createContext, useContext, useMemo } from "react";
import { Task, TaskFormData } from "@/components/todos/types";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type TasksContextType = {
  tasks: Task[];
  createTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  isLoading: boolean;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

function mapTodoToTask(todo: any): Task {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description || "",
    priority: todo.priority,
    status: todo.completed ? "done" : "todo",
    dueDate: todo.due_date ? todo.due_date.split("T")[0] : "",
    tags: [],
    subtasks: todo.subtasks || [],
    createdAt: todo.created_at || new Date().toISOString()
  };
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch todos from the backend, including their subtasks
  const { data: tasksData = [], isLoading } = useQuery<Task[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get<any[]>("/todos/");
      const todos = res.data;

      // Fetch subtasks in parallel for all todos
      const todosWithSubtasks = await Promise.all(
        todos.map(async (todo) => {
          try {
            const subRes = await api.get(`/todos/${todo.id}/subtasks`);
            const subtasks = subRes.data.map((s: any) => ({
              id: s.id,
              title: s.title,
              done: s.completed,
            }));
            return { ...todo, subtasks };
          } catch {
            return { ...todo, subtasks: [] };
          }
        })
      );

      return todosWithSubtasks.map(mapTodoToTask);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const res = await api.post("/todos/", {
        title: data.title,
        description: data.description,
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        priority: data.priority,
      });
      const newTodo = res.data;

      // If there are subtasks, save them to the backend
      if (data.subtasks && data.subtasks.length > 0) {
        await Promise.all(
          data.subtasks.map((sub) =>
            api.post(`/todos/${newTodo.id}/subtasks`, {
              title: sub.title,
            })
          )
        );
      }
      return newTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      // 1. Update basic task fields
      const hasOtherFields =
        data.title !== undefined ||
        data.description !== undefined ||
        data.priority !== undefined ||
        data.dueDate !== undefined;

      if (hasOtherFields) {
        const payload: any = {};
        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined) payload.description = data.description;
        if (data.priority !== undefined) payload.priority = data.priority;
        if (data.dueDate !== undefined) {
          payload.due_date = data.dueDate ? new Date(data.dueDate).toISOString() : null;
        }
        await api.put(`/todos/${id}`, payload);
      }

      // 2. Update status completion if requested
      if (data.status !== undefined) {
        const completed = data.status === "done";
        await api.put(`/todos/${id}/complete`, { completed });
      }

      // 3. Update subtasks if updated list is provided
      if (data.subtasks !== undefined) {
        const dbSubRes = await api.get(`/todos/${id}/subtasks`);
        const dbSubtasks = dbSubRes.data;

        const incomingSubtasks = data.subtasks;

        const toDelete = dbSubtasks.filter(
          (dbSub: any) => !incomingSubtasks.some((inc) => inc.id === dbSub.id)
        );

        const toCreate = incomingSubtasks.filter(
          (inc) => !dbSubtasks.some((dbSub: any) => dbSub.id === inc.id)
        );

        const toUpdate = incomingSubtasks.filter((inc) => {
          const matchingDb = dbSubtasks.find((dbSub: any) => dbSub.id === inc.id);
          return matchingDb && (matchingDb.title !== inc.title || matchingDb.completed !== inc.done);
        });

        await Promise.all([
          ...toDelete.map((s: any) => api.delete(`/todos/${id}/subtasks/${s.id}`)),
          ...toCreate.map((s) => api.post(`/todos/${id}/subtasks`, { title: s.title })),
          ...toUpdate.map((s) =>
            api.put(`/todos/${id}/subtasks/${s.id}`, {
              title: s.title,
              completed: s.done,
            })
          ),
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const value = useMemo(
    () => ({
      tasks: tasksData,
      createTask: (data: TaskFormData) => createMutation.mutate(data),
      updateTask: (id: string, data: Partial<Task>) => updateMutation.mutate({ id, data }),
      deleteTask: (id: string) => deleteMutation.mutate(id),
      toggleSubtask: async (taskId: string, subtaskId: string) => {
        const task = tasksData.find((t) => t.id === taskId);
        const subtask = task?.subtasks.find((s) => s.id === subtaskId);
        if (subtask) {
          await api.put(`/todos/${taskId}/subtasks/${subtaskId}`, {
            completed: !subtask.done,
          });
          queryClient.invalidateQueries({ queryKey: ["todos"] });
        }
      },
      isLoading,
    }),
    [tasksData, isLoading]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return context;
}
