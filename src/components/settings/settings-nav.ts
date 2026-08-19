/**
 * The Settings tab strip, shared by both areas of this portal.
 *
 * There are two Settings surfaces — `/super/settings/*` for a CodeSwift platform account and
 * `/{company}/{site}/settings/*` for a tenant admin — and they deliberately share one nav, one
 * shell and one set of tab ids. What differs is what each tab can *do*, not what it is called;
 * see `SETTINGS_SECTIONS[].description`, which is written per area because the honest
 * one-liner for the Super Admin profile tab ("read-only") is not the tenant one.
 */

export type SettingsSectionId = "profile" | "security" | "appearance";

/**
 * Which Settings surface is on screen.
 *
 * `"super"` is a CodeSwift platform account (`/super/*`), `"tenant"` is an organization admin
 * inside a company/site (`/{company}/{site}/*`). The two have genuinely different backend
 * capability, so almost every branch in this folder keys off this value.
 */
export type SettingsArea = "super" | "tenant";

export type SettingsSection = Readonly<{
  id: SettingsSectionId;
  label: string;
  /** Iconify name shown on the tab. */
  icon: string;
  /** The one-line subtitle under the page title, per area. */
  description: Readonly<Record<SettingsArea, string>>;
}>;

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "mdi:account-outline",
    description: {
      tenant: "Your photo, name and contact details for this account.",
      super:
        "Who you are signed in as. Platform accounts are managed by CodeSwift and cannot be edited here.",
    },
  },
  {
    id: "security",
    label: "Security",
    icon: "mdi:shield-lock-outline",
    description: {
      tenant: "Your password and two-factor authentication for this account.",
      super: "Your platform password, changed with a code emailed to you.",
    },
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "mdi:theme-light-dark",
    description: { tenant: "How Neptune looks on this device.", super: "How Neptune looks on this device." },
  },
];

/** The landing tab. `/settings` redirects here. */
export const DEFAULT_SETTINGS_SECTION_ID: SettingsSectionId = "profile";

export const SUPER_SETTINGS_BASE_PATH = "/super/settings";
export const SUPER_DASHBOARD_HREF = "/super/dashboard";

export function buildTenantSettingsBasePath(
  company: string,
  site: string,
): string {
  return `/${company}/${site}/settings`;
}

export function buildTenantDashboardHref(
  company: string,
  site: string,
): string {
  return `/${company}/${site}/dashboard`;
}

export function buildSettingsHref(
  basePath: string,
  sectionId: SettingsSectionId,
): string {
  return `${basePath}/${sectionId}`;
}

/** The default tab of a given area — what the sidebar entry and `/settings` both point at. */
export function buildDefaultSettingsHref(basePath: string): string {
  return buildSettingsHref(basePath, DEFAULT_SETTINGS_SECTION_ID);
}

export function getSettingsSection(
  sectionId: SettingsSectionId,
): SettingsSection {
  return (
    SETTINGS_SECTIONS.find((section) => section.id === sectionId) ??
    SETTINGS_SECTIONS[0]
  );
}

export function isSettingsSectionActive(
  pathname: string,
  href: string,
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
