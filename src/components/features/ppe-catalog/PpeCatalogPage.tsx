"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import {
  getPpeCategoryCounts,
  PPE_CATEGORIES,
  type PpeCategoryId,
} from "@/lib/dummy-ppe-catalog";
import { mapPpeResponsesToCatalogItems } from "@/lib/mappers/ppe.mapper";
import {
  buildCreatePpePayloadFromDraft,
  useCreatePpeItem,
  usePpeCatalogBySite,
} from "@/hooks/usePpeCatalog";
import { AddPpeItemModal, type AddPpeItemDraft } from "./AddPpeItemModal";
import { PpeCatalogCard } from "./PpeCatalogCard";
import { PpeCatalogStatsRow } from "./PpeCatalogStatsRow";
import { PpeCategoryFilter } from "./PpeCategoryFilter";

/** The one grid recipe the catalog screens share: 3 → 2 → 1 across breakpoints. */
const CARD_GRID_CLASS =
  "stagger-cards grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3";

// Decorative placeholder widths — duplicates are fine and intentional, so the
// key carries the index too. Keying on the width alone collided on "w-44".
const FILTER_SKELETON_WIDTHS = ["w-16", "w-44", "w-40", "w-48", "w-36", "w-44"];

/**
 * PPE *writes* take the site from the caller's org token server-side, never
 * from a URL parameter (FEGuides/Ppe.md §3) — creating while viewing another
 * site would silently write into the wrong one. The `[site]` route segment is
 * the caller's own selected site (see `HeaderSiteChanger.tsx`), so comparing
 * it against the site this page is showing is how the write path is gated.
 */
const OTHER_SITE_ADD_NOTE =
  "New items are added to the site you are currently switched to — this view is showing another site.";

function categoryLabelFor(categoryId: PpeCategoryId | "all"): string {
  return (
    PPE_CATEGORIES.find((category) => category.id === categoryId)?.label ??
    "this category"
  );
}

type PpeCatalogPageProps = Readonly<{
  siteId: number;
}>;

export function PpeCatalogPage({ siteId }: PpeCatalogPageProps) {
  const sectionHeadingId = useId();
  const orgSite = parseOrgSitePath(usePathname());
  const isOwnSite = orgSite !== null && String(siteId) === orgSite.site;
  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";

  // `isPending` (not `isLoading`): the query is disabled until `siteId` is a
  // valid number, and a disabled query reports `isLoading === false` with no
  // data, which would flash the empty state before the first fetch starts.
  const {
    data: ppeRecords = [],
    isPending,
    isError,
    error,
    refetch,
  } = usePpeCatalogBySite(siteId);
  // The catalog API returns raw `PpeResponse[]`; the cards, stats and filter
  // below are written against the `DummyPpeItem` view model, so the shared
  // mapper reconciles the two.
  const items = mapPpeResponsesToCatalogItems(ppeRecords);

  const createPpeItem = useCreatePpeItem();
  const [activeCategory, setActiveCategory] = useState<PpeCategoryId | "all">(
    "all",
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categoryCounts = getPpeCategoryCounts(items);

  let filteredItems = items;
  if (activeCategory !== "all") {
    filteredItems = items.filter((item) => item.categoryId === activeCategory);
  }

  const ready = !isPending && !isError;

  const handleAddItem = async (draft: AddPpeItemDraft, categoryLabel: string) => {
    try {
      await createPpeItem.mutateAsync(
        buildCreatePpePayloadFromDraft({
          name: draft.name,
          modelNumber: draft.modelNumber,
          manufacturer: draft.manufacturer,
          safetyStandard: draft.safetyStandard,
          categoryLabel,
          minStockLevel: draft.minStockLevel,
        }),
      );
      toast.success("PPE item added to catalog.");
      setAddModalOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add PPE item.",
      );
    }
  };

  // Two different dead ends, and they need two different ways out: an empty
  // catalog wants the add flow, an empty filter wants the filter cleared.
  // The add flow itself is only offered on the caller's own site.
  let emptyState = null;
  if (ready && items.length === 0) {
    emptyState = (
      <FeatureEmptyState
        icon="lucide:hard-hat"
        title="No PPE items yet"
        description="The catalog defines the equipment types this site issues, inspects and keeps in stock. Nothing has been added for this site."
        action={
          isOwnSite ? (
            <Button
              size="sm"
              leftIcon="lucide:plus"
              onClick={() => setAddModalOpen(true)}
            >
              Add your first PPE item
            </Button>
          ) : (
            <p className="text-ehs-muted-text max-w-md text-xs">
              {OTHER_SITE_ADD_NOTE}
            </p>
          )
        }
      />
    );
  } else if (ready && filteredItems.length === 0) {
    emptyState = (
      <FeatureEmptyState
        icon="lucide:filter-x"
        title={`No PPE items in ${categoryLabelFor(activeCategory)}`}
        description="The catalog has items, just none in this category."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="lucide:list-restart"
            onClick={() => setActiveCategory("all")}
          >
            Show all categories
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="PPE Catalog"
        description="Manage all PPE types, standards, inspection intervals, and stock settings"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "PPE Catalog" },
        ]}
        actions={
          // The Export button that used to sit here fired a "Export started."
          // toast and exported nothing, so it has gone rather than staying as a
          // control that lies about what it did.
          isOwnSite ? (
            <Button
              size="sm"
              leftIcon="lucide:plus"
              onClick={() => setAddModalOpen(true)}
            >
              Add PPE Item
            </Button>
          ) : (
            <p className="max-w-xs text-right text8 text-ehs-muted-text">
              {OTHER_SITE_ADD_NOTE}
            </p>
          )
        }
      />

      {/* The stat row used to render zeros off an empty array while the query
          was still in flight, which is a wrong answer rather than no answer. */}
      {isPending ? (
        <FeatureLoadingGrid
          count={4}
          label="Loading PPE catalog stats…"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        />
      ) : null}
      {ready ? <PpeCatalogStatsRow items={items} /> : null}

      <section aria-labelledby={sectionHeadingId} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={sectionHeadingId} className="text3 text-ehs-darker">
            PPE Items
          </h2>
          {ready && items.length > 0 ? (
            <p className="text8 text-ehs-muted-text">
              Showing {filteredItems.length} of {items.length} item
              {items.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        {isPending ? (
          <div
            className="flex flex-wrap gap-2"
            role="status"
            aria-busy="true"
            aria-label="Loading PPE categories…"
          >
            {FILTER_SKELETON_WIDTHS.map((width, index) => (
              <Skeleton
                key={`${width}-${index}`}
                className={`h-10 rounded-full ${width}`}
              />
            ))}
          </div>
        ) : null}

        {ready && items.length > 0 ? (
          <PpeCategoryFilter
            activeCategory={activeCategory}
            counts={categoryCounts}
            onChange={setActiveCategory}
          />
        ) : null}

        {isPending ? (
          <FeatureLoadingGrid
            count={3}
            label="Loading PPE catalog…"
            className={CARD_GRID_CLASS}
            cardClassName="min-h-72"
          />
        ) : null}

        {isError ? (
          <FeatureErrorCard
            title="Couldn’t load the PPE catalog"
            message={
              error instanceof Error
                ? error.message
                : "Failed to load PPE catalog."
            }
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {emptyState}

        {ready && filteredItems.length > 0 ? (
          <div className={CARD_GRID_CLASS}>
            {filteredItems.map((item) => (
              <PpeCatalogCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </section>

      {isOwnSite ? (
        <AddPpeItemModal
          open={addModalOpen}
          loading={createPpeItem.isPending}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddItem}
        />
      ) : null}
    </div>
  );
}
