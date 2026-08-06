"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { CreateSuperAdminModal } from "@/components/features/super-admin/CreateSuperAdminModal";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  KpiSummaryCard,
  KpiTrendCard,
  Table,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import { useSuperAdminCompanies } from "@/hooks/useSuperAdminCompanies";

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
      <p className="truncate text5 font-semibold text-darkest">{row.name}</p>
      <p className="truncate text7 text-[#b3bbc8]">ID {row.id}</p>
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
    cell: (row) => (
      <TableTextCell muted>{row.activatedModules || "—"}</TableTextCell>
    ),
  },
  {
    id: "sites",
    header: "Sites",
    cell: (row) => <TableTextCell>{row.sites}</TableTextCell>,
  },
  {
    id: "users",
    header: "Users",
    cell: (row) => <TableTextCell>{row.users}</TableTextCell>,
  },
  {
    id: "created",
    header: "Created",
    cell: (row) => <TableTextCell muted>{formatDate(row.createdAt)}</TableTextCell>,
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

export function SuperAdminDashboardPage() {
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const { data: companies = [], isLoading, isError, error, refetch } =
    useSuperAdminCompanies();

  const companyRows = useMemo<CompanyRow[]>(
    () =>
      companies.map((company) => ({
        id: String(company.id),
        name: company.name,
        activatedModules: company.activatedModules,
        sites: company.siteCount,
        users: company.userCount,
        status: company.userCount > 0 ? "active" : "inactive",
        createdAt: company.createdAt,
      })),
    [companies],
  );

  const totalSites = companyRows.reduce((sum, row) => sum + row.sites, 0);
  const totalUsers = companyRows.reduce((sum, row) => sum + row.users, 0);
  const activeCompanies = companyRows.filter((row) => row.status === "active")
    .length;

  const dashboardKpis = [
    {
      label: "Companies",
      value: companyRows.length,
      trendLabel: "live",
      trend: "up" as const,
      data: [companyRows.length],
    },
    {
      label: "Sites",
      value: totalSites,
      trendLabel: "live",
      trend: "up" as const,
      data: [totalSites],
    },
    {
      label: "Users",
      value: totalUsers,
      trendLabel: "live",
      trend: "up" as const,
      data: [totalUsers],
    },
    {
      label: "Active Clients",
      value: activeCompanies,
      trendLabel: "live",
      trend: "up" as const,
      data: [activeCompanies],
    },
  ];

  const platformStats = [
    {
      title: "Companies",
      value: String(companyRows.length),
      activeCount: activeCompanies,
    },
    {
      title: "Sites",
      value: String(totalSites),
      activeCount: totalSites,
    },
    {
      title: "Users",
      value: String(totalUsers),
      activeCount: totalUsers,
    },
    {
      title: "Modules",
      value: String(
        new Set(
          companyRows.flatMap((row) =>
            row.activatedModules
              .split(",")
              .map((module) => module.trim())
              .filter(Boolean),
          ),
        ).size,
      ),
      activeCount: activeCompanies,
    },
    {
      title: "Active",
      value: String(activeCompanies),
      activeCount: activeCompanies,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-4">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <KpiTrendCard
            key={kpi.label}
            value={kpi.value}
            label={kpi.label}
            data={kpi.data}
            trendLabel={kpi.trendLabel}
            trend={kpi.trend}
          />
        ))}
      </div>

      <DetailCard
        title="All Companies"
        action={
          <Link
            href="/super/client-accounts"
            className="text5 text-blue-normal hover:text-blue-deep"
          >
            View all
          </Link>
        }
      >
        {isLoading ? (
          <p className="text5 text-gray">Loading companies…</p>
        ) : null}
        {isError ? (
          <p className="text5 text-red">
            {error instanceof Error ? error.message : "Failed to load companies."}
          </p>
        ) : null}
        {!isLoading && !isError ? (
          <Table
            columns={COMPANY_COLUMNS}
            data={companyRows}
            getRowId={(row) => row.id}
            emptyMessage="No companies on the platform yet."
          />
        ) : null}
      </DetailCard>

      <DetailCard
        title="Platform Overview"
        action={
          <p className="text5 text-gray">
            Aggregated across {companyRows.length} companies
          </p>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {platformStats.map((stat) => (
            <KpiSummaryCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              activeCount={stat.activeCount}
            />
          ))}
        </div>
      </DetailCard>

      <CreateSuperAdminModal
        open={createStaffOpen}
        onClose={() => setCreateStaffOpen(false)}
      />
    </div>
  );
}
