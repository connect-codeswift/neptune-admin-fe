"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InviteSuperAdminUserPayload,
  UpdateSuperAdminUserPayload,
} from "@/dtos/req/users.req";
import type { SuperAdminUserResponse } from "@/dtos/res/users.res";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";
import {
  SUPER_ADMIN_USERS_QUERY_KEY,
  SUPER_ADMIN_USER_STATS_QUERY_KEY,
} from "@/hooks/useSuperAdminUsers";
import {
  getUserById,
  inviteUser,
  updateUser,
  updateUserStatus,
} from "@/services/users.service";

export const superAdminUserDetailKey = (userId: string | number) =>
  ["super-admin", "users", "detail", String(userId)] as const;

async function fetchUserDetail(userId: string) {
  const response = await getUserById(userId);
  assertApiSuccess(response, "Failed to load user.");
  const user = unwrapDataModel<SuperAdminUserResponse>(response);
  if (!user) throw new Error("User not found.");
  return user;
}

export function useSuperAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: superAdminUserDetailKey(userId),
    queryFn: () => fetchUserDetail(userId),
    enabled: Boolean(userId),
  });
}

export function useInviteSuperAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteSuperAdminUserPayload) => {
      const response = await inviteUser(payload);
      assertApiSuccess(response, "Failed to invite user.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_USERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: SUPER_ADMIN_USER_STATS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateSuperAdminUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSuperAdminUserPayload) => {
      const response = await updateUser(userId, payload);
      assertApiSuccess(response, "Failed to update user.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: superAdminUserDetailKey(userId) });
      queryClient.invalidateQueries({
        queryKey: SUPER_ADMIN_USER_STATS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateSuperAdminUserStatus(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isDrop: boolean) => {
      const response = await updateUserStatus(userId, isDrop);
      assertApiSuccess(response, "Failed to update user status.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: superAdminUserDetailKey(userId) });
      queryClient.invalidateQueries({
        queryKey: SUPER_ADMIN_USER_STATS_QUERY_KEY,
      });
    },
  });
}
