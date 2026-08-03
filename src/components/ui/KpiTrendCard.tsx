"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export type KpiTrendDirection = "up" | "down";

export type KpiTrendCardProps = {
  value: string | number;
  label: string;
  /** Sparkline points, left → right. */
  data: number[];
  /** Badge text, e.g. "+12", "-3", "30d". */
  trendLabel: string;
  /** Defaults from first vs last sparkline point when omitted. */
  trend?: KpiTrendDirection;
  className?: string;
};

function resolveTrend(
  data: number[],
  trend?: KpiTrendDirection,
): KpiTrendDirection {
  if (trend) return trend;
  if (data.length < 2) return "up";
  const first = data[0] ?? 0;
  const last = data.at(-1) ?? 0;
  return last >= first ? "up" : "down";
}

function Sparkline({
  data,
  trend,
  gradientId,
}: Readonly<{ data: number[]; trend: KpiTrendDirection; gradientId: string }>) {
  const chartData = data.map((value, index) => ({ index, value }));
  const stroke = trend === "up" ? "#10b981" : "#ef4444";
  const fillFrom = trend === "up" ? "#10b981" : "#ef4444";

  return (
    <div className="h-12 w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillFrom} stopOpacity={0.28} />
              <stop offset="100%" stopColor={fillFrom} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiTrendCard({
  value,
  label,
  data,
  trendLabel,
  trend,
  className = "",
}: Readonly<KpiTrendCardProps>) {
  const reactId = useId().replaceAll(":", "");
  const direction = resolveTrend(data, trend);
  const isUp = direction === "up";
  const gradientId = `kpi-trend-${reactId}`;

  return (
    <article
      className={`flex min-h-36 flex-col justify-between rounded-2xl border border-darkest/8 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ${className}`.trim()}
    >
      <div className="flex justify-end">
        <Sparkline data={data} trend={direction} gradientId={gradientId} />
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-bold tracking-tight text-darkest">
            {value}
          </p>
          <p className="mt-1 text-sm text-gray">{label}</p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isUp ? "bg-green/10 text-green" : "bg-red/10 text-red"
          }`}
        >
          <Icon
            icon={isUp ? "mdi:arrow-up" : "mdi:arrow-down"}
            width={14}
            height={14}
            aria-hidden
          />
          {trendLabel}
        </span>
      </div>
    </article>
  );
}
