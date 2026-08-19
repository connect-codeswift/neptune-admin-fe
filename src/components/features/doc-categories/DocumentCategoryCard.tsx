"use client";

import type { DocCategoryViewModel } from "@/hooks/useDocCategories";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, IconButton } from "@/components/ui";

type CategoryDraft = {
  name: string;
  description: string;
};

type DocumentCategoryCardProps = Readonly<{
  category: DocCategoryViewModel;
  isEditing: boolean;
  draft: CategoryDraft;
  onDraftChange: (draft: CategoryDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}>;

function MetaChip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-ehs-border-ink/6 px-2 py-0.5 text8 text-ehs-slate">
      {label}
    </span>
  );
}

export function DocumentCategoryCard({
  category,
  isEditing,
  draft,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: DocumentCategoryCardProps) {
  const trimmedName = draft.name.trim();
  const nameError =
    trimmedName === "" ? "A category needs a name." : undefined;
  // Dirty against the saved record, not against the draft's opening value: the
  // Save button should be inert until something has actually changed.
  const isDirty =
    trimmedName !== category.name ||
    draft.description.trim() !== category.description;
  const canSave = isDirty && !nameError;

  return (
    // `h-full` plus the `mt-auto` footer keeps every card in the row the same
    // height, so a category with a long description does not leave its
    // neighbours with a ragged gap under the metadata line.
    <GlassCard className="h-full p-5">
      {/* One wrapper child: GlassCard supplies its own `gap`, and these
          blocks already space themselves. */}
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-ehs-normal-blue/12 text-ehs-normal-blue"
            aria-hidden="true"
          >
            <Icon icon="lucide:folder-open" width={18} height={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="line-clamp-2 min-w-0 text3 text-ehs-darker"
                title={category.name}
              >
                {category.name}
              </h3>
              {category.required ? (
                <span className="inline-flex items-center rounded-md bg-ehs-normal-blue/12 px-2 py-0.5 text7 tracking-[0.5px] text-ehs-normal-blue uppercase">
                  Required
                </span>
              ) : null}
            </div>
            {!isEditing ? (
              <p
                className="mt-1 line-clamp-2 text4 text-ehs-gray"
                title={category.description || undefined}
              >
                {category.description || "No description."}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <IconButton
              icon="lucide:pencil"
              label={`Edit ${category.name}`}
              size="sm"
              disabled={isEditing}
              onClick={onEdit}
            />
            {/* The delete control used to vanish for a category that still has
                documents, which left two cards with different action rows and
                no explanation. It stays put and says why it is off. */}
            {onDelete ? (
              <IconButton
                icon="lucide:trash-2"
                label={`Delete ${category.name}`}
                size="sm"
                variant="soft"
                onClick={onDelete}
              />
            ) : (
              <span
                className="inline-flex"
                title={`${category.name} still has documents filed under it, so it cannot be deleted.`}
              >
                <IconButton
                  icon="lucide:trash-2"
                  label={`Delete ${category.name} (unavailable — documents are filed under it)`}
                  size="sm"
                  variant="soft"
                  disabled
                />
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <TextInput
              label="Category name"
              value={draft.name}
              error={nameError}
              onChange={(event) =>
                onDraftChange({ ...draft, name: event.target.value })
              }
            />
            <TextInput
              label="Description"
              placeholder="What belongs in this category"
              helperText="Shown under the name wherever the category is picked."
              value={draft.description}
              onChange={(event) =>
                onDraftChange({ ...draft, description: event.target.value })
              }
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                leftIcon="lucide:save"
                disabled={!canSave}
                onClick={onSave}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-ehs-border-ink/8 pt-3">
          <span className="text8 text-ehs-normal-blue tabular-nums">
            {category.documentCount} document
            {category.documentCount === 1 ? "" : "s"}
          </span>
          <MetaChip label={category.slug} />
          {category.requiresApproval ? <MetaChip label="Approval workflow" /> : null}
          {category.retentionDays != null ? (
            <MetaChip label={`Retention ${category.retentionDays}d`} />
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

export type { CategoryDraft };
