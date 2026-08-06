"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PhoneInput, SelectInput, TextInput } from "@/components/inputs";
import { PageHeader, PlaceholderPage } from "@/components/layouts";
import {
  Button,
  ConfirmDialog,
  TableStatusBadge,
} from "@/components/ui";
import {
  useSuperAdminUserDetail,
  useUpdateSuperAdminUser,
  useUpdateSuperAdminUserStatus,
} from "@/hooks/useSuperAdminUserMutations";
import { useUserFormOptions } from "@/hooks/useUserFormOptions";
import { GENDER_OPTIONS } from "@/lib/gender-options";
import {
  formatRoleName,
  getUserInitials,
  mapApiStatusToTableStatus,
} from "@/lib/mappers/users.mapper";
import { useUserManagementPaths } from "./useUserManagementPaths";

export function EditUserPage({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const { data: user, isLoading, isError, error } = useSuperAdminUserDetail(userId);
  const updateMutation = useUpdateSuperAdminUser(userId);
  const statusMutation = useUpdateSuperAdminUserStatus(userId);
  const { roleOptions, siteOptions, rolesLoading } = useUserFormOptions();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [roleId, setRoleId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName?.trim() ?? "");
    setGender(user.gender?.trim() ?? "");
    setContactNo(user.contactNo?.trim() ?? "");
    setRoleId(String(user.roleId));
    setSiteId(user.siteId != null ? String(user.siteId) : "");
  }, [user]);

  if (isLoading) {
    return (
      <PlaceholderPage
        title="Loading User"
        description="Fetching user details from the API…"
      />
    );
  }

  if (isError || !user) {
    return (
      <PlaceholderPage
        title="User Not Found"
        description={
          error instanceof Error ? error.message : "Could not load this user."
        }
      />
    );
  }

  const displayName = user.fullName?.trim() || user.email;
  const detailHref = `${basePath}/${user.id}`;
  const status = mapApiStatusToTableStatus(user.status, user.isDrop);
  const isSuspended = status === "suspended";

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        fullName: fullName.trim() || null,
        gender: gender.trim() || null,
        contactNo: contactNo.trim() || null,
        roleId: roleId ? Number(roleId) : null,
        siteId: siteId ? Number(siteId) : null,
      });
      toast.success("User updated.");
      router.push(detailHref);
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update user.",
      );
    }
  };

  const handleDeactivate = async () => {
    try {
      await statusMutation.mutateAsync(true);
      toast.success(`${displayName} deactivated.`);
      setDeactivateOpen(false);
      router.push(basePath);
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Failed to deactivate user.",
      );
    }
  };

  return (
    <>
      <ConfirmDialog
        open={deactivateOpen}
        title="Deactivate User"
        description={
          <>
            Deactivate <strong>{displayName}</strong>? They will lose access
            immediately but remain listed as suspended.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Deactivate"
        confirmVariant="danger"
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={() => void handleDeactivate()}
      />

      <div className="flex flex-col gap-6 pb-4">
        <PageHeader
          title={`Edit: ${displayName}`}
          description="Update user information, role, and site assignment."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
            { label: displayName, href: detailHref },
            { label: "Edit" },
          ]}
          actions={
            <>
              <Button variant="secondary" size="sm" href={detailHref}>
                Cancel
              </Button>
              {!isSuspended ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon="lucide:user-x"
                  onClick={() => setDeactivateOpen(true)}
                >
                  Deactivate
                </Button>
              ) : null}
              <Button
                size="sm"
                leftIcon="lucide:check"
                onClick={() => void handleSave()}
                disabled={updateMutation.isPending || rolesLoading}
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DetailCard title="Edit Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput
                label="Full Name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <SelectInput
                label="Gender"
                placeholder="Select gender"
                options={[...GENDER_OPTIONS]}
                value={gender}
                onChange={setGender}
              />
              <TextInput label="Email" value={user.email} disabled />
              <PhoneInput
                label="Phone"
                value={contactNo}
                onChange={setContactNo}
              />
              <SelectInput
                label="Role"
                options={roleOptions}
                value={roleId}
                onChange={setRoleId}
                disabled={rolesLoading}
              />
              <SelectInput
                label="Site"
                options={siteOptions}
                value={siteId}
                onChange={setSiteId}
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
                  {getUserInitials(displayName, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="text4 text-darkest">{displayName}</p>
                  <div className="mt-1">
                    <TableStatusBadge status={status} />
                  </div>
                </div>
              </div>

              <dl className="flex flex-col gap-3 border-t border-darkest/8 pt-4">
                {[
                  ["Role", formatRoleName(user.roleName)],
                  ["Site", user.siteName ?? "—"],
                  ["MFA", user.mfaEnabled ? "Enabled" : "Disabled"],
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
      </div>
    </>
  );
}
