"use client";

import { Icon } from "@iconify/react";
import type { PermissionOption } from "@/lib/mappers/roles.mapper";
import {
  getNonNavPageOptions,
  resolveNavPreview,
  type ResolvedNavItem,
} from "@/lib/ehss-nav-preview";

export type RoleNavPreviewProps = Readonly<{
  /** The `UI Pages` category from the live permission catalogue. */
  pageOptions: readonly PermissionOption[];
  selectedIds: readonly number[];
  onToggle: (permissionId: number) => void;
  /** Bulk controls act on the sidebar rows only, never on sub-pages. */
  onSetMany: (permissionIds: number[], granted: boolean) => void;
}>;

/**
 * One row of the mocked sidebar.
 *
 * A row is a button whose `aria-pressed` is the grant, not a checkbox: the
 * control *is* the thing it describes, so pressing "HazCom" in a picture of the
 * sidebar is the same gesture as ticking `page:hazcom` was — minus having to
 * know that string exists.
 */
function NavRow({
  entry,
  onToggle,
}: Readonly<{ entry: ResolvedNavItem; onToggle: (id: number) => void }>) {
  const { item, option, granted, visible } = entry;

  // Always-visible first, and deliberately ahead of the missing-row check:
  // Chat and Settings have no `page:` row at all by design, so testing for the
  // row first would label the two entries every user always sees as "n/a".
  if (item.alwaysVisible) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
        title={`${item.label} is always visible — it sits outside the page catalogue`}
      >
        <Icon
          icon={item.icon}
          width={17}
          height={17}
          className="text-ehs-normal-blue"
          aria-hidden
        />
        <span className="text-ehs-darker min-w-0 flex-1 truncate text8">
          {item.label}
        </span>
        <Icon
          icon="lucide:lock"
          width={12}
          height={12}
          className="text-ehs-muted-text shrink-0"
          aria-hidden
        />
        <span className="sr-only">Always visible</span>
      </div>
    );
  }

  // No catalogue row: nothing to tick. Say so rather than render a dead box.
  if (!option) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 opacity-40"
        title={`${item.label} has no ${item.permission} permission in this environment`}
      >
        <Icon icon={item.icon} width={17} height={17} aria-hidden />
        <span className="min-w-0 flex-1 truncate text8">{item.label}</span>
        <span className="shrink-0 text7 text-ehs-muted-text">n/a</span>
      </div>
    );
  }

  let rowClass =
    "text-ehs-muted-text opacity-55 hover:opacity-100 hover:bg-ehs-border-ink/6";
  if (visible) {
    rowClass = "bg-ehs-normal-blue/8 text-ehs-darker hover:bg-ehs-normal-blue/14";
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      aria-pressed={granted}
      title={option.label}
      className={`focus-visible:ring-ehs-normal-blue/40 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all outline-none focus-visible:ring-2 ${rowClass}`}
    >
      <Icon
        icon={item.icon}
        width={17}
        height={17}
        className={visible ? "text-ehs-normal-blue shrink-0" : "shrink-0"}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text8">{item.label}</span>
      {visible ? (
        <Icon
          icon="lucide:check"
          width={13}
          height={13}
          className="text-ehs-normal-blue shrink-0"
          aria-hidden
        />
      ) : (
        <Icon
          icon="lucide:eye-off"
          width={13}
          height={13}
          className="shrink-0"
          aria-hidden
        />
      )}
    </button>
  );
}

/** A sub-page row: gates a route inside a module, not the sidebar entry. */
function SubPageRow({
  option,
  granted,
  onToggle,
}: Readonly<{
  option: PermissionOption;
  granted: boolean;
  onToggle: (id: number) => void;
}>) {
  if (option.locked) {
    return (
      <div className="text-ehs-muted-text flex items-center gap-2 px-2 py-1.5 text8">
        <Icon icon="lucide:lock" width={12} height={12} aria-hidden />
        <span className="min-w-0 truncate font-mono">{option.label}</span>
      </div>
    );
  }

  return (
    <label className="hover:bg-ehs-border-ink/6 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5">
      <input
        type="checkbox"
        checked={granted}
        onChange={() => onToggle(option.id)}
        className="accent-blue-normal border-ehs-border-ink/20 size-3.5 shrink-0 cursor-pointer rounded border"
      />
      <span className="text-darkest min-w-0 truncate font-mono text8">
        {option.label}
      </span>
    </label>
  );
}

/**
 * The answer to "what am I actually doing when I tick a page".
 *
 * Instead of a list of `page:*` strings, this draws the EHSS sidebar as the
 * role will see it: granted modules in full colour, withheld ones dimmed with
 * an eye-off. Clicking a row grants or revokes that module. It is the same
 * mutation the checkbox list performed, shown as its own consequence.
 */
export function RoleNavPreview({
  pageOptions,
  selectedIds,
  onToggle,
  onSetMany,
}: RoleNavPreviewProps) {
  const groups = resolveNavPreview(pageOptions, selectedIds);
  const subPages = getNonNavPageOptions(pageOptions);
  const selectedSet = new Set(selectedIds);

  const togglable = groups
    .flatMap((group) => group.items)
    .filter((entry) => entry.option && !entry.item.alwaysVisible);
  const togglableIds = togglable
    .map((entry) => entry.option?.id)
    .filter((id): id is number => id !== undefined);
  const grantedCount = togglable.filter((entry) => entry.granted).length;

  if (pageOptions.length === 0) {
    return (
      <p className="text-ehs-muted-text text8">
        This environment’s permission catalogue has no page rows, so there is
        nothing to preview.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      {/* The mock rail. Rounded, bordered and tinted so it reads as a picture
          of the app rather than another form control. */}
      <div className="min-w-0">
        <div className="border-ehs-border-ink/10 bg-ehs-surface-raised/40 rounded-3 overflow-hidden border">
          <div className="border-ehs-border-ink/8 flex items-center justify-between gap-2 border-b px-3 py-2.5">
            <span className="text-ehs-muted-text text6">Their sidebar</span>
            <span className="text-ehs-muted-text text7 tabular-nums">
              {grantedCount}/{togglableIds.length}
            </span>
          </div>

          <div className="max-h-140 overflow-y-auto p-2">
            {groups.map((group) => (
              <section key={group.title} className="mb-3 last:mb-0">
                <p className="text-ehs-muted-text px-2.5 pb-1 text6">
                  {group.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((entry) => (
                    <NavRow
                      key={entry.item.permission}
                      entry={entry}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSetMany(togglableIds, true)}
            disabled={grantedCount === togglableIds.length}
            className="text-blue-normal cursor-pointer rounded text8 font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Show all modules
          </button>
          <button
            type="button"
            onClick={() => onSetMany(togglableIds, false)}
            disabled={grantedCount === 0}
            className="text-gray cursor-pointer rounded text8 font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hide all
          </button>
        </div>
      </div>

      {/* What the picture means, and the rows it cannot show. */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="border-blue-normal/15 bg-blue-normal/5 rounded-xl border px-4 py-3">
          <p className="text-ehs-slate text8 leading-relaxed">
            Click a module to show or hide it in this role’s sidebar. Locked
            entries are always visible — every user needs them to reach their own
            account. Hiding a module is not access control on its own: the API
            still refuses anyone without the matching action rights.
          </p>
          <p className="text-ehs-muted-text mt-2 text8 leading-relaxed">
            A module also has to be licensed to the company, and admins see every
            module regardless of this list.
          </p>
        </div>

        {subPages.length > 0 ? (
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-darkest text5">Pages inside modules</h4>
              <span className="text-ehs-muted-text text7 tabular-nums">
                {subPages.filter((option) => selectedSet.has(option.id)).length}{" "}
                of {subPages.length} granted
              </span>
            </div>
            <p className="text-ehs-muted-text mb-2 text8">
              These gate routes within a module rather than the sidebar entry, so
              they do not change the rail on the left.
            </p>
            <div className="border-ehs-border-ink/10 max-h-72 overflow-y-auto rounded-xl border p-1.5">
              {subPages.map((option) => (
                <SubPageRow
                  key={option.id}
                  option={option}
                  granted={selectedSet.has(option.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
