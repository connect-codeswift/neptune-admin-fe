"use client";

import Link from "next/link";
import { useState } from "react";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { CreateSuperAdminModal } from "@/components/features/super-admin/CreateSuperAdminModal";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  Table,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import { useSuperAdminCompanies } from "@/hooks/useSuperAdminCompanies";
import { formatCompanyDate, isAccessCurrent } from "@/lib/company-status";
import {
  activatedModuleCodesToIds,
  getModuleLabel,
  parseActivatedModuleCodes,
} from "@/lib/ehs-modules";
import { StatCard } from "./StatCard";

type CompanyRow = {
  id: string;
  name: string;
  /** Readable module names, already resolved from the stored codes. */
  modules: string;
  createdAt: string;
  sites: number;
  users: number;
  status: "active" | "inactive";
};

function CompanyNameCell({ row }: Readonly<{ row: CompanyRow }>) {
  return (
    <div className="min-w-0">
      <p className="truncate text5 font-semibold text-darkest" title={row.name}>
        {row.name}
      </p>
      <p className="truncate text7 text-ehs-placeholder">ID {row.id}</p>
    </div>
  );
}

const COMPANY_COLUMNS: TableColumn<CompanyRow>[] = [
  {
    id: "company",
    header: "Company",
    cell: (row) => <CompanyNameCell row={row} />,
  },
  // Column order mirrors the Client Accounts table — Created, then Status, then
  // the two right-aligned figures — so the two screens listing the same
  // companies read the same way.
  {
    id: "createdAt",
    header: "Created",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap tabular-nums">
        {row.createdAt}
      </TableTextCell>
    ),
  },
  {
    id: "modules",
    header: "Modules",
    // Module lists run long; the cell truncates and keeps the full list in a
    // tooltip rather than letting one row set the table's height.
    cell: (row) => (
      <span
        className="text4 text-ehs-muted-text block max-w-70 truncate"
        title={row.modules || undefined}
      >
        {row.modules || "—"}
      </span>
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
    cell: (row) => <TableTextCell className="tabular-nums">{row.sites}</TableTextCell>,
  },
  {
    id: "users",
    header: "Users",
    headerClassName: "text-right",
    className: "text-right",
    cell: (row) => <TableTextCell className="tabular-nums">{row.users}</TableTextCell>,
  },
];

/** The stat row and its loading placeholder must agree on their track count. */
const STAT_GRID_CLASS = "grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4";

export function SuperAdminDashboardPage() {
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const {
    data: companies = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSuperAdminCompanies();

  const companyRows: CompanyRow[] = companies.map((company) => ({
    id: String(company.id),
    name: company.name,
    // The cell used to print `company.activatedModules` raw, which is the
    // stored code list — "HAZARD,INCIDENT,NEAR_MISS". These are the same names
    // the Client Accounts and org dashboards show.
    modules: activatedModuleCodesToIds(
      parseActivatedModuleCodes(company.activatedModules),
    )
      .map((moduleId) => getModuleLabel(moduleId))
      .join(", "),
    createdAt: formatCompanyDate(company.createdAt),
    sites: company.siteCount,
    users: company.userCount,
    // Access state, not headcount — the same rule Client Accounts uses. This
    // used to be `userCount > 0`, so a lapsed company with users read as Active
    // here and Inactive there.
    status: isAccessCurrent(company) ? "active" : "inactive",
  }));

  const totalSites = companyRows.reduce((sum, row) => sum + row.sites, 0);
  const totalUsers = companyRows.reduce((sum, row) => sum + row.users, 0);
  const activeCompanies = companyRows.filter(
    (row) => row.status === "active",
  ).length;

  const platformStats = [
    {
      label: "Companies",
      value: companyRows.length,
      icon: "lucide:building-2",
    },
    {
      label: "Sites",
      value: totalSites,
      icon: "lucide:map-pin",
    },
    {
      label: "Users",
      value: totalUsers,
      icon: "lucide:users",
    },
    {
      label: "Active Clients",
      value: activeCompanies,
      icon: "lucide:circle-check",
    },
  ];

  const hasData = !isLoading && !isError;

  return (
    // `gap-3.5` is the house rhythm (see the EHSS command center): the tighter
    // gutter is most of what makes a console read as one composed surface
    // rather than as a stack of unrelated panels. The width cap and centring
    // live on `DashboardShell`, so nothing here sets a second one.
    <div className="flex flex-col gap-3.5 pb-8">
      <PageHeader
        title="Global Dashboard"
        description="Platform-wide view of all companies, users, and sites across Neptune EHSS"
      />

      {/* The stat row is derived from the same query as the table, so it can
          only show real numbers once that query has answered. It used to render
          four zeroes while loading, which reads as a platform with no clients. */}
      {isLoading ? (
        <FeatureLoadingGrid
          count={4}
          label="Loading platform metrics…"
          className={STAT_GRID_CLASS}
          // 116px is the resolved height of a `StatCard` carrying a label, a
          // figure and a breakdown line, so the row does not jump when the
          // query answers.
          cardClassName="min-h-29"
        />
      ) : null}

      {hasData ? (
        <div className={`stagger-cards ${STAT_GRID_CLASS}`}>
          {platformStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      ) : null}

      {/* The page's one deliberate asymmetry. The companies table is the
          primary object here and takes nine of thirteen columns; the platform
          totals are context and take four, as a rail rather than a second
          full-width band.

          Nine rather than the usual eight because `Table` sets `min-w-240` on
          its grid — at the 1600px content cap, a nine-column track is the
          narrowest split that still fits all six columns without the table
          scrolling inside its own pane. Below `xl` the split collapses to one
          column, where a four-of-thirteen rail would be too thin to read.

          `items-start` keeps the rail at its own height: stretched, five rows
          would float in a card as tall as a fifty-row table. */}
      <div className="stagger-cards grid items-start gap-3.5 xl:grid-cols-12">
        <DetailCard
          className="xl:col-span-12"
          title="Recently Added Companies"
          action={
            <Link
              href="/super/client-accounts"
              className="text5 text-blue-normal hover:text-blue-deep focus-visible:ring-ehs-normal-blue/30 rounded-lg outline-none focus-visible:ring-2"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <FeatureLoadingCard rows={5} label="Loading companies…" />
          ) : null}

          {isError ? (
            <FeatureErrorCard
              surface={false}
              title="Couldn’t load companies"
              message={
                error instanceof Error
                  ? error.message
                  : "The company list did not load. Check your connection and try again."
              }
              onRetry={() => {
                void refetch();
              }}
            />
          ) : null}

          {/* `Table` wraps `emptyMessage` in a `<p>`, so an empty state with an
              action cannot live inside it — it renders in the table's place. */}
          {hasData && companyRows.length === 0 ? (
            <FeatureEmptyState
              surface={false}
              icon="mdi:domain-plus"
              title="No companies on the platform yet"
              description="Onboard the first client and it will appear here with its sites, users, and licensed modules."
              action={
                <Button href="/super/add-a-company" size="sm" leftIcon="lucide:plus">
                  Add your first company
                </Button>
              }
            />
          ) : null}

          {hasData && companyRows.length > 0 ? (
            <Table
              columns={COMPANY_COLUMNS}
              data={companyRows}
              getRowId={(row) => row.id}
            />
          ) : null}
        </DetailCard>
      </div>

      <CreateSuperAdminModal
        open={createStaffOpen}
        onClose={() => setCreateStaffOpen(false)}
      />
    </div>
  );
}
