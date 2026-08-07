"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type {
  DeployAlertResponse,
  DeployHistoryEntryResponse,
  DeployStatusResponse,
} from "@/dtos/res/platform-ops.res";
import { ApiError } from "@/lib/api-error";
import { AUTH_SESSION_EVENT } from "@/lib/auth-tokens";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  DEPLOY_ALERTS_POLL_MS,
  DEPLOY_HISTORY_POLL_MS,
  DEPLOY_STATUS_POLL_MS,
  getUnresolvedAlerts,
  isDeployPipelineAbsent,
} from "@/lib/deploy-status";
import {
  getDummyDeployAlerts,
  getDummyDeployHistory,
  getDummyDeployStatus,
} from "@/lib/dummy-deploy-status";
import { canAccessSuperDashboard } from "@/lib/dashboard-auth";
import {
  getDeployAlerts,
  getDeployHistory,
  getDeployStatus,
} from "@/services/platform-ops.service";
import type { ApiResponse } from "@/types/api.types";

export const DEPLOY_STATUS_KEY = ["platform-ops", "deploy-status"] as const;
export const DEPLOY_HISTORY_KEY = ["platform-ops", "deploy-history"] as const;
export const DEPLOY_ALERTS_KEY = ["platform-ops", "alerts"] as const;

/**
 * Every deploy query resolves rather than rejects on 503: that status means the
 * environment simply does not run the deploy pipeline, which is the expected
 * answer everywhere except production. Sample data is substituted so the panel
 * is developable locally — `isSample` drives the ribbon that says so.
 */
export type DeployQueryResult<T> = {
  data: T;
  /** This environment does not run the deploy pipeline (API answered 503). */
  pipelineAbsent: boolean;
  /** `data` is sample data, not the real host. */
  isSample: boolean;
};

/** The history/alerts endpoints may answer with a bare array or the envelope. */
function toList<T>(payload: unknown, fallbackMessage: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const response = payload as ApiResponse;
  assertApiSuccess(response, fallbackMessage);
  return unwrapList<T>(response);
}

function sample<T>(data: T): DeployQueryResult<T> {
  return { data, pipelineAbsent: true, isSample: true };
}

function live<T>(data: T): DeployQueryResult<T> {
  return { data, pipelineAbsent: false, isSample: false };
}

async function fetchDeployStatus(): Promise<DeployQueryResult<DeployStatusResponse>> {
  try {
    const response = await getDeployStatus();
    assertApiSuccess(response, "Failed to load deploy status.");
    const model = unwrapDataModel<DeployStatusResponse>(response);
    if (!model) throw new Error("Deploy status snapshot was empty.");
    return live(model);
  } catch (error) {
    if (isDeployPipelineAbsent(error)) return sample(getDummyDeployStatus());
    throw error;
  }
}

async function fetchDeployHistory(
  limit: number,
): Promise<DeployQueryResult<DeployHistoryEntryResponse[]>> {
  try {
    const response = await getDeployHistory(limit);
    return live(
      toList<DeployHistoryEntryResponse>(response, "Failed to load deploy history."),
    );
  } catch (error) {
    if (isDeployPipelineAbsent(error)) return sample(getDummyDeployHistory());
    throw error;
  }
}

async function fetchDeployAlerts(
  limit: number,
): Promise<DeployQueryResult<DeployAlertResponse[]>> {
  try {
    const response = await getDeployAlerts(limit);
    return live(toList<DeployAlertResponse>(response, "Failed to load deploy alerts."));
  } catch (error) {
    if (isDeployPipelineAbsent(error)) return sample(getDummyDeployAlerts());
    throw error;
  }
}

/** A 403 (not staff) is a permanent answer — retrying it just burns requests. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 403) return false;
  return failureCount < 2;
}

function pollWhenAvailable(intervalMs: number) {
  return (query: { state: { data?: DeployQueryResult<unknown> } }) => {
    if (query.state.data?.pipelineAbsent) return false;
    return intervalMs;
  };
}

export function useDeployStatus() {
  return useQuery({
    queryKey: DEPLOY_STATUS_KEY,
    queryFn: fetchDeployStatus,
    retry: shouldRetry,
    refetchInterval: pollWhenAvailable(DEPLOY_STATUS_POLL_MS),
    refetchIntervalInBackground: false,
  });
}

export function useDeployHistory(limit = 50) {
  return useQuery({
    queryKey: [...DEPLOY_HISTORY_KEY, limit],
    queryFn: () => fetchDeployHistory(limit),
    retry: shouldRetry,
    refetchInterval: pollWhenAvailable(DEPLOY_HISTORY_POLL_MS),
    refetchIntervalInBackground: false,
  });
}

export function useDeployAlerts(limit = 50) {
  return useQuery({
    queryKey: [...DEPLOY_ALERTS_KEY, limit],
    queryFn: () => fetchDeployAlerts(limit),
    retry: shouldRetry,
    refetchInterval: pollWhenAvailable(DEPLOY_ALERTS_POLL_MS),
    refetchIntervalInBackground: false,
  });
}

/** Staff role lives in localStorage, so it is read as an external store. */
function subscribeToAuthSession(onChange: () => void) {
  window.addEventListener(AUTH_SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** No localStorage on the server — the badge resolves after hydration. */
function getServerStaffSnapshot(): boolean {
  return false;
}

/**
 * Unresolved-alert count for the sidebar badge. Shares the alerts cache entry
 * with the panel, so opening the page costs no extra request.
 *
 * Sample data never badges the nav — a red count on every developer's sidebar
 * for a fake outage would train people to ignore it.
 */
export function useDeployAlertBadgeCount(): number {
  const isStaff = useSyncExternalStore(
    subscribeToAuthSession,
    canAccessSuperDashboard,
    getServerStaffSnapshot,
  );

  const { data } = useQuery({
    queryKey: [...DEPLOY_ALERTS_KEY, 50],
    queryFn: () => fetchDeployAlerts(50),
    enabled: isStaff,
    retry: shouldRetry,
    refetchInterval: pollWhenAvailable(DEPLOY_ALERTS_POLL_MS),
    refetchIntervalInBackground: false,
  });

  if (!data || data.isSample) return 0;
  return getUnresolvedAlerts(data.data).length;
}
