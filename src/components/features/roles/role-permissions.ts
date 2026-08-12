import type { ToggleBadgeOption } from "@/components/inputs";

/**
 * One row from GET /SuperAdminRoles/permissions.
 *
 * The catalogue no longer contains the `page:*` / `button:*` flags — the backend excludes
 * the "UI Pages" and "UI Buttons" categories, because every role holds all of them and they
 * gate nothing. What arrives here is the ~78 permissions that decide real access.
 */
export type PermissionDto = {
  id: number;
  displayName: string;
  categoryId: number;
  categoryName: string;
};

export type RoleWithPermissionsDto = {
  id: number;
  roleName: string;
  description: string | null;
  isSystem: boolean;
  usersAssigned: number;
  permissions: PermissionDto[];
};

/**
 * A module the sidebar can show. Visibility is `{Module}.View` — there is no separate
 * page-visibility concept, so granting the read is what puts the module in the nav.
 *
 * Matched on exactly one dot so `CAPA.Dashboard.View` and `AdminPortal.Roles.View` stay out:
 * the first is a widget inside a module, the second is the admin portal itself.
 */
const MODULE_VIEW = /^([A-Za-z]+)\.View$/;

/** Display names, because `HazCom.View` is not what anyone calls it. */
const MODULE_LABELS: Record<string, string> = {
  Incident: "Incidents",
  Hazard: "Hazards",
  NearMiss: "Near Misses",
  CAPA: "CAPA",
  Rca: "Root Cause Analysis",
  Audit: "Audits",
  AuditTemplate: "Audit Templates",
  Inspection: "Inspections",
  InspectionTemplate: "Inspection Templates",
  Document: "Documents",
  Compliance: "Regulatory Compliance",
  Loto: "Lockout / Tagout",
  PPE: "PPE",
  HazCom: "HazCom",
  Bbs: "Behaviour Based Safety",
  WalkTalk: "Walk & Talk",
  CommandCenter: "EHS Command Center",
  KpiTarget: "KPI Targets",
  Notification: "Notifications",
};

export function isModuleView(p: PermissionDto): boolean {
  if (p.displayName.startsWith("AdminPortal.")) {
    return false;
  }
  return MODULE_VIEW.test(p.displayName);
}

/** The "what can this role see" options, one per module, ordered by label. */
export function moduleOptions(all: PermissionDto[]): ToggleBadgeOption[] {
  return all
    .filter(isModuleView)
    .map((p) => {
      const key = MODULE_VIEW.exec(p.displayName)?.[1] ?? p.displayName;
      return { value: String(p.id), label: MODULE_LABELS[key] ?? key };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * The "what can this role do" options, grouped by category.
 *
 * Excludes the module `.View` rows the section above owns, so a permission is never
 * presented twice with two checkboxes that must agree.
 */
export function actionOptionsByCategory(
  all: PermissionDto[],
): { category: string; options: ToggleBadgeOption[] }[] {
  const groups = new Map<string, ToggleBadgeOption[]>();

  for (const p of all) {
    if (isModuleView(p)) {
      continue;
    }
    const options = groups.get(p.categoryName) ?? [];
    // "Incident.Create" reads as "Create" once it sits under an Incident heading.
    options.push({
      value: String(p.id),
      label: p.displayName.replace(/^[A-Za-z]+\./, ""),
    });
    groups.set(p.categoryName, options);
  }

  return [...groups.entries()]
    .map(([category, options]) => ({
      category,
      options: options.sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Turning a module off takes its actions with it.
 *
 * Leaving `Incident.Create` granted while `Incident.View` is not produces a role that can
 * file an incident it cannot then open — the API allows it and the module is absent from the
 * nav. Cheaper to make that unrepresentable here than to explain it later.
 */
export function pruneOrphanedActions(
  selected: string[],
  all: PermissionDto[],
): string[] {
  const byId = new Map(all.map((p) => [String(p.id), p]));
  const visibleModules = new Set(
    selected
      .map((id) => byId.get(id))
      .filter((p): p is PermissionDto => Boolean(p && isModuleView(p)))
      .map((p) => MODULE_VIEW.exec(p.displayName)?.[1]),
  );

  return selected.filter((id) => {
    const p = byId.get(id);
    if (!p || isModuleView(p)) {
      return true;
    }
    const owner = /^([A-Za-z]+)\./.exec(p.displayName)?.[1];
    // Anything outside the module vocabulary (AdminPortal.*, Finding.Update) is left alone.
    if (!owner || !MODULE_LABELS[owner]) {
      return true;
    }
    return visibleModules.has(owner);
  });
}
