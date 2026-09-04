"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { TextInput } from "@/components/inputs";
import {
  Button,
  ConfirmDialog,
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
import { CARD_GRID_CLASS } from "@/components/cards/card-grid";
import {
  useDeleteDocCategory,
  useDocCategoriesBySite,
  useUpdateDocCategory,
  mapDocCategory,
  type DocCategoryViewModel,
} from "@/hooks/useDocCategories";
import {
  DocumentCategoryCard,
  type CategoryDraft,
} from "./DocumentCategoryCard";


/** Same reason `DocumentCategoriesPage` gates its header — see there. */
const OTHER_SITE_WRITE_NOTE =
  "Categories are managed on the site you are currently switched to — this view is showing another site.";

type DocumentCategoryGridProps = Readonly<{
  siteId: number;
  /** Whether `siteId` is the caller's own token site — gates every write control below. */
  isOwnSite: boolean;
  /**
   * Opens the create form. The empty state is the one place a first-time user
   * lands, so it needs the same primary action the page header carries.
   */
  onCreate?: () => void;
}>;

export function DocumentCategoryGrid({
  siteId,
  isOwnSite,
  onCreate,
}: DocumentCategoryGridProps) {
  // `isPending` (not `isLoading`) so the query stays in its loading state while
  // it is still gated on a valid siteId — a disabled query reports
  // `isLoading === false` with no data, which would flash the empty state.
  const { data: categories = [], isPending, isError, error, refetch } =
    useDocCategoriesBySite(siteId);
  const updateMutation = useUpdateDocCategory();
  const deleteMutation = useDeleteDocCategory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>({ name: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState<DocCategoryViewModel | null>(
    null,
  );
  // Table is the default here even though this screen has always been cards:
  // the register pages all open on the denser view, and a category's slug,
  // document count and flags line up far better in columns than in tiles.
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [requiredFilter, setRequiredFilter] = useState("");

  const allViewModels = categories.map(mapDocCategory);

  // `required` is the one genuinely exclusive flag on a category — approval and
  // retention can both be true at once, so a single-select segment over them
  // would claim a choice the data does not have.
  const normalizedSearch = search.trim().toLowerCase();
  const viewModels = allViewModels.filter((category) => {
    if (requiredFilter === "required" && !category.required) return false;
    if (requiredFilter === "optional" && category.required) return false;
    if (normalizedSearch === "") return true;
    return (
      category.name.toLowerCase().includes(normalizedSearch) ||
      category.description.toLowerCase().includes(normalizedSearch) ||
      category.slug.toLowerCase().includes(normalizedSearch)
    );
  });

  const filtersActive = normalizedSearch !== "" || requiredFilter !== "";

  function clearFilters() {
    setSearch("");
    setRequiredFilter("");
  }

  const startEdit = (category: DocCategoryViewModel) => {
    setEditingId(category.id);
    setDraft({ name: category.name, description: category.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id: Number(id),
        payload: {
          categorytName: draft.name.trim(),
          description: draft.description.trim() || null,
        },
      });
      setEditingId(null);
      toast.success("Category saved.");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save category.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(Number(deleteTarget.id));
      toast.success("Category deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete category.",
      );
    }
  };

  /**
   * The table mirrors the card exactly: the same inline rename, the same two
   * disabled reasons, the same delete. A view that could only read would make
   * the toggle a trap — you would switch to it and lose the ability to edit.
   */
  function buildColumns(): TableColumn<DocCategoryViewModel>[] {
    return [
      {
        id: "category",
        header: "Category",
        cell: (row) => {
          if (editingId === row.id) {
            return (
              <div className="flex min-w-0 flex-col gap-2 py-1">
                <TextInput
                  label="Category name"
                  value={draft.name}
                  error={draft.name.trim() === "" ? "A category needs a name." : undefined}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
                <TextInput
                  label="Description"
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
              </div>
            );
          }

          return (
            <div className="min-w-0" title={`${row.name} · ${row.description}`}>
              <p className="text4 text-ehs-darker truncate">{row.name}</p>
              <p className="text8 text-ehs-muted-text mt-0.5 max-w-80 truncate">
                {row.description || "No description."}
              </p>
            </div>
          );
        },
      },
      {
        id: "slug",
        header: "Slug",
        cell: (row) => <TableTextCell>{row.slug}</TableTextCell>,
      },
      {
        id: "documents",
        header: "Documents",
        cell: (row) => (
          <span className="text4 text-ehs-darker tabular-nums">
            {row.documentCount}
          </span>
        ),
      },
      {
        id: "flags",
        header: "Rules",
        cell: (row) => {
          const flags: string[] = [];
          if (row.required) flags.push("Required");
          if (row.requiresApproval) flags.push("Approval");
          if (row.retentionDays != null) {
            flags.push(`Retention ${String(row.retentionDays)}d`);
          }

          if (flags.length === 0) {
            return <TableTextCell>—</TableTextCell>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {flags.map((flag) => (
                <span
                  key={flag}
                  className="bg-ehs-border-ink/6 text-ehs-slate inline-flex items-center rounded-md px-2 py-0.5 text8"
                >
                  {flag}
                </span>
              ))}
            </div>
          );
        },
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
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={draft.name.trim() === ""}
                  loading={updateMutation.isPending}
                  onClick={() => void saveEdit(row.id)}
                >
                  Save
                </Button>
              </div>
            );
          }

          // Same two reasons the cards carry: viewing another site, or the
          // category still has documents filed under it.
          let deleteReason: string | undefined;
          if (!isOwnSite) {
            deleteReason = OTHER_SITE_WRITE_NOTE;
          } else if (!row.deletable) {
            deleteReason = `${row.name} still has documents filed under it, so it cannot be deleted.`;
          }

          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableIconAction
                icon="lucide:pencil"
                label={`Edit ${row.name}`}
                disabled={!isOwnSite}
                title={isOwnSite ? undefined : OTHER_SITE_WRITE_NOTE}
                onClick={() => startEdit(row)}
              />
              <TableIconAction
                icon="lucide:trash-2"
                label={`Delete ${row.name}`}
                disabled={Boolean(deleteReason)}
                title={deleteReason}
                onClick={() => setDeleteTarget(row)}
              />
            </div>
          );
        },
      },
    ];
  }

  const toolbarActions = (
    <>
      <span className="text8 text-ehs-muted-text shrink-0 tabular-nums">
        {filtersActive
          ? `${String(viewModels.length)} of ${String(allViewModels.length)} shown`
          : `${String(allViewModels.length)} categor${allViewModels.length === 1 ? "y" : "ies"}`}
      </span>
      <ViewModeToggle
        value={viewMode}
        onChange={setViewMode}
        itemLabel="categories"
      />
    </>
  );

  let body: ReactNode;
  if (isPending) {
    body = (
      <FeatureLoadingGrid
        count={3}
        label="Loading document categories…"
        className={CARD_GRID_CLASS}
        cardClassName="min-h-52"
      />
    );
  } else if (isError) {
    body = (
      <FeatureErrorCard
        title="Couldn’t load categories"
        message={
          error instanceof Error ? error.message : "Failed to load categories."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  } else if (allViewModels.length === 0) {
    body = (
      <FeatureEmptyState
        icon="lucide:folder-open"
        title="No categories yet"
        description="Categories are how documents get filed, found and — where the category demands it — routed for approval. None exist for this organization."
        action={
          onCreate ? (
            <Button size="sm" leftIcon="lucide:folder-plus" onClick={onCreate}>
              Add your first category
            </Button>
          ) : (
            <p className="max-w-md text8 text-ehs-muted-text">
              {OTHER_SITE_WRITE_NOTE}
            </p>
          )
        }
      />
    );
  } else if (viewModels.length === 0) {
    // Filtered to nothing is a different dead end from an empty catalog, and
    // needs the way back out rather than the way to add a first category.
    body = (
      <FeatureEmptyState
        icon="lucide:filter-x"
        title="No categories match"
        description="No category matches the current search and filter."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="lucide:filter-x"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        }
      />
    );
  } else if (viewMode === "table") {
    body = (
      <Table
        className="min-w-0"
        toolbar={
          <TableHeaderBar title="All Categories" actions={toolbarActions} />
        }
        columns={buildColumns()}
        data={viewModels}
        getRowId={(row) => row.id}
      />
    );
  } else {
    body = (
      <div className="flex min-w-0 flex-col gap-4">
        <div className={[GLASS_SURFACE, "overflow-hidden"].join(" ")}>
          <TableHeaderBar
            title="All Categories"
            actions={toolbarActions}
            className="border-b-0"
          />
        </div>

        <div className={CARD_GRID_CLASS}>
        {viewModels.map((category) => {
          // Editing and deleting write to the token's site; on another
          // site's view both controls stay disabled with the same reason,
          // deleting keeps its own "still has documents" reason when it
          // applies on the caller's own site.
          let deleteDisabledReason: string | undefined;
          if (!isOwnSite) {
            deleteDisabledReason = OTHER_SITE_WRITE_NOTE;
          } else if (!category.deletable) {
            deleteDisabledReason = `${category.name} still has documents filed under it, so it cannot be deleted.`;
          }

          return (
            <DocumentCategoryCard
              key={category.id}
              category={category}
              isEditing={editingId === category.id}
              draft={draft}
              onDraftChange={setDraft}
              onEdit={isOwnSite ? () => startEdit(category) : undefined}
              editDisabledReason={isOwnSite ? undefined : OTHER_SITE_WRITE_NOTE}
              onCancel={cancelEdit}
              onSave={() => void saveEdit(category.id)}
              onDelete={
                deleteDisabledReason ? undefined : () => setDeleteTarget(category)
              }
              deleteDisabledReason={deleteDisabledReason}
            />
          );
        })}
        </div>
      </div>
    );
  }

  return (
    // The heading and the count used to sit here as a bare row above the
    // cards. Both moved into `TableHeaderBar`, which carries the title, the
    // count and the view toggle in one strip inside the card — so this section
    // is labelled by that heading instead of one of its own.
    <section aria-label="All Categories" className="flex flex-col gap-4">
      {/* Only once there is something to sift — below that the controls cost
          more room than the scanning they save. */}
      {!isPending && !isError && allViewModels.length > 0 ? (
        <>
          <ModuleFilterBar
            segments={[
              {
                label: "Required",
                value: requiredFilter,
                onChange: setRequiredFilter,
                options: [
                  { value: "", label: "All" },
                  { value: "required", label: "Required" },
                  { value: "optional", label: "Optional" },
                ],
              },
            ]}
          />

          <ModuleSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, description or slug…"
            aria-label="Search document categories"
          />
        </>
      ) : null}

      {body}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name ?? "category"}?`}
        // State the consequence, not "are you sure". Only categories with no
        // documents can reach this dialog, so the consequence is about the
        // pickers the category disappears from rather than about lost files.
        description="No documents are filed under this category, so nothing is lost. It will disappear from every document picker and cannot be restored."
        cancelLabel="Keep category"
        confirmLabel="Delete category"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
