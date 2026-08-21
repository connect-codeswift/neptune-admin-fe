"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  useAllPermissions,
  useAssignRolePermissions,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import type { RoleViewModel } from "@/lib/mappers/roles.mapper";
import { RightsSelector } from "./RightsSelector";
import { RoleSummaryCard } from "./RoleSummaryCard";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

type EditRolePageProps = Readonly<{
  roleId: string;
}>;

/**
 * Copy-on-write, explained before the save that triggers it. A preset is one
 * definition shared by every company; the backend answers the first edit by
 * taking a private copy for this company and moving its users onto it — same
 * name, so every role gate behaves identically. Other companies keep the
 * original. The card that used to sit here said presets could not be edited
 * at all, which stopped being true when the backend learned to clone them.
 */
function SystemRoleNotice({ roleName }: Readonly<{ roleName: string }>) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-blue-normal/15 bg-blue-normal/5 px-4 py-3">
      <Icon
        icon="mdi:content-copy"
        className="mt-0.5 size-4 shrink-0 text-blue-normal"
        aria-hidden="true"
      />
      <p className="min-w-0 text8 leading-relaxed text-ehs-slate">
        {`${roleName} is a shared preset. Saving your changes gives this company its own copy of the role — holders keep the name and pick up the new rights at their next sign-in, while other companies keep the original preset.`}
      </p>
    </div>
  );
}

function EditRoleEditor({
  role,
  permissionsCatalog,
  permissionsLoading,
  permissionsError,
  permissionsLoadError,
  onRetryPermissions,
  adminHref,
  basePath,
}: Readonly<{
  role: RoleViewModel;
  permissionsCatalog: ReturnType<typeof useAllPermissions>["data"];
  permissionsLoading: boolean;
  permissionsError: boolean;
  permissionsLoadError: Error | null;
  onRetryPermissions: () => void;
  adminHref: string;
  basePath: string;
}>) {
  const router = useRouter();
  const assignPermissionsMutation = useAssignRolePermissions();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(
    () => role.permissionIds,
  );
  const [showErrors, setShowErrors] = useState(false);

  // Set comparison, not array equality: ticking a right and unticking it again
  // leaves the same grant in a different order, and that is not an edit.
  const savedIds = new Set(role.permissionIds);
  const isDirty =
    selectedPermissionIds.length !== role.permissionIds.length ||
    selectedPermissionIds.some((id) => !savedIds.has(id));

  let rightsError: string | undefined;
  if (showErrors && selectedPermissionIds.length === 0) {
    rightsError =
      "Grant at least one right, otherwise everyone holding this role loses access.";
  }

  const handleSave = async () => {
    if (selectedPermissionIds.length === 0) {
      setShowErrors(true);
      return;
    }

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: role.numericId,
        permissionIds: selectedPermissionIds,
      });
      toast.success(
        role.isSystem
          ? `Saved. This company now has its own copy of ${role.name}.`
          : "Role permissions saved.",
      );
      router.push(basePath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save role.",
      );
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title={`Role: ${role.name}`}
        description={
          role.isSystem
            ? `Shared preset · ${role.description || "No description provided."}`
            : role.description || "No description provided."
        }
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights", href: basePath },
          { label: role.name },
        ]}
        actions={
          <>
            {/* There was no way off this page but the browser's back button. */}
            <Button variant="secondary" size="sm" href={basePath}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:save"
              onClick={() => void handleSave()}
              loading={assignPermissionsMutation.isPending}
              loadingText="Saving…"
              disabled={
                assignPermissionsMutation.isPending ||
                permissionsLoading ||
                permissionsError ||
                !isDirty
              }
            >
              Save Changes
            </Button>
          </>
        }
      />

      {role.isSystem ? <SystemRoleNotice roleName={role.name} /> : null}

      {isDirty ? (
        <p className="text8 text-ehs-muted-text" role="status">
          You have unsaved changes to this role’s rights.
        </p>
      ) : null}

      {/* Both children are GlassCards, so `stagger-cards` lands on the
          animated element and the summary follows the matrix in. */}
      <div className="stagger-cards grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DetailCard
          title="Rights"
          description="Everything a holder of this role may see and do."
          action={
            <span className="text7 text-gray tabular-nums">
              {selectedPermissionIds.length} granted
            </span>
          }
        >
          {rightsError ? (
            <p className="mb-3 text8 text-ehs-red" role="alert">
              {rightsError}
            </p>
          ) : null}

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
                permissionsLoadError?.message ?? "Failed to load permissions."
              }
              onRetry={onRetryPermissions}
            />
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
          title="Edit Role"
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
          title="Edit Role"
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

  // Absent, and present-but-uneditable, are both dead ends rather than
  // failures — neither offers a retry, and both say why.
  if (!role) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Edit Role"
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

  // System presets are editable too: the backend answers the first edit with a
  // private per-company copy (copy-on-write), so the old "system roles cannot
  // be edited" dead end no longer reflects the contract. SystemRoleNotice in
  // the editor is where that behaviour is explained to the admin.
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
      onRetryPermissions={() => {
        void refetchPermissions();
      }}
      adminHref={adminHref}
      basePath={basePath}
    />
  );
}
