"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";

/**
 * The small shared bits every Settings card is built from. Kept together so the two areas
 * cannot drift apart on type scale, spacing or the shape of an inline error.
 */

/** Field labels on this surface. The inputs draw their own; this is for everything else. */
export const settingsLabelClass = "text7 text-ehs-darker block";

/** The muted line under a field or row explaining why it is the way it is. */
export function FieldNote(props: Readonly<{ children: string }>) {
  const { children } = props;

  return (
    <Text as="p" className="text8 text-ehs-muted-text mt-1">
      {children}
    </Text>
  );
}

export type SettingsCalloutTone = "info" | "warning";

const CALLOUT_TONE_CLASS: Readonly<Record<SettingsCalloutTone, string>> = {
  info: "border-ehs-normal-blue/30 bg-ehs-normal-blue-bg-light",
  warning: "border-ehs-yellow/40 bg-ehs-yellow/10",
};

const CALLOUT_ICON_CLASS: Readonly<Record<SettingsCalloutTone, string>> = {
  info: "text-ehs-normal-blue",
  warning: "text-ehs-yellow",
};

const CALLOUT_ICON: Readonly<Record<SettingsCalloutTone, string>> = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
};

/**
 * An explanation the user needs in order to understand the screen — most often "why can this
 * not be edited here". Deliberately not a toast: a toast is for something that just happened,
 * and these are permanent facts about the account.
 */
export function SettingsCallout(
  props: Readonly<{ tone?: SettingsCalloutTone; children: ReactNode }>,
) {
  const { tone = "info", children } = props;

  return (
    <div
      className={`rounded-2.5 flex items-start gap-2.5 border p-3 ${CALLOUT_TONE_CLASS[tone]}`}
    >
      <Icon
        icon={CALLOUT_ICON[tone]}
        className={`mt-0.5 size-4.5 shrink-0 ${CALLOUT_ICON_CLASS[tone]}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** A labelled row with a control on the right — the shape both security cards use. */
export function SettingsRow(
  props: Readonly<{
    title: string;
    description: string;
    children?: ReactNode;
  }>,
) {
  const { title, description, children } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="p" className="text4 text-ehs-darker">
          {title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {description}
        </Text>
      </div>
      {children}
    </div>
  );
}

/**
 * A read-only fact about the account.
 *
 * Used instead of a disabled `<input>` wherever the value can never be edited on this screen.
 * A greyed-out text box says "you could type here, but not now"; these values are not that —
 * they are managed elsewhere and no amount of waiting makes the field live.
 */
export function ReadOnlyField(
  props: Readonly<{ label: string; value: string; note?: string }>,
) {
  const { label, value, note } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Text as="span" className={settingsLabelClass}>
        {label}
      </Text>
      <div className="border-ehs-border bg-ehs-surface-inverse/4 rounded-2.5 min-h-11 border px-3.5 py-2.5">
        <Text as="p" className="text4 text-ehs-darker break-words">
          {value || "Not set"}
        </Text>
      </div>
      {note ? <FieldNote>{note}</FieldNote> : null}
    </div>
  );
}

/**
 * A form-level error message.
 *
 * `role="alert"` on the message itself, referenced by `aria-describedby` from the submit
 * button — never `aria-invalid` on the button, which is not a form control and has no validity.
 */
export function FormError(
  props: Readonly<{ id: string; message: string | null }>,
) {
  const { id, message } = props;

  if (!message) return null;

  return (
    <Text as="p" id={id} role="alert" className="text8 text-ehs-red">
      {message}
    </Text>
  );
}

/** A pill saying whether something is on or off. */
export function StatusPill(props: Readonly<{ isOn: boolean; label: string }>) {
  const { isOn, label } = props;

  const toneClass = isOn
    ? "border-ehs-normal-blue/30 bg-ehs-normal-blue-bg-light text-ehs-normal-blue"
    : "border-ehs-border bg-ehs-surface-inverse/4 text-ehs-muted-text";

  return (
    <Text
      as="span"
      className={`text7 inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 ${toneClass}`}
    >
      {label}
    </Text>
  );
}
