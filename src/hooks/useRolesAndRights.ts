"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRolePayload } from "@/dtos/req/roles.req";
import type {
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import { type TenantScope, useTenantScope } from "@/hooks/useTenantScope";
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
  deleteRole,
  createRole,
  getAllPermissions,
  getAllRoles,
  getAllRolesPermissions,
} from "@/services/roles.service";

/**
 * Base (prefix) keys. Mutations invalidate these directly — React Query matches
 * by prefix, so `["super-admin","roles-permissions"]` still invalidates the
 * tenant-scoped `["super-admin","roles-permissions","12","3"]` entries.
 */
export const ROLES_QUERY_KEY = ["super-admin", "roles"] as const;
export const PERMISSIONS_QUERY_KEY = ["super-admin", "permissions"] as const;
export const ROLES_PERMISSIONS_QUERY_KEY = [
  "super-admin",
  "roles-permissions",
] as const;

/**
 * Site-scoped key builders. The backend scopes tenant data by the SiteId inside
 * the org token, so the same URL returns different payloads per site — the
 * cache entries must be keyed by `[company, site]` or switching sites in the
 * header replays stale rows.
 */
export function rolesQueryKey(scope: TenantScope) {
  return [...ROLES_QUERY_KEY, ...scope.key] as const;
}

export function permissionsQueryKey(scope: TenantScope) {
  return [...PERMISSIONS_QUERY_KEY, ...scope.key] as const;
}

export function rolesPermissionsQueryKey(scope: TenantScope) {
  return [...ROLES_PERMISSIONS_QUERY_KEY, ...scope.key] as const;
}

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
  const scope = useTenantScope();

  return useQuery({
    queryKey: permissionsQueryKey(scope),
    queryFn: fetchPermissionsCatalog,
    enabled: scope.ready,
  });
}

export function useRolesWithPermissions() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: rolesPermissionsQueryKey(scope),
    queryFn: fetchRolesWithPermissions,
    enabled: scope.ready,
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

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: number) => {
      const response = await deleteRole(roleId);
      assertApiSuccess(response, "Failed to delete this role.");
      return response;
    },
    onSuccess: () => {
      // Both lists carry the role, and the summary counts change with it.
      queryClient.invalidateQueries({ queryKey: ROLES_PERMISSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}
