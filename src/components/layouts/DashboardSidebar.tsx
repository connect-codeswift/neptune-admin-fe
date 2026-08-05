"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuthRole } from "@/lib/auth-tokens";
import {
  getSidebarLogoHref,
  getSidebarNavSections,
  type SidebarNavSection,
} from "@/lib/sidebar-items";
import { SidebarSystemStatus } from "./SidebarSystemStatus";

export type DashboardSidebarUser = {
  name: string;
  role: string;
  initials?: string;
};

export type DashboardSidebarProps = {
  sections?: SidebarNavSection[];
  user?: DashboardSidebarUser;
  activeHref?: string;
  logoHref?: string;
  className?: string;
};

/** @deprecated Use DashboardSidebarUser */
export type AdminDashboardSidebarUser = DashboardSidebarUser;

/** @deprecated Use DashboardSidebarProps */
export type AdminDashboardSidebarProps = DashboardSidebarProps;

/** @deprecated Use DashboardSidebarUser */
export type SuperAdminDashboardSidebarUser = DashboardSidebarUser;

/** @deprecated Use DashboardSidebarProps */
export type SuperAdminDashboardSidebarProps = DashboardSidebarProps;

const DEFAULT_USER: DashboardSidebarUser = {
  name: "Ahmed Alsakkaf",
  role: "Neptune Admin",
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isItemActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (pathname === href) return true;
  if (exact) return false;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  sections,
  user = DEFAULT_USER,
  activeHref,
  logoHref,
  className = "",
}: Readonly<DashboardSidebarProps>) {
  const pathname = usePathname();
  const storedRole = getAuthRole();
  const currentHref = activeHref ?? pathname;
  const navSections = sections ?? getSidebarNavSections(pathname, storedRole);
  const resolvedLogoHref =
    logoHref ?? getSidebarLogoHref(pathname, storedRole);
  const showSystemStatus = storedRole === "super-admin";
  const initials = user.initials ?? getInitials(user.name);

  return (
    <aside
      className={`flex h-full min-h-0 max-h-full w-59 flex-col gap-3.5 overflow-hidden rounded-[20px] border border-white/90 bg-white/62 px-3.75 py-4.75 shadow-lg backdrop-blur-[10px] ${className}`.trim()}
    >
      <div className="flex shrink-0 items-end justify-center border-b border-darkest/8 px-2 pt-2 pb-6">
        <Link href={resolvedLogoHref} className="flex items-center justify-center">
          <Image
            src="/sidebar/neptune-wordmark.svg"
            alt="Neptune"
            width={131}
            height={10}
            className="h-2.5 w-32.75"
            unoptimized
            priority
          />
        </Link>
      </div>

      <nav
        className="min-h-0 scrollbar-none flex-1 overflow-y-auto overscroll-contain pr-1 max-h-[calc(100vh-22rem)]"
        aria-label="Admin"
      >
        {navSections.map((section) => (
          <div key={section.label} className="mb-3 last:mb-0">
            <p className="px-2 pt-px pb-1.5 text8 tracking-[1px] text-[#8892a3] uppercase">
              {section.label}
            </p>

            <ul className="flex flex-col">
              {section.items.map((item) => {
                const active = isItemActive(currentHref, item.href, item.exact);

                let itemClass =
                  "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text5 text-darkest transition-colors hover:bg-darkest/4";
                if (active) {
                  itemClass =
                    "flex w-full items-center gap-2.5 rounded-[10px] bg-blue-normal/18 px-2.5 py-2 text5 font-bold text-blue-normal";
                }

                let iconClass = "shrink-0 text-darkest";
                if (active) {
                  iconClass = "shrink-0 text-blue-normal";
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={itemClass}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        icon={item.icon}
                        width={16}
                        height={16}
                        className={iconClass}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                      {item.preview ? (
                        <span className="ml-auto rounded-full bg-darkest/6 px-2 py-0.5 text7 text-darkest/45">
                          Preview
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-3.5">
        {showSystemStatus ? <SidebarSystemStatus /> : null}

        <div className="flex items-center gap-2.5 border-t border-darkest/8 px-2.5 pt-3.5 pb-2.5">
          <div
            className="flex size-7.5 shrink-0 items-center justify-center rounded-[10px] bg-blue-normal text8 tracking-[0.22px] text-white"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text6 leading-[13.75px] font-bold text-darkest">
              {user.name}
            </p>
            <p className="truncate text7 text-[#8892a3]">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** @deprecated Use DashboardSidebar */
export const AdminDashboardSidebar = DashboardSidebar;

/** @deprecated Use DashboardSidebar */
export const SuperAdminDashboardSidebar = DashboardSidebar;
