"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { clearMfaToken, setMfaToken } from "@/lib/auth-tokens";
import { login } from "@/services/auth.service";
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
      const response = await login({ email, password });

      if (!response.mfaToken) {
        toast.error("Unexpected login response. Please try again.");
        return;
      }

      setMfaToken(response.mfaToken);

      if (response.mfaSetupRequired) {
        router.push("/login/mfa-setup");
        return;
      }

      if (response.mfaRequired) {
        router.push("/login/mfa");
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
        description="Sign in to Neptune admin portal"
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
              href="/forgot-password"
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
          className="mt-4 shadow-xl"
          loading={loading}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
