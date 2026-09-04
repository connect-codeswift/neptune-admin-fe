/**
 * Shared derivations for the company tables on the super-admin dashboard and
 * the Client Accounts screen.
 *
 * They were duplicated — or rather, they were not: the dashboard derived a
 * company's status from `userCount > 0` while Client Accounts used the access
 * window, so the same company could read Active on one screen and Inactive on
 * the other. Both now import from here.
 */

/** "Mar 4, 2026", or an em dash when the value is not a date. */
export function formatCompanyDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * A company is active when it has no access window at all (permanent access) or
 * its window has not yet lapsed. `daysRemaining` is computed server-side; the
 * date comparison is a fallback for rows where only the expiry is present.
 *
 * Headcount is deliberately not part of this: a company whose trial lapsed
 * yesterday is inactive even with users, and a paying company that has not
 * onboarded anyone yet is active.
 */
export function isAccessCurrent(company: {
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
}): boolean {
  if (company.daysRemaining != null) return company.daysRemaining >= 0;
  if (!company.accessExpiresAt) return true;

  const expires = new Date(company.accessExpiresAt).getTime();
  if (Number.isNaN(expires)) return true;
  return expires > Date.now();
}
