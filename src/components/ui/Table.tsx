"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

export type TableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Hide header label visually while keeping it for screen readers. */
  srOnlyHeader?: boolean;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage?: ReactNode;
  className?: string;
};

export function Table<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "No results found.",
  className = "",
}: Readonly<TableProps<T>>) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-white/90 bg-white/62 shadow-xl backdrop-blur-[10px] ${className}`.trim()}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-240 border-collapse text-left">
          <thead>
            <tr className="border-b border-darkest/8">
              {columns.map((column) => {
                let headerContent: ReactNode = column.header;
                if (column.srOnlyHeader) {
                  headerContent = (
                    <span className="sr-only">{column.header}</span>
                  );
                }

                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={`h-10 px-4 text-[11px] font-bold tracking-[0.66px] text-[#8892a3] uppercase ${column.headerClassName ?? ""}`.trim()}
                  >
                    {headerContent}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-[#8892a3]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);

                return (
                  <tr
                    key={rowId}
                    className="border-b border-darkest/8 last:border-b-0"
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowId}-${column.id}`}
                        className={`h-15 px-4 align-middle ${column.className ?? ""}`.trim()}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* —— Cell helpers matching the Users table Figma —— */

export type TableUserCellProps = {
  name: string;
  email?: string;
  initials?: string;
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

export function TableUserCell({
  name,
  email,
  initials,
}: Readonly<TableUserCellProps>) {
  const avatarLabel = initials ?? getInitials(name);

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-blue-normal text-[10px] font-bold text-white"
        aria-hidden
      >
        {avatarLabel}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-darkest">
          {name}
        </p>
        {email ? (
          <p className="truncate text-[11px] text-[#8892a3]">{email}</p>
        ) : null}
      </div>
    </div>
  );
}

export type TableRoleBadgeProps = {
  children: ReactNode;
  className?: string;
};

export function TableRoleBadge({
  children,
  className = "",
}: Readonly<TableRoleBadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text-[12.5px] font-medium text-darkest ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export type TableStatus = "active" | "pending" | "inactive" | "suspended";

export type TableStatusBadgeProps = {
  status: TableStatus;
  label?: string;
};

const STATUS_LABEL: Record<TableStatus, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  suspended: "Suspended",
};

const STATUS_CLASS: Record<TableStatus, string> = {
  active: "bg-green/12 text-green",
  pending: "bg-yellow/10 text-yellow",
  inactive: "bg-red/12 text-red",
  suspended: "bg-red/8 text-red",
};

export function TableStatusBadge({
  status,
  label,
}: Readonly<TableStatusBadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[status]}`}
    >
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export type TableTextCellProps = {
  children: ReactNode;
  muted?: boolean;
  className?: string;
};

export function TableTextCell({
  children,
  muted = false,
  className = "",
}: Readonly<TableTextCellProps>) {
  let colorClass = "text-gray";
  if (muted) {
    colorClass = "text-[#8892a3]";
  }

  return (
    <span className={`text-[12.5px] ${colorClass} ${className}`.trim()}>
      {children}
    </span>
  );
}

export type TableIconActionProps = {
  label: string;
  icon: string;
  onClick?: () => void;
  variant?: "primary" | "neutral";
  href?: string;
};

export function TableIconAction({
  label,
  icon,
  onClick,
  variant = "neutral",
  href,
}: Readonly<TableIconActionProps>) {
  let toneClass = "bg-darkest/5 text-darkest/70 hover:bg-darkest/8";
  if (variant === "primary") {
    toneClass = "bg-blue-normal/12 text-blue-normal hover:bg-blue-normal/18";
  }

  const className = `inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-normal/30 ${toneClass}`;

  const content = (
    <Icon icon={icon} width={13} height={13} aria-hidden />
  );

  if (href) {
    return (
      <a href={href} aria-label={label} title={label} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={className}
    >
      {content}
    </button>
  );
}

export type TableRowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  viewHref?: string;
  editHref?: string;
  viewLabel?: string;
  editLabel?: string;
};

export function TableRowActions({
  onView,
  onEdit,
  viewHref,
  editHref,
  viewLabel = "View",
  editLabel = "Edit",
}: Readonly<TableRowActionsProps>) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <TableIconAction
        label={viewLabel}
        icon="lucide:eye"
        variant="primary"
        onClick={onView}
        href={viewHref}
      />
      <TableIconAction
        label={editLabel}
        icon="lucide:pencil"
        variant="neutral"
        onClick={onEdit}
        href={editHref}
      />
    </div>
  );
}
