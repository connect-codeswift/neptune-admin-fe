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
      className={`rounded-2xl bg-consent-bg p-5 ${className}`.trim()}
    >
      <p className="text-sm font-medium text-gray">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-darkest">
        {value}
      </p>
      <p className="mt-3 text-sm font-medium text-blue-normal">
        {activeCount} active
      </p>
    </article>
  );
}
