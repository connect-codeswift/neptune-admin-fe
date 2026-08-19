"use client";

import { SettingsShell } from "@/components/settings/SettingsShell";
import { ThemePreferencePicker } from "@/components/settings/ThemePreferencePicker";
import { Text } from "@/components/Text";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Appearance settings.
 *
 * The one tab that is identical for a platform account and a tenant admin: the theme is stored
 * on the device, never on the account, so nothing here depends on what the backend knows about
 * the signed-in user. Both areas render this component unchanged.
 *
 * No Save button: the theme applies the moment it is picked. A Save button would imply a round
 * trip that does not happen, and a preview you have to confirm is a worse way to choose a
 * colour scheme than simply seeing it.
 */
export function AppearanceSettingsClient() {
  return (
    <SettingsShell activeSection="appearance">
      <GlassCard>
        <CardHeading
          title="Theme"
          subtitle="Applies immediately. Saved on this device, so each browser you sign in from can differ."
        />

        <ThemePreferencePicker />
      </GlassCard>

      <GlassCard>
        <CardHeading
          title="Accessibility"
          subtitle="Neptune follows your system settings for these."
        />

        <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
          <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
            <Text as="p" className="text4 text-ehs-darker">
              Reduced motion
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text">
              Card entrances, hover lifts and loading sweeps are switched off
              when your device asks for reduced motion.
            </Text>
          </div>

          <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
            <Text as="p" className="text4 text-ehs-darker">
              Form controls and scrollbars
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text">
              Date pickers, dropdowns and scrollbars are drawn by your browser
              in the theme selected above.
            </Text>
          </div>
        </div>
      </GlassCard>
    </SettingsShell>
  );
}
