"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchInput, SelectInput } from "@/components/inputs";
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
import {
  useSuperAdminUserStats,
  useSuperAdminUsers,
} from "@/hooks/useSuperAdminUsers";
import type { UserListItem } from "@/lib/mappers/users.mapper";
import {
  buildOrgSitePath,
  getAllSitesOfThisOrg,
} from "@/lib/org-sites";
import {
  buildOrgSiteBasePath,
  parseOrgSitePath,
} from "@/lib/sidebar-items";
import { SubscriptionSeatLimitModal } from "./SubscriptionSeatLimitModal";
import { useSubscriptionSeats } from "./useSubscriptionSeats";

const PAGE_SIZE = 20;

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

function buildColumns(
  basePath: string,
  onView: (user: UserListItem) => void,
  onEdit: (user: UserListItem) => void,
): TableColumn<UserListItem>[] {
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
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/user-management`
    : "/user-management";

  const siteOptions = useMemo(() => {
    const sites = orgSite ? getAllSitesOfThisOrg(orgSite.company) : [];
    return [
      { value: "", label: "All sites" },
      ...sites.map((site) => ({ value: site.id, label: site.name })),
    ];
  }, [orgSite]);

  const siteId = siteFilter ? Number(siteFilter) : undefined;

  const {
    data: usersPage,
    isLoading,
    isError,
    error,
  } = useSuperAdminUsers({
    siteId: Number.isFinite(siteId) ? siteId : undefined,
    search,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const { data: stats } = useSuperAdminUserStats(
    Number.isFinite(siteId) ? siteId : undefined,
  );

  const users = usersPage?.users ?? [];
  const totalRecords = usersPage?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

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

  const handleSiteFilterChange = (value: string) => {
    setSiteFilter(value);
    setPageNumber(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="User Management"
        description={
          stats
            ? `${stats.total} users across all departments and sites`
            : "Manage users for the selected organization"
        }
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
        <StatCard value={stats?.total ?? 0} label="Total Users" />
        <StatCard value={stats?.active ?? 0} label="Active" />
        <StatCard value={stats?.pendingSetup ?? 0} label="Pending Setup" />
        <StatCard value={stats?.suspended ?? 0} label="Suspended" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput
          placeholder="Search by name or email…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          aria-label="Search users"
        />
        <SelectInput
          label="Site"
          options={siteOptions}
          value={siteFilter}
          onChange={handleSiteFilterChange}
        />
      </div>

      {isLoading ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading users…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error ? error.message : "Failed to load users."}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Table
            columns={columns}
            data={users}
            getRowId={(row) => row.id}
            emptyMessage="No users found."
          />

          {totalRecords > PAGE_SIZE ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text6 text-gray">
                Page {pageNumber} of {totalPages} · {totalRecords} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

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
