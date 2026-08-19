"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  MultiSelectInput,
  PhoneInput,
  SelectInput,
  TextInput,
} from "@/components/inputs";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  ConfirmDialog,
  TableStatusBadge,
} from "@/components/ui";
import type { SuperAdminUserResponse } from "@/dtos/res/users.res";
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
  readUserSiteIds,
  readUserSiteNames,
} from "@/lib/mappers/users.mapper";
import { useUserManagementPaths } from "./useUserManagementPaths";

type EditableUserFields = {
  fullName: string;
  gender: string;
  contactNo: string;
  jobTitle: string;
  roleId: string;
  siteIds: string[];
};

/** The record as the form should first show it. */
function toFormValues(user: SuperAdminUserResponse): EditableUserFields {
  return {
    fullName: user.fullName?.trim() ?? "",
    gender: user.gender?.trim() ?? "",
    contactNo: user.contactNo?.trim() ?? "",
    jobTitle: user.jobTitle?.trim() ?? "",
    roleId: String(user.roleId),
    siteIds: readUserSiteIds(user).map(String),
  };
}

function sameStringSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

/**
 * The form itself, mounted with `key={user.id}` so a different user remounts it
 * and the initial values arrive through `useState`'s initializer.
 *
 * The previous version held the same state in the page and copied the loaded
 * record into it from a `useEffect` — the `react-hooks/set-state-in-effect`
 * error. It was also a real bug: any refetch of the query (a window refocus,
 * for instance) re-ran the effect and silently overwrote whatever the admin had
 * typed. Reading the record once at mount removes both.
 */
function EditUserForm({
  user,
  userId,
  adminHref,
  basePath,
}: Readonly<{
  user: SuperAdminUserResponse;
  userId: string;
  adminHref: string;
  basePath: string;
}>) {
  const router = useRouter();
  const updateMutation = useUpdateSuperAdminUser(userId);
  const statusMutation = useUpdateSuperAdminUserStatus(userId);
  const { roleOptions, siteOptions, rolesLoading } = useUserFormOptions();

  const [initialValues] = useState(() => toFormValues(user));
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [gender, setGender] = useState(initialValues.gender);
  const [contactNo, setContactNo] = useState(initialValues.contactNo);
  const [jobTitle, setJobTitle] = useState(initialValues.jobTitle);
  const [roleId, setRoleId] = useState(initialValues.roleId);
  const [siteIds, setSiteIds] = useState(initialValues.siteIds);
  const [showErrors, setShowErrors] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const displayName = user.fullName?.trim() || user.email;
  const detailHref = `${basePath}/${user.id}`;
  const status = mapApiStatusToTableStatus(user.status, user.isDrop);
  const isSuspended = status === "suspended";

  const numericSiteIds = siteIds
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  // Validation is derived during render, not stored: the message and the
  // control it belongs to can never disagree.
  let siteError: string | undefined;
  if (showErrors && numericSiteIds.length === 0) {
    siteError = "Pick at least one site — a user with no site cannot sign in.";
  }

  let roleError: string | undefined;
  if (showErrors && !roleId) {
    roleError = "Every user needs a role; it decides what they may do.";
  }

  const isDirty =
    fullName !== initialValues.fullName ||
    gender !== initialValues.gender ||
    contactNo !== initialValues.contactNo ||
    jobTitle !== initialValues.jobTitle ||
    roleId !== initialValues.roleId ||
    !sameStringSet(siteIds, initialValues.siteIds);

  const handleSave = async () => {
    if (numericSiteIds.length === 0 || !roleId) {
      setShowErrors(true);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        fullName: fullName.trim() || null,
        gender: gender.trim() || null,
        contactNo: contactNo.trim() || null,
        // Empty string rather than null so clearing the field actually clears it — the API
        // treats null as "not sent".
        jobTitle: jobTitle.trim(),
        roleId: roleId ? Number(roleId) : null,
        siteIds: numericSiteIds,
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
            immediately but remain listed as suspended, and any unsaved edits on
            this page will be discarded. You can reactivate them later from
            their profile.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Deactivate"
        confirmVariant="danger"
        loading={statusMutation.isPending}
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={() => void handleDeactivate()}
      />

      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title={`Edit: ${displayName}`}
          description="Update user information, role, and site assignments."
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
                  disabled={statusMutation.isPending}
                >
                  Deactivate
                </Button>
              ) : null}
              {/* Disabled while nothing has changed: a live Save on an
                  untouched form invites a pointless round trip and hides
                  whether anything was actually edited. */}
              <Button
                size="sm"
                leftIcon="lucide:check"
                onClick={() => void handleSave()}
                loading={updateMutation.isPending}
                loadingText="Saving…"
                disabled={updateMutation.isPending || rolesLoading || !isDirty}
              >
                Save Changes
              </Button>
            </>
          }
        />

        {isDirty ? (
          <p className="text8 text-ehs-muted-text" role="status">
            You have unsaved changes.
          </p>
        ) : null}

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-6">
            {/* Split in two: who the person is, and what they may do. They were
                one eight-field block in which Role sat between Job Title and
                Sites with nothing to say the last two decide access. */}
            <DetailCard
              title="Personal Details"
              description="How this person appears across the platform."
            >
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
                <TextInput
                  label="Email"
                  value={user.email}
                  disabled
                  helperText="The sign-in address cannot be changed here."
                />
                <PhoneInput
                  label="Phone"
                  value={contactNo}
                  onChange={setContactNo}
                />
                <TextInput
                  label="Job Title"
                  placeholder="e.g. Site Safety Officer"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  helperText="What they do. The role below decides what they may do."
                />
              </div>
            </DetailCard>

            <DetailCard
              title="Access"
              description="The role and sites this account can work in."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectInput
                  label="Role"
                  options={roleOptions}
                  value={roleId}
                  onChange={setRoleId}
                  disabled={rolesLoading}
                  error={roleError}
                  helperText="Roles apply company-wide, not per site."
                />
                <MultiSelectInput
                  label="Sites"
                  options={siteOptions}
                  value={siteIds}
                  onChange={setSiteIds}
                  placeholder="Select sites"
                  error={siteError}
                  helperText="Removing their current site moves them to the first one that remains."
                />
              </div>
            </DetailCard>
          </div>

          <DetailCard title="Account Summary">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-normal text4 text-ehs-on-accent"
                  aria-hidden
                >
                  {getUserInitials(displayName, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text5 text-darkest" title={displayName}>
                    {displayName}
                  </p>
                  <div className="mt-1">
                    <TableStatusBadge status={status} />
                  </div>
                </div>
              </div>

              {/* Saved values, so the panel shows what the record currently is
                  rather than what the fields on the left now say. */}
              <dl className="flex flex-col gap-3 border-t border-ehs-border-ink/8 pt-4">
                {[
                  ["Role", formatRoleName(user.roleName)],
                  ["Sites", readUserSiteNames(user).join(", ") || "—"],
                  ["MFA", user.mfaEnabled ? "Enabled" : "Disabled"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="shrink-0 text8 text-ehs-muted-text uppercase">
                      {label}
                    </dt>
                    <dd
                      className="min-w-0 truncate text4 text-darkest"
                      title={value}
                    >
                      {value}
                    </dd>
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

export function EditUserPage({ userId }: Readonly<{ userId: string }>) {
  const { adminHref, basePath } = useUserManagementPaths();
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useSuperAdminUserDetail(userId);

  if (isLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Edit User"
          description="Loading user details…"
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <FeatureLoadingCard rows={6} label="Loading user details…" />
          <FeatureLoadingCard rows={3} label="Loading account summary…" />
        </div>
      </div>
    );
  }

  // A failed request and a user that simply is not there are different
  // situations and read differently: one offers a retry, the other explains
  // that the record is gone.
  if (isError) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Edit User"
          description="This user could not be loaded."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <FeatureErrorCard
          title="Couldn’t load this user"
          message={
            error instanceof Error ? error.message : "Could not load this user."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="Edit User"
          description="This user could not be found."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <FeatureEmptyState
          icon="mdi:account-question-outline"
          title="User not found"
          description="The account may have been removed, or the link that brought you here is out of date. Retrying will not bring it back."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:arrow-left"
              href={basePath}
            >
              Back to User Management
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <EditUserForm
      key={String(user.id)}
      user={user}
      userId={userId}
      adminHref={adminHref}
      basePath={basePath}
    />
  );
}
