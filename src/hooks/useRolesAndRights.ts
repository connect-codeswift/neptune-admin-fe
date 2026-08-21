"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRolePayload } from "@/dtos/req/roles.req";
import type {
  PermissionCatalogResponse,
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import { type TenantScope, useTenantScope } from "@/hooks/useTenantScope";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  extractCreatedRoleId,
  mapPermissionCatalog,
  mapRolesWithPermissionsToViewModels,
  type PermissionCatalog,
  type RoleViewModel,
} from "@/lib/mappers/roles.mapper";
import {
  assignRolePermissions,
  deleteRole,
  createRole,
  getAllPermissions,
  getAllRoles,
  getAllRolesPermissions,
  getPermissionCatalog,
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

/**
 * The module catalogue for the selected company, already carrying which modules
 * are licensed. One call: the grid needs modules, licensing and actions
 * together, and joining them client-side is what left the old screen guessing a
 * permission's module from its slug.
 */
async function fetchPermissionCatalog(): Promise<PermissionCatalog> {
  const response = await getPermissionCatalog();
  assertApiSuccess(response, "Failed to load the permission catalog.");
  // An empty catalog is a real answer for a company with nothing licensed, so a
  // missing body maps to empty sections rather than throwing.
  return mapPermissionCatalog(
    unwrapDataModel<PermissionCatalogResponse>(response) ?? {
      modules: [],
      platform: [],
      adminPortal: [],
    },
  );
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

export function usePermissionCatalog() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: permissionsQueryKey(scope),
    queryFn: fetchPermissionCatalog,
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
      // Saving a shared preset replaces it in the role lists with this
      // company's own copy (new id, isSystem false), so the plain roles list
      // and its summary tiles change too — not just the permission matrix.
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
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
