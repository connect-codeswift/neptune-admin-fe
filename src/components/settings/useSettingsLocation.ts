"use client";

import { usePathname } from "next/navigation";
import { useTenantScope } from "@/hooks/useTenantScope";
import {
  buildDefaultSettingsHref,
  buildTenantDashboardHref,
  buildTenantSettingsBasePath,
  SUPER_DASHBOARD_HREF,
  SUPER_SETTINGS_BASE_PATH,
  type SettingsArea,
} from "@/components/settings/settings-nav";

export type SettingsLocation = Readonly<{
  area: SettingsArea;
  /** `/super/settings` or `/{company}/{site}/settings`. */
  basePath: string;
  /** Where the "Dashboard" crumb points. */
  dashboardHref: string;
  /** The Profile tab of this area — the sidebar entry and the `/settings` redirect target. */
  defaultHref: string;
  /** False until the tenant route segments resolve. Always true in the super area. */
  isReady: boolean;
}>;

/**
 * Which of the two Settings surfaces is on screen.
 *
 * Resolved from the URL rather than from the stored role, because the two are not the same
 * question: CodeSwift staff browsing a client company are on `/{company}/{site}/*` with an
 * org-scoped token, and while they are there the tenant tabs are the ones that apply to the
 * page they are looking at. The role still matters for what those tabs can *do* — see
 * `useSettingsIdentity` — but not for which strip is drawn.
 */
export function useSettingsLocation(): SettingsLocation {
  const pathname = usePathname() ?? "";
  const scope = useTenantScope();

  if (pathname === "/super" || pathname.startsWith("/super/")) {
    return {
      area: "super",
      basePath: SUPER_SETTINGS_BASE_PATH,
      dashboardHref: SUPER_DASHBOARD_HREF,
      defaultHref: buildDefaultSettingsHref(SUPER_SETTINGS_BASE_PATH),
      isReady: true,
    };
  }

  const basePath = buildTenantSettingsBasePath(scope.company, scope.site);

  return {
    area: "tenant",
    basePath,
    dashboardHref: buildTenantDashboardHref(scope.company, scope.site),
    defaultHref: buildDefaultSettingsHref(basePath),
    isReady: scope.ready,
  };
}
