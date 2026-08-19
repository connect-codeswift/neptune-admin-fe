"use client";

import {
  ReadOnlyField,
  SettingsCallout,
} from "@/components/settings/SettingsPieces";
import { Text } from "@/components/Text";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSettingsIdentity } from "@/hooks/useProfileSettings";

/**
 * Profile tab for a CodeSwift platform account. Read-only, and that is a backend fact rather
 * than a product decision.
 *
 * There is no `GET` or `PUT /v1/super-admin/auth/me`. A SuperAdmin session token carries only
 * `id` and `purpose: "superadmin-session"` — no name, no email, no role claim — so nothing can
 * be fetched about the signed-in account, and the tenant `PUT /v1/users/me` resolves its caller
 * from a `NameIdentifier` claim this token does not have. The `SuperAdmin` entity has no
 * `ProfileUrl` column either, so there is no avatar card here at all.
 *
 * What is left is the email captured at login (`setAuthEmail` in `super-admin-auth.service.ts`,
 * read back through `getAuthEmail`) and the role this portal stored alongside it. Both are shown
 * as read-only facts rather than as disabled text boxes: a greyed-out input implies a field that
 * could become editable, and this one never can.
 */
export function SuperAdminProfilePanel() {
  const identity = useSettingsIdentity();

  let emailValue = "Loading…";
  if (identity.isReady) {
    emailValue = identity.email ?? "Not available";
  }

  return (
    <>
      <GlassCard>
        <CardHeading
          title="Account"
          subtitle="Your Neptune platform sign-in."
        />

        <p role="status" aria-live="polite" className="sr-only">
          {identity.isReady ? "" : "Loading your account details…"}
        </p>

        <div className="mt-1 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label="Email"
            value={emailValue}
            note="The address you signed in with. Changing it needs a CodeSwift administrator."
          />

          <ReadOnlyField
            label="Role"
            value="Neptune platform admin"
            note="Full access to every company on the platform. Not editable from this portal."
          />
        </div>
      </GlassCard>

      <GlassCard>
        <CardHeading
          title="Why there is nothing to edit here"
          subtitle="Platform accounts are managed differently from company users."
        />

        <SettingsCallout>
          <div className="flex flex-col gap-2">
            <Text as="p" className="text8 text-ehs-gray">
              A platform account is not a member of any company, so it has no
              profile record: no display name, phone number or photo is stored
              against it, and no API returns one. The email above is remembered
              by this browser from when you signed in.
            </Text>
            <Text as="p" className="text8 text-ehs-gray">
              To have a platform account created, renamed or removed, ask a
              CodeSwift administrator. Your password you can change yourself —
              see the Security tab.
            </Text>
          </div>
        </SettingsCallout>
      </GlassCard>
    </>
  );
}
