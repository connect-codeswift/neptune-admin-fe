"use client";

import {
  ClientAccessHistoryCard,
  ClientAccessWindowSummaryCard,
} from "./ClientAccessWindowPanel";
import {
  ClientLimitsHistoryCard,
  ClientOrganizationLimitsSummaryCard,
} from "./ClientOrganizationLimitsPanel";

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

/**
 * Two entitlements — how long the account is good for, and how big it may get.
 *
 * They used to be four full-width slabs in a column: summary, audit table,
 * summary, audit table, so the two figures a staff member actually compares
 * were a screen apart. The current state of both now shares one row, and the
 * two audit trails sit under it, in the order the row above reads.
 */
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
    <div className="flex flex-col gap-3.5">
      {/* Equal halves, both `h-full`, so the two current-state cards line up
          instead of ending at whichever height their metric grid happens to
          reach. */}
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <ClientAccessWindowSummaryCard
          organizationId={organizationId}
          companyName={companyName}
          accessExpiresAt={accessExpiresAt}
          daysRemaining={daysRemaining}
          showActions
          className="h-full"
        />
        <ClientOrganizationLimitsSummaryCard
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
          className="h-full"
        />
      </div>

      {/* Both audit trails are six- and seven-column tables: they get the full
          width rather than half of it, and scroll inside their own card. */}
      <ClientAccessHistoryCard organizationId={organizationId} />
      <ClientLimitsHistoryCard organizationId={organizationId} />
    </div>
  );
}
