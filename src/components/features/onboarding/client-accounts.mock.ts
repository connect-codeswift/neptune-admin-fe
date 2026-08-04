import {
  DUMMY_ORGANIZATIONS,
  getDummyOrganization,
  type DummyOrganization,
  type DummyOrganizationModule,
  type DummyOrganizationSite,
} from "@/lib/dummy-organizations";

export type ClientModule = DummyOrganizationModule;
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
