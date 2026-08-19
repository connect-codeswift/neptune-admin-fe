"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { OtpInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { extractAccessToken } from "@/lib/auth-response";
import {
  getAuthToken,
  getOrgToken,
  setAuthRole,
  setAuthToken,
  setOrgToken,
} from "@/lib/auth-tokens";
import { clearMfaToken, PORTAL_AUTH } from "@/lib/auth-flow";
import {
  getPortalMfaConfig,
  type PortalAccountType,
} from "@/lib/portal-auth";
import {
  AuthBackLink,
  AuthDivider,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
} from "./AuthFormChrome";
import { useMfaSession } from "./useMfaSession";

/** Fixed so the submit button can point `aria-describedby` at the field's own error message. */
const CODE_FIELD_ID = "mfa-verify-code";
const CODE_ERROR_ID = `${CODE_FIELD_ID}-error`;

function persistSession(accountType: PortalAccountType, accessToken: string) {
  if (accountType === "staff") {
    setAuthToken(accessToken);
    setAuthRole("super-admin");
    return;
  }

  setOrgToken(accessToken);
  setAuthRole("admin");
}

function hasPersistedSession(accountType: PortalAccountType): boolean {
  return accountType === "staff"
    ? Boolean(getAuthToken())
    : Boolean(getOrgToken());
}

export function MfaVerifyForm() {
  const router = useRouter();
  const session = useMfaSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSession = Boolean(session.mfaToken) && Boolean(session.accountType);

  useEffect(() => {
    // Only once browser storage has actually been read. Redirecting on the first render would
    // bounce every visitor back to sign-in, because nothing is known at that point.
    if (!session.isReady || hasSession) return;
    router.replace(PORTAL_AUTH.loginPath);
  }, [hasSession, router, session.isReady]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { mfaToken, accountType } = session;
    if (!mfaToken || !accountType) return;

    if (code.length !== 6) {
      setError("Enter all 6 digits from your authenticator app.");
      return;
    }

    const mfaConfig = getPortalMfaConfig(accountType);

    setError(null);
    setLoading(true);
    try {
      const response = await mfaConfig.verifyMfa({ mfaToken, code });

      const accessToken = extractAccessToken(response);
      if (!accessToken) {
        setError("No session was issued. Go back and sign in again.");
        return;
      }

      if (!hasPersistedSession(accountType)) {
        persistSession(accountType, accessToken);
      }

      clearMfaToken();
      window.location.assign(mfaConfig.resolveDashboardPath(accessToken));
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Verification failed.";

      if (message.toLowerCase().includes("expired")) {
        // An inline message would be unmounted by the redirect, so this one has to be a toast.
        toast.error("Your sign-in expired. Please sign in again.");
        clearMfaToken();
        router.replace(PORTAL_AUTH.loginPath);
        return;
      }

      setError(message);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  if (!session.isReady) {
    return (
      <div>
        <AuthFormHeader
          title="Two-factor authentication"
          description="One moment while we pick up where your sign-in left off."
        />
        <div className="pt-6">
          <AuthStatus>Checking your sign-in…</AuthStatus>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div>
        <AuthFormHeader
          title="Your sign-in has expired"
          description="This step stays open for a few minutes only. Start again from the sign-in screen."
        />
        <div className="flex flex-col gap-6 pt-6">
          <AuthStatus visuallyHidden>
            Sign-in expired. Returning you to the sign-in screen.
          </AuthStatus>
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
        step="Step 2 of 2 — verify"
        title="Two-factor authentication"
        description="Your password was accepted. Enter the 6-digit code from your authenticator app to finish signing in."
      />
      <AuthDivider label="verification code" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-5">
        <OtpInput
          id={CODE_FIELD_ID}
          label="Authentication code"
          helperText="The code changes every 30 seconds — enter the one showing now."
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          error={error ?? undefined}
          autoFocus
          disabled={loading}
        />

        <AuthStatus visuallyHidden>
          {loading ? "Verifying your code…" : ""}
        </AuthStatus>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          loadingText="Verifying…"
          disabled={code.length !== 6}
          aria-busy={loading || undefined}
          aria-describedby={error ? CODE_ERROR_ID : undefined}
        >
          Verify and continue
        </Button>

        <AuthNextStepNote>
          Next stop is your dashboard. Lost access to your authenticator app?
          Ask an administrator to reset it for you.
        </AuthNextStepNote>

        <AuthBackLink
          href={PORTAL_AUTH.loginPath}
          onClick={() => clearMfaToken()}
        >
          Back to sign in
        </AuthBackLink>
      </form>
    </div>
  );
}
