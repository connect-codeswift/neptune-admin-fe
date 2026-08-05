"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { OtpInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import {
  clearMfaToken,
  getAuthFlow,
  getMfaToken,
  type AuthFlowKind,
} from "@/lib/auth-flow";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

type MfaVerifyFormProps = Readonly<{
  flow: AuthFlowKind;
}>;

export function MfaVerifyForm({ flow }: MfaVerifyFormProps) {
  const router = useRouter();
  const authFlow = getAuthFlow(flow);
  const [storedMfaToken] = useState(() => getMfaToken());
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storedMfaToken) {
      router.replace(authFlow.loginPath);
    }
  }, [authFlow.loginPath, router, storedMfaToken]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storedMfaToken || code.length !== 6) return;

    setLoading(true);
    try {
      const response = await authFlow.verifyMfa({
        mfaToken: storedMfaToken,
        code,
      });
      clearMfaToken();
      router.replace(authFlow.resolveDashboardPath(response.accessToken));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed.";
      toast.error(message);
      if (message.toLowerCase().includes("expired")) {
        clearMfaToken();
        router.replace(authFlow.loginPath);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!storedMfaToken) {
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
          label="Authentication code"
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
          href={authFlow.loginPath}
          onClick={() => clearMfaToken()}
          className="text-center text5 text-blue-normal hover:text-blue-deep"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
