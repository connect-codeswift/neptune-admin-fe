"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, OtpInput, PasswordInput } from "@/components/inputs";
import { Button, TextButton } from "@/components/ui";
import { PORTAL_AUTH } from "@/lib/auth-flow";
import { assertApiSuccess } from "@/lib/api-response";
import {
  superAdminForgotPassword,
  superAdminResetPassword,
} from "@/services/super-admin-auth.service";
import { AuthFormHeader } from "./AuthFormChrome";

const RESET_FAILURE_MESSAGE = "Invalid or expired verification code.";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await superAdminResetPassword({
        email: email.trim(),
        otp,
        newPassword: password,
      });
      assertApiSuccess(response, RESET_FAILURE_MESSAGE);
      toast.success("Password updated. Sign in with your new password.");
      router.replace(PORTAL_AUTH.loginPath);
    } catch {
      toast.error(RESET_FAILURE_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }

    setResending(true);
    try {
      const response = await superAdminForgotPassword({ email: email.trim() });
      assertApiSuccess(response, "Failed to resend verification code.");
      toast.success("If an account exists, a new code has been sent.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend verification code.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <AuthFormHeader
        title="Reset password"
        description="Enter the 6-digit code from your email and choose a new password"
      />

      <form onSubmit={handleSubmit} className="pt-8">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          disabled={loading || Boolean(initialEmail)}
        />

        <div className="mt-4">
          <OtpInput
            label="Verification code"
            value={otp}
            onChange={setOtp}
            disabled={loading}
            autoFocus={Boolean(initialEmail)}
          />
        </div>

        <div className="mt-4">
          <PasswordInput
            label="New password"
            placeholder="Enter your new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div className="mt-4">
          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <TextButton
            type="button"
            size="sm"
            underline="always"
            onClick={() => void handleResend()}
            disabled={loading || resending}
          >
            {resending ? "Resending…" : "Resend code"}
          </TextButton>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-6 shadow-lg"
          loading={loading}
          loadingText="Updating…"
          disabled={otp.length !== 6}
        >
          Update password
        </Button>

        <div className="mt-4 flex justify-center">
          <Link
            href={PORTAL_AUTH.loginPath}
            className="text5 text-blue-normal hover:text-blue-deep"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
