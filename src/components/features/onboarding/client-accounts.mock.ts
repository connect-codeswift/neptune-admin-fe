import {
  DUMMY_ORGANIZATIONS,
  getDummyOrganization,
  type DummyOrganization,
  type DummyOrganizationSite,
} from "@/lib/dummy-organizations";
import {
  DEFAULT_SUBSCRIPTIONS,
  getSubscriptionForOrganization,
  type Subscription,
} from "@/lib/dummy-subscriptions";

export type ClientSite = DummyOrganizationSite;
export type ClientTrialHistoryItem =
  DummyOrganization["subscription"]["history"][number];
export type ClientAccountDetail = Omit<DummyOrganization, "status">;

function toClientAccountDetail(org: DummyOrganization): ClientAccountDetail {
  const { status: _status, ...detail } = org;
  return detail;
}

export const CLIENT_ACCOUNT_DETAILS: Record<string, ClientAccountDetail> =
  Object.fromEntries(
    DUMMY_ORGANIZATIONS.map((org) => [org.id, toClientAccountDetail(org)]),
  );

export function getClientAccountDetail(id: string): ClientAccountDetail {
  const org = getDummyOrganization(id);
  if (org) return toClientAccountDetail(org);
  return toClientAccountDetail(DUMMY_ORGANIZATIONS[0]!);
}

/** The client's yearly contract, or null when no subscription exists yet. */
export function getClientSubscription(
  organizationId: string,
): Subscription | null {
  return getSubscriptionForOrganization(DEFAULT_SUBSCRIPTIONS, organizationId);
}
