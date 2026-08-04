"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  Table,
  TableRoleBadge,
  TableRowActions,
  TableStatusBadge,
  TableTextCell,
  TableUserCell,
  type TableColumn,
} from "@/components/ui";
import { DUMMY_USERS, getUserStats, type DummyUser } from "@/lib/dummy-users";
import {
  buildOrgSiteBasePath,
  parseOrgSitePath,
} from "@/lib/sidebar-items";
import { SubscriptionSeatLimitModal } from "./SubscriptionSeatLimitModal";
import { useSubscriptionSeats } from "./useSubscriptionSeats";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-xl backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

function buildColumns(
  basePath: string,
  onView: (user: DummyUser) => void,
  onEdit: (user: DummyUser) => void,
): TableColumn<DummyUser>[] {
  return [
    {
      id: "user",
      header: "User",
      cell: (row) => (
        <TableUserCell
          name={row.name}
          email={row.email}
          initials={row.initials}
        />
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => <TableRoleBadge>{row.role}</TableRoleBadge>,
    },
    {
      id: "department",
      header: "Department",
      cell: (row) => <TableTextCell>{row.department}</TableTextCell>,
    },
    {
      id: "site",
      header: "Site",
      cell: (row) => <TableTextCell>{row.site}</TableTextCell>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <TableStatusBadge status={row.status} />,
    },
    {
      id: "lastLogin",
      header: "Last Login",
      cell: (row) => <TableTextCell muted>{row.lastLogin}</TableTextCell>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-20",
      className: "w-20",
      cell: (row) => (
        <TableRowActions
          viewHref={`${basePath}/${row.id}`}
          editHref={`${basePath}/${row.id}/edit`}
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
        />
      ),
    },
  ];
}

export function UserManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const { atSeatLimit, seatInfo } = useSubscriptionSeats();
  const [seatLimitModalOpen, setSeatLimitModalOpen] = useState(false);
  const adminHref = orgSite
    ? buildOrgSiteBasePath(orgSite.company, orgSite.site)
    : "/dashboard";
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/user-management`
    : "/user-management";

  const stats = getUserStats(DUMMY_USERS);

  const columns = buildColumns(
    basePath,
    (user) => router.push(`${basePath}/${user.id}`),
    (user) => router.push(`${basePath}/${user.id}/edit`),
  );

  const handleAddUser = () => {
    if (atSeatLimit && seatInfo) {
      setSeatLimitModalOpen(true);
      return;
    }
    router.push(`${basePath}/new`);
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="User Management"
        description={`${stats.total} users across all departments and sites`}
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "User Management" },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:upload"
              onClick={() => toast.success("Import started.")}
            >
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:download"
              onClick={() => toast.success("Export started.")}
            >
              Export
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:plus"
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard value={stats.total} label="Total Users" />
        <StatCard value={stats.active} label="Active" />
        <StatCard value={stats.pendingSetup} label="Pending Setup" />
        <StatCard value={stats.suspended} label="Suspended" />
      </div>

      <Table
        columns={columns}
        data={DUMMY_USERS}
        getRowId={(row) => row.id}
        emptyMessage="No users found."
      />

      {seatInfo ? (
        <SubscriptionSeatLimitModal
          open={seatLimitModalOpen}
          seatInfo={seatInfo}
          onClose={() => setSeatLimitModalOpen(false)}
          onContactSales={() => {
            toast.info("Sales team will contact you shortly.");
            setSeatLimitModalOpen(false);
          }}
          onManageSubscription={() => {
            toast.info("Opening subscription management.");
            setSeatLimitModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
