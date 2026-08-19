"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PhoneInput } from "@/components/inputs/PhoneInput";
import { TextInput } from "@/components/inputs/TextInput";
import {
  FormError,
  ReadOnlyField,
  SettingsCallout,
} from "@/components/settings/SettingsPieces";
import { TenantAvatarCard } from "@/components/settings/TenantAvatarCard";
import {
  buildDefaultSettingsHref,
  SUPER_SETTINGS_BASE_PATH,
} from "@/components/settings/settings-nav";
import {
  CONTACT_NO_HINT,
  FULL_NAME_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  normalizeContactNo,
  validateContactNo,
  validateFullName,
  validateJobTitle,
} from "@/components/settings/settings-validation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getSettingsErrorMessage,
  useTenantAccount,
  useUpdateMyProfile,
  type TenantAccount,
} from "@/hooks/useProfileSettings";
import { toast } from "@/lib/toast";

const FULL_NAME_FIELD_ID = "profile-full-name";

type ProfileForm = {
  fullName: string;
  jobTitle: string;
  contactNo: string;
};

function toForm(account: TenantAccount): ProfileForm {
  return {
    fullName: account.fullName,
    jobTitle: account.jobTitle,
    contactNo: account.contactNo,
  };
}

/** First validation failure across the three editable fields, or null. */
function validateProfileForm(form: ProfileForm): string | null {
  return (
    validateFullName(form.fullName) ??
    validateJobTitle(form.jobTitle) ??
    validateContactNo(form.contactNo)
  );
}

function PersonalInformationCard(
  props: Readonly<{ account: TenantAccount }>,
) {
  const { account } = props;
  const updateProfile = useUpdateMyProfile();

  const [form, setForm] = useState<ProfileForm>(() => toForm(account));
  const [saved, setSaved] = useState<ProfileForm>(() => toForm(account));
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Edit" swaps itself out for the Save/Cancel row, so the button that had focus disappears.
  // Focus moves to the first field it just unlocked, which is where the user was going anyway.
  // By id rather than by ref: `TextInput` is a plain function component and does not forward one.
  useEffect(() => {
    if (!isEditing) return;
    document.getElementById(FULL_NAME_FIELD_ID)?.focus();
  }, [isEditing]);

  // The stored values arrive after first paint. Adopting them while the user is not editing
  // keeps the fields honest without ever overwriting something they are part-way through
  // typing — which is why this is keyed on `isEditing` rather than done in an effect.
  const [adoptedKey, setAdoptedKey] = useState("");
  const storedKey = `${account.fullName}|${account.jobTitle}|${account.contactNo}`;
  if (!isEditing && adoptedKey !== storedKey) {
    setAdoptedKey(storedKey);
    setForm(toForm(account));
    setSaved(toForm(account));
  }

  const isDirty =
    form.fullName !== saved.fullName ||
    form.jobTitle !== saved.jobTitle ||
    normalizeContactNo(form.contactNo) !== normalizeContactNo(saved.contactNo);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const validationError = validateProfileForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const contactNo = normalizeContactNo(form.contactNo);

    try {
      // Partial update: only what this card owns. An empty string clears a value and an
      // omitted field is left alone, so sending anything else would overwrite fields this
      // screen does not show.
      await updateProfile.mutateAsync({
        fullName: form.fullName.trim(),
        jobTitle: form.jobTitle.trim(),
        contactNo,
      });

      const next = { ...form, contactNo };
      setForm(next);
      setSaved(next);
      setIsEditing(false);
      toast.success("Profile updated", "Your details have been saved.");
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not save your profile."),
      );
    }
  };

  const handleCancel = () => {
    setForm(saved);
    setError(null);
    setIsEditing(false);
  };

  let subtitle = "Your name, job title and phone number.";
  if (isEditing) {
    subtitle = "Change your details, then save.";
  }

  return (
    <GlassCard>
      <CardHeading
        title="Personal information"
        subtitle={subtitle}
        action={
          isEditing ? null : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text7 text-ehs-normal-blue hover:bg-ehs-normal-blue/10 rounded-2.5 focus-visible:ring-ehs-normal-blue/40 inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-2"
            >
              <Icon
                icon="mdi:pencil-outline"
                className="size-4"
                aria-hidden="true"
              />
              Edit
              <span className="sr-only">personal information</span>
            </button>
          )
        }
      />

      <div className="mt-1 grid gap-4 sm:grid-cols-2">
        <TextInput
          id={FULL_NAME_FIELD_ID}
          label="Full name"
          placeholder="Enter your name"
          autoComplete="name"
          maxLength={FULL_NAME_MAX_LENGTH}
          value={form.fullName}
          disabled={!isEditing || updateProfile.isPending}
          onChange={(event) => updateField("fullName", event.target.value)}
        />

        <TextInput
          label="Job title"
          placeholder="Enter your job title"
          autoComplete="organization-title"
          maxLength={JOB_TITLE_MAX_LENGTH}
          value={form.jobTitle}
          disabled={!isEditing || updateProfile.isPending}
          onChange={(event) => updateField("jobTitle", event.target.value)}
        />

        <PhoneInput
          label="Phone"
          value={form.contactNo}
          disabled={!isEditing || updateProfile.isPending}
          helperText={isEditing ? CONTACT_NO_HINT : undefined}
          onChange={(value) => updateField("contactNo", value)}
        />

        <ReadOnlyField
          label="Email"
          value={account.email}
          note="Your sign-in address. Contact CodeSwift to change it."
        />

        <ReadOnlyField
          label="Role"
          value={account.roleName}
          note="Set when your account was created."
        />

        <ReadOnlyField label="Organization" value={account.organizationName} />
      </div>

      {isEditing ? (
        /* Save appears only in edit mode, and only commits when something actually changed —
           a Save that is always present invites a save that writes nothing. */
        <div className="border-ehs-border mt-2 flex flex-col gap-3 border-t pt-4">
          <FormError id="profile-form-error" message={error} />

          <p role="status" aria-live="polite" className="sr-only">
            {updateProfile.isPending ? "Saving your profile…" : ""}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isDirty ? null : (
              <Text as="p" className="text8 text-ehs-muted-text mr-auto">
                Nothing changed yet.
              </Text>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={updateProfile.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!isDirty}
              loading={updateProfile.isPending}
              loadingText="Saving…"
              aria-busy={updateProfile.isPending || undefined}
              aria-describedby={error ? "profile-form-error" : undefined}
              onClick={() => void handleSave()}
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </GlassCard>
  );
}

/**
 * Shown when the session browsing this company is a platform account rather than a member of it.
 *
 * A SuperAdmin org-scoped token (issued by `select-company`) carries `SiteId` but no
 * `NameIdentifier`, so there is no tenant user behind it — every "my account" endpoint would
 * fail, and there is no name, phone or photo to display in the first place. Their own account
 * lives in the platform area.
 */
function NoTenantUserCard() {
  return (
    <GlassCard>
      <CardHeading
        title="No personal profile in this company"
        subtitle="You are signed in as a Neptune platform account."
      />

      <SettingsCallout>
        <Text as="p" className="text8 text-ehs-gray">
          Platform accounts browse a company without being a member of it, so
          there is no profile, photo or phone number stored against you here.
        </Text>
      </SettingsCallout>

      <Link
        href={buildDefaultSettingsHref(SUPER_SETTINGS_BASE_PATH)}
        className="text7 text-ehs-normal-blue hover:bg-ehs-normal-blue/10 rounded-2.5 focus-visible:ring-ehs-normal-blue/40 inline-flex w-fit items-center gap-1.5 px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-2"
      >
        Go to platform settings
        <Icon icon="mdi:arrow-right" className="size-4" aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}

/**
 * Profile tab for a tenant admin — the area where the whole feature works.
 *
 * Everything on this panel is backed by a real endpoint: `GET /v1/users/{id}` and
 * `GET /v1/organizations/me` to read, `PUT /v1/users/me` to save, and the avatar pair on the
 * card above. Contrast `SuperAdminProfilePanel`, where none of that exists.
 */
export function TenantProfilePanel() {
  const { account, isLoading, isError, hasNoTenantUser } = useTenantAccount();

  if (hasNoTenantUser) {
    return <NoTenantUserCard />;
  }

  if (!account) {
    // Two different states, told apart properly: a failure is an alert the user must act on,
    // a load in progress is a polite status that must not interrupt anything.
    if (isError && !isLoading) {
      return (
        <GlassCard>
          <Text as="p" role="alert" className="text4 text-ehs-red">
            Could not load your profile. Refresh the page to try again.
          </Text>
        </GlassCard>
      );
    }

    return (
      <GlassCard>
        <p role="status" aria-live="polite" className="text4 text-ehs-muted-text">
          Loading your profile…
        </p>
      </GlassCard>
    );
  }

  return (
    <>
      <TenantAvatarCard
        fullName={account.fullName}
        email={account.email}
        profileUrl={account.profileUrl}
      />
      <PersonalInformationCard account={account} />
    </>
  );
}
