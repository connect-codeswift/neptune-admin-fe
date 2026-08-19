"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { AccessHistoryRow } from "@/dtos/res/companies.res";
import {
  useClearAccessWindow,
  useCompanyAccessHistory,
  useSetAccessWindow,
} from "@/hooks/useClientAccountDetail";
import { FeatureErrorCard } from "@/components/features/shared";
import { Skeleton } from "@/components/ui/Skeleton";
import { DetailCard } from "./DetailCard";
import {
  TrialDaysModal,
  type TrialDaysModalMode,
} from "./TrialDaysModal";
import {
  GrantFullAccessModal,
  type FullAccessGrantChoice,
} from "./GrantFullAccessModal";

export type ClientAccessWindowPanelProps = Readonly<{
  organizationId: number;
  companyName: string;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
  showHistory?: boolean;
  showActions?: boolean;
  /** Stacks the three metrics for a narrow column, e.g. the Overview rail. */
  dense?: boolean;
  className?: string;
}>;

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

function accessStatusLabel(
  accessExpiresAt?: string | null,
  daysRemaining?: number | null,
): string {
  if (!accessExpiresAt) return "Permanent access";
  if (daysRemaining != null && daysRemaining >= 0) {
    if (daysRemaining === 0) return "Final day of access";
    return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
  }
  return "Access expired";
}

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

const HISTORY_COLUMNS: TableColumn<AccessHistoryRow>[] = [
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
    id: "previous",
    header: "Previous expiry",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {formatDateTime(row.previousExpiresAt)}
      </TableTextCell>
    ),
  },
  {
    id: "new",
    header: "New expiry",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {formatDateTime(row.newExpiresAt)}
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

export function ClientAccessWindowActions({
  organizationId,
  companyName,
  accessExpiresAt,
  daysRemaining,
  size = "sm",
}: Readonly<{
  organizationId: number;
  companyName: string;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
  size?: "sm" | "md";
}>) {
  const hasWindow = Boolean(accessExpiresAt);
  const [trialDialogMode, setTrialDialogMode] =
    useState<TrialDaysModalMode>("start");
  const [trialDialogOpen, setTrialDialogOpen] = useState(false);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);

  const setAccessWindow = useSetAccessWindow(organizationId);
  const clearAccessWindow = useClearAccessWindow(organizationId);
  const accessMutationPending =
    setAccessWindow.isPending || clearAccessWindow.isPending;

  const openTrialDialog = (mode: TrialDaysModalMode) => {
    setTrialDialogMode(mode);
    setTrialDialogOpen(true);
  };

  const handleSetAccessWindow = async (days: number) => {
    try {
      await setAccessWindow.mutateAsync({ days });
      toast.success(
        hasWindow
          ? `Access window updated for ${companyName} (${days} days from now).`
          : `Trial started for ${companyName} (${days} days from now).`,
      );
      setTrialDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to set access window.",
      );
    }
  };

  const handleGrantFullAccess = async (choice: FullAccessGrantChoice) => {
    try {
      if (choice.kind === "permanent") {
        await clearAccessWindow.mutateAsync();
        toast.success(`${companyName} now has permanent access.`);
      } else if (choice.kind === "days") {
        await setAccessWindow.mutateAsync({ days: choice.days });
        toast.success(
          `${companyName} granted ${choice.label} of access (${choice.days} days from now).`,
        );
      } else {
        await setAccessWindow.mutateAsync({ expiresAt: choice.expiresAt });
        toast.success(
          `${companyName} granted ${choice.label} of access (until ${formatDateTime(choice.expiresAt)}).`,
        );
      }
      setGrantDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update access.",
      );
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasWindow ? (
          <Button
            type="button"
            variant="secondary"
            size={size}
            onClick={() => openTrialDialog("extend")}
          >
            Extend trial
          </Button>
        ) : (
          <Button
            type="button"
            size={size}
            leftIcon="lucide:play"
            onClick={() => openTrialDialog("start")}
          >
            Start trial
          </Button>
        )}
        {hasWindow ? (
          <Button
            type="button"
            variant="secondary"
            size={size}
            leftIcon="lucide:badge-check"
            onClick={() => setGrantDialogOpen(true)}
          >
            Grant full access
          </Button>
        ) : null}
      </div>

      {trialDialogOpen ? (
        <TrialDaysModal
          open
          mode={trialDialogMode}
          clientName={companyName}
          loading={setAccessWindow.isPending}
          onClose={() => setTrialDialogOpen(false)}
          onConfirm={(days) => void handleSetAccessWindow(days)}
        />
      ) : null}

      {grantDialogOpen ? (
        <GrantFullAccessModal
          open
          clientName={companyName}
          loading={accessMutationPending}
          onClose={() => setGrantDialogOpen(false)}
          onConfirm={(choice) => void handleGrantFullAccess(choice)}
        />
      ) : null}
    </>
  );
}

export type ClientAccessWindowSummaryCardProps = Readonly<{
  organizationId: number;
  companyName: string;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
  showActions?: boolean;
  dense?: boolean;
  className?: string;
}>;

/**
 * The three access facts, on their own card.
 *
 * Split out from the panel below so a caller can place the summary and the
 * audit trail in different parts of a grid — the Access & Limits tab pairs
 * this with the seat/site caps on one row and drops both history tables full
 * width underneath, which a single stacked panel could not express.
 */
export function ClientAccessWindowSummaryCard(
  props: Readonly<ClientAccessWindowSummaryCardProps>,
) {
  const {
    organizationId,
    companyName,
    accessExpiresAt,
    daysRemaining,
    showActions = false,
    dense = false,
    className = "",
  } = props;

  const hasWindow = Boolean(accessExpiresAt);

  // Sonar S3358: the two conditions read as `if`/`else if` rather than one
  // ternary nested inside another.
  let daysRemainingLabel = "—";
  if (hasWindow && daysRemaining != null) {
    daysRemainingLabel = String(daysRemaining);
  }

  // A rail column is nowhere near wide enough for three columns of timestamp,
  // so the dense variant stacks them instead of letting each value wrap twice.
  const metricsClassName = dense
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 gap-4 sm:grid-cols-3";

  return (
    <DetailCard
      title="Access Window"
      description="Trial and time-boxed access for this company."
      className={className}
      action={
        showActions ? (
          <ClientAccessWindowActions
            organizationId={organizationId}
            companyName={companyName}
            accessExpiresAt={accessExpiresAt}
            daysRemaining={daysRemaining}
          />
        ) : null
      }
    >
      <div className={metricsClassName}>
        <DetailMetric
          label="Status"
          value={accessStatusLabel(accessExpiresAt, daysRemaining)}
          accent={hasWindow}
        />
        <DetailMetric
          label="Access expires"
          value={hasWindow ? formatDateTime(accessExpiresAt) : "Permanent"}
        />
        <DetailMetric label="Days remaining" value={daysRemainingLabel} />
      </div>
    </DetailCard>
  );
}

export type ClientAccessHistoryCardProps = Readonly<{
  organizationId: number;
  className?: string;
}>;

/** Audit trail for the access window. Only mounted where it is shown. */
export function ClientAccessHistoryCard(
  props: Readonly<ClientAccessHistoryCardProps>,
) {
  const { organizationId, className = "" } = props;

  const {
    data: history = [],
    isLoading: historyLoading,
    isError: historyError,
    error: historyLoadError,
    refetch: refetchHistory,
  } = useCompanyAccessHistory(organizationId, { enabled: true });

  return (
    <DetailCard
      title="Access History"
      description="Audit trail of trial grants, updates, and conversions to permanent access."
      className={className}
    >
      {historyLoading ? (
        <div
          className="flex flex-col gap-3 py-2"
          role="status"
          aria-busy="true"
          aria-label="Loading access history…"
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
          title="Couldn’t load access history"
          message={
            historyLoadError instanceof Error
              ? historyLoadError.message
              : "The audit trail did not load. The access window above is unaffected."
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
          emptyMessage="No access history yet."
          className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
        />
      ) : null}
    </DetailCard>
  );
}

/** Summary plus, optionally, the audit trail stacked under it. */
export function ClientAccessWindowPanel({
  organizationId,
  companyName,
  accessExpiresAt,
  daysRemaining,
  showHistory = false,
  showActions = false,
  dense = false,
  className = "",
}: ClientAccessWindowPanelProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-3.5 ${className}`.trim()}>
      <ClientAccessWindowSummaryCard
        organizationId={organizationId}
        companyName={companyName}
        accessExpiresAt={accessExpiresAt}
        daysRemaining={daysRemaining}
        showActions={showActions}
        dense={dense}
      />

      {showHistory ? (
        <ClientAccessHistoryCard organizationId={organizationId} />
      ) : null}
    </div>
  );
}
