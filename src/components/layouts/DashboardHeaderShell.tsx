"use client";

import { Icon } from "@iconify/react";
import { useEffect, type ReactNode } from "react";
import { IconButton } from "../ui/IconButton";
import { ThemeToggle } from "../ThemeToggle";
import { HeaderSiteChanger } from "./HeaderSiteChanger";

export type DashboardHeaderShellProps = {
  searchPlaceholder?: string;
  onSearchOpen?: () => void;
  hasNotifications?: boolean;
  onNotificationsClick?: () => void;
  className?: string;
  /** Rendered to the left of the search field (e.g. super-admin back control). */
  leadingSlot?: ReactNode;
  endSlot?: ReactNode;
};

export function DashboardHeaderShell({
  searchPlaceholder = "Search Incidents, actions, docs...",
  onSearchOpen,
  hasNotifications = false,
  onNotificationsClick,
  className = "",
  leadingSlot,
  endSlot,
}: Readonly<DashboardHeaderShellProps>) {
  // Neither concrete header supplies these yet, so both controls would sit
  // there looking live and doing nothing. Rather than wire up features that do
  // not exist, the header says so: the search trigger renders disabled (it is
  // load-bearing to the header's shape, and its ⌘K hint is withheld because
  // the shortcut is not listening either), and the bell is omitted outright —
  // a notifications button with no panel behind it is pure noise. It comes
  // back, disabled, if a caller ever reports unread notifications without
  // giving somewhere to go.
  const searchEnabled = onSearchOpen !== undefined;
  const notificationsEnabled = onNotificationsClick !== undefined;
  const showNotifications = notificationsEnabled || hasNotifications;

  useEffect(() => {
    if (!onSearchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      onSearchOpen();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchOpen]);

  return (
    <header
      className={`flex items-center justify-between gap-4 ${className}`.trim()}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {leadingSlot}

        <button
          type="button"
          onClick={onSearchOpen}
          disabled={!searchEnabled}
          aria-disabled={!searchEnabled}
          className="flex h-11 min-w-0 max-w-xl flex-1 cursor-pointer items-center gap-3 rounded-full border border-ehs-border bg-ehs-surface px-4 text-left shadow-(--ehs-shadow-card) outline-none transition-colors hover:border-ehs-border-strong focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-ehs-border"
        >
          <Icon
            icon="mdi:magnify"
            width={20}
            height={20}
            className="shrink-0 text-ehs-muted-text"
            aria-hidden
          />
          <span className="text4 min-w-0 flex-1 truncate text-ehs-placeholder">
            {searchPlaceholder}
          </span>
          {searchEnabled ? (
            <kbd className="text7 hidden shrink-0 rounded-md border border-ehs-border bg-ehs-light-bg px-1.5 py-0.5 font-sans text-ehs-muted-text sm:inline-block">
              ⌘K
            </kbd>
          ) : null}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <HeaderSiteChanger />

        {showNotifications ? (
          <div className="relative">
            <IconButton
              icon="mdi:bell-outline"
              label={hasNotifications ? "Notifications (unread)" : "Notifications"}
              variant="soft"
              shape="rounded"
              size="md"
              onClick={onNotificationsClick}
              disabled={!notificationsEnabled}
              aria-disabled={!notificationsEnabled}
              className="size-11 border-ehs-border bg-ehs-surface text-ehs-gray shadow-(--ehs-shadow-card) hover:bg-ehs-light-bg"
            />
            {hasNotifications ? (
              <span
                className="pointer-events-none absolute top-2.5 right-2.5 size-2 rounded-full bg-ehs-red ring-2 ring-ehs-surface"
                aria-hidden
              />
            ) : null}
          </div>
        ) : null}

        {/* Lives in the shell rather than in each concrete header so both the
            tenant and super-admin areas get it without either having to
            remember to mount it. `endSlot` stays free for callers. */}
        <ThemeToggle />

        {endSlot}
      </div>
    </header>
  );
}
