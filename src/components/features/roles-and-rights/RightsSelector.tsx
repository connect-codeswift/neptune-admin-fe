"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/inputs";
import {
  countGroupSelection,
  filterPermissionGroups,
  getSelectablePermissionIds,
  sortPermissionGroupsForDisplay,
  type PermissionGroup,
  type PermissionKindFilter,
} from "@/lib/mappers/roles.mapper";

type RightsSelectorProps = Readonly<{
  groups: PermissionGroup[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  grantedLabel?: string;
  showHeader?: boolean;
}>;

const KIND_FILTERS: readonly { id: PermissionKindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "api", label: "API" },
  { id: "pages", label: "Pages" },
  { id: "buttons", label: "Buttons" },
];

function PermissionCheckbox({
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
      <div className="flex items-center gap-2 py-2 text6 text-[#8892a3]">
        <Icon icon="lucide:lock" width={14} height={14} className="shrink-0" />
        <span className="min-w-0 break-all font-mono">{label}</span>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-darkest/4">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle()}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border border-darkest/20 accent-blue-normal"
      />
      <span className="min-w-0 break-all font-mono text6 leading-snug text-darkest">
        {label}
      </span>
    </label>
  );
}

function CategoryNavItem({
  group,
  selectedCount,
  totalCount,
  active,
  onClick,
}: Readonly<{
  group: string;
  selectedCount: number;
  totalCount: number;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 border-b border-darkest/6 px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-blue-normal/10 text-blue-normal"
          : "bg-transparent text-darkest hover:bg-darkest/4"
      }`}
    >
      <span className="min-w-0 truncate text6 font-medium">{group}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          selectedCount > 0
            ? "bg-green/15 text-green"
            : "bg-darkest/8 text-gray"
        }`}
      >
        {selectedCount}/{totalCount}
      </span>
    </button>
  );
}

export function RightsSelector({
  groups,
  selectedIds,
  onChange,
  grantedLabel = "granted",
  showHeader = true,
}: RightsSelectorProps) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<PermissionKindFilter>("all");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [pickedGroup, setPickedGroup] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const sortedGroups = useMemo(
    () => sortPermissionGroupsForDisplay(groups),
    [groups],
  );

  const filteredGroups = useMemo(
    () =>
      filterPermissionGroups(sortedGroups, {
        query,
        kind: kindFilter,
        selectedOnly,
        selectedIds,
      }),
    [sortedGroups, query, kindFilter, selectedOnly, selectedIds],
  );

  const flatResults = useMemo(
    () =>
      filteredGroups.flatMap((entry) =>
        entry.permissions.map((permission) => ({
          group: entry.group,
          permission,
        })),
      ),
    [filteredGroups],
  );

  const visiblePermissionCount = flatResults.length;
  const browseMode = !query.trim() && !selectedOnly;

  const activeGroup = useMemo(() => {
    if (filteredGroups.length === 0) return null;
    if (
      pickedGroup &&
      filteredGroups.some((entry) => entry.group === pickedGroup)
    ) {
      return pickedGroup;
    }
    return filteredGroups[0].group;
  }, [filteredGroups, pickedGroup]);

  const activeEntry = useMemo(
    () => filteredGroups.find((entry) => entry.group === activeGroup) ?? null,
    [filteredGroups, activeGroup],
  );

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

  const selectAllInActiveGroup = () => {
    if (!activeEntry) return;
    const ids = getSelectablePermissionIds(activeEntry);
    onChange([...new Set([...selectedIds, ...ids])]);
  };

  const clearActiveGroup = () => {
    if (!activeEntry) return;
    const groupIds = new Set(
      activeEntry.permissions.map((permission) => permission.id),
    );
    onChange(selectedIds.filter((id) => !groupIds.has(id)));
  };

  const selectAllVisible = () => {
    const idsToAdd = filteredGroups.flatMap((entry) =>
      getSelectablePermissionIds(entry),
    );
    onChange([...new Set([...selectedIds, ...idsToAdd])]);
  };

  const clearAllVisible = () => {
    const visibleIds = new Set(flatResults.map((entry) => entry.permission.id));
    onChange(selectedIds.filter((id) => !visibleIds.has(id)));
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

      <div className="flex flex-col gap-3">
        <SearchInput
          placeholder="Filter permissions…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter permissions"
        />

        <div className="flex flex-wrap items-center gap-2">
          {KIND_FILTERS.map((filter) => {
            const active = kindFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setKindFilter(filter.id)}
                className={`rounded-full border px-3 py-1 text6 font-medium transition-colors ${
                  active
                    ? "border-blue-normal bg-blue-normal text-white"
                    : "border-darkest/12 bg-white text-darkest hover:border-darkest/20"
                }`}
              >
                {filter.label}
              </button>
            );
          })}

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text6 text-darkest">
            <input
              type="checkbox"
              checked={selectedOnly}
              onChange={(event) => setSelectedOnly(event.target.checked)}
              className="size-4 cursor-pointer rounded border border-darkest/20 accent-blue-normal"
            />
            Selected only
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text6 text-gray">
          <span>
            {visiblePermissionCount} permission
            {visiblePermissionCount === 1 ? "" : "s"}
            {browseMode && activeEntry ? ` · ${activeEntry.group}` : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={browseMode ? selectAllInActiveGroup : selectAllVisible}
              disabled={visiblePermissionCount === 0}
              className="font-medium text-blue-normal disabled:opacity-40"
            >
              {browseMode ? "Select category" : "Select all shown"}
            </button>
            <button
              type="button"
              onClick={browseMode ? clearActiveGroup : clearAllVisible}
              disabled={visiblePermissionCount === 0}
              className="font-medium text-gray disabled:opacity-40"
            >
              {browseMode ? "Clear category" : "Clear all shown"}
            </button>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text5 text-gray">No permissions returned by the API.</p>
      ) : null}

      {groups.length > 0 && filteredGroups.length === 0 ? (
        <p className="rounded-xl border border-darkest/10 bg-white/80 px-4 py-10 text-center text5 text-gray">
          No permissions match your filters.
        </p>
      ) : null}

      {filteredGroups.length > 0 && browseMode ? (
        <div className="grid min-h-[480px] grid-cols-1 overflow-hidden rounded-xl border border-darkest/10 bg-white md:grid-cols-[minmax(180px,240px)_minmax(0,1fr)]">
          <nav
            className="max-h-[min(64vh,560px)] overflow-y-auto border-b border-darkest/10 bg-darkest/3 md:border-r md:border-b-0"
            aria-label="Permission categories"
          >
            {filteredGroups.map((entry) => {
              const counts = countGroupSelection(entry, selectedIds);
              return (
                <CategoryNavItem
                  key={entry.group}
                  group={entry.group}
                  selectedCount={counts.selected}
                  totalCount={counts.selectable}
                  active={entry.group === activeGroup}
                  onClick={() => setPickedGroup(entry.group)}
                />
              );
            })}
          </nav>

          <div className="max-h-[min(60vh,560px)] overflow-y-auto">
            {activeEntry ? (
              <div className="flex flex-col">
                <p className="sticky top-0 z-10 border-b border-darkest/8 bg-white/95 px-2 py-2 text6 font-semibold text-gray backdrop-blur-sm">
                  {activeEntry.group} · {activeEntry.permissions.length} items
                </p>
                {activeEntry.permissions.map((permission) => (
                  <PermissionCheckbox
                    key={permission.id}
                    label={permission.label}
                    selected={selectedSet.has(permission.id)}
                    locked={permission.locked}
                    onToggle={() => togglePermission(permission.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {filteredGroups.length > 0 && !browseMode ? (
        <div className="max-h-[min(60vh,560px)] overflow-y-auto rounded-xl border border-darkest/10 bg-white p-2">
          {filteredGroups.map((entry) => (
            <section key={entry.group} className="mb-4 last:mb-0">
              <p className="sticky top-0 z-10 border-b border-darkest/8 bg-white/95 px-2 py-2 text6 font-semibold text-gray backdrop-blur-sm">
                {entry.group}
              </p>
              {entry.permissions.map((permission) => (
                <PermissionCheckbox
                  key={permission.id}
                  label={permission.label}
                  selected={selectedSet.has(permission.id)}
                  locked={permission.locked}
                  onToggle={() => togglePermission(permission.id)}
                />
              ))}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
