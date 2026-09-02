"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { DocumentCategoryForm } from "./DocumentCategoryForm";
import { DocumentCategoryGrid } from "./DocumentCategoryGrid";
import { DocumentCategoryStatsRow } from "./DocumentCategoryStatsRow";

/**
 * Category *writes* (add/update/drop) take the site from the caller's org
 * token server-side, never from a URL parameter — creating, editing or
 * deleting while viewing another site would silently write into the wrong
 * one. The `[site]` route segment is the caller's own selected site (see
 * `HeaderSiteChanger.tsx`), so comparing it against the site this page is
 * showing is how the write path is gated.
 */
const OTHER_SITE_WRITE_NOTE =
  "Categories are managed on the site you are currently switched to — this view is showing another site.";

type DocumentCategoriesPageProps = Readonly<{ siteId: number }>;

export function DocumentCategoriesPage({ siteId }: DocumentCategoriesPageProps) {
  const orgSite = parseOrgSitePath(usePathname());
  const isOwnSite = orgSite !== null && String(siteId) === orgSite.site;
  const adminHref = orgSite ? buildOrgSitePath(orgSite.company, orgSite.site) : "/dashboard";

  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    // Header → stats → (create form) → content, in the same `gap-6` rhythm the
    // other catalog screens use.
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Document Categories"
        description="Manage document category types used across the platform"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Document Admin" },
          { label: "Categories" },
        ]}
        actions={
          isOwnSite ? (
            <Button
              size="sm"
              leftIcon="lucide:plus"
              onClick={() => setShowCreateForm(true)}
            >
              New Category
            </Button>
          ) : (
            <p className="max-w-xs text-right text8 text-ehs-muted-text">
              {OTHER_SITE_WRITE_NOTE}
            </p>
          )
        }
      />

      {/* The stats endpoint resolves its site from the token, not from a
          parameter, so on another site's page these tiles would report YOUR
          site's numbers above THAT site's list — two different sites stacked
          without saying so. Hide them rather than caption them: a wrong number
          with an explanation underneath is still a wrong number on screen. */}
      {isOwnSite ? <DocumentCategoryStatsRow /> : null}

      {showCreateForm && isOwnSite ? (
        <DocumentCategoryForm onCancel={() => setShowCreateForm(false)} />
      ) : null}

      {/* The grid owns its own section heading and count, so the empty state can
          offer the same "add one" action the header carries. */}
      <DocumentCategoryGrid
        siteId={siteId}
        isOwnSite={isOwnSite}
        onCreate={isOwnSite ? () => setShowCreateForm(true) : undefined}
      />
    </div>
  );
}
