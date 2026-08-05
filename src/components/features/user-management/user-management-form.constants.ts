export const USER_ROLE_OPTIONS = [
  { value: "hse-manager", label: "HSE Manager" },
  { value: "safety-officer", label: "Safety Officer" },
  { value: "system-admin", label: "System Admin" },
  { value: "employee", label: "Employee" },
  { value: "supervisor", label: "Supervisor" },
  { value: "auditor", label: "Auditor" },
  { value: "read-only", label: "Read-Only" },
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
    employee: [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: false },
      { label: "Approve Documents", granted: false },
      { label: "System Configuration", granted: false },
    ],
    "hse-manager": [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: true },
      { label: "Approve Documents", granted: true },
      { label: "System Configuration", granted: false },
    ],
    "system-admin": [
      { label: "View Safety Records", granted: true },
      { label: "Submit Incident Reports", granted: true },
      { label: "Manage LOTO", granted: true },
      { label: "Approve Documents", granted: true },
      { label: "System Configuration", granted: true },
    ],
  };

export const ADDITIONAL_PERMISSION_GROUPS = [
  {
    label: "Safety",
    permissions: ["View Records", "Manage LOTO"],
  },
  {
    label: "Facility",
    permissions: ["Upload Documents", "Approve Documents"],
  },
  {
    label: "Communications",
    permissions: ["Manage Users", "Access Configuration"],
  },
  {
    label: "Operations",
    permissions: ["View Records", "Manage LOTO"],
  },
  {
    label: "Admin",
    permissions: ["Manage Users", "Access Configuration"],
  },
] as const;

export function getRolePermissionPreview(
  roleValue: string,
): RolePermissionPreview[] {
  return (
    ROLE_PERMISSION_PREVIEWS[roleValue] ??
    ROLE_PERMISSION_PREVIEWS.employee ??
    []
  );
}

export function getRoleLabel(roleValue: string): string {
  return (
    USER_ROLE_OPTIONS.find((option) => option.value === roleValue)?.label ??
    "Employee"
  );
}
