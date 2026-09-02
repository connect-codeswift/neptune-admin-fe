"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SelectInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UpdateSuperAdminSitePayload } from "@/dtos/req/companies.req";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { patchCachedSiteInTenantContext } from "@/lib/tenant-context";
import { getIanaTimezoneSelectOptions } from "@/lib/iana-timezones";
import {
  getSiteIndustryTypeSelectOptions,
  getSiteSizeSelectOptions,
} from "@/lib/site-form-options";

type SiteFormState = {
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  timeZoneId: string;
};

type SiteOverviewTabProps = Readonly<{
  site: SuperAdminSiteRow;
  updateSite: UseMutationResult<
    SuperAdminSiteRow | undefined,
    Error,
    { siteId: number; payload: UpdateSuperAdminSitePayload }
  >;
}>;

function toFormState(site: SuperAdminSiteRow): SiteFormState {
  return {
    siteName: site.siteName,
    location: site.location,
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    timeZoneId: site.timeZoneId ?? "",
  };
}

/**
 * The five fields the old edit-site modal carried, moved onto the Overview
 * tab of the site detail page. Same validation, same submit shape, same
 * cache patch + toast on success — only the surface changed, from a dialog
 * to a card.
 */
export function SiteOverviewTab({ site, updateSite }: SiteOverviewTabProps) {
  const [form, setForm] = useState<SiteFormState>(() => toFormState(site));
  /** Field errors stay quiet until the field is left or a save is attempted. */
  const [showErrors, setShowErrors] = useState(false);

  const timezoneOptions = getIanaTimezoneSelectOptions(form.timeZoneId);
  const industryTypeOptions = getSiteIndustryTypeSelectOptions(form.industryType);
  const siteSizeOptions = getSiteSizeSelectOptions(form.siteSize);

  const trimmedName = form.siteName.trim();
  const trimmedLocation = form.location.trim();

  let siteNameError: string | undefined;
  if (showErrors && trimmedName === "") {
    siteNameError = "A site needs a name.";
  }

  let locationError: string | undefined;
  if (showErrors && trimmedLocation === "") {
    locationError = "A site needs a location.";
  }

  // Nothing to save until something actually changed.
  const baseline = toFormState(site);
  const isDirty =
    form.siteName !== baseline.siteName ||
    form.location !== baseline.location ||
    form.industryType !== baseline.industryType ||
    form.siteSize !== baseline.siteSize ||
    form.timeZoneId !== baseline.timeZoneId;
  const canSave = isDirty && trimmedName !== "" && trimmedLocation !== "";

  const handleReset = () => {
    setForm(toFormState(site));
    setShowErrors(false);
  };

  const handleSave = async () => {
    if (!trimmedName || !trimmedLocation) {
      setShowErrors(true);
      return;
    }

    const payload = {
      siteName: trimmedName,
      location: trimmedLocation,
      industryType: form.industryType.trim() || undefined,
      siteSize: form.siteSize.trim() || undefined,
      timeZoneId: form.timeZoneId.trim() || undefined,
    };

    try {
      await updateSite.mutateAsync({ siteId: site.id, payload });
      patchCachedSiteInTenantContext(site.id, {
        name: payload.siteName,
        location: payload.location,
        industryType: payload.industryType ?? "",
        siteSize: payload.siteSize ?? "",
      });
      toast.success("Site updated.");
      setShowErrors(false);
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Failed to update site.",
      );
    }
  };

  return (
    <div className={`${GLASS_SURFACE} flex flex-col gap-4 p-5`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Site name"
          required
          value={form.siteName}
          error={siteNameError}
          onBlur={() => setShowErrors(true)}
          onChange={(event) =>
            setForm((current) => ({ ...current, siteName: event.target.value }))
          }
        />
        <TextInput
          label="Location"
          required
          placeholder="City, Country"
          value={form.location}
          error={locationError}
          onBlur={() => setShowErrors(true)}
          onChange={(event) =>
            setForm((current) => ({ ...current, location: event.target.value }))
          }
        />
        <SelectInput
          label="Industry type"
          placeholder="Select industry type"
          options={industryTypeOptions}
          value={form.industryType}
          onChange={(value) =>
            setForm((current) => ({ ...current, industryType: value }))
          }
        />
        <SelectInput
          label="Site size"
          placeholder="Select site size"
          options={siteSizeOptions}
          value={form.siteSize}
          onChange={(value) => setForm((current) => ({ ...current, siteSize: value }))}
        />
        <SelectInput
          label="Timezone (IANA)"
          placeholder="Select timezone"
          helperText="Drives due dates and shift boundaries for everything logged at this site."
          options={timezoneOptions}
          value={form.timeZoneId}
          onChange={(value) =>
            setForm((current) => ({ ...current, timeZoneId: value }))
          }
          containerClassName="sm:col-span-2"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ehs-border-ink/8 pt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={updateSite.isPending || !isDirty}
          onClick={handleReset}
        >
          Discard changes
        </Button>
        <Button
          type="button"
          leftIcon="lucide:save"
          loading={updateSite.isPending}
          loadingText="Saving…"
          disabled={!canSave}
          onClick={() => void handleSave()}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
