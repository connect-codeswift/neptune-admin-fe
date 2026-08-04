"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DUMMY_DOCUMENT_CATEGORIES,
  type DummyDocumentCategory,
} from "@/lib/dummy-doc-categories";
import {
  DocumentCategoryCard,
  type CategoryDraft,
} from "./DocumentCategoryCard";

export function DocumentCategoryGrid() {
  const [categories, setCategories] = useState(DUMMY_DOCUMENT_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>({ name: "", description: "" });

  const startEdit = (category: DummyDocumentCategory) => {
    setEditingId(category.id);
    setDraft({ name: category.name, description: category.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, name: draft.name, description: draft.description }
          : category,
      ),
    );
    setEditingId(null);
    toast.success("Category saved.");
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {categories.map((category) => (
        <DocumentCategoryCard
          key={category.id}
          category={category}
          isEditing={editingId === category.id}
          draft={draft}
          onDraftChange={setDraft}
          onEdit={() => startEdit(category)}
          onCancel={cancelEdit}
          onSave={() => saveEdit(category.id)}
        />
      ))}
    </div>
  );
}
