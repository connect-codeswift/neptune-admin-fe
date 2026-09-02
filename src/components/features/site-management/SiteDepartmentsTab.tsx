"use client";

import { Table, TableTextCell, type TableColumn } from "@/components/ui";
import { FeatureEmptyState, FeatureErrorCard, FeatureLoadingCard } from "@/components/features/shared";
import type { DepartmentResponse } from "@/dtos/res/departments.res";
import { useDepartmentsBySite } from "@/hooks/useDepartments";

const COLUMNS: TableColumn<DepartmentResponse>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => <TableTextCell>{row.name}</TableTextCell>,
  },
];

export function SiteDepartmentsTab({ siteId }: Readonly<{ siteId: number }>) {
  const { data, isLoading, isError, error, refetch } = useDepartmentsBySite(siteId);
  const rows = data ?? [];
  const hasData = !isLoading && !isError;

  return (
    <>
      {isLoading ? <FeatureLoadingCard label="Loading departments…" /> : null}

      {isError ? (
        <FeatureErrorCard
          surface={false}
          title="Couldn’t load departments"
          message={
            error instanceof Error
              ? error.message
              : "The department list did not load. Check your connection and try again."
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
          icon="mdi:office-building-off-outline"
          title="No departments yet"
          description="This site has no departments recorded."
        />
      ) : null}

      {hasData && rows.length > 0 ? (
        <Table columns={COLUMNS} data={rows} getRowId={(row) => String(row.id)} />
      ) : null}
    </>
  );
}
