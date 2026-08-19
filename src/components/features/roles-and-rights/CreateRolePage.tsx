"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { FeatureErrorCard } from "@/components/features/shared";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextAreaInput, TextInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  useAllPermissions,
  useCreateRoleWithPermissions,
  useRolesWithPermissions,
} from "@/hooks/useRolesAndRights";
import {
  countSelectedByPermissionGroup,
  matchPermissionIdsByLabels,
} from "@/lib/mappers/roles.mapper";
import {
  DEFAULT_PRESET_ID,
  getPresetRightCount,
  getPresetRights,
  ROLE_PRESETS,
} from "@/lib/presets";
import { RightsSelector } from "./RightsSelector";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

export function CreateRolePage() {
  const router = useRouter();
  const { adminHref, basePath } = useRolesAndRightsPaths();
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    number[] | null
  >(null);
  const [showErrors, setShowErrors] = useState(false);

  // `isPending` (not `isLoading`) so the form stays disabled while the query is
  // still gated on the tenant scope resolving.
  const {
    data: permissionsCatalog,
    isPending: permissionsLoading,
    isError: permissionsError,
    error: permissionsLoadError,
    refetch: refetchPermissions,
  } = useAllPermissions();
  const { data: existingRoles = [] } = useRolesWithPermissions();
  const createRoleMutation = useCreateRoleWithPermissions();

  const permissionGroups = permissionsCatalog?.groups ?? [];
  const allPermissions = permissionsCatalog?.permissions ?? [];

  const presetDefaultIds = useMemo(
    () =>
      allPermissions.length > 0
        ? matchPermissionIdsByLabels(
            allPermissions,
            getPresetRights(DEFAULT_PRESET_ID),
          )
        : [],
    [allPermissions],
  );

  const resolvedSelectedIds = selectedPermissionIds ?? presetDefaultIds;

  const groupSummary = countSelectedByPermissionGroup(
    permissionGroups,
    resolvedSelectedIds,
  );

  const handlePresetSelect = (presetId: string) => {
    setActivePresetId(presetId);
    setSelectedPermissionIds(
      matchPermissionIdsByLabels(allPermissions, getPresetRights(presetId)),
    );
  };

  const handleCopyFromRole = (roleId: string) => {
    const role = existingRoles.find((entry) => entry.id === roleId);
    if (!role) return;
    setSelectedPermissionIds(role.permissionIds);
  };

  const trimmedName = roleName.trim();
  const duplicateName = existingRoles.some(
    (entry) => entry.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );

  // Derived during render and shown under the field, rather than fired at the
  // corner of the screen as a toast after the admin has already pressed Create.
  let nameError: string | undefined;
  if (showErrors && !trimmedName) {
    nameError = "Give the role a name — it is what appears in the user’s profile.";
  } else if (duplicateName) {
    nameError = "A role with this name already exists in this organization.";
  }

  let rightsError: string | undefined;
  if (showErrors && resolvedSelectedIds.length === 0) {
    rightsError =
      "Grant at least one right, otherwise anyone holding this role can see nothing.";
  }

  const isDirty =
    Boolean(roleName) ||
    Boolean(description) ||
    selectedPermissionIds !== null;

  const handleCreate = async () => {
    if (!trimmedName || duplicateName || resolvedSelectedIds.length === 0) {
      setShowErrors(true);
      return;
    }

    try {
      await createRoleMutation.mutateAsync({
        roleName: trimmedName,
        description: description.trim() || null,
        permissionIds: resolvedSelectedIds,
      });
      toast.success("Role created.");
      router.push(basePath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create role.",
      );
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title="Create New Role"
        description="Define a custom role with tailored rights"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights", href: basePath },
          { label: "New Role" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm" href={basePath}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:shield-plus"
              onClick={() => void handleCreate()}
              loading={createRoleMutation.isPending}
              loadingText="Creating…"
              disabled={
                createRoleMutation.isPending ||
                permissionsLoading ||
                permissionsError ||
                !isDirty
              }
            >
              Create Role
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <DetailCard
            title="Role Information"
            description="What this role is called and who it is for."
          >
            <div className="flex flex-col gap-4">
              <TextInput
                label="Role Name"
                placeholder="e.g. Environmental Compliance Officer"
                required
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                error={nameError}
                helperText="Shown wherever a user’s role appears. Roles apply company-wide."
              />
              <TextAreaInput
                label="Description"
                placeholder="Describe the responsibilities and scope of this role..."
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                helperText="Optional, but it is the only hint the next admin gets about why this role exists."
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Rights"
            description="Everything a holder of this role may see and do."
            action={
              <span className="text7 text-gray tabular-nums">
                {resolvedSelectedIds.length} granted
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
                role="status"
                aria-busy="true"
                aria-label="Loading permissions…"
                className="flex flex-col gap-3"
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
              <RightsSelector
                groups={permissionGroups}
                selectedIds={resolvedSelectedIds}
                onChange={setSelectedPermissionIds}
                showHeader={false}
              />
            ) : null}
          </DetailCard>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <DetailCard
            title="Start from Preset"
            description="Replaces the current selection with a template’s rights, which you can then edit."
          >
            <ul className="flex flex-col gap-2">
              {ROLE_PRESETS.map((preset) => {
                const active = preset.id === activePresetId;
                let itemClass =
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 disabled:cursor-not-allowed disabled:opacity-50";
                if (active) {
                  itemClass +=
                    " border-blue-normal bg-blue-normal/8 text-blue-normal";
                } else {
                  itemClass +=
                    " border-ehs-border-ink/10 bg-ehs-surface text-darkest hover:border-ehs-border-ink/20 hover:bg-ehs-border-ink/3";
                }

                return (
                  <li key={preset.id}>
                    <button
                      type="button"
                      className={itemClass}
                      onClick={() => handlePresetSelect(preset.id)}
                      aria-pressed={active}
                      disabled={permissionsLoading || permissionsError}
                    >
                      <span className="min-w-0 truncate text4 font-semibold">
                        {preset.name}
                      </span>
                      <span className="shrink-0 text7 text-gray">
                        {getPresetRightCount(preset.id)} rights
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </DetailCard>

          {existingRoles.length > 0 ? (
            <DetailCard
              title="Copy from Role"
              description="Replaces the current selection with an existing role’s rights. The two roles do not stay linked afterwards."
            >
              <ul className="flex flex-col gap-2">
                {existingRoles.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-ehs-border-ink/10 bg-ehs-surface px-3.5 py-3 text-left outline-none transition-colors hover:border-ehs-border-ink/20 hover:bg-ehs-border-ink/3 focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40"
                      onClick={() => handleCopyFromRole(role.id)}
                    >
                      <span className="min-w-0 truncate text4 font-semibold text-darkest">
                        {role.name}
                      </span>
                      <span className="shrink-0 text7 text-gray">
                        {role.permissionIds.length} rights
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </DetailCard>
          ) : null}

          <DetailCard title="Summary">
            {/* Live, because it is the running total of everything ticked in
                the matrix on the left and it changes under the reader. */}
            <p className="text2 text-darkest" aria-live="polite">
              {resolvedSelectedIds.length}{" "}
              <span className="text4 font-normal text-gray">rights selected</span>
            </p>
            <div className="mt-4 flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {groupSummary
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <div
                    key={entry.group}
                    className="flex items-center justify-between gap-3 rounded-lg bg-ehs-border-ink/6 px-2.5 py-1.5 text8 text-darkest"
                  >
                    <span className="min-w-0 truncate">{entry.group}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {entry.count}
                    </span>
                  </div>
                ))}
              {groupSummary.every((entry) => entry.count === 0) ? (
                <p className="text8 text-gray">No rights selected yet.</p>
              ) : null}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
