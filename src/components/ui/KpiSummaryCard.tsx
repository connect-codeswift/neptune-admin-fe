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
      <p className="text5 text-gray">{title}</p>
      <p className="mt-2 text1 text-darkest">
        {value}
      </p>
      <p className="mt-3 text5 text-blue-normal">
        {activeCount} active
      </p>
    </article>
  );
}
