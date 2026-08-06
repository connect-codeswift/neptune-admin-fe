"use client";

import Link from "next/link";
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
import {
  clearMfaToken,
  getMfaToken,
  PORTAL_AUTH,
} from "@/lib/auth-flow";
import {
  getPortalAccountType,
  getPortalMfaConfig,
  type PortalAccountType,
} from "@/lib/portal-auth";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

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
  const [storedMfaToken] = useState(() => getMfaToken());
  const [accountType] = useState(() => getPortalAccountType());
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storedMfaToken || !accountType) {
      router.replace(PORTAL_AUTH.loginPath);
    }
  }, [accountType, router, storedMfaToken]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storedMfaToken || !accountType || code.length !== 6) return;

    const mfaConfig = getPortalMfaConfig(accountType);

    setLoading(true);
    try {
      const response = await mfaConfig.verifyMfa({
        mfaToken: storedMfaToken,
        code,
      });

      const accessToken = extractAccessToken(response);
      if (!accessToken) {
        toast.error("Session was not issued. Please sign in again.");
        return;
      }

      if (!hasPersistedSession(accountType)) {
        persistSession(accountType, accessToken);
      }

      clearMfaToken();
      window.location.assign(mfaConfig.resolveDashboardPath(accessToken));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed.";
      toast.error(message);
      if (message.toLowerCase().includes("expired")) {
        clearMfaToken();
        router.replace(PORTAL_AUTH.loginPath);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!storedMfaToken || !accountType) {
    return null;
  }

  return (
    <div>
      <AuthFormHeader
        title="Two-factor authentication"
        description="Enter the 6-digit code from your authenticator app"
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-5">
        <OtpInput
          value={code}
          onChange={setCode}
          autoFocus
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          loadingText="Verifying…"
          disabled={code.length !== 6}
        >
          Verify
        </Button>

        <Link
          href={PORTAL_AUTH.loginPath}
          onClick={() => clearMfaToken()}
          className="text-center text5 text-blue-normal hover:text-blue-deep"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
