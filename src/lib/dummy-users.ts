import type { TableStatus } from "@/components/ui";

export type DummyUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  department: string;
  site: string;
  status: TableStatus;
  lastLogin: string;
};

export const DUMMY_USERS: DummyUser[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@meridian.com",
    initials: "SM",
    role: "HSE Manager",
    department: "Safety",
    site: "HQ - Main Facility",
    status: "active",
    lastLogin: "Today, 9:12 AM",
  },
  {
    id: "2",
    name: "David Chen",
    email: "david.chen@meridian.com",
    initials: "DC",
    role: "Safety Officer",
    department: "Safety",
    site: "Plant B",
    status: "active",
    lastLogin: "Yesterday, 4:30 PM",
  },
  {
    id: "3",
    name: "Maria Lopez",
    email: "maria.lopez@meridian.com",
    initials: "ML",
    role: "System Admin",
    department: "IT",
    site: "HQ - Main Facility",
    status: "active",
    lastLogin: "Today, 8:45 AM",
  },
  {
    id: "4",
    name: "James Okonkwo",
    email: "james.okonkwo@meridian.com",
    initials: "JO",
    role: "Employee",
    department: "Operations",
    site: "Warehouse A",
    status: "pending",
    lastLogin: "Never",
  },
  {
    id: "5",
    name: "Tom Richards",
    email: "tom.richards@meridian.com",
    initials: "TR",
    role: "Supervisor",
    department: "Operations",
    site: "Plant B",
    status: "inactive",
    lastLogin: "3 days ago",
  },
  {
    id: "6",
    name: "Priya Sharma",
    email: "priya.sharma@meridian.com",
    initials: "PS",
    role: "Auditor",
    department: "Compliance",
    site: "HQ - Main Facility",
    status: "active",
    lastLogin: "Today, 7:20 AM",
  },
  {
    id: "7",
    name: "Carlos Rivera",
    email: "carlos.rivera@meridian.com",
    initials: "CR",
    role: "Safety Officer",
    department: "Health",
    site: "Medical Center",
    status: "active",
    lastLogin: "Yesterday, 2:15 PM",
  },
  {
    id: "8",
    name: "Lisa Wang",
    email: "lisa.wang@meridian.com",
    initials: "LW",
    role: "Employee",
    department: "Environment",
    site: "Plant B",
    status: "suspended",
    lastLogin: "1 week ago",
  },
  {
    id: "9",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@meridian.com",
    initials: "AH",
    role: "HSE Manager",
    department: "Environment",
    site: "Warehouse A",
    status: "active",
    lastLogin: "Today, 10:05 AM",
  },
  {
    id: "10",
    name: "Emily Davis",
    email: "emily.davis@meridian.com",
    initials: "ED",
    role: "Read-Only",
    department: "Management",
    site: "HQ - Main Facility",
    status: "active",
    lastLogin: "2 days ago",
  },
];

export function getUserStats(users: DummyUser[]) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    pendingSetup: users.filter((user) => user.status === "pending").length,
    suspended: users.filter((user) => user.status === "suspended").length,
  };
}

export function getDummyUser(id: string): DummyUser | undefined {
  return DUMMY_USERS.find((user) => user.id === id);
}

export type UserActivityItem = {
  id: string;
  label: string;
  time: string;
  tone: "green" | "red" | "blue" | "gray";
};

export type UserPermission = {
  label: string;
  active: boolean;
};

export type UserPermissionGroup = {
  label: string;
  permissions: UserPermission[];
};

export type UserDetailProfile = {
  activityStats: {
    incidentsFiled: number;
    actionsAssigned: number;
    docsApproved: number;
  };
  activityLog: UserActivityItem[];
  permissionGroups: UserPermissionGroup[];
};

const DEFAULT_USER_DETAIL: UserDetailProfile = {
  activityStats: {
    incidentsFiled: 12,
    actionsAssigned: 4,
    docsApproved: 18,
  },
  activityLog: [
    {
      id: "a1",
      label: "Logged in",
      time: "Today, 9:12 AM",
      tone: "green",
    },
    {
      id: "a2",
      label: "Updated profile settings",
      time: "Yesterday, 3:40 PM",
      tone: "blue",
    },
  ],
  permissionGroups: [
    {
      label: "Safety",
      permissions: [
        { label: "View", active: true },
        { label: "Create", active: true },
      ],
    },
    {
      label: "Compliance",
      permissions: [{ label: "View", active: true }],
    },
  ],
};

const SARAH_MITCHELL_DETAIL: UserDetailProfile = {
  activityStats: {
    incidentsFiled: 23,
    actionsAssigned: 8,
    docsApproved: 41,
  },
  activityLog: [
    {
      id: "a1",
      label: "Logged in",
      time: "Today, 9:12 AM",
      tone: "green",
    },
    {
      id: "a2",
      label: "Submitted Incident Report #IR-2024-0892",
      time: "Yesterday, 4:30 PM",
      tone: "red",
    },
    {
      id: "a3",
      label: "Approved CAPA action plan",
      time: "Yesterday, 2:15 PM",
      tone: "blue",
    },
    {
      id: "a4",
      label: "Updated safety checklist template",
      time: "2 days ago",
      tone: "gray",
    },
    {
      id: "a5",
      label: "Completed monthly safety audit",
      time: "3 days ago",
      tone: "green",
    },
  ],
  permissionGroups: [
    {
      label: "Safety",
      permissions: [
        { label: "View", active: true },
        { label: "Create", active: true },
        { label: "Manage CAPA", active: true },
        { label: "Approve", active: true },
      ],
    },
    {
      label: "Compliance",
      permissions: [
        { label: "View", active: true },
        { label: "Upload", active: true },
        { label: "Approve", active: true },
      ],
    },
    {
      label: "Analytics",
      permissions: [
        { label: "View", active: true },
        { label: "Export", active: true },
        { label: "Configure", active: false },
      ],
    },
    {
      label: "Admin",
      permissions: [
        { label: "Audit logs", active: false },
        { label: "System config", active: false },
      ],
    },
  ],
};

export function getUserDetailProfile(userId: string): UserDetailProfile {
  if (userId === "1") return SARAH_MITCHELL_DETAIL;
  return DEFAULT_USER_DETAIL;
}
