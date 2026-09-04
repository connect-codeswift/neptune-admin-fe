"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ModuleFilterBar,
  ModuleSearchBar,
  Table,
  TableHeaderBar,
  TableIconAction,
  TableTextCell,
  ViewModeToggle,
  type TableColumn,
  type ViewMode,
} from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
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
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [stockFilter, setStockFilter] = useState("");
  const [search, setSearch] = useState("");

  const categoryCounts = getPpeCategoryCounts(items);

  // Category options carry their counts, which is what the standalone pill row
  // used to show — `ModuleFilterBar` renders a count per option, so moving the
  // filter into the shared bar loses nothing.
  const categoryOptions = PPE_CATEGORIES.map((category) => ({
    value: category.id === "all" ? "" : category.id,
    label: category.label,
    count: categoryCounts.get(category.id) ?? 0,
  }));

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (activeCategory !== "all" && item.categoryId !== activeCategory) {
      return false;
    }
    // Same threshold the card and the Stock column use.
    const isLowStock = item.stock <= item.minStockLevel;
    if (stockFilter === "low" && !isLowStock) return false;
    if (stockFilter === "ok" && isLowStock) return false;
    if (normalizedSearch === "") return true;
    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.modelNumber.toLowerCase().includes(normalizedSearch) ||
      item.manufacturer.toLowerCase().includes(normalizedSearch) ||
      item.safetyStandard.toLowerCase().includes(normalizedSearch)
    );
  });

  function clearFilters() {
    setActiveCategory("all");
    setStockFilter("");
    setSearch("");
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

  /**
   * The card's own note: neither edit nor delete has a mutation behind it yet.
   * The table says the same thing the same way — disabled with the reason —
   * rather than omitting the column and quietly disagreeing with the card.
   */
  const ACTIONS_UNAVAILABLE_REASON =
    "Editing catalog items is not available yet — add items from “Add PPE Item”.";

  function buildColumns(): TableColumn<(typeof items)[number]>[] {
    return [
      {
        id: "item",
        header: "Item",
        cell: (row) => {
          const provenance = [row.modelNumber, row.manufacturer]
            .filter(Boolean)
            .join(" · ");
          return (
            <div className="min-w-0" title={`${row.name} · ${provenance}`}>
              <p className="text4 text-ehs-darker max-w-72 truncate">
                {row.name}
              </p>
              <p className="text8 text-ehs-muted-text mt-0.5 max-w-72 truncate">
                {provenance || "—"}
              </p>
            </div>
          );
        },
      },
      {
        id: "category",
        header: "Category",
        cell: (row) => <TableTextCell>{row.categoryLabel}</TableTextCell>,
      },
      {
        id: "standard",
        header: "Standard",
        cell: (row) => <TableTextCell>{row.safetyStandard || "—"}</TableTextCell>,
      },
      {
        id: "stock",
        header: "Stock",
        cell: (row) => {
          // Same threshold the card uses for its low-stock treatment, so a row
          // and its tile cannot disagree about which items are short.
          const isLowStock = row.stock <= row.minStockLevel;
          const toneClass = isLowStock ? "text-ehs-red" : "text-ehs-darker";
          return (
            <div className="min-w-0">
              <p className={`text4 tabular-nums ${toneClass}`}>{row.stock}</p>
              <p className="text8 text-ehs-muted-text mt-0.5 tabular-nums">
                min {row.minStockLevel}
              </p>
            </div>
          );
        },
      },
      {
        id: "inspect",
        header: "Inspection",
        cell: (row) => <TableTextCell>{row.inspectInterval || "—"}</TableTextCell>,
      },
      {
        id: "actions",
        header: "Actions",
        srOnlyHeader: true,
        headerClassName: "w-20",
        className: "w-20",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <TableIconAction
              icon="lucide:pencil"
              label={`Edit ${row.name}`}
              disabled
              title={ACTIONS_UNAVAILABLE_REASON}
            />
            <TableIconAction
              icon="lucide:trash-2"
              label={`Delete ${row.name}`}
              disabled
              title={ACTIONS_UNAVAILABLE_REASON}
            />
          </div>
        ),
      },
    ];
  }

  const toolbarActions = (
    <>
      {items.length > 0 ? (
        <span className="text8 text-ehs-muted-text shrink-0 tabular-nums">
          Showing {filteredItems.length} of {items.length} item
          {items.length === 1 ? "" : "s"}
        </span>
      ) : null}
      <ViewModeToggle
        value={viewMode}
        onChange={setViewMode}
        itemLabel="PPE items"
      />
    </>
  );

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
    // The title still names the category when that is the only filter on, since
    // "no items in Eye Protection" is more use than "nothing matches".
    let emptyTitle = "No PPE items match";
    let emptyDescription =
      "The catalog has items, just none matching the current filters and search.";
    if (activeCategory !== "all" && stockFilter === "" && normalizedSearch === "") {
      emptyTitle = `No PPE items in ${categoryLabelFor(activeCategory)}`;
      emptyDescription = "The catalog has items, just none in this category.";
    }

    emptyState = (
      <FeatureEmptyState
        icon="lucide:filter-x"
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="lucide:list-restart"
            onClick={clearFilters}
          >
            Clear filters
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

      {/* The heading and the count that used to sit here moved into
          `TableHeaderBar`, which carries both plus the view toggle in one strip
          inside the card — so this section takes its name from that heading. */}
      <section aria-label="PPE Items" className="flex flex-col gap-4">
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

        {/* The standalone category pill row moved in here as a segment: it is
            the same single-select with the same per-option counts, but in the
            bar every other register uses rather than a component of its own. */}
        {ready && items.length > 0 ? (
          <>
            <ModuleFilterBar
              segments={[
                {
                  label: "Category",
                  value: activeCategory === "all" ? "" : activeCategory,
                  onChange: (value) => {
                    setActiveCategory(value === "" ? "all" : (value as PpeCategoryId));
                  },
                  options: categoryOptions,
                },
                {
                  label: "Stock",
                  value: stockFilter,
                  onChange: setStockFilter,
                  options: [
                    { value: "", label: "All" },
                    { value: "low", label: "Low stock" },
                    { value: "ok", label: "In stock" },
                  ],
                },
              ]}
            />

            <ModuleSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name, model, manufacturer or standard…"
              aria-label="Search PPE catalog"
            />
          </>
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

        {ready && filteredItems.length > 0 && viewMode === "table" ? (
          <Table
            className="min-w-0"
            toolbar={
              <TableHeaderBar title="PPE Items" actions={toolbarActions} />
            }
            columns={buildColumns()}
            data={filteredItems}
            getRowId={(row) => row.id}
          />
        ) : null}

        {ready && filteredItems.length > 0 && viewMode === "grid" ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
              <TableHeaderBar
                title="PPE Items"
                actions={toolbarActions}
                className="border-b-0"
              />
            </div>

            <div className={CARD_GRID_CLASS}>
              {filteredItems.map((item) => (
                <PpeCatalogCard key={item.id} item={item} />
              ))}
            </div>
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
