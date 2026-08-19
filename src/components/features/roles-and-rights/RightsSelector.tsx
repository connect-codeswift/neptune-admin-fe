"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { FeatureEmptyState } from "@/components/features/shared";
import { SearchInput } from "@/components/inputs";
import { Button } from "@/components/ui";
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

/** Shared by every focusable control in here so the ring never goes missing. */
const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ehs-surface";

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
    // Not a disabled checkbox: a disabled control reads as "you may be able to
    // change this later". This right is part of the platform and never moves,
    // so it is shown as a fact with the reason attached.
    return (
      <div className="flex items-start gap-2.5 px-2 py-2 text8 text-ehs-muted-text">
        <Icon
          icon="lucide:lock"
          width={14}
          height={14}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span className="min-w-0 break-all font-mono leading-snug">
          {label}
          <span className="sr-only"> — always granted, cannot be changed</span>
        </span>
        <span className="ml-auto shrink-0 text8 text-ehs-muted-text">
          Always on
        </span>
      </div>
    );
  }

  return (
    // `focus-within` rather than a ring on the input: the whole row is the
    // target, so the whole row is what should light up when it is tabbed to.
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-ehs-border-ink/6 has-[:checked]:bg-ehs-normal-blue/6 focus-within:ring-2 focus-within:ring-ehs-normal-blue/40">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle()}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border border-ehs-border-ink/20 accent-blue-normal outline-none"
      />
      <span className="min-w-0 break-all font-mono text8 leading-snug text-darkest">
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
  let toneClass =
    "bg-transparent text-darkest hover:bg-ehs-border-ink/6";
  if (active) {
    toneClass = "bg-blue-normal/10 text-blue-normal";
  }

  let badgeClass = "bg-ehs-border-ink/8 text-gray";
  if (selectedCount > 0) {
    badgeClass = "bg-green/15 text-green";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-center justify-between gap-2 border-b border-ehs-border-ink/6 px-3 py-2.5 text-left transition-colors ${FOCUS_RING} focus-visible:ring-inset ${toneClass}`}
    >
      <span className="min-w-0 truncate text8 font-semibold">{group}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text7 tabular-nums ${badgeClass}`}
      >
        {selectedCount}/{totalCount}
        <span className="sr-only"> permissions granted</span>
      </span>
    </button>
  );
}

/**
 * The header a category carries in both layouts: what it is called, how much of
 * it is granted, and the two bulk controls that used to live in a single
 * toolbar far away from the checkboxes they acted on.
 */
function GroupHeader({
  group,
  selectedCount,
  selectableCount,
  onSelectAll,
  onClear,
}: Readonly<{
  group: string;
  selectedCount: number;
  selectableCount: number;
  onSelectAll: () => void;
  onClear: () => void;
}>) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-ehs-border-ink/8 bg-ehs-surface/95 px-2 py-2 backdrop-blur-sm">
      <h3 className="min-w-0 truncate text8 font-semibold text-darkest">
        {group}
        <span className="ml-2 font-normal text-gray tabular-nums">
          {selectedCount} of {selectableCount} granted
        </span>
      </h3>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onSelectAll}
          disabled={selectableCount === 0 || selectedCount === selectableCount}
          className={`rounded text8 font-semibold text-blue-normal transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
        >
          Select all
          <span className="sr-only"> in {group}</span>
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={selectedCount === 0}
          className={`rounded text8 font-semibold text-gray transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
        >
          Clear
          <span className="sr-only"> {group}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * One category: its header and its checkboxes. Both layouts render the same
 * thing — the browse pane shows a single panel, the filtered list stacks them —
 * so the count arithmetic and the bulk controls only exist once.
 */
function GroupPanel({
  entry,
  selectedIds,
  selectedSet,
  onToggle,
  onSelectAll,
  onClear,
  as = "div",
}: Readonly<{
  entry: PermissionGroup;
  selectedIds: number[];
  selectedSet: Set<number>;
  onToggle: (permissionId: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
  as?: "div" | "section";
}>) {
  const counts = countGroupSelection(entry, selectedIds);
  const Wrapper = as;
  // Stacked panels need air between them; the single browse pane fills its box.
  let spacingClass = "";
  if (as === "section") {
    spacingClass = " mb-4 last:mb-0";
  }

  return (
    <Wrapper className={`flex min-w-0 flex-col${spacingClass}`}>
      <GroupHeader
        group={entry.group}
        selectedCount={counts.selected}
        selectableCount={counts.selectable}
        onSelectAll={onSelectAll}
        onClear={onClear}
      />
      {entry.permissions.map((permission) => (
        <PermissionCheckbox
          key={permission.id}
          label={permission.label}
          selected={selectedSet.has(permission.id)}
          locked={permission.locked}
          onToggle={() => onToggle(permission.id)}
        />
      ))}
    </Wrapper>
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
  const filtersActive = Boolean(query.trim()) || selectedOnly || kindFilter !== "all";

  // Denominator for the headline count. Locked rights are excluded because they
  // are not part of what this control can grant.
  const totalSelectableCount = groups.reduce(
    (total, entry) => total + getSelectablePermissionIds(entry).length,
    0,
  );

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

  const selectAllInGroup = (entry: PermissionGroup) => {
    onChange([...new Set([...selectedIds, ...getSelectablePermissionIds(entry)])]);
  };

  const clearGroup = (entry: PermissionGroup) => {
    const groupIds = new Set(entry.permissions.map((permission) => permission.id));
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

  const clearFilters = () => {
    setQuery("");
    setKindFilter("all");
    setSelectedOnly(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text3 text-darkest">Rights</h3>
          <p className="text8 text-gray tabular-nums">
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
          <span className="sr-only" id="rights-kind-filter-label">
            Filter permissions by kind
          </span>
          {KIND_FILTERS.map((filter) => {
            const active = kindFilter === filter.id;
            let toneClass =
              "border-ehs-border-ink/12 bg-ehs-surface text-darkest hover:border-ehs-border-ink/20";
            if (active) {
              toneClass = "border-blue-normal bg-blue-normal text-ehs-on-accent";
            }

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={active}
                aria-describedby="rights-kind-filter-label"
                onClick={() => setKindFilter(filter.id)}
                className={`rounded-full border px-3 py-1 text8 font-semibold transition-colors ${FOCUS_RING} ${toneClass}`}
              >
                {filter.label}
              </button>
            );
          })}

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text8 font-medium text-darkest focus-within:ring-2 focus-within:ring-ehs-normal-blue/40">
            <input
              type="checkbox"
              checked={selectedOnly}
              onChange={(event) => setSelectedOnly(event.target.checked)}
              className="size-4 cursor-pointer rounded border border-ehs-border-ink/20 accent-blue-normal outline-none"
            />
            Show granted only
          </label>
        </div>

        {/* The one line that answers "how much have I given this role?" — it is
            polite-live so a keyboard user hears the count move as they tick. */}
        <div
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg bg-ehs-border-ink/4 px-3 py-2 text8 text-gray"
          aria-live="polite"
        >
          <p className="min-w-0">
            <span className="font-semibold text-darkest tabular-nums">
              {selectedIds.length} of {totalSelectableCount}
            </span>{" "}
            permissions granted
            <span className="text-ehs-muted-text">
              {" · "}
              {visiblePermissionCount} shown
            </span>
          </p>

          {!browseMode && visiblePermissionCount > 0 ? (
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={selectAllVisible}
                className={`rounded text8 font-semibold text-blue-normal ${FOCUS_RING}`}
              >
                Select all shown
              </button>
              <button
                type="button"
                onClick={clearAllVisible}
                className={`rounded text8 font-semibold text-gray ${FOCUS_RING}`}
              >
                Clear all shown
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {groups.length === 0 ? (
        <FeatureEmptyState
          surface={false}
          icon="mdi:key-outline"
          title="No permissions returned by the API"
          description="Nothing can be granted until the permissions catalog answers."
        />
      ) : null}

      {groups.length > 0 && filteredGroups.length === 0 ? (
        <FeatureEmptyState
          icon="mdi:filter-remove-outline"
          title="No permissions match your filters"
          description="Nothing in the catalog matches this search, kind and granted-only combination."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:filter-off-outline"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          }
        />
      ) : null}

      {filteredGroups.length > 0 && browseMode ? (
        <div className="grid min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-ehs-border-ink/10 bg-ehs-surface md:min-h-[480px] md:grid-cols-[minmax(180px,240px)_minmax(0,1fr)]">
          {/* Capped short on phones so the checkboxes are still on screen
              without scrolling past a full-height category list. */}
          <nav
            className="max-h-56 overflow-y-auto border-b border-ehs-border-ink/10 bg-ehs-border-ink/3 md:max-h-[min(64vh,560px)] md:border-r md:border-b-0"
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

          <div className="min-w-0 max-h-[min(60vh,560px)] overflow-y-auto">
            {activeEntry ? (
              <GroupPanel
                entry={activeEntry}
                selectedIds={selectedIds}
                selectedSet={selectedSet}
                onToggle={togglePermission}
                onSelectAll={() => selectAllInGroup(activeEntry)}
                onClear={() => clearGroup(activeEntry)}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {filteredGroups.length > 0 && !browseMode ? (
        <div className="min-w-0 max-h-[min(60vh,560px)] overflow-y-auto rounded-xl border border-ehs-border-ink/10 bg-ehs-surface p-2">
          {filteredGroups.map((entry) => (
            <GroupPanel
              key={entry.group}
              as="section"
              entry={entry}
              selectedIds={selectedIds}
              selectedSet={selectedSet}
              onToggle={togglePermission}
              onSelectAll={() => selectAllInGroup(entry)}
              onClear={() => clearGroup(entry)}
            />
          ))}
        </div>
      ) : null}

      {filtersActive && filteredGroups.length > 0 ? (
        <p className="text8 text-ehs-muted-text">
          Filters only change what is listed here — permissions you granted
          under another filter stay granted.
        </p>
      ) : null}
    </div>
  );
}
