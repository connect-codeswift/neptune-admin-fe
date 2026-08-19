"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setThemePreference,
  subscribeToTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

export type ThemeContextValue = Readonly<{
  /** What the user chose — "system" included. */
  preference: ThemePreference;
  /** What is actually painted right now. Never "system". */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /**
   * False during SSR and the first client render, true once the stored preference has been
   * read. Controls that show the current choice must wait for it, or they render the default
   * on the server and the real value on the client — a hydration mismatch.
   */
  isReady: boolean;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = Readonly<{ children: ReactNode }>;

/**
 * Owns the theme preference and keeps `<html data-theme>` in step with it.
 *
 * The attribute itself is written before this mounts, by the inline script in the root layout —
 * this provider adopts that value rather than racing it. What it adds is the React-visible
 * state, persistence, and the live OS listener that "system" needs.
 *
 * The preference is read through `useSyncExternalStore` rather than held in `useState` and
 * seeded from an effect. It lives in `localStorage`, which does not exist on the server, so
 * reading it during render would hydrate mismatched — and assigning it from an effect is the
 * cascading-render pattern this codebase treats as a real defect. An external store is the
 * arrangement React provides for exactly this: server snapshot is the default, client snapshot
 * is the truth, no state assignment in an effect at all.
 */
export function ThemeProvider(props: Readonly<ThemeProviderProps>) {
  const { children } = props;

  const { preference, resolvedTheme, isReady } = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  return (
    <ThemeContext.Provider
      value={{
        preference,
        resolvedTheme,
        // Writes straight to the DOM and then wakes the store, rather than going through a
        // render first — the attribute drives every colour on the page, and waiting a pass
        // shows one frame of the old theme behind the new toggle position.
        setPreference: setThemePreference,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }

  return context;
}
