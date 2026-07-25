"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface DashboardStats {
  tasks_due: number;
  notes_count: number;
  events_count: number;
  chat_sessions: number;
  focus_sessions: number;
}

export default function StatsBar() {
  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get<DashboardStats>("/dashboard/summary");
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const stats = [
    {
      label: "Tasks due today",
      value: data?.tasks_due ?? 0,
      meta: data ? `${data.tasks_due === 0 ? "No tasks due" : "Updated"}` : "",
      color: "text-blue-500",
    },
    {
      label: "Notes this week",
      value: data?.notes_count ?? 0,
      meta: data ? `${data.notes_count} created` : "",
      color: "text-cixio-blue",
    },
    {
      label: "Calendar events",
      value: data?.events_count ?? 0,
      meta: data ? `${data.events_count === 0 ? "No events" : "Scheduled"}` : "",
      color: "text-green-500",
    },
    {
      label: "AI chat sessions",
      value: data?.chat_sessions ?? 0,
      meta: data ? `${data.chat_sessions === 0 ? "Start chatting" : "Recent"}` : "",
      color: "text-orange-500",
    },
    {
      label: "Focus sessions",
      value: data?.focus_sessions ?? 0,
      meta: data ? `${data.focus_sessions === 0 ? "No focus yet" : "Tracked"}` : "",
      color: "text-sky-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl bg-gray-100 animate-pulse"
          />
        ))
      ) : isError ? (
        <div className="col-span-full rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          Unable to load dashboard summary.
        </div>
      ) : (
        stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.meta}</p>
          </div>
        ))
      )}
    </div>
  );
}
