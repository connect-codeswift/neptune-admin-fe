import {
  DUMMY_DOCUMENT_CATEGORIES,
  getDocumentCategoryStats,
} from "@/lib/dummy-doc-categories";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-xl backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function DocumentCategoryStatsRow() {
  const stats = getDocumentCategoryStats(DUMMY_DOCUMENT_CATEGORIES);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard value={stats.totalCategories} label="Total Categories" />
      <StatCard value={stats.totalDocuments} label="Total Documents" />
      <StatCard value={stats.requiredCategories} label="Required Categories" />
    </div>
  );
}
