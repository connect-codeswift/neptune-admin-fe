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
    cell: (row) => <TableTextCell>{formatDateTime(row.createdAt)}</TableTextCell>,
  },
  {
    id: "previous",
    header: "Previous expiry",
    cell: (row) => (
      <TableTextCell>{formatDateTime(row.previousExpiresAt)}</TableTextCell>
    ),
  },
  {
    id: "new",
    header: "New expiry",
    cell: (row) => (
      <TableTextCell>{formatDateTime(row.newExpiresAt)}</TableTextCell>
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

export function ClientAccessWindowPanel({
  organizationId,
  companyName,
  accessExpiresAt,
  daysRemaining,
  showHistory = false,
  showActions = false,
}: ClientAccessWindowPanelProps) {
  const hasWindow = Boolean(accessExpiresAt);

  const {
    data: history = [],
    isLoading: historyLoading,
    isError: historyError,
    error: historyLoadError,
  } = useCompanyAccessHistory(organizationId, { enabled: showHistory });

  return (
    <div className="flex flex-col gap-5">
      <DetailCard
        title="Access Window"
        description="Trial and time-boxed access for this company."
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DetailMetric
            label="Status"
            value={accessStatusLabel(accessExpiresAt, daysRemaining)}
            accent={hasWindow}
          />
          <DetailMetric
            label="Access expires"
            value={hasWindow ? formatDateTime(accessExpiresAt) : "Permanent"}
          />
          <DetailMetric
            label="Days remaining"
            value={
              !hasWindow
                ? "—"
                : daysRemaining != null
                  ? String(daysRemaining)
                  : "—"
            }
          />
        </div>
      </DetailCard>

      {showHistory ? (
        <DetailCard
          title="Access History"
          description="Audit trail of trial grants, updates, and conversions to permanent access."
        >
          {historyLoading ? (
            <p className="py-8 text-center text5 text-gray">Loading history…</p>
          ) : null}

          {historyError ? (
            <p className="py-8 text-center text5 text-red">
              {historyLoadError instanceof Error
                ? historyLoadError.message
                : "Failed to load access history."}
            </p>
          ) : null}

          {!historyLoading && !historyError ? (
            <Table
              columns={HISTORY_COLUMNS}
              data={history}
              getRowId={(row) => String(row.id)}
              emptyMessage="No access history yet."
              className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
            />
          ) : null}
        </DetailCard>
      ) : null}
    </div>
  );
}
