"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Todo } from "@/types";

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
//to fetch todo
  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: () => api.get<Todo[]>("/todos").then((r) => r.data),
  });
//create todos
  const createMutation = useMutation({
    mutationFn: (title: string) => api.post<Todo>("/todos", { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTitle("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put(`/todos/${id}/complete`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Todo List</h1>

      {/* Create form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTitle.trim()) createMutation.mutate(newTitle.trim());
        }}
        className="flex gap-2 mb-6"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* List */}
      {todos.length === 0 ? (
        <p className="text-gray-400 text-center">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleMutation.mutate({ id: todo.id, completed: !todo.completed })}
                className="w-4 h-4"
              />
              <span className={`flex-1 ${todo.completed ? "line-through text-gray-400" : ""}`}>
                {todo.title}
              </span>
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
