"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "@/store/tasksContext";
import { groupTodosByDate, formatDateKey } from "@/lib/calendarUtils";
import { PRIORITY_COLORS } from "@/lib/priorityColors";
import api from "@/lib/api";
import CalendarEventModal, {
  CalendarEvent,
  CalendarEventFormData,
} from "@/components/calendar/CalendarEventModal";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function CalendarGrid() {
  const { tasks } = useTasks();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleToken, setGoogleToken] = useState("");
  const [syncFeedback, setSyncFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const [googleConnectionStatus, setGoogleConnectionStatus] = useState<"connected" | "expired" | "disconnected">("disconnected");

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("google_access_token");
      const expiry = localStorage.getItem("google_access_token_expiry");
      if (!token) {
        setGoogleConnectionStatus("disconnected");
      } else if (expiry && Date.now() < parseInt(expiry)) {
        setGoogleConnectionStatus("connected");
      } else {
        setGoogleConnectionStatus("expired");
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Fetch sync status
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery<{
    status: string;
    last_sync: string | null;
  }>({
    queryKey: ["calendarSyncStatus"],
    queryFn: async () => {
      const res = await api.get("/calendar/sync/status");
      return res.data;
    },
  });

  // Fetch Google Client ID configuration
  const { data: calendarConfig } = useQuery<{ google_client_id: string }>({
    queryKey: ["calendarConfig"],
    queryFn: async () => {
      const res = await api.get("/calendar/config");
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

  const syncGoogleCalendarMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post("/calendar/sync/google", null, {
        params: { google_token: token },
      });
      return { resData: res.data, token };
    },
    onSuccess: ({ resData, token }) => {
      // Store token in localStorage
      localStorage.setItem("google_access_token", token);
      localStorage.setItem("google_access_token_expiry", (Date.now() + 3600 * 1000).toString());

      refetchSyncStatus();
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setSyncFeedback({
        status: "success",
        message: `Synced successfully! Imported ${resData.imported_count} & deleted ${resData.deleted_count} stale events.`,
      });
      setGoogleToken("");
    },
    onError: (err: any) => {
      setSyncFeedback({
        status: "error",
        message: err.response?.data?.detail || "Sync failed. Check your token.",
      });
    },
  });

  // Detect OAuth access token redirect in URL hash & Silent Auto-Sync on Page Load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        // Clean URL hash immediately
        window.history.replaceState({}, document.title, window.location.pathname);
        setSyncFeedback(null);
        syncGoogleCalendarMutation.mutate(token);
        return;
      }
    }

    // If no hash redirect, check if there is an unexpired token in localStorage and auto-sync
    const savedToken = getActiveGoogleToken();
    if (savedToken) {
      syncGoogleCalendarMutation.mutate(savedToken);
    }
  }, []);

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

  function handleSyncGoogle() {
    if (!googleToken.trim()) return;
    setSyncFeedback(null);
    syncGoogleCalendarMutation.mutate(googleToken.trim());
  }

  function handleConnectGoogle() {
    const clientId = calendarConfig?.google_client_id;
    if (!clientId || clientId === "your_google_client_id") {
      setSyncFeedback({
        status: "error",
        message: "Google Client ID is not configured on the backend. Please check your .env file.",
      });
      return;
    }

    const redirectUri = window.location.origin + "/calendar";
    const scopes = "https://www.googleapis.com/auth/calendar.events";
    
    // Redirect to Google's OAuth consent screen
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&include_granted_scopes=true&prompt=consent`;
    
    window.location.href = authUrl;
  }

  function goToTodo() {
    router.push("/todos");
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: { day: number; dateKey: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateKey: formatDateKey(year, month, d),
    });
  }

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      {/* Upper header area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <CalendarIcon className="text-cixio-blue w-6 h-6" />
            Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Displaying tasks live from your Todos & standalone calendar events.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-cixio-blue hover:bg-cixio-hover text-white text-sm px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar Section */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
              >
                ‹
              </button>

              <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 min-w-[140px] text-center">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
              >
                ›
              </button>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                High Task
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Medium Task
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Low Task
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Calendar Event
              </span>
            </div>
          </div>

          {eventsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 text-cixio-blue animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Loading calendar data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-gray-950/20">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-xs font-semibold text-center py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}

              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`blank-${i}`}
                  className="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/10"
                />
              ))}

              {/* Day cells */}
              {cells.map(({ day, dateKey }) => {
                const dayTodos = todosByDate[dateKey] ?? [];
                const dayEvents = eventsByDate[dateKey] ?? [];
                const isToday = dateKey === todayKey;

                return (
                  <div
                    key={dateKey}
                    className={`min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 p-2 relative flex flex-col justify-between transition-colors ${
                      isToday
                        ? "bg-blue-50/20 dark:bg-blue-900/10 border-t-2 border-t-cixio-blue"
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          isToday
                            ? "bg-cixio-blue text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden max-h-[72px]">
                      {/* Render Todos */}
                      {dayTodos.map((task) => (
                        <button
                          key={task.id}
                          onClick={goToTodo}
                          className="block w-full text-left text-[10px] rounded-lg px-2 py-1 font-semibold truncate bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                          title={`Task: ${task.title} (Priority: ${task.priority})`}
                        >
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                            task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                          {task.title}
                        </button>
                      ))}

                      {/* Render Events */}
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setIsModalOpen(true);
                          }}
                          className="block w-full text-left text-[10px] rounded-lg px-2 py-1 font-semibold truncate bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:border-blue-900/50 transition"
                          title={`Event: ${ev.title}${
                            ev.description ? ` - ${ev.description}` : ""
                          }`}
                        >
                          📅 {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Controls Section */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Sync Widget */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-cixio-blue" />
              Google Calendar Sync
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Connect to your Google account to automatically import events from your primary calendar.
            </p>

            {/* Sync status indicators */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-4 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400">Sync Status:</span>
                <span className="font-semibold capitalize text-gray-700 dark:text-gray-300">
                  {syncStatus?.status || "never_synced"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Last Synced:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {syncStatus?.last_sync
                    ? new Date(syncStatus.last_sync).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between items-center">
                <span className="text-gray-400">Active Connection:</span>
                {googleConnectionStatus === "connected" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : googleConnectionStatus === "expired" ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1" title="Please reconnect to enable two-way sync">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Expired
                  </span>
                ) : (
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Not Connected
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Primary OAuth Sign in button */}
              <button
                onClick={handleConnectGoogle}
                disabled={syncGoogleCalendarMutation.isPending}
                className="w-full bg-cixio-blue hover:bg-cixio-hover text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                {syncGoogleCalendarMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.709 0 3.277.604 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.24-4.067 10.24-10.24 0-.668-.083-1.318-.24-1.955H12.24z"/>
                  </svg>
                )}
                Connect Google Calendar
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-bold">Or use raw token</span>
                </div>
              </div>

              <div>
                <input
                  type="password"
                  value={googleToken}
                  onChange={(e) => setGoogleToken(e.target.value)}
                  placeholder="Enter manual access token..."
                  className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:border-transparent dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>

              <button
                onClick={handleSyncGoogle}
                disabled={!googleToken.trim() || syncGoogleCalendarMutation.isPending}
                className="w-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncGoogleCalendarMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sync with Token
              </button>
            </div>

            {/* Sync Feedbacks */}
            {syncFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-xs leading-tight animate-in fade-in slide-in-from-top-1 duration-200 ${
                  syncFeedback.status === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                    : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                }`}
              >
                {syncFeedback.status === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{syncFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-cixio-blue/10 to-transparent border border-cixio-blue/10 rounded-2xl p-6">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2 flex items-center gap-1">
              🚀 Smart Scheduling
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              You can also ask the AI Chat assistant to schedule meetings, look up events, or start focus sessions for you!
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
}