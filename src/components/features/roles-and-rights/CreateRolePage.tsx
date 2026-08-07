"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
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

  const {
    data: permissionsCatalog,
    isLoading: permissionsLoading,
    isError: permissionsError,
    error: permissionsLoadError,
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

  const handleCreate = async () => {
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      toast.error("Role name is required.");
      return;
    }

    if (resolvedSelectedIds.length === 0) {
      toast.error("Select at least one permission.");
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
    <div className="flex flex-col gap-6 pb-4">
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
              disabled={
                createRoleMutation.isPending ||
                permissionsLoading ||
                permissionsError
              }
            >
              {createRoleMutation.isPending ? "Creating…" : "Create Role"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <DetailCard title="Role Information">
            <div className="flex flex-col gap-4">
              <TextInput
                label="Role Name"
                placeholder="e.g. Environmental Compliance Officer"
                required
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
              />
              <TextAreaInput
                label="Description"
                placeholder="Describe the responsibilities and scope of this role..."
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Rights"
            action={
              <span className="text5 text-gray">
                {resolvedSelectedIds.length} granted
              </span>
            }
          >
            {permissionsLoading ? (
              <p className="text5 text-gray">Loading permissions…</p>
            ) : null}

            {permissionsError ? (
              <p className="text5 text-red">
                {permissionsLoadError instanceof Error
                  ? permissionsLoadError.message
                  : "Failed to load permissions."}
              </p>
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

        <div className="flex flex-col gap-6">
          <DetailCard
            title="Start from Preset"
            description="Copy rights from a template, then customize"
          >
            <ul className="flex flex-col gap-2">
              {ROLE_PRESETS.map((preset) => {
                const active = preset.id === activePresetId;
                let itemClass =
                  "flex w-full cursor-pointer items-center justify-between rounded-[10px] border px-3.5 py-3 text-left transition-colors";
                if (active) {
                  itemClass +=
                    " border-blue-normal bg-blue-normal/8 text-blue-normal";
                } else {
                  itemClass +=
                    " border-darkest/10 bg-white text-darkest hover:border-darkest/20 hover:bg-darkest/3";
                }

                return (
                  <li key={preset.id}>
                    <button
                      type="button"
                      className={itemClass}
                      onClick={() => handlePresetSelect(preset.id)}
                      disabled={permissionsLoading || permissionsError}
                    >
                      <span className="text5 font-semibold">{preset.name}</span>
                      <span className="text6 text-gray">
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
              description="Mirror permissions from an existing role"
            >
              <ul className="flex flex-col gap-2">
                {existingRoles.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-[10px] border border-darkest/10 bg-white px-3.5 py-3 text-left transition-colors hover:border-darkest/20 hover:bg-darkest/3"
                      onClick={() => handleCopyFromRole(role.id)}
                    >
                      <span className="text5 font-semibold text-darkest">
                        {role.name}
                      </span>
                      <span className="text6 text-gray">
                        {role.permissionIds.length} rights
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </DetailCard>
          ) : null}

          <DetailCard title="Summary">
            <p className="text2 text-darkest">
              {resolvedSelectedIds.length}{" "}
              <span className="text4 font-normal text-gray">rights selected</span>
            </p>
            <div className="mt-4 flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {groupSummary
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <div
                    key={entry.group}
                    className="flex items-center justify-between gap-3 rounded-lg bg-darkest/6 px-2.5 py-1.5 text6 text-darkest"
                  >
                    <span className="truncate">{entry.group}</span>
                    <span className="shrink-0 font-semibold">{entry.count}</span>
                  </div>
                ))}
              {groupSummary.every((entry) => entry.count === 0) ? (
                <p className="text6 text-gray">No rights selected yet.</p>
              ) : null}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
