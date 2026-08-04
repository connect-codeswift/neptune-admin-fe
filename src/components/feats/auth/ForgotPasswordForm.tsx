"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { AuthFormHeader } from "./AuthFormChrome";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.message("Password reset is not wired yet.");
  };

  return (
    <div>
      <AuthFormHeader
        title="Forgot password?"
        description="Enter your email to receive a reset link"
      />

      <form onSubmit={handleSubmit} className="pt-8">
        <EmailInput
          label="Email address"
          placeholder="sarah@nordvik.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-6 shadow-[0_4px_16px_rgba(8,145,166,0.28)]"
        >
          Send reset link
        </Button>

        <div className="mt-4 flex justify-center">
          <Link
            href="/login"
            className="text-[13px] text-blue-normal hover:text-blue-deep"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
