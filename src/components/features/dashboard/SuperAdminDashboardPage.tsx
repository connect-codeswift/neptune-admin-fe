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
import {
  PlatformOverviewList,
  PlatformOverviewListSkeleton,
  type PlatformOverviewStat,
} from "./PlatformOverviewList";
import { StatCard } from "./StatCard";

type CompanyRow = {
  id: string;
  name: string;
  activatedModules: string;
  sites: number;
  users: number;
  status: "active" | "inactive";
  createdAt: string;
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

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const COMPANY_COLUMNS: TableColumn<CompanyRow>[] = [
  {
    id: "company",
    header: "Company",
    cell: (row) => <CompanyNameCell row={row} />,
  },
  {
    id: "modules",
    header: "Modules",
    // Module strings run long; the cell truncates and keeps the full list in a
    // tooltip rather than letting one row set the table's height.
    cell: (row) => (
      <span
        className="text4 text-ehs-muted-text block max-w-70 truncate"
        title={row.activatedModules || undefined}
      >
        {row.activatedModules || "—"}
      </span>
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
  {
    id: "created",
    header: "Created",
    cell: (row) => (
      <TableTextCell muted className="whitespace-nowrap tabular-nums">
        {formatDate(row.createdAt)}
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
    activatedModules: company.activatedModules,
    sites: company.siteCount,
    users: company.userCount,
    status: company.userCount > 0 ? "active" : "inactive",
    createdAt: company.createdAt,
  }));

  const totalSites = companyRows.reduce((sum, row) => sum + row.sites, 0);
  const totalUsers = companyRows.reduce((sum, row) => sum + row.users, 0);
  const activeCompanies = companyRows.filter(
    (row) => row.status === "active",
  ).length;
  const idleCompanies = companyRows.length - activeCompanies;
  const distinctModules = new Set(
    companyRows.flatMap((row) =>
      row.activatedModules
        .split(",")
        .map((module) => module.trim())
        .filter(Boolean),
    ),
  ).size;

  // Counts, not trends: `/companies` returns a flat list, so nothing here has a
  // history to plot. Each card carries its own breakdown instead of a badge.
  const platformStats = [
    {
      label: "Companies",
      value: companyRows.length,
      detail: `${activeCompanies} with users · ${idleCompanies} not onboarded`,
      icon: "lucide:building-2",
    },
    {
      label: "Sites",
      value: totalSites,
      detail: `Across ${companyRows.length} compan${companyRows.length === 1 ? "y" : "ies"}`,
      icon: "lucide:map-pin",
    },
    {
      label: "Users",
      value: totalUsers,
      detail: `${distinctModules} distinct module${distinctModules === 1 ? "" : "s"} licensed`,
      icon: "lucide:users",
    },
    {
      label: "Active Clients",
      value: activeCompanies,
      detail: `${idleCompanies} have no users yet`,
      icon: "lucide:circle-check",
    },
  ];

  const overviewStats: PlatformOverviewStat[] = [
    {
      title: "Companies",
      value: companyRows.length,
      activeCount: activeCompanies,
      icon: "lucide:building-2",
    },
    {
      title: "Sites",
      value: totalSites,
      activeCount: totalSites,
      icon: "lucide:map-pin",
    },
    {
      title: "Users",
      value: totalUsers,
      activeCount: totalUsers,
      icon: "lucide:users",
    },
    {
      title: "Modules",
      value: distinctModules,
      activeCount: activeCompanies,
      icon: "lucide:layout-grid",
    },
    {
      title: "Active",
      value: activeCompanies,
      activeCount: activeCompanies,
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
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:user-plus"
              onClick={() => setCreateStaffOpen(true)}
            >
              Add Staff Account
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:refresh-cw"
              onClick={() => void refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:building-2"
              href="/super/client-accounts"
            >
              All Companies
            </Button>
          </>
        }
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
              detail={stat.detail}
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
      <div className="stagger-cards grid items-start gap-3.5 xl:grid-cols-13">
        <DetailCard
          className="xl:col-span-9"
          title="All Companies"
          description="Every organization provisioned on the platform, newest data from the last refresh."
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

        {/* "Aggregated across n companies" used to be the heading's right-hand
            action. At rail width that wraps onto its own line anyway, so it is
            the subtitle now — same words, one line, and the heading keeps its
            title-then-description order. */}
        <DetailCard
          className="xl:col-span-4"
          title="Platform Overview"
          description={`Aggregated across ${companyRows.length} companies`}
        >
          {isLoading ? <PlatformOverviewListSkeleton /> : null}

          {/* No Retry here. These totals are derived from the company list, so
              the button on the left is the same button, and offering it twice
              on one row of cards asks the reader which one to press. */}
          {isError ? (
            <FeatureErrorCard
              surface={false}
              title="Totals unavailable"
              message="Platform totals are derived from the company list, which did not load."
            />
          ) : null}

          {hasData ? <PlatformOverviewList stats={overviewStats} /> : null}
        </DetailCard>
      </div>

      <CreateSuperAdminModal
        open={createStaffOpen}
        onClose={() => setCreateStaffOpen(false)}
      />
    </div>
  );
}
