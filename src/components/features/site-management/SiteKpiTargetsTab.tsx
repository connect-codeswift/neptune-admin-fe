"use client";

import { usePathname } from "next/navigation";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import type { KpiTargetResponse } from "@/dtos/res/kpi-targets.res";
import { useKpiTargetsBySite } from "@/hooks/useKpiTargets";
import { buildOrgSiteBasePath, parseOrgSitePath } from "@/lib/sidebar-items";

type SiteKpiTargetsTabProps = Readonly<{
  siteId: number;
}>;

const columns: TableColumn<KpiTargetResponse>[] = [
  {
    id: "module",
    header: "Module",
    cell: (row) => <TableTextCell className="font-semibold">{row.module}</TableTextCell>,
  },
  {
    id: "metric",
    header: "Metric",
    cell: (row) => <TableTextCell>{row.metric}</TableTextCell>,
  },
  {
    id: "targetValue",
    header: "Target Value",
    headerClassName: "text-right",
    className: "text-right",
    cell: (row) => (
      <TableTextCell className="tabular-nums">{row.targetValue}</TableTextCell>
    ),
  },
  {
    id: "updatedAt",
    header: "Last Updated",
    cell: (row) => (
      <TableTextCell className="whitespace-nowrap">
        {new Date(row.updatedAt).toLocaleDateString()}
      </TableTextCell>
    ),
  },
];

/** Read-only KPI targets list for an arbitrary site, e.g. the site details page. */
export function SiteKpiTargetsTab({ siteId }: SiteKpiTargetsTabProps) {
  const {
    data: targets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useKpiTargetsBySite(siteId);

  const hasData = !isLoading && !isError;

  const orgSite = parseOrgSitePath(usePathname());
  const targetsHref = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/site-management/${siteId}/kpi-targets`
    : undefined;

  return (
    <>
      <div className="flex justify-end">
        <Button
          href={targetsHref}
          variant="secondary"
          size="sm"
          rightIcon="lucide:arrow-up-right"
        >
          Open KPI targets
        </Button>
      </div>

      {isLoading ? <FeatureLoadingCard label="Loading KPI targets…" /> : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn't load KPI targets"
          message={
            error instanceof Error
              ? error.message
              : "The KPI targets did not load. Check your connection and try again."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {hasData && targets.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="mdi:target-variant"
          title="No KPI targets set"
          description="This site has no configured KPI targets yet."
        />
      ) : null}

      {hasData && targets.length > 0 ? (
        <Table
          columns={columns}
          data={targets}
          getRowId={(row) => String(row.id)}
          className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
        />
      ) : null}
    </>
  );
}
