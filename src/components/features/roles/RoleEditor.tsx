"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { TextInput, TextAreaInput, ToggleBadges } from "@/components/inputs";
import {
  createRole,
  getPermissions,
  getRolesWithPermissions,
  updateRolePermissions,
} from "@/services";
import {
  actionOptionsByCategory,
  moduleOptions,
  pruneOrphanedActions,
  type PermissionDto,
  type RoleWithPermissionsDto,
} from "./role-permissions";

type Props = Readonly<{
  /** Omitted when creating. */
  roleId?: number;
}>;

function unwrap<T>(res: unknown): T[] {
  const model = (res as { dataModel?: unknown })?.dataModel;
  return Array.isArray(model) ? (model as T[]) : [];
}

export function RoleEditor({ roleId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = typeof roleId === "number";

  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles-with-permissions"],
    queryFn: getRolesWithPermissions,
    enabled: isEdit,
  });

  const allPermissions = useMemo(
    () => unwrap<PermissionDto>(permissionsQuery.data),
    [permissionsQuery.data],
  );

  const role = useMemo(
    () =>
      unwrap<RoleWithPermissionsDto>(rolesQuery.data).find((r) => r.id === roleId),
    [rolesQuery.data, roleId],
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[] | null>(null);

  // Seed from the loaded role once, then leave the user's edits alone.
  const current =
    selected ?? role?.permissions.map((p) => String(p.id)) ?? [];
  const displayName = isEdit ? (role?.roleName ?? "") : name;

  const modules = useMemo(() => moduleOptions(allPermissions), [allPermissions]);
  const actionGroups = useMemo(
    () => actionOptionsByCategory(allPermissions),
    [allPermissions],
  );

  const setPermissions = (next: string[]) =>
    setSelected(pruneOrphanedActions(next, allPermissions));

  const save = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        return updateRolePermissions(roleId, {
          permissionIds: current.map(Number),
        });
      }
      const created = await createRole({
        roleName: name.trim(),
        description: description.trim() || null,
      });
      const newId = (created as { dataModel?: { id?: number } })?.dataModel?.id;
      if (typeof newId === "number") {
        await updateRolePermissions(newId, {
          permissionIds: current.map(Number),
        });
      }
      return created;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      await queryClient.invalidateQueries({ queryKey: ["roles-with-permissions"] });
      router.push("../");
    },
  });

  if (permissionsQuery.isLoading || (isEdit && rolesQuery.isLoading)) {
    return <p className="text-sm text-slate-500">Loading permissions…</p>;
  }

  const moduleIds = new Set(modules.map((m) => m.value));
  const selectedModules = current.filter((id) => moduleIds.has(id));

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <section className="flex flex-col gap-4">
        <TextInput
          label="Role name"
          value={displayName}
          disabled={isEdit}
          onChange={(e) => setName(e.target.value)}
          required={!isEdit}
          helperText={
            isEdit
              ? "The name is what every access check matches on, so it cannot be changed here."
              : undefined
          }
        />
        {!isEdit && (
          <TextAreaInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </section>

      {/*
        Visibility and capability are the same grant: a module appears in the app when the
        role can read it. Splitting them into two sections is a presentation choice, not two
        sets of data — both write into the one permissionIds array.
      */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Modules this role can see
          </h2>
          <p className="text-sm text-slate-500">
            Choose what appears in the app for anyone with this role. A module is shown when
            it is both licensed to the company and selected here.
          </p>
        </div>
        <ToggleBadges
          variant="card"
          options={modules}
          value={selectedModules}
          countMode="selected"
          onChange={(next) =>
            setPermissions([
              ...next,
              ...current.filter((id) => !moduleIds.has(id)),
            ])
          }
        />
      </section>

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            What this role can do
          </h2>
          <p className="text-sm text-slate-500">
            Actions within each module. Turning a module off above removes its actions too.
          </p>
        </div>

        {actionGroups.map(({ category, options }) => {
          const ids = new Set(options.map((o) => o.value));
          return (
            <ToggleBadges
              key={category}
              label={category}
              options={options}
              value={current.filter((id) => ids.has(id))}
              onChange={(next) =>
                setPermissions([
                  ...next,
                  ...current.filter((id) => !ids.has(id)),
                ])
              }
            />
          );
        })}
      </section>

      {save.isError && (
        <p className="text-sm text-red-600">
          Could not save this role. Check the name is not already in use and try again.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={save.isPending || (!isEdit && !name.trim())}>
          {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create role"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("../")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
