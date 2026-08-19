"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EmailInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { validateEmail } from "@/components/settings/settings-validation";
import { PORTAL_AUTH } from "@/lib/auth-flow";
import { assertApiSuccess } from "@/lib/api-response";
import { superAdminForgotPassword } from "@/services/super-admin-auth.service";
import {
  AuthBackLink,
  AuthFormError,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
} from "./AuthFormChrome";

const FORM_ERROR_ID = "forgot-password-error";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Submitting replaces the whole view, taking the button that had focus with it. Without this
  // the focus ring lands back on <body> and a keyboard or screen-reader user has no idea the
  // screen moved on at all.
  const confirmationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (submitted) confirmationRef.current?.focus();
  }, [submitted]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    if (nextEmailError) {
      setEmailError(nextEmailError);
      setFormError(null);
      return;
    }

    setEmailError(null);
    setFormError(null);
    setLoading(true);
    try {
      const response = await superAdminForgotPassword({ email: email.trim() });
      assertApiSuccess(response, "Failed to send verification code.");
      setSubmitted(true);
    } catch (caught) {
      setFormError(
        caught instanceof Error
          ? caught.message
          : "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const params = new URLSearchParams({ email: email.trim() });
    router.push(`${PORTAL_AUTH.resetPasswordPath}?${params.toString()}`);
  };

  if (submitted) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="outline-none focus-visible:outline-none"
      >
        <AuthFormHeader
          step="Step 1 of 2 — code sent"
          title="Check your email"
          description="If an account exists for that address, a 6-digit verification code is on its way. It expires 15 minutes after it is sent."
        />

        <div className="flex flex-col gap-4 pt-8">
          {/* Announced rather than only shown: the screen changed under a user who cannot see
              that it did. */}
          <AuthStatus visuallyHidden>
            {`Verification code sent to ${email.trim()}. Continue to enter it.`}
          </AuthStatus>

          <div className="border-ehs-normal-blue/25 bg-ehs-normal-blue-bg-light rounded-2.5 flex items-start gap-2.5 border p-3">
            <Icon
              icon="mdi:email-fast-outline"
              className="text-ehs-normal-blue mt-px size-4.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text8 text-ehs-gray min-w-0 text-pretty break-words">
              {`Sent to ${email.trim()}. Nothing after a minute or two? Check your spam folder — and note that no code is sent if the address has no account.`}
            </p>
          </div>

          <Button
            type="button"
            fullWidth
            size="lg"
            rightIcon="lucide:arrow-right"
            onClick={handleContinue}
          >
            Enter verification code
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            size="lg"
            leftIcon="mdi:pencil-outline"
            onClick={() => {
              setSubmitted(false);
              setFormError(null);
            }}
          >
            Use a different email
          </Button>

          <AuthBackLink href={PORTAL_AUTH.loginPath}>
            Back to sign in
          </AuthBackLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthFormHeader
        step="Step 1 of 2 — request a code"
        title="Forgot password?"
        description="Enter your email address and we will send a 6-digit verification code."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-8">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(null);
            setFormError(null);
          }}
          required
          autoComplete="username"
          error={emailError ?? undefined}
          helperText="The address you sign in with."
          disabled={loading}
        />

        <AuthFormError id={FORM_ERROR_ID} message={formError} />

        <AuthStatus visuallyHidden>
          {loading ? "Sending your verification code…" : ""}
        </AuthStatus>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-2"
          loading={loading}
          loadingText="Sending…"
          aria-busy={loading || undefined}
          aria-describedby={formError ? FORM_ERROR_ID : undefined}
        >
          Send verification code
        </Button>

        <AuthNextStepNote>
          Next: enter the code from that email and choose a new password.
        </AuthNextStepNote>

        <AuthBackLink href={PORTAL_AUTH.loginPath}>Back to sign in</AuthBackLink>
      </form>
    </div>
  );
}
