"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button, TabBar } from "@/components/ui";
import {
  useSuperAdminSiteMutations,
  useSuperAdminSites,
} from "@/hooks/useSuperAdminSites";
import { buildOrgSitePath } from "@/lib/org-sites";
import { buildOrgSiteBasePath, parseOrgSitePath } from "@/lib/sidebar-items";
import { SiteDepartmentsTab } from "./SiteDepartmentsTab";
import { SiteDocCategoriesTab } from "./SiteDocCategoriesTab";
import { SiteKpiTargetsTab } from "./SiteKpiTargetsTab";
import { SiteLocationsTab } from "./SiteLocationsTab";
import { SiteOverviewTab } from "./SiteOverviewTab";
import { SitePpeTab } from "./SitePpeTab";
import { SiteUsersTab } from "./SiteUsersTab";

type SiteDetailPageProps = Readonly<{
  siteId: string;
}>;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "locations", label: "Locations" },
  { id: "departments", label: "Departments" },
  { id: "doc-categories", label: "Documents" },
  { id: "kpi-targets", label: "KPI Targets" },
  { id: "ppe", label: "PPE" },
] as const;

/**
 * Read-only-shell detail page for one site, following the same loading /
 * error / not-found shape as `RoleDetailPage`. Replaces the inline edit
 * modal on `SiteManagementPage` with a dedicated page whose first tab edits
 * the same five fields.
 */
export function SiteDetailPage({ siteId }: SiteDetailPageProps) {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/site-management`
    : "/dashboard";
  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  // `isPending`, not `isLoading`: a query still gated on the tenant scope
  // renders the loading state instead of falling through to "Site Not Found".
  const {
    data: sites = [],
    isPending: sitesLoading,
    isError: sitesError,
    error: sitesLoadError,
    refetch: refetchSites,
  } = useSuperAdminSites(false);
  const { updateSite } = useSuperAdminSiteMutations();

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = TABS[activeIndex] ?? TABS[0];

  const site = sites.find((entry) => String(entry.id) === siteId);

  const deadEndCrumbs = [
    { label: "Admin", href: adminHref },
    { label: "Site Management", href: basePath },
  ];

  if (sitesLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Site Details"
          description="Loading site details…"
          breadcrumbs={deadEndCrumbs}
        />
        <FeatureLoadingCard rows={6} label="Loading site details…" />
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Site Details"
          description="This site could not be loaded."
          breadcrumbs={deadEndCrumbs}
        />
        <FeatureErrorCard
          title="Couldn’t load this site"
          message={
            sitesLoadError instanceof Error
              ? sitesLoadError.message
              : "Could not load site details."
          }
          onRetry={() => {
            void refetchSites();
          }}
        />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Site Details"
          description="This site could not be found."
          breadcrumbs={deadEndCrumbs}
        />
        <FeatureEmptyState
          icon="mdi:map-marker-off-outline"
          title="Site not found"
          description={`No site exists with id “${siteId}”. It may have been deleted, or the link that brought you here is out of date.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:arrow-left"
              href={basePath}
            >
              Back to Site Management
            </Button>
          }
        />
      </div>
    );
  }

  // Every tab below Overview owns its own query, keyed on this site's id rather
  // than the app's selected site — that is the whole point of the page, and why
  // each hook needed a key branch of its own.
  let tabContent = <SiteOverviewTab site={site} updateSite={updateSite} />;
  if (activeTab.id === "users") {
    tabContent = <SiteUsersTab siteId={site.id} />;
  } else if (activeTab.id === "locations") {
    tabContent = <SiteLocationsTab siteId={site.id} />;
  } else if (activeTab.id === "departments") {
    tabContent = <SiteDepartmentsTab siteId={site.id} />;
  } else if (activeTab.id === "doc-categories") {
    tabContent = <SiteDocCategoriesTab siteId={site.id} />;
  } else if (activeTab.id === "kpi-targets") {
    tabContent = <SiteKpiTargetsTab siteId={site.id} />;
  } else if (activeTab.id === "ppe") {
    tabContent = <SitePpeTab siteId={site.id} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title={`Site: ${site.siteName}`}
        description={site.location}
        breadcrumbs={[...deadEndCrumbs, { label: site.siteName }]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="mdi:arrow-left"
            href={basePath}
          >
            Back
          </Button>
        }
      />

      <TabBar
        tabs={[...TABS]}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        label="Site sections"
      />

      {tabContent}
    </div>
  );
}
