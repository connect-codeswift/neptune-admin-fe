"use client";

import { useState } from "react";

import { RoleCard } from "@/components/cards";
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ConfirmDialog,
  ModuleFilterBar,
  ModuleSearchBar,
  TABLE_HEADER_ACTION_CLASS,
  Table,
  TableHeaderBar,
  TableIconAction,
  TableTextCell,
  ViewModeToggle,
  type TableColumn,
  type ViewMode,
} from "@/components/ui";
import { GLASS_SURFACE, GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useDeleteRole,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import { getRoleStats, type RoleViewModel } from "@/lib/mappers/roles.mapper";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "system", label: "System" },
  { value: "custom", label: "Custom" },
] as const;

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <GlassCard className="min-h-24 justify-center px-5 py-4">
      {/* One wrapper child so GlassCard's own `gap` never separates the value
          from its label — the 4px `mt-1` below is the intended spacing. */}
      <div className="min-w-0">
        {/* text2 is the KPI role and carries tabular-nums, so this matches the
            stat row on User Management figure for figure. */}
        <p className="text2 text-darkest">{value}</p>
        <p className="mt-1 text8 text-gray">{label}</p>
      </div>
    </GlassCard>
  );
}

/**
 * Placeholder shaped like a RoleCard: title line, description line, a run of
 * permission chips and the action squares on the right. A stack of even grey
 * bars would collapse into the real cards and shift the page.
 */
function RoleListSkeleton() {
  const cards = Array.from({ length: 3 }, (_, index) => `role-${String(index)}`);
  const chips = ["a", "b", "c", "d"];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading roles…"
      className="flex flex-col gap-4"
    >
      {cards.map((key) => (
        <div key={key} className={`${GLASS_SURFACE} px-5 py-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-48 rounded-md bg-ehs-skeleton-strong" />
              <Skeleton className="h-3.5 w-full max-w-lg rounded-md" />
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <Skeleton
                    key={`${key}-${chip}`}
                    className="h-5 w-24 rounded-md"
                  />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="size-8 rounded-2.5" />
              <Skeleton className="size-8 rounded-2.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildColumns(
  basePath: string,
  onDelete: (role: RoleViewModel) => void,
): TableColumn<RoleViewModel>[] {
  return [
    {
      id: "role",
      header: "Role",
      cell: (row) => (
        <div
          className="max-w-80 min-w-0"
          title={`${row.name} · ${row.description || "No description provided."}`}
        >
          <p className="text5 text-ehs-darker truncate">{row.name}</p>
          <p className="text7 text-ehs-muted-text truncate">
            {row.description || "No description provided."}
          </p>
        </div>
      ),
    },
    {
      id: "rights",
      header: "Rights",
      cell: (row) => (
        <TableTextCell className="tabular-nums">
          {row.permissionIds.length}
        </TableTextCell>
      ),
    },
    {
      id: "users",
      header: "Users",
      cell: (row) => (
        <TableTextCell className="tabular-nums">
          {row.userCount}
        </TableTextCell>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <span
          className={[
            "text7 inline-flex items-center rounded-md px-2 py-0.5",
            row.isSystem
              ? "bg-blue-normal/12 text-blue-normal"
              : "bg-ehs-border-ink/6 text-darkest",
          ].join(" ")}
        >
          {row.isSystem ? "System" : "Custom"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-24",
      className: "w-24",
      cell: (row) => (
        // Labels name the row, not just the verb: a screen reader hitting six
        // "Edit" buttons in a column learns nothing from the sixth.
        <div className="flex items-center justify-end gap-1.5">
          <TableIconAction
            label={`View ${row.name}`}
            icon="lucide:eye"
            variant="primary"
            href={`${basePath}/${row.id}`}
          />
          <TableIconAction
            label={`Edit ${row.name}`}
            icon="lucide:pencil"
            href={`${basePath}/${row.id}/edit`}
          />
          {!row.isSystem ? (
            <TableIconAction
              label={`Delete ${row.name}`}
              icon="lucide:trash-2"
              onClick={() => onDelete(row)}
            />
          ) : null}
        </div>
      ),
    },
  ];
}

export function RolesAndRightsPage() {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  // `isPending` (not `isLoading`) so the query stays in its loading state while
  // it is still gated on the tenant scope resolving.
  const { data: roles = [], isPending, isError, error, refetch } =
    useRolesWithPermissions();
  const stats = getRoleStats(roles);

  const [pendingDelete, setPendingDelete] = useState<RoleViewModel | null>(null);
  const removeRole = useDeleteRole();

  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  // Table is the default: it is the denser view and the one the column set was
  // designed for. The choice is per-visit — it is not persisted anywhere.
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const trimmedSearch = search.trim().toLowerCase();

  const filteredRoles = roles.filter((role) => {
    let matchesType = true;
    if (typeFilter === "system") {
      matchesType = role.isSystem;
    } else if (typeFilter === "custom") {
      matchesType = !role.isSystem;
    }

    if (!matchesType) {
      return false;
    }

    if (!trimmedSearch) {
      return true;
    }

    return (
      role.name.toLowerCase().includes(trimmedSearch) ||
      role.description.toLowerCase().includes(trimmedSearch)
    );
  });

  const handleClearFilters = () => {
    setSearch("");
    setTypeFilter("");
  };

  const columns = buildColumns(basePath, setPendingDelete);

  // Shared by both views: the toolbar is the same strip whether it sits inside
  // the table card or above the card grid, so the actions are built once.
  const toolbarActions = (
    <>
      <Button
        size="sm"
        leftIcon="lucide:plus"
        href={`${basePath}/new`}
        className={TABLE_HEADER_ACTION_CLASS}
      >
        Create Role
      </Button>
      <ViewModeToggle
        value={viewMode}
        onChange={setViewMode}
        itemLabel="roles"
      />
    </>
  );

  let body = null;
  if (roles.length === 0) {
    body = (
      <FeatureEmptyState
        icon="lucide:shield-off"
        title="No roles yet"
        description="A role is a named set of rights. Until one exists, nobody in this organization can be given access to anything."
        action={
          <Button size="sm" leftIcon="lucide:plus" href={`${basePath}/new`}>
            Create your first role
          </Button>
        }
      />
    );
  } else if (filteredRoles.length === 0) {
    body = (
      <FeatureEmptyState
        icon="mdi:shield-search-outline"
        title="No roles match this search"
        description="No role name or description matches the current search and type filter."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="mdi:filter-off-outline"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
        }
      />
    );
  } else if (viewMode === "table") {
    body = (
      <Table
        toolbar={<TableHeaderBar title="Roles" actions={toolbarActions} />}
        columns={columns}
        data={filteredRoles}
        getRowId={(row) => row.id}
      />
    );
  } else {
    body = (
      <div className="flex min-w-0 flex-col gap-4">
        {/* The bar carries a bottom border to divide itself from the column
            headers it normally sits above; standing alone over a grid there is
            nothing to divide, so it is dropped. */}
        <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
          <TableHeaderBar
            title="Roles"
            actions={toolbarActions}
            className="border-b-0"
          />
        </div>

        <div className={CARD_GRID_CLASS}>
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              basePath={basePath}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title="Roles & Rights"
        description="Manage role definitions and rights sets for the platform"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights" },
        ]}
      />

      {isPending ? <RoleListSkeleton /> : null}

      {isError ? (
        <FeatureErrorCard
          title="Couldn’t load roles"
          message={
            error instanceof Error ? error.message : "Failed to load roles."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError ? (
        <>
          <ModuleFilterBar
            segments={[
              {
                label: "Type",
                value: typeFilter,
                onChange: setTypeFilter,
                options: TYPE_FILTER_OPTIONS,
              },
            ]}
          />

          <ModuleSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by role or description…"
            aria-label="Search roles"
            resultLabel={`${String(filteredRoles.length)} ${filteredRoles.length === 1 ? "role" : "roles"}`}
          />

          {body}
        </>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "role"}?`}
        // State the consequence rather than asking "are you sure": these people keep
        // their accounts and can do nothing at all until someone assigns them a role.
        description={
          pendingDelete && pendingDelete.userCount > 0
            ? `${pendingDelete.userCount} user${pendingDelete.userCount === 1 ? "" : "s"} will be moved to No_Permission and will have no access until you assign them a new role.`
            : "This role has no users assigned. It will be removed permanently."
        }
        confirmLabel="Delete role"
        confirmVariant="danger"
        loading={removeRole.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            removeRole.mutate(pendingDelete.numericId, {
              onSuccess: () => setPendingDelete(null),
            });
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
