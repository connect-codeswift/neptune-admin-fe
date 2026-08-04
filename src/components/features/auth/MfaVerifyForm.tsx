"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { OtpInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearMfaToken, getMfaToken } from "@/lib/auth-tokens";
import { verifyMfa } from "@/services/auth.service";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

export function MfaVerifyForm() {
  const router = useRouter();
  const [storedMfaToken] = useState(() => getMfaToken());
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storedMfaToken) {
      router.replace("/login");
    }
  }, [router, storedMfaToken]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storedMfaToken || code.length !== 6) return;

    setLoading(true);
    try {
      await verifyMfa({ mfaToken: storedMfaToken, code });
      clearMfaToken();
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed.";
      toast.error(message);
      if (message.toLowerCase().includes("expired")) {
        clearMfaToken();
        router.replace("/login");
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
          href="/login"
          onClick={() => clearMfaToken()}
          className="text-center text5 text-blue-normal hover:text-blue-deep"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
