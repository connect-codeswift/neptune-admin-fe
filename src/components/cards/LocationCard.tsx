"use client";

import { TextInput } from "@/components/inputs";
import { Button, GlassCard, IconButton } from "@/components/ui";
import type { LocationResponse } from "@/dtos/res/locations.res";

export type LocationCardProps = Readonly<{
  location: LocationResponse;
  isEditing: boolean;
  draftName: string;
  onDraftNameChange: (value: string) => void;
  /** Absent when renaming is unavailable — see `disabledReason`. */
  onStartEdit?: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  /** Absent when deleting is unavailable — see `disabledReason`. */
  onDelete?: () => void;
  /** Why `onStartEdit` / `onDelete` are absent. */
  disabledReason?: string;
  saving?: boolean;
}>;

/**
 * Grid-view counterpart to a row of the locations table: same name, same
 * inline rename, same rename/delete pair, gated by the same "other site"
 * write-safety rule the table cells enforce — see `OTHER_SITE_WRITE_NOTE` in
 * `LocationsPage.tsx`.
 */
export function LocationCard({
  location,
  isEditing,
  draftName,
  onDraftNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  disabledReason,
  saving = false,
}: LocationCardProps) {
  let body = (
    <h3 className="line-clamp-2 min-w-0 text3 text-ehs-darker" title={location.name}>
      {location.name}
    </h3>
  );

  if (isEditing) {
    body = (
      <div className="flex flex-col gap-3">
        <TextInput
          aria-label={`Rename ${location.name}`}
          value={draftName}
          autoFocus
          onChange={(event) => onDraftNameChange(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancelEdit}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon="lucide:save"
            disabled={!draftName.trim()}
            loading={saving}
            onClick={onSaveEdit}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    // `h-full` with the `mt-auto` footer keeps every card in the row the
    // same height even though a location's name is its only field.
    <GlassCard className="h-full p-5">
      <div className="flex h-full min-w-0 flex-col gap-3">
        <div className="min-w-0">{body}</div>

        {!isEditing ? (
          <div className="mt-auto flex items-center justify-end gap-1.5 border-t border-ehs-border-ink/8 pt-3">
            <IconButton
              icon="lucide:pencil"
              label={`Rename ${location.name}`}
              size="sm"
              onClick={onStartEdit}
              disabled={!onStartEdit}
              disabledReason={disabledReason}
            />
            <IconButton
              icon="lucide:trash-2"
              label={`Remove ${location.name}`}
              size="sm"
              onClick={onDelete}
              disabled={!onDelete}
              disabledReason={disabledReason}
            />
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
