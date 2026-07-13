import StatsBar from "@/components/dashboard/StatsBar";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <StatsBar />
    </div>
  );
}