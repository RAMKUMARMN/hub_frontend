"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "@/store/tasksContext";
import { groupTodosByDate, formatDateKey } from "@/lib/calendarUtils";
import { PRIORITY_COLORS } from "@/lib/priorityColors";
import { Task } from "@/components/todos/types";
import api from "@/lib/api";
import CalendarEventModal, {
  CalendarEvent,
  CalendarEventFormData,
} from "@/components/calendar/CalendarEventModal";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";

export default function CalendarWidget() {
  const { tasks } = useTasks();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group tasks by due date
  const todosByDate = groupTodosByDate(tasks);

  // Fetch dedicated calendar events from the backend via React Query
  const { data: calendarEvents = [], isLoading: eventsLoading } = useQuery<
    CalendarEvent[]
  >({
    queryKey: ["calendarEvents"],
    queryFn: async () => {
      const res = await api.get<CalendarEvent[]>("/calendar/events");
      return res.data;
    },
  });

  // Group database calendar events by date key
  const eventsByDate = (() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const event of calendarEvents) {
      if (!event.start_time) continue;
      const dateKey = event.start_time.includes("T")
        ? event.start_time.split("T")[0]
        : event.start_time;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    }
    return grouped;
  })();

  // Retrieve active token from localStorage if valid
  function getActiveGoogleToken(): string | null {
    const token = localStorage.getItem("google_access_token");
    const expiry = localStorage.getItem("google_access_token_expiry");
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    return null;
  }

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (newEvent: CalendarEventFormData) => {
      const token = getActiveGoogleToken();
      const headers = token ? { "X-Google-Token": token } : {};
      const res = await api.post("/calendar/events", newEvent, { headers });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setIsModalOpen(false);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CalendarEventFormData;
    }) => {
      const token = getActiveGoogleToken();
      const headers = token ? { "X-Google-Token": token } : {};
      const res = await api.put(`/calendar/events/${id}`, data, { headers });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getActiveGoogleToken();
      const headers = token ? { "X-Google-Token": token } : {};
      await api.delete(`/calendar/events/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
  });

  function handleSaveEvent(data: CalendarEventFormData) {
    if (selectedEvent) {
      updateEventMutation.mutate({ id: selectedEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  }

  function handleDeleteEvent() {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent.id);
    }
  }

  function goToTodo(todo: Task) {
    router.push("/todos");
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: { day: number; dateKey: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateKey: formatDateKey(year, month, d) });
  }

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <main className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 
            onClick={() => router.push("/calendar")}
            className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 cursor-pointer hover:text-cixio-blue transition"
          >
            <CalendarIcon className="text-cixio-blue w-5 h-5" />
            Calendar Widget
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Due dates pulled live from your Todos & events |{" "}
            <span 
              onClick={() => router.push("/calendar")}
              className="text-cixio-blue hover:underline cursor-pointer font-medium"
            >
              Open Full Calendar →
            </span>
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-cixio-blue hover:bg-cixio-hover text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm transition"
          >
            ‹
          </button>
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm transition"
          >
            ›
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Event
          </span>
        </div>
      </div>

      {eventsLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 text-cixio-blue animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold text-center py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}

          {/* Leading blanks before day 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="min-h-[78px] border-t border-l border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/10"
            />
          ))}

          {cells.map(({ day, dateKey }) => {
            const dayTodos = todosByDate[dateKey] ?? [];
            const dayEvents = eventsByDate[dateKey] ?? [];
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`min-h-[78px] border-t border-l p-1 dark:border-gray-700 flex flex-col justify-between ${
                  isToday ? "bg-blue-50/20 dark:bg-blue-900/10" : "bg-white dark:bg-gray-900"
                }`}
              >
                <span className="text-[10px] text-gray-400 font-semibold">{day}</span>

                <div className="flex-1 space-y-0.5 overflow-hidden max-h-[55px] mt-0.5">
                  {/* Render Tasks */}
                  {dayTodos.slice(0, 1).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => goToTodo(task)}
                      className={`block w-full text-left text-[9px] rounded px-1 py-0.5 truncate font-semibold transition hover:opacity-85 ${
                        PRIORITY_COLORS[task.priority]
                      }`}
                      title={`${task.title} — due ${task.dueDate}`}
                    >
                      {task.title}
                    </button>
                  ))}

                  {/* Render Events */}
                  {dayEvents.slice(0, 1).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsModalOpen(true);
                      }}
                      className="block w-full text-left text-[9px] rounded px-1 py-0.5 truncate font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/50 transition"
                      title={ev.title}
                    >
                      📅 {ev.title}
                    </button>
                  ))}

                  {dayTodos.length + dayEvents.length > 2 && (
                    <p className="text-[9px] text-gray-400 text-center">
                      +{dayTodos.length + dayEvents.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tasks &&
        tasks.filter((t) => t.dueDate).length === 0 &&
        calendarEvents.length === 0 && (
          <div className="mt-4 border border-dashed rounded-xl p-6 text-center text-sm text-gray-400 dark:border-gray-700">
            No events scheduled yet. Add one from above!
          </div>
        )}

      {/* CalendarEventModal */}
      {isModalOpen && (
        <CalendarEventModal
          event={selectedEvent}
          tasks={tasks}
          onSave={handleSaveEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </main>
  );
}