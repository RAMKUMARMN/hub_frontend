"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface DashboardStats {
  tasks_due: number;
  notes_count: number;
  events_count: number;
  chat_sessions: number;
  focus_sessions: number;
}

export default function ProductivityChart() {
  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get<DashboardStats>("/dashboard/summary");
      return res.data;
    },
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Tasks due", value: data.tasks_due, color: "#7c3aed" },
      { label: "Notes", value: data.notes_count, color: "#2563eb" },
      { label: "Events", value: data.events_count, color: "#10b981" },
      { label: "Chats", value: data.chat_sessions, color: "#f59e0b" },
      { label: "Focus", value: data.focus_sessions, color: "#0ea5e9" },
    ];
  }, [data]);

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Productivity</h2>
        <span className="text-xs text-gray-400">User-specific overview</span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load productivity data.</div>
      ) : (
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.label}</span>
                <span className="font-semibold text-gray-700">{item.value}</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-4">
        Stats are loaded from your authenticated profile and reflect only your own activity.
      </div>
    </div>
  );
}
