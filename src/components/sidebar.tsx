// "use client" tells Next.js this component runs in the browser.
// Server Components can't use useState/useEffect — client ones can.
// StatsBar is simple (no interactivity) so we can keep it as a Server Component.

const stats = [
  { label: "Tasks due today", value: 5, delta: "+2 new" },
  { label: "Notes this week", value: 12, delta: "+4 added" },
  { label: "Calendar events", value: 3, delta: "Today" },
  { label: "AI chat sessions", value: 28, delta: "+6 this week" },
  { label: "Focus sessions", value: 7, delta: "3h 40m" },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">{s.label}</p>
          <p className="text-2xl font-medium">{s.value}</p>
          <p className="text-xs text-green-600 mt-1">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}