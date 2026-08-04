"use client";

import { toast } from "sonner";
import { IconButton } from "@/components/ui";
import type { DummyPpeItem } from "@/lib/dummy-ppe-catalog";

type PpeCatalogCardProps = Readonly<{
  item: DummyPpeItem;
}>;

function Tag({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-darkest/6 px-2 py-0.5 text6 text-darkest">
      {label}
    </span>
  );
}

function Metric({
  label,
  value,
  valueClassName = "text-darkest",
}: Readonly<{
  label: string;
  value: string | number;
  valueClassName?: string;
}>) {
  return (
    <div className="min-w-0">
      <p className="text8 tracking-[0.66px] text-[#8892a3] uppercase">{label}</p>
      <p className={`mt-1 text4 ${valueClassName}`}>{value}</p>
    </div>
  );
}

export function PpeCatalogCard({ item }: PpeCatalogCardProps) {
  const isLowStock = item.stock <= item.minStockLevel;

  return (
    <article className="flex h-full flex-col rounded-[20px] border border-white/90 bg-white/62 p-5 shadow-lg backdrop-blur-[10px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text3 text-darkest">{item.name}</h2>
          <p className="mt-0.5 text6 text-gray">{item.modelNumber}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton
            icon="lucide:pencil"
            label={`Edit ${item.name}`}
            size="sm"
            onClick={() => toast.info(`Edit ${item.name} is not wired yet.`)}
          />
          <IconButton
            icon="lucide:trash-2"
            label={`Delete ${item.name}`}
            size="sm"
            variant="soft"
            onClick={() => toast.info(`Delete ${item.name} is not wired yet.`)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text6 font-semibold text-blue-normal">
          {item.categoryLabel}
        </span>
        <span className="text6 text-gray">·</span>
        <span className="text6 text-gray">{item.safetyStandard}</span>
        {item.trainingRequired ? (
          <span className="inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text7 font-semibold tracking-[0.5px] text-blue-normal uppercase">
            Training required
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-darkest/8 py-4">
        <Metric
          label="Stock"
          value={item.stock}
          valueClassName={isLowStock ? "text-red" : "text-blue-normal"}
        />
        <Metric label="Inspect" value={item.inspectInterval} />
        <Metric label="Lifespan" value={item.lifespan} />
      </div>

      <div className="mt-4">
        <p className="text6 text-gray">Hazard Types:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {item.hazardTypes.map((hazard) => (
            <Tag key={hazard} label={hazard} />
          ))}
        </div>
      </div>
    </article>
  );
}
