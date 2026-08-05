"use client";

import { usePathname } from "next/navigation";
import {
  getAdminSidebarLogoHref,
  getOrgAdminNavSections,
  type SidebarNavSection,
} from "@/lib/admin-sidebar";
import { getTenantContext } from "@/lib/tenant-context";
import { SidebarNavShell, type SidebarNavShellUser } from "./SidebarNavShell";

export type AdminDashboardSidebarUser = SidebarNavShellUser;

export type AdminDashboardSidebarProps = {
  sections?: SidebarNavSection[];
  user?: AdminDashboardSidebarUser;
  activeHref?: string;
  logoHref?: string;
  className?: string;
};

const DEFAULT_USER: AdminDashboardSidebarUser = {
  name: "Ahmed Alsakkaf",
  role: "Neptune Admin",
};

export function AdminDashboardSidebar({
  sections,
  user = DEFAULT_USER,
  activeHref,
  logoHref,
  className = "",
}: Readonly<AdminDashboardSidebarProps>) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;
  const tenantContext = getTenantContext();

  const navSections =
    sections ??
    getOrgAdminNavSections(
      pathname,
      tenantContext?.organizationName ?? "Admin",
    );

  const resolvedLogoHref = logoHref ?? getAdminSidebarLogoHref(pathname);

  return (
    <SidebarNavShell
      sections={navSections}
      user={user}
      activeHref={currentHref}
      logoHref={resolvedLogoHref}
      className={className}
    />
  );
}
