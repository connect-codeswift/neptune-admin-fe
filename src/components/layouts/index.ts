export { PageHeader, type PageHeaderProps } from "./PageHeader";
export {
  AdminDashboardHeader,
  type AdminDashboardHeaderProps,
} from "./AdminDashboardHeader";
export {
  SuperAdminDashboardHeader,
  type SuperAdminDashboardHeaderProps,
} from "./SuperAdminDashboardHeader";
export { HeaderSiteChanger } from "./HeaderSiteChanger";
export {
  AdminDashboardSidebar,
  type AdminDashboardSidebarProps,
  type AdminDashboardSidebarUser,
} from "./AdminDashboardSidebar";
export {
  SuperAdminSidebar,
  type SuperAdminSidebarProps,
  type SuperAdminSidebarUser,
} from "./SuperAdminSidebar";
export {
  SidebarSystemStatus,
  type SidebarSystemStatusProps,
} from "./SidebarSystemStatus";
export {
  ORG_ADMIN_NAV_ITEMS,
  buildOrgSiteBasePath,
  getAdminSidebarLogoHref,
  getOrgAdminNavSections,
  parseOrgSitePath,
  prefixNavItems,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@/lib/admin-sidebar";
export {
  SUPER_ADMIN_NAV_ITEMS,
  getSuperAdminCombinedNavSections,
  getSuperAdminNavSections,
  getSuperAdminSidebarLogoHref,
} from "@/lib/super-admin-sidebar-items";
export {
  getSidebarLogoHref,
  getSidebarNavSections,
} from "@/lib/sidebar-items";
export {
  PlaceholderPage,
  type PlaceholderPageProps,
} from "./PlaceholderPage";
export {
  DashboardAuthGate,
  type DashboardAuthGateProps,
} from "./DashboardAuthGate";

/** @deprecated Use AdminDashboardHeader or SuperAdminDashboardHeader */
export { AdminDashboardHeader as DashboardHeader } from "./AdminDashboardHeader";
/** @deprecated Use AdminDashboardHeaderProps or SuperAdminDashboardHeaderProps */
export type { AdminDashboardHeaderProps as DashboardHeaderProps } from "./AdminDashboardHeader";
/** @deprecated Use AdminDashboardSidebar or SuperAdminSidebar */
export { AdminDashboardSidebar as DashboardSidebar } from "./AdminDashboardSidebar";
/** @deprecated Use AdminDashboardSidebarProps or SuperAdminSidebarProps */
export type {
  AdminDashboardSidebarProps as DashboardSidebarProps,
  AdminDashboardSidebarUser as DashboardSidebarUser,
} from "./AdminDashboardSidebar";
