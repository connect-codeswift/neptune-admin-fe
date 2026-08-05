export type RolePreset = {
  id: string;
  name: string;
  rights: string[];
};

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "hse-manager",
    name: "HSE Manager",
    rights: [
      "View Dashboard",
      "Export Reports",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "Create Permits",
      "Approve Permits",
      "View Claims",
      "Submit Claims",
      "Manage Claims",
      "View Documents",
      "Upload Docs",
      "Approve Docs",
      "Manage Audits",
      "Manage Training",
      "View Regulations",
      "View Analytics",
      "Export Data",
      "Manage Actions",
    ],
  },
  {
    id: "safety-officer",
    name: "Safety Officer",
    rights: [
      "View Dashboard",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "View Documents",
      "Upload Docs",
      "Manage Audits",
      "View Claims",
      "Submit Claims",
      "View Analytics",
      "Export Data",
      "Manage Actions",
    ],
  },
  {
    id: "supervisor",
    name: "Supervisor",
    rights: [
      "View Dashboard",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "View Permits",
      "Approve Permits",
      "Manage LOTO",
      "View Documents",
      "View Analytics",
      "Manage Actions",
    ],
  },
  {
    id: "employee",
    name: "Employee",
    rights: [
      "View Dashboard",
      "View Incidents",
      "Create Incidents",
      "View Permits",
      "Submit Claims",
      "View Documents",
      "Export Reports",
    ],
  },
  {
    id: "auditor",
    name: "Auditor",
    rights: [
      "View Dashboard",
      "Export Reports",
      "View Incidents",
      "View Documents",
      "View Permits",
      "View Claims",
      "Manage Audits",
      "View Regulations",
      "View Analytics",
      "Export Data",
      "Manage Actions",
    ],
  },
  {
    id: "read-only",
    name: "Read-Only",
    rights: ["View Dashboard", "View Incidents", "View Documents"],
  },
];

export const DEFAULT_PRESET_ID = "hse-manager";

export function getRolePreset(id: string): RolePreset | undefined {
  return ROLE_PRESETS.find((preset) => preset.id === id);
}

export function getPresetRights(id: string): string[] {
  return getRolePreset(id)?.rights ?? [];
}

export function getPresetRightCount(id: string): number {
  return getPresetRights(id).length;
}
