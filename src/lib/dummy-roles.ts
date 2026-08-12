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

const EHS_DIRECTOR_RIGHTS: string[] = [
  "Dashboard.View",
  "Dashboard.Export",
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
  "Health.Claim.View",
  "Health.Claim.Submit",
  "Health.Claim.Manage",
  "Health.MedicalRecords.View",
  "Health.SDS.View",
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
  "Analytics.View",
  "Analytics.Export",
  "Analytics.Action.Manage",
  "System.Users.Manage",
  "System.Roles.Manage",
  "System.Settings.Manage",
  "System.AuditLog.View",
  "System.Regulations.Manage",
  "System.Categories.Manage",
];

const EHS_LEAD_RIGHTS: string[] = [
  "Dashboard.View",
  "Dashboard.Export",
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
  "Health.Claim.View",
  "Health.Claim.Submit",
  "Health.Claim.Manage",
  "Health.MedicalRecords.View",
  "Health.SDS.View",
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
  "Analytics.View",
  "Analytics.Export",
  "Analytics.Action.Manage",
];

const EHS_MANAGER_RIGHTS: string[] = [
  "Dashboard.View",
  "Dashboard.Export",
  "Safety.Incident.View",
  "Safety.Incident.Create",
  "Safety.Incident.Update",
  "Safety.LOTO.Manage",
  "PPE.Create",
  "PPE.Issue",
  "Safety.Permit.View",
  "Safety.Permit.Create",
  "Safety.Permit.Approve",
  "Safety.Observation.Create",
  "Safety.Inspection.Complete",
  "Safety.Hazard.Report",
  "Health.Claim.View",
  "Health.Claim.Submit",
  "Health.Claim.Manage",
  "Health.SDS.View",
  "Compliance.Document.View",
  "Compliance.Document.Upload",
  "Compliance.Document.Approve",
  "Compliance.Audit.Manage",
  "Compliance.Training.Manage",
  "Compliance.Regulation.View",
  "Compliance.Create",
  "Compliance.View",
  "Compliance.Update",
  "Analytics.View",
  "Analytics.Export",
  "Analytics.Action.Manage",
];

const SUPERVISOR_RIGHTS: string[] = [
  "Dashboard.View",
  "Safety.Incident.View",
  "Safety.Incident.Create",
  "Safety.Incident.Update",
  "Safety.LOTO.Manage",
  "PPE.Issue",
  "PPE.Request",
  "Safety.Permit.View",
  "Safety.Permit.Approve",
  "Safety.Observation.Create",
  "Safety.Inspection.Complete",
  "Safety.Hazard.Report",
  "Health.Claim.View",
  "Health.Claim.Submit",
  "Health.SDS.View",
  "Compliance.Document.View",
  "Compliance.Create",
  "Compliance.Update",
  "Compliance.Regulation.View",
  "Analytics.View",
];

const WORKER_RIGHTS: string[] = [
  "Dashboard.View",
  "Safety.Observation.Create",
  "Safety.Inspection.Complete",
  "Safety.Hazard.Report",
  "Health.SDS.View",
  "Compliance.Document.View",
  "PPE.Request",
];

export const DUMMY_ROLES: DummyRole[] = [
  {
    id: "ehs-director",
    name: "EHS Director",
    description:
      "Full organization access including the admin portal, user management, and system configuration.",
    isSystem: true,
    userCount: 2,
    rights: EHS_DIRECTOR_RIGHTS,
  },
  {
    id: "ehs-lead",
    name: "EHS Lead",
    description:
      "Site authority with full operational access for the assigned site; cannot manage company-wide roles or users.",
    userCount: 8,
    createdAt: "Jan 10, 2023",
    lastModifiedAt: "Apr 22, 2024",
    rights: EHS_LEAD_RIGHTS,
  },
  {
    id: "ehs-manager",
    name: "EHS Manager",
    description:
      "Manages EHS operations, templates, incident closure, and compliance records without administrative privileges.",
    userCount: 24,
    createdAt: "Feb 14, 2023",
    lastModifiedAt: "May 18, 2024",
    rights: EHS_MANAGER_RIGHTS,
  },
  {
    id: "supervisor",
    name: "Supervisor",
    description:
      "Team lead with oversight of crew safety, permits, lockouts, and CAPA/RCA updates.",
    userCount: 45,
    createdAt: "Mar 03, 2023",
    lastModifiedAt: "Jun 10, 2024",
    rights: SUPERVISOR_RIGHTS,
  },
  {
    id: "worker",
    name: "Worker",
    description:
      "Workforce access for observations, hazard reporting, inspections, and PPE replacement requests.",
    userCount: 156,
    createdAt: "Apr 20, 2023",
    lastModifiedAt: "Jul 08, 2024",
    rights: WORKER_RIGHTS,
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
