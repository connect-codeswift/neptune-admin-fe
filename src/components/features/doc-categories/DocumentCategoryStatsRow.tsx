"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { FeatureLoadingGrid } from "@/components/features/shared";
import { useDocCategoryStats } from "@/hooks/useDocCategories";

const STAT_GRID_CLASS = "stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-3";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
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

export function DocumentCategoryStatsRow() {
  // `isPending` (not `isLoading`) so the row keeps its loading skeleton while
  // the query is still gated on the tenant scope — a disabled query reports
  // `isLoading === false` with no data, which would flash zeroed stats.
  const { data: stats, isPending } = useDocCategoryStats();

  if (isPending) {
    return (
      <FeatureLoadingGrid
        count={3}
        label="Loading document category stats…"
        // Same grid as the real row, minus the stagger — placeholders that
        // cascade in read as content arriving.
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      />
    );
  }

  return (
    <div className={STAT_GRID_CLASS}>
      <StatCard value={stats?.totalCategories ?? 0} label="Total Categories" />
      <StatCard value={stats?.totalDocuments ?? 0} label="Total Documents" />
      <StatCard
        value={stats?.requiredCategories ?? 0}
        label="Required Categories"
      />
    </div>
  );
}
