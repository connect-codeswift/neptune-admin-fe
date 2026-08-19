"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
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
import { getPortalMfaConfig } from "@/lib/portal-auth";
import { AuthenticatorSetupKey } from "@/components/features/shared/AuthenticatorSetupKey";
import {
  AuthBackLink,
  AuthDivider,
  AuthFormError,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
} from "./AuthFormChrome";
import { useMfaSession } from "./useMfaSession";

const CODE_FIELD_ID = "mfa-setup-code";
const CODE_ERROR_ID = `${CODE_FIELD_ID}-error`;
const SETUP_ERROR_ID = "mfa-setup-error";

export function MfaSetupForm() {
  const router = useRouter();
  const session = useMfaSession();
  const setupStarted = useRef(false);

  const [mfaSecret, setMfaSecret] = useState("");
  const [code, setCode] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingEnable, setLoadingEnable] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [enableError, setEnableError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const hasSession = Boolean(session.mfaToken) && Boolean(session.accountType);

  useEffect(() => {
    if (!session.isReady) return;

    const { mfaToken, accountType } = session;
    if (!mfaToken || !accountType) {
      router.replace(PORTAL_AUTH.loginPath);
      return;
    }

    // The ref stops React's development double-invoke from spending two setup calls — and, more
    // importantly, from burning two secrets — on a single visit. `retryCount` is what lets the
    // "Try again" button back through it.
    //
    // Deliberately no in-flight cancellation on cleanup: with the ref guard above, the second
    // invocation returns early, so a cancelled first request would leave the screen stuck on
    // "Preparing your setup key…" forever. Landing a result into an unmounted component is a
    // no-op in React 18+, which is the cheaper of the two failure modes by a wide margin.
    if (setupStarted.current && retryCount === 0) return;
    setupStarted.current = true;

    setLoadingSetup(true);
    setSetupError(null);

    getPortalMfaConfig(accountType)
      .mfaSetup(mfaToken)
      .then((response) => {
        setMfaSecret(response.mfaSecret);
      })
      .catch((caught: unknown) => {
        setSetupError(
          caught instanceof Error
            ? caught.message
            : "Could not start two-factor setup.",
        );
      })
      .finally(() => {
        setLoadingSetup(false);
      });
  }, [retryCount, router, session]);

  const handleEnable = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { mfaToken, accountType } = session;
    if (!mfaToken || !accountType) return;

    if (code.length !== 6) {
      setEnableError("Enter all 6 digits from your authenticator app.");
      return;
    }

    const mfaConfig = getPortalMfaConfig(accountType);

    setEnableError(null);
    setLoadingEnable(true);
    try {
      const response = await mfaConfig.mfaEnable(mfaToken, code);
      const accessToken = extractAccessToken(response);
      if (!accessToken) {
        setEnableError("No session was issued. Go back and sign in again.");
        return;
      }

      if (accountType === "staff" && !getAuthToken()) {
        setAuthToken(accessToken);
        setAuthRole("super-admin");
      }
      if (accountType === "tenant" && !getOrgToken()) {
        setOrgToken(accessToken);
        setAuthRole("admin");
      }

      clearMfaToken();
      window.location.assign(mfaConfig.resolveDashboardPath(accessToken));
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not enable MFA.";

      if (message.toLowerCase().includes("expired")) {
        // An inline message would be unmounted by the redirect, so this one has to be a toast.
        toast.error("Your sign-in expired. Please sign in again.");
        clearMfaToken();
        router.replace(PORTAL_AUTH.loginPath);
        return;
      }

      setEnableError(message);
      setCode("");
    } finally {
      setLoadingEnable(false);
    }
  };

  if (!session.isReady) {
    return (
      <div>
        <AuthFormHeader
          title="Set up your authenticator"
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

  const isSetupReady = !loadingSetup && !setupError && Boolean(mfaSecret);

  return (
    <div>
      <AuthFormHeader
        step="Step 2 of 2 — set up"
        title="Set up your authenticator"
        description="Two-factor authentication is required on this account. Add the key below to your authenticator app, then confirm with the code it shows."
      />
      <AuthDivider label="one-time setup" />

      <div className="flex flex-col gap-6 pt-5">
        {loadingSetup ? (
          <AuthStatus>Preparing your setup key…</AuthStatus>
        ) : null}

        {setupError ? (
          <div className="flex flex-col gap-3">
            <AuthFormError id={SETUP_ERROR_ID} message={setupError} />
            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon="mdi:refresh"
              aria-describedby={SETUP_ERROR_ID}
              onClick={() => setRetryCount((current) => current + 1)}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {isSetupReady ? (
          <>
            <AuthStatus visuallyHidden>
              Your setup key is ready. Add it to your authenticator app, then
              enter the 6-digit code it shows.
            </AuthStatus>

            <ol className="border-ehs-border-ink/10 bg-ehs-surface/62 rounded-5 flex flex-col gap-5 border p-5">
              <li className="flex min-w-0 flex-col gap-1">
                <p className="text5 text-ehs-darker">
                  1. Open your authenticator app
                </p>
                <p className="text8 text-ehs-muted-text text-pretty">
                  Google Authenticator, Microsoft Authenticator, Authy and
                  1Password all work. Choose the option to enter a setup key by
                  hand rather than the scan option — there is no QR code here.
                </p>
              </li>

              <li className="flex min-w-0 flex-col gap-2">
                <p className="text5 text-ehs-darker">
                  2. Type this key into the app
                </p>
                <p className="text8 text-ehs-muted-text text-pretty">
                  Enter it exactly as shown, ignoring the spacing, and pick the
                  time-based option if the app asks which kind it is.
                </p>
                <AuthenticatorSetupKey secret={mfaSecret} />
              </li>

              <li className="flex min-w-0 flex-col gap-1">
                <p className="text5 text-ehs-darker">
                  3. Enter the 6-digit code it shows
                </p>
                <p className="text8 text-ehs-muted-text text-pretty">
                  The app starts generating codes as soon as the key is saved.
                </p>
              </li>
            </ol>

            <div className="border-ehs-normal-blue/25 bg-ehs-normal-blue-bg-light rounded-2.5 flex items-start gap-2.5 border p-3">
              <Icon
                icon="mdi:shield-key-outline"
                className="text-ehs-normal-blue mt-px size-4.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text8 text-ehs-gray min-w-0 text-pretty">
                This key is your account&rsquo;s shared secret. It is shown as
                text rather than a QR code so that it never leaves your browser
                — a QR image would have to be drawn by an outside service. Keep
                it private, and store it somewhere safe if you want to add this
                account to a second device later.
              </p>
            </div>

            <form onSubmit={handleEnable} className="flex flex-col gap-5">
              <OtpInput
                id={CODE_FIELD_ID}
                label="Authentication code"
                helperText="The 6 digits currently showing in your authenticator app."
                value={code}
                onChange={(next) => {
                  setCode(next);
                  if (enableError) setEnableError(null);
                }}
                error={enableError ?? undefined}
                disabled={loadingEnable}
              />

              <AuthStatus visuallyHidden>
                {loadingEnable ? "Turning on two-factor authentication…" : ""}
              </AuthStatus>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loadingEnable}
                loadingText="Enabling…"
                disabled={code.length !== 6}
                aria-busy={loadingEnable || undefined}
                aria-describedby={enableError ? CODE_ERROR_ID : undefined}
              >
                Enable and continue
              </Button>

              <AuthNextStepNote>
                Once this is on you go straight to your dashboard, and every
                future sign-in asks for a code from this app.
              </AuthNextStepNote>
            </form>
          </>
        ) : null}

        <AuthBackLink
          href={PORTAL_AUTH.loginPath}
          onClick={() => clearMfaToken()}
        >
          Back to sign in
        </AuthBackLink>
      </div>
    </div>
  );
}
