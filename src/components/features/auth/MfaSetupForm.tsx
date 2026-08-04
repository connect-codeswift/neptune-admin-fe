"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { OtpInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearMfaToken, getMfaToken } from "@/lib/auth-tokens";
import { mfaEnable, mfaSetup } from "@/services/auth.service";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

export function MfaSetupForm() {
  const router = useRouter();
  const setupStarted = useRef(false);
  const [storedMfaToken] = useState(() => getMfaToken());
  const [mfaSecret, setMfaSecret] = useState("");
  const [otpAuthUri, setOtpAuthUri] = useState("");
  const [code, setCode] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingEnable, setLoadingEnable] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!storedMfaToken) {
      router.replace("/login");
      return;
    }

    if (setupStarted.current) return;
    setupStarted.current = true;

    mfaSetup({ mfaToken: storedMfaToken })
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
  }, [router, storedMfaToken]);

  const handleEnable = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storedMfaToken || code.length !== 6) return;

    setLoadingEnable(true);
    try {
      await mfaEnable({ mfaToken: storedMfaToken, code });
      clearMfaToken();
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not enable MFA.";
      toast.error(message);
      if (message.toLowerCase().includes("expired")) {
        clearMfaToken();
        router.replace("/login");
      }
    } finally {
      setLoadingEnable(false);
    }
  };

  if (!storedMfaToken) {
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
          href="/login"
          onClick={() => clearMfaToken()}
          className="text-center text5 text-blue-normal hover:text-blue-deep"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
