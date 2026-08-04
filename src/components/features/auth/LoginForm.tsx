"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { AuthDivider, AuthFormHeader } from "./AuthFormChrome";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.message("Sign in is not wired yet.");
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
        />

        <div className="mt-4">
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
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
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
