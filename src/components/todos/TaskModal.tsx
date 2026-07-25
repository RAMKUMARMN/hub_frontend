"use client";
// TaskModal.tsx
// A modal dialog for creating a new task or editing an existing one.
// Opens as an overlay on top of the page.

import { useState, useEffect } from "react";
import { Task, TaskFormData, Subtask, Priority, Status } from "./types";

type Props = {
  task: Task | null;
  onSave: (data: TaskFormData) => void;
  onClose: () => void;
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");
  const [dueDate, setDueDate] = useState(todayString());
  const [tags, setTags] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setTags(task.tags.join(", "));
      setSubtasks(task.subtasks);
    }
  }, [task]);

  function addSubtask() {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newSubtask.trim(), done: false },
    ]);
    setNewSubtask("");
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSave() {
    if (!title.trim()) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description,
      priority,
      status,
      dueDate,
      tags: parsedTags,
      subtasks,
    });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tags <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="frontend, review, urgent"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Subtasks
            </label>

            {subtasks.length > 0 && (
              <ul className="space-y-1.5 mb-2">
                {subtasks.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="flex-1 bg-gray-50 rounded px-2 py-1 text-xs">
                      {s.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(s.id)}
                      className="text-gray-300 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                placeholder="Add a subtask…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cixio-blue"
              />
              <button
                onClick={addSubtask}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 bg-cixio-blue text-white text-sm py-2 rounded-lg hover:bg-cixio-hover transition-colors disabled:opacity-40"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}
