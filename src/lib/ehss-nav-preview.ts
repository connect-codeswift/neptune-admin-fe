import type { CatalogModule } from "@/lib/mappers/roles.mapper";
import { getModuleViewPermission } from "@/lib/mappers/roles.mapper";

/**
 * The EHSS app's sidebar, mirrored so the role editor can *show* an admin what a
 * role will see rather than asking them to picture it from a permission name.
 *
 * ## What changed
 *
 * This used to be keyed on `page:` slugs copied from `app-nav.ts` in the other
 * repo, which meant two hand-maintained lists that drifted silently. It is now
 * keyed on **module code**, which is backend data both repos already agree on,
 * so the only thing left here is presentation: which group a module sits under
 * and which icon it wears. A module missing from the groups below still renders,
 * under "Other", so nothing can disappear from the preview by omission.
 *
 * ## The rule this mirrors
 *
 * A sidebar entry appears when the company has licensed the module **and** the
 * role holds that module's `View`. Chat, Dashboard and Settings sit outside the
 * module catalogue entirely — every user needs Settings to reach their own
 * account — so they are always shown and cannot be granted or revoked here.
 */
export type NavPreviewEntry = Readonly<{
  /** Module code, matching `Modules.Code` on the backend. */
  code: string;
  icon: string;
}>;

export type NavPreviewGroup = Readonly<{
  title: string;
  entries: readonly NavPreviewEntry[];
}>;

/** Rows the app shows to everyone, with no module and no permission behind them. */
export const ALWAYS_VISIBLE_NAV: readonly {
  label: string;
  icon: string;
  group: string;
}[] = [
  { label: "Chat", icon: "ri:chat-ai-line", group: "Neptune AI" },
  { label: "Dashboard", icon: "mdi:view-grid-outline", group: "Dashboard" },
  { label: "Settings", icon: "mdi:cog-outline", group: "System" },
];

export const EHSS_NAV_PREVIEW: readonly NavPreviewGroup[] = [
  {
    title: "Safety",
    entries: [
      { code: "INCIDENT", icon: "mdi:alert-outline" },
      { code: "NEAR_MISS", icon: "mdi:eye-outline" },
      { code: "HAZARD", icon: "mdi:alert-octagon-outline" },
      { code: "LOCKOUT_TAGOUT", icon: "mdi:lock-outline" },
      { code: "FLEET_MANAGEMENT", icon: "mdi:steering" },
      { code: "CAPA", icon: "mdi:refresh" },
      { code: "HAZCOM", icon: "healthicons:chemical-burn" },
    ],
  },
  {
    title: "Compliance",
    entries: [
      { code: "AUDITS", icon: "mdi:shield-check-outline" },
      { code: "INSPECTIONS", icon: "mdi:clipboard-text-outline" },
      { code: "BEHAVIOUR_BASED_SAFETY", icon: "mdi:clipboard-outline" },
      { code: "WALK_AND_TALKS", icon: "mdi:account-multiple-outline" },
      { code: "REGULATORY_COMPLIANCE", icon: "mdi:file-document-outline" },
      { code: "PPE_MANAGEMENT", icon: "mdi:tshirt-crew-outline" },
      { code: "POLICY_MAKER", icon: "mdi:folder-outline" },
    ],
  },
  {
    title: "Insights",
    entries: [
      { code: "ANALYTICS", icon: "mdi:chart-line" },
      { code: "REPORTS", icon: "mdi:file-chart-outline" },
    ],
  },
  {
    title: "Environment",
    entries: [{ code: "EMISSIONS", icon: "mdi:leaf" }],
  },
  {
    title: "Health",
    entries: [{ code: "INDUSTRIAL_HYGIENE", icon: "mdi:flask-outline" }],
  },
];

const ICON_BY_CODE = new Map(
  EHSS_NAV_PREVIEW.flatMap((group) =>
    group.entries.map((entry) => [entry.code.toUpperCase(), entry.icon] as const),
  ),
);

/**
 * Icons for modules that have no sidebar entry: the shared platform registers and
 * the admin portal. Keyed by code like the sidebar map, because module names are
 * display text and change more freely than codes do.
 */
const PLATFORM_ICONS: Readonly<Record<string, string>> = {
  LOCATIONS: "mdi:map-marker-outline",
  DEPARTMENTS: "mdi:office-building-outline",
  FILES: "mdi:paperclip",
  NOTIFICATIONS: "mdi:bell-outline",
  RCA: "mdi:sitemap-outline",
  KPI_TARGETS: "mdi:target",
  COMMAND_CENTER: "mdi:monitor-dashboard",
  ADMIN_PORTAL: "mdi:shield-account-outline",
};

/**
 * An icon for a module, by its code.
 *
 * Pass the code, not the name. Both maps are keyed by code, so a name only
 * resolves when it happens to equal its code — which is why Hazard and CAPA had
 * icons while Incidents, Near Miss and Audits fell back to a generic glyph.
 */
export function getModuleIcon(code: string): string {
  const key = code.trim().toUpperCase();

  return ICON_BY_CODE.get(key) ?? PLATFORM_ICONS[key] ?? "mdi:puzzle-outline";
}

export type ResolvedNavItem = Readonly<{
  module: CatalogModule;
  icon: string;
  /** The role holds this module's View. */
  granted: boolean;
  /** The company has licensed it. Ungranted and unlicensed read differently. */
  licensed: boolean;
  /** The View permission's id, absent only if the module defines no View. */
  permissionId?: number;
}>;

export type ResolvedNavGroup = Readonly<{
  title: string;
  items: readonly ResolvedNavItem[];
}>;

/**
 * The sidebar this role would see, grouped as the app groups it.
 *
 * **Unlicensed modules are not in it at all.** They used to render greyed with a
 * "not licensed" note, which was wrong for this screen specifically: the app's
 * sidebar does not show them, so a preview that does is not a preview. The Rights
 * grid still lists them, greyed and disabled, because there the point is the
 * opposite one — that the grants survive and come back when the module does.
 *
 * A module the groups above do not mention falls into "Other" rather than
 * vanishing, so one added on the backend shows up without anyone editing this file.
 */
export function resolveNavPreview(
  modules: readonly CatalogModule[],
  selectedIds: readonly number[],
): ResolvedNavGroup[] {
  const selected = new Set(selectedIds);
  const licensedOnly = modules.filter((module) => module.isLicensed);
  const byCode = new Map(licensedOnly.map((module) => [module.code.toUpperCase(), module]));
  const placed = new Set<string>();

  const toItem = (module: CatalogModule, icon: string): ResolvedNavItem => {
    const view = getModuleViewPermission(module);

    return {
      module,
      icon,
      granted: view ? selected.has(view.id) : false,
      licensed: module.isLicensed,
      permissionId: view?.id,
    };
  };

  const groups: ResolvedNavGroup[] = EHSS_NAV_PREVIEW.map((group) => {
    const items = group.entries
      .map((entry) => {
        // Not named `module`: Next forbids assigning to that identifier.
        const found = byCode.get(entry.code.toUpperCase());
        if (!found) return null;
        placed.add(found.code.toUpperCase());
        return toItem(found, entry.icon);
      })
      .filter((item): item is ResolvedNavItem => item !== null);

    return { title: group.title, items };
  }).filter((group) => group.items.length > 0);

  const leftover = licensedOnly.filter(
    (module) => !placed.has(module.code.toUpperCase()),
  );

  if (leftover.length > 0) {
    groups.push({
      title: "Other",
      items: leftover.map((module) => toItem(module, getModuleIcon(module.code))),
    });
  }

  return groups;
}

/** How many sidebar entries this role would actually see. */
export function countVisibleNavItems(groups: readonly ResolvedNavGroup[]): number {
  return groups.reduce(
    (total, group) => total + group.items.filter((item) => item.granted).length,
    0,
  );
}
