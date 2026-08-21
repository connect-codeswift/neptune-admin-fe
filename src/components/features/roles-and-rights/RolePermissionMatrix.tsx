"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { getModuleIcon } from "@/lib/ehss-nav-preview";
import {
  countModuleSelection,
  CRUD_ACTIONS,
  type CatalogModule,
  type CatalogPermission,
  type CrudAction,
  getCrudPermission,
  getModulePermissions,
} from "@/lib/mappers/roles.mapper";

export type RolePermissionMatrixProps = Readonly<{
  modules: readonly CatalogModule[];
  selectedIds: readonly number[];
  onToggle: (permissionId: number) => void;
  onSetMany: (permissionIds: number[], granted: boolean) => void;
  /** Read-only for Ehs_Director, which always holds everything. */
  disabled?: boolean;
  emptyHint?: string;
}>;

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40";

/**
 * One checkbox in the grid.
 *
 * A module that does not define an action renders an em-dash rather than an
 * unticked box: nothing to grant is a different statement from something being
 * withheld, and a disabled checkbox reads as the second.
 */
function ActionCell({
  permission,
  granted,
  disabled,
  onToggle,
}: Readonly<{
  permission: CatalogPermission | undefined;
  granted: boolean;
  disabled: boolean;
  onToggle: (id: number) => void;
}>) {
  if (!permission) {
    return (
      <td className="px-2 py-2 text-center">
        <span className="text-ehs-muted-text/40 text8" aria-label="not available">
          &mdash;
        </span>
      </td>
    );
  }

  return (
    <td className="px-2 py-2 text-center">
      <input
        type="checkbox"
        checked={granted}
        disabled={disabled}
        onChange={() => onToggle(permission.id)}
        title={permission.displayName}
        aria-label={permission.displayName}
        className={`accent-blue-normal size-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
      />
    </td>
  );
}

/** A named extra, as a chip. Extras are per-module, so they cannot be columns. */
function ExtraChip({
  permission,
  granted,
  disabled,
  onToggle,
}: Readonly<{
  permission: CatalogPermission;
  granted: boolean;
  disabled: boolean;
  onToggle: (id: number) => void;
}>) {
  let tone =
    "border-ehs-border-ink/12 bg-ehs-surface text-gray hover:border-ehs-border-ink/25 hover:text-darkest";
  if (granted) {
    tone =
      "border-blue-normal/30 bg-blue-normal/10 text-blue-normal hover:bg-blue-normal/16";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(permission.id)}
      aria-pressed={granted}
      title={permission.displayName}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text8 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tone} ${FOCUS_RING}`}
    >
      <Icon
        icon={granted ? "lucide:check" : "lucide:plus"}
        width={11}
        height={11}
        aria-hidden
      />
      {permission.action}
    </button>
  );
}

function ModuleRow({
  module,
  selectedSet,
  disabled,
  onToggle,
  onSetMany,
}: Readonly<{
  module: CatalogModule;
  selectedSet: ReadonlySet<number>;
  disabled: boolean;
  onToggle: (id: number) => void;
  onSetMany: (ids: number[], granted: boolean) => void;
}>) {
  const [expanded, setExpanded] = useState(false);

  const counts = countModuleSelection(module, [...selectedSet]);
  const all = getModulePermissions(module);
  const hasExtras = module.extras.length > 0;

  // Unlicensed means inert, not empty. The ticks stay visible and stay accurate
  // so an admin can see what a role would get, and configure it before the
  // module is switched on rather than after.
  const locked = disabled || !module.isLicensed;

  return (
    <>
      <tr
        className={`border-ehs-border-ink/8 border-t ${
          module.isLicensed ? "" : "bg-ehs-border-ink/[0.03]"
        }`}
      >
        <td className="py-2.5 pr-3 pl-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {hasExtras ? (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                aria-label={`${expanded ? "Hide" : "Show"} more ${module.name} actions`}
                className={`text-ehs-muted-text hover:text-darkest shrink-0 cursor-pointer rounded ${FOCUS_RING}`}
              >
                <Icon
                  icon={expanded ? "lucide:chevron-down" : "lucide:chevron-right"}
                  width={15}
                  height={15}
                  aria-hidden
                />
              </button>
            ) : (
              <span className="size-[15px] shrink-0" aria-hidden />
            )}

            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                module.isLicensed
                  ? "bg-blue-normal/10 text-blue-normal"
                  : "bg-ehs-border-ink/8 text-ehs-muted-text"
              }`}
            >
              <Icon icon={getModuleIcon(module.code)} width={15} height={15} aria-hidden />
            </span>

            <span className="min-w-0">
              <span className="text-darkest block truncate text5">{module.name}</span>
              <span className="text-ehs-muted-text block text8 tabular-nums">
                {module.isLicensed ? (
                  <>
                    {counts.selected} of {counts.total} granted
                    {hasExtras ? ` · ${module.extras.length} more` : ""}
                  </>
                ) : (
                  "Not licensed — grants kept, inactive until switched on"
                )}
              </span>
            </span>
          </div>
        </td>

        {CRUD_ACTIONS.map((action: CrudAction) => {
          const permission = getCrudPermission(module, action);
          return (
            <ActionCell
              key={action}
              permission={permission}
              granted={permission ? selectedSet.has(permission.id) : false}
              disabled={locked}
              onToggle={onToggle}
            />
          );
        })}

        <td className="py-2 pr-1 pl-2 text-right">
          <button
            type="button"
            disabled={locked || all.length === 0}
            onClick={() => onSetMany(all.map((entry) => entry.id), !counts.allGranted)}
            className={`text-blue-normal shrink-0 cursor-pointer rounded text8 font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
          >
            {counts.allGranted ? "Clear" : "All"}
            <span className="sr-only"> rights in {module.name}</span>
          </button>
        </td>
      </tr>

      {expanded && hasExtras ? (
        <tr className={module.isLicensed ? "" : "bg-ehs-border-ink/[0.03]"}>
          <td colSpan={6} className="px-1 pt-0 pb-3">
            <div className="border-ehs-border-ink/10 ml-[4.15rem] border-l pl-3.5">
              <p className="text-ehs-muted-text mb-1.5 text8">
                Other things a role can do in {module.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {module.extras.map((permission) => (
                  <ExtraChip
                    key={permission.id}
                    permission={permission}
                    granted={selectedSet.has(permission.id)}
                    disabled={locked}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

/**
 * The grid: one row per module, four CRUD columns, and each module's named
 * extras behind an expander.
 *
 * This replaced a flat list of 258 rows in which the same fact appeared three
 * times — `Hazard.Update`, `page:hazard-id-edit` and `button:edit` were one
 * capability written three ways, in three catalogues nothing kept in step. The
 * page and button rows are gone; what a role sees is now derived from whether
 * it holds the module's `View`.
 */
export function RolePermissionMatrix({
  modules,
  selectedIds,
  onToggle,
  onSetMany,
  disabled = false,
  emptyHint,
}: RolePermissionMatrixProps) {
  const selectedSet = new Set(selectedIds);

  if (modules.length === 0) {
    return (
      <p className="text-ehs-muted-text text8" role="status">
        {emptyHint ?? "Nothing here matches the current filter."}
      </p>
    );
  }

  return (
    <div className="border-ehs-border-ink/10 bg-ehs-surface overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[34rem] border-collapse">
        <thead>
          <tr className="text-ehs-muted-text text8">
            <th scope="col" className="py-2 pr-3 pl-1 text-left font-medium">
              Module
            </th>
            {CRUD_ACTIONS.map((action) => (
              <th
                key={action}
                scope="col"
                className="px-2 py-2 text-center font-medium"
              >
                {action}
              </th>
            ))}
            <th scope="col" className="py-2 pr-1 pl-2 text-right font-medium">
              <span className="sr-only">Grant or clear all</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <ModuleRow
              key={module.id}
              module={module}
              selectedSet={selectedSet}
              disabled={disabled}
              onToggle={onToggle}
              onSetMany={onSetMany}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
