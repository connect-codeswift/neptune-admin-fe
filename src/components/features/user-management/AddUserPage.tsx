"use client";

import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { SubscriptionSeatLimitModal } from "@/components/features/user-management/SubscriptionSeatLimitModal";
import {
  EmailInput,
  MultiSelectInput,
  SelectInput,
  TextInput,
} from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { useClientAccountDetail } from "@/hooks/useClientAccountDetail";
import { useInviteSuperAdminUser } from "@/hooks/useSuperAdminUserMutations";
import { useUserFormOptions } from "@/hooks/useUserFormOptions";
import { GENDER_OPTIONS } from "@/lib/gender-options";
import { toSeatLimitInfo } from "@/lib/organization-limits";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { useUserManagementPaths } from "./useUserManagementPaths";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { adminHref, basePath } = useUserManagementPaths();
  const orgSite = parseOrgSitePath(pathname);
  const organizationId = orgSite ? Number(orgSite.company) : undefined;
  const { data: company } = useClientAccountDetail(
    Number.isFinite(organizationId) && organizationId! > 0
      ? organizationId
      : undefined,
  );
  const seatInfo = company ? toSeatLimitInfo(company) : null;
  const atSeatLimit = company?.atSeatLimit ?? false;

  const inviteMutation = useInviteSuperAdminUser();
  const { roleOptions, siteOptions, defaultSiteIds, rolesLoading } =
    useUserFormOptions();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [roleId, setRoleId] = useState("");
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // The picker starts on the dashboard's current site, but only until the admin touches it —
  // defaultSiteIds arrives from a cache read that can resolve after the first render.
  const selectedSiteIds = siteIds.length > 0 ? siteIds : defaultSiteIds;

  const numericSiteIds = selectedSiteIds
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  const trimmedEmail = email.trim();

  // Every rule is derived during render and shown beside the field it belongs
  // to. They used to arrive one at a time as toasts, floating in a corner with
  // no way to tell which of eight controls was wrong.
  let emailError: string | undefined;
  if (showErrors && !trimmedEmail) {
    emailError = "An email address is required — the invitation is sent to it.";
  } else if (showErrors && !EMAIL_PATTERN.test(trimmedEmail)) {
    emailError = "Enter a complete email address, for example name@company.com.";
  }

  let roleError: string | undefined;
  if (showErrors && !roleId) {
    roleError = "Pick a role — it decides what this person may do.";
  }

  let siteError: string | undefined;
  if (showErrors && numericSiteIds.length === 0) {
    siteError = "Pick at least one site — a user with no site cannot sign in.";
  }

  const isDirty =
    Boolean(fullName) ||
    Boolean(gender) ||
    Boolean(email) ||
    Boolean(jobTitle) ||
    Boolean(roleId) ||
    siteIds.length > 0;

  const handleCreate = async () => {
    if (atSeatLimit && seatInfo) {
      return;
    }

    if (
      !trimmedEmail ||
      !EMAIL_PATTERN.test(trimmedEmail) ||
      !roleId ||
      numericSiteIds.length === 0
    ) {
      setShowErrors(true);
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: trimmedEmail,
        fullName: fullName.trim() || null,
        gender: gender.trim() || null,
        jobTitle: jobTitle.trim() || null,
        roleId: Number(roleId),
        siteIds: numericSiteIds,
      });
      toast.success("User invited.");
      router.push(basePath);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite user.",
      );
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-4">
      <PageHeader
        title="Add New User"
        description="Invite a user and assign their role and sites"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "User Management", href: basePath },
          { label: "Add User" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm" href={basePath}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:user-plus"
              onClick={() => void handleCreate()}
              loading={inviteMutation.isPending}
              loadingText="Adding…"
              disabled={
                inviteMutation.isPending ||
                rolesLoading ||
                atSeatLimit ||
                !isDirty
              }
            >
              Add User
            </Button>
          </>
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-normal/15 bg-blue-normal/5 px-4 py-3">
        <Icon
          icon="mdi:email-fast-outline"
          className="mt-0.5 size-4 shrink-0 text-blue-normal"
          aria-hidden="true"
        />
        <p className="min-w-0 text8 leading-relaxed text-ehs-slate">
          Adding a user sends them an email invitation. They set their own
          password and phone number when they accept, so those are not asked for
          here — you can edit their profile once the account exists.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {/* Two cards rather than one eight-field block: identity is what the
            invitation says about them, access is what it lets them do. */}
        <DetailCard
          title="Personal Details"
          description="How this person will appear across the platform."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EmailInput
              label="Email Address"
              placeholder="user@company.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={emailError}
              helperText="The invitation is sent here, and it becomes their sign-in."
            />
            <TextInput
              label="Full Name"
              placeholder="e.g. Sarah Mitchell"
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
          description="The role and sites this account starts with."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/*
              `value` is the state and nothing else. It used to fall back to
              `roleOptions[0]` for display only, so an admin who never opened
              the menu saw a role selected, pressed Add User, and was told to
              select a role.
            */}
            <SelectInput
              label="Role"
              placeholder="Select a role"
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
              value={selectedSiteIds}
              onChange={setSiteIds}
              placeholder="Select sites"
              error={siteError}
              helperText="The first site selected becomes their starting site; they can switch between the rest."
            />
          </div>
        </DetailCard>
      </div>

      {seatInfo && atSeatLimit ? (
        <SubscriptionSeatLimitModal
          open
          seatInfo={seatInfo}
          onClose={() => router.push(basePath)}
          onContactSales={() => {
            toast.info("Contact CodeSwift to increase your seat allowance.");
          }}
        />
      ) : null}
    </div>
  );
}
