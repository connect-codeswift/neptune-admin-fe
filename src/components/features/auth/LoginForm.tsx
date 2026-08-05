"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearAuthTokens } from "@/lib/auth-tokens";
import {
  clearMfaToken,
  getAuthFlow,
  setMfaToken,
  type AuthFlowKind,
} from "@/lib/auth-flow";
import { portalLogin } from "@/services/portal-auth.service";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

/**
 * "portal" is the single sign-in for this app: it does not know or care which kind of
 * account is signing in, and lets the backend resolve it. "org" and "super" remain for
 * the legacy per-audience screens.
 */
type LoginFormMode = AuthFlowKind | "portal";

type LoginFormProps = Readonly<{
  flow: LoginFormMode;
}>;

export function LoginForm({ flow }: LoginFormProps) {
  const router = useRouter();
  // In portal mode the real flow is not known until the response says which kind of
  // account it was, so this is only a starting point for the legacy modes.
  const authFlow = getAuthFlow(flow === "portal" ? "org" : flow);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      clearMfaToken();
      clearAuthTokens();
      const response =
        flow === "portal"
          ? await portalLogin({ email, password })
          : await authFlow.login({ email, password });

      // The backend tells us which kind of account this was; everything downstream
      // (verify-mfa, mfa/setup, select-company) is the existing per-audience flow,
      // reached through its existing routes.
      const resolvedFlow =
        flow === "portal"
          ? getAuthFlow(response.accountType === "staff" ? "super" : "org")
          : authFlow;

      // Tenant login returns a session outright when the account has MFA off,
      // with no mfaToken at all. The SuperAdmin flow never does this: MFA is
      // mandatory there, so it always continues to one of the branches below.
      if (response.accessToken) {
        router.push(resolvedFlow.resolveDashboardPath(response.accessToken));
        return;
      }

      if (!response.mfaToken) {
        toast.error("Unexpected login response. Please try again.");
        return;
      }

      setMfaToken(response.mfaToken);

      if (response.mfaSetupRequired) {
        router.push(resolvedFlow.mfaSetupPath);
        return;
      }

      if (response.mfaRequired) {
        router.push(resolvedFlow.mfaPath);
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

  const title =
    flow === "super" ? "Super admin sign in" : "Welcome back.";
  // Portal mode serves both audiences, so the copy must not claim to be either one.
  const description =
    flow === "super"
      ? "Sign in to the Neptune super admin portal"
      : flow === "portal"
        ? "Sign in to the Neptune admin portal"
        : "Sign in to your organization admin portal";

  return (
    <div>
      <AuthFormHeader title={title} description={description} />
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
              href={authFlow.forgotPasswordPath}
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
