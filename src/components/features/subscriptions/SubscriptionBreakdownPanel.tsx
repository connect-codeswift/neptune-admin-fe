"use client";

import { Icon } from "@iconify/react";
import {
  getKindSubtotal,
  getLineItemsByKind,
  lineItemId,
  sumLineItems,
  type SubscriptionLineItem,
  type SubscriptionLineItemKind,
} from "@/lib/dummy-subscriptions";

type SubscriptionBreakdownPanelProps = Readonly<{
  lineItems: SubscriptionLineItem[];
  editable?: boolean;
  onOverride?: (
    kind: SubscriptionLineItemKind,
    key: string,
    unitPrice: number,
  ) => void;
  onClearOverride?: (
    kind: SubscriptionLineItemKind,
    key: string,
  ) => void;
}>;

function LineRow({
  item,
  editable,
  onOverride,
  onClearOverride,
}: Readonly<{
  item: SubscriptionLineItem;
  editable: boolean;
  onOverride?: SubscriptionBreakdownPanelProps["onOverride"];
  onClearOverride?: SubscriptionBreakdownPanelProps["onClearOverride"];
}>) {
  const showsQuantity = item.kind === "users" || item.kind === "site";
  const quantityLabel =
    showsQuantity && item.quantity > 0 ? ` × ${item.quantity}` : "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-darkest/8 py-2.5 last:border-b-0">
      <span className="flex min-w-0 items-center gap-1.5 text5 text-gray">
        <span className="truncate">
          {item.label}
          {quantityLabel}
        </span>
        {item.overridden ? (
          <span className="inline-flex shrink-0 items-center rounded-full bg-yellow/20 px-2 py-0.5 text7 text-darkest">
            Negotiated
          </span>
        ) : null}
      </span>

      <span className="flex items-center gap-2">
        {editable && onOverride ? (
          <label className="flex items-center gap-1">
            <span className="sr-only">{`${item.label} unit price`}</span>
            <span className="text6 text-gray">$</span>
            <input
              type="number"
              min={0}
              value={String(item.unitPrice)}
              onChange={(event) =>
                onOverride(item.kind, item.key, Number(event.target.value) || 0)
              }
              className="w-24 rounded-lg border border-darkest/15 bg-white px-2 py-1 text6 text-darkest outline-none focus-visible:ring-2 focus-visible:ring-blue-normal/30"
            />
          </label>
        ) : null}

        {editable && item.overridden && onClearOverride ? (
          <button
            type="button"
            onClick={() => onClearOverride(item.kind, item.key)}
            className="inline-flex items-center rounded-md p-1 text-gray hover:text-darkest"
            aria-label={`Reset ${item.label} to rate card price`}
          >
            <Icon icon="lucide:rotate-ccw" width={14} height={14} aria-hidden />
          </button>
        ) : null}

        <span className="w-28 text-right text5 font-semibold text-darkest">
          ${item.total.toLocaleString()}/yr
        </span>
      </span>
    </div>
  );
}

function SubtotalRow({
  label,
  value,
  emphasis = false,
}: Readonly<{ label: string; value: string; emphasis?: boolean }>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-darkest/8 py-2.5 last:border-b-0">
      <span className={`text5 ${emphasis ? "text-darkest" : "text-gray"}`}>
        {label}
      </span>
      <span
        className={`text5 ${emphasis ? "font-bold text-darkest" : "text-darkest"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function SubscriptionBreakdownPanel({
  lineItems,
  editable = false,
  onOverride,
  onClearOverride,
}: SubscriptionBreakdownPanelProps) {
  const moduleItems = getLineItemsByKind(lineItems, "module");
  const baseItems = lineItems.filter((item) => item.kind !== "module");
  const yearlyTotal = sumLineItems(lineItems);

  return (
    <div className="rounded-[20px] border border-blue-normal/20 bg-blue-normal/8 p-5">
      <p className="text6 font-semibold tracking-[0.5px] text-blue-normal uppercase">
        Yearly Contract Breakdown
      </p>
      <p className="mt-1 text6 text-gray">
        {editable
          ? "Prices are seeded from the rate card. Edit any line to record a negotiated price — it will be frozen on this subscription."
          : "Agreed prices, frozen when this subscription was saved."}
      </p>

      <div className="mt-4 flex flex-col">
        {baseItems.map((item) => (
          <LineRow
            key={lineItemId(item.kind, item.key)}
            item={item}
            editable={editable}
            onOverride={onOverride}
            onClearOverride={onClearOverride}
          />
        ))}

        {moduleItems.length > 0 ? (
          <>
            {moduleItems.map((item) => (
              <LineRow
                key={lineItemId(item.kind, item.key)}
                item={item}
                editable={editable}
                onOverride={onOverride}
                onClearOverride={onClearOverride}
              />
            ))}
            <SubtotalRow
              label={`Modules subtotal (${moduleItems.length})`}
              value={`$${getKindSubtotal(lineItems, "module").toLocaleString()}/yr`}
            />
          </>
        ) : (
          <SubtotalRow label="Modules" value="None selected" />
        )}

        <SubtotalRow
          label="Yearly contract total"
          value={`$${yearlyTotal.toLocaleString()}/yr`}
          emphasis
        />
      </div>
    </div>
  );
}
