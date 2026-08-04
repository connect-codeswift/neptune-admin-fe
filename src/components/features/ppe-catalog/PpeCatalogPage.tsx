"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  DUMMY_PPE_ITEMS,
  getPpeCategoryCounts,
  type DummyPpeItem,
  type PpeCategoryId,
} from "@/lib/dummy-ppe-catalog";
import { AddPpeItemModal } from "./AddPpeItemModal";
import { PpeCatalogCard } from "./PpeCatalogCard";
import { PpeCatalogStatsRow } from "./PpeCatalogStatsRow";
import { PpeCategoryFilter } from "./PpeCategoryFilter";
import { usePpeCatalogPaths } from "./usePpeCatalogPaths";

export function PpeCatalogPage() {
  const { adminHref } = usePpeCatalogPaths();
  const [items, setItems] = useState<DummyPpeItem[]>(DUMMY_PPE_ITEMS);
  const [activeCategory, setActiveCategory] = useState<PpeCategoryId | "all">(
    "all",
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categoryCounts = useMemo(() => getPpeCategoryCounts(items), [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, items]);

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

      {filteredItems.length === 0 ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          No PPE items in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <PpeCatalogCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <AddPpeItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={(item) => setItems((current) => [item, ...current])}
      />
    </div>
  );
}
