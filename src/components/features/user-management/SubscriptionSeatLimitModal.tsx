"use client";

import { Modal } from "@/components/ui";
import {
  getSeatLimitMessage,
  getSeatsAvailable,
  getSeatUsagePercent,
  getTrialStatusLabel,
  type SubscriptionSeatInfo,
} from "@/lib/subscription-seats";

type SubscriptionSeatLimitModalProps = Readonly<{
  open: boolean;
  seatInfo: SubscriptionSeatInfo;
  onClose: () => void;
  onContactSales?: () => void;
  onManageSubscription?: () => void;
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
    <div className="flex items-center justify-between gap-4 text5">
      <span className="text-gray">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export function SubscriptionSeatLimitModal({
  open,
  seatInfo,
  onClose,
  onContactSales,
  onManageSubscription,
}: SubscriptionSeatLimitModalProps) {
  const usagePercent = getSeatUsagePercent(seatInfo);
  const seatsAvailable = getSeatsAvailable(seatInfo);

  return (
    <Modal
      open={open}
      title="Subscription Seat Limit"
      onClose={onClose}
      secondaryLabel="Contact Sales"
      onSecondary={onContactSales ?? onClose}
      primaryLabel="Manage Subscription"
      onPrimary={onManageSubscription ?? onClose}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text6 font-semibold text-gray">Seats Allocated</p>
            <p className="text6 font-semibold text-blue-normal">
              {seatInfo.seatsUsed} of {seatInfo.seatsTotal} used
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[#e8edf3]"
            role="progressbar"
            aria-valuenow={usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Seat allocation"
          >
            <div
              className="h-full rounded-full bg-blue-normal transition-[width]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-[#f4f6f9] px-4 py-3">
          <div className="flex flex-col gap-2.5">
            <DetailRow label="Current Plan" value={seatInfo.planType} />
            <DetailRow
              label="Trial Status"
              value={getTrialStatusLabel(seatInfo)}
              valueClassName="text-blue-normal"
            />
            <DetailRow
              label="Seats Used"
              value={`${seatInfo.seatsUsed} / ${seatInfo.seatsTotal}`}
            />
            <DetailRow
              label="Seats Available"
              value={String(seatsAvailable)}
            />
          </div>
        </div>

        <p className="text5 leading-relaxed text-gray">
          {getSeatLimitMessage(seatInfo)}
        </p>
      </div>
    </Modal>
  );
}
