"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/** Lookup rather than nested ternaries (Sonar S3358). */
const COPY_MESSAGE: Readonly<Record<CopyState, string>> = {
  idle: "",
  copied: "Key copied to your clipboard.",
  failed: "Could not copy automatically — select the key and copy it yourself.",
};

const COPY_ICON: Readonly<Record<CopyState, string>> = {
  idle: "mdi:content-copy",
  copied: "mdi:check",
  failed: "mdi:alert-outline",
};

export type AuthenticatorSetupKeyProps = Readonly<{
  /** The TOTP shared secret returned by the MFA setup endpoint. */
  secret: string;
  label?: string;
  className?: string;
}>;

/**
 * A TOTP shared secret, shown as selectable text with a copy control.
 *
 * The one way this app hands over an authenticator key, in both places it does so: enrolment
 * during sign-in and enrolment from Settings. Deliberately not a QR code — the `otpAuthUri`
 * these endpoints also return embeds the secret in its query string, so rendering it through an
 * image service would post the account's MFA seed to a third party, which is exactly what the
 * backend guide forbids. There is no QR encoder in this repo and no dependency may be added for
 * one, so the documented fallback is what users get: the key, typed into the app by hand.
 *
 * A local QR encoder would be a genuine improvement and would not weaken any of this — the point
 * is that the encoding must happen in the browser, not that a QR code is unsafe.
 */
export function AuthenticatorSetupKey(
  props: Readonly<AuthenticatorSetupKeyProps>,
) {
  const { secret, label = "Setup key", className = "" } = props;

  const labelId = useId();
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") return;

    const timer = window.setTimeout(() => setCopyState("idle"), 5000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`.trim()}>
      <p id={labelId} className="text6 text-ehs-muted-text">
        {label}
      </p>

      {/* `select-all` so one click selects the whole key: it is the fallback path when the
          clipboard API is unavailable, which is common on an insecure origin. */}
      <code
        aria-labelledby={labelId}
        className="border-ehs-border bg-ehs-surface-inverse/4 rounded-2.5 text-ehs-darker block w-full min-w-0 px-3.5 py-3 font-mono text-sm leading-6 tracking-[0.18em] break-all select-all"
      >
        {secret}
      </code>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="text7 text-ehs-normal-blue hover:bg-ehs-normal-blue/10 focus-visible:ring-ehs-normal-blue/40 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-2"
        >
          <Icon
            icon={COPY_ICON[copyState]}
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          Copy key
        </button>

        {/* Shown and announced: whether the clipboard write worked is the whole point. */}
        <span
          role="status"
          aria-live="polite"
          className="text8 text-ehs-muted-text min-w-0"
        >
          {COPY_MESSAGE[copyState]}
        </span>
      </div>
    </div>
  );
}
