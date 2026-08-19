"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getPpeCategoryCounts,
  PPE_CATEGORIES,
  type PpeCategoryId,
} from "@/lib/dummy-ppe-catalog";
import {
  buildCreatePpePayloadFromDraft,
  useCreatePpeItem,
  usePpeCatalog,
} from "@/hooks/usePpeCatalog";
import { AddPpeItemModal, type AddPpeItemDraft } from "./AddPpeItemModal";
import { PpeCatalogCard } from "./PpeCatalogCard";
import { PpeCatalogStatsRow } from "./PpeCatalogStatsRow";
import { PpeCategoryFilter } from "./PpeCategoryFilter";
import { usePpeCatalogPaths } from "./usePpeCatalogPaths";

/** The one grid recipe the catalog screens share: 3 → 2 → 1 across breakpoints. */
const CARD_GRID_CLASS =
  "stagger-cards grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3";

const FILTER_SKELETON_WIDTHS = ["w-16", "w-44", "w-40", "w-48", "w-36", "w-44"];

function categoryLabelFor(categoryId: PpeCategoryId | "all"): string {
  return (
    PPE_CATEGORIES.find((category) => category.id === categoryId)?.label ??
    "this category"
  );
}

export function PpeCatalogPage() {
  const { adminHref } = usePpeCatalogPaths();
  const sectionHeadingId = useId();
  // `isPending` (not `isLoading`): the query is disabled until the `[company]/[site]`
  // scope resolves, and a disabled query reports `isLoading === false` with no data,
  // which would flash the empty state before the first fetch starts.
  const {
    data: items = [],
    isPending,
    isError,
    error,
    refetch,
  } = usePpeCatalog();
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
  let emptyState = null;
  if (ready && items.length === 0) {
    emptyState = (
      <FeatureEmptyState
        icon="lucide:hard-hat"
        title="No PPE items yet"
        description="The catalog defines the equipment types this site issues, inspects and keeps in stock. Nothing has been added for this site."
        action={
          <Button
            size="sm"
            leftIcon="lucide:plus"
            onClick={() => setAddModalOpen(true)}
          >
            Add your first PPE item
          </Button>
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
          <Button
            size="sm"
            leftIcon="lucide:plus"
            onClick={() => setAddModalOpen(true)}
          >
            Add PPE Item
          </Button>
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
            {FILTER_SKELETON_WIDTHS.map((width) => (
              <Skeleton key={width} className={`h-10 rounded-full ${width}`} />
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

      <AddPpeItemModal
        open={addModalOpen}
        loading={createPpeItem.isPending}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}
