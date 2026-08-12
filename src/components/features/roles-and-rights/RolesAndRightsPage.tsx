"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layouts";
import { Button, ConfirmDialog } from "@/components/ui";
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
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function RolesAndRightsPage() {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  // `isPending` (not `isLoading`) so the query stays in its loading state while
  // it is still gated on the tenant scope resolving.
  const { data: roles = [], isPending, isError, error } =
    useRolesWithPermissions();
  const stats = getRoleStats(roles);

  const [pendingDelete, setPendingDelete] = useState<RoleViewModel | null>(null);
  const removeRole = useDeleteRole();

  return (
    <div className="flex flex-col gap-6 pb-4">
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

      <p className="rounded-xl border border-blue-normal/15 bg-blue-normal/5 px-4 py-3 text6 text-darkest/80">
        Roles apply company-wide across every site. Changing the site switcher
        does not change this list — a user keeps the same role wherever they
        work in the organization.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard value={stats.totalRoles} label="Total Roles" />
        <StatCard value={stats.totalUsersAssigned} label="Total Users Assigned" />
        <StatCard value={stats.customRoles} label="Custom Roles" />
      </div>

      {isPending ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading roles…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error ? error.message : "Failed to load roles."}
        </p>
      ) : null}

      {!isPending && !isError ? (
        <div className="flex flex-col gap-4">
          {roles.length === 0 ? (
            <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
              No roles found. Create the first role to get started.
            </p>
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
