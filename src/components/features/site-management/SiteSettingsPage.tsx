"use client";

import { usePathname } from "next/navigation";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  useSuperAdminSite,
  useSuperAdminSiteMutations,
} from "@/hooks/useSuperAdminSites";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { SiteOverviewTab } from "./SiteOverviewTab";

/**
 * Single-site settings page. There is no site list here on purpose — the
 * header's site changer already picks the tenant scope for the whole
 * dashboard, so `[site]` in the URL *is* the site being edited. This page
 * replaces the old site-list + 7-tab-detail pair with one screen: the five
 * fields the edit modal used to carry. Locations and Departments have since
 * moved to their own pages (`/locations`, `/departments`).
 */
export function SiteSettingsPage() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  // `[site]` in the URL is the site id — the header's changer is what sets it —
  // so this reads that one site directly. Finding it in the list read instead
  // meant any id the list did not happen to contain rendered as a bare "Site
  // not found" with no way to tell a deleted site from a scoping problem.
  const parsedSiteId = orgSite ? Number(orgSite.site) : Number.NaN;
  const siteId = Number.isFinite(parsedSiteId) ? parsedSiteId : null;

  // `isPending`, not `isLoading`: a query still gated on the tenant scope
  // renders the loading state instead of falling through to "Site Not Found".
  const {
    data: site,
    isPending: sitesLoading,
    isError: sitesError,
    error: sitesLoadError,
    refetch: refetchSites,
  } = useSuperAdminSite(siteId);
  const { updateSite } = useSuperAdminSiteMutations();

  const crumbs = [
    { label: "Admin", href: adminHref },
    { label: "Site Settings" },
  ];

  if (sitesLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Site Settings"
          description="Loading site details…"
          breadcrumbs={crumbs}
        />
        <FeatureLoadingCard rows={6} label="Loading site details…" />
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Site Settings"
          description="This site could not be loaded."
          breadcrumbs={crumbs}
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
          title="Site Settings"
          description="This site could not be found."
          breadcrumbs={crumbs}
        />
        <FeatureEmptyState
          icon="mdi:map-marker-off-outline"
          title="Site not found"
          description="The site you are switched to could not be found. It may have been deleted — try switching sites from the header."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:view-dashboard-outline"
              href={adminHref}
            >
              Back to dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title="Site Settings"
        description={site.location}
        breadcrumbs={crumbs}
      />

      <SiteOverviewTab site={site} updateSite={updateSite} />
    </div>
  );
}
