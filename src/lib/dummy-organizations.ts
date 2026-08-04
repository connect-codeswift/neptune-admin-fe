export type DummyOrganizationModule = {
  id: string;
  label: string;
  active: boolean;
};

export type DummyOrganizationSite = {
  id: string;
  name: string;
  type: string;
  address: string;
  timezone: string;
  departmentCount: number;
  status: "active" | "pending";
};

export type DummyOrganization = {
  id: string;
  name: string;
  code: string;
  industry: string;
  assignedCsm: string;
  contractStart: string;
  status: "active" | "inactive";
  siteCount: number;
  legalName: string;
  website: string;
  employeeCount: number;
  complianceZone: string;
  modules: DummyOrganizationModule[];
  sites: DummyOrganizationSite[];
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
    seats: {
      used: number;
      total: number;
    };
    history: {
      id: string;
      action: string;
      date: string;
      duration: string;
      planType: string;
      initiatedBy: string;
      status: "active" | "completed" | "expired";
    }[];
  };
};

export const DUMMY_ORGANIZATIONS: DummyOrganization[] = [
  {
    id: "1",
    name: "Meridian Chemical Co.",
    code: "CL-001",
    industry: "Chemical Manufacturing",
    assignedCsm: "Rachel Torres",
    contractStart: "2026-03-01",
    status: "active",
    siteCount: 3,
    legalName: "Meridian Chemical Co.",
    website: "www.neptune.meridianchemical.com",
    employeeCount: 450,
    complianceZone: "OSHA Standard Zone A",
    modules: [
      { id: "incident-reporting", label: "Incident Reporting", active: true },
      { id: "hazard-management", label: "Hazard Management", active: true },
      { id: "capa", label: "CAPA", active: true },
      { id: "safety-observations", label: "Safety Observations", active: true },
      { id: "ppe-management", label: "PPE Management", active: true },
      { id: "document-control", label: "Document Control", active: false },
    ],
    sites: [
      {
        id: "1",
        name: "Houston Main Plant",
        type: "Manufacturing",
        address: "100 Corporate Pkwy, Houston TX",
        timezone: "America/Chicago",
        departmentCount: 5,
        status: "active",
      },
      {
        id: "2",
        name: "Baytown Distribution Hub",
        type: "Warehouse",
        address: "420 Industrial Blvd, Baytown TX",
        timezone: "America/Chicago",
        departmentCount: 2,
        status: "active",
      },
      {
        id: "3",
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
      licenseSeats: "50 / 50 used",
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
      seats: { used: 50, total: 50 },
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
      ],
    },
  },
  {
    id: "2",
    name: "1X Technologies",
    code: "CL-002",
    industry: "Oil & Gas",
    assignedCsm: "James Okafor",
    contractStart: "2025-11-15",
    status: "active",
    siteCount: 7,
    legalName: "1X Technologies Inc.",
    website: "www.1xtechnologies.com",
    employeeCount: 820,
    complianceZone: "OSHA Standard Zone B",
    modules: [
      { id: "incident-reporting", label: "Incident Reporting", active: true },
      { id: "hazard-management", label: "Hazard Management", active: true },
      { id: "work-permits", label: "Work Permits", active: true },
      { id: "loto", label: "LOTO", active: true },
      { id: "training-management", label: "Training Management", active: false },
    ],
    sites: [
      {
        id: "1",
        name: "Midland Operations Center",
        type: "Operations",
        address: "500 Permian Basin Rd, Midland TX",
        timezone: "America/Chicago",
        departmentCount: 8,
        status: "active",
      },
      {
        id: "2",
        name: "Corpus Christi Terminal",
        type: "Terminal",
        address: "1200 Harbor Way, Corpus Christi TX",
        timezone: "America/Chicago",
        departmentCount: 4,
        status: "active",
      },
    ],
    primaryContact: {
      name: "David Chen",
      title: "Director of HSE",
      initials: "DC",
      email: "david.chen@1xtech.com",
      phone: "+1 (432) 555-0142",
    },
    contract: {
      planType: "Enterprise Tier",
      period: "Nov 2025 — Oct 2026",
      licenseSeats: "62 / 80 used",
      assignedCsm: "James Okafor",
      monthlyValue: "$5,200",
    },
    employeeData: {
      fileName: "employees_1x_2026.xlsx",
      status: "Updated",
      lastUpdated: "2026-02-28",
    },
    subscription: {
      statusLabel: "Active",
      planType: "Enterprise",
      trialStartDate: "2025-11-15",
      trialEndDate: "2025-12-15",
      daysRemaining: 0,
      billingContact: "David Chen",
      seats: { used: 62, total: 80 },
      history: [
        {
          id: "h1",
          action: "Started",
          date: "2025-11-15",
          duration: "30 Days",
          planType: "Enterprise Trial",
          initiatedBy: "James Okafor",
          status: "completed",
        },
        {
          id: "h2",
          action: "Converted",
          date: "2025-12-15",
          duration: "—",
          planType: "Enterprise",
          initiatedBy: "James Okafor",
          status: "active",
        },
      ],
    },
  },
  {
    id: "3",
    name: "Harrington Logistics",
    code: "CL-003",
    industry: "Transportation & Warehousing",
    assignedCsm: "Rachel Torres",
    contractStart: "2026-05-20",
    status: "inactive",
    siteCount: 2,
    legalName: "Harrington Logistics LLC",
    website: "www.harringtonlogistics.com",
    employeeCount: 210,
    complianceZone: "OSHA Standard Zone A",
    modules: [
      { id: "incident-reporting", label: "Incident Reporting", active: true },
      { id: "document-control", label: "Document Control", active: false },
      { id: "compliance-calendar", label: "Compliance Calendar", active: false },
    ],
    sites: [
      {
        id: "1",
        name: "Dallas Fulfillment Center",
        type: "Warehouse",
        address: "800 Logistics Ln, Dallas TX",
        timezone: "America/Chicago",
        departmentCount: 3,
        status: "active",
      },
      {
        id: "2",
        name: "Fort Worth Cross-Dock",
        type: "Distribution",
        address: "45 Freight Ave, Fort Worth TX",
        timezone: "America/Chicago",
        departmentCount: 2,
        status: "pending",
      },
    ],
    primaryContact: {
      name: "Maria Lopez",
      title: "Safety Coordinator",
      initials: "ML",
      email: "maria.lopez@harringtonlogistics.com",
      phone: "+1 (214) 555-0177",
    },
    contract: {
      planType: "Standard Tier",
      period: "May 2026 — Apr 2027",
      licenseSeats: "25 / 25 used",
      assignedCsm: "Rachel Torres",
      monthlyValue: "$1,890",
    },
    employeeData: {
      fileName: "employees_harrington_2026.xlsx",
      status: "Uploaded",
      lastUpdated: "2026-05-18",
    },
    subscription: {
      statusLabel: "Expired",
      planType: "Standard Trial",
      trialStartDate: "2026-01-10",
      trialEndDate: "2026-02-10",
      daysRemaining: 0,
      billingContact: "Maria Lopez",
      seats: { used: 25, total: 25 },
      history: [
        {
          id: "h1",
          action: "Started",
          date: "2026-01-10",
          duration: "14 Days",
          planType: "Standard Trial",
          initiatedBy: "Rachel Torres",
          status: "expired",
        },
      ],
    },
  },
];

export function getDummyOrganization(id: string): DummyOrganization | undefined {
  return DUMMY_ORGANIZATIONS.find((org) => org.id === id);
}
