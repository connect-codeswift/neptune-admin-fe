"use client";

import { ClientAccessWindowPanel } from "./ClientAccessWindowPanel";
import { ClientOrganizationLimitsPanel } from "./ClientOrganizationLimitsPanel";

type ClientSubscriptionTabProps = Readonly<{
  organizationId: number;
  companyName: string;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
  maxSeats?: number | null;
  maxSites?: number | null;
  seatsUsed?: number;
  sitesUsed?: number;
  seatsAvailable?: number | null;
  sitesAvailable?: number | null;
  atSeatLimit?: boolean;
  atSiteLimit?: boolean;
}>;

export function ClientSubscriptionTab(props: ClientSubscriptionTabProps) {
  const {
    organizationId,
    companyName,
    accessExpiresAt,
    daysRemaining,
    maxSeats,
    maxSites,
    seatsUsed,
    sitesUsed,
    seatsAvailable,
    sitesAvailable,
    atSeatLimit,
    atSiteLimit,
  } = props;

  return (
    <div className="flex flex-col gap-5">
      <ClientAccessWindowPanel
        organizationId={organizationId}
        companyName={companyName}
        accessExpiresAt={accessExpiresAt}
        daysRemaining={daysRemaining}
        showHistory
      />
      <ClientOrganizationLimitsPanel
        organizationId={organizationId}
        companyName={companyName}
        maxSeats={maxSeats}
        maxSites={maxSites}
        seatsUsed={seatsUsed}
        sitesUsed={sitesUsed}
        seatsAvailable={seatsAvailable}
        sitesAvailable={sitesAvailable}
        atSeatLimit={atSeatLimit}
        atSiteLimit={atSiteLimit}
        showHistory
      />
    </div>
  );
}
