"use client";

import { toast } from "sonner";
import {
  Table,
  TableIconAction,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { ClientAccountDetail, ClientSite } from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

const COLUMNS: TableColumn<ClientSite>[] = [
  {
    id: "name",
    header: "Site Name",
    cell: (row) => (
      <span className="text5 font-semibold text-darkest">{row.name}</span>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: (row) => <TableTextCell>{row.type}</TableTextCell>,
  },
  {
    id: "address",
    header: "Address",
    cell: (row) => <TableTextCell muted>{row.address}</TableTextCell>,
  },
  {
    id: "timezone",
    header: "Timezone",
    cell: (row) => <TableTextCell>{row.timezone}</TableTextCell>,
  },
  {
    id: "departments",
    header: "Departments",
    cell: (row) => (
      <TableTextCell>{row.departmentCount} Departments</TableTextCell>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <TableStatusBadge status={row.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: (row) => (
      <TableIconAction
        label={`Edit ${row.name}`}
        icon="lucide:pencil"
        onClick={() =>
          toast.message(`Edit site “${row.name}” is not wired yet.`)
        }
      />
    ),
  },
];

export function ClientSitesTab({
  client,
}: Readonly<{ client: ClientAccountDetail }>) {
  return (
    <DetailCard
      title="Sites & Locations"
      description={`${client.sites.length} sites registered`}
    >
      <Table
        columns={COLUMNS}
        data={client.sites}
        getRowId={(row) => row.id}
        emptyMessage="No sites registered."
        className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
      />
    </DetailCard>
  );
}
