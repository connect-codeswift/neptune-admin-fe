"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui";
import type { DummyPpeItem } from "@/lib/dummy-ppe-catalog";

type PpeCatalogCardProps = Readonly<{
  item: DummyPpeItem;
}>;

/** Neither action has a mutation behind it yet — see the note on the row below. */
const ACTIONS_UNAVAILABLE_REASON =
  "Editing catalog items is not available yet — add items from “Add PPE Item”.";

function Tag({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-ehs-border-ink/6 px-2 py-0.5 text8 text-ehs-slate">
      {label}
    </span>
  );
}

function Metric({
  label,
  value,
  valueClassName = "text-ehs-darker",
}: Readonly<{
  label: string;
  value: string | number;
  valueClassName?: string;
}>) {
  return (
    <div className="min-w-0">
      <p className="text8 tracking-[0.66px] text-ehs-muted-text uppercase">
        {label}
      </p>
      <p className={`mt-1 truncate text4 ${valueClassName}`} title={String(value)}>
        {value}
      </p>
    </div>
  );
}

export function PpeCatalogCard({ item }: PpeCatalogCardProps) {
  const isLowStock = item.stock <= item.minStockLevel;
  const provenance = [item.modelNumber, item.manufacturer]
    .filter(Boolean)
    .join(" · ");

  return (
    // `h-full` + the `mt-auto` footer below are what keep a row of these cards
    // aligned: without them a two-hazard item ends 40px short of a five-hazard
    // one and the grid reads as broken rather than as varied content.
    <GlassCard className="h-full p-5">
      {/* One wrapper child: GlassCard supplies its own `gap`, and these
          blocks already space themselves. */}
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-2 text3 text-ehs-darker"
              title={item.name}
            >
              {item.name}
            </h3>
            <p
              className="mt-1 truncate text8 text-ehs-muted-text"
              title={provenance}
            >
              {provenance}
            </p>
          </div>

          {/* The two controls used to fire a toast saying they were "not wired
              yet", which is a control that looks live and is not. Disabled with
              the reason on the group instead, so the affordance stays where it
              will be and nobody chases it. */}
          <div
            className="flex shrink-0 items-center gap-1.5"
            title={ACTIONS_UNAVAILABLE_REASON}
          >
            <IconButton
              icon="lucide:pencil"
              label={`Edit ${item.name}`}
              size="sm"
              disabled
            />
            <IconButton
              icon="lucide:trash-2"
              label={`Delete ${item.name}`}
              size="sm"
              variant="soft"
              disabled
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text8 text-ehs-normal-blue">{item.categoryLabel}</span>
          <span className="text8 text-ehs-muted-text" aria-hidden="true">
            ·
          </span>
          <span className="text8 text-ehs-gray">{item.safetyStandard}</span>
          {item.trainingRequired ? (
            <span className="inline-flex items-center rounded-md bg-ehs-normal-blue/12 px-2 py-0.5 text7 tracking-[0.5px] text-ehs-normal-blue uppercase">
              Training required
            </span>
          ) : null}
          {/* Low stock was carried by the number turning red, which is colour
              as the only channel. The badge says it in words as well. */}
          {isLowStock ? (
            <span className="inline-flex items-center rounded-md bg-ehs-red/12 px-2 py-0.5 text7 tracking-[0.5px] text-ehs-red uppercase">
              Low stock
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-ehs-border-ink/8 py-4">
          <Metric
            label="Stock"
            value={item.stock}
            valueClassName={isLowStock ? "text-ehs-red" : "text-ehs-normal-blue"}
          />
          <Metric label="Inspect" value={item.inspectInterval} />
          <Metric label="Lifespan" value={item.lifespan} />
        </div>

        <div className="mt-auto">
          <p className="text8 tracking-[0.66px] text-ehs-muted-text uppercase">
            Hazard types
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.hazardTypes.length > 0 ? (
              item.hazardTypes.map((hazard) => (
                <Tag key={hazard} label={hazard} />
              ))
            ) : (
              <span className="text8 text-ehs-muted-text">None recorded</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
