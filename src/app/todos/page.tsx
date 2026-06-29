"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { Todo, TodoPriority } from "@/types";

type FilterType = "all" | "active" | "completed" | "overdue" | "today";
type SortType = "deadline" | "newest" | "oldest" | "alphabetical";

type TodoFormData = {
  title: string;
  description: string;
  due_date: string;
  priority: TodoPriority;
  reminder_at: string;
};

const emptyForm: TodoFormData = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  reminder_at: "",
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [createForm, setCreateForm] = useState<TodoFormData>(emptyForm);
  const [editForm, setEditForm] = useState<TodoFormData>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("deadline");
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    void loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Todo[]>("/todos/");
      setTodos(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load your todos."));
    } finally {
      setLoading(false);
    }
  }

  async function createTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = createForm.title.trim();

    if (!cleanTitle) {
      setError("Please enter a task title.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await api.post<Todo>("/todos/", {
        title: cleanTitle,
        description: createForm.description.trim() || null,
        due_date: createForm.due_date
          ? new Date(createForm.due_date).toISOString()
          : null,
        priority: createForm.priority,
        reminder_at: createForm.reminder_at
          ? new Date(createForm.reminder_at).toISOString()
          : null,
      });

      setTodos((currentTodos) => [response.data, ...currentTodos]);
      setCreateForm(emptyForm);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not create the task."));
    } finally {
      setCreating(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setUpdatingTodoId(todo.id);
    setError(null);

    try {
      const response = await api.patch<Todo>(`/todos/${todo.id}/complete`, {
        completed: !todo.completed,
      });

      replaceTodo(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the task."));
    } finally {
      setUpdatingTodoId(null);
    }
  }

  async function deleteTodo(todo: Todo) {
    const confirmed = window.confirm(
      `Delete "${todo.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setUpdatingTodoId(todo.id);
    setError(null);

    try {
      await api.delete(`/todos/${todo.id}`);

      setTodos((currentTodos) =>
        currentTodos.filter((currentTodo) => currentTodo.id !== todo.id)
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not delete the task."));
    } finally {
      setUpdatingTodoId(null);
    }
  }

  function startEditing(todo: Todo) {
    setEditingTodoId(todo.id);
    setError(null);

    setEditForm({
      title: todo.title,
      description: todo.description || "",
      due_date: todo.due_date ? toDateTimeLocal(todo.due_date) : "",
      priority: todo.priority || "medium",
      reminder_at: todo.reminder_at
        ? toDateTimeLocal(todo.reminder_at)
        : "",
    });
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditForm(emptyForm);
  }

  async function saveTodo(todoId: string) {
    const cleanTitle = editForm.title.trim();

    if (!cleanTitle) {
      setError("A task title cannot be empty.");
      return;
    }

    setUpdatingTodoId(todoId);
    setError(null);

    try {
      const response = await api.patch<Todo>(`/todos/${todoId}`, {
        title: cleanTitle,
        description: editForm.description.trim() || null,
        due_date: editForm.due_date
          ? new Date(editForm.due_date).toISOString()
          : null,
        priority: editForm.priority,
        reminder_at: editForm.reminder_at
          ? new Date(editForm.reminder_at).toISOString()
          : null,
      });

      replaceTodo(response.data);
      cancelEditing();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not save the task."));
    } finally {
      setUpdatingTodoId(null);
    }
  }

  function replaceTodo(updatedTodo: Todo) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
    );
  }

  const summary = useMemo(() => {
    const now = new Date();

    return {
      total: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
      overdue: todos.filter(
        (todo) =>
          !todo.completed &&
          todo.due_date &&
          new Date(todo.due_date) < now
      ).length,
      today: todos.filter(
        (todo) =>
          !todo.completed &&
          todo.due_date &&
          isToday(new Date(todo.due_date))
      ).length,
    };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const now = new Date();

    const filtered = todos.filter((todo) => {
      if (filter === "all") return true;
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;

      if (filter === "overdue") {
        return (
          !todo.completed &&
          Boolean(todo.due_date) &&
          new Date(todo.due_date as string) < now
        );
      }

      if (filter === "today") {
        return (
          !todo.completed &&
          Boolean(todo.due_date) &&
          isToday(new Date(todo.due_date as string))
        );
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      if (sort === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sort === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      const aDeadline = a.due_date
        ? new Date(a.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      const bDeadline = b.due_date
        ? new Date(b.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      return aDeadline - bDeadline;
    });
  }, [todos, filter, sort]);

  const calendarDays = useMemo(() => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
}, []);

const selectedDayTodos = useMemo(() => {
  return visibleTodos.filter((todo) => {
    if (!todo.due_date) return false;

    const due = new Date(todo.due_date);

    return (
      due.getFullYear() === selectedDate.getFullYear() &&
      due.getMonth() === selectedDate.getMonth() &&
      due.getDate() === selectedDate.getDate()
    );
  });
}, [visibleTodos, selectedDate]);

const completedToday = selectedDayTodos.filter(
  (todo) => todo.completed
).length;

const progress =
  selectedDayTodos.length === 0
    ? 0
    : Math.round(
        (completedToday / selectedDayTodos.length) * 100
      );

  return (
    <main className="min-h-screen bg-[#f4f6fc] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize your work, manage deadlines, and track progress.
          </p>
        </header>

  <div className="mb-8 overflow-x-auto">
  <div className="flex gap-3 pb-2">
    {calendarDays.map((day) => {
      const isSelected =
        day.toDateString() === selectedDate.toDateString();

      return (
        <button
          key={day.toISOString()}
          onClick={() => setSelectedDate(day)}
          className={`min-w-[70px] rounded-2xl border p-3 transition ${
            isSelected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <p className="text-xs font-medium">
            {day.toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {day.getDate()}
          </p>
        </button>
      );
    })}
  </div>
</div>
<div className="mb-8 rounded-3xl bg-blue-600 p-6 text-white shadow-lg">
  <p className="text-sm font-medium text-blue-100">
    Daily Progress
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    Keep pushing forward!
  </h2>

  <p className="mt-1 text-blue-100">
    {completedToday} of {selectedDayTodos.length} tasks completed
  </p>

  <div className="mt-5 h-3 w-full rounded-full bg-blue-400">
    <div
      className="h-3 rounded-full bg-white transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>

  <p className="mt-3 text-right text-lg font-semibold">
    {progress}%
  </p>
</div>

        <form
          onSubmit={createTodo}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Add a new task
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={createForm.title}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Task title..."
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

        <input
          type={createForm.due_date ? "datetime-local" : "text"}
          placeholder="Due Date"
          value={createForm.due_date}
          onFocus={(e) => (e.target.type = "datetime-local")}
          onBlur={(e) => {
            if (!createForm.due_date) e.target.type = "text";
          }}
          onChange={(event) =>
            setCreateForm((current) => ({
              ...current,
              due_date: event.target.value,
            }))
          }
          className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
          </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            value={createForm.priority}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                priority: event.target.value as TodoPriority,
              }))
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>

          <input
            type={createForm.reminder_at ? "datetime-local" : "text"}
            placeholder="Set Reminder"
            value={createForm.reminder_at}
            onFocus={(e) => (e.target.type = "datetime-local")}
            onBlur={(e) => {
              if (!createForm.reminder_at) e.target.type = "text";
            }}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                reminder_at: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <textarea
          value={createForm.description}
          onChange={(event) =>
            setCreateForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Description (optional)..."
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Adding..." : "Add task"}
          </button>
        </div>
        </form>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label={`All (${summary.total})`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label={`Active (${summary.active})`}
              active={filter === "active"}
              onClick={() => setFilter("active")}
            />
            <FilterButton
              label={`Completed (${summary.completed})`}
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            />
            <FilterButton
              label={`Overdue (${summary.overdue})`}
              active={filter === "overdue"}
              onClick={() => setFilter("overdue")}
            />
            <FilterButton
              label={`Due today (${summary.today})`}
              active={filter === "today"}
              onClick={() => setFilter("today")}
            />
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortType)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="deadline">Sort: Nearest deadline</option>
            <option value="newest">Sort: Recently created</option>
            <option value="oldest">Sort: Oldest first</option>
            <option value="alphabetical">Sort: Alphabetical</option>
          </select>
        </section>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading your tasks...
          </div>
        ) : selectedDayTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-700">
              No tasks scheduled for this day
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Create a task or choose a different filter.
            </p>
          </div>
        ) : (
          <section className="space-y-3">
            {selectedDayTodos.map((todo) => {
              const isEditing = editingTodoId === todo.id;
              const isSaving = updatingTodoId === todo.id;
              const status = getTodoStatus(todo);
              const priorityStyle = getPriorityStyle(todo.priority);

              return (
                <article
                  key={todo.id}
                  className={`rounded-2xl border p-5 shadow-sm transition ${
                    todo.completed
                      ? "border-emerald-100 bg-emerald-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Description..."
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          type="datetime-local"
                          value={editForm.due_date}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              due_date: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <select
                          value={editForm.priority}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              priority: event.target.value as TodoPriority,
                            }))
                          }
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="low">Low priority</option>
                          <option value="medium">Medium priority</option>
                          <option value="high">High priority</option>
                        </select>

                        <input
                          type="datetime-local"
                          value={editForm.reminder_at}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              reminder_at: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => void saveTodo(todo.id)}
                          disabled={isSaving}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        disabled={isSaving}
                        onChange={() => void toggleTodo(todo)}
                        className="mt-1 h-5 w-5 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                        aria-label={
                          todo.completed
                            ? `Reopen ${todo.title}`
                            : `Complete ${todo.title}`
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`break-words text-lg font-semibold ${
                              todo.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {todo.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyle}`}
                          >
                            {todo.priority} priority
                          </span>
                        </div>

                        {todo.description && (
                          <p
                            className={`mt-2 whitespace-pre-wrap text-sm ${
                              todo.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-500"
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
                          <p
                            className={
                              status.label === "Overdue"
                                ? "text-red-600"
                                : status.label === "Due today"
                                  ? "text-amber-700"
                                  : "text-slate-500"
                            }
                          >
                            {todo.due_date
                              ? `Deadline: ${formatDueDate(todo.due_date)}`
                              : "No deadline set"}
                          </p>

                          {todo.reminder_at && (
                            <p className="text-violet-600">
                              Reminder: {formatDueDate(todo.reminder_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => startEditing(todo)}
                          disabled={isSaving}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteTodo(todo)}
                          disabled={isSaving}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { detail?: string } } }).response?.data
      ?.detail ?? fallback
  );
}

function formatDueDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function isToday(date: Date) {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getTodoStatus(todo: Todo) {
  if (todo.completed) {
    return {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (!todo.due_date) {
    return {
      label: "No deadline",
      className: "bg-slate-100 text-slate-600",
    };
  }

  const dueDate = new Date(todo.due_date);
  const now = new Date();

  if (dueDate < now) {
    return {
      label: "Overdue",
      className: "bg-red-100 text-red-700",
    };
  }

  if (isToday(dueDate)) {
    return {
      label: "Due today",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Upcoming",
    className: "bg-blue-100 text-blue-700",
  };
}

function getPriorityStyle(priority: TodoPriority) {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "low") return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-700";
}