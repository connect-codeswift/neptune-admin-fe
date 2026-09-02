"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId } from "react";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  Table,
  TableIconAction,
  TableStatusBadge,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { useSuperAdminSites } from "@/hooks/useSuperAdminSites";
import { buildOrgSitePath } from "@/lib/org-sites";
import { buildOrgSiteBasePath, parseOrgSitePath } from "@/lib/sidebar-items";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { FeatureErrorCard } from "@/components/features/shared";

const SKELETON_ROW_KEYS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_CELL_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

/**
 * A grid the shape of the table it replaces — eight columns, five rows, a
 * header band on top. The old placeholder was four full-width bars, which is
 * the silhouette of a paragraph, so the layout jumped when the rows arrived.
 */
function SiteTableSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading sites…"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-4 gap-4 border-b border-ehs-border-ink/8 pb-3 lg:grid-cols-8">
        {SKELETON_CELL_KEYS.map((key) => (
          <Skeleton
            key={key}
            className="h-3 w-16 rounded-md bg-ehs-skeleton-strong"
          />
        ))}
      </div>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className="grid grid-cols-4 gap-4 py-1 lg:grid-cols-8">
          {SKELETON_CELL_KEYS.map((cellKey) => (
            <Skeleton
              key={`${rowKey}-${cellKey}`}
              className="h-4 w-full rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function buildColumns(
  onView: (site: SuperAdminSiteRow) => void,
): TableColumn<SuperAdminSiteRow>[] {
  return [
    {
      id: "name",
      header: "Site Name",
      cell: (row) => (
        <span className="text5 text-ehs-darker" title={row.siteName}>
          {row.siteName}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (row) => <TableTextCell muted>{row.location}</TableTextCell>,
    },
    {
      id: "industry",
      header: "Industry",
      cell: (row) => (
        <TableTextCell>{row.industryType?.trim() || "—"}</TableTextCell>
      ),
    },
    {
      id: "size",
      header: "Site Size",
      cell: (row) => <TableTextCell>{row.siteSize?.trim() || "—"}</TableTextCell>,
    },
    {
      id: "timezone",
      header: "Timezone",
      cell: (row) => <TableTextCell>{row.timeZoneId?.trim() || "—"}</TableTextCell>,
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => <TableTextCell>{row.userCount}</TableTextCell>,
    },
    {
      id: "status",
      header: "Status",
      cell: () => <TableStatusBadge status="active" label="Active" />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-16",
      className: "w-16",
      cell: (row) => (
        <TableIconAction
          label={`View ${row.siteName} details`}
          icon="lucide:pencil"
          onClick={() => onView(row)}
        />
      ),
    },
  ];
}

export function SiteManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const orgSite = parseOrgSitePath(pathname);
  const sectionHeadingId = useId();
  const {
    data: sites = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSuperAdminSites(false);

  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  // No `useMemo` anywhere in this file: React Compiler is on for this app and
  // the repo's rule is that components do not hand-memoize.
  const activeSites = sites.filter((site) => !site.isDrop);

  const columns = buildColumns((site) => {
    if (!orgSite) return;
    router.push(
      `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/site-management/${site.id}`,
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Site Management"
        description={
          activeSites.length > 0
            ? `${activeSites.length} active site${activeSites.length === 1 ? "" : "s"} in your organization`
            : "Update site details for your organization"
        }
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Site Management" },
        ]}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon="lucide:refresh-cw"
            // `isFetching`, not `isLoading`: a background refetch is exactly
            // what this button starts, and `isLoading` only covers the very
            // first fetch, so the spinner would never appear on a real refresh.
            loading={isFetching}
            loadingText="Refreshing…"
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        }
      />

      <section aria-labelledby={sectionHeadingId} className="flex flex-col gap-4">
        {/* This used to be a bordered, shadowed panel of its own — a permanent
            announcement banner for a fact that never changes, shouting on every
            visit. As a caption under the section heading it says the same thing
            without claiming to be news. */}
        <div className="min-w-0">
          <h2 id={sectionHeadingId} className="text3 text-ehs-darker">
            Sites
          </h2>
          <p className="mt-1 max-w-2xl text8 text-ehs-muted-text">
            Update site metadata such as location, industry, and timezone.
            Adding or removing sites is managed by Neptune administrators.
          </p>
        </div>

        <div className={`${GLASS_SURFACE} p-5`}>
          {isLoading ? <SiteTableSkeleton /> : null}

          {isError ? (
            <FeatureErrorCard
              title="Couldn’t load sites"
              message={
                error instanceof Error ? error.message : "Failed to load sites."
              }
              onRetry={() => {
                void refetch();
              }}
              surface={false}
            />
          ) : null}

          {!isLoading && !isError ? (
            <Table
              columns={columns}
              data={activeSites}
              getRowId={(row) => String(row.id)}
              emptyMessage="No sites are set up for this organization yet. Neptune administrators add sites — ask them to create one and it will appear here."
              className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
