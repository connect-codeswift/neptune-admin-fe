"use client";

import { Icon } from "@iconify/react";
import { SelectInput, TextInput } from "@/components/inputs";
import { Button, TextButton } from "@/components/ui";
import {
  SITE_INDUSTRY_TYPE_OPTIONS,
  SITE_SIZE_OPTIONS,
  siteIndustryTypeLabel,
  siteSizeLabel,
} from "@/lib/site-form-options";
import { WizardSectionCard } from "./WizardSectionCard";

export type SiteDraft = {
  id: string;
  name: string;
  region: string;
  industryType: string;
  companySize: string;
};

function industryLabel(value: string) {
  return siteIndustryTypeLabel(value);
}

function companySizeLabel(value: string) {
  return siteSizeLabel(value);
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
  /** Set once the user has pressed Continue with no site entered at all. */
  sitesError?: string;
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
  sitesError,
}: Readonly<SetupStepTwoProps>) {
  const formStarted = Boolean(
    siteName.trim() || region.trim() || industryType || companySize,
  );
  const formComplete = Boolean(
    siteName.trim() && region.trim() && industryType && companySize,
  );

  return (
    <>
      <WizardSectionCard
        title="Primary Site Info"
        description="Add at least one site now. You can add more after setup."
      >
        <div className="flex flex-col gap-4">
          {/* Two columns keep each field at a readable measure inside a card
              that is now much wider than the old centred form. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              options={[...SITE_INDUSTRY_TYPE_OPTIONS]}
              value={industryType}
              onChange={onIndustryTypeChange}
            />
            <SelectInput
              label="Company Size *"
              placeholder="Select company size"
              options={[...SITE_SIZE_OPTIONS]}
              value={companySize}
              onChange={onCompanySizeChange}
            />
          </div>

          {/* "Add Site" was a bare text link with no hint that the form below
              could also just be left filled in. Both routes work — this says so. */}
          <div className="border-ehs-hairline/70 flex flex-wrap items-center gap-3 border-t pt-4">
            {/* The tooltip lives on the wrapper: a disabled button has
                `pointer-events: none`, so its own `title` never surfaces. */}
            <span
              title={
                formComplete
                  ? undefined
                  : "Fill in all four fields to add this site to the list"
              }
              className="inline-flex"
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon="lucide:plus"
                onClick={onAddSite}
                disabled={!formComplete}
              >
                Add another site
              </Button>
            </span>
            <p className="text-ehs-muted-text min-w-0 flex-1 text8">
              {formStarted
                ? "This site is included when you finish setup — add it to the list only if you want to enter another."
                : "Fill the four fields above for the first site."}
            </p>
          </div>

          {sitesError ? (
            <p className="text-ehs-red text8" role="alert">
              {sitesError}
            </p>
          ) : null}
        </div>
      </WizardSectionCard>

      {/* Always rendered, empty or not: the list used to appear from nowhere
          and change the page's height under the pointer on the first add. */}
      <WizardSectionCard
        title="Added sites"
        description="Everything here is created with the account."
        action={
          <span className="text-ehs-muted-text text8 tabular-nums">
            {sites.length} site{sites.length === 1 ? "" : "s"} in the list
          </span>
        }
      >
        {sites.length === 0 ? (
          <p className="border-ehs-hairline/70 text-ehs-muted-text rounded-3 border border-dashed px-4 py-5 text8">
            Nothing added yet. The site in the form above still counts — this
            list is only for the second one onwards.
          </p>
        ) : (
          <ul className="divide-ehs-border-ink/8 divide-y">
            {sites.map((site) => (
              <li
                key={site.id}
                className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p
                    className="text-ehs-darker truncate text5"
                    title={site.name}
                  >
                    {site.name}
                  </p>
                  <p className="text-ehs-muted-text truncate text8">
                    {[
                      site.region,
                      industryLabel(site.industryType),
                      companySizeLabel(site.companySize),
                    ]
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
        )}
      </WizardSectionCard>
    </>
  );
}
