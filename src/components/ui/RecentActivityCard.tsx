"use client";

import { Icon } from "@iconify/react";
import { TextButton } from "./TextButton";

export type RecentActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export type RecentActivityCardProps = {
  title?: string;
  items: RecentActivityItem[];
  viewHref?: string;
  viewLabel?: string;
  onViewAll?: () => void;
  emptyMessage?: string;
  className?: string;
};

export function RecentActivityCard({
  title = "Company Activity Log",
  items,
  viewHref,
  viewLabel = "View audit log",
  onViewAll,
  emptyMessage = "No recent activity",
  className = "",
}: Readonly<RecentActivityCardProps>) {
  const showViewAction = Boolean(viewHref || onViewAll);

  return (
    <section
      className={`rounded-2xl border border-darkest/8 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ${className}`.trim()}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-darkest">{title}</h2>
        {showViewAction ? (
          <TextButton
            href={viewHref}
            onClick={onViewAll}
            size="sm"
            underline="none"
            className="shrink-0 gap-1"
          >
            {viewLabel}
            <Icon icon="mdi:arrow-right" width={16} height={16} aria-hidden />
          </TextButton>
        ) : null}
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-gray">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="min-w-0 text-sm">
                  <span className="font-bold text-darkest">{item.actor}</span>{" "}
                  <span className="text-gray">{item.action}</span>
                </p>
                <time className="shrink-0 text-sm text-textcolor">
                  {item.time}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-gray">{item.target}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
