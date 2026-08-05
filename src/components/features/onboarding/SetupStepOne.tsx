"use client";

import { TextInput } from "@/components/inputs";
import { WizardSectionCard } from "./WizardSectionCard";

export type SetupStepOneProps = {
  organizationName: string;
  onOrganizationNameChange: (value: string) => void;
};

export function SetupStepOne({
  organizationName,
  onOrganizationNameChange,
}: Readonly<SetupStepOneProps>) {
  return (
    <WizardSectionCard title="Organization">
      <div className="flex flex-col gap-6">
        <TextInput
          label="Organization Name *"
          placeholder="e.g. Meridian Chemical Co."
          value={organizationName}
          onChange={(event) => onOrganizationNameChange(event.target.value)}
        />
        <p className="rounded-xl border border-darkest/8 bg-white/80 px-4 py-3 text6 text-gray">
          Modules are licensed on the client&apos;s subscription, not here. Create
          the subscription after onboarding to grant module access.
        </p>
      </div>
    </WizardSectionCard>
  );
}
