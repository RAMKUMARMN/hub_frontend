"use client";

import { useState } from "react";
import TaskCard from "@/components/todos/TaskCard";
import TaskModal from "@/components/todos/TaskModal";
import TaskFilters, { Filters, applyFilters } from "@/components/todos/taskfilters";
import { useTasks } from "@/store/tasksContext";
import { TaskFormData, Task } from "@/components/todos/types";

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "all",
  priority: "all",
};

export default function TodosPage() {
  const { tasks, createTask, updateTask, deleteTask, toggleSubtask } = useTasks();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const visibleTasks = applyFilters(tasks, filters);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const overdue = tasks.filter(
    (t) =>
      t.status !== "done" &&
      new Date(t.dueDate) < new Date(new Date().toDateString())
  ).length;

  function openNewModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  function handleSave(data: TaskFormData) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      createTask(data);
    }
    closeModal();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    deleteTask(id);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleStatusChange(id: string, status: Task["status"]) {
    updateTask(id, { status });
  }

  function handleToggleSubtask(taskId: string, subtaskId: string) {
    toggleSubtask(taskId, subtaskId);
  }

  const grouped = {
    todo: visibleTasks.filter((t) => t.status === "todo"),
    in_progress: visibleTasks.filter((t) => t.status === "in_progress"),
    done: visibleTasks.filter((t) => t.status === "done"),
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {done}/{total} done · {inProgress} in progress
              {overdue > 0 && (
                <span className="text-red-400 ml-2">· {overdue} overdue</span>
              )}
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="bg-cixio-blue text-white text-sm px-4 py-2 rounded-lg hover:bg-cixio-hover transition-colors flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span>
            New task
          </button>
        </div>

        {total > 0 && (
          <div className="mb-5">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cixio-blue rounded-full transition-all duration-500"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round((done / total) * 100)}% complete
            </p>
          </div>
        )}

        <div className="mb-5">
          <TaskFilters
            filters={filters}
            onChange={setFilters}
            taskCount={visibleTasks.length}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-600">To do</h2>
              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {grouped.todo.length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped.todo.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleSubtask={handleToggleSubtask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {grouped.todo.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                  No tasks here
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-blue-600">In progress</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {grouped.in_progress.length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped.in_progress.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleSubtask={handleToggleSubtask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {grouped.in_progress.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                  No tasks here
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-green-600">Done</h2>
              <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                {grouped.done.length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped.done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleSubtask={handleToggleSubtask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {grouped.done.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        </div>

        {total === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 font-medium">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Create your first task to get started
            </p>
            <button
              onClick={openNewModal}
              className="bg-cixio-blue text-white text-sm px-4 py-2 rounded-lg hover:bg-cixio-hover transition-colors"
            >
              + New task
            </button>
          </div>
        )}

        {modalOpen && (
          <TaskModal
            task={editingTask}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </div>
    </main>
  );
}
