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
import { SiteOverviewTab } from "./SiteOverviewTab";

type SiteDetailPageProps = Readonly<{
  siteId: string;
}>;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "kpi-targets", label: "KPI Targets" },
  { id: "ppe", label: "PPE" },
] as const;

/**
 * The three tabs beyond Overview have no id-scoped endpoint to read: the
 * backend derives "the site" from the caller's token, not from a URL
 * parameter (see FEGuides/Locations.md — "the site is never a parameter").
 * Wiring one of these to an existing endpoint would silently render whatever
 * site the token currently selects, not the id in this URL, so they stay an
 * honest empty state instead and issue no request.
 */
function UnwiredTabNotice({ label }: Readonly<{ label: string }>) {
  return (
    <FeatureEmptyState
      icon="mdi:link-off"
      title={`${label} is not wired up yet`}
      description="This data is scoped to whichever site is currently selected in the app, not to the site in this page's URL. Showing it here would risk mixing up two different sites, so this view stays disabled until the backend can take a site id directly."
    />
  );
}

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

  let tabContent = <SiteOverviewTab site={site} updateSite={updateSite} />;
  if (activeTab.id !== "overview") {
    tabContent = <UnwiredTabNotice label={activeTab.label} />;
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
