"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { SearchInput } from "@/components/inputs";
import {
  filterModules,
  getAllCatalogPermissions,
  getModulePermissions,
  type CatalogModule,
  type PermissionCatalog,
} from "@/lib/mappers/roles.mapper";
import { RoleNavPreview } from "./RoleNavPreview";
import { RolePermissionMatrix } from "./RolePermissionMatrix";

type RightsSelectorProps = Readonly<{
  catalog: PermissionCatalog;
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  grantedLabel?: string;
  showHeader?: boolean;
  /** Read-only for Ehs_Director, which always holds everything. */
  disabled?: boolean;
}>;

/**
 * Two tabs, in the order an admin thinks about a role: what it can *see*, and
 * what it can *do*.
 *
 * There used to be three — Pages, Actions and Buttons — over a flat catalogue of
 * 258 rows in which the same capability appeared up to three times. Pages and
 * buttons are gone as separately grantable things: what a role sees is now
 * derived from whether it holds a module's `View`, so the Sidebar tab and the
 * Rights tab are two views of one set of ticks rather than two catalogues to
 * keep in agreement.
 */
const RIGHTS_TABS = [
  {
    id: "sidebar" as const,
    label: "Sidebar",
    icon: "mdi:view-sequential-outline",
    hint: "What this role sees in the app",
  },
  {
    id: "rights" as const,
    label: "Rights",
    icon: "mdi:key-outline",
    hint: "What this role may do — the rights the API enforces",
  },
];

type RightsTabId = (typeof RIGHTS_TABS)[number]["id"];

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-offset-1 focus-visible:ring-offset-ehs-surface";

/** A titled block of module rows: EHS modules, then Platform, then Admin Portal. */
function ModuleSection({
  title,
  hint,
  modules,
  selectedIds,
  disabled,
  onToggle,
  onSetMany,
}: Readonly<{
  title: string;
  hint: string;
  modules: readonly CatalogModule[];
  selectedIds: number[];
  disabled: boolean;
  onToggle: (id: number) => void;
  onSetMany: (ids: number[], granted: boolean) => void;
}>) {
  if (modules.length === 0) return null;

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div>
        <h4 className="text-darkest text5">{title}</h4>
        <p className="text-ehs-muted-text text8">{hint}</p>
      </div>
      <RolePermissionMatrix
        modules={modules}
        selectedIds={selectedIds}
        disabled={disabled}
        onToggle={onToggle}
        onSetMany={onSetMany}
      />
    </section>
  );
}

export function RightsSelector({
  catalog,
  selectedIds,
  onChange,
  grantedLabel = "granted",
  showHeader = true,
  disabled = false,
}: RightsSelectorProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<RightsTabId>("sidebar");

  const totalSelectable = getAllCatalogPermissions(catalog).length;

  const filtered = {
    modules: filterModules(catalog.modules, query),
    platform: filterModules(catalog.platform, query),
    adminPortal: filterModules(catalog.adminPortal, query),
  };

  const nothingMatches =
    filtered.modules.length === 0 &&
    filtered.platform.length === 0 &&
    filtered.adminPortal.length === 0;

  const togglePermission = (permissionId: number) => {
    if (disabled) return;

    if (selectedIds.includes(permissionId)) {
      onChange(selectedIds.filter((id) => id !== permissionId));
      return;
    }

    onChange([...selectedIds, permissionId]);
  };

  const setMany = (permissionIds: number[], granted: boolean) => {
    if (disabled) return;

    if (granted) {
      onChange([...new Set([...selectedIds, ...permissionIds])]);
      return;
    }

    const drop = new Set(permissionIds);
    onChange(selectedIds.filter((id) => !drop.has(id)));
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text3 text-darkest">Rights</h3>
          <p className="text8 text-gray tabular-nums">
            {selectedIds.length} of {totalSelectable} {grantedLabel}
          </p>
        </div>
      ) : null}

      {disabled ? (
        <p
          className="border-ehs-border-ink/12 bg-ehs-border-ink/5 text-ehs-muted-text rounded-lg border px-3 py-2 text8"
          role="status"
        >
          This role always holds every right, within the modules this company is
          licensed for. Change the company&apos;s modules to change what it can reach.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2" role="tablist">
        {RIGHTS_TABS.map((entry) => {
          const active = entry.id === tab;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={entry.hint}
              onClick={() => setTab(entry.id)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text8 font-medium transition-colors ${
                active
                  ? "border-blue-normal/30 bg-blue-normal/10 text-blue-normal"
                  : "border-ehs-border-ink/12 bg-ehs-surface text-gray hover:text-darkest"
              } ${FOCUS_RING}`}
            >
              <Icon icon={entry.icon} width={14} height={14} aria-hidden />
              {entry.label}
            </button>
          );
        })}
      </div>

      {tab === "sidebar" ? (
        <RoleNavPreview
          modules={catalog.modules}
          selectedIds={selectedIds}
          disabled={disabled}
          onToggle={togglePermission}
          onSetMany={setMany}
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-5">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules and actions"
          />

          {nothingMatches ? (
            <p className="text-ehs-muted-text text8" role="status">
              Nothing matches &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <>
              <ModuleSection
                title="Modules"
                hint="What this role may do in each EHS module the company is licensed for."
                modules={filtered.modules}
                selectedIds={selectedIds}
                disabled={disabled}
                onToggle={togglePermission}
                onSetMany={setMany}
              />
              <ModuleSection
                title="Shared"
                hint="Registers and services every module uses. Always available, never licensed separately."
                modules={filtered.platform}
                selectedIds={selectedIds}
                disabled={disabled}
                onToggle={togglePermission}
                onSetMany={setMany}
              />
              <ModuleSection
                title="Admin portal"
                hint="Managing this company's own users, roles and sites."
                modules={filtered.adminPortal}
                selectedIds={selectedIds}
                disabled={disabled}
                onToggle={togglePermission}
                onSetMany={setMany}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Every permission id in the catalogue — used by "grant everything" affordances. */
export function getAllSelectableIds(catalog: PermissionCatalog): number[] {
  return getAllCatalogPermissions(catalog).map((permission) => permission.id);
}

export { getModulePermissions };
