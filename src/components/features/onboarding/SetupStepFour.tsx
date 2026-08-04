"use client";

import { Icon } from "@iconify/react";
import { EmailInput, SelectInput } from "@/components/inputs";
import { Button, TextButton } from "@/components/ui";
import { WizardSectionCard } from "./WizardSectionCard";

const ROLE_OPTIONS = [
  { value: "safety-manager", label: "Safety Manager" },
  { value: "hse-manager", label: "HSE Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "employee", label: "Employee" },
  { value: "read-only", label: "Read-Only" },
];

export type InviteDraft = {
  id: string;
  email: string;
  role: string;
  siteId: string;
};

export type InviteSiteOption = {
  value: string;
  label: string;
};

export type SetupStepFourProps = {
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  inviteRole: string;
  onInviteRoleChange: (value: string) => void;
  inviteSiteId: string;
  onInviteSiteIdChange: (value: string) => void;
  siteOptions: InviteSiteOption[];
  invites: InviteDraft[];
  onAddInvite: () => void;
  onRemoveInvite: (id: string) => void;
};

function roleLabel(value: string) {
  return ROLE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function SetupStepFour({
  inviteEmail,
  onInviteEmailChange,
  inviteRole,
  onInviteRoleChange,
  inviteSiteId,
  onInviteSiteIdChange,
  siteOptions,
  invites,
  onAddInvite,
  onRemoveInvite,
}: Readonly<SetupStepFourProps>) {
  const siteLabel = (value: string) =>
    siteOptions.find((option) => option.value === value)?.label ?? value;

  return (
    <WizardSectionCard
      title="Invite Team Members"
      description="Optional. Invite colleagues to join the platform. You can also do this later."
    >
      <div className="grid grid-cols-1 items-end gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <EmailInput
          label="Email *"
          placeholder="colleague@company.com"
          value={inviteEmail}
          onChange={(event) => onInviteEmailChange(event.target.value)}
        />
        <SelectInput
          label="Role *"
          placeholder="Select role"
          options={ROLE_OPTIONS}
          value={inviteRole}
          onChange={onInviteRoleChange}
        />
        <SelectInput
          label="Site *"
          placeholder="Select site"
          options={siteOptions}
          value={inviteSiteId}
          onChange={onInviteSiteIdChange}
        />
        <Button
          type="button"
          leftIcon="lucide:plus"
          onClick={onAddInvite}
          className="h-12"
        >
          Add
        </Button>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text8 tracking-[0.66px] text-gray uppercase">
            Invited Team Members
          </p>
          <p className="text6 text-gray">{invites.length} invited</p>
        </div>

        {invites.length === 0 ? (
          <p className="border-t border-darkest/8 py-6 text5 text-gray">
            No team members invited yet.
          </p>
        ) : (
          <ul className="divide-y divide-darkest/8 border-t border-darkest/8">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text5 font-semibold text-darkest">
                    {invite.email}
                  </p>
                  <p className="truncate text6 text-gray">
                    {roleLabel(invite.role)} • {siteLabel(invite.siteId)}
                  </p>
                </div>
                <TextButton
                  type="button"
                  variant="danger"
                  onClick={() => onRemoveInvite(invite.id)}
                  className="inline-flex shrink-0 items-center gap-1.5"
                >
                  <Icon
                    icon="lucide:trash-2"
                    width={14}
                    height={14}
                    aria-hidden
                  />
                  Remove
                </TextButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WizardSectionCard>
  );
}
