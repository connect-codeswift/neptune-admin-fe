"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ModuleFilterBar,
  ModuleSearchBar,
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
  Table,
  TableHeaderBar,
  TableRoleBadge,
  ViewModeToggle,
  type ViewMode,
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
import { useClientAccountDetail } from "@/hooks/useClientAccountDetail";
import type { UserListItem } from "@/lib/mappers/users.mapper";
import { toSeatLimitInfo } from "@/lib/organization-limits";
import {
  buildOrgSitePath,
  getAllSitesOfThisOrg,
} from "@/lib/org-sites";
import {
  buildOrgSiteBasePath,
  parseOrgSitePath,
} from "@/lib/sidebar-items";
import { UserCard } from "@/components/cards";
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
import { SubscriptionSeatLimitModal } from "./SubscriptionSeatLimitModal";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { GLASS_SURFACE, GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 20;

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <GlassCard className="min-h-24 justify-center px-5 py-4">
      {/* One wrapper child so GlassCard's own `gap` never separates the value
          from its label — the 4px `mt-1` below is the intended spacing. */}
      <div className="min-w-0">
        {/* text2 is the KPI role: same 30px figure the rest of the app's stat
            tiles use, and it carries tabular-nums so the four numbers line up
            column-to-column as they change. */}
        <p className="text2 text-darkest">{value}</p>
        <p className="mt-1 text8 text-gray">{label}</p>
      </div>
    </GlassCard>
  );
}

/**
 * A stand-in shaped like the users table rather than a stack of grey bars: the
 * avatar disc, the two-line identity, the badge pills and the action squares
 * all land where the real row will land, so nothing jumps when the query
 * resolves.
 */
function UsersTableSkeleton() {
  const rows = Array.from({ length: 6 }, (_, index) => `user-row-${String(index)}`);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading users…"
      className={`${GLASS_SURFACE} min-w-0 overflow-hidden`}
    >
      <div className="overflow-x-auto">
        <div className="min-w-240">
          <div className="border-b border-ehs-border/40 px-4 py-3.5">
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
          {rows.map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 border-b border-ehs-border/45 px-4 py-4 last:border-b-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-2.5 bg-ehs-skeleton-strong" />
              <div className="flex w-56 shrink-0 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-36 rounded-md bg-ehs-skeleton-strong" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
              <Skeleton className="h-5 w-24 shrink-0 rounded-md" />
              <Skeleton className="h-3.5 w-40 shrink-0 rounded-md" />
              <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A control that is deliberately inert, and says so. The reason lives in
 * `title` for a pointer and in an `sr-only` span for a reader — a disabled
 * button takes `pointer-events: none`, so its own tooltip would never fire, and
 * it is not in the tab order for the reason to be reached any other way.
 */
function ComingSoonAction({
  icon,
  label,
  reason,
}: Readonly<{ icon: string; label: string; reason: string }>) {
  return (
    <span title={reason}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={icon}
        disabled
        className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
      >
        {label}
        <span className="sr-only"> — {reason}</span>
      </Button>
    </span>
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
      // TableUserCell already truncates both lines; the title puts the full
      // name and address back within reach for the ones that get cut.
      cell: (row) => (
        <div title={`${row.name} · ${row.email}`}>
          <TableUserCell
            name={row.name}
            email={row.email}
            initials={row.initials}
          />
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => <TableRoleBadge>{row.role}</TableRoleBadge>,
    },
    {
      id: "site",
      header: "Sites",
      cell: (row) => {
        const siteNames = row.sites.join(", ");
        return (
          // `title` because a user on eight sites is a very long cell and the
          // list is the only place the full set is visible.
          <span
            className="block max-w-60 truncate"
            title={siteNames || undefined}
          >
            <TableTextCell>{siteNames || "—"}</TableTextCell>
          </span>
        );
      },
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
        // Labels name the row, not just the verb: a screen reader hitting six
        // "Edit" buttons in a column learns nothing from the sixth.
        <TableRowActions
          viewHref={`${basePath}/${row.id}`}
          editHref={`${basePath}/${row.id}/edit`}
          viewLabel={`View ${row.name}`}
          editLabel={`Edit ${row.name}`}
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
  const organizationId = orgSite ? Number(orgSite.company) : undefined;
  const { data: company } = useClientAccountDetail(
    Number.isFinite(organizationId) && organizationId! > 0
      ? organizationId
      : undefined,
  );
  const seatInfo = company ? toSeatLimitInfo(company) : null;
  const atSeatLimit = company?.atSeatLimit ?? false;
  const [seatLimitModalOpen, setSeatLimitModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  // Table is the default: it is the denser view and the one the column set was
  // designed for. The choice is per-visit — it is not persisted anywhere.
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/users`
    : "/users";

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
    refetch,
  } = useSuperAdminUsers({
    siteId: Number.isFinite(siteId) ? siteId : undefined,
    search,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const { data: stats, isLoading: statsLoading } = useSuperAdminUserStats(
    Number.isFinite(siteId) ? siteId : undefined,
  );

  const users = usersPage?.users ?? [];
  const totalRecords = usersPage?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const firstShown = totalRecords === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(pageNumber * PAGE_SIZE, totalRecords);

  // The one distinction the old empty row could not make: a directory with
  // nobody in it, versus a directory whose search and site filter happen to
  // exclude everybody. The second is a dead end unless it hands back a way out.
  const filtersActive = Boolean(search.trim()) || Boolean(siteFilter);

  const handleViewUser = (user: UserListItem) => {
    router.push(`${basePath}/${user.id}`);
  };

  const handleEditUser = (user: UserListItem) => {
    router.push(`${basePath}/${user.id}/edit`);
  };

  const columns = buildColumns(basePath, handleViewUser, handleEditUser);

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

  const handleClearFilters = () => {
    setSearch("");
    setSiteFilter("");
    setPageNumber(1);
  };

  // Shared by both views: the toolbar is the same strip whether it sits inside
  // the table card or above the card grid, so the actions are built once.
  const toolbarActions = (
    <>
      {/*
        Import and Export were wired to `toast.success("Import started.")` and
        nothing else — the app announced that work had begun and then did none
        of it. They are kept, visible and disabled, rather than deleted: the
        capability is planned and this toolbar is where an admin will look for
        it, so signposting it beats hiding it.
      */}
      <ComingSoonAction
        icon="lucide:upload"
        label="Import"
        reason="Bulk user import is not available yet."
      />
      <ComingSoonAction
        icon="lucide:download"
        label="Export"
        reason="Exporting the user list is not available yet."
      />
      <Button
        size="sm"
        leftIcon="lucide:plus"
        onClick={handleAddUser}
        className={TABLE_HEADER_ACTION_CLASS}
      >
        Add User
      </Button>
      <ViewModeToggle
        value={viewMode}
        onChange={setViewMode}
        itemLabel="users"
      />
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
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
      />

      {/* The module filter strip + search field the EHSS app uses on every
          register, and ClientAccountsPage already uses here. The site filter
          reads as pills from `xl` up and collapses to a select below it, so
          the active site is visible without opening a dropdown. */}
      <ModuleFilterBar
        segments={[
          {
            label: "Site",
            value: siteFilter,
            onChange: handleSiteFilterChange,
            options: siteOptions,
          },
        ]}
      />

      <ModuleSearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Search by name or email…"
        aria-label="Search users by name or email"
        resultLabel={`${String(totalRecords)} ${totalRecords === 1 ? "user" : "users"}`}
      />

      {isLoading ? <UsersTableSkeleton /> : null}

      {isError ? (
        <FeatureErrorCard
          title="Couldn’t load users"
          message={
            error instanceof Error ? error.message : "Failed to load users."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && users.length === 0 && filtersActive ? (
        <FeatureEmptyState
          icon="mdi:account-search-outline"
          title="No users match this search"
          description="Nobody in this organization matches the current search and site filter."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:filter-off-outline"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && users.length === 0 && !filtersActive ? (
        <FeatureEmptyState
          icon="mdi:account-multiple-plus-outline"
          title="No users yet"
          description="Invite the people who will report incidents, run inspections and sign off on work here. They get an email invitation and pick their own password."
          action={
            <Button size="sm" leftIcon="lucide:plus" onClick={handleAddUser}>
              Invite your first user
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && users.length > 0 ? (
        <>
          {viewMode === "table" ? (
            <Table
              className="min-w-0"
              toolbar={
                <TableHeaderBar title="Users" actions={toolbarActions} />
              }
              columns={columns}
              data={users}
              getRowId={(row) => row.id}
            />
          ) : (
            <div className="flex min-w-0 flex-col gap-4">
              {/* The bar carries a bottom border to divide itself from the
                  column headers it normally sits above; standing alone over a
                  grid there is nothing to divide, so it is dropped. */}
              <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
                <TableHeaderBar
                  title="Users"
                  actions={toolbarActions}
                  className="border-b-0"
                />
              </div>

              <div className={CARD_GRID_CLASS}>
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    basePath={basePath}
                    onView={handleViewUser}
                    onEdit={handleEditUser}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* "Page 1 of 4" never said how many rows were on screen. This is
                the row range and the total, which is what an admin scanning a
                directory is actually counting. */}
            <p className="text8 text-gray tabular-nums">
              Showing {firstShown}–{lastShown} of {totalRecords} user
              {totalRecords === 1 ? "" : "s"}
            </p>

            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text8 text-ehs-muted-text tabular-nums">
                  Page {pageNumber} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon="mdi:chevron-left"
                  aria-label="Previous page of users"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon="mdi:chevron-right"
                  aria-label="Next page of users"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {seatInfo ? (
        <SubscriptionSeatLimitModal
          open={seatLimitModalOpen}
          seatInfo={seatInfo}
          onClose={() => setSeatLimitModalOpen(false)}
          onContactSales={() => {
            toast.info("Contact CodeSwift to increase your seat allowance.");
            setSeatLimitModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
