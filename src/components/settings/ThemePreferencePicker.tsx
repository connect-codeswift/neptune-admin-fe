"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

type ThemeOption = Readonly<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: string;
  /** Miniature of the theme, drawn with the same tokens the real UI uses. */
  swatch: Readonly<{ page: string; card: string; ink: string; line: string }>;
}>;

/**
 * The two concrete themes are previewed with literal colours rather than tokens on purpose:
 * this is the one place in the app that must show *both* palettes at once, so a swatch that
 * followed the active theme would make the choice invisible. The values match `:root` and
 * `[data-theme="dark"]` in globals.css — keep them in step.
 */
const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Always the light palette.",
    icon: "mdi:white-balance-sunny",
    swatch: {
      page: "#f3f5f8",
      card: "#ffffff",
      ink: "#03333a",
      line: "#e5e7eb",
    },
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always the dark palette.",
    icon: "mdi:weather-night",
    swatch: {
      page: "#0b1320",
      card: "#111c2b",
      ink: "#e6f1f4",
      line: "#1a2532",
    },
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device setting.",
    icon: "mdi:monitor",
    swatch: {
      page: "#0b1320",
      card: "#ffffff",
      ink: "#03333a",
      line: "#1a2532",
    },
  },
];

function ThemeSwatch(props: Readonly<{ option: ThemeOption }>) {
  const { option } = props;
  const { swatch, value } = option;

  return (
    <span
      aria-hidden="true"
      className="relative block h-20 w-full overflow-hidden rounded-lg"
      style={{
        backgroundColor: swatch.page,
        border: `1px solid ${swatch.line}`,
      }}
    >
      {/* "System" is drawn split down the middle — the only honest way to show a choice whose
          appearance depends on something outside the app. */}
      {value === "system" ? (
        <span
          className="absolute inset-y-0 right-0 left-1/2 block"
          style={{ backgroundColor: "#0b1320" }}
        />
      ) : null}

      <span
        className="absolute top-3 left-3 block h-14 w-[62%] rounded-md"
        style={{
          backgroundColor: swatch.card,
          border: `1px solid ${swatch.line}`,
        }}
      >
        <span
          className="absolute top-2.5 left-2.5 block h-1.5 w-10 rounded-full"
          style={{ backgroundColor: swatch.ink, opacity: 0.85 }}
        />
        <span
          className="absolute top-6 left-2.5 block h-1 w-14 rounded-full"
          style={{ backgroundColor: swatch.ink, opacity: 0.35 }}
        />
        <span
          className="absolute top-9 left-2.5 block h-1 w-8 rounded-full"
          style={{ backgroundColor: "#0891a6", opacity: 0.75 }}
        />
      </span>
    </span>
  );
}

/**
 * Light / Dark / System, as a radio group.
 *
 * A radio group rather than a switch because there are three states, and the third — "system" —
 * is not a position between the other two but a different kind of answer: defer to the device.
 */
export function ThemePreferencePicker() {
  const { preference, resolvedTheme, setPreference, isReady } = useTheme();

  return (
    <fieldset className="mt-1 min-w-0">
      <legend className="sr-only">Theme</legend>

      {/* The theme applies on selection with no Save button, so the change is confirmed the only
          way it can be for a user who cannot see it happen. */}
      <p role="status" aria-live="polite" className="sr-only">
        {isReady ? `Theme set to ${preference}. Currently showing ${resolvedTheme}.` : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          // Before the stored preference is read, nothing is shown as selected rather than
          // the default being shown as selected — a control that says "Light" for a moment on
          // a dark page is worse than one that says nothing.
          const isSelected = isReady && preference === option.value;

          return (
            <label
              key={option.value}
              className={[
                // The focus ring is on the label rather than the radio: the whole tile is the
                // click target, so the whole tile has to be what lights up when the radio group
                // is reached with the keyboard.
                "rounded-2.5 flex cursor-pointer flex-col gap-3 border p-3 transition-colors",
                "has-[:focus-visible]:ring-ehs-normal-blue/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ehs-light-bg",
                isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light"
                  : "border-ehs-border bg-ehs-surface/60 hover:border-ehs-border-strong",
              ].join(" ")}
            >
              <ThemeSwatch option={option} />

              <span className="flex items-start gap-2">
                <input
                  type="radio"
                  name="theme-preference"
                  value={option.value}
                  checked={isSelected}
                  aria-describedby={`theme-option-${option.value}-description`}
                  onChange={() => setPreference(option.value)}
                  className="accent-ehs-normal-blue mt-0.5 size-4 shrink-0 cursor-pointer"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      icon={option.icon}
                      className="text-ehs-normal-blue size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <Text as="span" className="text4 text-ehs-darker">
                      {option.label}
                    </Text>
                  </span>
                  <Text
                    as="span"
                    id={`theme-option-${option.value}-description`}
                    className="text8 text-ehs-muted-text"
                  >
                    {option.description}
                  </Text>
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {isReady && preference === "system" ? (
        <Text as="p" className="text8 text-ehs-muted-text mt-3">
          {`Your device is currently set to ${resolvedTheme}. Neptune will follow it if that changes.`}
        </Text>
      ) : null}
    </fieldset>
  );
}
