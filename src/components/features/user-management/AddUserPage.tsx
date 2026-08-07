"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { SubscriptionSeatLimitModal } from "@/components/features/user-management/SubscriptionSeatLimitModal";
import {
  EmailInput,
  MultiSelectInput,
  PhoneInput,
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
  const [contactNo, setContactNo] = useState("");
  const [roleId, setRoleId] = useState("");
  const [siteIds, setSiteIds] = useState<string[]>([]);

  // The picker starts on the dashboard's current site, but only until the admin touches it —
  // defaultSiteIds arrives from a cache read that can resolve after the first render.
  const selectedSiteIds = siteIds.length > 0 ? siteIds : defaultSiteIds;

  const handleCreate = async () => {
    if (atSeatLimit && seatInfo) {
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!roleId) {
      toast.error("Select a role.");
      return;
    }

    const numericSiteIds = selectedSiteIds
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);

    if (numericSiteIds.length === 0) {
      toast.error("Select at least one site.");
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: email.trim(),
        fullName: fullName.trim() || null,
        gender: gender.trim() || null,
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
    <div className="flex flex-col gap-6 pb-4">
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
              disabled={inviteMutation.isPending || rolesLoading || atSeatLimit}
            >
              {inviteMutation.isPending ? "Adding…" : "Add User"}
            </Button>
          </>
        }
      />

      <DetailCard title="User Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <EmailInput
            label="Email Address"
            placeholder="user@company.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PhoneInput
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={contactNo}
            onChange={setContactNo}
          />
         
          <MultiSelectInput
            label="Sites"
            options={siteOptions}
            value={selectedSiteIds}
            onChange={setSiteIds}
            placeholder="Select sites"
            helperText="The first site selected becomes their starting site; they can switch between the rest."
          />
           <SelectInput
            label="Role"
            options={roleOptions}
            value={roleId || roleOptions[0]?.value || ""}
            onChange={setRoleId}
            disabled={rolesLoading}
          />
        </div>
      </DetailCard>

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
