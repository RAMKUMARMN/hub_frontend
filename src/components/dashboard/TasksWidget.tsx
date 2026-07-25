"use client";

import { useMemo } from "react";
import { useTasks } from "@/store/tasksContext";
import { Task } from "@/components/todos/types";

// Use the shared task type from the todos module.

const priorityColors = {
  high: "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-500",
};

function formatDueDate(date?: string) {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TasksWidget() {
  const { tasks, updateTask } = useTasks();
  const preview = tasks.filter((t) => t.status !== "done").slice(0, 5);
  const remaining = useMemo(() => preview.length, [preview]);

  function toggleDone(id: string, currentStatus: Task["status"]) {
    updateTask(id, { status: currentStatus === "done" ? "todo" : "done" });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Tasks</h2>
        <span className="text-xs text-gray-400">{`${remaining} remaining`}</span>
      </div>

      {preview.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No open tasks — nice work.
        </div>
      ) : (
        <ul className="space-y-3">
          {preview.map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => toggleDone(task.id, task.status)}
                className="w-4 h-4 accent-purple-600"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatDueDate(task.dueDate)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
      <a href="/todos" className="block mt-4 text-xs text-purple-600 hover:underline text-center">
        View all tasks →
      </a>
    </div>
  );
}
