"use client";
// TaskCard.tsx
// Displays a single task as a card.
// Props: the task data + callbacks for edit/delete/toggle subtask.

import { Task } from "./types";

// ── Colour maps ───────────────────────────────────────────────
const priorityColors = {
  high: "bg-red-100 text-red-600 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-600",
  done: "bg-green-100 text-green-600",
};

const statusLabels = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
};

function isOverdue(dueDate: string, status: Task["status"]) {
  if (status === "done") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleSubtask,
  onStatusChange,
}: Props) {
  const overdue = isOverdue(task.dueDate, task.status);
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const totalSubs = task.subtasks.length;

  return (
    <div
      className={`bg-white dark:bg-gray-900 dark:border-gray-700 rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-opacity ${
        task.status === "done" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task["status"])}
          className={`text-xs px-2 py-0.5 rounded-full border-0 font-medium cursor-pointer ${
            statusColors[task.status]
          }`}
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={() => onEdit(task)}
          className="text-xs text-gray-400 hover:text-cixio-blue transition-colors px-1"
          title="Edit task"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      <h3
        className={`text-sm font-semibold text-gray-800 leading-snug ${
          task.status === "done" ? "line-through" : ""
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {totalSubs > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cixio-blue rounded-full transition-all"
                style={{ width: `${(doneSubs / totalSubs) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {doneSubs}/{totalSubs}
            </span>
          </div>

          {task.subtasks.map((sub) => (
            <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={sub.done}
                onChange={() => onToggleSubtask(task.id, sub.id)}
                className="w-3.5 h-3.5 accent-cixio-blue"
              />
              <span
                className={`text-xs ${
                  sub.done ? "line-through text-gray-300" : "text-gray-600 group-hover:text-gray-800"
                }`}
              >
                {sub.title}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-auto pt-1 border-t border-gray-50">
        <span
          className={`text-xs flex items-center gap-1 ${
            overdue ? "text-red-500 font-medium" : "text-gray-400"
          }`}
        >
          📅 {overdue ? "Overdue · " : ""}
          {new Date(task.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>

        {task.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-blue-50 text-cixio-blue px-1.5 py-0.5 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
