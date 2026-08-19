"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";
import {
  evaluatePasswordRules,
  PASSWORD_RULES,
} from "@/components/settings/settings-validation";

export type PasswordRequirementsProps = Readonly<{
  /** The password as typed so far. */
  value: string;
  /** Point the password field's `aria-describedby` at this. */
  id?: string;
  className?: string;
}>;

/**
 * The password rule, stated before the user submits rather than after.
 *
 * Every screen in this app that sets a new password shows this: the two auth screens
 * (reset-password and the super-admin bootstrap) and both Settings security areas. Saying "at
 * least 8 characters, a letter, a number and a symbol" only in the 400 that comes back is the
 * shape of the problem it exists to remove — and a checklist that fills in as you type is the
 * cheapest possible way to say it, because it also confirms when you are done.
 *
 * Accessibility note: the list is *not* itself a live region. Re-announcing four items on every
 * keystroke is unusable. Instead the whole list is read once when the field takes focus (via
 * `aria-describedby`), each item carries its own state in text, and a single polite counter
 * below reports progress.
 */
export function PasswordRequirements(
  props: Readonly<PasswordRequirementsProps>,
) {
  const { value, id, className = "" } = props;

  const generatedId = useId();
  const listId = id ?? generatedId;
  const results = evaluatePasswordRules(value);
  const metCount = results.filter((result) => result.isMet).length;

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`.trim()}>
      <div id={listId}>
        <p className="text8 text-ehs-muted-text">Your new password needs:</p>

        <ul className="mt-1.5 flex flex-col gap-1">
          {results.map(({ rule, isMet }) => (
            <li key={rule.id} className="flex min-w-0 items-start gap-2">
              <Icon
                icon={isMet ? "mdi:check-circle" : "mdi:circle-outline"}
                className={`mt-px size-4 shrink-0 ${
                  isMet ? "text-ehs-green" : "text-ehs-muted-text"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text8 min-w-0 ${
                  isMet ? "text-ehs-gray" : "text-ehs-muted-text"
                }`}
              >
                {rule.label}
                <span className="sr-only">
                  {isMet ? " — done" : " — not yet"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {`${String(metCount)} of ${String(PASSWORD_RULES.length)} password requirements met.`}
      </p>
    </div>
  );
}
