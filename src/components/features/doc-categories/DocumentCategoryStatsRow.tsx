"use client";

import { useDocCategoryStats } from "@/hooks/useDocCategories";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function DocumentCategoryStatsRow() {
  // `isPending` (not `isLoading`) so the row keeps its loading skeleton while
  // the query is still gated on the tenant scope — a disabled query reports
  // `isLoading === false` with no data, which would flash zeroed stats.
  const { data: stats, isPending } = useDocCategoryStats();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <StatCard key={key} value={0} label="Loading…" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard value={stats?.totalCategories ?? 0} label="Total Categories" />
      <StatCard value={stats?.totalDocuments ?? 0} label="Total Documents" />
      <StatCard
        value={stats?.requiredCategories ?? 0}
        label="Required Categories"
      />
    </div>
  );
}
