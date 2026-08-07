"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui";
import {
  useDeleteDocCategory,
  useDocCategories,
  useUpdateDocCategory,
  mapDocCategory,
  type DocCategoryViewModel,
} from "@/hooks/useDocCategories";
import {
  DocumentCategoryCard,
  type CategoryDraft,
} from "./DocumentCategoryCard";

export function DocumentCategoryGrid() {
  // `isPending` (not `isLoading`) so the query stays in its loading state while
  // it is still gated on the tenant scope — a disabled query reports
  // `isLoading === false` with no data, which would flash the empty state.
  const { data: categories = [], isPending, isError, error } =
    useDocCategories();
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

  if (isPending) {
    return (
      <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
        Loading categories…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
        {error instanceof Error ? error.message : "Failed to load categories."}
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category"
        description={
          deleteTarget ? (
            <>
              Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </>
          ) : null
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {viewModels.length === 0 ? (
          <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px] xl:col-span-2">
            No categories yet. Create the first one to get started.
          </p>
        ) : (
          viewModels.map((category) => (
            <DocumentCategoryCard
              key={category.id}
              category={category}
              isEditing={editingId === category.id}
              draft={draft}
              onDraftChange={setDraft}
              onEdit={() => startEdit(category)}
              onCancel={cancelEdit}
              onSave={() => void saveEdit(category.id)}
              onDelete={
                category.deletable
                  ? () => setDeleteTarget(category)
                  : undefined
              }
            />
          ))
        )}
      </div>
    </>
  );
}
