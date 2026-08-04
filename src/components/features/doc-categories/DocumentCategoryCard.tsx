"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { TextInput } from "@/components/inputs";
import { Button, IconButton } from "@/components/ui";
import type { DummyDocumentCategory } from "@/lib/dummy-doc-categories";

type CategoryDraft = {
  name: string;
  description: string;
};

type DocumentCategoryCardProps = Readonly<{
  category: DummyDocumentCategory;
  isEditing: boolean;
  draft: CategoryDraft;
  onDraftChange: (draft: CategoryDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}>;

export function DocumentCategoryCard({
  category,
  isEditing,
  draft,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
}: DocumentCategoryCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-[20px] border border-white/90 bg-white/62 p-5 shadow-lg backdrop-blur-[10px]">
      <div className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-blue-normal/12 text-blue-normal"
          aria-hidden
        >
          <Icon icon="lucide:folder-open" width={18} height={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text3 text-darkest">{category.name}</h2>
                {category.required ? (
                  <span className="inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text7 font-semibold tracking-[0.5px] text-blue-normal uppercase">
                    Required
                  </span>
                ) : null}
              </div>
              {!isEditing ? (
                <p className="mt-1 text5 text-gray">{category.description}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <IconButton
                icon="lucide:pencil"
                label={`Edit ${category.name}`}
                size="sm"
                onClick={onEdit}
              />
              {category.deletable ? (
                <IconButton
                  icon="lucide:trash-2"
                  label={`Delete ${category.name}`}
                  size="sm"
                  variant="soft"
                  onClick={() =>
                    toast.info(`Delete ${category.name} is not wired yet.`)
                  }
                />
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-3 flex flex-col gap-3">
              <TextInput
                value={draft.name}
                onChange={(event) =>
                  onDraftChange({ ...draft, name: event.target.value })
                }
              />
              <TextInput
                value={draft.description}
                onChange={(event) =>
                  onDraftChange({ ...draft, description: event.target.value })
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button size="sm" leftIcon="lucide:save" onClick={onSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="text6 font-medium text-blue-normal">
        {category.documentCount} documents{" "}
        <span className="text-blue-normal/70">{category.slug}</span>
      </p>
    </article>
  );
}

export type { CategoryDraft };
