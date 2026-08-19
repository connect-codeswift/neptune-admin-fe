"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  ConfirmDialog,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import { FeatureErrorCard } from "@/components/features/shared";
import type { LimitHistoryRow } from "@/dtos/res/companies.res";
import {
  useOrganizationLimitsHistory,
  useSetOrganizationLimits,
} from "@/hooks/useClientAccountDetail";
import { formatLimitValue } from "@/lib/organization-limits";
import { Skeleton } from "@/components/ui/Skeleton";
import { DetailCard } from "./DetailCard";
import { SetOrganizationLimitsModal } from "./SetOrganizationLimitsModal";

export type ClientOrganizationLimitsPanelProps = Readonly<{
  organizationId: number;
  companyName: string;
  maxSeats?: number | null;
  maxSites?: number | null;
  seatsUsed?: number;
  sitesUsed?: number;
  seatsAvailable?: number | null;
  sitesAvailable?: number | null;
  atSeatLimit?: boolean;
  atSiteLimit?: boolean;
  showHistory?: boolean;
  showActions?: boolean;
  className?: string;
}>;

function DetailMetric({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <div className="min-w-0">
      <p className="text7 tracking-[0.5px] text-ehs-muted-text uppercase">{label}</p>
      <p
        className={`mt-1 text5 font-semibold tabular-nums ${
          accent ? "text-blue-normal" : "text-darkest"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

const HISTORY_COLUMNS: TableColumn<LimitHistoryRow>[] = [
  {
    id: "action",
    header: "Action",
    cell: (row) => (
      <span className="text5 font-semibold text-darkest">{row.action}</span>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {formatDateTime(row.createdAt)}
      </TableTextCell>
    ),
  },
  {
    id: "seats",
    header: "Seats",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {formatLimitValue(row.previousMaxSeats)} →{" "}
        {formatLimitValue(row.newMaxSeats)}
      </TableTextCell>
    ),
  },
  {
    id: "sites",
    header: "Sites",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {formatLimitValue(row.previousMaxSites)} →{" "}
        {formatLimitValue(row.newMaxSites)}
      </TableTextCell>
    ),
  },
  {
    id: "note",
    header: "Note",
    cell: (row) => <TableTextCell>{row.note?.trim() || "—"}</TableTextCell>,
  },
  {
    id: "staff",
    header: "Staff",
    cell: (row) => <TableTextCell>Staff #{row.superAdminId}</TableTextCell>,
  },
];

export type ClientOrganizationLimitsSummaryCardProps = Readonly<{
  organizationId: number;
  companyName: string;
  maxSeats?: number | null;
  maxSites?: number | null;
  seatsUsed?: number;
  sitesUsed?: number;
  seatsAvailable?: number | null;
  sitesAvailable?: number | null;
  atSeatLimit?: boolean;
  atSiteLimit?: boolean;
  showActions?: boolean;
  className?: string;
}>;

/**
 * The four cap figures plus the controls that change them.
 *
 * Split from the history table below it so the Access & Limits tab can put the
 * two summaries side by side and stack the two audit trails full width — the
 * tables need every pixel of the row they are on, the summaries do not.
 */
export function ClientOrganizationLimitsSummaryCard(
  props: Readonly<ClientOrganizationLimitsSummaryCardProps>,
) {
  const {
    organizationId,
    companyName,
    maxSeats = null,
    maxSites = null,
    seatsUsed = 0,
    sitesUsed = 0,
    seatsAvailable = null,
    sitesAvailable = null,
    atSeatLimit = false,
    atSiteLimit = false,
    showActions = true,
    className = "",
  } = props;

  const [editOpen, setEditOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const setLimits = useSetOrganizationLimits(organizationId);
  const hasLimits = maxSeats != null || maxSites != null;

  const handleSave = async (values: {
    maxSeats: number | null;
    maxSites: number | null;
    note: string | null;
  }) => {
    try {
      await setLimits.mutateAsync(values);
      toast.success("Organization limits updated.");
      setEditOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update limits.",
      );
    }
  };

  const handleClear = async () => {
    try {
      await setLimits.mutateAsync({
        maxSeats: null,
        maxSites: null,
        note: "Limits cleared",
      });
      toast.success("Limits cleared — organization is unlimited.");
      setClearOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear limits.",
      );
    }
  };

  return (
    <>
      <DetailCard
        title="Seat & Site Limits"
        description="Caps on users and sites for this organization. Unlimited when not set."
        className={className}
        action={
          showActions ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                Edit Limits
              </Button>
              {hasLimits ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setClearOpen(true)}
                  disabled={setLimits.isPending}
                >
                  Clear Limits
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-2">
          <DetailMetric
            label="Seats used"
            value={
              maxSeats == null
                ? `${seatsUsed} (unlimited)`
                : `${seatsUsed} / ${maxSeats}`
            }
            accent={atSeatLimit}
          />
          <DetailMetric
            label="Seats available"
            value={
              seatsAvailable == null ? "Unlimited" : String(seatsAvailable)
            }
          />
          <DetailMetric
            label="Sites used"
            value={
              maxSites == null
                ? `${sitesUsed} (unlimited)`
                : `${sitesUsed} / ${maxSites}`
            }
            accent={atSiteLimit}
          />
          <DetailMetric
            label="Sites available"
            value={
              sitesAvailable == null ? "Unlimited" : String(sitesAvailable)
            }
          />
        </div>
      </DetailCard>

      <ConfirmDialog
        open={clearOpen}
        title={`Remove both caps for ${companyName}?`}
        description="The organization becomes unlimited: staff can add any number of seats and sites, and nothing will stop them at a threshold. The change is recorded in the limits history."
        confirmLabel="Clear limits"
        cancelLabel="Keep limits"
        loading={setLimits.isPending}
        onCancel={() => setClearOpen(false)}
        onConfirm={() => void handleClear()}
      />

      {editOpen ? (
        <SetOrganizationLimitsModal
          key={`${maxSeats ?? "u"}-${maxSites ?? "u"}`}
          open={editOpen}
          companyName={companyName}
          initialMaxSeats={maxSeats}
          initialMaxSites={maxSites}
          loading={setLimits.isPending}
          onClose={() => setEditOpen(false)}
          onConfirm={(values) => void handleSave(values)}
        />
      ) : null}
    </>
  );
}

export type ClientLimitsHistoryCardProps = Readonly<{
  organizationId: number;
  className?: string;
}>;

/** Audit trail of cap changes. Only mounted where it is shown. */
export function ClientLimitsHistoryCard(
  props: Readonly<ClientLimitsHistoryCardProps>,
) {
  const { organizationId, className = "" } = props;

  const {
    data: history = [],
    isLoading: historyLoading,
    isError: historyError,
    error: historyLoadError,
    refetch: refetchHistory,
  } = useOrganizationLimitsHistory(organizationId, { enabled: true });

  return (
    <DetailCard
      title="Limits History"
      description="Audit trail of cap changes, newest first."
      className={className}
    >
      {historyLoading ? (
        <div
          className="flex flex-col gap-3 py-2"
          role="status"
          aria-busy="true"
          aria-label="Loading limits history…"
        >
          <Skeleton className="h-4 w-40 rounded-md bg-ehs-skeleton-strong" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>
      ) : null}

      {historyError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load limits history"
          message={
            historyLoadError instanceof Error
              ? historyLoadError.message
              : "The audit trail did not load. The caps above are unaffected."
          }
          onRetry={() => {
            void refetchHistory();
          }}
        />
      ) : null}

      {!historyLoading && !historyError ? (
        <Table
          columns={HISTORY_COLUMNS}
          data={history}
          getRowId={(row) => String(row.id)}
          emptyMessage="No cap changes recorded yet — this organization still has the limits it was created with."
        />
      ) : null}
    </DetailCard>
  );
}

/** Summary plus, optionally, the audit trail stacked under it. */
export function ClientOrganizationLimitsPanel(
  props: ClientOrganizationLimitsPanelProps,
) {
  const {
    organizationId,
    companyName,
    maxSeats = null,
    maxSites = null,
    seatsUsed = 0,
    sitesUsed = 0,
    seatsAvailable = null,
    sitesAvailable = null,
    atSeatLimit = false,
    atSiteLimit = false,
    showHistory = false,
    showActions = true,
    className = "",
  } = props;

  return (
    <div className={`flex min-w-0 flex-col gap-3.5 ${className}`.trim()}>
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
        showActions={showActions}
      />

      {showHistory ? (
        <ClientLimitsHistoryCard organizationId={organizationId} />
      ) : null}
    </div>
  );
}
