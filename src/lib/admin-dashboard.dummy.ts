export type AdminDashboardKpi = {
  value: string | number;
  label: string;
  trendLabel: string;
  trend: "up" | "down";
  data: number[];
};

export type AdminModuleStat = {
  title: string;
  value: number;
  activeCount: number;
};

export type AdminActivityLogItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export const ADMIN_DASHBOARD_KPIS: AdminDashboardKpi[] = [
  {
    value: 247,
    label: "Total Users",
    trendLabel: "+12",
    trend: "up",
    data: [210, 218, 225, 230, 236, 242, 247],
  },
  {
    value: 38,
    label: "Active Users",
    trendLabel: "+5",
    trend: "up",
    data: [28, 30, 32, 33, 35, 36, 38],
  },
  {
    value: 14,
    label: "Open CAPAs",
    trendLabel: "-3",
    trend: "down",
    data: [20, 19, 18, 17, 16, 15, 14],
  },
  {
    value: "99.8%",
    label: "System Uptime",
    trendLabel: "30d",
    trend: "up",
    data: [99.2, 99.4, 99.5, 99.6, 99.7, 99.75, 99.8],
  },
];

export const ADMIN_MODULE_STATS: AdminModuleStat[] = [
  { title: "Safety Incidents", value: 1247, activeCount: 23 },
  { title: "Document Categories", value: 92, activeCount: 14 },
  { title: "CAPA Items", value: 156, activeCount: 89 },
  { title: "PPE Catalog Items", value: 68, activeCount: 68 },
  { title: "Regulations", value: 127, activeCount: 127 },
];

export const ADMIN_ACTIVITY_LOG: AdminActivityLogItem[] = [
  {
    id: "a1",
    actor: "Maria Lopez",
    action: "Created new user account",
    target: "James Okonkwo",
    time: "2 min ago",
  },
  {
    id: "a2",
    actor: "System Admin",
    action: "Updated role permissions",
    target: "HSE Manager",
    time: "18 min ago",
  },
  {
    id: "a3",
    actor: "David Chen",
    action: "Deactivated user",
    target: "Tom Richards",
    time: "1 hr ago",
  },
  {
    id: "a4",
    actor: "System Admin",
    action: "Added regulation",
    target: "OSHA 29 CFR 1910.147",
    time: "2 hr ago",
  },
  {
    id: "a5",
    actor: "Maria Lopez",
    action: "Updated document category",
    target: "SDS Documents",
    time: "3 hr ago",
  },
];
