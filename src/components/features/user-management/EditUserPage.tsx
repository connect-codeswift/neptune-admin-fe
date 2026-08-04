"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { TextInput, SelectInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ConfirmDialog,
  TableStatusBadge,
} from "@/components/ui";
import { getDummyUser } from "@/lib/dummy-users";
import {
  USER_DEPARTMENT_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_SITE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "./user-management-form.constants";
import { useUserManagementPaths } from "./useUserManagementPaths";

export function EditUserPage({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const user = getDummyUser(userId) ?? getDummyUser("1")!;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const detailHref = `${basePath}/${user.id}`;

  const handleDelete = () => {
    toast.success(`${user.name}'s account deleted.`);
    setDeleteOpen(false);
    router.push(basePath);
  };

  return (
    <>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete User Account"
        description={
          <>
            Are you sure you want to permanently delete{" "}
            <strong>{user.name}&apos;s</strong> account? This action cannot be
            undone. All associated data, activity logs, and permissions will be
            removed.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Delete Account"
        confirmVariant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-6 pb-4">
        <PageHeader
          title={`Edit: ${user.name}`}
          description="Update user information, roles, and account settings."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
            { label: user.name, href: detailHref },
            { label: "Edit" },
          ]}
          actions={
            <>
              <Button variant="secondary" size="sm" href={detailHref}>
                Cancel
              </Button>
              <Button
                size="sm"
                leftIcon="lucide:check"
                onClick={() => toast.success("User updated.")}
              >
                Save Changes
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DetailCard title="Edit Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Full Name" defaultValue={user.name} />
              <TextInput label="Email" defaultValue={user.email} />
              <SelectInput
                label="Role"
                options={USER_ROLE_OPTIONS}
                value={
                  USER_ROLE_OPTIONS.find((option) => option.label === user.role)
                    ?.value ?? "employee"
                }
              />
              <SelectInput
                label="Department"
                options={USER_DEPARTMENT_OPTIONS}
                value={
                  USER_DEPARTMENT_OPTIONS.find(
                    (option) => option.label === user.department,
                  )?.value ?? "safety"
                }
              />
              <SelectInput
                label="Site"
                options={USER_SITE_OPTIONS}
                value={
                  USER_SITE_OPTIONS.find((option) => option.label === user.site)
                    ?.value ?? "hq"
                }
              />
              <SelectInput
                label="Status"
                options={USER_STATUS_OPTIONS}
                value={user.status}
              />
            </div>
          </DetailCard>

          <DetailCard title="Account Summary">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-normal text4 text-white"
                  aria-hidden
                >
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="text4 text-darkest">{user.name}</p>
                  <div className="mt-1">
                    <TableStatusBadge status={user.status} />
                  </div>
                </div>
              </div>

              <dl className="flex flex-col gap-3 border-t border-darkest/8 pt-4">
                {[
                  ["Member since", "Jan 15, 2023"],
                  ["Total logins", "224"],
                  ["Last password change", "63 days ago"],
                  ["2FA enabled", "Yes"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="text6 text-gray">{label}</dt>
                    <dd className="text6 text-darkest">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </DetailCard>
        </div>

        <DetailCard
          title="Danger Zone"
          className="border-red/20"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="danger"
              leftIcon="lucide:trash-2"
              onClick={() => setDeleteOpen(true)}
            >
              Delete User Account
            </Button>
            <Button
              variant="secondary"
              leftIcon="lucide:lock"
              onClick={() => toast.success("Password reset email sent.")}
            >
              Force Password Reset
            </Button>
          </div>
        </DetailCard>
      </div>
    </>
  );
}
