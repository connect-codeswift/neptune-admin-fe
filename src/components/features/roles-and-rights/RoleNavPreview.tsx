"use client";

import { Icon } from "@iconify/react";
import {
  ALWAYS_VISIBLE_NAV,
  countVisibleNavItems,
  resolveNavPreview,
  type ResolvedNavItem,
} from "@/lib/ehss-nav-preview";
import type { CatalogModule } from "@/lib/mappers/roles.mapper";

export type RoleNavPreviewProps = Readonly<{
  /** The licensable EHS modules. Platform rights have no sidebar entry. */
  modules: readonly CatalogModule[];
  selectedIds: readonly number[];
  onToggle: (permissionId: number) => void;
  onSetMany: (permissionIds: number[], granted: boolean) => void;
  disabled?: boolean;
}>;

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40";

/**
 * One sidebar row as this role would see it.
 *
 * Three states, and they are deliberately distinguishable: granted and licensed
 * (shown in the app), licensed but not granted (hidden, and one click from being
 * shown), and not licensed (hidden no matter what the role holds, because the
 * company has not bought it — clicking would be a lie).
 */
function NavRow({
  item,
  disabled,
  onToggle,
}: Readonly<{
  item: ResolvedNavItem;
  disabled: boolean;
  onToggle: (permissionId: number) => void;
}>) {
  const visible = item.granted && item.licensed;
  const locked = disabled || !item.licensed || item.permissionId === undefined;

  let tone = "border-transparent text-ehs-muted-text";
  if (visible) {
    tone = "border-blue-normal/25 bg-blue-normal/8 text-darkest";
  } else if (!item.licensed) {
    tone = "border-transparent text-ehs-muted-text/50";
  }

  const title = (() => {
    if (!item.licensed) return `${item.module.name} — not licensed for this company`;
    if (item.permissionId === undefined) return `${item.module.name} — no View right defined yet`;
    return visible
      ? `${item.module.name} — visible; click to hide`
      : `${item.module.name} — hidden; click to show`;
  })();

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => item.permissionId !== undefined && onToggle(item.permissionId)}
      aria-pressed={visible}
      title={title}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors disabled:cursor-not-allowed ${tone} ${FOCUS_RING}`}
    >
      <Icon icon={item.icon} width={15} height={15} aria-hidden className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text8">{item.module.name}</span>
      {!item.licensed ? (
        <span className="shrink-0 text8 opacity-70">not licensed</span>
      ) : (
        <Icon
          icon={visible ? "lucide:eye" : "lucide:eye-off"}
          width={13}
          height={13}
          aria-hidden
          className="shrink-0"
        />
      )}
    </button>
  );
}

/**
 * What this role will see in the app's sidebar, drawn rather than described.
 *
 * The whole reason this exists: an admin should not have to translate
 * `Incident.View` into "Incidents appears in the menu" in their head. Toggling a
 * row here is the same action as ticking View in the grid — the sidebar is now
 * derived from exactly that, with no separate page permissions behind it.
 */
export function RoleNavPreview({
  modules,
  selectedIds,
  onToggle,
  onSetMany,
  disabled = false,
}: RoleNavPreviewProps) {
  const groups = resolveNavPreview(modules, selectedIds);
  const visibleCount = countVisibleNavItems(groups);

  // Only licensed modules can be shown at all, so bulk actions never promise
  // something the licence will refuse.
  const togglableIds = groups
    .flatMap((group) => group.items)
    .filter((item) => item.licensed && item.permissionId !== undefined)
    .map((item) => item.permissionId as number);

  const allShown =
    togglableIds.length > 0 &&
    togglableIds.every((id) => selectedIds.includes(id));

  if (modules.length === 0) {
    return (
      <p className="text-ehs-muted-text text8" role="status">
        No modules in the catalogue yet.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ehs-muted-text text8 tabular-nums">
          {visibleCount} of {togglableIds.length} licensed modules visible
        </p>
        {togglableIds.length > 0 && !disabled ? (
          <button
            type="button"
            onClick={() => onSetMany(togglableIds, !allShown)}
            className={`text-blue-normal cursor-pointer rounded text8 font-semibold ${FOCUS_RING}`}
          >
            {allShown ? "Hide all" : "Show all"}
          </button>
        ) : null}
      </div>

      <div className="border-ehs-border-ink/10 bg-ehs-surface flex flex-col gap-3 rounded-xl border p-3">
        {ALWAYS_VISIBLE_NAV.map((entry) => (
          <div key={entry.label}>
            <p className="text-ehs-muted-text mb-1 text8 font-medium uppercase">
              {entry.group}
            </p>
            <div className="text-ehs-muted-text flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5">
              <Icon icon={entry.icon} width={15} height={15} aria-hidden />
              <span className="flex-1 truncate text8">{entry.label}</span>
              <span className="text8 opacity-70">always shown</span>
            </div>
          </div>
        ))}

        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-ehs-muted-text mb-1 text8 font-medium uppercase">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavRow
                  key={item.module.id}
                  item={item}
                  disabled={disabled}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
