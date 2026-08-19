"use client";

import { Icon } from "@iconify/react";
import { EmailInput, PasswordInput, TextInput } from "@/components/inputs";
import { WizardSectionCard } from "./WizardSectionCard";

export type SetupStepThreeProps = {
  adminName: string;
  onAdminNameChange: (value: string) => void;
  adminEmail: string;
  onAdminEmailChange: (value: string) => void;
  adminPassword: string;
  onAdminPasswordChange: (value: string) => void;
  /** Set once the user has pressed Complete Setup with the field invalid. */
  adminNameError?: string;
  adminEmailError?: string;
  adminPasswordError?: string;
};

export function SetupStepThree({
  adminName,
  onAdminNameChange,
  adminEmail,
  onAdminEmailChange,
  adminPassword,
  onAdminPasswordChange,
  adminNameError,
  adminEmailError,
  adminPasswordError,
}: Readonly<SetupStepThreeProps>) {
  return (
    <WizardSectionCard
      title="Primary Admin Account"
      description="The first account for this organization. They sign in, set up MFA, and invite everyone else."
    >
      {/* Three fields in a two-column grid, with the "what happens next" note
          filling the fourth cell — the block stays square instead of trailing
          off as a lone field under two. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Full Name *"
          placeholder="e.g. Rachel Torres"
          value={adminName}
          error={adminNameError}
          onChange={(event) => onAdminNameChange(event.target.value)}
        />
        <EmailInput
          label="Email *"
          placeholder="e.g. admin@company.com"
          value={adminEmail}
          error={adminEmailError}
          helperText="Doubles as their username — it cannot be changed here later."
          onChange={(event) => onAdminEmailChange(event.target.value)}
        />
        <PasswordInput
          label="Password *"
          placeholder="Password"
          value={adminPassword}
          error={adminPasswordError}
          helperText="At least 8 characters. They are prompted to set up MFA on first sign-in."
          onChange={(event) => onAdminPasswordChange(event.target.value)}
          autoComplete="new-password"
        />

        <p className="border-ehs-hairline/70 text-ehs-muted-text flex items-start gap-2.5 rounded-3 border border-dashed p-4 text8">
          <Icon
            icon="lucide:shield-check"
            width={15}
            height={15}
            className="text-ehs-normal-blue mt-px shrink-0"
            aria-hidden
          />
          <span>
            Complete Setup creates the organization, its sites and this
            administrator in one request. Until then nothing has been sent.
          </span>
        </p>
      </div>
    </WizardSectionCard>
  );
}
