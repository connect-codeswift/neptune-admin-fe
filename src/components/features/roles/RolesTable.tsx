"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { Button, ConfirmDialog, Table, TextButton } from "@/components/ui";
import { deleteRole, getRolesWithPermissions } from "@/services";
import type { RoleWithPermissionsDto } from "./role-permissions";

function unwrap(res: unknown): RoleWithPermissionsDto[] {
  const model = (res as { dataModel?: unknown })?.dataModel;
  return Array.isArray(model) ? (model as RoleWithPermissionsDto[]) : [];
}

/** Ehs_Director owns the company and is the only tenant role on this portal. */
const UNDELETABLE = "Ehs_Director";

export function RolesTable() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<RoleWithPermissionsDto | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["roles-with-permissions"],
    queryFn: getRolesWithPermissions,
  });

  const roles = useMemo(() => unwrap(rolesQuery.data), [rolesQuery.data]);

  const remove = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles-with-permissions"] });
      setPending(null);
    },
  });

  return (
    <>
      <Table
        data={roles}
        getRowId={(r) => String(r.id)}
        emptyMessage="No roles yet."
        columns={[
          {
            id: "role",
            header: "Role",
            cell: (r) => (
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{r.roleName}</span>
                {r.description && (
                  <span className="text-xs text-slate-500">{r.description}</span>
                )}
              </div>
            ),
          },
          {
            id: "type",
            header: "Type",
            // A preset is shared by every company until this one edits it, at which point the
            // backend hands over a private copy and this flips to Custom.
            cell: (r) => (r.isSystem ? "Preset" : "Custom"),
          },
          { id: "permissions", header: "Permissions", cell: (r) => r.permissions.length },
          { id: "users", header: "Users", cell: (r) => r.usersAssigned },
          {
            id: "actions",
            header: "Actions",
            srOnlyHeader: true,
            cell: (r) => (
              <div className="flex justify-end gap-3">
                <TextButton href={`./roles-and-rights/${r.id}/edit`}>Edit</TextButton>
                <TextButton
                  variant="danger"
                  // A preset is one row shared by every company, so the backend refuses to
                  // delete it — and Ehs_Director is refused even as a company's own copy.
                  disabled={r.roleName === UNDELETABLE || r.isSystem}
                  onClick={() => setPending(r)}
                >
                  Delete
                </TextButton>
              </div>
            ),
          },
        ]}
      />

      <div className="mt-6">
        <Link href="./roles-and-rights/new">
          <Button>New role</Button>
        </Link>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.roleName ?? "role"}?`}
        // Say the consequence rather than asking "are you sure": these people keep their
        // accounts but can do nothing at all until someone gives them another role.
        description={
          pending && pending.usersAssigned > 0
            ? `${pending.usersAssigned} user(s) will be moved to No_Permission and will have no access until you assign them a new role.`
            : "This role has no users assigned. It will be removed permanently."
        }
        confirmLabel="Delete role"
        confirmVariant="danger"
        loading={remove.isPending}
        onConfirm={() => pending && remove.mutate(pending.id)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
