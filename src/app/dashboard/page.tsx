import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCard = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  className: string;
};

const stats: StatCard[] = [
  {
    label: "Active chats",
    value: "18",
    detail: "+4 today",
    icon: MessageSquareText,
    className: "border-blue-100 bg-blue-50 text-blue-700",
  },
  {
    label: "Documents ready",
    value: "42",
    detail: "7 reviewed",
    icon: FileText,
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  {
    label: "Open tasks",
    value: "9",
    detail: "3 due this week",
    icon: CheckCircle2,
    className: "border-amber-100 bg-amber-50 text-amber-700",
  },
  {
    label: "Workspace health",
    value: "98%",
    detail: "stable",
    icon: ShieldCheck,
    className: "border-indigo-100 bg-indigo-50 text-indigo-700",
  },
];

const recentActivity = [
  {
    title: "AI chat summarized project planning notes",
    meta: "Chat workspace",
    time: "10 min ago",
  },
  {
    title: "Onboarding handbook marked ready",
    meta: "Documents",
    time: "38 min ago",
  },
  {
    title: "Queue digest completed without errors",
    meta: "Queues",
    time: "1 hr ago",
  },
  {
    title: "Three tasks moved into review",
    meta: "Todos",
    time: "Yesterday",
  },
];

const upcomingItems = [
  { label: "Review uploaded policy notes", value: "Today" },
  { label: "Finalize student support digest", value: "Tomorrow" },
  { label: "Clean up stale todo labels", value: "Friday" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-cixio-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-cixio-light bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cixio-muted">
                  Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-bold text-cixio-dark">
                  CixioHub workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  A quick view of chats, documents, tasks, and queue readiness while backend services are being connected.
                </p>
              </div>
              <Link
                href="/chat"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-cixio-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cixio-hover"
              >
                Open chat
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-cixio-light bg-cixio-dark p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cixio-light/70">Team activity</p>
                <p className="mt-2 text-3xl font-bold">124</p>
              </div>
              <Users className="text-cixio-light/80" size={34} aria-hidden="true" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-cixio-light/80">
              <TrendingUp size={16} aria-hidden="true" />
              <span>Up 12% from last week</span>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-950">{stat.value}</p>
                  </div>
                  <div className={`rounded-md border p-2 ${stat.className}`}>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">{stat.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-cixio-light bg-white shadow-sm">
            <div className="border-b border-cixio-light px-5 py-4">
              <h2 className="text-lg font-semibold text-cixio-dark">Recent activity</h2>
            </div>
            <div className="divide-y divide-cixio-light">
              {recentActivity.map((item) => (
                <div key={item.title} className="flex items-start gap-4 px-5 py-4">
                  <div className="mt-1 rounded-md bg-cixio-light p-2 text-cixio-blue">
                    <Clock3 size={16} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.meta}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm text-gray-400">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-cixio-light bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-cixio-dark">Upcoming</h2>
            <div className="mt-4 space-y-3">
              {upcomingItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="mt-1 text-sm text-cixio-muted">{item.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
