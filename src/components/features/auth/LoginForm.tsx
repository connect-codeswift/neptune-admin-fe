"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearAuthTokens } from "@/lib/auth-tokens";
import { extractAccessToken } from "@/lib/auth-response";
import {
  clearMfaToken,
  PORTAL_AUTH,
  setMfaToken,
} from "@/lib/auth-flow";
import { getOrgDashboardPath } from "@/lib/auth-redirect";
import {
  setPortalAccountType,
} from "@/lib/portal-auth";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      clearMfaToken();
      clearAuthTokens();
      const response = await PORTAL_AUTH.login({ email, password });

      if (response.accountType !== "staff" && response.accountType !== "tenant") {
        toast.error("Unexpected login response. Please try again.");
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
        toast.error("Unexpected login response. Please try again.");
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

      toast.error("Unexpected login response. Please try again.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign in failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthFormHeader
        title="Welcome back."
        description="Sign in to your organization admin portal"
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="pt-5">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <div className="mt-4">
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
          <div className="flex justify-end p-2">
            <Link
              href={PORTAL_AUTH.forgotPasswordPath}
              className="text5 text-blue-normal hover:text-blue-deep"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-4 shadow-lg"
          loading={loading}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
