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

function industryLabel(value: string) {
  return INDUSTRY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function companySizeLabel(value: string) {
  return COMPANY_SIZE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

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
  onRemoveSite: (id: string) => void;
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
  onRemoveSite,
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
          Add Site
        </TextButton>
      </div>

      {sites.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3 border-t border-darkest/8 pt-5">
            <p className="text8 tracking-[0.66px] text-gray uppercase">
              Added Sites
            </p>
            <p className="text6 text-gray">
              {sites.length} site{sites.length === 1 ? "" : "s"}
            </p>
          </div>
          <ul className="divide-y divide-darkest/8">
            {sites.map((site) => (
              <li
                key={site.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text5 font-semibold text-darkest">
                    {site.name}
                  </p>
                  <p className="truncate text6 text-gray">
                    {[site.region, industryLabel(site.industryType), companySizeLabel(site.companySize)]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
                <TextButton
                  type="button"
                  variant="danger"
                  onClick={() => onRemoveSite(site.id)}
                  className="inline-flex shrink-0 items-center gap-1.5"
                  aria-label={`Remove ${site.name}`}
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
        </div>
      ) : null}
    </WizardSectionCard>
  );
}
