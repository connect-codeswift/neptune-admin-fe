export type ClientModule = {
  id: string;
  label: string;
  active: boolean;
};

export type ClientSite = {
  id: string;
  name: string;
  type: string;
  address: string;
  timezone: string;
  departmentCount: number;
  status: "active" | "pending";
};

export type ClientTrialHistoryItem = {
  id: string;
  action: string;
  date: string;
  duration: string;
  planType: string;
  initiatedBy: string;
  status: "active" | "completed" | "expired";
};

export type ClientAccountDetail = {
  id: string;
  name: string;
  code: string;
  industry: string;
  assignedCsm: string;
  legalName: string;
  contractStart: string;
  website: string;
  employeeCount: number;
  siteCount: number;
  complianceZone: string;
  modules: ClientModule[];
  sites: ClientSite[];
  primaryContact: {
    name: string;
    title: string;
    initials: string;
    email: string;
    phone: string;
  };
  contract: {
    planType: string;
    period: string;
    licenseSeats: string;
    assignedCsm: string;
    monthlyValue: string;
  };
  employeeData: {
    fileName: string;
    status: "Uploaded" | "Updated";
    lastUpdated: string;
  };
  subscription: {
    statusLabel: string;
    planType: string;
    trialStartDate: string;
    trialEndDate: string;
    daysRemaining: number;
    billingContact: string;
    history: ClientTrialHistoryItem[];
  };
};

export const CLIENT_ACCOUNT_DETAILS: Record<string, ClientAccountDetail> = {
  "1": {
    id: "1",
    name: "Meridian Chemical Co.",
    code: "CL-001",
    industry: "Chemical Manufacturing",
    assignedCsm: "Rachel Torres",
    legalName: "Meridian Chemical Co.",
    contractStart: "2026-03-01",
    website: "www.neptune.meridianchemical.com",
    employeeCount: 450,
    siteCount: 3,
    complianceZone: "OSHA Standard Zone A",
    modules: [
      { id: "incident-reporting", label: "Incident Reporting", active: true },
      { id: "hazard-management", label: "Hazard Management", active: true },
      { id: "capa", label: "CAPA", active: true },
      { id: "safety-observations", label: "Safety Observations", active: true },
      { id: "ppe-management", label: "PPE Management", active: true },
      { id: "document-control", label: "Document Control", active: false },
      { id: "training-management", label: "Training Management", active: false },
      { id: "work-permits", label: "Work Permits", active: false },
      { id: "loto", label: "LOTO", active: false },
      { id: "compliance-calendar", label: "Compliance Calendar", active: false },
      { id: "industrial-hygiene", label: "Industrial Hygiene", active: false },
      { id: "hazcom", label: "HazCom", active: false },
    ],
    sites: [
      {
        id: "s1",
        name: "Houston Main Plant",
        type: "Manufacturing",
        address: "100 Corporate Pkwy, Houston TX",
        timezone: "America/Chicago",
        departmentCount: 5,
        status: "active",
      },
      {
        id: "s2",
        name: "Baytown Distribution Hub",
        type: "Warehouse",
        address: "420 Industrial Blvd, Baytown TX",
        timezone: "America/Chicago",
        departmentCount: 2,
        status: "active",
      },
      {
        id: "s3",
        name: "Clear Lake R&D Lab",
        type: "Laboratory",
        address: "88 Research Dr, Clear Lake TX",
        timezone: "America/Chicago",
        departmentCount: 3,
        status: "pending",
      },
    ],
    primaryContact: {
      name: "Sarah Mitchell",
      title: "HSE Manager",
      initials: "SM",
      email: "sarah.mitchell@meridian.com",
      phone: "+1 (713) 555-0198",
    },
    contract: {
      planType: "Enterprise Tier",
      period: "Mar 2026 — Feb 2027",
      licenseSeats: "38 / 50 used",
      assignedCsm: "Rachel Torres",
      monthlyValue: "$3,750",
    },
    employeeData: {
      fileName: "employees_meridian_2026.xlsx",
      status: "Uploaded",
      lastUpdated: "2026-03-15",
    },
    subscription: {
      statusLabel: "Trial Active",
      planType: "Enterprise Trial",
      trialStartDate: "2026-03-01",
      trialEndDate: "2026-04-01",
      daysRemaining: 12,
      billingContact: "Sarah Mitchell",
      history: [
        {
          id: "h1",
          action: "Started",
          date: "2026-03-01",
          duration: "30 Days",
          planType: "Enterprise Trial",
          initiatedBy: "Rachel Torres",
          status: "completed",
        },
        {
          id: "h2",
          action: "Extended",
          date: "2026-03-20",
          duration: "12 Days",
          planType: "Enterprise Trial",
          initiatedBy: "Rachel Torres",
          status: "active",
        },
        {
          id: "h3",
          action: "Expired",
          date: "2025-12-15",
          duration: "14 Days",
          planType: "Standard Trial",
          initiatedBy: "James Okafor",
          status: "expired",
        },
      ],
    },
  },
};

export function getClientAccountDetail(id: string): ClientAccountDetail {
  return CLIENT_ACCOUNT_DETAILS[id] ?? CLIENT_ACCOUNT_DETAILS["1"]!;
}
