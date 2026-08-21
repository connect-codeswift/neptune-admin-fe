"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { FeatureEmptyState } from "@/components/features/shared";
import { SearchInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import {
  filterPermissionGroups,
  getSelectablePermissionIds,
  sortPermissionGroupsForDisplay,
  type PermissionGroup,
  type PermissionKindFilter,
} from "@/lib/mappers/roles.mapper";
import { regroupByModule } from "@/lib/ehss-nav-preview";
import { RoleNavPreview } from "./RoleNavPreview";
import { RolePermissionMatrix } from "./RolePermissionMatrix";

type RightsSelectorProps = Readonly<{
  groups: PermissionGroup[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  grantedLabel?: string;
  showHeader?: boolean;
}>;

/**
 * The editor's three tabs, in the order an admin thinks about a role: what they
 * can *see*, what they can *do*, and which in-page controls appear.
 *
 * These replaced a row of filter chips over one flat list. The chips were a
 * lens on 258 rows; these are three different questions, and only one of them
 * ("Pages") is answered by a checkbox list at all — it is answered by drawing
 * the sidebar instead.
 */
const RIGHTS_TABS = [
  {
    id: "pages" as const,
    label: "Pages",
    icon: "mdi:view-sequential-outline",
    hint: "What this role sees in the app sidebar",
  },
  {
    id: "api" as const,
    label: "Actions",
    icon: "mdi:key-outline",
    hint: "What this role may do — the rights the API enforces",
  },
  {
    id: "buttons" as const,
    label: "Buttons",
    icon: "mdi:gesture-tap-button",
    hint: "In-page controls this role sees",
  },
];

type RightsTabId = (typeof RIGHTS_TABS)[number]["id"];

/** The tab's slice of the catalogue, in `filterPermissionGroups` terms. */
const TAB_KIND: Record<RightsTabId, PermissionKindFilter> = {
  pages: "pages",
  api: "api",
  buttons: "buttons",
};

/** Shared by every focusable control in here so the ring never goes missing. */
const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ehs-surface";

export function RightsSelector({
  groups,
  selectedIds,
  onChange,
  grantedLabel = "granted",
  showHeader = true,
}: RightsSelectorProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<RightsTabId>("pages");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const kindFilter = TAB_KIND[tab];

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Every page row in one flat list, whatever category the backend filed it
  // under — the preview matches them by label, not by group.
  const pageOptions = useMemo(
    () =>
      filterPermissionGroups(groups, { kind: "pages" }).flatMap(
        (entry) => entry.permissions,
      ),
    [groups],
  );

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

  /**
   * What the matrix renders. Buttons arrive in one API category, so they are
   * regrouped by the module named in their slug; Actions already come grouped
   * by module and pass through untouched.
   */
  const moduleGroups = useMemo(() => {
    if (tab !== "buttons") {
      return filteredGroups;
    }

    const flat = filteredGroups.flatMap((entry) => entry.permissions);
    return regroupByModule(flat);
  }, [tab, filteredGroups]);

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

  /** Grant or revoke a known set in one go — the preview's "show/hide all". */
  const setMany = (permissionIds: number[], granted: boolean) => {
    if (granted) {
      onChange([...new Set([...selectedIds, ...permissionIds])]);
      return;
    }

    const drop = new Set(permissionIds);
    onChange(selectedIds.filter((id) => !drop.has(id)));
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
        {/* Three questions, not three filters. The active tab's hint sits
            directly under the row so the tab never has to be self-explanatory
            from one word. */}
        <div
          role="tablist"
          aria-label="Rights sections"
          className="border-ehs-border-ink/10 bg-ehs-border-ink/4 flex gap-1 rounded-xl border p-1"
        >
          {RIGHTS_TABS.map((entry) => {
            const active = tab === entry.id;
            let toneClass = "text-gray hover:text-darkest hover:bg-ehs-surface/60";
            if (active) {
              toneClass = "bg-ehs-surface text-darkest shadow-(--ehs-shadow-card)";
            }

            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(entry.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text8 font-semibold transition-colors ${FOCUS_RING} ${toneClass}`}
              >
                <Icon icon={entry.icon} width={15} height={15} aria-hidden />
                {entry.label}
              </button>
            );
          })}
        </div>

        <p className="text-ehs-muted-text text8">
          {RIGHTS_TABS.find((entry) => entry.id === tab)?.hint}
        </p>

        {tab === "pages" ? null : (
          <>
            <SearchInput
              placeholder="Filter permissions…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Filter permissions"
            />

            <label className="text-darkest focus-within:ring-ehs-normal-blue/40 inline-flex cursor-pointer items-center gap-2 self-start rounded-lg px-1 py-1 text8 font-medium focus-within:ring-2">
              <input
                type="checkbox"
                checked={selectedOnly}
                onChange={(event) => setSelectedOnly(event.target.checked)}
                className="border-ehs-border-ink/20 accent-blue-normal size-4 cursor-pointer rounded border outline-none"
              />
              Show granted only
            </label>
          </>
        )}

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

          {tab !== "pages" && !browseMode && visiblePermissionCount > 0 ? (
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

      {groups.length > 0 && tab === "pages" ? (
        <RoleNavPreview
          pageOptions={pageOptions}
          selectedIds={selectedIds}
          onToggle={togglePermission}
          onSetMany={setMany}
        />
      ) : null}

      {groups.length > 0 && tab !== "pages" && filteredGroups.length === 0 ? (
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

      {tab !== "pages" && moduleGroups.length > 0 ? (
        <div className="min-w-0 max-h-[min(64vh,620px)] overflow-y-auto pr-0.5">
          <RolePermissionMatrix
            groups={moduleGroups}
            selectedIds={selectedIds}
            onToggle={togglePermission}
            onSetMany={setMany}
          />
        </div>
      ) : null}

      {tab !== "pages" && filtersActive && filteredGroups.length > 0 ? (
        <p className="text8 text-ehs-muted-text">
          Filters only change what is listed here — permissions you granted
          under another filter stay granted.
        </p>
      ) : null}
    </div>
  );
}
