import type { ApiResponse } from "@/types/api.types";
import type {
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import { isLockedRight } from "@/lib/permissions";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";

export type PermissionOption = {
  id: number;
  label: string;
  locked: boolean;
};

export type PermissionGroup = {
  group: string;
  permissions: PermissionOption[];
};

export type PermissionKindFilter = "all" | "pages" | "buttons" | "api";

export type PermissionGroupFilterOptions = {
  query?: string;
  kind?: PermissionKindFilter;
  selectedOnly?: boolean;
  selectedIds?: readonly number[];
};

const UI_PAGES_CATEGORY = "UI Pages";
const UI_BUTTONS_CATEGORY = "UI Buttons";

/** Classify a permission for toolbar filters (page:*, button:*, or legacy API/module). */
export function getPermissionKind(
  label: string,
  groupName = "",
): Exclude<PermissionKindFilter, "all"> {
  const normalizedLabel = label.trim().toLowerCase();
  const normalizedGroup = groupName.trim().toLowerCase();

  if (
    normalizedLabel.startsWith("page:") ||
    normalizedGroup === UI_PAGES_CATEGORY.toLowerCase()
  ) {
    return "pages";
  }

  if (
    normalizedLabel.startsWith("button:") ||
    normalizedGroup === UI_BUTTONS_CATEGORY.toLowerCase()
  ) {
    return "buttons";
  }

  return "api";
}

function permissionMatchesQuery(
  permission: PermissionOption,
  groupName: string,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    permission.label.toLowerCase().includes(needle) ||
    groupName.toLowerCase().includes(needle)
  );
}

/** Filter permission groups for the roles editor (search, kind tabs, selected-only). */
export function filterPermissionGroups(
  groups: PermissionGroup[],
  options: PermissionGroupFilterOptions = {},
): PermissionGroup[] {
  const kind = options.kind ?? "all";
  const query = options.query ?? "";
  const selectedOnly = options.selectedOnly === true;
  const selectedSet = new Set(options.selectedIds ?? []);

  return groups
    .map((entry) => {
      const permissions = entry.permissions.filter((permission) => {
        if (
          kind !== "all" &&
          getPermissionKind(permission.label, entry.group) !== kind
        ) {
          return false;
        }

        if (selectedOnly && !selectedSet.has(permission.id)) {
          return false;
        }

        return permissionMatchesQuery(permission, entry.group, query);
      });

      if (permissions.length === 0) return null;

      return { ...entry, permissions };
    })
    .filter((entry): entry is PermissionGroup => entry !== null);
}

/** Prefer smaller API groups first; large UI catalogs last. */
export function sortPermissionGroupsForDisplay(
  groups: PermissionGroup[],
): PermissionGroup[] {
  const rank = (group: PermissionGroup): number => {
    const kind = getPermissionKind("", group.group);
    if (kind === "api") return 0;
    if (kind === "pages") return 1;
    return 2;
  };

  return groups.toSorted((left, right) => {
    const rankDiff = rank(left) - rank(right);
    if (rankDiff !== 0) return rankDiff;
    if (left.permissions.length !== right.permissions.length) {
      return left.permissions.length - right.permissions.length;
    }
    return left.group.localeCompare(right.group);
  });
}

export function getSelectablePermissionIds(group: PermissionGroup): number[] {
  return group.permissions.filter((entry) => !entry.locked).map((entry) => entry.id);
}

export function countGroupSelection(
  group: PermissionGroup,
  selectedIds: readonly number[],
): { selected: number; total: number; selectable: number } {
  const selectedSet = new Set(selectedIds);
  const selectable = group.permissions.filter((entry) => !entry.locked);
  const selected = selectable.filter((entry) => selectedSet.has(entry.id)).length;

  return {
    selected,
    total: group.permissions.length,
    selectable: selectable.length,
  };
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

export function getPermissionLabel(permission: PermissionResponse): string {
  const label =
    permission.displayName?.trim() ||
    permission.permissionName?.trim() ||
    permission.name?.trim() ||
    permission.description?.trim();

  return label || `Permission ${permission.id}`;
}

export function getPermissionGroupName(permission: PermissionResponse): string {
  return (
    permission.categoryName?.trim() ||
    permission.group?.trim() ||
    permission.category?.trim() ||
    permission.module?.trim() ||
    "General"
  );
}

export function groupPermissions(
  permissions: PermissionResponse[],
): PermissionGroup[] {
  const grouped = new Map<string, PermissionOption[]>();

  for (const permission of permissions) {
    const groupName = getPermissionGroupName(permission);
    const label = getPermissionLabel(permission);
    const option: PermissionOption = {
      id: permission.id,
      label,
      locked: permission.isLocked === true || isLockedRight(label),
    };

    const existing = grouped.get(groupName) ?? [];
    existing.push(option);
    grouped.set(groupName, existing);
  }

  return [...grouped.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([group, items]) => ({
      group,
      permissions: items.toSorted((left, right) =>
        left.label.localeCompare(right.label),
      ),
    }));
}

function normalizePermissionIds(
  role: RoleWithPermissionsResponse,
): number[] {
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

export function countSelectedByPermissionGroup(
  groups: PermissionGroup[],
  selectedIds: number[],
): { group: string; count: number }[] {
  const selectedSet = new Set(selectedIds);

  return groups.map((entry) => ({
    group: entry.group,
    count: entry.permissions.filter((permission) =>
      selectedSet.has(permission.id),
    ).length,
  }));
}

export function matchPermissionIdsByLabels(
  permissions: PermissionResponse[],
  labels: string[],
): number[] {
  const labelSet = new Set(labels.map((label) => label.toLowerCase()));
  const ids = permissions
    .filter((permission) =>
      labelSet.has(getPermissionLabel(permission).toLowerCase()),
    )
    .map((permission) => permission.id);

  return [...new Set(ids)];
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
