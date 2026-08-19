"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, OtpInput, PasswordInput } from "@/components/inputs";
import { Button, TextButton } from "@/components/ui";
import { PasswordRequirements } from "@/components/features/shared/PasswordRequirements";
import {
  validateEmail,
  validateNewPassword,
  validateOtp,
  validatePasswordConfirmation,
} from "@/components/settings/settings-validation";
import { PORTAL_AUTH } from "@/lib/auth-flow";
import { assertApiSuccess } from "@/lib/api-response";
import {
  superAdminForgotPassword,
  superAdminResetPassword,
} from "@/services/super-admin-auth.service";
import {
  AuthBackLink,
  AuthFormError,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
} from "./AuthFormChrome";

const RESET_FAILURE_MESSAGE =
  "That code was not accepted. It may have expired — request a new one and try again.";

const FORM_ERROR_ID = "reset-password-error";
const NEW_PASSWORD_ID = "reset-new-password";
const PASSWORD_RULES_ID = "reset-password-rules";

type FieldErrors = {
  email: string | null;
  otp: string | null;
  password: string | null;
  confirmPassword: string | null;
};

const NO_FIELD_ERRORS: FieldErrors = {
  email: null,
  otp: null,
  password: null,
  confirmPassword: null,
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_FIELD_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors(NO_FIELD_ERRORS);
    setFormError(null);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Every field is checked, so the user sees the whole list of what to fix rather than one
    // problem at a time. The password rule is the API's own — see `settings-validation.ts`.
    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      otp: validateOtp(otp),
      password: validateNewPassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setFormError("Check the highlighted fields and try again.");
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      const response = await superAdminResetPassword({
        email: email.trim(),
        otp,
        newPassword: password,
      });
      assertApiSuccess(response, RESET_FAILURE_MESSAGE);
      // The redirect unmounts this form, so the confirmation has to outlive it.
      toast.success("Password updated. Sign in with your new password.");
      router.replace(PORTAL_AUTH.loginPath);
    } catch {
      setFormError(RESET_FAILURE_MESSAGE);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldErrors({ ...NO_FIELD_ERRORS, email: emailError });
      return;
    }

    clearErrors();
    setResending(true);
    try {
      const response = await superAdminForgotPassword({ email: email.trim() });
      assertApiSuccess(response, "Failed to resend verification code.");
      toast.success("If an account exists, a new code has been sent.");
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : "Failed to resend verification code.",
      );
    } finally {
      setResending(false);
    }
  };

  const isBusy = loading || resending;

  // `PasswordInput` spreads caller props last, so passing `aria-describedby` replaces the one it
  // builds for its own error message. Both ids are listed here instead, keeping the rule list
  // and the failure reason on the same field.
  const passwordDescribedBy = [
    fieldErrors.password ? `${NEW_PASSWORD_ID}-error` : null,
    PASSWORD_RULES_ID,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <AuthFormHeader
        step="Step 2 of 2 — new password"
        title="Reset password"
        description="Enter the 6-digit code we emailed you, then choose a new password."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-8">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: null }));
          }}
          required
          autoComplete="username"
          error={fieldErrors.email ?? undefined}
          helperText={
            initialEmail
              ? "The address the code was sent to. Go back a step to use a different one."
              : undefined
          }
          disabled={isBusy || Boolean(initialEmail)}
        />

        <OtpInput
          label="Verification code"
          helperText="6 digits, from the email we just sent. It expires 15 minutes after it is sent."
          value={otp}
          onChange={(next) => {
            setOtp(next);
            setFieldErrors((current) => ({ ...current, otp: null }));
          }}
          error={fieldErrors.otp ?? undefined}
          disabled={isBusy}
          autoFocus={Boolean(initialEmail)}
        />

        <div className="flex justify-end">
          <TextButton
            type="button"
            size="sm"
            underline="always"
            onClick={() => void handleResend()}
            disabled={isBusy}
          >
            {resending ? "Resending…" : "Resend code"}
          </TextButton>
        </div>

        <div className="flex flex-col gap-2">
          <PasswordInput
            id={NEW_PASSWORD_ID}
            label="New password"
            placeholder="Enter your new password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: null }));
            }}
            required
            autoComplete="new-password"
            aria-describedby={passwordDescribedBy}
            error={fieldErrors.password ?? undefined}
            disabled={isBusy}
          />
          {/* Stated up front, not after a rejected submit. */}
          <PasswordRequirements id={PASSWORD_RULES_ID} value={password} />
        </div>

        <PasswordInput
          label="Confirm new password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((current) => ({
              ...current,
              confirmPassword: null,
            }));
          }}
          required
          autoComplete="new-password"
          error={fieldErrors.confirmPassword ?? undefined}
          disabled={isBusy}
        />

        <AuthFormError id={FORM_ERROR_ID} message={formError} />

        <AuthStatus visuallyHidden>
          {loading ? "Updating your password…" : ""}
        </AuthStatus>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-2"
          loading={loading}
          loadingText="Updating…"
          disabled={resending}
          aria-busy={loading || undefined}
          aria-describedby={formError ? FORM_ERROR_ID : undefined}
        >
          Update password
        </Button>

        <AuthNextStepNote>
          Next: sign in with your new password. Any other device stays signed in
          until its session ends.
        </AuthNextStepNote>

        <AuthBackLink href={PORTAL_AUTH.forgotPasswordPath}>
          Back a step
        </AuthBackLink>
      </form>
    </div>
  );
}
