"use client";

import { useEffect, useRef, useState } from "react";
import { EmailInput } from "@/components/inputs/EmailInput";
import { OtpInput } from "@/components/inputs/OtpInput";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import {
  FormError,
  SettingsCallout,
} from "@/components/settings/SettingsPieces";
import { PasswordRequirements } from "@/components/features/shared/PasswordRequirements";
import {
  validateEmail,
  validateNewPassword,
  validateOtp,
  validatePasswordConfirmation,
} from "@/components/settings/settings-validation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getSettingsErrorMessage,
  useSettingsIdentity,
  useSignOutAfterPasswordChange,
  useSuperAdminResetPassword,
  useSuperAdminSendResetCode,
} from "@/hooks/useProfileSettings";
import { toast } from "@/lib/toast";

type ResetStep = "request" | "confirm";

const NEW_PASSWORD_ID = "super-new-password";
const PASSWORD_RULES_ID = "super-password-rules";

/**
 * Change password, for a CodeSwift platform account.
 *
 * This is an emailed-code flow rather than the ordinary "current password → new password" form,
 * and the reason is a backend capability gap rather than a security preference.
 *
 * `POST /v1/auth/me/change-password` — the endpoint the tenant Security tab uses — resolves its
 * caller with `int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)` and then reads the
 * tenant `Users` table. A SuperAdmin session token carries only `id` and
 * `purpose: "superadmin-session"`; it has no `NameIdentifier` claim and there is no `Users` row
 * behind it. Calling it therefore does not return a clean 401 — it throws inside `int.Parse` and
 * comes back as an HTTP 500. There is no super-admin equivalent of it either.
 *
 * What does exist, and works today with no backend change, is the pair this card drives:
 * `POST /v1/super-admin/auth/forgot-password` (emails a 6-digit OTP) then
 * `POST /v1/super-admin/auth/reset-password` (`{ email, otp, newPassword }`). Both are anonymous
 * login-flow endpoints, which is why the email has to be sent along rather than taken from the
 * session, and why the current password is never asked for: possession of the mailbox is the
 * proof.
 *
 * If a super-admin change-password endpoint is added, this card becomes the same three-field
 * form the tenant side uses and the whole two-step dance goes away.
 */
function SuperAdminPasswordCard() {
  const identity = useSettingsIdentity();
  const sendCode = useSuperAdminSendResetCode();
  const resetPassword = useSuperAdminResetPassword();
  const signOut = useSignOutAfterPasswordChange();

  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Step 2 replaces step 1 in place, unmounting the button that was focused. Moving focus to the
  // new form is what tells a non-sighted user the card advanced rather than emptied.
  const confirmStepRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (step === "confirm") confirmStepRef.current?.focus();
  }, [step]);

  // The signed-in email arrives after the first client render, because it comes from
  // localStorage. Adopting it once, while the field is still untouched, prefills the form
  // without ever overwriting an address the user has started typing.
  const [adoptedEmail, setAdoptedEmail] = useState<string | null>(null);
  const storedEmail = identity.email ?? "";
  if (identity.isReady && adoptedEmail !== storedEmail) {
    setAdoptedEmail(storedEmail);
    if (!email) setEmail(storedEmail);
  }

  const handleSendCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError(null);

    try {
      await sendCode.mutateAsync({ email: email.trim() });
      setStep("confirm");
      toast.success(
        "Code sent",
        "Check your inbox for a 6-digit verification code.",
      );
    } catch (caught) {
      setError(
        getSettingsErrorMessage(caught, "Could not send the verification code."),
      );
    }
  };

  const handleReset = async () => {
    const formError =
      validateOtp(otp) ??
      validateNewPassword(newPassword) ??
      validatePasswordConfirmation(newPassword, confirmPassword);

    if (formError) {
      setError(formError);
      return;
    }

    setError(null);

    try {
      await resetPassword.mutateAsync({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

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
        subtitle="Platform accounts are secured separately, so a verification code is emailed to you before the password changes."
      />

      {/* Both steps of the two-step flow are named up front, so the card does not appear to
          have silently swapped itself for a different form after the first button. */}
      <p className="text8 text-ehs-muted-text">
        {step === "request"
          ? "Step 1 of 2 — we email you a 6-digit code."
          : "Step 2 of 2 — enter that code and choose the new password."}
      </p>

      {step === "request" ? (
        <form
          className="mt-1 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSendCode();
          }}
        >
          <div className="grid max-w-xl gap-4">
            <EmailInput
              label="Your platform email"
              placeholder="you@codeswift.org"
              autoComplete="email"
              value={email}
              disabled={sendCode.isPending}
              helperText="The code is sent here. It must be the address you sign in with."
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {/* Stated before the first click of the two, not sprung on step 2. */}
          <SettingsCallout tone="warning">
            <Text as="p" className="text8 text-ehs-gray">
              Finishing this signs you out of Neptune — the new password is what
              you will sign back in with.
            </Text>
          </SettingsCallout>

          <FormError id="super-send-code-error" message={error} />

          <p role="status" aria-live="polite" className="sr-only">
            {sendCode.isPending ? "Sending your verification code…" : ""}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon="mdi:email-fast-outline"
              loading={sendCode.isPending}
              loadingText="Sending…"
              aria-busy={sendCode.isPending || undefined}
              aria-describedby={error ? "super-send-code-error" : undefined}
            >
              Send code to my email
            </Button>
          </div>
        </form>
      ) : (
        <form
          ref={confirmStepRef}
          tabIndex={-1}
          className="mt-1 flex flex-col gap-4 outline-none"
          onSubmit={(event) => {
            event.preventDefault();
            void handleReset();
          }}
        >
          <Text as="p" className="text8 text-ehs-muted-text">
            {`We sent a 6-digit code to ${email}. It is valid for a short time — request a new one if it expires.`}
          </Text>

          <div className="grid max-w-xl gap-4">
            <OtpInput
              label="Verification code"
              helperText="The 6 digits from the email we just sent."
              value={otp}
              disabled={resetPassword.isPending}
              onChange={setOtp}
            />

            <div className="flex flex-col gap-2">
              <PasswordInput
                id={NEW_PASSWORD_ID}
                label="New password"
                placeholder="Enter new password"
                autoComplete="new-password"
                aria-describedby={PASSWORD_RULES_ID}
                value={newPassword}
                disabled={resetPassword.isPending}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              {/* Same rule, same component, same place as the tenant Security tab. */}
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
              disabled={resetPassword.isPending}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <SettingsCallout tone="warning">
            <Text as="p" className="text8 text-ehs-gray">
              Saving this signs you out immediately. Sign back in with the new
              password.
            </Text>
          </SettingsCallout>

          <FormError id="super-reset-error" message={error} />

          <p role="status" aria-live="polite" className="sr-only">
            {resetPassword.isPending ? "Updating your password…" : ""}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={resetPassword.isPending}
              loadingText="Updating…"
              aria-busy={resetPassword.isPending || undefined}
              aria-describedby={error ? "super-reset-error" : undefined}
            >
              Change password and sign out
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resetPassword.isPending || sendCode.isPending}
              loading={sendCode.isPending}
              loadingText="Sending…"
              onClick={() => void handleSendCode()}
            >
              Resend code
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resetPassword.isPending}
              onClick={() => {
                setStep("request");
                setOtp("");
                setError(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        </form>
      )}
    </GlassCard>
  );
}

/**
 * Two-factor for a platform account is real, but it cannot be driven from a settings page.
 *
 * `POST /v1/super-admin/auth/mfa/setup` and `/mfa/enable` are anonymous endpoints that take an
 * `mfaToken` minted by `POST /v1/super-admin/auth/login` — they exist to complete enrolment
 * during sign-in, not to change a setting afterwards, and there is no disable endpoint at all.
 * Saying so is better than a toggle that 400s.
 */
function SuperAdminTwoFactorNote() {
  return (
    <GlassCard>
      <CardHeading
        title="Two-factor authentication"
        subtitle="Always on for platform accounts, and set up during sign-in."
      />

      <SettingsCallout>
        <div className="flex flex-col gap-2">
          <Text as="p" className="text8 text-ehs-gray">
            Every platform sign-in is challenged for an authenticator code, and
            enrolment happens as part of that sign-in rather than here — the
            setup endpoints run on the short-lived token the login step issues,
            which a signed-in session does not hold.
          </Text>
          <Text as="p" className="text8 text-ehs-gray">
            Lost your authenticator? Ask a CodeSwift administrator to reset it —
            there is no self-service way to turn it off.
          </Text>
        </div>
      </SettingsCallout>
    </GlassCard>
  );
}

/** Security tab for a CodeSwift platform account. */
export function SuperAdminSecurityPanel() {
  return (
    <>
      <SuperAdminPasswordCard />
      <SuperAdminTwoFactorNote />
    </>
  );
}
