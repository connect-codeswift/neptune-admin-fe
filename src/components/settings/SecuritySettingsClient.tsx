"use client";

import { SettingsShell } from "@/components/settings/SettingsShell";
import { SuperAdminSecurityPanel } from "@/components/settings/SuperAdminSecurityPanel";
import { TenantSecurityPanel } from "@/components/settings/TenantSecurityPanel";
import { useSettingsLocation } from "@/components/settings/useSettingsLocation";

/**
 * Settings → Security.
 *
 * The sharpest of the three branches, and the one most worth understanding before changing.
 *
 * A tenant admin gets the ordinary pair of cards: change password against
 * `POST /v1/auth/me/change-password`, and two-factor enrol/disable against
 * `POST /v1/auth/mfa/{setup,enable,disable}`. All five endpoints identify the caller from the
 * `NameIdentifier` claim on the tenant token.
 *
 * A CodeSwift platform account has no such claim — its JWT carries only `id` and
 * `purpose: "superadmin-session"` — and there is no super-admin equivalent of any of them.
 * Calling the tenant change-password endpoint with a platform token does not fail cleanly; it
 * throws inside `int.Parse(null)` and returns a 500. So the platform panel drives the OTP reset
 * pair (`/v1/super-admin/auth/forgot-password` then `/reset-password`), which is the only
 * self-service password path that exists today, and states plainly why two-factor cannot be
 * managed from a settings page.
 *
 * This is a backend capability gap, not a design choice. Both panels carry the same explanation
 * at the top of their files.
 */
export function SecuritySettingsClient() {
  const location = useSettingsLocation();

  return (
    <SettingsShell activeSection="security">
      {location.area === "super" ? (
        <SuperAdminSecurityPanel />
      ) : (
        <TenantSecurityPanel />
      )}
    </SettingsShell>
  );
}
