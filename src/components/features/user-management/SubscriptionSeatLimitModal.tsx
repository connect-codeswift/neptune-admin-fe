"use client";

import { Icon } from "@iconify/react";
import { Modal } from "@/components/ui";
import {
  getSeatLimitMessage,
  getSeatUsagePercent,
  type OrganizationSeatLimitInfo,
} from "@/lib/organization-limits";

type SubscriptionSeatLimitModalProps = Readonly<{
  open: boolean;
  seatInfo: OrganizationSeatLimitInfo;
  onClose: () => void;
  onContactSales?: () => void;
}>;

function DetailRow({
  label,
  value,
  valueClassName = "text-darkest",
}: Readonly<{
  label: string;
  value: string;
  valueClassName?: string;
}>) {
  return (
    <div className="flex items-center justify-between gap-4 text4">
      <span className="text-gray">{label}</span>
      <span className={`font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * The two things an admin can actually do about a full plan. The modal used to
 * end on "adding more users will require a plan upgrade", which states the wall
 * without naming a door: the reader is left to work out that deactivating a
 * leaver returns a seat immediately and costs nothing.
 */
function NextStep({
  icon,
  title,
  description,
}: Readonly<{ icon: string; title: string; description: string }>) {
  return (
    <li className="flex items-start gap-3">
      <Icon
        icon={icon}
        className="mt-0.5 size-4 shrink-0 text-blue-normal"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text4 font-semibold text-darkest">{title}</p>
        <p className="mt-0.5 text8 leading-relaxed text-gray">{description}</p>
      </div>
    </li>
  );
}

export function SubscriptionSeatLimitModal({
  open,
  seatInfo,
  onClose,
  onContactSales,
}: SubscriptionSeatLimitModalProps) {
  const usagePercent = getSeatUsagePercent(seatInfo);
  const atLimit = seatInfo.seatsAvailable <= 0;

  let barToneClass = "bg-blue-normal";
  if (atLimit) {
    barToneClass = "bg-ehs-red";
  }

  let availableToneClass = "text-darkest";
  if (atLimit) {
    availableToneClass = "text-ehs-red";
  }

  return (
    <Modal
      open={open}
      title={atLimit ? "Seat Limit Reached" : "Approaching Seat Limit"}
      onClose={onClose}
      // Contacting CodeSwift is the action that changes the situation, so it is
      // the primary; closing is the way out, not the outcome.
      secondaryLabel="Close"
      onSecondary={onClose}
      primaryLabel="Contact CodeSwift"
      onPrimary={onContactSales ?? onClose}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <p className="text4 leading-relaxed text-gray">
          {getSeatLimitMessage(seatInfo)}
        </p>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text6 text-gray">Seats Allocated</p>
            <p className="text7 font-semibold text-blue-normal">
              {seatInfo.seatsUsed} of {seatInfo.seatsTotal} used
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-ehs-border-ink/10"
            role="progressbar"
            aria-valuenow={usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${seatInfo.seatsUsed} of ${seatInfo.seatsTotal} seats used`}
            aria-label="Seat allocation"
          >
            <div
              className={`h-full rounded-full transition-[width] ${barToneClass}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-ehs-surface-raised px-4 py-3">
          <div className="flex flex-col gap-2.5">
            <DetailRow
              label="Seats Used"
              value={`${seatInfo.seatsUsed} / ${seatInfo.seatsTotal}`}
            />
            <DetailRow
              label="Seats Available"
              value={String(seatInfo.seatsAvailable)}
              valueClassName={availableToneClass}
            />
          </div>
        </div>

        <div>
          <h3 className="text6 text-gray">What you can do next</h3>
          <ul className="mt-3 flex flex-col gap-3">
            <NextStep
              icon="mdi:account-off-outline"
              title="Free a seat"
              description="Deactivating someone who has left returns their seat straight away. Open User Management, find them, and choose Deactivate — their history stays intact."
            />
            <NextStep
              icon="mdi:account-multiple-plus-outline"
              title="Raise the allowance"
              description="If everyone on the plan is still active, CodeSwift can increase the seat count for this organization. Use Contact CodeSwift below and say how many seats you need."
            />
          </ul>
        </div>
      </div>
    </Modal>
  );
}
