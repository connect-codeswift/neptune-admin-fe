export type KpiSummaryCardProps = {
  title: string;
  value: string | number;
  activeCount: number;
  className?: string;
};

export function KpiSummaryCard({
  title,
  value,
  activeCount,
  className = "",
}: Readonly<KpiSummaryCardProps>) {
  return (
    <article
      className={`bg-ehs-surface-raised rounded-2xl p-5 ${className}`.trim()}
    >
      <p className="text6 text-ehs-gray">{title}</p>
      <p className="text2 text-ehs-darker mt-2">{value}</p>
      <p className="text8 text-ehs-normal-blue mt-3">{activeCount} active</p>
    </article>
  );
}
