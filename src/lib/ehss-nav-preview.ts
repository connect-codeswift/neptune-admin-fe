import type { PermissionOption } from "@/lib/mappers/roles.mapper";

/**
 * The EHSS app's sidebar, mirrored so the role editor can *show* an admin what
 * a role will see instead of asking them to picture it from `page:hazcom`.
 *
 * ## Why a copy
 *
 * The real catalogue is `APP_NAV_GROUPS` in `neptune-ehss-fe/src/lib/app-nav.ts`,
 * which this portal cannot import across repos. Keep the two in step: an entry
 * added there and not here simply drops out of the preview (it still appears
 * under "Other pages" below the sidebar, so nothing becomes unreachable), and an
 * entry here with no matching permission row renders as unavailable rather than
 * pretending to work.
 *
 * ## The rule this mirrors
 *
 * `app-nav.ts` derives an item's permission from its href — `/dashboard/hazcom`
 * becomes `page:hazcom` — and matches it **exactly**. Not by prefix: a role
 * holding `page:hazcom-sds` but not `page:hazcom` does not see HazCom in the
 * sidebar. That is the whole reason `SeedModulePagePermissions` gave every
 * sidebar entry a module-level row: one box hides one module.
 */
export type NavPreviewItem = Readonly<{
  label: string;
  /** The exact `page:` permission that gates this entry. */
  permission: string;
  icon: string;
  /**
   * Shown whatever the role's page grants are. Chat, Dashboard and Settings sit
   * outside the page catalogue — every user needs Settings to reach their own
   * account — so the page gate must not hide them.
   */
  alwaysVisible?: boolean;
  /** Also requires the company to license the module (a separate gate). */
  licensed?: boolean;
}>;

export type NavPreviewGroup = Readonly<{
  title: string;
  items: readonly NavPreviewItem[];
}>;

export const EHSS_NAV_PREVIEW: readonly NavPreviewGroup[] = [
  {
    title: "Neptune AI",
    items: [
      {
        label: "Chat",
        permission: "page:neptune-ai",
        icon: "ri:chat-ai-line",
        alwaysVisible: true,
      },
    ],
  },
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        permission: "page:dashboard",
        icon: "mdi:view-grid-outline",
        alwaysVisible: true,
      },
    ],
  },
  {
    title: "Safety",
    items: [
      { label: "Incidents", permission: "page:incidents", icon: "mdi:alert-outline", licensed: true },
      { label: "Near Miss", permission: "page:near-miss", icon: "mdi:eye-outline", licensed: true },
      { label: "Hazard", permission: "page:hazard", icon: "mdi:alert-octagon-outline", licensed: true },
      { label: "Lockout/Tagout", permission: "page:lockout-tagout", icon: "mdi:lock-outline", licensed: true },
      { label: "Fleet Management", permission: "page:fleet-management", icon: "mdi:steering", licensed: true },
      { label: "CAPA", permission: "page:capa", icon: "mdi:refresh", licensed: true },
      { label: "HazCom", permission: "page:hazcom", icon: "healthicons:chemical-burn", licensed: true },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "Audits", permission: "page:audits", icon: "mdi:shield-check-outline", licensed: true },
      { label: "Inspections", permission: "page:inspections", icon: "mdi:clipboard-text-outline", licensed: true },
      { label: "BBS", permission: "page:bbs", icon: "mdi:clipboard-outline", licensed: true },
      { label: "Walk & Talk", permission: "page:walk-talk", icon: "mdi:account-multiple-outline", licensed: true },
      {
        label: "Regulatory Compliance",
        permission: "page:regulatory-compliance",
        icon: "mdi:file-document-outline",
        licensed: true,
      },
      { label: "PPE Management", permission: "page:ppe-management", icon: "mdi:tshirt-crew-outline", licensed: true },
      { label: "Policy Maker", permission: "page:policy-maker", icon: "mdi:folder-outline", licensed: true },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", permission: "page:analytics", icon: "mdi:chart-line", licensed: true },
      { label: "Reports", permission: "page:reports", icon: "mdi:file-chart-outline", licensed: true },
    ],
  },
  {
    title: "Environment",
    items: [
      { label: "Emissions", permission: "page:emissions", icon: "mdi:leaf", licensed: true },
    ],
  },
  {
    title: "Health",
    items: [
      {
        label: "Industrial Hygiene",
        permission: "page:industrial-hygiene",
        icon: "mdi:flask-outline",
        licensed: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        permission: "page:settings",
        icon: "mdi:cog-outline",
        alwaysVisible: true,
      },
    ],
  },
];

/** Every `page:` permission the mirrored sidebar accounts for. */
const NAV_PERMISSIONS = new Set(
  EHSS_NAV_PREVIEW.flatMap((group) => group.items.map((item) => item.permission)),
);

/** One sidebar row, resolved against the catalogue and the current selection. */
export type ResolvedNavItem = Readonly<{
  item: NavPreviewItem;
  /** The catalogue row that grants it. Null when the backend has no such row. */
  option: PermissionOption | null;
  granted: boolean;
  /** Visible in the app: granted, or always visible regardless of grants. */
  visible: boolean;
}>;

export type ResolvedNavGroup = Readonly<{
  title: string;
  items: readonly ResolvedNavItem[];
  visibleCount: number;
}>;

/**
 * Resolve the mirrored sidebar against the live permission catalogue and the
 * ids currently ticked.
 *
 * `pageOptions` is the API's `UI Pages` category, so the preview can only ever
 * offer a toggle for a row that really exists — a nav entry with no permission
 * row resolves to `option: null` and is shown as unavailable rather than as an
 * unchecked box that would silently do nothing.
 */
export function resolveNavPreview(
  pageOptions: readonly PermissionOption[],
  selectedIds: readonly number[],
): ResolvedNavGroup[] {
  const byLabel = new Map(
    pageOptions.map((option) => [option.label.trim().toLowerCase(), option]),
  );
  const selected = new Set(selectedIds);

  return EHSS_NAV_PREVIEW.map((group) => {
    const items = group.items.map((item): ResolvedNavItem => {
      const option = byLabel.get(item.permission) ?? null;
      const granted = option !== null && selected.has(option.id);

      return {
        item,
        option,
        granted,
        visible: granted || item.alwaysVisible === true,
      };
    });

    return {
      title: group.title,
      items,
      visibleCount: items.filter((entry) => entry.visible).length,
    };
  });
}

/**
 * Page rows that gate a route *inside* a module rather than a sidebar entry —
 * `page:hazcom-sds` and friends. They still matter, so they are listed rather
 * than dropped; they just do not move the sidebar.
 */
export function getNonNavPageOptions(
  pageOptions: readonly PermissionOption[],
): PermissionOption[] {
  return pageOptions.filter(
    (option) => !NAV_PERMISSIONS.has(option.label.trim().toLowerCase()),
  );
}

/* ————————————————————————————————————————————————————————————————
   Module identity, shared by the Pages preview and the Actions / Buttons
   matrices so one module wears one icon everywhere in the editor.
   ———————————————————————————————————————————————————————————————— */

/** `Regulatory Compliance` / `regulatory-compliance` / `Compliance` → `regulatorycompliance`. */
function normalizeModuleKey(name: string): string {
  return name.trim().toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

const NAV_ICON_BY_KEY = new Map<string, string>(
  EHSS_NAV_PREVIEW.flatMap((group) =>
    group.items.flatMap((item) => {
      const fromLabel = normalizeModuleKey(item.label);
      const fromSlug = normalizeModuleKey(item.permission.replace(/^page:/, ""));
      // Singular too: the permission catalogue says "Audit", the sidebar says
      // "Audits", and they are the same module.
      const keys = new Set([fromLabel, fromSlug]);
      for (const key of [...keys]) {
        if (key.endsWith("s")) keys.add(key.slice(0, -1));
      }
      return [...keys].map((key) => [key, item.icon] as const);
    }),
  ),
);

/** Categories the catalogue has that the sidebar does not, given a sensible face. */
const EXTRA_MODULE_ICONS: Readonly<Record<string, string>> = {
  department: "mdi:sitemap-outline",
  file: "mdi:paperclip",
  location: "mdi:map-marker-outline",
  notification: "mdi:bell-outline",
  document: "mdi:file-document-outline",
  user: "mdi:account-outline",
  role: "mdi:shield-account-outline",
  site: "mdi:office-building-outline",
  organization: "mdi:domain",
  ehscommandcenter: "mdi:view-dashboard-outline",
  kpi: "mdi:target",
  kpitarget: "mdi:target",
};

/** The icon for a permission category or module name. Never throws, never blank. */
export function getModuleIcon(name: string): string {
  const key = normalizeModuleKey(name);
  return (
    NAV_ICON_BY_KEY.get(key) ??
    EXTRA_MODULE_ICONS[key] ??
    (key.endsWith("s") ? NAV_ICON_BY_KEY.get(key.slice(0, -1)) : undefined) ??
    "mdi:key-outline"
  );
}

/**
 * The part of a permission label worth reading once its module is already the
 * heading: `Incident.Create` → `Create`, `button:report-hazard` → `Report
 * hazard`. Falls back to the whole label, so an unrecognised shape is shown
 * verbatim rather than mangled.
 */
export function shortPermissionLabel(label: string, moduleName = ""): string {
  const trimmed = label.trim();

  const buttonSlug = /^button:(.+)$/i.exec(trimmed)?.[1];
  if (buttonSlug) {
    const words = buttonSlug.replaceAll(/[-_]/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  const pageSlug = /^page:(.+)$/i.exec(trimmed)?.[1];
  if (pageSlug) {
    const words = pageSlug.replaceAll(/[-_]/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  // `Module.Action` — drop the module only when it really is this module's.
  const dot = trimmed.indexOf(".");
  if (dot > 0) {
    const head = trimmed.slice(0, dot);
    const tail = trimmed.slice(dot + 1);
    if (
      tail.trim() !== "" &&
      (moduleName === "" ||
        normalizeModuleKey(head) === normalizeModuleKey(moduleName))
    ) {
      return tail;
    }
  }

  return trimmed;
}

/**
 * Regroup a flat category into modules.
 *
 * Buttons arrive from the API in one bucket ("UI Buttons"), which as a single
 * card would be a wall of ~90 chips — the very thing the module-first layout
 * exists to avoid. `button:report-hazard` names its module in the slug, so the
 * longest sidebar slug appearing in it wins ("hazard"), and anything that
 * matches nothing lands in a final "Other" group rather than being dropped.
 */
export function regroupByModule(
  options: readonly PermissionOption[],
  fallbackGroup = "Other",
): { group: string; permissions: PermissionOption[] }[] {
  const slugs = EHSS_NAV_PREVIEW.flatMap((group) =>
    group.items.map((item) => ({
      slug: item.permission.replace(/^page:/, ""),
      label: item.label,
    })),
  ).toSorted((left, right) => right.slug.length - left.slug.length);

  const buckets = new Map<string, PermissionOption[]>();

  for (const option of options) {
    const haystack = option.label
      .trim()
      .toLowerCase()
      .replace(/^(button|page):/, "");
    const hit = slugs.find(
      (entry) =>
        haystack === entry.slug ||
        haystack.includes(`-${entry.slug}`) ||
        haystack.startsWith(`${entry.slug}-`),
    );

    const key = hit?.label ?? fallbackGroup;
    buckets.set(key, [...(buckets.get(key) ?? []), option]);
  }

  return [...buckets.entries()]
    .toSorted(([left], [right]) => {
      // "Other" is a remainder, so it sits last however it sorts.
      if (left === fallbackGroup) return 1;
      if (right === fallbackGroup) return -1;
      return left.localeCompare(right);
    })
    .map(([group, permissions]) => ({ group, permissions }));
}
