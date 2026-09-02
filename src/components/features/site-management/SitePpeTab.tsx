"use client";

import { FeatureEmptyState, FeatureErrorCard, FeatureLoadingCard } from "@/components/features/shared";
import { Table, TableTextCell, type TableColumn } from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import type { PpeResponse } from "@/dtos/res/ppe.res";
import { usePpeCatalogBySite } from "@/hooks/usePpeCatalog";

type SitePpeTabProps = Readonly<{
  siteId: number;
}>;

/** Every field on `PpeResponse` is optional — render a muted em-dash rather than blank or "undefined". */
function textOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function buildColumns(): TableColumn<PpeResponse>[] {
  return [
    {
      id: "category",
      header: "Category",
      cell: (row) => (
        <span className="text5 text-ehs-darker">{textOrDash(row.category)}</span>
      ),
    },
    {
      id: "stock",
      header: "In stock / Min stock",
      cell: (row) => (
        <TableTextCell>
          {textOrDash(row.inStock)} / {textOrDash(row.minStock)}
        </TableTextCell>
      ),
    },
    {
      id: "unitCost",
      header: "Unit cost",
      cell: (row) => <TableTextCell>{textOrDash(row.unitCost)}</TableTextCell>,
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: (row) => <TableTextCell muted>{textOrDash(row.supplier)}</TableTextCell>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <TableTextCell>{textOrDash(row.status)}</TableTextCell>,
    },
  ];
}

const columns = buildColumns();

/**
 * PPE catalog for an arbitrary site, scoped by `siteId` rather than the
 * caller's own tenant site — `usePpeCatalogBySite` keys its query on the
 * numeric id so it never collides with the logged-in user's own-site cache.
 */
export function SitePpeTab({ siteId }: SitePpeTabProps) {
  const { data, isLoading, isError, error, refetch } = usePpeCatalogBySite(siteId);
  const items = data ?? [];
  const hasData = !isLoading && !isError;

  return (
    <div className={`${GLASS_SURFACE} flex flex-col gap-4 p-5`}>
      {isLoading ? <FeatureLoadingCard label="Loading PPE catalog…" /> : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load PPE catalog"
          message={
            error instanceof Error
              ? error.message
              : "The PPE catalog did not load. Check your connection and try again."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {hasData && items.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="mdi:shield-off-outline"
          title="No PPE catalog items"
          description="No PPE items are currently stocked at this site."
        />
      ) : null}

      {hasData && items.length > 0 ? (
        <Table
          columns={columns}
          data={items}
          getRowId={(row) => String(row.id)}
          className="border-ehs-border-ink/8 bg-ehs-surface shadow-(--ehs-shadow-card) backdrop-blur-none"
        />
      ) : null}
    </div>
  );
}
