"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getLogoutLoginPath, logoutSession } from "@/lib/auth-flow";
import type { SidebarNavSection } from "@/lib/admin-sidebar";
import { useDashboardDrawer } from "./DashboardShell";

export type SidebarNavShellUser = {
  name: string;
  role: string;
  initials?: string;
};

export type SidebarNavShellProps = {
  sections: SidebarNavSection[];
  user: SidebarNavShellUser;
  activeHref: string;
  logoHref: string;
  footerSlot?: ReactNode;
  className?: string;
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

export function SidebarNavShell({
  sections,
  user,
  activeHref,
  logoHref,
  footerSlot,
  className = "",
}: Readonly<SidebarNavShellProps>) {
  const router = useRouter();
  const initials = user.initials ?? getInitials(user.name);
  // Present only inside DashboardShell's mobile drawer; the desktop rail is
  // always on screen and has nothing to close or dismiss on navigate.
  const drawer = useDashboardDrawer();

  const handleLogout = () => {
    const loginPath = getLogoutLoginPath();
    logoutSession();
    router.push(loginPath);
  };

  return (
    <aside
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-ehs-border bg-ehs-surface shadow-(--ehs-shadow-panel) lg:border-ehs-hairline/60 lg:bg-ehs-surface/45 lg:backdrop-blur-2xl ${className}`.trim()}
    >
      <div className="shrink-0 px-5 pt-5">
        <div className="relative flex items-center justify-between lg:justify-center">
          <Link href={logoHref} className="flex items-center justify-center">
            {/* Two files rather than a tinted one: the wordmark is a flat
                #0B1320 vector, invisible on the dark surface. `dark:` is
                pointed at `data-theme`, so this swaps with the app's own
                setting rather than the OS. */}
            <Image
              src="/sidebar/neptune-wordmark.svg"
              alt="Neptune"
              width={131}
              height={10}
              className="h-2.5 w-32.75 dark:hidden"
              unoptimized
              priority
            />
            <Image
              src="/auth/neptune-wordmark-white.svg"
              alt="Neptune"
              width={302}
              height={23}
              className="hidden h-2.5 w-32.75 dark:block"
              unoptimized
              priority
            />
          </Link>

          {drawer ? (
            <button
              type="button"
              data-sidebar-close=""
              onClick={drawer.close}
              aria-label="Close navigation menu"
              className="absolute -right-1 inline-flex size-9 items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg hover:text-ehs-darker lg:hidden"
            >
              <Icon icon="mdi:close" width={20} height={20} aria-hidden />
            </button>
          ) : null}
        </div>

        <div
          className="mt-4 w-full border-t border-ehs-border lg:border-ehs-hairline/60"
          aria-hidden
        />
      </div>

      <nav
        className="scrollbar-none flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5"
        aria-label="Admin"
      >
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <p className="text6 px-3 pb-1 text-ehs-muted-text">
              {section.label}
            </p>

            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isItemActive(activeHref, item.href, item.exact);

                let itemClass =
                  "text4 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-ehs-gray hover:bg-ehs-light-bg";
                if (active) {
                  itemClass =
                    "text5 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors bg-ehs-light-blue text-ehs-darker";
                }

                let iconClass = "size-4.5 shrink-0 text-ehs-muted-text";
                if (active) {
                  iconClass = "size-4.5 shrink-0 text-ehs-normal-blue";
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={itemClass}
                      aria-current={active ? "page" : undefined}
                      onClick={drawer?.close}
                    >
                      <Icon icon={item.icon} className={iconClass} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {item.preview ? (
                        <span className="text7 shrink-0 rounded-full bg-ehs-light-bg px-2 py-0.5 text-ehs-muted-text">
                          Preview
                        </span>
                      ) : null}
                      {item.badge ? (
                        <span
                          className="text7 min-w-4.5 shrink-0 rounded-full bg-ehs-red px-1.5 py-0.5 text-center text-ehs-on-accent"
                          aria-label={item.badgeLabel}
                        >
                          {item.badge}
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

      <div className="mt-auto flex shrink-0 flex-col gap-3.5 px-4 pb-4">
        {footerSlot}

        <div className="flex items-center gap-2 border-t border-ehs-border pt-4 lg:border-ehs-hairline/40">
          <div
            className="text7 flex size-9 shrink-0 items-center justify-center rounded-lg bg-ehs-normal-blue text-ehs-on-accent"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text5 truncate text-ehs-darker">{user.name}</p>
            <p className="text8 truncate text-ehs-muted-text">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg hover:text-ehs-red"
          >
            <Icon icon="mdi:logout" className="size-4.5" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
