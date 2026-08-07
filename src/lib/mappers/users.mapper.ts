import type { TableStatus } from "@/components/ui";
import type { SuperAdminUserResponse } from "@/dtos/res/users.res";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  /** Active site, for places that show a single one. */
  site: string;
  /** Every site the user is assigned to. */
  sites: string[];
  status: TableStatus;
};

/**
 * A user's site names. Falls back to the active site when `sites` is absent, so rows written
 * before the membership backfill still read as one site rather than none.
 */
export function readUserSiteNames(user: SuperAdminUserResponse): string[] {
  const assigned = (user.sites ?? [])
    .map((site) => site.siteName?.trim())
    .filter((name): name is string => Boolean(name));

  if (assigned.length > 0) {
    return assigned;
  }

  const active = user.siteName?.trim();
  return active ? [active] : [];
}

/** A user's site ids, same fallback as {@link readUserSiteNames}. */
export function readUserSiteIds(user: SuperAdminUserResponse): number[] {
  const assigned = (user.sites ?? [])
    .map((site) => site.id)
    .filter((id) => Number.isFinite(id));

  if (assigned.length > 0) {
    return assigned;
  }

  return user.siteId != null ? [user.siteId] : [];
}

export function formatRoleName(roleName: string): string {
  return roleName
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getUserInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export function mapApiStatusToTableStatus(
  status?: string,
  isDrop?: boolean,
): TableStatus {
  if (isDrop) return "suspended";

  const normalized = status?.trim().toLowerCase() ?? "";
  if (normalized === "pending") return "pending";
  if (normalized === "suspended") return "suspended";
  if (normalized === "inactive") return "inactive";
  return "active";
}

export function mapSuperAdminUserToListItem(
  user: SuperAdminUserResponse,
): UserListItem {
  const name = user.fullName?.trim() || user.email;

  return {
    id: String(user.id),
    name,
    email: user.email,
    initials: getUserInitials(name, user.email),
    role: formatRoleName(user.roleName),
    site: user.siteName?.trim() || "—",
    sites: readUserSiteNames(user),
    status: mapApiStatusToTableStatus(user.status, user.isDrop),
  };
}

export function mapSuperAdminUsersToListItems(
  users: SuperAdminUserResponse[],
): UserListItem[] {
  return users.map(mapSuperAdminUserToListItem);
}
