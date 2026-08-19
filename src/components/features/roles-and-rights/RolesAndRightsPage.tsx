"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button, ConfirmDialog } from "@/components/ui";
import { GLASS_SURFACE, GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useDeleteRole,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import { getRoleStats, type RoleViewModel } from "@/lib/mappers/roles.mapper";
import { RoleCard } from "./RoleCard";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <GlassCard className="min-h-24 justify-center px-5 py-4">
      {/* One wrapper child so GlassCard's own `gap` never separates the value
          from its label — the 4px `mt-1` below is the intended spacing. */}
      <div className="min-w-0">
        {/* text2 is the KPI role and carries tabular-nums, so this matches the
            stat row on User Management figure for figure. */}
        <p className="text2 text-darkest">{value}</p>
        <p className="mt-1 text8 text-gray">{label}</p>
      </div>
    </GlassCard>
  );
}

/**
 * Placeholder shaped like a RoleCard: title line, description line, a run of
 * permission chips and the action squares on the right. A stack of even grey
 * bars would collapse into the real cards and shift the page.
 */
function RoleListSkeleton() {
  const cards = Array.from({ length: 3 }, (_, index) => `role-${String(index)}`);
  const chips = ["a", "b", "c", "d"];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading roles…"
      className="flex flex-col gap-4"
    >
      {cards.map((key) => (
        <div key={key} className={`${GLASS_SURFACE} px-5 py-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-48 rounded-md bg-ehs-skeleton-strong" />
              <Skeleton className="h-3.5 w-full max-w-lg rounded-md" />
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <Skeleton
                    key={`${key}-${chip}`}
                    className="h-5 w-24 rounded-md"
                  />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="size-8 rounded-2.5" />
              <Skeleton className="size-8 rounded-2.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RolesAndRightsPage() {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  // `isPending` (not `isLoading`) so the query stays in its loading state while
  // it is still gated on the tenant scope resolving.
  const { data: roles = [], isPending, isError, error, refetch } =
    useRolesWithPermissions();
  const stats = getRoleStats(roles);

  const [pendingDelete, setPendingDelete] = useState<RoleViewModel | null>(null);
  const removeRole = useDeleteRole();

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title="Roles & Rights"
        description="Manage role definitions and rights sets for the platform"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights" },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon="lucide:plus"
            href={`${basePath}/new`}
          >
            Create Role
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-normal/15 bg-blue-normal/5 px-4 py-3">
        <Icon
          icon="mdi:information-outline"
          className="mt-0.5 size-4 shrink-0 text-blue-normal"
          aria-hidden="true"
        />
        <p className="min-w-0 text8 leading-relaxed text-ehs-slate">
          Roles apply company-wide across every site. Changing the site switcher
          does not change this list — a user keeps the same role wherever they
          work in the organization.
        </p>
      </div>

      {isPending ? (
        <FeatureLoadingGrid
          count={3}
          label="Loading role statistics…"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        />
      ) : (
        <div className="stagger-cards grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard value={stats.totalRoles} label="Total Roles" />
          <StatCard
            value={stats.totalUsersAssigned}
            label="Total Users Assigned"
          />
          <StatCard value={stats.customRoles} label="Custom Roles" />
        </div>
      )}

      {isPending ? <RoleListSkeleton /> : null}

      {isError ? (
        <FeatureErrorCard
          title="Couldn’t load roles"
          message={
            error instanceof Error ? error.message : "Failed to load roles."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError ? (
        <div className="stagger-cards flex flex-col gap-4">
          {roles.length === 0 ? (
            <FeatureEmptyState
              icon="lucide:shield-off"
              title="No roles yet"
              description="A role is a named set of rights. Until one exists, nobody in this organization can be given access to anything."
              action={
                <Button
                  size="sm"
                  leftIcon="lucide:plus"
                  href={`${basePath}/new`}
                >
                  Create your first role
                </Button>
              }
            />
          ) : (
            roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                basePath={basePath}
                onDelete={setPendingDelete}
              />
            ))
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "role"}?`}
        // State the consequence rather than asking "are you sure": these people keep
        // their accounts and can do nothing at all until someone assigns them a role.
        description={
          pendingDelete && pendingDelete.userCount > 0
            ? `${pendingDelete.userCount} user${pendingDelete.userCount === 1 ? "" : "s"} will be moved to No_Permission and will have no access until you assign them a new role.`
            : "This role has no users assigned. It will be removed permanently."
        }
        confirmLabel="Delete role"
        confirmVariant="danger"
        loading={removeRole.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            removeRole.mutate(pendingDelete.numericId, {
              onSuccess: () => setPendingDelete(null),
            });
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
