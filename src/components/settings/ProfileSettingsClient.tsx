"use client";

import { SettingsShell } from "@/components/settings/SettingsShell";
import { SuperAdminProfilePanel } from "@/components/settings/SuperAdminProfilePanel";
import { TenantProfilePanel } from "@/components/settings/TenantProfilePanel";
import { useSettingsLocation } from "@/components/settings/useSettingsLocation";

/**
 * Settings → Profile.
 *
 * The two areas render genuinely different panels, and the reason is backend capability, not
 * styling. A tenant admin has a `Users` row, so there is something to read
 * (`GET /v1/users/{id}`, `GET /v1/organizations/me`) and something to write
 * (`PUT /v1/users/me`, the avatar pair). A CodeSwift platform account has none of that: no
 * profile endpoint exists for it, its JWT carries no identity claims, and the `SuperAdmin`
 * entity has no `ProfileUrl` column. Rendering the tenant form with everything disabled would
 * be a lie about what is coming; the platform panel states the situation instead.
 *
 * If a super-admin profile API is ever added, the branch below collapses and
 * `SuperAdminProfilePanel` becomes a real form.
 */
export function ProfileSettingsClient() {
  const location = useSettingsLocation();

  return (
    <SettingsShell activeSection="profile">
      {location.area === "super" ? (
        <SuperAdminProfilePanel />
      ) : (
        <TenantProfilePanel />
      )}
    </SettingsShell>
  );
}
