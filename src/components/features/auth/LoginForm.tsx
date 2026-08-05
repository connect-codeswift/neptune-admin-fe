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
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

type LoginFormProps = Readonly<{
  flow: AuthFlowKind;
}>;

export function LoginForm({ flow }: LoginFormProps) {
  const router = useRouter();
  const authFlow = getAuthFlow(flow);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      clearMfaToken();
      clearAuthTokens();
      const response = await authFlow.login({ email, password });

      // Tenant login returns a session outright when the account has MFA off,
      // with no mfaToken at all. The SuperAdmin flow never does this: MFA is
      // mandatory there, so it always continues to one of the branches below.
      if (response.accessToken) {
        router.push(authFlow.resolveDashboardPath(response.accessToken));
        return;
      }

      if (!response.mfaToken) {
        toast.error("Unexpected login response. Please try again.");
        return;
      }

      setMfaToken(response.mfaToken);

      if (response.mfaSetupRequired) {
        router.push(authFlow.mfaSetupPath);
        return;
      }

      if (response.mfaRequired) {
        router.push(authFlow.mfaPath);
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
  const description =
    flow === "super"
      ? "Sign in to the Neptune super admin portal"
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
