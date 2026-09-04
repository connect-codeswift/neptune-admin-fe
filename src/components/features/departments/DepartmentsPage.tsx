"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { TextInput } from "@/components/inputs";
import {
  Button,
  ConfirmDialog,
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
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { DepartmentCard } from "@/components/cards";
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
import type { DepartmentResponse } from "@/dtos/res/departments.res";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartmentsBySite,
  useUpdateDepartment,
} from "@/hooks/useDepartments";
import { buildOrgSitePath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";

/**
 * Department *writes* (add/rename/drop) take the site from the caller's org token
 * server-side, never from a URL parameter — see `FEGuides/Departments.md`, "Writes are
 * unchanged: they still take the site from the token only". Adding a department while
 * viewing another site would silently create it in the caller's own selected site instead,
 * so every write control here is gated on the `[site]` route segment matching the
 * `siteId` this page is showing.
 */
const OTHER_SITE_WRITE_NOTE =
  "Departments are managed on the site you are currently switched to — this view is showing another site.";

type DepartmentsPageProps = Readonly<{ siteId: number }>;

export function DepartmentsPage({ siteId }: DepartmentsPageProps) {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const isOwnSite = orgSite !== null && String(siteId) === orgSite.site;
  const adminHref = orgSite ? buildOrgSitePath(orgSite.company, orgSite.site) : "/dashboard";

  const { data, isLoading, isError, error, refetch } = useDepartmentsBySite(siteId);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DepartmentResponse | null>(null);
  const [search, setSearch] = useState("");
  // Table is the default: it is the denser view and the one the column set
  // was designed for. The choice is per-visit — it is not persisted anywhere.
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const rows = data ?? [];
  const hasData = !isLoading && !isError;

  const trimmedSearch = search.trim().toLowerCase();
  const filteredRows = trimmedSearch
    ? rows.filter((row) => row.name.toLowerCase().includes(trimmedSearch))
    : rows;

  const startEdit = (department: DepartmentResponse) => {
    setEditingId(department.id);
    setEditName(department.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await createMutation.mutateAsync({ name: trimmed });
      toast.success("Department added.");
      setNewName("");
      setIsAdding(false);
    } catch (addError) {
      toast.error(
        addError instanceof Error ? addError.message : "Failed to add department.",
      );
    }
  };

  const handleRename = async (id: number) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    try {
      await updateMutation.mutateAsync({ id, payload: { name: trimmed } });
      toast.success("Department renamed.");
      cancelEdit();
    } catch (renameError) {
      toast.error(
        renameError instanceof Error
          ? renameError.message
          : "Failed to rename department.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Department dropped.");
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to drop department.",
      );
    }
  };

  const columns: TableColumn<DepartmentResponse>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) =>
        editingId === row.id ? (
          <TextInput
            aria-label={`Rename ${row.name}`}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            containerClassName="max-w-xs"
          />
        ) : (
          <TableTextCell>{row.name}</TableTextCell>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      headerClassName: "w-24",
      className: "w-24",
      cell: (row) => {
        if (editingId === row.id) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableIconAction
                label={`Save ${row.name}`}
                icon="lucide:check"
                variant="primary"
                onClick={() => void handleRename(row.id)}
              />
              <TableIconAction
                label="Cancel"
                icon="lucide:x"
                onClick={cancelEdit}
              />
            </div>
          );
        }

        // Both actions vanish behind a disabled state on another site rather than
        // fully hiding, so the reason stays discoverable — same treatment
        // `DocumentCategoryCard` gives edit/delete.
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
                label={`Drop ${row.name} (unavailable)`}
                icon="lucide:trash-2"
                disabled
                title={OTHER_SITE_WRITE_NOTE}
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
              label={`Drop ${row.name}`}
              icon="lucide:trash-2"
              onClick={() => setDeleteTarget(row)}
            />
          </div>
        );
      },
    },
  ];

  // Shared by both views: the toolbar is the same strip whether it sits inside
  // the table card or above the card grid, so the actions are built once.
  const toolbarActions = (
    <>
      {isOwnSite ? (
        <Button
          size="sm"
          leftIcon="lucide:plus"
          onClick={() => setIsAdding(true)}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          Add department
        </Button>
      ) : (
        <p className="max-w-xs text-right text8 text-ehs-muted-text">
          {OTHER_SITE_WRITE_NOTE}
        </p>
      )}
      <ViewModeToggle
        value={viewMode}
        onChange={setViewMode}
        itemLabel="departments"
      />
    </>
  );

  const handleClearSearch = () => setSearch("");

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Departments"
        description="Departments recorded for this site, used across incident and inspection pickers."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Departments" },
        ]}
      />

      {isAdding && isOwnSite ? (
        <div className="flex flex-wrap items-end justify-end gap-2">
          <TextInput
            label="Department name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            containerClassName="w-64"
          />
          <Button
            size="sm"
            loading={createMutation.isPending}
            loadingText="Adding…"
            disabled={!newName.trim()}
            onClick={() => void handleAdd()}
          >
            Add
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewName("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}

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
        <ModuleSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search departments…"
          aria-label="Search departments"
          resultLabel={`${filteredRows.length} ${filteredRows.length === 1 ? "department" : "departments"}`}
        />
      ) : null}

      {hasData && rows.length > 0 && filteredRows.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          className="min-h-0 py-8"
          icon="mdi:magnify-close"
          title="No departments match this search"
          description="No department name matches the current search."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:filter-off-outline"
              onClick={handleClearSearch}
            >
              Clear search
            </Button>
          }
        />
      ) : null}

      {hasData && filteredRows.length > 0 ? (
        viewMode === "table" ? (
          <Table
            toolbar={
              <TableHeaderBar title="Departments" actions={toolbarActions} />
            }
            columns={columns}
            data={filteredRows}
            getRowId={(row) => String(row.id)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* The bar carries a bottom border to divide itself from the
                column headers it normally sits above; standing alone over a
                grid there is nothing to divide, so it is dropped. */}
            <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
              <TableHeaderBar
                title="Departments"
                actions={toolbarActions}
                className="border-b-0"
              />
            </div>

            <div className={CARD_GRID_CLASS}>
              {filteredRows.map((row) => {
                if (editingId === row.id) {
                  return (
                    <DepartmentCard
                      key={row.id}
                      department={row}
                      isEditing
                      draftName={editName}
                      onDraftNameChange={setEditName}
                      onStartEdit={() => startEdit(row)}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={() => void handleRename(row.id)}
                      onDelete={() => setDeleteTarget(row)}
                      saving={updateMutation.isPending}
                    />
                  );
                }

                if (!isOwnSite) {
                  return (
                    <DepartmentCard
                      key={row.id}
                      department={row}
                      isEditing={false}
                      draftName={row.name}
                      onDraftNameChange={setEditName}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={() => void handleRename(row.id)}
                      disabledReason={OTHER_SITE_WRITE_NOTE}
                    />
                  );
                }

                return (
                  <DepartmentCard
                    key={row.id}
                    department={row}
                    isEditing={false}
                    draftName={row.name}
                    onDraftNameChange={setEditName}
                    onStartEdit={() => startEdit(row)}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={() => void handleRename(row.id)}
                    onDelete={() => setDeleteTarget(row)}
                  />
                );
              })}
            </div>
          </div>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Drop ${deleteTarget?.name ?? "department"}?`}
        // This is a soft delete that always succeeds — the row stays and every document
        // filed under it keeps resolving its name, it just leaves the pickers. So the
        // copy says "stop offering", not "delete", and does not claim data loss.
        description="This stops offering the department in pickers. Documents already filed under it keep this name. It can be added again later, as a new entry."
        cancelLabel="Keep department"
        confirmLabel="Drop department"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
