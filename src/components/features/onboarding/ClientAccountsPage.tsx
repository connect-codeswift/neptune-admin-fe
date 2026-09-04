"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/features/dashboard/StatCard";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ModuleFilterBar,
  ModuleSearchBar,
  Table,
  TableIconAction,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
  type TableStatus,
} from "@/components/ui";
import { useSuperAdminCompanies } from "@/hooks/useSuperAdminCompanies";
import {
  formatCompanyDate,
  isAccessCurrent,
} from "@/lib/company-status";
import { useSetAccessWindowMutation } from "@/hooks/useClientAccountDetail";
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

type StatusFilter = "all" | "active" | "inactive";

type ClientRowActionHandlers = {
  onStartTrial: (client: ClientAccount) => void;
  onExtendTrial: (client: ClientAccount) => void;
  onOpenOverview: (client: ClientAccount) => void;
  onOpenDashboard: (client: ClientAccount) => void;
};

function ClientNameCell({ row }: Readonly<{ row: ClientAccount }>) {
  return (
    <div className="min-w-0">
      <p className="truncate text5 font-semibold text-darkest" title={row.name}>
        {row.name}
      </p>
      <p className="truncate text7 text-ehs-placeholder">ID {row.id}</p>
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
  // The backend exposes no "ever had a trial" flag — only accessExpiresAt, which
  // is null for permanent access (every paying customer) and set for both a
  // running and an already-lapsed trial. So "has a window at all" is the closest
  // proxy for "on a trial": an expired trial still shows Extend, and a paying
  // customer with no window shows Start. See CompanyAccessWindow.md.
  const hasWindow = Boolean(client.accessExpiresAt);

  return (
    <div className="flex items-center justify-end gap-1.5">
      <TableIconAction
        label={`Open overview for ${client.name}`}
        icon="lucide:layout-dashboard"
        onClick={() => onOpenOverview(client)}
      />
      <TableIconAction
        label={`Open dashboard for ${client.name}`}
        icon="lucide:monitor"
        onClick={() => onOpenDashboard(client)}
      />
      {hasWindow ? (
        <TableIconAction
          label={`Extend trial for ${client.name}`}
          icon="lucide:calendar-plus"
          onClick={() => onExtendTrial(client)}
        />
      ) : (
        <TableIconAction
          label={`Start trial for ${client.name}`}
          icon="lucide:play"
          onClick={() => onStartTrial(client)}
        />
      )}
    </div>
  );
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
      id: "contractStart",
      header: "Created",
      cell: (row) => (
        <TableTextCell className="whitespace-nowrap tabular-nums">
          {row.contractStart}
        </TableTextCell>
      ),
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
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <TableTextCell className="tabular-nums">{row.sites}</TableTextCell>
      ),
    },
    {
      id: "users",
      header: "Users",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <TableTextCell className="tabular-nums">{row.users}</TableTextCell>
      ),
    },
    {
      id: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => <ClientRowActions client={row} {...handlers} />,
    },
  ];
}

const STATUS_FILTERS: readonly { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export function ClientAccountsPage() {
  const router = useRouter();
  const [trialDialog, setTrialDialog] = useState<TrialDialogState>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const setAccessWindow = useSetAccessWindowMutation();
  const {
    data: companies = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSuperAdminCompanies();

  const clientAccounts: ClientAccount[] = companies.map((company) => ({
    id: String(company.id),
    name: company.name,
    activatedModules: company.activatedModules,
    contractStart: formatCompanyDate(company.createdAt),
    // Access state, not headcount. A company whose trial lapsed yesterday is
    // inactive even with users; a paying company that has not onboarded
    // anyone yet is active. accessExpiresAt null means permanent access.
    status: isAccessCurrent(company) ? "active" : "inactive",
    sites: company.siteCount,
    users: company.userCount,
    accessExpiresAt: company.accessExpiresAt,
    daysRemaining: company.daysRemaining,
  }));

  const activeCount = clientAccounts.filter((o) => o.status === "active").length;
  const inactiveCount = clientAccounts.length - activeCount;
  const totalSites = clientAccounts.reduce((sum, client) => sum + client.sites, 0);
  const totalUsers = clientAccounts.reduce((sum, client) => sum + client.users, 0);

  // Counts of what is on the platform right now — the companies endpoint has no
  // history, so none of these is a trend and none carries a direction badge.
  // Ordered total → healthy → needs attention → scale, so the row reads left to
  // right as one sentence rather than as four unrelated numbers.
  const summaryStats = [
    {
      label: "Total Clients",
      value: clientAccounts.length,
      icon: "lucide:building-2",
    },
    {
      label: "Active Clients",
      value: activeCount,
      icon: "lucide:circle-check",
    },
    {
      label: "Inactive",
      value: inactiveCount,
      icon: "lucide:calendar-x",
    },
    {
      label: "Total Sites",
      value: totalSites,
      icon: "lucide:map-pin",
    },
  ];

  const query = search.trim().toLowerCase();
  const filtersApplied = query.length > 0 || statusFilter !== "all";
  const visibleAccounts = clientAccounts.filter((client) => {
    if (statusFilter !== "all" && client.status !== statusFilter) return false;
    if (!query) return true;
    return (
      client.name.toLowerCase().includes(query) ||
      client.id.includes(query) ||
      client.activatedModules.toLowerCase().includes(query)
    );
  });

  // Shown against each status control in the filter rail. A vertical list of
  // three bare words reads as decoration; the same list with the number it
  // would leave you looking at reads as a filter.
  const statusCounts: Record<StatusFilter, number> = {
    all: clientAccounts.length,
    active: activeCount,
    inactive: inactiveCount,
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

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

  const hasData = !isLoading && !isError;

  // The list, the count line under it, and the "nothing matched" state are one
  // block: whichever is showing, it is the left-hand column of the split below.
  let listContent = (
    <FeatureEmptyState
      icon="mdi:filter-remove-outline"
      title="No clients match these filters"
      description={`None of the ${clientAccounts.length} client accounts match the current search and status filter.`}
      action={
        <Button
          variant="secondary"
          size="sm"
          leftIcon="lucide:filter-x"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      }
    />
  );

  if (visibleAccounts.length > 0) {
    listContent = (
      <div className="flex min-w-0 flex-col gap-2">
        <Table
          columns={columns}
          data={visibleAccounts}
          getRowId={(row) => row.id}
        />
        {/* The endpoint returns the whole list in one page, so this is a count
            rather than a pager — but the user still needs to know the table is
            showing a subset when a filter is on. */}
        <p
          className="text8 text-ehs-muted-text px-1 tabular-nums"
          role="status"
          aria-live="polite"
        >
          Showing {visibleAccounts.length} of {clientAccounts.length} client
          account{clientAccounts.length === 1 ? "" : "s"}
          {filtersApplied ? " (filtered)" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 pb-4">
      <PageHeader
        title="Client Accounts"
        description="All organizations provisioned on Neptune EHSS"
        actions={
          <>
            <Button href="/super/add-a-company" leftIcon="lucide:plus" size="sm">
              New Client
            </Button>
          </>
        }
      />

      {isLoading ? (
        <FeatureLoadingGrid
          count={4}
          label="Loading client metrics…"
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
          cardClassName="min-h-30"
        />
      ) : null}

      {hasData ? (
        <div className="stagger-cards grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      ) : null}

      {/* The skeleton has to be the shape of the page it stands in for: the
          filter bar and search bar stacked above a full-width table. It used to
          mirror a two-column split with a filter rail on the right, which is no
          longer the shape that arrives — a skeleton promising a layout the page
          never renders is worse than no skeleton at all. */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <FeatureLoadingCard rows={1} label="Loading filters…" />
          <FeatureLoadingCard rows={8} label="Loading client accounts…" />
        </div>
      ) : null}

      {isError ? (
        <FeatureErrorCard
          title="Couldn’t load client accounts"
          message={
            error instanceof Error
              ? error.message
              : "The client list did not load. Check your connection and try again."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {/* Nothing provisioned yet and nothing matching the filters are different
          problems: the first needs a company created, the second needs the
          filters cleared. They used to share one dead-end message. */}
      {hasData && clientAccounts.length === 0 ? (
        <FeatureEmptyState
          icon="mdi:domain-plus"
          title="No client accounts yet"
          description="Every organization you onboard shows up here with its sites, users, and access window."
          action={
            <Button href="/super/add-a-company" size="sm" leftIcon="lucide:plus">
              Add your first client
            </Button>
          }
        />
      ) : null}

      {/* Filtering happens in the browser over the already-fetched list, so
          the query is untouched and the stat row stays platform-wide. The
          filter bar and search bar sit above the now full-width table. */}
      {hasData && clientAccounts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <ModuleFilterBar
            segments={[
              {
                label: "Status",
                value: statusFilter,
                onChange: (value) => setStatusFilter(value as StatusFilter),
                options: STATUS_FILTERS.map((filter) => ({
                  value: filter.id,
                  label: filter.label,
                  count: statusCounts[filter.id],
                })),
              },
            ]}
            action={{
              label: "Clear filters",
              onClick: clearFilters,
              icon: "lucide:filter-x",
              disabled: !filtersApplied,
              title: filtersApplied
                ? undefined
                : "No filters are applied right now",
            }}
          />

          <ModuleSearchBar
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Company name, ID, or module"
            aria-label="Search client accounts"
          />

          {listContent}
        </div>
      ) : null}

      {trialDialog ? (
        <TrialDaysModal
          open
          mode={trialDialog.mode}
          clientName={trialDialog.client.name}
          loading={setAccessWindow.isPending}
          onClose={() => setTrialDialog(null)}
          onConfirm={(days) => {
            const organizationId = Number(trialDialog.client.id);
            void setAccessWindow
              .mutateAsync({ organizationId, days })
              .then(() => {
                const action =
                  trialDialog.mode === "start" ? "started" : "updated";
                toast.success(
                  `Trial ${action} for ${trialDialog.client.name} (${days} days from now).`,
                );
                setTrialDialog(null);
              })
              .catch((setError) => {
                toast.error(
                  setError instanceof Error
                    ? setError.message
                    : "Failed to set access window.",
                );
              });
          }}
        />
      ) : null}
    </div>
  );
}
