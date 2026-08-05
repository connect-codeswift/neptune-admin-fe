export type DummyRole = {
  id: string;
  name: string;
  description: string;
  rights: string[];
  userCount: number;
  isSystem?: boolean;
  createdAt?: string;
  lastModifiedAt?: string;
};

export const DUMMY_ROLES: DummyRole[] = [
  {
    id: "system-admin",
    name: "System Admin",
    description: "Full system access with all administrative capabilities",
    isSystem: true,
    userCount: 2,
    rights: [
      "View Dashboard",
      "Export Reports",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Delete Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "Submit Claims",
      "Manage Users",
      "Manage Roles",
      "System Configuration",
      "Audit Logs",
      "Document Control",
      "Approve Documents",
      "Manage Regulations",
      "Manage Templates",
      "View Analytics",
      "Export Data",
      "Manage Sites",
      "Manage Departments",
      "Billing Access",
      "API Access",
      "Integration Settings",
      "Notification Settings",
      "Security Settings",
      "Backup & Restore",
      "Custom Fields",
      "Workflow Automation",
    ],
  },
  {
    id: "hse-manager",
    name: "HSE Manager",
    description:
      "Full EHS operations management, document approval, and reporting",
    userCount: 8,
    createdAt: "Jan 10, 2023",
    lastModifiedAt: "Apr 22, 2024",
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
    description: "Manages day-to-day safety operations and field inspections",
    userCount: 24,
    rights: [
      "View Dashboard",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "Submit Observations",
      "Manage Hazards",
      "View Documents",
      "Upload Documents",
      "Conduct Inspections",
      "Assign Actions",
      "View Training Records",
      "Manage Field Audits",
    ],
  },
  {
    id: "supervisor",
    name: "Supervisor",
    description: "Team lead with oversight of crew safety and work permits",
    userCount: 45,
    rights: [
      "View Dashboard",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "View Permits",
      "Approve Permits",
      "Manage LOTO",
      "View PPE Assignments",
      "Submit Observations",
      "View Team Records",
      "Assign Tasks",
      "View Action Plans",
    ],
  },
  {
    id: "employee",
    name: "Employee",
    description: "Standard workforce access for reporting and daily tasks",
    userCount: 156,
    rights: [
      "View Dashboard",
      "Export Reports",
      "View Incidents",
      "Create Incidents",
      "Edit Incidents",
      "Delete Incidents",
      "Manage LOTO",
      "Manage PPE",
      "View Permits",
      "Submit Claims",
      "Submit Observations",
      "View Documents",
      "Complete Training",
      "View Action Items",
    ],
  },
  {
    id: "auditor",
    name: "Auditor",
    description: "Read-heavy access for compliance reviews and audit trails",
    userCount: 6,
    rights: [
      "View Dashboard",
      "Export Reports",
      "View Incidents",
      "View Documents",
      "View Audit Trail",
      "View Permits",
      "View LOTO Records",
      "View PPE Records",
      "Export Audit Data",
      "View Compliance Calendar",
      "View Analytics",
    ],
  },
  {
    id: "read-only",
    name: "Read-Only",
    description: "View-only access with no create or edit capabilities",
    userCount: 6,
    rights: [
      "View Dashboard",
      "View Incidents",
      "View Documents",
      "View Permits",
      "View PPE Records",
      "View LOTO Records",
      "View Reports",
    ],
  },
];

export const VISIBLE_RIGHTS_COUNT = 6;

export function getRoleStats(roles: DummyRole[] = DUMMY_ROLES) {
  const totalRoles = roles.length;
  const totalUsersAssigned = roles.reduce((sum, role) => sum + role.userCount, 0);
  const customRoles = roles.filter((role) => !role.isSystem).length;

  return { totalRoles, totalUsersAssigned, customRoles };
}

export function getDummyRole(id: string): DummyRole | undefined {
  return DUMMY_ROLES.find((role) => role.id === id);
}

export function getRoleTypeLabel(role: DummyRole): string {
  return role.isSystem ? "System" : "Custom";
}
