"use client";

import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { DUMMY_ROLES, getRoleStats } from "@/lib/dummy-roles";
import { RoleCard } from "./RoleCard";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

function StatCard({
  value,
  label,
}: Readonly<{ value: number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-xl backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function RolesAndRightsPage() {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  const stats = getRoleStats(DUMMY_ROLES);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard value={stats.totalRoles} label="Total Roles" />
        <StatCard value={stats.totalUsersAssigned} label="Total Users Assigned" />
        <StatCard value={stats.customRoles} label="Custom Roles" />
      </div>

      <div className="flex flex-col gap-4">
        {DUMMY_ROLES.map((role) => (
          <RoleCard key={role.id} role={role} basePath={basePath} />
        ))}
      </div>
    </div>
  );
}
