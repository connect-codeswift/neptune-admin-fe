"use client";

import Link from "next/link";
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
import {
  clearMfaToken,
  getMfaToken,
  PORTAL_AUTH,
} from "@/lib/auth-flow";
import {
  getPortalAccountType,
  getPortalMfaConfig,
} from "@/lib/portal-auth";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

export function MfaSetupForm() {
  const router = useRouter();
  const setupStarted = useRef(false);
  const [storedMfaToken] = useState(() => getMfaToken());
  const [accountType] = useState(() => getPortalAccountType());
  const [mfaSecret, setMfaSecret] = useState("");
  const [otpAuthUri, setOtpAuthUri] = useState("");
  const [code, setCode] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingEnable, setLoadingEnable] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!storedMfaToken || !accountType) {
      router.replace(PORTAL_AUTH.loginPath);
      return;
    }

    if (setupStarted.current) return;
    setupStarted.current = true;

    const mfaConfig = getPortalMfaConfig(accountType);

    mfaConfig
      .mfaSetup(storedMfaToken)
      .then((response) => {
        setMfaSecret(response.mfaSecret);
        setOtpAuthUri(response.otpAuthUri);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Could not start MFA setup.";
        setSetupError(message);
        toast.error(message);
      })
      .finally(() => setLoadingSetup(false));
  }, [accountType, router, storedMfaToken]);

  const handleEnable = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storedMfaToken || !accountType || code.length !== 6) return;

    const mfaConfig = getPortalMfaConfig(accountType);

    setLoadingEnable(true);
    try {
      const response = await mfaConfig.mfaEnable(storedMfaToken, code);
      const accessToken = extractAccessToken(response);
      if (!accessToken) {
        toast.error("Session was not issued. Please sign in again.");
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not enable MFA.";
      toast.error(message);
      if (message.toLowerCase().includes("expired")) {
        clearMfaToken();
        router.replace(PORTAL_AUTH.loginPath);
      }
    } finally {
      setLoadingEnable(false);
    }
  };

  if (!storedMfaToken || !accountType) {
    return null;
  }

  const qrUrl = otpAuthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpAuthUri)}`
    : "";

  return (
    <div>
      <AuthFormHeader
        title="Set up authenticator"
        description="Scan the QR code with your authenticator app, then enter the code to finish"
      />
      <AuthDivider />

      <div className="flex flex-col gap-6 pt-5">
        {loadingSetup ? (
          <p className="text5 text-gray">Preparing your setup code…</p>
        ) : null}

        {setupError ? (
          <p className="text5 text-red">{setupError}</p>
        ) : null}

        {!loadingSetup && !setupError ? (
          <>
            <div className="flex flex-col items-center gap-4 rounded-[20px] border border-darkest/10 bg-white/62 p-5">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="Authenticator QR code"
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
              ) : null}
              {mfaSecret ? (
                <div className="w-full text-center">
                  <p className="text6 text-gray">Manual entry key</p>
                  <p className="mt-1 break-all font-mono text5 text-darkest">
                    {mfaSecret}
                  </p>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleEnable} className="flex flex-col gap-6">
              <OtpInput
                label="Authentication code"
                value={code}
                onChange={setCode}
                disabled={loadingEnable}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loadingEnable}
                loadingText="Enabling…"
                disabled={code.length !== 6}
              >
                Enable &amp; continue
              </Button>
            </form>
          </>
        ) : null}

        <Link
          href={PORTAL_AUTH.loginPath}
          onClick={() => clearMfaToken()}
          className="text-center text5 text-blue-normal hover:text-blue-deep"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
