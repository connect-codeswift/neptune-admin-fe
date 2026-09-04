"use client";

import {
  GlassCard,
  TableRoleBadge,
  TableRowActions,
  TableStatusBadge,
  TableUserCell,
} from "@/components/ui";
import type { UserListItem } from "@/lib/mappers/users.mapper";

export type UserCardProps = Readonly<{
  user: UserListItem;
  /** Route base for the view/edit links, e.g. `/acme/1/users`. */
  basePath: string;
  onView: (user: UserListItem) => void;
  onEdit: (user: UserListItem) => void;
}>;

/**
 * Grid-view counterpart to a row of the users table.
 *
 * It reuses `TableUserCell`, `TableRoleBadge`, `TableStatusBadge` and
 * `TableRowActions` rather than restyling any of them, so switching view
 * changes the layout and nothing else — the same avatar, the same badge
 * colours, the same two actions with the same labels and hrefs.
 */
export function UserCard({ user, basePath, onView, onEdit }: UserCardProps) {
  const siteNames = user.sites.join(", ");

  return (
    // `h-full` with the `mt-auto` footer keeps a row of cards level when one
    // user is on eight sites and their neighbour is on one.
    <GlassCard className="h-full p-4">
      <div className="flex h-full min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0" title={`${user.name} · ${user.email}`}>
            <TableUserCell
              name={user.name}
              email={user.email}
              initials={user.initials}
            />
          </div>

          <TableRowActions
            viewHref={`${basePath}/${user.id}`}
            editHref={`${basePath}/${user.id}/edit`}
            viewLabel={`View ${user.name}`}
            editLabel={`Edit ${user.name}`}
            onView={() => onView(user)}
            onEdit={() => onEdit(user)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TableRoleBadge>{user.role}</TableRoleBadge>
          <TableStatusBadge status={user.status} />
        </div>

        <div className="border-ehs-border-ink/8 mt-auto border-t pt-2.5">
          <p className="text6 text-ehs-muted-text">Sites</p>
          {/* Same `title` fallback the table cell uses: the full list is only
              readable on hover once it is truncated. */}
          <p
            className="text8 text-ehs-gray mt-0.5 line-clamp-2"
            title={siteNames || undefined}
          >
            {siteNames || "—"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
