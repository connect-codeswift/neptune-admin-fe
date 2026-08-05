"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { getAuthFlow, type AuthFlowKind } from "@/lib/auth-flow";
import { assertApiSuccess } from "@/lib/api-response";
import { superAdminForgotPassword } from "@/services/super-admin-auth.service";
import { AuthFormHeader } from "./AuthFormChrome";

type ForgotPasswordFormProps = Readonly<{
  flow: AuthFlowKind;
}>;

export function ForgotPasswordForm({ flow }: ForgotPasswordFormProps) {
  const router = useRouter();
  const authFlow = getAuthFlow(flow);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (flow !== "super") {
      toast.message("Password reset is not wired yet.");
      return;
    }

    setLoading(true);
    try {
      const response = await superAdminForgotPassword({ email: email.trim() });
      assertApiSuccess(response, "Failed to send verification code.");
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const params = new URLSearchParams({ email: email.trim() });
    router.push(`${authFlow.resetPasswordPath}?${params.toString()}`);
  };

  if (submitted) {
    return (
      <div>
        <AuthFormHeader
          title="Check your email"
          description="If an account exists for that address, a 6-digit verification code has been sent. It expires in 15 minutes."
        />

        <div className="flex flex-col gap-4 pt-8">
          <Button
            type="button"
            fullWidth
            size="lg"
            rightIcon="lucide:arrow-right"
            className="shadow-lg"
            onClick={handleContinue}
          >
            Enter verification code
          </Button>

          <div className="flex justify-center">
            <Link
              href={authFlow.loginPath}
              className="text5 text-blue-normal hover:text-blue-deep"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthFormHeader
        title="Forgot password?"
        description="Enter your email and we'll send a 6-digit verification code"
      />

      <form onSubmit={handleSubmit} className="pt-8">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-6 shadow-lg"
          loading={loading}
          loadingText="Sending…"
        >
          Send verification code
        </Button>

        <div className="mt-4 flex justify-center">
          <Link
            href={authFlow.loginPath}
            className="text5 text-blue-normal hover:text-blue-deep"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
