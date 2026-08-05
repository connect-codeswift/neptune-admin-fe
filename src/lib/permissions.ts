export type RightsGroup = {
  group: string;
  rights: string[];
};

export const RIGHTS_GROUPS: RightsGroup[] = [
  {
    group: "Dashboard",
    rights: ["View Dashboard", "Export Reports"],
  },
  {
    group: "Safety",
    rights: [
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Delete Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "Create Permits",
      "Approve Permits",
    ],
  },
  {
    group: "Health",
    rights: [
      "View Claims",
      "Submit Claims",
      "Manage Claims",
      "View Medical Records",
    ],
  },
  {
    group: "Compliance",
    rights: [
      "View Documents",
      "Upload Docs",
      "Approve Docs",
      "Manage Audits",
      "Manage Training",
      "View Regulations",
    ],
  },
  {
    group: "Analytics",
    rights: ["View Analytics", "Export Data", "Manage Actions"],
  },
  {
    group: "System",
    rights: [
      "Manage Users",
      "Manage Roles",
      "System Settings",
      "Audit Log",
      "Manage Regulations",
      "Manage Categories",
    ],
  },
];

/** Rights that cannot be toggled on custom roles. */
export const LOCKED_RIGHTS = new Set<string>([
  "Delete Incidents",
  "View Medical Records",
  "Manage Users",
  "Manage Roles",
  "System Settings",
  "Audit Log",
  "Manage Regulations",
  "Manage Categories",
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
