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

const KPI_CARDS = [
  {
    value: 5,
    label: "Total Clients",
    trendLabel: "+5",
    trend: "up" as const,
    data: [2, 3, 3, 4, 4, 5, 5],
  },
  {
    value: 2,
    label: "Onboarding",
    trendLabel: "+5",
    trend: "up" as const,
    data: [1, 1, 2, 2, 1, 2, 2],
  },
  {
    value: 2,
    label: "Inactive",
    trendLabel: "-2",
    trend: "down" as const,
    data: [4, 4, 3, 3, 3, 2, 2],
  },
  {
    value: 4,
    label: "Active Clients",
    trendLabel: "30d",
    trend: "up" as const,
    data: [2, 2, 3, 3, 3, 4, 4],
  },
];

const CLIENT_ACCOUNTS: ClientAccount[] = [
  {
    id: "1",
    name: "Meridian Chemical Co.",
    code: "CL-001",
    industry: "Chemical Manufacturing",
    contractStart: "2026-03-01",
    status: "active",
    sites: 3,
    csm: "Rachel Torres",
  },
  {
    id: "2",
    name: "1X Technologies",
    code: "CL-002",
    industry: "Oil & Gas",
    contractStart: "2025-11-15",
    status: "active",
    sites: 7,
    csm: "James Okafor",
  },
  {
    id: "3",
    name: "Harrington Logistics",
    code: "CL-003",
    industry: "Transportation & Warehousing",
    contractStart: "2026-05-20",
    status: "inactive",
    sites: 2,
    csm: "Rachel Torres",
  },
  {
    id: "4",
    name: "Vantage Construction LLC",
    code: "CL-004",
    industry: "Construction",
    contractStart: "2026-01-10",
    status: "active",
    sites: 4,
    csm: "Marcus Webb",
  },
  {
    id: "5",
    name: "BlueCrest Pharma",
    code: "CL-005",
    industry: "Pharmaceutical",
    contractStart: "2026-06-01",
    status: "inactive",
    sites: 1,
    csm: "Priya Mehta",
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
