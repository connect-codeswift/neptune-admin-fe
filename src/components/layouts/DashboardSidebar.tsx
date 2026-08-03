"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardSidebarItem = {
  label: string;
  href: string;
  icon: string;
};

export type DashboardSidebarUser = {
  name: string;
  role: string;
  initials?: string;
};

export type DashboardSidebarProps = {
  items?: DashboardSidebarItem[];
  sectionLabel?: string;
  user?: DashboardSidebarUser;
  /** Override active item; defaults to matching `usePathname()`. */
  activeHref?: string;
  logoHref?: string;
  className?: string;
};

export const DEFAULT_ADMIN_NAV_ITEMS: DashboardSidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "lucide:layout-dashboard",
  },
  {
    label: "User Management",
    href: "/users",
    icon: "tabler:user",
  },
  {
    label: "Roles & Permissions",
    href: "/roles",
    icon: "lucide:shield-check",
  },
  {
    label: "Document Categories",
    href: "/document-categories",
    icon: "lucide:layers",
  },
  {
    label: "Version History",
    href: "/version-history",
    icon: "lucide:file-clock",
  },
  {
    label: "Regulations",
    href: "/regulations",
    icon: "lucide:book-open",
  },
  {
    label: "PPE Catalog",
    href: "/ppe-catalog",
    icon: "lucide:hard-hat",
  },
  {
    label: "LOTO Procedures",
    href: "/loto-procedures",
    icon: "lucide:lock",
  },
  {
    label: "Permit Templates",
    href: "/permit-templates",
    icon: "lucide:clipboard-clock",
  },
];

const DEFAULT_USER: DashboardSidebarUser = {
  name: "Ahmed Alsakkaf",
  role: "Neptune Super Admin",
  initials: "AS",
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

function isItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  items = DEFAULT_ADMIN_NAV_ITEMS,
  sectionLabel = "Super Admin",
  user = DEFAULT_USER,
  activeHref,
  logoHref = "/dashboard",
  className = "",
}: Readonly<DashboardSidebarProps>) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;
  const initials = user.initials ?? getInitials(user.name);

  return (
    <aside
      className={`flex h-full w-59 flex-col gap-3.5 rounded-[20px] border border-white/90 bg-white/62 px-3.75 py-4.75 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] ${className}`.trim()}
    >
      <div className="flex items-end justify-center border-b border-darkest/8 px-2 pt-2 pb-6">
        <Link href={logoHref} className="flex items-center justify-center">
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

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Admin">
        <p className="px-2 pt-px pb-1.5 text-[10px] font-bold tracking-[1px] text-[#8892a3] uppercase">
          {sectionLabel}
        </p>

        <ul className="flex flex-col">
          {items.map((item) => {
            const active = isItemActive(currentHref, item.href);

            let itemClass =
              "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-darkest transition-colors hover:bg-darkest/4";
            if (active) {
              itemClass =
                "flex w-full items-center gap-2.5 rounded-[10px] bg-blue-normal/18 px-2.5 py-2 text-[13px] font-bold text-blue-normal";
            }

            let iconClass = "shrink-0 text-darkest";
            if (active) {
              iconClass = "shrink-0 text-blue-normal";
            }

            return (
              <li key={item.href}>
                <Link href={item.href} className={itemClass} aria-current={active ? "page" : undefined}>
                  <Icon
                    icon={item.icon}
                    width={16}
                    height={16}
                    className={iconClass}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-darkest/8 px-2.5 pt-3.5 pb-2.5">
        <div
          className="flex size-7.5 shrink-0 items-center justify-center rounded-[10px] bg-blue-normal text-[11px] font-bold tracking-[0.22px] text-white"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] leading-[13.75px] font-bold text-darkest">
            {user.name}
          </p>
          <p className="truncate text-[10.5px] text-[#8892a3]">{user.role}</p>
        </div>
      </div>
    </aside>
  );
}
