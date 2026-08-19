"use client";

import { Icon } from "@iconify/react";
import { useTheme } from "@/providers/ThemeProvider";
import type { ResolvedTheme } from "@/lib/theme";

export type ThemeToggleProps = Readonly<{
  className?: string;
}>;

/**
 * A one-tap light/dark switch for the dashboard header.
 *
 * The full three-way control (Light / Dark / System) lives in Settings →
 * Appearance. This is the shortcut, and it deliberately offers only two states:
 * a toggle has two positions, and "system" is not a position between them but a
 * different kind of answer — defer to the device. Picking it stays in Settings,
 * where there is room to say so.
 *
 * Pressing this when the preference is "system" therefore does not clear the
 * preference, it *commits* to the opposite of whatever the device currently
 * resolves to. That is the only reading of "toggle" that changes what the user
 * is looking at, which is what they asked for by pressing it.
 */

const nextThemeFor: Record<ResolvedTheme, ResolvedTheme> = {
  light: "dark",
  dark: "light",
};

const iconFor: Record<ResolvedTheme, string> = {
  // The icon shows the theme you would MOVE TO, not the one you are in — it is
  // a button, so it advertises its action rather than reporting state. The
  // aria-label says the same thing in words.
  light: "mdi:weather-night",
  dark: "mdi:white-balance-sunny",
};

const labelFor: Record<ResolvedTheme, string> = {
  light: "Switch to dark theme",
  dark: "Switch to light theme",
};

const BUTTON_CLASS =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-ehs-border-ink/8 bg-ehs-surface/55 text-ehs-gray shadow-sm backdrop-blur-1.25 transition-colors hover:border-ehs-border-ink/18 hover:bg-ehs-surface/75 hover:text-ehs-darker focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 focus-visible:outline-none";

export function ThemeToggle(props: Readonly<ThemeToggleProps>) {
  const { className = "" } = props;
  const { resolvedTheme, setPreference, isReady } = useTheme();

  // Until the stored preference has been read, the resolved theme is a guess
  // ("light", the server snapshot). Rendering the real icon now would paint the
  // wrong glyph on a dark page and then swap it — and would differ between the
  // server and client passes. An inert placeholder of the same size holds the
  // layout instead, so nothing shifts when the real control arrives.
  if (!isReady) {
    return (
      <div
        className={[BUTTON_CLASS, "opacity-0", className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPreference(nextThemeFor[resolvedTheme])}
      aria-label={labelFor[resolvedTheme]}
      title={labelFor[resolvedTheme]}
      className={[BUTTON_CLASS, className].filter(Boolean).join(" ")}
    >
      <Icon
        icon={iconFor[resolvedTheme]}
        className="size-5"
        aria-hidden="true"
      />
    </button>
  );
}
