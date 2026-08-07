"use client";

import { usePathname } from "next/navigation";
import type { SidebarNavSection } from "@/lib/admin-sidebar";
import {
  getSuperAdminNavSections,
  getSuperAdminSidebarLogoHref,
  withDeployAlertBadge,
} from "@/lib/super-admin-sidebar-items";
import { useDeployAlertBadgeCount } from "@/hooks/usePlatformOps";
import { useSignedInUser } from "@/lib/signed-in-user";
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

export function SuperAdminSidebar({
  sections,
  user,
  activeHref,
  logoHref,
  className = "",
}: Readonly<SuperAdminSidebarProps>) {
  const pathname = usePathname();
  const signedInUser = useSignedInUser();
  const resolvedUser = user ?? signedInUser;
  const currentHref = activeHref ?? pathname;
  const alertCount = useDeployAlertBadgeCount();
  const navSections = withDeployAlertBadge(
    sections ?? getSuperAdminNavSections(),
    alertCount,
  );
  const resolvedLogoHref = logoHref ?? getSuperAdminSidebarLogoHref();

  return (
    <SidebarNavShell
      sections={navSections}
      user={resolvedUser}
      activeHref={currentHref}
      logoHref={resolvedLogoHref}
      footerSlot={<SidebarSystemStatus />}
      className={className}
    />
  );
}
