"use client";

import { Table, TableTextCell, type TableColumn } from "@/components/ui";
import { FeatureEmptyState, FeatureErrorCard, FeatureLoadingCard } from "@/components/features/shared";
import type { LocationResponse } from "@/dtos/res/locations.res";
import { useLocationsBySite } from "@/hooks/useLocations";

const COLUMNS: TableColumn<LocationResponse>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => <TableTextCell>{row.name}</TableTextCell>,
  },
];

export function SiteLocationsTab({ siteId }: Readonly<{ siteId: number }>) {
  const { data, isLoading, isError, error, refetch } = useLocationsBySite(siteId);
  const rows = data ?? [];
  const hasData = !isLoading && !isError;

  return (
    <>
      {isLoading ? <FeatureLoadingCard label="Loading locations…" /> : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load locations"
          message={
            error instanceof Error
              ? error.message
              : "The location list did not load. Check your connection and try again."
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
          icon="mdi:map-marker-off-outline"
          title="No locations yet"
          description="This site has no locations recorded."
        />
      ) : null}

      {hasData && rows.length > 0 ? (
        <Table columns={COLUMNS} data={rows} getRowId={(row) => String(row.id)} />
      ) : null}
    </>
  );
}
