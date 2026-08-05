"use client";

import { useQuery } from "@tanstack/react-query";
import type { GetSuperAdminUsersParams } from "@/dtos/req/users.req";
import type {
  SuperAdminUserResponse,
  SuperAdminUsersPageResponse,
  SuperAdminUsersStatsResponse,
} from "@/dtos/res/users.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  mapSuperAdminUsersToListItems,
  type UserListItem,
} from "@/lib/mappers/users.mapper";
import { getUserStats, getUsers } from "@/services/users.service";

export const SUPER_ADMIN_USERS_QUERY_KEY = ["super-admin", "users"] as const;
export const SUPER_ADMIN_USER_STATS_QUERY_KEY = [
  "super-admin",
  "users",
  "stats",
] as const;

export type UsersPageResult = {
  users: UserListItem[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
};

function unwrapUsersPage(response: Awaited<ReturnType<typeof getUsers>>): UsersPageResult {
  const model = unwrapDataModel<SuperAdminUsersPageResponse>(response);

  if (model && Array.isArray(model.data)) {
    return {
      users: mapSuperAdminUsersToListItems(model.data),
      totalRecords: model.totalRecords ?? model.data.length,
      pageNumber: model.pageNumber ?? 1,
      pageSize: model.pageSize ?? model.data.length,
    };
  }

  const fallback = unwrapList<SuperAdminUserResponse>(response);
  return {
    users: mapSuperAdminUsersToListItems(fallback),
    totalRecords: fallback.length,
    pageNumber: 1,
    pageSize: fallback.length || 1,
  };
}

async function fetchUsers(params: GetSuperAdminUsersParams): Promise<UsersPageResult> {
  const response = await getUsers({
    siteId: params.siteId,
    search: params.search?.trim() || undefined,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 20,
  });
  assertApiSuccess(response, "Failed to load users.");
  return unwrapUsersPage(response);
}

async function fetchUserStats(siteId?: number) {
  const response = await getUserStats(siteId ? { siteId } : undefined);
  assertApiSuccess(response, "Failed to load user stats.");
  const stats =
    unwrapDataModel<SuperAdminUsersStatsResponse>(response) ?? {
      totalUsers: 0,
      active: 0,
      pendingSetup: 0,
      suspended: 0,
    };

  return {
    total: stats.totalUsers,
    active: stats.active,
    pendingSetup: stats.pendingSetup,
    suspended: stats.suspended,
  };
}

export function useSuperAdminUsers(params: GetSuperAdminUsersParams) {
  return useQuery({
    queryKey: [
      ...SUPER_ADMIN_USERS_QUERY_KEY,
      params.siteId ?? "all",
      params.search ?? "",
      params.pageNumber ?? 1,
      params.pageSize ?? 20,
    ],
    queryFn: () => fetchUsers(params),
  });
}

export function useSuperAdminUserStats(siteId?: number) {
  return useQuery({
    queryKey: [...SUPER_ADMIN_USER_STATS_QUERY_KEY, siteId ?? "all"],
    queryFn: () => fetchUserStats(siteId),
  });
}
