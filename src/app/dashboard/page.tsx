// app/dashboard/page.tsx
// This is the dashboard route — it renders at http://localhost:3000/dashboard
// It's a Server Component (no "use client") — it just imports and arranges widgets.

import StatsBar from "@/components/dashboard/StatsBar";
import TasksWidget from "@/components/dashboard/TasksWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import AIChatWidget from "@/components/dashboard/AIChatWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import DocsWidget from "@/components/dashboard/DocsWidget";
import FocusTimer from "@/components/dashboard/FocusTimer";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProductivityChart from "@/components/dashboard/ProductivityChart";

// Get the current hour to personalise the greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {getGreeting()} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{today}</p>
          </div>

          <a
            href="/chat"
            className="bg-cixio-blue text-white text-sm px-4 py-2 rounded-lg hover:bg-cixio-hover transition-colors"
          >
            New AI chat
          </a>
        </div>

        {/* ── Row 1: Stats bar (5 numbers) ────────────────────── */}
        <StatsBar />

        {/* ── Row 2: Tasks + Calendar ─────────────────────────── */}
        {/*
          grid-cols-2 = two equal columns
          gap-4       = space between them
          mt-4        = margin above this row
        */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <TasksWidget />
          <CalendarWidget />
        </div>

        {/* ── Row 3: AI Chat preview + Notes ──────────────────── */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <AIChatWidget />
          <NotesWidget />
        </div>

        {/* ── Row 4: Documents + Focus Timer ──────────────────── */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <DocsWidget />
          <FocusTimer />
        </div>

        {/* ── Row 5: Productivity chart + Activity feed ────────── */}
        <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
          <ProductivityChart />
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}