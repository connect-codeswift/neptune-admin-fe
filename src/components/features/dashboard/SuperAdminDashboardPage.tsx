"use client";

import Link from "next/link";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  KpiSummaryCard,
  KpiTrendCard,
  RecentActivityCard,
  Table,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import {
  SUPER_ADMIN_ACTIVITY_LOG,
  SUPER_ADMIN_COMPANY_ROWS,
  SUPER_ADMIN_DASHBOARD_KPIS,
  SUPER_ADMIN_PLATFORM_STATS,
  type SuperAdminCompanyRow,
} from "@/lib/super-admin-dashboard.dummy";

function CompanyNameCell({ row }: Readonly<{ row: SuperAdminCompanyRow }>) {
  return (
    <div className="min-w-0">
      <p className="truncate text5 font-semibold text-darkest">{row.name}</p>
      <p className="truncate text7 text-[#b3bbc8]">{row.code}</p>
    </div>
  );
}

const COMPANY_COLUMNS: TableColumn<SuperAdminCompanyRow>[] = [
  {
    id: "company",
    header: "Company",
    cell: (row) => <CompanyNameCell row={row} />,
  },
  {
    id: "industry",
    header: "Industry",
    cell: (row) => <TableTextCell>{row.industry}</TableTextCell>,
  },
  {
    id: "sites",
    header: "Sites",
    cell: (row) => <TableTextCell>{row.sites}</TableTextCell>,
  },
  {
    id: "users",
    header: "Licensed Users",
    cell: (row) => <TableTextCell>{row.users}</TableTextCell>,
  },
  {
    id: "employees",
    header: "Employees",
    cell: (row) => <TableTextCell>{row.employees}</TableTextCell>,
  },
  {
    id: "plan",
    header: "Plan",
    cell: (row) => <TableTextCell muted>{row.plan}</TableTextCell>,
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
    id: "csm",
    header: "CSM",
    cell: (row) => <TableTextCell>{row.csm}</TableTextCell>,
  },
];

export function SuperAdminDashboardPage() {
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
              leftIcon="lucide:refresh-cw"
              onClick={() => toast.success("Global dashboard refreshed.")}
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
            <Button
              size="sm"
              leftIcon="lucide:download"
              onClick={() => toast.success("Global report export started.")}
            >
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUPER_ADMIN_DASHBOARD_KPIS.map((kpi) => (
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
          <Table
            columns={COMPANY_COLUMNS}
            data={SUPER_ADMIN_COMPANY_ROWS}
            getRowId={(row) => row.id}
            emptyMessage="No companies on the platform yet."
          />
        </DetailCard>

        <RecentActivityCard
          title="Platform Activity"
          items={SUPER_ADMIN_ACTIVITY_LOG}
          viewHref="/super/client-accounts"
          viewLabel="View all companies"
        />
      </div>

      <DetailCard
        title="Platform Overview"
        action={
          <p className="text5 text-gray">
            Aggregated across {SUPER_ADMIN_COMPANY_ROWS.length} companies
          </p>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {SUPER_ADMIN_PLATFORM_STATS.map((stat) => (
            <KpiSummaryCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              activeCount={stat.activeCount}
            />
          ))}
        </div>
      </DetailCard>
    </div>
  );
}
