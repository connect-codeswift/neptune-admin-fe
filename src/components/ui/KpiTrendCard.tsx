"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";
import type { ResolvedTheme } from "@/lib/theme";
import { GlassCard } from "./GlassCard";

/**
 * Sparkline ink, as literal hex per theme.
 *
 * Recharts writes `stroke` / `stopColor` onto SVG **presentation attributes**,
 * not CSS properties, and `var()` is not valid there — the browser discards the
 * attribute and the mark falls back to the SVG default, which is a black fill
 * and no stroke. Handing it `var(--ehs-green)` therefore did not produce a
 * green line; it produced an invisible one, which is why these cards rendered
 * blank.
 *
 * So the values are duplicated from `globals.css` and picked with the resolved
 * theme instead. Keep them in step with `--ehs-green` / `--ehs-red` there.
 */
const SPARKLINE_INK: Record<ResolvedTheme, Record<KpiTrendDirection, string>> = {
  light: { up: "#10b981", down: "#ef4444" },
  dark: { up: "#34d399", down: "#f87171" },
};

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
  const { resolvedTheme } = useTheme();
  const stroke = SPARKLINE_INK[resolvedTheme][trend];
  const fillFrom = stroke;

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

  // A sparkline needs at least two points to be a line. Callers that have only
  // a running total — most of this dashboard, whose summary endpoint returns
  // scalars rather than a series — were passing a one-element array, and
  // Recharts drew that as a single floating dot: a mark that looks like data
  // but says nothing about a trend. Below two points the chart is omitted and
  // the value gets the room instead.
  const hasSeries = data.filter((point) => Number.isFinite(point)).length >= 2;

  return (
    <GlassCard className={`min-h-34 justify-between ${className}`.trim()}>
      {hasSeries ? (
        <div className="flex justify-end">
          <Sparkline data={data} trend={direction} gradientId={gradientId} />
        </div>
      ) : null}

      <div className={hasSeries ? "mt-1" : "mt-auto"}>
        <p className="text2 text-ehs-darker">{value}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text6 text-ehs-gray">{label}</p>
          <span
            className={`text7 inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 ${
              isUp
                ? "bg-ehs-green/[0.14] text-ehs-green"
                : "bg-ehs-red/[0.14] text-ehs-red"
            }`}
          >
            <Icon
              icon={isUp ? "mdi:arrow-up" : "mdi:arrow-down"}
              width={10}
              height={10}
              aria-hidden
            />
            {trendLabel}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
