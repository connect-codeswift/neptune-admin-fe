"use client";

import { useSyncExternalStore } from "react";

/** Nothing ever changes after hydration, so the store never notifies. */
function subscribe(): () => void {
  return () => {};
}

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during SSR and the first client render, true from then on.
 *
 * Several values here (the MFA token, the auth email, the tenant context) live
 * in browser storage, which does not exist on the server — reading them in
 * render made the server and client markup disagree and React threw a
 * hydration mismatch. The old fix was to read them in an effect and
 * `setState`, which works but is exactly what `react-hooks/set-state-in-effect`
 * flags, because it costs a second render pass.
 *
 * `useSyncExternalStore` is React's own answer to this: it hands the server a
 * different snapshot than the client, so the value can be derived during render
 * with no effect and no cascading render.
 *
 * ```tsx
 * const isHydrated = useHydrated();
 * const email = isHydrated ? getAuthEmail() : null;
 * ```
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
