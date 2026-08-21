"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { SearchInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useAllPermissions,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import {
  filterPermissionGroups,
  sortPermissionGroupsForDisplay,
  type PermissionGroup,
  type PermissionOption,
  type RoleViewModel,
} from "@/lib/mappers/roles.mapper";
import { RoleSummaryCard } from "./RoleSummaryCard";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

type RoleDetailPageProps = Readonly<{
  roleId: string;
}>;

function GrantedRightChip({ option }: Readonly<{ option: PermissionOption }>) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-ehs-border-ink/6 px-2 py-1 font-mono text8 text-darkest"
      title={
        option.locked ? `${option.label} — always granted` : option.label
      }
    >
      {option.locked ? (
        <Icon
          icon="lucide:lock"
          width={12}
          height={12}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0 truncate">{option.label}</span>
    </span>
  );
}

function GrantedRightsGroup({
  group,
  totalInGroup,
}: Readonly<{ group: PermissionGroup; totalInGroup: number }>) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text5 text-darkest">{group.group}</h3>
        <span className="shrink-0 text7 text-ehs-muted-text tabular-nums">
          {group.permissions.length} of {totalInGroup}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.permissions.map((option) => (
          <GrantedRightChip key={option.id} option={option} />
        ))}
      </div>
    </section>
  );
}

function GrantedRights({
  role,
  groups,
  editHref,
}: Readonly<{
  role: RoleViewModel;
  groups: PermissionGroup[];
  editHref: string;
}>) {
  const [query, setQuery] = useState("");

  if (role.permissionIds.length === 0) {
    return (
      <FeatureEmptyState
        icon="mdi:shield-off-outline"
        title="No rights granted"
        description="This role grants no access at all — anyone holding it can sign in but do nothing. Grant rights to make it usable."
        action={
          <Button size="sm" leftIcon="lucide:pencil" href={editHref}>
            Edit Permissions
          </Button>
        }
      />
    );
  }

  // Catalog totals per group, so each section can say "3 of 14" against the
  // filtered granted-only view below.
  const totalsByGroup = new Map(
    groups.map((group) => [group.group, group.permissions.length]),
  );

  const grantedGroups = sortPermissionGroupsForDisplay(
    filterPermissionGroups(groups, {
      query,
      selectedOnly: true,
      selectedIds: role.permissionIds,
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search granted rights…"
        aria-label="Search granted rights"
        containerClassName="max-w-80"
      />

      {grantedGroups.length === 0 ? (
        <p className="text8 text-ehs-muted-text" role="status">
          {`No granted rights match “${query.trim()}”.`}
        </p>
      ) : (
        grantedGroups.map((group) => (
          <GrantedRightsGroup
            key={group.group}
            group={group}
            totalInGroup={totalsByGroup.get(group.group) ?? group.permissions.length}
          />
        ))
      )}
    </div>
  );
}

/**
 * Read-only view of one role: who holds it, and everything it grants, grouped
 * the same way the editor groups them so the two screens mirror each other.
 * Replaces the "This screen is being built" placeholder the eye icon used to
 * land on.
 */
export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  // `isPending` (not `isLoading`) so a query still gated on the tenant scope
  // renders the loading state instead of falling through to "Role Not Found".
  const {
    data: roles = [],
    isPending: rolesLoading,
    isError: rolesError,
    error: rolesLoadError,
    refetch: refetchRoles,
  } = useRolesWithPermissions();
  const {
    data: permissionsCatalog,
    isPending: permissionsLoading,
    isError: permissionsError,
    error: permissionsLoadError,
    refetch: refetchPermissions,
  } = useAllPermissions();

  const role = roles.find((entry) => entry.id === roleId);

  const deadEndCrumbs = [
    { label: "Admin", href: adminHref },
    { label: "Roles & Rights", href: basePath },
  ];

  if (rolesLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Role Details"
          description="Loading role details…"
          breadcrumbs={deadEndCrumbs}
        />
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <FeatureLoadingCard rows={6} label="Loading role details…" />
          <FeatureLoadingCard rows={3} label="Loading role summary…" />
        </div>
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Role Details"
          description="This role could not be loaded."
          breadcrumbs={deadEndCrumbs}
        />
        <FeatureErrorCard
          title="Couldn’t load this role"
          message={
            rolesLoadError instanceof Error
              ? rolesLoadError.message
              : "Could not load role details."
          }
          onRetry={() => {
            void refetchRoles();
          }}
        />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Role Details"
          description="This role could not be found."
          breadcrumbs={deadEndCrumbs}
        />
        <FeatureEmptyState
          icon="mdi:shield-search-outline"
          title="Role not found"
          description={`No role exists with id “${roleId}”. It may have been deleted, or the link that brought you here is out of date — retrying will not bring it back.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:arrow-left"
              href={basePath}
            >
              Back to Roles & Rights
            </Button>
          }
        />
      </div>
    );
  }

  const editHref = `${basePath}/${role.id}/edit`;

  let roleDescription = role.description || "No description provided.";
  if (role.isSystem) {
    roleDescription = `Shared preset · ${roleDescription}`;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title={`Role: ${role.name}`}
        description={roleDescription}
        breadcrumbs={[...deadEndCrumbs, { label: role.name }]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:arrow-left"
              href={basePath}
            >
              Back
            </Button>
            <Button size="sm" leftIcon="lucide:pencil" href={editHref}>
              Edit Permissions
            </Button>
          </>
        }
      />

      <div className="stagger-cards grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DetailCard
          title="Rights"
          description="Everything a holder of this role may see and do."
          action={
            <span className="text7 text-gray tabular-nums">
              {role.permissionIds.length} granted
            </span>
          }
        >
          {permissionsLoading ? (
            <div
              className="flex flex-col gap-3"
              role="status"
              aria-busy="true"
              aria-label="Loading permissions…"
            >
              <Skeleton className="h-4 w-40 rounded-md bg-ehs-skeleton-strong" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>
          ) : null}

          {permissionsError ? (
            <FeatureErrorCard
              surface={false}
              title="Couldn’t load permissions"
              message={
                permissionsLoadError instanceof Error
                  ? permissionsLoadError.message
                  : "Failed to load permissions."
              }
              onRetry={() => {
                void refetchPermissions();
              }}
            />
          ) : null}

          {!permissionsLoading && !permissionsError ? (
            <GrantedRights
              role={role}
              groups={permissionsCatalog?.groups ?? []}
              editHref={editHref}
            />
          ) : null}
        </DetailCard>

        <RoleSummaryCard role={role} grantedCount={role.permissionIds.length} />
      </div>
    </div>
  );
}
