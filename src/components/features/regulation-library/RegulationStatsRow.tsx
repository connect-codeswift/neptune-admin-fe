import {
  DUMMY_REGULATIONS,
  getRegulationStats,
} from "@/lib/dummy-regulations";

function StatCard({
  value,
  label,
}: Readonly<{ value: string | number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function RegulationStatsRow() {
  const stats = getRegulationStats(DUMMY_REGULATIONS);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard value={stats.total} label="Total Regulations" />
      <StatCard value={stats.active} label="Active" />
      <StatCard value={stats.safetyLevel} label="Safety Level" />
      <StatCard value={`${stats.avgCompliance}%`} label="Avg. Compliance" />
    </div>
  );
}
