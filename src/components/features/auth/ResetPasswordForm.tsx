"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { AuthFormHeader } from "./AuthFormChrome";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.message("Password update is not wired yet.");
  };

  return (
    <div>
      <AuthFormHeader
        title="Reset password"
        description="Choose a new password for your account"
      />

      <form onSubmit={handleSubmit} className="pt-8">
        <PasswordInput
          label="New password"
          placeholder="Enter your new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
        />

        <div className="mt-4">
          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          rightIcon="lucide:arrow-right"
          className="mt-6 shadow-xl"
        >
          Update password
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
