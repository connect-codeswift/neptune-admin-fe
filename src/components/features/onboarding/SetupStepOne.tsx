"use client";

import { ToggleBadges } from "@/components/inputs";
import { TextInput } from "@/components/inputs";
import { getModuleOptions } from "@/lib/ehs-modules";
import { WizardSectionCard } from "./WizardSectionCard";

export type SetupStepOneProps = {
  organizationName: string;
  onOrganizationNameChange: (value: string) => void;
  selectedModules: string[];
  onSelectedModulesChange: (value: string[]) => void;
};

export function SetupStepOne({
  organizationName,
  onOrganizationNameChange,
  selectedModules,
  onSelectedModulesChange,
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

        <div>
          <p className="mb-3 text5 font-semibold text-darkest">
            Activated modules
          </p>
          <ToggleBadges
            options={getModuleOptions()}
            value={selectedModules}
            onChange={onSelectedModulesChange}
            variant="card"
          />
          <p className="mt-3 text6 text-gray">
            Selected modules are saved with the organization at registration.
          </p>
        </div>
      </div>
    </WizardSectionCard>
  );
}
