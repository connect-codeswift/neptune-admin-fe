"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ContextMenu,
  KpiTrendCard,
  Table,
  TableStatusBadge,
  TableTextCell,
  type ContextMenuItem,
  type TableColumn,
  type TableStatus,
} from "@/components/ui";
import { useSuperAdminCompanies } from "@/hooks/useSuperAdminCompanies";
import {
  buildOrgDashboardPath,
  enterOrganization,
  fetchCompanySites,
} from "@/lib/select-company-flow";
import {
  TrialDaysModal,
  type TrialDaysModalMode,
} from "./TrialDaysModal";

type ClientAccount = {
  id: string;
  name: string;
  activatedModules: string;
  contractStart: string;
  status: Extract<TableStatus, "active" | "inactive">;
  sites: number;
  users: number;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
};

type TrialDialogState = {
  mode: TrialDaysModalMode;
  client: ClientAccount;
} | null;

type ClientRowActionHandlers = {
  onStartTrial: (client: ClientAccount) => void;
  onExtendTrial: (client: ClientAccount) => void;
  onOpenOverview: (client: ClientAccount) => void;
  onOpenDashboard: (client: ClientAccount) => void;
};

function ClientNameCell({ row }: Readonly<{ row: ClientAccount }>) {
  return (
    <div className="min-w-0">
      <p className="truncate text5 font-semibold text-darkest">{row.name}</p>
      <p className="truncate text7 text-[#b3bbc8]">ID {row.id}</p>
      {row.accessExpiresAt && row.daysRemaining != null ? (
        <p className="mt-0.5 truncate text7 text-yellow">
          Access expires in {row.daysRemaining} day
          {row.daysRemaining === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

function ClientRowActions({
  client,
  onStartTrial,
  onExtendTrial,
  onOpenOverview,
  onOpenDashboard,
}: Readonly<{ client: ClientAccount } & ClientRowActionHandlers>) {
  const items: ContextMenuItem[] = [
    {
      id: "open-overview",
      label: "Open Overview",
      icon: "lucide:layout-dashboard",
      onSelect: () => onOpenOverview(client),
    },
    {
      id: "open-dashboard",
      label: "Open Dashboard",
      icon: "lucide:monitor",
      onSelect: () => onOpenDashboard(client),
    },
    {
      id: "start-trial",
      label: "Start Trial",
      icon: "lucide:play",
      onSelect: () => onStartTrial(client),
    },
    {
      id: "extend-trial",
      label: "Extend Trial",
      icon: "lucide:calendar-plus",
      onSelect: () => onExtendTrial(client),
    },
  ];

  return <ContextMenu items={items} label={`Actions for ${client.name}`} />;
}

function buildColumns(
  handlers: ClientRowActionHandlers,
): TableColumn<ClientAccount>[] {
  return [
    {
      id: "client",
      header: "Client",
      cell: (row) => <ClientNameCell row={row} />,
    },
    {
      id: "modules",
      header: "Activated Modules",
      cell: (row) => (
        <TableTextCell muted>{row.activatedModules || "—"}</TableTextCell>
      ),
    },
    {
      id: "contractStart",
      header: "Created",
      cell: (row) => <TableTextCell>{row.contractStart}</TableTextCell>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <TableStatusBadge
          status={row.status}
          label={row.status === "active" ? "Active" : "Inactive"}
        />
      ),
    },
    {
      id: "sites",
      header: "Sites",
      cell: (row) => (
        <TableTextCell>
          {row.sites} {row.sites === 1 ? "site" : "sites"}
        </TableTextCell>
      ),
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => <TableTextCell>{row.users}</TableTextCell>,
    },
    {
      id: "action",
      header: "Action",
      cell: (row) => <ClientRowActions client={row} {...handlers} />,
    },
  ];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ClientAccountsPage() {
  const router = useRouter();
  const [trialDialog, setTrialDialog] = useState<TrialDialogState>(null);
  const {
    data: companies = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSuperAdminCompanies();

  const clientAccounts = useMemo<ClientAccount[]>(
    () =>
      companies.map((company) => ({
        id: String(company.id),
        name: company.name,
        activatedModules: company.activatedModules,
        contractStart: formatDate(company.createdAt),
        status: company.userCount > 0 ? "active" : "inactive",
        sites: company.siteCount,
        users: company.userCount,
        accessExpiresAt: company.accessExpiresAt,
        daysRemaining: company.daysRemaining,
      })),
    [companies],
  );

  const activeCount = clientAccounts.filter((o) => o.status === "active").length;
  const inactiveCount = clientAccounts.length - activeCount;

  const kpiCards = [
    {
      value: clientAccounts.length,
      label: "Total Clients",
      trendLabel: "live",
      trend: "up" as const,
      data: [clientAccounts.length],
    },
    {
      value: clientAccounts.reduce((sum, client) => sum + client.sites, 0),
      label: "Total Sites",
      trendLabel: "live",
      trend: "up" as const,
      data: [clientAccounts.reduce((sum, client) => sum + client.sites, 0)],
    },
    {
      value: inactiveCount,
      label: "Inactive",
      trendLabel: "live",
      trend: "down" as const,
      data: [inactiveCount],
    },
    {
      value: activeCount,
      label: "Active Clients",
      trendLabel: "live",
      trend: "up" as const,
      data: [activeCount],
    },
  ];

  const handleOpenDashboard = async (client: ClientAccount) => {
    try {
      const organizationId = Number(client.id);
      const sites = await fetchCompanySites(organizationId);
      const defaultSiteId = sites[0]?.numericId;
      if (!defaultSiteId) {
        toast.error("This organization has no sites yet.");
        return;
      }

      await enterOrganization({
        organizationId,
        organizationName: client.name,
        siteId: defaultSiteId,
      });
      router.push(buildOrgDashboardPath(organizationId, defaultSiteId));
    } catch (openError) {
      toast.error(
        openError instanceof Error
          ? openError.message
          : "Failed to open organization dashboard.",
      );
    }
  };

  const columns = buildColumns({
    onOpenOverview: (client) =>
      router.push(`/super/client-accounts/${client.id}`),
    onOpenDashboard: (client) => void handleOpenDashboard(client),
    onStartTrial: (client) => setTrialDialog({ mode: "start", client }),
    onExtendTrial: (client) => setTrialDialog({ mode: "extend", client }),
  });

  const dialogKey = trialDialog
    ? `${trialDialog.mode}-${trialDialog.client.id}`
    : "closed";

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Client Accounts"
        description="All organizations provisioned on Neptune EHSS"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:refresh-cw"
              onClick={() => void refetch()}
            >
              Refresh
            </Button>
            <Button href="/super/add-a-company" leftIcon="lucide:plus" size="sm">
              New Client
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiTrendCard
            key={card.label}
            value={card.value}
            label={card.label}
            data={card.data}
            trendLabel={card.trendLabel}
            trend={card.trend}
          />
        ))}
      </div>

      {isLoading ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading client accounts…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error ? error.message : "Failed to load clients."}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <Table
          columns={columns}
          data={clientAccounts}
          getRowId={(row) => row.id}
          emptyMessage="No client accounts yet."
        />
      ) : null}

      <TrialDaysModal
        key={dialogKey}
        open={trialDialog !== null}
        mode={trialDialog?.mode ?? "start"}
        clientName={trialDialog?.client.name ?? ""}
        onClose={() => setTrialDialog(null)}
        onConfirm={(days) => {
          if (!trialDialog) return;
          const action =
            trialDialog.mode === "start" ? "started" : "extended";
          toast.success(
            `Trial ${action} for ${trialDialog.client.name} (${days} days).`,
          );
          setTrialDialog(null);
        }}
      />
    </div>
  );
}
