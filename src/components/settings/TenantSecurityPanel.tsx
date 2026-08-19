"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OtpInput } from "@/components/inputs/OtpInput";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { AuthenticatorSetupKey } from "@/components/features/shared/AuthenticatorSetupKey";
import {
  buildSettingsHref,
  SUPER_SETTINGS_BASE_PATH,
} from "@/components/settings/settings-nav";
import { PasswordRequirements } from "@/components/features/shared/PasswordRequirements";
import {
  FormError,
  SettingsCallout,
  SettingsRow,
  StatusPill,
} from "@/components/settings/SettingsPieces";
import {
  validateAuthenticatorCode,
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/components/settings/settings-validation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getSettingsErrorMessage,
  useChangeMyPassword,
  useDisableMyMfa,
  useEnableMyMfa,
  useSetupMyMfa,
  useSignOutAfterPasswordChange,
  useTenantAccount,
} from "@/hooks/useProfileSettings";
import { toast } from "@/lib/toast";

/**
 * Change password, for a tenant admin.
 *
 * `POST /v1/auth/me/change-password` revokes every refresh token on success, so this signs the
 * user out afterwards rather than leaving them in a session that will drop without explanation
 * the next time it tries to renew. That is also the honest reading of what happened: the
 * credential they signed in with no longer exists.
 */
const NEW_PASSWORD_ID = "tenant-new-password";
const PASSWORD_RULES_ID = "tenant-password-rules";

function ChangePasswordCard() {
  const changePassword = useChangeMyPassword();
  const signOut = useSignOutAfterPasswordChange();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    const passwordError =
      validateNewPassword(newPassword) ??
      validatePasswordConfirmation(newPassword, confirmPassword);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError(null);

    try {
      // `confirmPassword` is a form-only field — it never leaves the browser.
      await changePassword.mutateAsync({ currentPassword, newPassword });

      toast.success(
        "Password changed",
        "Signing you out — sign back in with your new password.",
      );
      signOut();
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not change your password."),
      );
    }
  };

  return (
    <GlassCard>
      <CardHeading
        title="Password"
        subtitle="Change the password you sign in with."
      />

      <form
        className="mt-1 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid max-w-xl gap-4">
          <PasswordInput
            label="Current password"
            placeholder="Enter current password"
            autoComplete="current-password"
            value={currentPassword}
            disabled={changePassword.isPending}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <PasswordInput
              id={NEW_PASSWORD_ID}
              label="New password"
              placeholder="Enter new password"
              autoComplete="new-password"
              aria-describedby={PASSWORD_RULES_ID}
              value={newPassword}
              disabled={changePassword.isPending}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            {/* The rule, stated before the submit rather than in the 400 that follows one. */}
            <PasswordRequirements
              id={PASSWORD_RULES_ID}
              value={newPassword}
            />
          </div>
          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            value={confirmPassword}
            disabled={changePassword.isPending}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {/* Before the click, not after it. Changing this password revokes every refresh token
            the account holds, so the phone in the user's pocket signs out too — that is a fact
            worth reading while the decision is still theirs to make. */}
        <SettingsCallout tone="warning">
          <Text as="p" className="text8 text-ehs-gray">
            Saving this signs you out here and on every other device, including
            the mobile app. Sign back in with the new password.
          </Text>
        </SettingsCallout>

        <FormError id="change-password-error" message={error} />

        <p role="status" aria-live="polite" className="sr-only">
          {changePassword.isPending ? "Updating your password…" : ""}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={changePassword.isPending}
            loadingText="Updating…"
            aria-busy={changePassword.isPending || undefined}
            aria-describedby={error ? "change-password-error" : undefined}
          >
            Update password and sign out
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

/**
 * The enrolment half of the two-factor card: secret, then a code to confirm it.
 *
 * Nothing is reported back to the parent on success — `useEnableMyMfa` invalidates the profile
 * queries, which is what actually moves the card from "off" to "on". Local state here would be
 * a second source of truth for the same fact.
 */
function TwoFactorEnrolment() {
  const setupMfa = useSetupMyMfa();
  const enableMfa = useEnableMyMfa();

  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // "Set up two-factor" replaces itself with the enrolment panel, so the button that had focus
  // stops existing. Focus follows the content it produced.
  const enrolmentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (secret) enrolmentRef.current?.focus();
  }, [secret]);

  const startEnrolment = async () => {
    setError(null);

    try {
      const setup = await setupMfa.mutateAsync();
      setSecret(setup.mfaSecret);
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not start two-factor setup."),
      );
    }
  };

  const confirmEnrolment = async () => {
    const codeError = validateAuthenticatorCode(code);
    if (codeError) {
      setError(codeError);
      return;
    }

    setError(null);

    try {
      await enableMfa.mutateAsync({ code: code.trim() });
      setSecret(null);
      setCode("");
      toast.success(
        "Two-factor turned on",
        "You will be asked for a code the next time you sign in.",
      );
    } catch (caught) {
      setError(getSettingsErrorMessage(caught, "That code was not accepted."));
    }
  };

  if (!secret) {
    return (
      <div className="flex flex-col gap-3">
        <FormError id="mfa-setup-error" message={error} />
        <Button
          type="button"
          variant="primary"
          size="sm"
          leftIcon="mdi:shield-plus-outline"
          loading={setupMfa.isPending}
          loadingText="Preparing…"
          aria-busy={setupMfa.isPending || undefined}
          aria-describedby={error ? "mfa-setup-error" : undefined}
          onClick={() => void startEnrolment()}
        >
          Set up two-factor
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={enrolmentRef}
      tabIndex={-1}
      className="border-ehs-border mt-1 flex flex-col gap-4 border-t pt-4 outline-none"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <Text as="p" className="text4 text-ehs-darker">
          1. Add this key to your authenticator app
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          In Google Authenticator, Microsoft Authenticator, Authy or 1Password,
          choose the option to enter a setup key by hand, then type this in.
        </Text>
        <AuthenticatorSetupKey secret={secret} className="mt-1" />
      </div>

      {/* No QR image, on purpose: the otpauth URI contains the shared secret, and this repo has
          no QR encoder, so drawing one would mean sending the secret to a third-party image
          service. The setup key does the same job without leaking it. The raw otpauth URI is
          not printed either — it is the same secret in a longer, less usable wrapper. */}
      <SettingsCallout>
        <Text as="p" className="text8 text-ehs-gray">
          The key above is your account&rsquo;s shared secret. It is shown as
          text rather than a QR code so it is never sent to an outside image
          service. Do not share it.
        </Text>
      </SettingsCallout>

      <div className="max-w-sm">
        <OtpInput
          label="2. Enter the 6-digit code from the app"
          helperText="The code changes every 30 seconds — enter the one showing now."
          value={code}
          error={error ?? undefined}
          disabled={enableMfa.isPending}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
        />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {enableMfa.isPending ? "Turning on two-factor authentication…" : ""}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={enableMfa.isPending}
          loadingText="Confirming…"
          aria-busy={enableMfa.isPending || undefined}
          onClick={() => void confirmEnrolment()}
        >
          Turn on two-factor
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={enableMfa.isPending}
          onClick={() => {
            setSecret(null);
            setCode("");
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** The turn-off half: re-authentication, then disable. */
function TwoFactorRemoval() {
  const disableMfa = useDisableMyMfa();

  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Same reason as the enrolment panel: the "Turn off" button unmounts itself, and the warning
  // it reveals is the first thing that should be read.
  const removalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) removalRef.current?.focus();
  }, [isOpen]);

  const submit = async () => {
    // The API needs at least one of the two: a password for password accounts, a current
    // authenticator code for SSO-only accounts that have no password hash to verify. This
    // screen cannot tell which kind the account is, so it accepts either and sends what it has.
    if (!currentPassword && !code.trim()) {
      setError(
        "Enter your current password, or a 6-digit code from your authenticator app.",
      );
      return;
    }

    setError(null);

    try {
      await disableMfa.mutateAsync({
        currentPassword: currentPassword || undefined,
        code: code.trim() || undefined,
      });

      setIsOpen(false);
      setCurrentPassword("");
      setCode("");
      toast.success(
        "Two-factor turned off",
        "Delete the old entry from your authenticator app — setting it up again issues a new key.",
      );
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not turn off two-factor."),
      );
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="danger"
        size="sm"
        leftIcon="mdi:shield-off-outline"
        onClick={() => setIsOpen(true)}
      >
        Turn off
      </Button>
    );
  }

  return (
    <div
      ref={removalRef}
      tabIndex={-1}
      className="border-ehs-border mt-1 flex w-full flex-col gap-4 border-t pt-4 outline-none"
    >
      <SettingsCallout tone="warning">
        <Text as="p" className="text8 text-ehs-gray">
          Turning two-factor off clears the stored key rather than parking it.
          Setting it up again issues a new one, so the old authenticator entry
          will stop working and should be deleted.
        </Text>
      </SettingsCallout>

      <div className="grid max-w-xl gap-4">
        <PasswordInput
          label="Current password"
          placeholder="Enter current password"
          autoComplete="current-password"
          value={currentPassword}
          disabled={disableMfa.isPending}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />

        <OtpInput
          label="Or a code from your authenticator app"
          helperText="Only needed if you sign in with Microsoft or Google and have no password."
          value={code}
          disabled={disableMfa.isPending}
          onChange={setCode}
        />
      </div>

      <FormError id="mfa-disable-error" message={error} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="danger"
          size="sm"
          loading={disableMfa.isPending}
          loadingText="Turning off…"
          aria-busy={disableMfa.isPending || undefined}
          aria-describedby={error ? "mfa-disable-error" : undefined}
          onClick={() => void submit()}
        >
          Turn off two-factor
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disableMfa.isPending}
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TwoFactorCard(
  props: Readonly<{ isEnabled: boolean; isReady: boolean }>,
) {
  const { isEnabled, isReady } = props;

  // Until `GET /v1/organizations/me` resolves, `mfaEnabled` is false because it is unknown, not
  // because it is off — offering enrolment then would offer it to someone who already has it.
  if (!isReady) {
    return (
      <GlassCard>
        <CardHeading title="Two-factor authentication" />
        <p role="status" aria-live="polite" className="text4 text-ehs-muted-text">
          Checking your two-factor status…
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <CardHeading
        title="Two-factor authentication"
        subtitle="A code from your authenticator app, on top of your password, every time you sign in."
      />

      <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
        <SettingsRow
          title="Authenticator app"
          description={
            isEnabled
              ? "You will be asked for a code when you sign in."
              : "Protect your account with a second step at sign-in."
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill isOn={isEnabled} label={isEnabled ? "On" : "Off"} />
            {isEnabled ? null : (
              <Icon
                icon="mdi:shield-alert-outline"
                className="text-ehs-yellow size-5"
                aria-hidden="true"
              />
            )}
          </div>
        </SettingsRow>
      </div>

      {isEnabled ? <TwoFactorRemoval /> : <TwoFactorEnrolment />}

      {isEnabled ? null : (
        <SettingsCallout tone="warning">
          <Text as="p" className="text8 text-ehs-gray">
            Without two-factor authentication, anyone with your password can
            sign in to this account.
          </Text>
        </SettingsCallout>
      )}
    </GlassCard>
  );
}

/**
 * Security tab for a tenant admin — password and two-factor, both fully wired.
 *
 * Contrast `SuperAdminSecurityPanel`: none of these endpoints work for a platform account,
 * because every one of them resolves its caller from a claim a SuperAdmin token does not carry.
 */
export function TenantSecurityPanel() {
  const { account, isLoading, hasNoTenantUser } = useTenantAccount();

  if (hasNoTenantUser) {
    return (
      <GlassCard>
        <CardHeading
          title="No account security to manage here"
          subtitle="You are signed in as a Neptune platform account."
        />
        <SettingsCallout>
          <Text as="p" className="text8 text-ehs-gray">
            Password and two-factor settings on this page belong to a company
            user. Yours live in the platform area instead — the difference is
            deliberate: a platform account is not a member of this company.
          </Text>
        </SettingsCallout>

        {/* Same escape hatch, same wording and same place as the Profile tab's version. */}
        <Link
          href={buildSettingsHref(SUPER_SETTINGS_BASE_PATH, "security")}
          className="text7 text-ehs-normal-blue hover:bg-ehs-normal-blue/10 rounded-2.5 focus-visible:ring-ehs-normal-blue/40 inline-flex w-fit items-center gap-1.5 px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-2"
        >
          Go to platform settings
          <Icon icon="mdi:arrow-right" className="size-4" aria-hidden="true" />
        </Link>
      </GlassCard>
    );
  }

  return (
    <>
      <TwoFactorCard
        isEnabled={account?.mfaEnabled === true}
        isReady={Boolean(account) && !isLoading}
      />
      <ChangePasswordCard />
    </>
  );
}
