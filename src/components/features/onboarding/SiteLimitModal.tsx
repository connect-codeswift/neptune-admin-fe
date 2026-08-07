"use client";

import { Modal } from "@/components/ui";
import {
  getSiteLimitMessage,
  getSiteUsagePercent,
  type OrganizationSiteLimitInfo,
} from "@/lib/organization-limits";

type SiteLimitModalProps = Readonly<{
  open: boolean;
  siteInfo: OrganizationSiteLimitInfo;
  onClose: () => void;
  onContactSales?: () => void;
}>;

function DetailRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 text5">
      <span className="text-gray">{label}</span>
      <span className="font-semibold text-darkest">{value}</span>
    </div>
  );
}

export function SiteLimitModal({
  open,
  siteInfo,
  onClose,
  onContactSales,
}: SiteLimitModalProps) {
  const usagePercent = getSiteUsagePercent(siteInfo);

  return (
    <Modal
      open={open}
      title="Site Limit Reached"
      onClose={onClose}
      secondaryLabel="Contact CodeSwift"
      onSecondary={onContactSales ?? onClose}
      primaryLabel="Close"
      onPrimary={onClose}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text6 font-semibold text-gray">Sites Allocated</p>
            <p className="text6 font-semibold text-blue-normal">
              {siteInfo.sitesUsed} of {siteInfo.sitesTotal} used
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[#e8edf3]"
            role="progressbar"
            aria-valuenow={usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Site allocation"
          >
            <div
              className="h-full rounded-full bg-blue-normal transition-[width]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-[#f4f6f9] px-4 py-3">
          <div className="flex flex-col gap-2.5">
            <DetailRow
              label="Sites Used"
              value={`${siteInfo.sitesUsed} / ${siteInfo.sitesTotal}`}
            />
            <DetailRow
              label="Sites Available"
              value={String(siteInfo.sitesAvailable)}
            />
          </div>
        </div>

        <p className="text5 leading-relaxed text-gray">
          {getSiteLimitMessage(siteInfo)}
        </p>
      </div>
    </Modal>
  );
}
