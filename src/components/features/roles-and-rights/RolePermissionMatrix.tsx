"use client";

import { Icon } from "@iconify/react";
import { getModuleIcon, shortPermissionLabel } from "@/lib/ehss-nav-preview";
import {
  countGroupSelection,
  getSelectablePermissionIds,
  type PermissionGroup,
  type PermissionOption,
} from "@/lib/mappers/roles.mapper";

export type RolePermissionMatrixProps = Readonly<{
  groups: readonly PermissionGroup[];
  selectedIds: readonly number[];
  onToggle: (permissionId: number) => void;
  onSetMany: (permissionIds: number[], granted: boolean) => void;
  /** Shown when a module's own list is empty after filtering. */
  emptyHint?: string;
}>;

/**
 * One right, as a chip rather than a checkbox row.
 *
 * The module is already the card's heading, so the chip only carries what
 * distinguishes it — `Create`, `Reopen` — instead of repeating `Incident.` on
 * every line. The full string stays in `title` for anyone who needs the exact
 * claim, which is the one time the raw form matters.
 */
function RightChip({
  option,
  moduleName,
  granted,
  onToggle,
}: Readonly<{
  option: PermissionOption;
  moduleName: string;
  granted: boolean;
  onToggle: (id: number) => void;
}>) {
  const short = shortPermissionLabel(option.label, moduleName);

  if (option.locked) {
    return (
      <span
        className="border-ehs-border-ink/10 bg-ehs-border-ink/5 text-ehs-muted-text inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text8"
        title={`${option.label} — always granted, cannot be changed`}
      >
        <Icon icon="lucide:lock" width={11} height={11} aria-hidden />
        {short}
      </span>
    );
  }

  let toneClass =
    "border-ehs-border-ink/12 bg-ehs-surface text-gray hover:border-ehs-border-ink/25 hover:text-darkest";
  if (granted) {
    toneClass =
      "border-blue-normal/30 bg-blue-normal/10 text-blue-normal hover:bg-blue-normal/16";
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      aria-pressed={granted}
      title={option.label}
      className={`focus-visible:ring-ehs-normal-blue/40 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text8 font-medium transition-colors outline-none focus-visible:ring-2 ${toneClass}`}
    >
      <Icon
        icon={granted ? "lucide:check" : "lucide:plus"}
        width={11}
        height={11}
        aria-hidden
      />
      {short}
    </button>
  );
}

/** One module: its identity, how much of it is granted, and its rights. */
function ModuleCard({
  entry,
  selectedIds,
  selectedSet,
  onToggle,
  onSetMany,
}: Readonly<{
  entry: PermissionGroup;
  selectedIds: readonly number[];
  selectedSet: ReadonlySet<number>;
  onToggle: (id: number) => void;
  onSetMany: (ids: number[], granted: boolean) => void;
}>) {
  const counts = countGroupSelection(entry, selectedIds);
  const selectableIds = getSelectablePermissionIds(entry);
  const allGranted =
    counts.selectable > 0 && counts.selected === counts.selectable;

  return (
    <section className="border-ehs-border-ink/10 bg-ehs-surface rounded-xl border p-3.5">
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="bg-blue-normal/10 text-blue-normal flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Icon icon={getModuleIcon(entry.group)} width={17} height={17} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="text-darkest min-w-0 truncate text5">{entry.group}</h4>
          <p className="text-ehs-muted-text text7 tabular-nums">
            {counts.selected} of {counts.selectable} granted
          </p>
        </div>

        {/* One control, not a Select-all/Clear pair: with the count right
            beside it, the only useful action is the opposite of where you are. */}
        {counts.selectable > 0 ? (
          <button
            type="button"
            onClick={() => onSetMany(selectableIds, !allGranted)}
            className="text-blue-normal shrink-0 cursor-pointer rounded text8 font-semibold"
          >
            {allGranted ? "Clear all" : "Grant all"}
            <span className="sr-only"> in {entry.group}</span>
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {entry.permissions.map((option) => (
          <RightChip
            key={option.id}
            option={option}
            moduleName={entry.group}
            granted={selectedSet.has(option.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Actions and Buttons, given the same module-first shape as the Pages preview.
 *
 * Before this they were a category rail plus a column of `Module.Action`
 * checkboxes: accurate, and unreadable at 258 rows. Here each module is a card
 * carrying the same icon it wears in the sidebar preview, and its rights are
 * chips — so a role is scanned by module in all three tabs rather than by a
 * flat list in two of them.
 */
export function RolePermissionMatrix({
  groups,
  selectedIds,
  onToggle,
  onSetMany,
  emptyHint,
}: RolePermissionMatrixProps) {
  const selectedSet = new Set(selectedIds);

  if (groups.length === 0) {
    return (
      <p className="text-ehs-muted-text text8" role="status">
        {emptyHint ?? "Nothing here matches the current filter."}
      </p>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
      {groups.map((entry) => (
        <ModuleCard
          key={entry.group}
          entry={entry}
          selectedIds={selectedIds}
          selectedSet={selectedSet}
          onToggle={onToggle}
          onSetMany={onSetMany}
        />
      ))}
    </div>
  );
}
