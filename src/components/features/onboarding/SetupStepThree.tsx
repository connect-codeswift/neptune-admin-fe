"use client";

import { EmailInput, PasswordInput, TextInput } from "@/components/inputs";
import { WizardSectionCard } from "./WizardSectionCard";

export type SetupStepThreeProps = {
  adminName: string;
  onAdminNameChange: (value: string) => void;
  adminEmail: string;
  onAdminEmailChange: (value: string) => void;
  adminPassword: string;
  onAdminPasswordChange: (value: string) => void;
};

export function SetupStepThree({
  adminName,
  onAdminNameChange,
  adminEmail,
  onAdminEmailChange,
  adminPassword,
  onAdminPasswordChange,
}: Readonly<SetupStepThreeProps>) {
  return (
    <WizardSectionCard
      title="Primary Admin Account"
      description="Set up the main account holder for this organization."
    >
      <div className="flex max-w-xl flex-col gap-4">
        <TextInput
          label="Full Name *"
          placeholder="e.g. Rachel Torres"
          value={adminName}
          onChange={(event) => onAdminNameChange(event.target.value)}
        />
        <EmailInput
          label="Email *"
          placeholder="e.g. admin@company.com"
          value={adminEmail}
          onChange={(event) => onAdminEmailChange(event.target.value)}
        />
        <PasswordInput
          label="Password *"
          placeholder="Password"
          value={adminPassword}
          onChange={(event) => onAdminPasswordChange(event.target.value)}
          autoComplete="new-password"
        />
      </div>
    </WizardSectionCard>
  );
}
