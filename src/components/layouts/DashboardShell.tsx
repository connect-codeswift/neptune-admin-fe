"use client";

import { Icon } from "@iconify/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DashboardDrawer = {
  /** Closes the mobile drawer and returns focus to the menu button. */
  close: () => void;
};

/**
 * Only ever non-null inside the mobile drawer, which is why the sidebar can ask
 * for it unconditionally: `null` means "you are the permanent desktop rail",
 * and the close button plus close-on-navigate drop out on their own.
 *
 * Context rather than a prop because both dashboard layouts are server
 * components — they hand the sidebar to this shell as an already-created
 * element, so there is no way to pass a callback down through the slot.
 */
const DashboardDrawerContext = createContext<DashboardDrawer | null>(null);

export function useDashboardDrawer(): DashboardDrawer | null {
  return useContext(DashboardDrawerContext);
}

export type DashboardShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  /**
   * Caps how wide the content column grows, and centres it past that point.
   *
   * An admin console is used on very wide monitors, where a full-bleed column
   * stretches tables to arm's length and pushes a card's title and its action
   * to opposite edges of the screen. Capping it keeps a readable measure and
   * lets the ambient background breathe at the margins.
   *
   * Opt-in rather than the default: the tenant screens were laid out against
   * the full width and re-centring them is a separate decision from the one
   * this prop was added for.
   */
  contentMaxWidthClassName?: string;
};

/**
 * The two-column dashboard chrome, shared by the tenant and super-admin trees.
 *
 * Desktop geometry is unchanged from the layouts this replaces: a
 * `[auto_1fr]` grid with the rail in the first track. Below `lg` the rail is
 * `position: fixed`, which takes it out of the grid entirely — a positioned
 * item contributes nothing to track sizing, so the `auto` column collapses to
 * zero and the content column gets the full width.
 */
export function DashboardShell({
  sidebar,
  header,
  children,
  contentMaxWidthClassName = "",
}: Readonly<DashboardShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Drives `inert` on the off-canvas drawer. Starts false so the server and the
  // first client render agree; the media query resolves on mount.
  const [isDesktop, setIsDesktop] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const closeSidebar = () => {
    setSidebarOpen(false);
    menuButtonRef.current?.focus();
  };

  // Crossing into the desktop breakpoint promotes the drawer to a permanent
  // rail; leaving it open would strand the scroll lock and the backdrop.
  useEffect(() => {
    const desktop = globalThis.matchMedia("(min-width: 64rem)");

    const sync = () => {
      setIsDesktop(desktop.matches);
      if (desktop.matches) setSidebarOpen(false);
    };

    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSidebarOpen(false);
      menuButtonRef.current?.focus();
    };

    // Without the lock the page scrolls behind the sheet, so dismissing it
    // drops you somewhere other than where you opened it.
    const { body } = globalThis.document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    globalThis.document.addEventListener("keydown", handleKeyDown);

    sidebarRef.current
      ?.querySelector<HTMLElement>("[data-sidebar-close]")
      ?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      globalThis.document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="grid h-screen min-h-0 w-full grid-cols-[auto_1fr] items-stretch overflow-hidden py-6 pl-6">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-ehs-overlay backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div
        id="dashboard-sidebar"
        ref={sidebarRef}
        inert={!isDesktop && !sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-59 min-h-0 max-w-[calc(100%-3rem)] p-3 transition-transform duration-300 motion-reduce:transition-none lg:static lg:h-full lg:max-w-none lg:translate-x-0 lg:p-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardDrawerContext.Provider value={{ close: closeSidebar }}>
          {sidebar}
        </DashboardDrawerContext.Provider>
      </div>

      <main className="flex h-full min-h-0 w-full flex-col gap-8 overflow-hidden px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-ehs-border bg-ehs-surface text-ehs-gray shadow-(--ehs-shadow-card) transition-colors hover:bg-ehs-light-bg lg:hidden"
          >
            <Icon icon="mdi:menu" width={22} height={22} aria-hidden />
          </button>

          <div className={`min-w-0 flex-1 ${contentMaxWidthClassName}`.trim()}>
            {header}
          </div>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {/* The cap lives on an inner wrapper rather than on the scroller, so
              the scrollbar stays at the true edge of the viewport instead of
              floating in from it. */}
          <div className={contentMaxWidthClassName}>{children}</div>
        </div>
      </main>
    </div>
  );
}
