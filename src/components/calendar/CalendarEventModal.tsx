"use client";

import { useState, useEffect } from "react";
import { Task } from "@/components/todos/types";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  reminder_time?: string;
  todo_id?: string;
}

export interface CalendarEventFormData {
  title: string;
  description: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  is_recurring: boolean;
  recurrence_rule?: string;
  reminder_time?: string; // ISO 8601 or undefined
  todo_id?: string;       // UUID or undefined
}

type Props = {
  event: CalendarEvent | null;
  tasks: Task[];
  onSave: (data: CalendarEventFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
};

function toDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CalendarEventModal({ event, tasks, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [todoId, setTodoId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    const expiry = localStorage.getItem("google_access_token_expiry");
    if (token && expiry && Date.now() < parseInt(expiry)) {
      setGoogleConnected(true);
    } else {
      setGoogleConnected(false);
    }
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(toDatetimeLocal(event.start_time));
      setEndTime(toDatetimeLocal(event.end_time));
      setIsRecurring(event.is_recurring);
      setRecurrenceRule(event.recurrence_rule || "");
      setReminderTime(toDatetimeLocal(event.reminder_time));
      setTodoId(event.todo_id || "");
    } else {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const baseDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      setStartTime(`${baseDate}T09:00`);
      setEndTime(`${baseDate}T10:00`);
      setTitle("");
      setDescription("");
      setIsRecurring(false);
      setRecurrenceRule("");
      setReminderTime("");
      setTodoId("");
    }
  }, [event]);

  function handleSave() {
    if (!title.trim() || !startTime || !endTime) return;

    // Convert local datetime input values to ISO 8601 strings
    const startISO = new Date(startTime).toISOString();
    const endISO = new Date(endTime).toISOString();
    const reminderISO = reminderTime ? new Date(reminderTime).toISOString() : undefined;

    onSave({
      title: title.trim(),
      description: description.trim(),
      start_time: startISO,
      end_time: endISO,
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule.trim() : undefined,
      reminder_time: reminderISO,
      todo_id: todoId || undefined,
    });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {event ? "Edit Calendar Event" : "New Calendar Event"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100 resize-none"
              rows={3}
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Start Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                End Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Reminder Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Link to Todo Task (Optional)
            </label>
            <select
              value={todoId}
              onChange={(e) => setTodoId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
            >
              <option value="">No linked task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} (Priority: {task.priority})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-cixio-blue focus:ring-cixio-blue w-4 h-4 cursor-pointer"
              />
              Is Recurring Event
            </label>
          </div>

          {isRecurring && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                Recurrence Rule
              </label>
              <input
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100"
                placeholder="e.g. FREQ=WEEKLY;BYDAY=MO"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <div className="flex-1 mr-4">
            {event && onDelete ? (
              <button
                onClick={onDelete}
                className="inline-flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 text-sm font-semibold transition"
              >
                Delete Event
              </button>
            ) : (
              !googleConnected && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-tight">
                  ⚠️ Google Calendar disconnected or expired. This event will only be saved locally.
                </p>
              )
            )}
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !startTime || !endTime}
              className="inline-flex items-center justify-center rounded-lg bg-cixio-blue px-4 py-2 text-sm font-semibold text-white hover:bg-cixio-hover transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
