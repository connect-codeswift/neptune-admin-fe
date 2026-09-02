"use client";

import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { Button, ConfirmDialog } from "@/components/ui";
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

/** The grid recipe the catalog screens share: 3 → 2 → 1 across breakpoints. */
const CARD_GRID_CLASS =
  "stagger-cards grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3";

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
  const sectionHeadingId = useId();
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

  const viewModels = categories.map(mapDocCategory);

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
  } else if (viewModels.length === 0) {
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
  } else {
    body = (
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
    );
  }

  return (
    <section aria-labelledby={sectionHeadingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={sectionHeadingId} className="text3 text-ehs-darker">
          All Categories
        </h2>
        {!isPending && !isError && viewModels.length > 0 ? (
          <p className="text8 text-ehs-muted-text">
            {viewModels.length} categor{viewModels.length === 1 ? "y" : "ies"}
          </p>
        ) : null}
      </div>

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
