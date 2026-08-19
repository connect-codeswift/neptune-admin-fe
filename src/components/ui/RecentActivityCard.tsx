"use client";

import { Icon } from "@iconify/react";
import { GLASS_SURFACE } from "./GlassCard";
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
      className={[GLASS_SURFACE, "p-6", className].filter(Boolean).join(" ")}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text3 text-ehs-darker">{title}</h2>
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
        <p className="text4 text-ehs-muted-text">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="text4 min-w-0">
                  <span className="text-ehs-darker font-bold">
                    {item.actor}
                  </span>{" "}
                  <span className="text-ehs-gray">{item.action}</span>
                </p>
                <time className="text8 text-ehs-muted-text shrink-0">
                  {item.time}
                </time>
              </div>
              <p className="text4 text-ehs-slate mt-0.5">{item.target}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
