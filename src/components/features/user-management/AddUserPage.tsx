"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  EmailInput,
  PhoneInput,
  SelectInput,
  TextInput,
} from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { useInviteSuperAdminUser } from "@/hooks/useSuperAdminUserMutations";
import { useUserFormOptions } from "@/hooks/useUserFormOptions";
import { GENDER_OPTIONS } from "@/lib/gender-options";
import { useUserManagementPaths } from "./useUserManagementPaths";

export function AddUserPage() {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const inviteMutation = useInviteSuperAdminUser();
  const { roleOptions, siteOptions, defaultSiteId, rolesLoading } =
    useUserFormOptions();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [roleId, setRoleId] = useState("");
  const [siteId, setSiteId] = useState(defaultSiteId);

  const handleCreate = async () => {
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!roleId) {
      toast.error("Select a role.");
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: email.trim(),
        fullName: fullName.trim() || null,
        gender: gender.trim() || null,
        roleId: Number(roleId),
        siteId: siteId ? Number(siteId) : null,
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
        description="Invite a user and assign their role and site"
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
              disabled={inviteMutation.isPending || rolesLoading}
            >
              {inviteMutation.isPending ? "Inviting…" : "Invite User"}
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
         
          <SelectInput
            label="Site"
            options={siteOptions}
            value={siteId || siteOptions[0]?.value || ""}
            onChange={setSiteId}
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
    </div>
  );
}
