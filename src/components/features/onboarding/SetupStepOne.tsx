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
  /** Set once the user has pressed Continue with the field still empty. */
  organizationNameError?: string;
};

export function SetupStepOne({
  organizationName,
  onOrganizationNameChange,
  selectedModules,
  onSelectedModulesChange,
  organizationNameError,
}: Readonly<SetupStepOneProps>) {
  return (
    // Two questions, two cards. "What is the company called" and "which product
    // do they get" were one long panel, where the name field sat above a wall of
    // module tiles with nothing marking the change of subject.
    <>
      <WizardSectionCard
        title="Organization"
        description="Who the account belongs to."
      >
        {/* The card is wide; the field is not. A name input stretched across
            the full column puts its label and its caret a screen apart. */}
        <div className="max-w-xl">
          <TextInput
            label="Organization Name *"
            placeholder="e.g. Meridian Chemical Co."
            value={organizationName}
            error={organizationNameError}
            helperText="The name their users see across the product."
            onChange={(event) => onOrganizationNameChange(event.target.value)}
          />
        </div>
      </WizardSectionCard>

      <WizardSectionCard
        title="Activated modules"
        description="Optional now — modules can be turned on or off at any time from the client's Modules tab."
      >
        <div className="flex flex-col gap-3">
          <ToggleBadges
            options={getModuleOptions()}
            value={selectedModules}
            onChange={onSelectedModulesChange}
            variant="card"
          />
          <p className="text-ehs-muted-text text8" aria-live="polite">
            {selectedModules.length === 0
              ? "No modules selected — the client starts with an almost empty product."
              : `${selectedModules.length} module${selectedModules.length === 1 ? "" : "s"} will be activated at registration.`}
          </p>
        </div>
      </WizardSectionCard>
    </>
  );
}
