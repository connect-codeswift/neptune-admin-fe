"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui";
import type { RoleViewModel } from "@/lib/mappers/roles.mapper";

const VISIBLE_RIGHTS_COUNT = 6;

export type RoleCardProps = Readonly<{
  role: RoleViewModel;
  basePath: string;
  /** Omitted where deletion is not offered. */
  onDelete?: (role: RoleViewModel) => void;
}>;

function RightTag({ label }: Readonly<{ label: string }>) {
  return (
    // text7, not text6: text6 is the uppercase eyebrow role, and a dotted
    // permission id rendered as SAFETY.INCIDENT.VIEW is harder to read and no
    // longer matches the string the permission matrix shows.
    <span
      className="inline-flex max-w-56 items-center truncate rounded-md bg-ehs-border-ink/6 px-2 py-0.5 text7 font-normal text-darkest"
      title={label}
    >
      {label}
    </span>
  );
}

/**
 * Grid-view counterpart to a row of the roles table.
 *
 * `h-full` with the `mt-auto` action footer keeps a row of cards level when
 * one role's right list wraps and its neighbour's does not.
 */
export function RoleCard({ role, basePath, onDelete }: RoleCardProps) {
  const visibleRights = role.permissionLabels.slice(0, VISIBLE_RIGHTS_COUNT);
  const hiddenRights = role.permissionLabels.slice(VISIBLE_RIGHTS_COUNT);
  const hiddenCount = hiddenRights.length;

  return (
    <GlassCard className="h-full px-5 py-4">
      <div className="flex h-full min-w-0 flex-col gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 truncate text3 text-darkest">{role.name}</h2>
            {role.isSystem ? (
              <span className="inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text7 font-semibold tracking-[0.5px] text-blue-normal uppercase">
                System
              </span>
            ) : null}
          </div>

          <p className="mt-1 line-clamp-2 text4 text-gray">
            {role.description || "No description provided."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {visibleRights.map((right) => (
              <RightTag key={right} label={right} />
            ))}
            {hiddenCount > 0 ? (
              // The overflow count is the only place the rest of the set is
              // named short of opening the role, so it carries them in `title`.
              <span
                className="text7 text-blue-normal"
                title={hiddenRights.join(", ")}
              >
                +{hiddenCount} more
              </span>
            ) : null}
            {role.permissionLabels.length === 0 ? (
              <span className="text8 text-ehs-muted-text">
                No permissions assigned — this role grants no access
              </span>
            ) : null}
          </div>
        </div>

        <div className="border-ehs-border-ink/8 mt-auto flex shrink-0 items-center justify-between gap-3 border-t pt-2.5">
          <p className="text7 font-semibold tracking-[0.5px] text-ehs-muted-text uppercase">
            {role.userCount} {role.userCount === 1 ? "User" : "Users"}
          </p>

          <div className="flex items-center gap-1.5">
            <IconButton
              icon="lucide:eye"
              label={`View ${role.name}`}
              size="sm"
              href={`${basePath}/${role.id}`}
            />
            {/* Presets are editable too — the backend clones one for this
                company on first edit (copy-on-write), which the editor
                explains before the save. */}
            <IconButton
              icon="lucide:pencil"
              label={`Edit ${role.name}`}
              size="sm"
              href={`${basePath}/${role.id}/edit`}
            />
            {/*
              A system role gets no delete control at all rather than one that errors: a
              preset is a single row shared by every company, so removing it here would
              remove it everywhere, and the backend refuses. Ehs_Director is refused even
              as a company's own copy — it owns the company, and deleting it would leave
              nobody able to administer it.
            */}
            {!role.isSystem && onDelete ? (
              <IconButton
                icon="lucide:trash-2"
                label={`Delete ${role.name}`}
                size="sm"
                onClick={() => onDelete(role)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
