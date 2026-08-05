"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRolePayload } from "@/dtos/req/roles.req";
import type {
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  extractCreatedRoleId,
  groupPermissions,
  mapRolesWithPermissionsToViewModels,
  type PermissionGroup,
  type RoleViewModel,
} from "@/lib/mappers/roles.mapper";
import {
  assignRolePermissions,
  createRole,
  getAllPermissions,
  getAllRoles,
  getAllRolesPermissions,
} from "@/services/roles.service";

export const ROLES_QUERY_KEY = ["super-admin", "roles"] as const;
export const PERMISSIONS_QUERY_KEY = ["super-admin", "permissions"] as const;
export const ROLES_PERMISSIONS_QUERY_KEY = [
  "super-admin",
  "roles-permissions",
] as const;

type PermissionsCatalog = {
  permissions: PermissionResponse[];
  groups: PermissionGroup[];
};

async function fetchPermissionsCatalog(): Promise<PermissionsCatalog> {
  const response = await getAllPermissions();
  assertApiSuccess(response, "Failed to load permissions.");
  const permissions = unwrapList<PermissionResponse>(response);
  return {
    permissions,
    groups: groupPermissions(permissions),
  };
}

async function fetchRolesWithPermissions(): Promise<RoleViewModel[]> {
  const [rolesResponse, permissionsResponse] = await Promise.all([
    getAllRolesPermissions(),
    getAllPermissions(),
  ]);

  assertApiSuccess(rolesResponse, "Failed to load roles and permissions.");
  assertApiSuccess(permissionsResponse, "Failed to load permissions.");

  const roles = unwrapList<RoleWithPermissionsResponse>(rolesResponse);
  const permissions = unwrapList<PermissionResponse>(permissionsResponse);

  if (roles.length > 0) {
    return mapRolesWithPermissionsToViewModels(roles, permissions);
  }

  const fallbackRolesResponse = await getAllRoles();
  assertApiSuccess(fallbackRolesResponse, "Failed to load roles.");
  const fallbackRoles = unwrapList<RoleResponse>(fallbackRolesResponse);
  return mapRolesWithPermissionsToViewModels(
    fallbackRoles.map(
      (role): RoleWithPermissionsResponse => ({
        ...role,
        permissions: [],
        permissionIds: [],
      }),
    ),
    permissions,
  );
}

export function useAllPermissions() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: fetchPermissionsCatalog,
  });
}

export function useRolesWithPermissions() {
  return useQuery({
    queryKey: ROLES_PERMISSIONS_QUERY_KEY,
    queryFn: fetchRolesWithPermissions,
  });
}

export function useCreateRoleWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRolePayload & { permissionIds: number[] }) => {
      const created = await createRole({
        roleName: input.roleName,
        description: input.description ?? null,
      });
      const roleId = extractCreatedRoleId(created);

      const assigned = await assignRolePermissions(roleId, {
        permissionIds: input.permissionIds,
      });
      assertApiSuccess(assigned, "Failed to assign permissions.");

      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_PERMISSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { roleId: number; permissionIds: number[] }) => {
      const response = await assignRolePermissions(input.roleId, {
        permissionIds: input.permissionIds,
      });
      assertApiSuccess(response, "Failed to save role permissions.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_PERMISSIONS_QUERY_KEY });
    },
  });
}
