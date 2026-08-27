import type { ApiResponse } from "@/types/api.types";
import type {
  ModuleKind,
  ModuleResponse,
  PermissionCatalogResponse,
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";

/**
 * One grantable action inside a module.
 *
 * `action` is what the grid shows — `Create`, `Reopen`, `Template.View` — because
 * the module is already the row's heading and repeating `Incident.` on every
 * cell reads as noise. `displayName` is the exact claim string and stays
 * available for the tooltip, which is the one place the raw form matters.
 */
export type CatalogPermission = {
  id: number;
  displayName: string;
  action: string;
  isCrud: boolean;
};

export type CatalogModule = {
  id: number;
  code: string;
  name: string;
  kind: ModuleKind;
  isLicensable: boolean;
  isLicensed: boolean;
  /** `View`, `Create`, `Update`, `Delete` — the grid's four columns. */
  crud: CatalogPermission[];
  /** Named extras revealed by expanding the row: `Close`, `Issue`, `Apply`. */
  extras: CatalogPermission[];
};

export type PermissionCatalog = {
  modules: CatalogModule[];
  platform: CatalogModule[];
  adminPortal: CatalogModule[];
};

/**
 * The four CRUD columns, in the order the grid renders them.
 *
 * Read-then-write, matching how someone building a role thinks about it, rather
 * than alphabetically. A module that does not define one of these renders an
 * empty cell rather than a disabled checkbox: there is nothing to grant, which
 * is different from something being withheld.
 */
export const CRUD_ACTIONS = ["View", "Create", "Update", "Delete"] as const;

export type CrudAction = (typeof CRUD_ACTIONS)[number];

function toCatalogPermission(permission: PermissionResponse): CatalogPermission {
  return {
    id: permission.id,
    displayName: permission.displayName,
    action: permission.action,
    isCrud: permission.isCrud,
  };
}

function toCatalogModule(module: ModuleResponse): CatalogModule {
  return {
    id: module.id,
    code: module.code,
    name: module.name,
    kind: module.kind,
    isLicensable: module.isLicensable,
    isLicensed: module.isLicensed,
    crud: (module.crudPermissions ?? []).map(toCatalogPermission),
    extras: (module.extraPermissions ?? []).map(toCatalogPermission),
  };
}

export function mapPermissionCatalog(
  response: PermissionCatalogResponse,
): PermissionCatalog {
  return {
    modules: (response.modules ?? []).map(toCatalogModule),
    platform: (response.platform ?? []).map(toCatalogModule),
    adminPortal: (response.adminPortal ?? []).map(toCatalogModule),
  };
}

/** Every module in the catalogue, in the order the screen stacks its sections. */
export function getAllModules(catalog: PermissionCatalog): CatalogModule[] {
  return [...catalog.modules, ...catalog.platform, ...catalog.adminPortal];
}

/** Every grantable permission across the whole catalogue. */
export function getAllCatalogPermissions(
  catalog: PermissionCatalog,
): CatalogPermission[] {
  return getAllModules(catalog).flatMap((module) => [
    ...module.crud,
    ...module.extras,
  ]);
}

export function getModulePermissions(module: CatalogModule): CatalogPermission[] {
  return [...module.crud, ...module.extras];
}

/** The permission that decides whether this module appears in the app's sidebar. */
export function getModuleViewPermission(
  module: CatalogModule,
): CatalogPermission | undefined {
  return module.crud.find((permission) => permission.action === "View");
}

/**
 * Find a module's CRUD permission for one column, or undefined when the module
 * does not define that action at all.
 */
export function getCrudPermission(
  module: CatalogModule,
  action: CrudAction,
): CatalogPermission | undefined {
  return module.crud.find((permission) => permission.action === action);
}

export type ModuleSelection = {
  selected: number;
  total: number;
  allGranted: boolean;
  noneGranted: boolean;
};

export function countModuleSelection(
  module: CatalogModule,
  selectedIds: readonly number[],
): ModuleSelection {
  const selectedSet = new Set(selectedIds);
  const permissions = getModulePermissions(module);
  const selected = permissions.filter((entry) => selectedSet.has(entry.id)).length;

  return {
    selected,
    total: permissions.length,
    allGranted: permissions.length > 0 && selected === permissions.length,
    noneGranted: selected === 0,
  };
}

/**
 * Modules matching a search box.
 *
 * Matches the module's own name as well as its actions, so typing "incident"
 * keeps the whole Incidents row rather than emptying it, and typing "reopen"
 * narrows to the modules that actually define it.
 */
export function filterModules(
  modules: readonly CatalogModule[],
  query: string,
): CatalogModule[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...modules];

  return modules.filter((module) => {
    if (module.name.toLowerCase().includes(needle)) return true;
    if (module.code.toLowerCase().includes(needle)) return true;

    return getModulePermissions(module).some(
      (permission) =>
        permission.action.toLowerCase().includes(needle) ||
        permission.displayName.toLowerCase().includes(needle),
    );
  });
}

export type RoleViewModel = {
  id: string;
  numericId: number;
  name: string;
  description: string;
  permissionIds: number[];
  permissionLabels: string[];
  userCount: number;
  isSystem: boolean;
};

/**
 * The role that owns the company. Read-only everywhere: it holds the whole
 * catalogue by definition and is topped up on every deploy, so an edit here was
 * never durable. The company is still bounded by its module licences, which sit
 * above the director and are applied when the token is minted.
 */
export const DIRECTOR_ROLE_NAME = "Ehs_Director";

export function isDirectorRole(role: { name: string }): boolean {
  return role.name.trim().toLowerCase() === DIRECTOR_ROLE_NAME.toLowerCase();
}

export function getPermissionLabel(permission: PermissionResponse): string {
  return permission.displayName?.trim() || `Permission ${permission.id}`;
}

function normalizePermissionIds(role: RoleWithPermissionsResponse): number[] {
  if (Array.isArray(role.permissionIds) && role.permissionIds.length > 0) {
    return role.permissionIds;
  }

  if (Array.isArray(role.permissions)) {
    return role.permissions.map((permission) => permission.id);
  }

  return [];
}

export function mapRoleWithPermissionsToViewModel(
  role: RoleWithPermissionsResponse,
  allPermissions: PermissionResponse[] = [],
): RoleViewModel {
  const permissionIds = normalizePermissionIds(role);
  const permissionMap = new Map(
    [...allPermissions, ...(role.permissions ?? [])].map((permission) => [
      permission.id,
      getPermissionLabel(permission),
    ]),
  );

  const permissionLabels = permissionIds.map(
    (id) => permissionMap.get(id) ?? `Permission ${id}`,
  );

  return {
    id: String(role.id),
    numericId: role.id,
    name: role.roleName,
    description: role.description?.trim() ?? "",
    permissionIds,
    permissionLabels,
    userCount: role.usersAssigned ?? 0,
    isSystem: role.isSystem === true,
  };
}

export function mapRolesWithPermissionsToViewModels(
  roles: RoleWithPermissionsResponse[],
  allPermissions: PermissionResponse[] = [],
): RoleViewModel[] {
  return roles.map((role) =>
    mapRoleWithPermissionsToViewModel(role, allPermissions),
  );
}

export function mapRolesToViewModels(roles: RoleResponse[]): RoleViewModel[] {
  return roles.map((role) => ({
    id: String(role.id),
    numericId: role.id,
    name: role.roleName,
    description: role.description?.trim() ?? "",
    permissionIds: [],
    permissionLabels: [],
    userCount: role.usersAssigned ?? 0,
    isSystem: role.isSystem === true,
  }));
}

export function getRoleStats(roles: RoleViewModel[]) {
  return {
    totalRoles: roles.length,
    totalUsersAssigned: roles.reduce((sum, role) => sum + role.userCount, 0),
    customRoles: roles.filter((role) => !role.isSystem).length,
  };
}

/**
 * How many of a role's rights fall in each module, for the summary tiles.
 * Unlicensed modules are included: a role can hold rights in one, they are
 * simply inert until the module is switched back on.
 */
export function countSelectedByModule(
  modules: readonly CatalogModule[],
  selectedIds: readonly number[],
): { module: string; count: number }[] {
  const selectedSet = new Set(selectedIds);

  return modules.map((module) => ({
    module: module.name,
    count: getModulePermissions(module).filter((permission) =>
      selectedSet.has(permission.id),
    ).length,
  }));
}

export function extractCreatedRoleId(response: ApiResponse): number {
  assertApiSuccess(response, "Failed to create role.");

  const model = unwrapDataModel<RoleResponse | number>(response);

  if (typeof model === "number") return model;

  if (model && typeof model === "object" && typeof model.id === "number") {
    return model.id;
  }

  throw new Error("Created role id missing from API response.");
}
