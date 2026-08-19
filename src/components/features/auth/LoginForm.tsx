"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { EmailInput, PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearAuthTokens } from "@/lib/auth-tokens";
import { extractAccessToken } from "@/lib/auth-response";
import { clearMfaToken, PORTAL_AUTH, setMfaToken } from "@/lib/auth-flow";
import { getOrgDashboardPath } from "@/lib/auth-redirect";
import { setPortalAccountType } from "@/lib/portal-auth";
import {
  AuthDivider,
  AuthFormError,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
  authFocusRingClass,
} from "./AuthFormChrome";

const LOGIN_ERROR_ID = "login-error";

const UNEXPECTED_RESPONSE_MESSAGE =
  "Sign in did not complete. Please try again, or contact your administrator if it keeps happening.";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      clearMfaToken();
      clearAuthTokens();
      const response = await PORTAL_AUTH.login({ email, password });

      if (
        response.accountType !== "staff" &&
        response.accountType !== "tenant"
      ) {
        setError(UNEXPECTED_RESPONSE_MESSAGE);
        return;
      }

      setPortalAccountType(response.accountType);

      if (response.accessToken) {
        const accessToken =
          extractAccessToken(response) ?? response.accessToken;
        const dashboardPath =
          response.accountType === "staff"
            ? "/super/dashboard"
            : getOrgDashboardPath(accessToken);
        window.location.assign(dashboardPath);
        return;
      }

      if (!response.mfaToken) {
        setError(UNEXPECTED_RESPONSE_MESSAGE);
        return;
      }

      setMfaToken(response.mfaToken);

      if (response.mfaSetupRequired) {
        router.push(PORTAL_AUTH.mfaSetupPath);
        return;
      }

      if (response.mfaRequired) {
        router.push(PORTAL_AUTH.mfaPath);
        return;
      }

      setError(UNEXPECTED_RESPONSE_MESSAGE);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Sign in failed. Check your email and password, then try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthFormHeader
        title="Welcome back."
        description="Sign in to your Neptune admin portal"
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="pt-5">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          required
          autoComplete="username"
          disabled={loading}
        />

        <div className="mt-4">
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            required
            autoComplete="current-password"
            disabled={loading}
          />
          <div className="flex justify-end pt-2">
            <Link
              href={PORTAL_AUTH.forgotPasswordPath}
              className={`text5 text-ehs-normal-blue hover:text-ehs-dark-blue px-2 py-1 transition-colors ${authFocusRingClass}`}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <AuthFormError id={LOGIN_ERROR_ID} message={error} />
          </div>
        ) : null}

        <AuthStatus visuallyHidden>
          {loading ? "Signing you in…" : ""}
        </AuthStatus>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-4"
          loading={loading}
          loadingText="Signing in…"
          aria-busy={loading || undefined}
          aria-describedby={error ? LOGIN_ERROR_ID : undefined}
        >
          Sign in
        </Button>

        {/* The chain is not the same length for everyone, so this says what *may* come next
            rather than printing a step count the screen cannot honestly promise. */}
        <div className="mt-4">
          <AuthNextStepNote>
            If two-factor authentication is on for your account, we will ask for
            a 6-digit code next.
          </AuthNextStepNote>
        </div>
      </form>
    </div>
  );
}
