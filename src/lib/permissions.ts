export type RightsGroup = {
  group: string;
  rights: string[];
};

export const RIGHTS_GROUPS: RightsGroup[] = [
  {
    group: "Dashboard",
    rights: ["Dashboard.View", "Dashboard.Export"],
  },
  {
    group: "Safety",
    rights: [
      "Safety.Incident.View",
      "Safety.Incident.Create",
      "Safety.Incident.Update",
      "Safety.Incident.Delete",
      "Safety.LOTO.Manage",
      "PPE.Create",
      "PPE.Issue",
      "PPE.Request",
      "Safety.Permit.View",
      "Safety.Permit.Create",
      "Safety.Permit.Approve",
      "Safety.Observation.Create",
      "Safety.Inspection.Complete",
      "Safety.Hazard.Report",
    ],
  },
  {
    group: "Health",
    rights: [
      "Health.Claim.View",
      "Health.Claim.Submit",
      "Health.Claim.Manage",
      "Health.MedicalRecords.View",
      "Health.SDS.View",
    ],
  },
  {
    group: "Compliance",
    rights: [
      "Compliance.Document.View",
      "Compliance.Document.Upload",
      "Compliance.Document.Approve",
      "Compliance.Audit.Manage",
      "Compliance.Training.Manage",
      "Compliance.Regulation.View",
      "Compliance.Create",
      "Compliance.View",
      "Compliance.Update",
      "Compliance.Delete",
    ],
  },
  {
    group: "Analytics",
    rights: [
      "Analytics.View",
      "Analytics.Export",
      "Analytics.Action.Manage",
    ],
  },
  {
    group: "System",
    rights: [
      "System.Users.Manage",
      "System.Roles.Manage",
      "System.Settings.Manage",
      "System.AuditLog.View",
      "System.Regulations.Manage",
      "System.Categories.Manage",
    ],
  },
];

/** Rights that cannot be toggled on custom roles (director-only / system-only). */
export const LOCKED_RIGHTS = new Set<string>([
  "Safety.Incident.Delete",
  "Health.MedicalRecords.View",
  "System.Users.Manage",
  "System.Roles.Manage",
  "System.Settings.Manage",
  "System.AuditLog.View",
  "System.Regulations.Manage",
  "System.Categories.Manage",
]);

export function getAllRights(): string[] {
  return RIGHTS_GROUPS.flatMap((entry) => entry.rights);
}

export function getRightsGroupForRight(right: string): string | undefined {
  for (const entry of RIGHTS_GROUPS) {
    if (entry.rights.includes(right)) return entry.group;
  }
  return undefined;
}

export function isLockedRight(right: string): boolean {
  return LOCKED_RIGHTS.has(right);
}

export function countSelectedByGroup(
  selected: string[],
): { group: string; count: number }[] {
  const selectedSet = new Set(selected);

  return RIGHTS_GROUPS.filter((entry) => entry.group !== "System").map(
    (entry) => ({
      group: entry.group,
      count: entry.rights.filter((right) => selectedSet.has(right)).length,
    }),
  );
}

export function getSelectableRights(): string[] {
  return getAllRights().filter((right) => !isLockedRight(right));
}
