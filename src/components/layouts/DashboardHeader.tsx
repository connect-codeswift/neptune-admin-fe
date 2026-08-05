"use client";

import { Icon } from "@iconify/react";
import { useEffect, type ReactNode } from "react";
import { IconButton } from "../ui/IconButton";
import { HeaderSiteChanger } from "./HeaderSiteChanger";

export type DashboardHeaderProps = {
  searchPlaceholder?: string;
  /** Opens the global search / command palette (also triggered by ⌘K / Ctrl+K). */
  onSearchOpen?: () => void;
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  onDateRangeClick?: () => void;
  hasNotifications?: boolean;
  onNotificationsClick?: () => void;
  className?: string;
  /** Optional slot after the notification button (e.g. avatar). */
  endSlot?: ReactNode;
};

function formatHeaderDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(end);
  return `${startLabel} — ${endLabel}`;
}

export function DashboardHeader({
  searchPlaceholder = "Search Incidents, actions, docs...",
  onSearchOpen,
  dateRangeStart,
  dateRangeEnd,
  onDateRangeClick,
  hasNotifications = false,
  onNotificationsClick,
  className = "",
  endSlot,
}: Readonly<DashboardHeaderProps>) {
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

  let dateRangeLabel = "Select date range";
  if (dateRangeStart && dateRangeEnd) {
    dateRangeLabel = formatHeaderDateRange(dateRangeStart, dateRangeEnd);
  }

  return (
    <header
      className={`flex items-center justify-between gap-4 ${className}`.trim()}
    >
      <button
        type="button"
        onClick={onSearchOpen}
        className="flex h-11 min-w-0 max-w-xl flex-1 items-center gap-3 rounded-full border border-darkest/10 bg-white px-4 text-left shadow-lg outline-none transition-colors hover:border-darkest/16 focus-visible:ring-2 focus-visible:ring-blue-normal/30"
      >
        <Icon
          icon="mdi:magnify"
          width={20}
          height={20}
          className="shrink-0 text-darkest/40"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text5 text-darkest/45">
          {searchPlaceholder}
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-darkest/10 bg-lightgray px-1.5 py-0.5 font-sans text7 text-darkest/45 sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="flex shrink-0 items-center gap-2.5">
        <HeaderSiteChanger />

        <div className="relative">
          <IconButton
            icon="mdi:bell-outline"
            label={
              hasNotifications
                ? "Notifications (unread)"
                : "Notifications"
            }
            variant="soft"
            shape="rounded"
            size="md"
            onClick={onNotificationsClick}
            className="size-11 border-darkest/10 bg-white shadow-lg hover:bg-lightgray"
          />
          {hasNotifications ? (
            <span
              className="pointer-events-none absolute top-2.5 right-2.5 size-2 rounded-full bg-red ring-2 ring-white"
              aria-hidden
            />
          ) : null}
        </div>

        {endSlot}
      </div>
    </header>
  );
}
