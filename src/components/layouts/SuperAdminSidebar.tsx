"use client";

import { usePathname } from "next/navigation";
import type { SidebarNavSection } from "@/lib/admin-sidebar";
import {
  getSuperAdminNavSections,
  getSuperAdminSidebarLogoHref,
} from "@/lib/super-admin-sidebar-items";
import { SidebarNavShell, type SidebarNavShellUser } from "./SidebarNavShell";
import { SidebarSystemStatus } from "./SidebarSystemStatus";

export type SuperAdminSidebarUser = SidebarNavShellUser;

export type SuperAdminSidebarProps = {
  sections?: SidebarNavSection[];
  user?: SuperAdminSidebarUser;
  activeHref?: string;
  logoHref?: string;
  className?: string;
};

const DEFAULT_USER: SuperAdminSidebarUser = {
  name: "Ahmed Alsakkaf",
  role: "Neptune Admin",
};

export function SuperAdminSidebar({
  sections,
  user = DEFAULT_USER,
  activeHref,
  logoHref,
  className = "",
}: Readonly<SuperAdminSidebarProps>) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;
  const navSections = sections ?? getSuperAdminNavSections();
  const resolvedLogoHref = logoHref ?? getSuperAdminSidebarLogoHref();

  return (
    <SidebarNavShell
      sections={navSections}
      user={user}
      activeHref={currentHref}
      logoHref={resolvedLogoHref}
      footerSlot={<SidebarSystemStatus />}
      className={className}
    />
  );
}
