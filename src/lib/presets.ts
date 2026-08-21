import {
  getAllCatalogPermissions,
  getModulePermissions,
  type CatalogModule,
  type PermissionCatalog,
} from "@/lib/mappers/roles.mapper";

/**
 * Starting points for a new role, computed from the live catalogue.
 *
 * ## Why these are computed
 *
 * They used to be hardcoded lists of permission names — `Dashboard.View`,
 * `Safety.Incident.View`, `System.Users.Manage` — matched against the catalogue
 * by label. Only 8 of those 44 strings ever existed: the rest were invented for
 * an early mockup and never reconciled with the backend, and a name that matches
 * nothing contributes nothing silently. "Start from EHS Director" was therefore
 * granting a near-random handful of rights and reporting a count that looked
 * plausible.
 *
 * Deriving them from the catalogue makes that failure mode impossible. A preset
 * is now a rule over whatever the backend actually defines, so a module added
 * next month is covered without anyone editing this file.
 */
export type RolePreset = {
  id: string;
  name: string;
  description: string;
  /** Which of a module's actions this preset grants. */
  matches: (module: CatalogModule) => number[];
};

/** Actions that only ever appear in the "full access" preset. */
const DESTRUCTIVE = new Set(["Delete"]);

function idsForActions(
  module: CatalogModule,
  predicate: (action: string) => boolean,
): number[] {
  return getModulePermissions(module)
    .filter((permission) => predicate(permission.action))
    .map((permission) => permission.id);
}

export const ROLE_PRESETS: readonly RolePreset[] = [
  {
    id: "view-only",
    name: "View only",
    description: "Can open every licensed module and read what is there.",
    matches: (module) => idsForActions(module, (action) => action === "View"),
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Reads, raises and edits records. Cannot delete.",
    matches: (module) =>
      idsForActions(
        module,
        (action) => action === "View" || action === "Create" || action === "Update",
      ),
  },
  {
    id: "manager",
    name: "Manager",
    description:
      "Everything except deleting records — including each module's own actions, like closing an incident.",
    matches: (module) => idsForActions(module, (action) => !DESTRUCTIVE.has(action)),
  },
  {
    id: "blank",
    name: "Blank",
    description: "No rights at all. Build the role up from nothing.",
    matches: () => [],
  },
];

export const DEFAULT_PRESET_ID = "view-only";

export function getPreset(presetId: string): RolePreset | undefined {
  return ROLE_PRESETS.find((preset) => preset.id === presetId);
}

/**
 * The permission ids a preset grants across the whole catalogue.
 *
 * Admin-portal rights are never included: handing a brand new role the ability
 * to manage users, roles and sites is not a sensible default for any of these,
 * and it is one tick away in the grid for the cases that want it.
 */
export function getPresetPermissionIds(
  catalog: PermissionCatalog,
  presetId: string,
): number[] {
  const preset = getPreset(presetId);
  if (!preset) return [];

  return [...catalog.modules, ...catalog.platform].flatMap((module) =>
    preset.matches(module),
  );
}

export function getPresetRightCount(
  catalog: PermissionCatalog,
  presetId: string,
): number {
  return getPresetPermissionIds(catalog, presetId).length;
}

/** Total grantable rights, for "12 of 92" style counts. */
export function getCatalogRightCount(catalog: PermissionCatalog): number {
  return getAllCatalogPermissions(catalog).length;
}
