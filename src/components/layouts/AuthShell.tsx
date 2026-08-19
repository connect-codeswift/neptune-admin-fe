import type { ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle";
import AuthLeftSection from "./AuthLeftSection";

export type AuthShellProps = {
  children: ReactNode;
};

/**
 * The split sign-in chrome: permanently-dark brand panel on the left, themed
 * form pane on the right.
 *
 * One component rather than two identical layouts — `(auth)` and
 * `super/(auth)` were byte-for-byte duplicates, so any restyle had to be made
 * twice and the two drifted apart the moment one was missed.
 */
export function AuthShell({ children }: Readonly<AuthShellProps>) {
  return (
    <div className="flex min-h-screen w-full">
      <AuthLeftSection />

      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-ehs-light-bg px-6 py-12 lg:w-1/2">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-10 size-90 rounded-full bg-ehs-normal-blue/10 opacity-60 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-20 size-80 rounded-full bg-ehs-blue/10 opacity-60 blur-[100px]"
        />

        {/* Signing in is the one screen reached before any of the app's own
            chrome exists, so it carries its own theme control. Without it a
            dark-theme user's only way back to light is to sign in first. */}
        <ThemeToggle className="absolute top-6 right-6 z-20" />

        <div className="relative z-10 w-full max-w-105">{children}</div>
      </div>
    </div>
  );
}
