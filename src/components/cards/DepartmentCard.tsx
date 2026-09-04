"use client";

import { TextInput } from "@/components/inputs";
import { Button, GlassCard, IconButton } from "@/components/ui";
import type { DepartmentResponse } from "@/dtos/res/departments.res";

export type DepartmentCardProps = Readonly<{
  department: DepartmentResponse;
  isEditing: boolean;
  draftName: string;
  onDraftNameChange: (value: string) => void;
  /** Absent when renaming is unavailable — see `disabledReason`. */
  onStartEdit?: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  /** Absent when deleting is unavailable — see `disabledReason`. */
  onDelete?: () => void;
  /** Why `onStartEdit`/`onDelete` are absent, shown on the disabled buttons. */
  disabledReason?: string;
  saving?: boolean;
}>;

/**
 * Grid-view counterpart to a row of the departments table.
 *
 * The DTO is only `{ id, name }`, so there is no badge or metadata row to
 * carry — the name is the whole card. Rename happens inline, the same as the
 * table cell, and edit/delete fall back to a disabled button carrying
 * `disabledReason` as its `title` when the caller is viewing another site —
 * the same treatment `DocumentCategoryCard` gives its own edit/delete pair,
 * because a disabled button takes `pointer-events: none` and would otherwise
 * swallow its own tooltip.
 */
export function DepartmentCard({
  department,
  isEditing,
  draftName,
  onDraftNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  disabledReason,
  saving = false,
}: DepartmentCardProps) {
  const trimmed = draftName.trim();
  const canSave = trimmed.length > 0;

  return (
    // `h-full` with the `mt-auto` footer keeps a row of cards level even
    // though this card has no metadata to vary its height.
    <GlassCard className="h-full p-4">
      <div className="flex h-full min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <TextInput
                aria-label={`Rename ${department.name}`}
                value={draftName}
                onChange={(event) => onDraftNameChange(event.target.value)}
              />
            ) : (
              <p className="line-clamp-2 text3 text-ehs-darker" title={department.name}>
                {department.name}
              </p>
            )}
          </div>

          {!isEditing ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <IconButton
                icon="lucide:pencil"
                label={onStartEdit ? `Rename ${department.name}` : `Rename ${department.name} (unavailable)`}
                size="sm"
                disabled={!onStartEdit}
                disabledReason={disabledReason}
                onClick={onStartEdit}
              />
              <IconButton
                icon="lucide:trash-2"
                label={onDelete ? `Drop ${department.name}` : `Drop ${department.name} (unavailable)`}
                size="sm"
                variant="soft"
                disabled={!onDelete}
                disabledReason={disabledReason}
                onClick={onDelete}
              />
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:check"
              loading={saving}
              loadingText="Saving…"
              disabled={!canSave}
              onClick={onSaveEdit}
            >
              Save
            </Button>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
