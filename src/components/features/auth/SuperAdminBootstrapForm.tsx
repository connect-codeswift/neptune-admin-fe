"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { assertApiSuccess } from "@/lib/api-response";
import { superAdminBootstrap } from "@/services/super-admin-auth.service";
import { AuthFormHeader } from "./AuthFormChrome";

export function SuperAdminBootstrapForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await superAdminBootstrap({
        email: email.trim(),
        password,
        bootstrapKey: bootstrapKey.trim(),
      });
      assertApiSuccess(response, "Bootstrap failed.");
      toast.success("Super admin password set. You can sign in now.");
      router.replace("/super/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bootstrap failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthFormHeader
        title="Bootstrap super admin"
        description="One-time setup for the seeded super admin account"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-8">
        <EmailInput
          label="Email"
          placeholder="superadmin@codeswift.org"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <TextInput
          label="Bootstrap key"
          placeholder="From server configuration"
          value={bootstrapKey}
          onChange={(event) => setBootstrapKey(event.target.value)}
          required
          disabled={loading}
        />

        <PasswordInput
          label="New password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          loadingText="Setting password…"
          className="mt-2 shadow-lg"
        >
          Set password
        </Button>

        <div className="flex justify-center">
          <Link
            href="/super/login"
            className="text5 text-blue-normal hover:text-blue-deep"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
