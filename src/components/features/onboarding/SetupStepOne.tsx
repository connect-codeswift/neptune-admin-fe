"use client";

import { TextInput, ToggleBadges } from "@/components/inputs";
import { WizardSectionCard } from "./WizardSectionCard";

const MODULE_OPTIONS = [
  { value: "incident-reporting", label: "Incident Reporting" },
  { value: "hazard-management", label: "Hazard Management" },
  { value: "capa", label: "CAPA" },
  { value: "document-control", label: "Document Control" },
  { value: "compliance-calendar", label: "Compliance Calendar" },
  { value: "training-management", label: "Training Management" },
];

export type SetupStepOneProps = {
  organizationName: string;
  onOrganizationNameChange: (value: string) => void;
  modules: string[];
  onModulesChange: (value: string[]) => void;
};

export function SetupStepOne({
  organizationName,
  onOrganizationNameChange,
  modules,
  onModulesChange,
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
        <ToggleBadges
          label="Activated Modules *"
          helperText="Select the EHS modules to activate for this organization."
          variant="card"
          options={MODULE_OPTIONS}
          value={modules}
          onChange={onModulesChange}
          countNoun="modules selected"
        />
      </div>
    </WizardSectionCard>
  );
}
