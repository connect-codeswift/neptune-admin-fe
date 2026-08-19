import { GlassCard } from "@/components/ui/GlassCard";
import { getPpeCatalogStats, type DummyPpeItem } from "@/lib/dummy-ppe-catalog";

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

/**
 * `items` is required on purpose — it previously defaulted to `DUMMY_PPE_ITEMS`,
 * which rendered identical stats for every site regardless of the real catalog.
 */
type PpeCatalogStatsRowProps = Readonly<{
  items: DummyPpeItem[];
}>;

export function PpeCatalogStatsRow({ items }: PpeCatalogStatsRowProps) {
  const stats = getPpeCatalogStats(items);

  return (
    // `stagger-cards` delays children 2–4 so the row settles left to right;
    // GlassCard already carries the rise and the hover lift, so nothing here
    // repeats them.
    <div className="stagger-cards grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard value={stats.totalTypes} label="Total PPE Types" />
      <StatCard value={stats.categories} label="Categories" />
      <StatCard value={stats.lowStock} label="Low Stock Items" />
      <StatCard value={stats.requireTraining} label="Require Training" />
    </div>
  );
}
