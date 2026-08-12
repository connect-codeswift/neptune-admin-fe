export const USER_ROLE_OPTIONS = [
  { value: "ehs-director", label: "EHS Director" },
  { value: "ehs-lead", label: "EHS Lead" },
  { value: "ehs-manager", label: "EHS Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "worker", label: "Worker" },
];

export const USER_DEPARTMENT_OPTIONS = [
  { value: "safety", label: "Safety" },
  { value: "it", label: "IT" },
  { value: "operations", label: "Operations" },
  { value: "compliance", label: "Compliance" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "management", label: "Management" },
];

export const USER_SITE_OPTIONS = [
  { value: "hq", label: "HQ - Main Facility" },
  { value: "plant-b", label: "Plant B" },
  { value: "warehouse-a", label: "Warehouse A" },
  { value: "medical-center", label: "Medical Center" },
];

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export type RolePermissionPreview = {
  label: string;
  granted: boolean;
};

export const ROLE_PERMISSION_PREVIEWS: Record<string, RolePermissionPreview[]> =
  {
    "ehs-director": [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: true },
      { label: "Approve Documents", granted: true },
      { label: "System Configuration", granted: true },
    ],
    "ehs-lead": [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: true },
      { label: "Approve Documents", granted: true },
      { label: "System Configuration", granted: false },
    ],
    "ehs-manager": [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: true },
      { label: "Approve Documents", granted: true },
      { label: "System Configuration", granted: false },
    ],
    supervisor: [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: false },
      { label: "Approve Documents", granted: false },
      { label: "System Configuration", granted: false },
    ],
    worker: [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: false },
      { label: "Manage LOTO", granted: false },
      { label: "Approve Documents", granted: false },
      { label: "System Configuration", granted: false },
    ],
  };

export const ADDITIONAL_PERMISSION_GROUPS = [
  {
    label: "Safety",
    permissions: ["Safety.Incident.View", "Safety.LOTO.Manage"],
  },
  {
    label: "Facility",
    permissions: ["Compliance.Document.Upload", "Compliance.Document.Approve"],
  },
  {
    label: "Communications",
    permissions: ["System.Users.Manage", "System.Settings.Manage"],
  },
  {
    label: "Operations",
    permissions: ["Safety.Incident.View", "Safety.LOTO.Manage"],
  },
  {
    label: "Admin",
    permissions: ["System.Users.Manage", "System.Settings.Manage"],
  },
] as const;

export function getRolePermissionPreview(
  roleValue: string,
): RolePermissionPreview[] {
  return (
    ROLE_PERMISSION_PREVIEWS[roleValue] ??
    ROLE_PERMISSION_PREVIEWS.worker ??
    []
  );
}

export function getRoleLabel(roleValue: string): string {
  return (
    USER_ROLE_OPTIONS.find((option) => option.value === roleValue)?.label ??
    "Worker"
  );
}
