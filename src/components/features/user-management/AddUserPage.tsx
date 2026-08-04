"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  CheckBoxInput,
  EmailInput,
  PhoneInput,
  SelectInput,
  TextInput,
  ToggleInput,
} from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  ADDITIONAL_PERMISSION_GROUPS,
  getRoleLabel,
  getRolePermissionPreview,
  USER_DEPARTMENT_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_SITE_OPTIONS,
} from "./user-management-form.constants";
import { SubscriptionSeatLimitModal } from "./SubscriptionSeatLimitModal";
import { useSubscriptionSeats } from "./useSubscriptionSeats";
import { useUserManagementPaths } from "./useUserManagementPaths";

export function AddUserPage() {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const { atSeatLimit, seatInfo } = useSubscriptionSeats();
  const [seatLimitModalOpen, setSeatLimitModalOpen] = useState(false);
  const [role, setRole] = useState("employee");
  const [sendInvite, setSendInvite] = useState(true);
  const [requirePasswordSetup, setRequirePasswordSetup] = useState(true);

  const roleLabel = getRoleLabel(role);
  const permissionPreview = getRolePermissionPreview(role);

  useEffect(() => {
    if (atSeatLimit && seatInfo) {
      setSeatLimitModalOpen(true);
    }
  }, [atSeatLimit, seatInfo]);

  const handleCreate = () => {
    if (atSeatLimit && seatInfo) {
      setSeatLimitModalOpen(true);
      return;
    }
    toast.success("User created.");
    router.push(basePath);
  };

  const handleSeatLimitClose = () => {
    setSeatLimitModalOpen(false);
    if (atSeatLimit) {
      router.push(basePath);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Add New User"
        description="Create a new user account and configure access permissions"
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
              onClick={handleCreate}
            >
              Create User
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <DetailCard title="Basic Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="First Name" placeholder="e.g. Sarah" />
              <TextInput label="Last Name" placeholder="e.g. Mitchell" />
              <EmailInput
                label="Email Address"
                placeholder="user@company.com"
                required
              />
              <PhoneInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </DetailCard>

          <DetailCard title="Role & Assignment">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SelectInput
                label="Role"
                options={USER_ROLE_OPTIONS}
                value={role}
                onChange={setRole}
              />
              <SelectInput
                label="Department"
                options={USER_DEPARTMENT_OPTIONS}
                value="safety"
              />
              <SelectInput
                label="Primary Site"
                options={USER_SITE_OPTIONS}
                value="hq"
              />
            </div>
          </DetailCard>
        </div>

        <div className="flex flex-col gap-6">
          <DetailCard title="Account Settings">
            <div className="flex flex-col gap-4">
              <ToggleInput
                label="Send invitation email"
                description="Email login link to the user"
                checked={sendInvite}
                onChange={setSendInvite}
              />
              <ToggleInput
                label="Require password setup"
                description="Force password creation on first login"
                checked={requirePasswordSetup}
                onChange={setRequirePasswordSetup}
              />
            </div>
          </DetailCard>

          <DetailCard title="Role Permissions Preview">
            <p className="mb-4 text6 text-gray">
              Based on:{" "}
              <span className="font-semibold text-blue-normal">{roleLabel}</span>
            </p>
            <ul className="flex flex-col gap-3">
              {permissionPreview.map((permission) => (
                <li
                  key={permission.label}
                  className="flex items-center gap-2.5 text5 text-darkest"
                >
                  <Icon
                    icon={
                      permission.granted
                        ? "lucide:circle-check"
                        : "lucide:circle"
                    }
                    width={16}
                    height={16}
                    className={
                      permission.granted ? "text-blue-normal" : "text-[#b3bbc8]"
                    }
                    aria-hidden
                  />
                  {permission.label}
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>
      </div>

      <DetailCard
        title="Additional Permissions"
        description="Override role defaults with individual permissions"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          {ADDITIONAL_PERMISSION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text8 tracking-[0.66px] text-[#8892a3] uppercase">
                {group.label}
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {group.permissions.map((permission) => (
                  <CheckBoxInput
                    key={`${group.label}-${permission}`}
                    label={permission}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DetailCard>

      {seatInfo ? (
        <SubscriptionSeatLimitModal
          open={seatLimitModalOpen}
          seatInfo={seatInfo}
          onClose={handleSeatLimitClose}
          onContactSales={() => {
            toast.info("Sales team will contact you shortly.");
            handleSeatLimitClose();
          }}
          onManageSubscription={() => {
            toast.info("Opening subscription management.");
            handleSeatLimitClose();
          }}
        />
      ) : null}
    </div>
  );
}
