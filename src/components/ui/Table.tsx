"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { GLASS_SURFACE } from "./GlassCard";

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
      className={[GLASS_SURFACE, "overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="overflow-x-auto">
        <table className="text4 w-full min-w-240 border-collapse text-left">
          <thead>
            <tr className="border-ehs-border/40 border-b">
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
                    className={`text6 text-ehs-muted-text px-4 py-3.5 select-none ${column.headerClassName ?? ""}`.trim()}
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
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {/* A `div`, not a `p`. `emptyMessage` is typed `ReactNode`,
                      so callers reasonably pass a composed empty state — icon,
                      copy and a call-to-action button. Block content inside a
                      `p` is invalid HTML: the browser closes the paragraph
                      early, the server and client parse trees diverge, and it
                      surfaces as a hydration error rather than as a layout
                      one. Pages had started rendering their empty state
                      *instead of* the table to sidestep it. */}
                  <div className="text4 text-ehs-muted-text">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);

                return (
                  <tr
                    key={rowId}
                    className="border-ehs-border/45 hover:bg-ehs-normal-blue/18 border-b transition-colors last:border-b-0"
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowId}-${column.id}`}
                        className={`text-ehs-darker px-4 py-4 align-middle ${column.className ?? ""}`.trim()}
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

  // Both lines truncate, so the full identity is only ever guaranteed to be
  // readable through the tooltip. Built here rather than left to each caller,
  // which is how the same `<span title>` wrapper ended up hand-rolled on
  // several pages.
  const fullLabel = email ? `${name} · ${email}` : name;

  return (
    <div className="flex items-center gap-2.5" title={fullLabel}>
      <div
        className="bg-ehs-normal-blue text-ehs-on-accent text7 flex size-8 shrink-0 items-center justify-center rounded-2.5"
        aria-hidden
      >
        {avatarLabel}
      </div>
      <div className="min-w-0">
        <p className="text5 text-ehs-darker truncate">{name}</p>
        {email ? (
          <p className="text7 text-ehs-muted-text truncate">{email}</p>
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
      className={`text7 bg-ehs-normal-blue/12 text-ehs-dark-blue inline-flex items-center rounded-md px-2 py-0.5 ${className}`.trim()}
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
  active: "bg-ehs-green/12 text-ehs-green",
  pending: "bg-ehs-yellow/12 text-ehs-yellow-ink-soft",
  inactive: "bg-ehs-muted-text/14 text-ehs-muted-text",
  suspended: "bg-ehs-red/12 text-ehs-red",
};

export function TableStatusBadge({
  status,
  label,
}: Readonly<TableStatusBadgeProps>) {
  return (
    <span
      className={`text7 inline-flex items-center rounded-full px-2.5 py-0.5 ${STATUS_CLASS[status]}`}
    >
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export type TableTextCellProps = {
  children: ReactNode;
  muted?: boolean;
  className?: string;
  /**
   * Native tooltip for the full value, for cells that truncate.
   *
   * Table cells clip long text far more often than they fit it, and without
   * this a caller's only option was to wrap the cell in its own `<span title>`
   * — which is what several pages had started doing, each slightly differently.
   */
  title?: string;
};

export function TableTextCell({
  children,
  muted = false,
  className = "",
  title,
}: Readonly<TableTextCellProps>) {
  let colorClass = "text-ehs-gray";
  if (muted) {
    colorClass = "text-ehs-muted-text";
  }

  return (
    <span className={`text4 ${colorClass} ${className}`.trim()} title={title}>
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
  /**
   * Renders the action visibly inert. Omitting `onClick` alone is not enough:
   * that leaves a control that still looks pressable and silently does nothing,
   * which reads as a bug. Pair this with `title` to say why it is unavailable.
   */
  disabled?: boolean;
  /** Overrides the hover tooltip, which defaults to `label`. */
  title?: string;
};

export function TableIconAction({
  label,
  icon,
  onClick,
  variant = "neutral",
  href,
  disabled = false,
  title,
}: Readonly<TableIconActionProps>) {
  let toneClass =
    "bg-ehs-border-ink/6 text-ehs-muted-text hover:bg-ehs-border-ink/12 hover:text-ehs-darker";
  if (variant === "primary") {
    toneClass =
      "bg-ehs-normal-blue/12 text-ehs-normal-blue hover:bg-ehs-normal-blue/18";
  }
  if (disabled) {
    toneClass = "bg-ehs-border-ink/6 text-ehs-muted-text";
  }

  const interactionClass = disabled
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer";

  const className = `focus-visible:ring-ehs-normal-blue/20 inline-flex size-7 shrink-0 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 ${interactionClass} ${toneClass}`;

  const content = <Icon icon={icon} width={13} height={13} aria-hidden />;

  // A disabled link is not a thing in HTML, so a disabled action always renders
  // as a button — an <a> without href stays focusable and still reads as a link.
  if (href && !disabled) {
    return (
      <a href={href} aria-label={label} title={title ?? label} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      disabled={disabled}
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
