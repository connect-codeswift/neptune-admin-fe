"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Text } from "@/components/Text";
import {
  AVATAR_ACCEPT_ATTRIBUTE,
  isAvatarUploadConfigured,
  uploadAvatarImage,
  validateAvatarFile,
} from "@/components/settings/avatar-upload";
import {
  FormError,
  SettingsCallout,
} from "@/components/settings/SettingsPieces";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getSettingsErrorMessage,
  useRemoveMyAvatar,
  useSetMyAvatar,
} from "@/hooks/useProfileSettings";
import { toast } from "@/lib/toast";

function getInitials(fullName: string, email: string): string {
  const source = fullName.trim() || email.trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export type TenantAvatarCardProps = Readonly<{
  fullName: string;
  email: string;
  profileUrl: string | null;
}>;

/**
 * Profile photo.
 *
 * Uploading and removing are separate capabilities here, which is unusual and worth stating:
 * the remove is a plain DELETE and always works, while the upload needs a Cloudinary
 * destination the API will accept. See the header of `avatar-upload.ts` for why the platform's
 * own file store cannot be used for this one field.
 */
export function TenantAvatarCard(props: Readonly<TenantAvatarCardProps>) {
  const { fullName, email, profileUrl } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setAvatar = useSetMyAvatar();
  const removeAvatar = useRemoveMyAvatar();

  const canUpload = isAvatarUploadConfigured();
  const isBusy = isUploading || setAvatar.isPending || removeAvatar.isPending;

  const handleFileChosen = async (file: File) => {
    const fileError = validateAvatarFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const secureUrl = await uploadAvatarImage(file);
      await setAvatar.mutateAsync(secureUrl);
      toast.success("Photo updated", "Your new profile photo is saved.");
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not update your photo."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setError(null);

    try {
      await removeAvatar.mutateAsync();
      toast.success("Photo removed", "Your initials are shown instead.");
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not remove your photo."),
      );
    }
  };

  return (
    <GlassCard>
      <CardHeading
        title="Profile photo"
        subtitle="Shown next to your name across Neptune."
      />

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <div className="border-ehs-border bg-ehs-surface-inverse/6 relative size-20 shrink-0 overflow-hidden rounded-full border">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <>
              <span
                aria-hidden="true"
                className="text-ehs-muted-text flex size-full items-center justify-center text3"
              >
                {getInitials(fullName, email)}
              </span>
              <span className="sr-only">
                No profile photo set. Your initials are shown instead.
              </span>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT_ATTRIBUTE}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleFileChosen(file);
              }}
            />

            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon="mdi:tray-arrow-up"
              disabled={!canUpload || isBusy}
              loading={isUploading || setAvatar.isPending}
              loadingText="Uploading…"
              aria-busy={isBusy || undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              {profileUrl ? "Replace photo" : "Upload photo"}
            </Button>

            {profileUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon="mdi:trash-can-outline"
                disabled={isBusy}
                loading={removeAvatar.isPending}
                loadingText="Removing…"
                onClick={() => void handleRemove()}
              >
                Remove
              </Button>
            ) : null}
          </div>

          <Text as="p" className="text8 text-ehs-muted-text">
            JPG, PNG or WebP, up to 5 MB.
          </Text>

          <p role="status" aria-live="polite" className="sr-only">
            {isBusy ? "Updating your profile photo…" : ""}
          </p>
        </div>
      </div>

      <FormError id="avatar-error" message={error} />

      {canUpload ? null : (
        <SettingsCallout>
          <Text as="p" className="text8 text-ehs-gray">
            Photo uploads are not configured for this environment. The avatar
            API only accepts an image hosted on Cloudinary, and no Cloudinary
            credentials are set here — the platform file store issues short-lived
            links on a different host, which the API rejects. Removing an
            existing photo still works.
          </Text>
        </SettingsCallout>
      )}
    </GlassCard>
  );
}
