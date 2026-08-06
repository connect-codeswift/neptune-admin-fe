"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { LimitHistoryRow } from "@/dtos/res/companies.res";
import {
  useOrganizationLimitsHistory,
  useSetOrganizationLimits,
} from "@/hooks/useClientAccountDetail";
import { formatLimitValue } from "@/lib/organization-limits";
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
}>;

function DetailMetric({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <div className="min-w-0">
      <p className="text7 tracking-[0.5px] text-[#8892a3] uppercase">{label}</p>
      <p
        className={`mt-1 text5 font-semibold ${
          accent ? "text-blue-normal" : "text-darkest"
        }`}
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
    cell: (row) => <TableTextCell>{formatDateTime(row.createdAt)}</TableTextCell>,
  },
  {
    id: "seats",
    header: "Seats",
    cell: (row) => (
      <TableTextCell>
        {formatLimitValue(row.previousMaxSeats)} →{" "}
        {formatLimitValue(row.newMaxSeats)}
      </TableTextCell>
    ),
  },
  {
    id: "sites",
    header: "Sites",
    cell: (row) => (
      <TableTextCell>
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

export function ClientOrganizationLimitsPanel({
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
}: ClientOrganizationLimitsPanelProps) {
  const [editOpen, setEditOpen] = useState(false);
  const setLimits = useSetOrganizationLimits(organizationId);
  const { data: history = [], isLoading: historyLoading } =
    useOrganizationLimitsHistory(organizationId, { enabled: showHistory });

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
              {(maxSeats != null || maxSites != null) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleClear()}
                  disabled={setLimits.isPending}
                >
                  Clear Limits
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      {showHistory ? (
        <DetailCard
          title="Limits History"
          description="Audit trail of cap changes, newest first."
        >
          {historyLoading ? (
            <p className="text5 text-gray">Loading history…</p>
          ) : (
            <Table
              columns={HISTORY_COLUMNS}
              data={history}
              getRowId={(row) => String(row.id)}
              emptyMessage="No limit changes recorded yet."
            />
          )}
        </DetailCard>
      ) : null}

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
