"use client";

import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  Button,
  Table,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
  type TableStatus,
} from "@/components/ui";
import {
  getSubscriptionStatusLabel,
  type Subscription,
  type SubscriptionStatus,
} from "@/lib/dummy-subscriptions";

type SubscriptionsTableProps = Readonly<{
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onCreate: () => void;
}>;

const STATUS_TO_TABLE_STATUS: Record<SubscriptionStatus, TableStatus> = {
  draft: "pending",
  pending: "pending",
  active: "active",
  expired: "inactive",
  cancelled: "inactive",
};

function buildColumns(
  onEdit: (subscription: Subscription) => void,
): TableColumn<Subscription>[] {
  return [
    {
      id: "client",
      header: "Client",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text5 font-semibold text-darkest">
            {row.organizationName}
          </p>
          <p className="truncate text7 text-gray">
            {row.modules.length} module{row.modules.length === 1 ? "" : "s"} ·{" "}
            {row.siteCount} site{row.siteCount === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => (
        <TableTextCell>{row.licensedUsers.toLocaleString()}</TableTextCell>
      ),
    },
    {
      id: "term",
      header: "Term",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text5 text-darkest">{row.termStart}</p>
          <p className="truncate text7 text-gray">to {row.termEnd}</p>
        </div>
      ),
    },
    {
      id: "value",
      header: "Yearly Value",
      cell: (row) => (
        <TableTextCell>${row.yearlyTotal.toLocaleString()}/yr</TableTextCell>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <TableStatusBadge
          status={STATUS_TO_TABLE_STATUS[row.status]}
          label={getSubscriptionStatusLabel(row.status)}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "w-28",
      className: "w-28",
      cell: (row) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onEdit(row)}
        >
          Edit
        </Button>
      ),
    },
  ];
}

export function SubscriptionsTable({
  subscriptions,
  onEdit,
  onCreate,
}: SubscriptionsTableProps) {
  const columns = buildColumns(onEdit);

  return (
    <DetailCard
      title="Client Subscriptions"
      description="One yearly contract per client. Prices are frozen at signing, so rate card changes only affect new subscriptions."
    >
      {subscriptions.length === 0 ? (
        <div className="rounded-[20px] border border-darkest/8 bg-white/80 px-5 py-8 text-center">
          <p className="text5 text-gray">
            No subscriptions yet. Create one for an onboarded client.
          </p>
          <Button
            type="button"
            size="sm"
            leftIcon="lucide:plus"
            className="mt-4"
            onClick={onCreate}
          >
            Create Subscription
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          data={subscriptions}
          getRowId={(row) => row.id}
          emptyMessage="No subscriptions yet."
        />
      )}
    </DetailCard>
  );
}
