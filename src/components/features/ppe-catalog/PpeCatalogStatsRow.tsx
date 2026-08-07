import { getPpeCatalogStats, type DummyPpeItem } from "@/lib/dummy-ppe-catalog";

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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard value={stats.totalTypes} label="Total PPE Types" />
      <StatCard value={stats.categories} label="Categories" />
      <StatCard value={stats.lowStock} label="Low Stock Items" />
      <StatCard value={stats.requireTraining} label="Require Training" />
    </div>
  );
}
