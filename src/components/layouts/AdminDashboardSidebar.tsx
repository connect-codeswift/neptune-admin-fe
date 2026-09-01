"use client";

import { usePathname } from "next/navigation";
import {
  getAdminSidebarLogoHref,
  getOrgAdminNavSections,
  type SidebarNavSection,
} from "@/lib/admin-sidebar";
import { useSignedInUser } from "@/lib/signed-in-user";
import { getTenantContext } from "@/lib/tenant-context";
import { SidebarNavShell, type SidebarNavShellUser } from "./SidebarNavShell";
import { useHydrated } from "@/lib/use-hydrated";

export type AdminDashboardSidebarUser = SidebarNavShellUser;

export type AdminDashboardSidebarProps = {
  sections?: SidebarNavSection[];
  user?: AdminDashboardSidebarUser;
  activeHref?: string;
  logoHref?: string;
  className?: string;
};

export function AdminDashboardSidebar({
  sections,
  user,
  activeHref,
  logoHref,
  className = "",
}: Readonly<AdminDashboardSidebarProps>) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;
  const signedInUser = useSignedInUser();
  const resolvedUser = user ?? signedInUser;

  // getTenantContext reads localStorage, which does not exist during SSR, so
  // reading it unguarded made the server emit "Admin" and the client the real
  // name — a hydration mismatch. useHydrated keeps the server on "Admin" and
  // lets the client read the real value during render, no effect needed.
  const isHydrated = useHydrated();
  const organizationName = isHydrated
    ? getTenantContext()?.organizationName
    : undefined;

  const navSections =
    sections ?? getOrgAdminNavSections(pathname, organizationName ?? "Admin");

  const resolvedLogoHref = logoHref ?? getAdminSidebarLogoHref(pathname);

  return (
    <SidebarNavShell
      sections={navSections}
      user={resolvedUser}
      activeHref={currentHref}
      logoHref={resolvedLogoHref}
      className={className}
    />
  );
}
