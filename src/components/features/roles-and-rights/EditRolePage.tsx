"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader, PlaceholderPage } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  useAllPermissions,
  useAssignRolePermissions,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import type { RoleViewModel } from "@/lib/mappers/roles.mapper";
import { RightsSelector } from "./RightsSelector";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

type EditRolePageProps = Readonly<{
  roleId: string;
}>;

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-darkest/8 py-3 text5 last:border-b-0">
      <span className="text-gray">{label}</span>
      <span className="text-right font-semibold text-darkest">{value}</span>
    </div>
  );
}

function RoleSummaryCard({
  role,
  grantedCount,
}: Readonly<{ role: RoleViewModel; grantedCount: number }>) {
  return (
    <DetailCard title="Role Summary">
      <SummaryRow label="Users assigned" value={String(role.userCount)} />
      <SummaryRow
        label="Type"
        value={role.isSystem ? "System" : "Custom"}
      />
      <SummaryRow label="Rights" value={`${grantedCount} granted`} />
    </DetailCard>
  );
}

function EditRoleEditor({
  role,
  permissionsCatalog,
  permissionsLoading,
  permissionsError,
  permissionsLoadError,
  adminHref,
  basePath,
}: Readonly<{
  role: RoleViewModel;
  permissionsCatalog: ReturnType<typeof useAllPermissions>["data"];
  permissionsLoading: boolean;
  permissionsError: boolean;
  permissionsLoadError: Error | null;
  adminHref: string;
  basePath: string;
}>) {
  const router = useRouter();
  const assignPermissionsMutation = useAssignRolePermissions();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(
    () => role.permissionIds,
  );

  const handleSave = async () => {
    if (selectedPermissionIds.length === 0) {
      toast.error("Select at least one permission.");
      return;
    }

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: role.numericId,
        permissionIds: selectedPermissionIds,
      });
      toast.success("Role permissions saved.");
      router.push(basePath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save role.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title={`Role: ${role.name}`}
        description={role.description || "No description provided."}
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights", href: basePath },
          { label: role.name },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon="lucide:save"
            onClick={() => void handleSave()}
            disabled={
              assignPermissionsMutation.isPending ||
              permissionsLoading ||
              permissionsError
            }
          >
            {assignPermissionsMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DetailCard
          title="Rights"
          action={
            <span className="text5 text-gray">
              {selectedPermissionIds.length} granted
            </span>
          }
        >
          {permissionsLoading ? (
            <p className="text5 text-gray">Loading permissions…</p>
          ) : null}

          {permissionsError ? (
            <p className="text5 text-red">
              {permissionsLoadError?.message ?? "Failed to load permissions."}
            </p>
          ) : null}

          {!permissionsLoading && !permissionsError ? (
            <RightsSelector
              groups={permissionsCatalog?.groups ?? []}
              selectedIds={selectedPermissionIds}
              onChange={setSelectedPermissionIds}
              showHeader={false}
            />
          ) : null}
        </DetailCard>

        <RoleSummaryCard
          role={role}
          grantedCount={selectedPermissionIds.length}
        />
      </div>
    </div>
  );
}

export function EditRolePage({ roleId }: EditRolePageProps) {
  const { adminHref, basePath } = useRolesAndRightsPaths();
  // `isPending` (not `isLoading`) so a query still gated on the tenant scope
  // renders the loading state instead of falling through to "Role Not Found".
  const {
    data: roles = [],
    isPending: rolesLoading,
    isError: rolesError,
    error: rolesLoadError,
  } = useRolesWithPermissions();
  const {
    data: permissionsCatalog,
    isPending: permissionsLoading,
    isError: permissionsError,
    error: permissionsLoadError,
  } = useAllPermissions();

  const role = roles.find((entry) => entry.id === roleId);

  if (rolesLoading) {
    return (
      <PlaceholderPage
        title="Loading Role"
        description="Fetching role details from the API…"
      />
    );
  }

  if (rolesError) {
    return (
      <PlaceholderPage
        title="Failed to Load Role"
        description={
          rolesLoadError instanceof Error
            ? rolesLoadError.message
            : "Could not load role details."
        }
      />
    );
  }

  if (!role) {
    return (
      <PlaceholderPage
        title="Role Not Found"
        description={`No role exists with id "${roleId}".`}
      />
    );
  }

  if (role.isSystem) {
    return (
      <PlaceholderPage
        title="System Role"
        description="System roles cannot be edited."
      />
    );
  }

  return (
    <EditRoleEditor
      key={role.id}
      role={role}
      permissionsCatalog={permissionsCatalog}
      permissionsLoading={permissionsLoading}
      permissionsError={permissionsError}
      permissionsLoadError={
        permissionsLoadError instanceof Error ? permissionsLoadError : null
      }
      adminHref={adminHref}
      basePath={basePath}
    />
  );
}
