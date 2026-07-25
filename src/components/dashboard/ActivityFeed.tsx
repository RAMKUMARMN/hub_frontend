"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const iconMap: Record<string, string> = {
  task: "✅",
  chat: "💬",
  note: "📝",
  document: "📁",
  event: "🗓️",
  default: "🔔",
};

export default function ActivityFeed() {
  const { data: activities = [], isLoading, isError } = useQuery<ActivityItem[]>({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const res = await api.get<ActivityItem[]>("/activity", { params: { limit: 8 } });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load activity.</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No recent activity yet.
          <div className="text-xs text-gray-400 mt-2">Your latest actions will appear here.</div>
        </div>
      ) : (
        <ul className="relative space-y-3 before:absolute before:left-4 before:top-1 before:h-full before:w-px before:bg-gray-100">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 pl-2">
              <span className="relative z-10 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full text-xs">
                {iconMap[activity.type] ?? iconMap.default}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 leading-snug">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
