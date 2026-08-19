"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The chrome every sign-in screen is built from.
 *
 * These are the only screens an unauthenticated person can reach, so the pieces here exist to
 * make each one say the same three things in the same place: where you are, what to do, and
 * what went wrong. Individual forms supply the words; none of them re-invent the shape.
 */

/** Focus ring for the plain links and buttons on this surface, which own no variant class. */
export const authFocusRingClass =
  "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ehs-light-bg";

export type AuthFormHeaderProps = {
  title: string;
  description: string;
  /**
   * "Step 2 of 2" on the screens that are part of the sign-in chain. Omitted on the screens
   * that are not — a step count on a one-screen task is noise, and a wrong one is worse.
   */
  step?: string;
};

export function AuthFormHeader({
  title,
  description,
  step,
}: Readonly<AuthFormHeaderProps>) {
  return (
    <div>
      {step ? (
        <p className="border-ehs-normal-blue/25 bg-ehs-normal-blue-bg-light text-ehs-normal-blue text6 mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
          <Icon
            icon="mdi:shield-check-outline"
            className="size-3.5 shrink-0"
            aria-hidden="true"
          />
          {step}
        </p>
      ) : null}

      <h1 className="text1 text-ehs-darker text-balance tracking-[-2px]">
        {title}
      </h1>
      <p className="text3 text-ehs-muted-text text-pretty pt-2">{description}</p>
    </div>
  );
}

export type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({
  label = "or sign in with email",
}: Readonly<AuthDividerProps>) {
  return (
    <div className="flex items-center gap-3 pt-5">
      <div className="bg-ehs-border-ink/10 h-px min-w-0 flex-1" />
      <span className="text8 text-ehs-muted-text shrink-0 whitespace-nowrap">
        {label}
      </span>
      <div className="bg-ehs-border-ink/10 h-px min-w-0 flex-1" />
    </div>
  );
}

export type AuthFormErrorProps = {
  /** Referenced by the submit button's `aria-describedby`. */
  id: string;
  message: string | null;
};

/**
 * The one place a failure is stated on these screens.
 *
 * A toast is not enough on its own here: it is gone in four seconds, it lands in a corner the
 * eye is not on after a submit, and on a failed sign-in the thing the user needs is a message
 * that stays put next to the button they just pressed.
 */
export function AuthFormError({ id, message }: Readonly<AuthFormErrorProps>) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className="border-ehs-red/35 bg-ehs-red/8 rounded-2.5 flex items-start gap-2.5 border p-3"
    >
      <Icon
        icon="mdi:alert-circle-outline"
        className="text-ehs-red mt-px size-4.5 shrink-0"
        aria-hidden="true"
      />
      <p className="text4 text-ehs-red min-w-0">{message}</p>
    </div>
  );
}

export type AuthStatusProps = {
  children: ReactNode;
  /** Renders the message but keeps it for screen readers only. */
  visuallyHidden?: boolean;
};

/**
 * Progress a sighted user reads from a spinner and nobody else reads at all — "preparing your
 * setup code", "checking your sign-in". `role="status"` is implicitly polite, so it never
 * interrupts; `aria-live` is repeated explicitly because some combinations still need it.
 */
export function AuthStatus({
  children,
  visuallyHidden = false,
}: Readonly<AuthStatusProps>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        visuallyHidden
          ? "sr-only"
          : "text-ehs-muted-text text4 flex items-center gap-2"
      }
    >
      {visuallyHidden ? null : (
        <Icon
          icon="mdi:loading"
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export type AuthBackLinkProps = {
  href: string;
  children: string;
  onClick?: () => void;
};

/** The way out of every step. Same words, same place, same arrow, on all six screens. */
export function AuthBackLink({
  href,
  children,
  onClick,
}: Readonly<AuthBackLinkProps>) {
  return (
    <div className="flex justify-center">
      <Link
        href={href}
        onClick={onClick}
        className={`text5 text-ehs-normal-blue hover:text-ehs-dark-blue inline-flex items-center gap-1.5 px-2 py-1.5 transition-colors ${authFocusRingClass}`}
      >
        <Icon
          icon="mdi:arrow-left"
          className="size-4 shrink-0"
          aria-hidden="true"
        />
        {children}
      </Link>
    </div>
  );
}

export type AuthNextStepNoteProps = {
  children: ReactNode;
};

/** "What happens after I press this" — the sentence that stops a mid-chain support ticket. */
export function AuthNextStepNote({
  children,
}: Readonly<AuthNextStepNoteProps>) {
  return (
    <p className="text8 text-ehs-muted-text text-center text-pretty">
      {children}
    </p>
  );
}
