"use client";

import { usePathname } from "next/navigation";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import type { DocCategoryResponse } from "@/dtos/res/doc-categories.res";
import { useDocCategoriesBySite } from "@/hooks/useDocCategories";
import { buildOrgSiteBasePath, parseOrgSitePath } from "@/lib/sidebar-items";

type SiteDocCategoriesTabProps = Readonly<{
  siteId: number;
}>;

const columns: TableColumn<DocCategoryResponse>[] = [
  {
    id: "name",
    header: "Category",
    // `categorytName` really is spelled with the extra "t" — it matches the
    // backend entity and DTO verbatim. Not a typo to quietly fix here.
    cell: (row) => (
      <span className="text5 text-ehs-darker">{row.categorytName}</span>
    ),
  },
  {
    id: "documents",
    header: "Documents",
    cell: (row) => <TableTextCell muted>{row.documentCount ?? 0}</TableTextCell>,
  },
  {
    id: "required",
    header: "Required",
    cell: (row) => (
      <TableTextCell muted>{row.isRequired ? "Yes" : "No"}</TableTextCell>
    ),
  },
];

export function SiteDocCategoriesTab({ siteId }: SiteDocCategoriesTabProps) {
  const { data, isLoading, isError, error, refetch } =
    useDocCategoriesBySite(siteId);
  const rows = data ?? [];
  const hasData = !isLoading && !isError;

  const orgSite = parseOrgSitePath(usePathname());
  const categoriesHref = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/site-management/${siteId}/doc-categories`
    : undefined;

  return (
    <div className={`${GLASS_SURFACE} flex flex-col gap-4 p-5`}>
      <div className="flex justify-end">
        <Button
          href={categoriesHref}
          variant="secondary"
          size="sm"
          rightIcon="lucide:arrow-up-right"
        >
          Open document categories
        </Button>
      </div>

      {isLoading ? (
        <FeatureLoadingCard label="Loading document categories…" />
      ) : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load document categories"
          message={
            error instanceof Error
              ? error.message
              : "Could not load document categories for this site."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {hasData && rows.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="lucide:layers"
          title="No document categories yet"
          description="Categories group the documents this site keeps. None have been added for this site."
        />
      ) : null}

      {hasData && rows.length > 0 ? (
        <Table
          columns={columns}
          data={rows}
          getRowId={(row) => String(row.id)}
          className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
        />
      ) : null}
    </div>
  );
}
