"use client";

import { FeatureEmptyState, FeatureErrorCard, FeatureLoadingCard } from "@/components/features/shared";
import {
  Table,
  TableRoleBadge,
  TableStatusBadge,
  TableUserCell,
  type TableColumn,
} from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { useSuperAdminUsers } from "@/hooks/useSuperAdminUsers";
import type { UserListItem } from "@/lib/mappers/users.mapper";

type SiteUsersTabProps = Readonly<{
  siteId: number;
}>;

function buildColumns(): TableColumn<UserListItem>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <TableUserCell name={row.name} email={row.email} initials={row.initials} />
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => <TableRoleBadge>{row.role}</TableRoleBadge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <TableStatusBadge status={row.status} />,
    },
  ];
}

const columns = buildColumns();

/**
 * Users assigned to one site, scoped by `siteId` rather than the app's
 * currently selected site — `useSuperAdminUsers` already keys its query on
 * `siteId`, so this asks it directly instead of reading the tenant context.
 */
export function SiteUsersTab({ siteId }: SiteUsersTabProps) {
  const { data, isLoading, isError, error, refetch } = useSuperAdminUsers({
    siteId,
  });
  const users = data?.users ?? [];
  const hasData = !isLoading && !isError;

  return (
    <div className={`${GLASS_SURFACE} flex flex-col gap-4 p-5`}>
      {isLoading ? <FeatureLoadingCard label="Loading users…" /> : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load users"
          message={
            error instanceof Error
              ? error.message
              : "The user list did not load. Check your connection and try again."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {hasData && users.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="mdi:account-off-outline"
          title="No users at this site"
          description="No users are currently assigned to this site."
        />
      ) : null}

      {hasData && users.length > 0 ? (
        <Table
          columns={columns}
          data={users}
          getRowId={(row) => row.id}
          className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
        />
      ) : null}
    </div>
  );
}
