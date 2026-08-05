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
