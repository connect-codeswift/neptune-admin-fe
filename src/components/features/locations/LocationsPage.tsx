"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TextInput } from "@/components/inputs";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ConfirmDialog,
  ModuleSearchBar,
  Table,
  TABLE_HEADER_ACTION_CLASS,
  TableHeaderBar,
  TableIconAction,
  TableTextCell,
  ViewModeToggle,
  type TableColumn,
  type ViewMode,
} from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
import { LocationCard } from "@/components/cards/LocationCard";
import type { LocationResponse } from "@/dtos/res/locations.res";
import {
  useCreateLocation,
  useDeleteLocation,
  useLocationsBySite,
  useUpdateLocation,
} from "@/hooks/useLocations";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";

/**
 * Location *writes* (add/rename/drop) take the site from the caller's org
 * token server-side, never from a URL parameter — see
 * `FEGuides/Locations.md`: "Writes are unchanged: they still take the site
 * from the token only." Adding or editing a location while viewing another
 * site would silently write into the wrong one, so the row actions and the
 * add control below are gated on the `[site]` route segment matching the
 * site this page is showing — the same check `DocumentCategoriesPage` uses.
 */
const OTHER_SITE_WRITE_NOTE =
  "Locations are managed on the site you are currently switched to — this view is showing another site.";

type LocationsPageProps = Readonly<{ siteId: number }>;

export function LocationsPage({ siteId }: LocationsPageProps) {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const isOwnSite = orgSite !== null && String(siteId) === orgSite.site;
  const adminHref = orgSite ? buildOrgSitePath(orgSite.company, orgSite.site) : "/dashboard";

  const { data, isLoading, isError, error, refetch } = useLocationsBySite(siteId);
  const rows = data ?? [];
  const hasData = !isLoading && !isError;

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LocationResponse | null>(null);
  // Table is the default, same reasoning as UserManagementPage: it is the
  // denser view. The choice is per-visit, not persisted.
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter((row) => row.name.toLowerCase().includes(normalizedSearch))
    : rows;

  const startAdd = () => {
    setIsAdding(true);
    setNewName("");
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewName("");
  };

  const submitAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await createMutation.mutateAsync({ name: trimmed });
      toast.success("Location added.");
      setIsAdding(false);
      setNewName("");
    } catch (addError) {
      toast.error(
        addError instanceof Error ? addError.message : "Failed to add location.",
      );
    }
  };

  const startEdit = (location: LocationResponse) => {
    setEditingId(location.id);
    setEditName(location.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (location: LocationResponse) => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === location.name) {
      cancelEdit();
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: location.id, payload: { name: trimmed } });
      toast.success("Location renamed.");
      cancelEdit();
    } catch (editError) {
      toast.error(
        editError instanceof Error ? editError.message : "Failed to rename location.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Location removed from the picker.");
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to remove location.",
      );
    }
  };

  const columns: TableColumn<LocationResponse>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => {
        if (isOwnSite && editingId === row.id) {
          return (
            <TextInput
              aria-label={`Rename ${row.name}`}
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              containerClassName="max-w-72"
            />
          );
        }
        return <TableTextCell>{row.name}</TableTextCell>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-24",
      className: "w-24",
      cell: (row) => {
        if (!isOwnSite) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableIconAction
                label={`Rename ${row.name} (unavailable)`}
                icon="lucide:pencil"
                disabled
                title={OTHER_SITE_WRITE_NOTE}
              />
              <TableIconAction
                label={`Remove ${row.name} (unavailable)`}
                icon="lucide:trash-2"
                disabled
                title={OTHER_SITE_WRITE_NOTE}
              />
            </div>
          );
        }

        if (editingId === row.id) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableIconAction
                label="Cancel rename"
                icon="lucide:x"
                onClick={cancelEdit}
              />
              <TableIconAction
                label={`Save ${row.name}`}
                icon="lucide:check"
                variant="primary"
                onClick={() => void saveEdit(row)}
              />
            </div>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <TableIconAction
              label={`Rename ${row.name}`}
              icon="lucide:pencil"
              onClick={() => startEdit(row)}
            />
            <TableIconAction
              label={`Remove ${row.name}`}
              icon="lucide:trash-2"
              onClick={() => setDeleteTarget(row)}
            />
          </div>
        );
      },
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  // Shared by both views, same as UserManagementPage: the toolbar is one
  // strip whether it sits inside the table card or above the card grid.
  const toolbarActions = (
    <>
      {isOwnSite ? (
        <Button
          size="sm"
          leftIcon="lucide:map-pin-plus"
          onClick={startAdd}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          Add location
        </Button>
      ) : (
        <p className="max-w-56 text-right text8 text-ehs-muted-text">
          {OTHER_SITE_WRITE_NOTE}
        </p>
      )}
      <ViewModeToggle value={viewMode} onChange={setViewMode} itemLabel="locations" />
    </>
  );

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Locations"
        description="Locations recorded for this site, used across incident and inspection pickers."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Locations" },
        ]}
      />

      <ModuleSearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Search locations…"
        aria-label="Search locations"
        resultLabel={`${String(filteredRows.length)} ${filteredRows.length === 1 ? "location" : "locations"}`}
      />

      {isAdding && isOwnSite ? (
        <div className="flex flex-wrap items-end justify-end gap-2">
          <TextInput
            label="Location name"
            value={newName}
            autoFocus
            onChange={(event) => setNewName(event.target.value)}
            containerClassName="w-56"
          />
          <Button variant="secondary" size="sm" onClick={cancelAdd}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!newName.trim()}
            loading={createMutation.isPending}
            onClick={() => void submitAdd()}
          >
            Add
          </Button>
        </div>
      ) : null}

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

      {hasData && rows.length > 0 && filteredRows.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="mdi:map-marker-question-outline"
          title="No locations match this search"
          description="Nobody at this site has a location matching the current search."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:filter-off-outline"
              onClick={clearSearch}
            >
              Clear search
            </Button>
          }
        />
      ) : null}

      {hasData && filteredRows.length > 0 ? (
        <>
          {viewMode === "table" ? (
            <Table
              columns={columns}
              data={filteredRows}
              getRowId={(row) => String(row.id)}
              toolbar={
                <TableHeaderBar title="Locations" actions={toolbarActions} />
              }
            />
          ) : (
            <div className="flex min-w-0 flex-col gap-4">
              <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
                <TableHeaderBar
                  title="Locations"
                  actions={toolbarActions}
                  className="border-b-0"
                />
              </div>

              <div className={CARD_GRID_CLASS}>
                {filteredRows.map((row) => {
                  let onStartEdit: (() => void) | undefined = () =>
                    startEdit(row);
                  let onDelete: (() => void) | undefined = () =>
                    setDeleteTarget(row);
                  if (!isOwnSite) {
                    onStartEdit = undefined;
                    onDelete = undefined;
                  }

                  return (
                    <LocationCard
                      key={row.id}
                      location={row}
                      isEditing={isOwnSite && editingId === row.id}
                      draftName={editName}
                      onDraftNameChange={setEditName}
                      onStartEdit={onStartEdit}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={() => void saveEdit(row)}
                      onDelete={onDelete}
                      disabledReason={
                        isOwnSite ? undefined : OTHER_SITE_WRITE_NOTE
                      }
                      saving={updateMutation.isPending && editingId === row.id}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Stop offering ${deleteTarget?.name ?? "this location"}?`}
        // This is a soft delete that always succeeds: the row and every
        // historical record pointing at it are untouched. Only the picker
        // entry goes away, so the copy says so rather than warning of loss.
        description="This location will leave every picker across the site, but nothing referencing it is deleted or changed. You can add it again later if needed."
        cancelLabel="Keep location"
        confirmLabel="Stop offering"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
