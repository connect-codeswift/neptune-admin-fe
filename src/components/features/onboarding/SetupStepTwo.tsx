"use client";

import { Icon } from "@iconify/react";
import { SelectInput, TextInput } from "@/components/inputs";
import { TextButton } from "@/components/ui";
import { WizardSectionCard } from "./WizardSectionCard";

const INDUSTRY_OPTIONS = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "oil-and-gas", label: "Oil & Gas" },
  { value: "construction", label: "Construction" },
  { value: "chemical", label: "Chemical" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200" },
  { value: "201-1000", label: "201-1,000" },
  { value: "1001+", label: "1,001+" },
];

export type SiteDraft = {
  id: string;
  name: string;
  region: string;
  industryType: string;
  companySize: string;
};

export type SetupStepTwoProps = {
  siteName: string;
  onSiteNameChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  industryType: string;
  onIndustryTypeChange: (value: string) => void;
  companySize: string;
  onCompanySizeChange: (value: string) => void;
  sites: SiteDraft[];
  onAddSite: () => void;
};

export function SetupStepTwo({
  siteName,
  onSiteNameChange,
  region,
  onRegionChange,
  industryType,
  onIndustryTypeChange,
  companySize,
  onCompanySizeChange,
  sites,
  onAddSite,
}: Readonly<SetupStepTwoProps>) {
  return (
    <WizardSectionCard
      title="Primary Site Info"
      description="Add at least one site now. You can add more after setup."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          label="Site Name *"
          placeholder="e.g. Houston Main Plant"
          value={siteName}
          onChange={(event) => onSiteNameChange(event.target.value)}
        />
        <TextInput
          label="Region / Location *"
          placeholder="e.g. Gulf Coast, Texas"
          value={region}
          onChange={(event) => onRegionChange(event.target.value)}
        />
        <SelectInput
          label="Industry Type *"
          placeholder="Select industry type"
          options={INDUSTRY_OPTIONS}
          value={industryType}
          onChange={onIndustryTypeChange}
        />
        <SelectInput
          label="Company Size *"
          placeholder="Select company size"
          options={COMPANY_SIZE_OPTIONS}
          value={companySize}
          onChange={onCompanySizeChange}
        />
      </div>

      <div className="mt-4">
        <TextButton type="button" onClick={onAddSite} className="gap-1.5">
          <Icon icon="lucide:plus" width={16} height={16} aria-hidden />
          Add Another Site
        </TextButton>
      </div>

      {sites.length > 0 ? (
        <ul className="mt-5 divide-y divide-darkest/8 border-t border-darkest/8">
          {sites.map((site) => (
            <li key={site.id} className="py-3">
              <p className="text-sm font-semibold text-darkest">{site.name}</p>
              <p className="text-xs text-gray">
                {[site.region, site.industryType, site.companySize]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </WizardSectionCard>
  );
}
