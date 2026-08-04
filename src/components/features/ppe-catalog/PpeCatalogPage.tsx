"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  getPpeCategoryCounts,
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

export function PpeCatalogPage() {
  const { adminHref } = usePpeCatalogPaths();
  const { data: items = [], isLoading, isError, error } = usePpeCatalog();
  const createPpeItem = useCreatePpeItem();
  const [activeCategory, setActiveCategory] = useState<PpeCategoryId | "all">(
    "all",
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categoryCounts = useMemo(() => getPpeCategoryCounts(items), [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, items]);

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
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:download"
              onClick={() => toast.success("Export started.")}
            >
              Export
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:plus"
              onClick={() => setAddModalOpen(true)}
            >
              Add PPE Item
            </Button>
          </>
        }
      />

      <PpeCatalogStatsRow items={items} />

      <PpeCategoryFilter
        activeCategory={activeCategory}
        counts={categoryCounts}
        onChange={setActiveCategory}
      />

      {isLoading ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading PPE catalog…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error ? error.message : "Failed to load PPE catalog."}
        </p>
      ) : null}

      {!isLoading && !isError && filteredItems.length === 0 ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          No PPE items in this category.
        </p>
      ) : null}

      {!isLoading && !isError && filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <PpeCatalogCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      <AddPpeItemModal
        open={addModalOpen}
        loading={createPpeItem.isPending}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}
