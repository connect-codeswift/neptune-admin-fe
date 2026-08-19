import { redirect } from "next/navigation";
import {
  buildDefaultSettingsHref,
  SUPER_SETTINGS_BASE_PATH,
} from "@/components/settings/settings-nav";

/** `/super/settings` has no content of its own — it lands on the Profile tab. */
export default function SuperSettingsIndexRoute() {
  redirect(buildDefaultSettingsHref(SUPER_SETTINGS_BASE_PATH));
}
