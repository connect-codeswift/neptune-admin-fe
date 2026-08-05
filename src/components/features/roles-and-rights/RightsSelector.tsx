"use client";

import { Icon } from "@iconify/react";
import type { PermissionGroup } from "@/lib/mappers/roles.mapper";

type RightsSelectorProps = Readonly<{
  groups: PermissionGroup[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  grantedLabel?: string;
  showHeader?: boolean;
}>;

function RightChip({
  label,
  selected,
  locked,
  onToggle,
}: Readonly<{
  label: string;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}>) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-darkest/10 bg-darkest/4 px-2.5 py-1 text6 text-[#8892a3]">
        <Icon icon="lucide:lock" width={12} height={12} aria-hidden />
        {label}
      </span>
    );
  }

  let chipClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-darkest/15 bg-white px-2.5 py-1 text6 text-gray transition-colors hover:border-darkest/25";
  if (selected) {
    chipClass =
      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-green bg-green/8 px-2.5 py-1 text6 font-medium text-darkest transition-colors";
  }

  return (
    <button type="button" onClick={onToggle} className={chipClass}>
      <Icon
        icon={selected ? "lucide:circle-check" : "lucide:circle"}
        width={12}
        height={12}
        className={selected ? "text-green" : "text-[#b3bbc8]"}
        aria-hidden
      />
      {label}
    </button>
  );
}

function RightsGroupSection({
  entry,
  selectedSet,
  onToggle,
}: Readonly<{
  entry: PermissionGroup;
  selectedSet: Set<number>;
  onToggle: (permissionId: number) => void;
}>) {
  return (
    <div>
      <p className="mb-2 text6 font-semibold tracking-[0.4px] text-gray uppercase">
        {entry.group}
      </p>
      <div className="flex flex-wrap gap-2">
        {entry.permissions.map((permission) => (
          <RightChip
            key={permission.id}
            label={permission.label}
            selected={selectedSet.has(permission.id)}
            locked={permission.locked}
            onToggle={() => onToggle(permission.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function RightsSelector({
  groups,
  selectedIds,
  onChange,
  grantedLabel = "granted",
  showHeader = true,
}: RightsSelectorProps) {
  const selectedSet = new Set(selectedIds);

  const togglePermission = (permissionId: number) => {
    const permission = groups
      .flatMap((group) => group.permissions)
      .find((entry) => entry.id === permissionId);

    if (permission?.locked) return;

    if (selectedSet.has(permissionId)) {
      onChange(selectedIds.filter((id) => id !== permissionId));
      return;
    }

    onChange([...selectedIds, permissionId]);
  };

  return (
    <div className="flex flex-col gap-4">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text4 text-darkest">Rights</h3>
          <p className="text5 text-gray">
            {selectedIds.length} {grantedLabel}
          </p>
        </div>
      ) : null}

      {groups.length === 0 ? (
        <p className="text5 text-gray">No permissions returned by the API.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((entry) => (
            <RightsGroupSection
              key={entry.group}
              entry={entry}
              selectedSet={selectedSet}
              onToggle={togglePermission}
            />
          ))}
        </div>
      )}
    </div>
  );
}
