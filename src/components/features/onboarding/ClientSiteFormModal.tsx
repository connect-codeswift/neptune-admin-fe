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
}: Readonly<{
  form: ClientSiteFormState;
  onFormChange: (form: ClientSiteFormState) => void;
  industryTypeOptions: { value: string; label: string }[];
  siteSizeOptions: { value: string; label: string }[];
  timezoneOptions: { value: string; label: string }[];
}>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextInput
        label="Site name *"
        value={form.siteName}
        onChange={(event) =>
          onFormChange({ ...form, siteName: event.target.value })
        }
      />
      <TextInput
        label="Location *"
        value={form.location}
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
  industryTypeOptions,
  siteSizeOptions,
  timezoneOptions,
}: ClientSiteFormModalProps) {
  return (
    <Modal
      open={open}
      title={editingSite ? "Edit site" : "Add site"}
      onClose={onClose}
      primaryLabel={editingSite ? "Save changes" : "Create site"}
      onPrimary={onSave}
      loading={loading}
      size="lg"
    >
      <ClientSiteFormFields
        form={form}
        onFormChange={onFormChange}
        industryTypeOptions={industryTypeOptions}
        siteSizeOptions={siteSizeOptions}
        timezoneOptions={timezoneOptions}
      />
    </Modal>
  );
}
