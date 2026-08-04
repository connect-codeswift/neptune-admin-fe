"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { DUMMY_ORGANIZATIONS } from "@/lib/dummy-organizations";
import {
  TrialDaysModal,
  type TrialDaysModalMode,
} from "./TrialDaysModal";

type ClientAccount = {
  id: string;
  name: string;
  code: string;
  industry: string;
  contractStart: string;
  status: Extract<TableStatus, "active" | "inactive">;
  sites: number;
  csm: string;
};

const CLIENT_ACCOUNTS: ClientAccount[] = DUMMY_ORGANIZATIONS.map((org) => ({
  id: org.id,
  name: org.name,
  code: org.code,
  industry: org.industry,
  contractStart: org.contractStart,
  status: org.status,
  sites: org.siteCount,
  csm: org.assignedCsm,
}));

const activeCount = DUMMY_ORGANIZATIONS.filter((o) => o.status === "active").length;
const inactiveCount = DUMMY_ORGANIZATIONS.filter(
  (o) => o.status === "inactive",
).length;
const onboardingCount = DUMMY_ORGANIZATIONS.filter((o) =>
  o.subscription.statusLabel.toLowerCase().includes("trial"),
).length;

const KPI_CARDS = [
  {
    value: DUMMY_ORGANIZATIONS.length,
    label: "Total Clients",
    trendLabel: "+3",
    trend: "up" as const,
    data: [1, 1, 2, 2, 2, 3, 3],
  },
  {
    value: onboardingCount,
    label: "Onboarding",
    trendLabel: "+1",
    trend: "up" as const,
    data: [0, 0, 1, 1, 1, 1, onboardingCount],
  },
  {
    value: inactiveCount,
    label: "Inactive",
    trendLabel: "-1",
    trend: "down" as const,
    data: [2, 2, 2, 1, 1, 1, inactiveCount],
  },
  {
    value: activeCount,
    label: "Active Clients",
    trendLabel: "30d",
    trend: "up" as const,
    data: [1, 1, 1, 2, 2, 2, activeCount],
  },
];

type TrialDialogState = {
  mode: TrialDaysModalMode;
  client: ClientAccount;
} | null;

type ClientRowActionHandlers = {
  onStartTrial: (client: ClientAccount) => void;
  onExtendTrial: (client: ClientAccount) => void;
  onOpenOverview: (client: ClientAccount) => void;
};

function ClientNameCell({ row }: Readonly<{ row: ClientAccount }>) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[13.5px] font-semibold text-darkest">
        {row.name}
      </p>
      <p className="truncate text-[11px] text-[#b3bbc8]">{row.code}</p>
    </div>
  );
}

function ClientRowActions({
  client,
  onStartTrial,
  onExtendTrial,
  onOpenOverview,
}: Readonly<{ client: ClientAccount } & ClientRowActionHandlers>) {
  const items: ContextMenuItem[] = [
    {
      id: "open-overview",
      label: "Open Overview",
      icon: "lucide:layout-dashboard",
      onSelect: () => onOpenOverview(client),
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
      id: "industry",
      header: "Industry",
      cell: (row) => <TableTextCell>{row.industry}</TableTextCell>,
    },
    {
      id: "contractStart",
      header: "Contract Start",
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
      id: "csm",
      header: "CSM",
      cell: (row) => <TableTextCell>{row.csm}</TableTextCell>,
    },
    {
      id: "action",
      header: "Action",
      cell: (row) => <ClientRowActions client={row} {...handlers} />,
    },
  ];
}

export function ClientAccountsPage() {
  const router = useRouter();
  const [trialDialog, setTrialDialog] = useState<TrialDialogState>(null);

  const columns = buildColumns({
    onOpenOverview: (client) => router.push(`/client-accounts/${client.id}`),
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
          <Button href="/add-a-company" leftIcon="lucide:plus" size="sm">
            New Client
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => (
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

      <Table
        columns={columns}
        data={CLIENT_ACCOUNTS}
        getRowId={(row) => row.id}
        emptyMessage="No client accounts yet."
      />

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
