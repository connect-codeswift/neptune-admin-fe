"use client";

import { SelectInput, TextInput } from "@/components/inputs";
import { Modal } from "@/components/ui";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";

export type ClientSiteFormState = {
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  timeZoneId: string;
};

export const EMPTY_CLIENT_SITE_FORM: ClientSiteFormState = {
  siteName: "",
  location: "",
  industryType: "",
  siteSize: "",
  timeZoneId: "",
};

export function toClientSiteFormState(
  site?: SuperAdminSiteRow,
): ClientSiteFormState {
  if (!site) return EMPTY_CLIENT_SITE_FORM;
  return {
    siteName: site.siteName,
    location: site.location,
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    timeZoneId: site.timeZoneId ?? "",
  };
}

export function ClientSiteFormFields({
  form,
  onFormChange,
  industryTypeOptions,
  siteSizeOptions,
  timezoneOptions,
  showErrors = false,
}: Readonly<{
  form: ClientSiteFormState;
  onFormChange: (form: ClientSiteFormState) => void;
  industryTypeOptions: { value: string; label: string }[];
  siteSizeOptions: { value: string; label: string }[];
  timezoneOptions: { value: string; label: string }[];
  /**
   * Turned on once the user has tried to save. A blank required field is not an
   * error the moment an empty form opens — it only becomes one when they say
   * they are done.
   */
  showErrors?: boolean;
}>) {
  let siteNameError: string | undefined;
  let locationError: string | undefined;
  if (showErrors) {
    siteNameError = form.siteName.trim() ? undefined : "Site name is required.";
    locationError = form.location.trim() ? undefined : "Location is required.";
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Required fields report inline, next to themselves, instead of only
          producing a toast. Both are what the create/update endpoints reject a
          payload without. */}
      <TextInput
        label="Site name *"
        placeholder="e.g. Houston Main Plant"
        value={form.siteName}
        error={siteNameError}
        onChange={(event) =>
          onFormChange({ ...form, siteName: event.target.value })
        }
      />
      <TextInput
        label="Location *"
        value={form.location}
        placeholder="e.g. Gulf Coast, Texas"
        error={locationError}
        onChange={(event) =>
          onFormChange({ ...form, location: event.target.value })
        }
      />
      <SelectInput
        label="Industry type"
        placeholder="Select industry type"
        options={industryTypeOptions}
        value={form.industryType}
        onChange={(value) => onFormChange({ ...form, industryType: value })}
      />
      <SelectInput
        label="Site size"
        placeholder="Select site size"
        options={siteSizeOptions}
        value={form.siteSize}
        onChange={(value) => onFormChange({ ...form, siteSize: value })}
      />
      <SelectInput
        label="Timezone (IANA)"
        placeholder="Select timezone"
        options={timezoneOptions}
        value={form.timeZoneId}
        onChange={(value) => onFormChange({ ...form, timeZoneId: value })}
        containerClassName="sm:col-span-2"
      />
    </div>
  );
}

type ClientSiteFormModalProps = Readonly<{
  open: boolean;
  editingSite: SuperAdminSiteRow | null;
  form: ClientSiteFormState;
  onFormChange: (form: ClientSiteFormState) => void;
  onClose: () => void;
  onSave: () => void;
  loading?: boolean;
  showErrors?: boolean;
  industryTypeOptions: { value: string; label: string }[];
  siteSizeOptions: { value: string; label: string }[];
  timezoneOptions: { value: string; label: string }[];
}>;

export function ClientSiteFormModal({
  open,
  editingSite,
  form,
  onFormChange,
  onClose,
  onSave,
  loading = false,
  showErrors = false,
  industryTypeOptions,
  siteSizeOptions,
  timezoneOptions,
}: ClientSiteFormModalProps) {
  return (
    <Modal
      open={open}
      title={editingSite ? "Edit site" : "Add site"}
      onClose={onClose}
      secondaryLabel="Cancel"
      onSecondary={onClose}
      primaryLabel={editingSite ? "Save changes" : "Create site"}
      onPrimary={onSave}
      loading={loading}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <p className="text8 text-ehs-muted-text">
          Fields marked * are required. Industry, size, and timezone can be
          filled in later from this client&apos;s Sites tab.
        </p>
        <ClientSiteFormFields
          form={form}
          onFormChange={onFormChange}
          industryTypeOptions={industryTypeOptions}
          siteSizeOptions={siteSizeOptions}
          timezoneOptions={timezoneOptions}
          showErrors={showErrors}
        />
      </div>
    </Modal>
  );
}
