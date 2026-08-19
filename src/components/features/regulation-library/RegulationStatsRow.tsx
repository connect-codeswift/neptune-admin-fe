import type { DummyRegulation } from "@/lib/dummy-regulations";
import { GlassCard } from "@/components/ui/GlassCard";
import { getRegulationStatsFromList } from "@/lib/mappers/compliance.mapper";

function StatCard({
  value,
  label,
}: Readonly<{ value: string | number; label: string }>) {
  return (
    <GlassCard className="min-h-24 justify-center px-5 py-4">
      {/* One wrapper child so GlassCard's own `gap` never separates the value
          from its label — the 4px `mt-1` below is the intended spacing. */}
      <div className="min-w-0">
        <p className="text1 text-darkest tabular-nums">{value}</p>
        <p className="mt-1 truncate text8 text-gray" title={label}>
          {label}
        </p>
      </div>
    </GlassCard>
  );
}

type RegulationStatsRowProps = Readonly<{
  regulations?: DummyRegulation[];
}>;

export function RegulationStatsRow({
  regulations = [],
}: RegulationStatsRowProps) {
  const stats = getRegulationStatsFromList(regulations);

  return (
    // `stagger-cards` delays children 2–4 so the row settles left to right;
    // GlassCard already carries the rise and the hover lift.
    <div className="stagger-cards grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard value={stats.total} label="Total Regulations" />
      <StatCard value={stats.active} label="Active" />
      <StatCard value={stats.safetyLevel} label="Safety Level" />
      <StatCard value={`${stats.avgCompliance}%`} label="Avg. Compliance" />
    </div>
  );
}
